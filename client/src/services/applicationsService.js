import { applications as fixtureApplications } from '../fixtures/applications.js'
import { visaTypeBySlug } from '../fixtures/visaCatalog.js'
import { documentTypeByCode } from '../fixtures/documentTypes.js'
import { declarations as declarationSet } from '../fixtures/formSchemas.js'
import { computeFee } from '../lib/fees.js'
import { ApiError, apiFetch, isMockMode, mockLatency } from './apiClient.js'

/**
 * Applicant-side application service (TRD §5.2, Applications endpoints).
 *
 * Drafts are held in an in-memory store seeded from fixtures, which mirrors the
 * real lifecycle closely enough to exercise the UI: answers persist across
 * route changes and reloads within a session, autosave updates `lastSavedAt`,
 * and submitting locks the application so a later step write is rejected —
 * exactly the constraint FR-APP-02 and BR-01 rely on.
 *
 * Step writes are whole-step (`PATCH /steps/{stepKey}`, schema §6 "Autosave
 * writes only the changed step"), never whole-document.
 */

/** Statuses where further step edits are allowed (PRD §8.1). */
const EDITABLE_STATUSES = new Set(['DRAFT', 'INFO_REQUESTED'])

let store = new Map(
  fixtureApplications.map((application) => [application.id, structuredClone(application)]),
)

let draftCounter = 0

function nextDraftId() {
  draftCounter += 1
  return `app_draft_${draftCounter}`
}

/** `VG-XXXX-XXXX-XXXX` — Crockford Base32 from a CSPRNG (TRD §5.1). */
function generateReference() {
  const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
  const random = new Uint32Array(12)
  crypto.getRandomValues(random)

  const chars = Array.from(random, (value) => alphabet[value % alphabet.length])
  return `VG-${chars.slice(0, 4).join('')}-${chars.slice(4, 8).join('')}-${chars.slice(8, 12).join('')}`
}

/** Documents for a visa type, seeded with an upload state per requirement. */
function defaultDocumentStates(visaType) {
  return visaType.documents.map((requirement) => ({
    id: `doc_${visaType.code}_${requirement.code}`,
    code: requirement.code,
    isRequired: requirement.isRequired,
    state: 'pending',
    fileName: null,
    fileSize: null,
    progress: 0,
    reason: null,
  }))
}

/**
 * FR-DOC-01: the required list is derived from the visa type, so a stored
 * application that predates a catalog change still gets a correct checklist
 * rather than an empty one. Real documents are merged over the derived state.
 */
function withDocumentChecklist(application) {
  if (application.documents?.length) return application

  const visaType = visaTypeBySlug.get(application.visaTypeSlug)
  if (!visaType) return application

  return { ...application, documents: defaultDocumentStates(visaType) }
}

function assertEditable(application) {
  if (!application) {
    throw new ApiError({ status: 404, code: 'APPLICATION_NOT_FOUND', title: 'Application not found' })
  }

  if (!EDITABLE_STATUSES.has(application.status)) {
    throw new ApiError({
      status: 409,
      code: 'APPLICATION_LOCKED',
      title: 'This application can no longer be edited',
    })
  }
}

export async function getMyApplications() {
  if (isMockMode) {
    await mockLatency()
    return [...store.values()]
      .filter((application) => application.applicantUserId === 'usr_demo')
      .map(withDocumentChecklist)
      .sort(
        (a, b) =>
          new Date(b.updatedAt ?? b.submittedAt ?? 0) - new Date(a.updatedAt ?? a.submittedAt ?? 0),
      )
  }

  return apiFetch('/applications')
}

export async function getApplication(applicationId) {
  if (isMockMode) {
    await mockLatency()
    const application = store.get(applicationId)
    if (!application) {
      throw new ApiError({ status: 404, code: 'APPLICATION_NOT_FOUND', title: 'Application not found' })
    }

    /* Persist the derived checklist so later writes have somewhere to land. */
    if (!application.documents?.length) {
      application.documents = withDocumentChecklist(application).documents
    }

    return application
  }

  return apiFetch(`/applications/${applicationId}`)
}

/** Starts a draft for a visa type. FR-APP-13 supports re-applying from a prior one. */
export async function createDraft(visaTypeSlug, { travelerCount = 1 } = {}) {
  if (isMockMode) {
    await mockLatency()

    const visaType = visaTypeBySlug.get(visaTypeSlug)
    if (!visaType) {
      throw new ApiError({ status: 404, code: 'VISA_TYPE_NOT_FOUND', title: 'Visa type not found' })
    }

    const now = new Date().toISOString()
    const id = nextDraftId()

    const application = {
      id,
      reference: null,
      applicantUserId: 'usr_demo',
      visaTypeSlug,
      status: 'DRAFT',
      travelerCount,
      travelers: [],
      steps: {},
      documents: defaultDocumentStates(visaType),
      completedStepKeys: [],
      statusHistory: [{ status: 'DRAFT', at: now }],
      createdAt: now,
      updatedAt: now,
      lastSavedAt: null,
      nextStep: {
        en: 'Start with the applicant details.',
        ar: 'ابدأ ببيانات مقدم الطلب.',
      },
    }

    store.set(id, application)
    return application
  }

  return apiFetch('/applications', { method: 'POST', body: { visaTypeSlug, travelerCount } })
}

/**
 * FR-APP-02: autosave at step completion and on an interval. Returns the saved
 * timestamp so the UI can show "Saved just now" via an aria-live region.
 */
export async function saveStep(applicationId, stepKey, answers) {
  if (isMockMode) {
    await mockLatency()
    const application = store.get(applicationId)
    assertEditable(application)

    const now = new Date().toISOString()
    const visaType = visaTypeBySlug.get(application.visaTypeSlug)

    application.steps = { ...application.steps, [stepKey]: answers }

    if (!application.completedStepKeys.includes(stepKey)) {
      application.completedStepKeys.push(stepKey)
    }

    /* BR-05: one active application per traveler per visa type with
       overlapping dates. Surfaced as a conflict the applicant can act on,
       never silently merged. */
    if (stepKey === 'travel' && answers?.arrivalDate && answers?.departureDate) {
      const clash = [...store.values()].find(
        (candidate) =>
          candidate.id !== applicationId &&
          candidate.visaTypeSlug === application.visaTypeSlug &&
          candidate.travel?.arrivalDate &&
          candidate.travel.arrivalDate <= answers.departureDate &&
          candidate.travel.departureDate >= answers.arrivalDate,
      )

      if (clash) {
        throw new ApiError({
          status: 409,
          code: 'DUPLICATE_APPLICATION',
          title: 'You already have an application for these dates',
          errors: [{ field: 'arrivalDate', code: 'DUPLICATE_APPLICATION', message: clash.reference }],
        })
      }

      application.travel = {
        purpose: answers.purpose,
        arrivalDate: answers.arrivalDate,
        departureDate: answers.departureDate,
        entryPoint: answers.entryPoint,
      }
    }

    /* BR-04: passport must be valid N months beyond the end of the stay. */
    if (stepKey === 'passport' && answers?.passportExpiryDate && application.travel?.departureDate) {
      const expiry = new Date(answers.passportExpiryDate)
      const stayEnd = new Date(application.travel.departureDate)
      const monthsRequired = visaType?.minPassportValidityMonths ?? 6

      const threshold = new Date(stayEnd)
      threshold.setUTCMonth(threshold.getUTCMonth() + monthsRequired)

      if (expiry < threshold) {
        throw new ApiError({
          status: 422,
          code: 'PASSPORT_EXPIRES_TOO_SOON',
          title: 'Your passport expires before your trip ends',
          errors: [
            {
              field: 'passportExpiryDate',
              code: 'PASSPORT_EXPIRES_TOO_SOON',
              message: `Use a passport valid until at least ${threshold.toISOString().slice(0, 10)}.`,
            },
          ],
        })
      }

      application.passport = {
        passportNo: answers.passportNo,
        issueDate: answers.issueDate,
        expiryDate: answers.passportExpiryDate,
        issuingCountry: answers.issuingCountry,
      }
    }

    application.lastSavedAt = now
    application.updatedAt = now

    return { savedAt: now, application }
  }

  return apiFetch(`/applications/${applicationId}/steps/${stepKey}`, {
    method: 'PATCH',
    body: answers,
  })
}

/** FR-DOC-05: per-document upload state. FR-DOC-03: server verification state. */
export async function updateDocument(applicationId, documentId, patch) {
  if (isMockMode) {
    await mockLatency()
    const application = store.get(applicationId)
    assertEditable(application)

    const document = application.documents.find((entry) => entry.id === documentId)
    if (!document) {
      throw new ApiError({ status: 404, code: 'DOCUMENT_NOT_FOUND', title: 'Document not found' })
    }

    Object.assign(document, patch)
    application.updatedAt = new Date().toISOString()

    return document
  }

  return apiFetch(`/applications/${applicationId}/documents/${documentId}`, {
    method: 'PATCH',
    body: patch,
  })
}

export function getDocumentType(code) {
  return documentTypeByCode.get(code) ?? null
}

/**
 * FR-APP-08/09: validate everything, lock the application and create the
 * payment. Declarations carry a version so a later consent change is provable.
 */
export async function submitApplication(applicationId, { declarations, consentVersion }) {
  if (isMockMode) {
    await mockLatency()
    const application = store.get(applicationId)
    assertEditable(application)

    const visaType = visaTypeBySlug.get(application.visaTypeSlug)
    const required = application.documents.filter((document) => document.isRequired)
    const missingDocuments = required.filter((document) => document.state !== 'accepted')

    if (missingDocuments.length > 0) {
      throw new ApiError({
        status: 422,
        code: 'DOCUMENTS_INCOMPLETE',
        title: 'Some required documents are not accepted yet',
        errors: missingDocuments.map((document) => ({
          field: `documents.${document.code}`,
          code: 'DOCUMENT_INCOMPLETE',
          message: document.code,
        })),
      })
    }

    if (declarations) {
      /* Validate against the full required set, not just whatever the client
         happened to send — a payload with two `true` values must not pass as
         "all declarations confirmed". */
      const requiredKeys = declarationSet
        .filter((declaration) => declaration.required)
        .map((declaration) => declaration.key)

      const unconfirmed = requiredKeys.filter((key) => declarations[key] !== true)

      if (unconfirmed.length > 0) {
        throw new ApiError({
          status: 422,
          code: 'DECLARATIONS_INCOMPLETE',
          title: 'Confirm each declaration before submitting',
          errors: unconfirmed.map((key) => ({
            field: `declarations.${key}`,
            code: 'DECLARATION_REQUIRED',
            message: key,
          })),
        })
      }
    }

    const now = new Date().toISOString()
    application.reference = generateReference()
    application.status = 'PENDING_PAYMENT'
    application.submittedAt = now
    application.updatedAt = now
    application.declarationVersion = consentVersion
    application.feeQuote = computeFee(visaType.feeSchedule, {
      travelerCount: application.travelerCount ?? 1,
    })
    application.statusHistory.push({ status: 'PENDING_PAYMENT', at: now })
    application.nextStep = {
      en: 'Pay the fees to finish your application.',
      ar: 'ادفع الرسوم لإتمام طلبك.',
    }

    return application
  }

  return apiFetch(`/applications/${applicationId}/submit`, {
    method: 'POST',
    body: { declarations, consentVersion },
  })
}

/** FR-PAY-02: PSP-hosted fields — no card data reaches our server. */
export async function createPayment(applicationId) {
  if (isMockMode) {
    await mockLatency()
    const application = store.get(applicationId)

    return {
      paymentId: `pay_${applicationId}`,
      amountMinor: application.feeQuote?.totalMinor ?? 0,
      currency: application.feeQuote?.currency ?? 'SAR',
      /* A real integration returns a hosted-page URL from the PSP. */
      hostedUrl: null,
    }
  }

  return apiFetch(`/applications/${applicationId}/payments`, { method: 'POST' })
}

/** FR-PAY-03: webhook-driven; here the hosted page confirms. */
export async function confirmPayment(applicationId) {
  if (isMockMode) {
    await mockLatency()
    const application = store.get(applicationId)

    if (application.status !== 'PENDING_PAYMENT') {
      throw new ApiError({
        status: 409,
        code: 'PAYMENT_NOT_PENDING',
        title: 'This application is not awaiting payment',
      })
    }

    const now = new Date().toISOString()
    application.status = 'SUBMITTED'
    application.paidAt = now
    application.updatedAt = now
    application.statusHistory.push({ status: 'SUBMITTED', at: now })
    application.nextStep = {
      en: 'We have your application. Most decisions take about 3 days.',
      ar: 'استلمنا طلبك. معظم القرارات تستغرق نحو 3 أيام.',
    }

    return application
  }

  return apiFetch(`/applications/${applicationId}/payments`, { method: 'POST' })
}

/** FR-TRK-05: answer an information request. */
export async function respondToInfoRequest(applicationId, { message, documentIds = [] }) {
  if (isMockMode) {
    await mockLatency()
    const application = store.get(applicationId)

    if (application.status !== 'INFO_REQUESTED') {
      throw new ApiError({
        status: 409,
        code: 'NO_INFO_REQUEST',
        title: 'There is nothing to respond to',
      })
    }

    for (const documentId of documentIds) {
      const document = application.documents.find((entry) => entry.id === documentId)
      if (document) document.state = 'pending'
    }

    const now = new Date().toISOString()
    application.infoRequest = {
      ...application.infoRequest,
      respondedAt: now,
      responseMessage: message,
    }
    application.status = 'UNDER_REVIEW'
    application.updatedAt = now
    application.statusHistory.push({ status: 'UNDER_REVIEW', at: now })
    application.nextStep = {
      en: 'Thanks — your application is back with the review team.',
      ar: 'شكراً — عاد طلبك إلى فريق المراجعة.',
    }

    return application
  }

  return apiFetch(`/applications/${applicationId}/info-responses`, {
    method: 'POST',
    body: { message, documentIds },
  })
}

/** FR-APP-12: withdraw before a decision. */
export async function withdrawApplication(applicationId) {
  if (isMockMode) {
    await mockLatency()
    const application = store.get(applicationId)

    const withdrawable = [
      'DRAFT',
      'PENDING_PAYMENT',
      'SUBMITTED',
      'UNDER_REVIEW',
      'INFO_REQUESTED',
    ]

    if (!withdrawable.includes(application.status)) {
      throw new ApiError({
        status: 409,
        code: 'CANNOT_WITHDRAW',
        title: 'This application can no longer be withdrawn',
      })
    }

    const now = new Date().toISOString()
    application.status = 'WITHDRAWN'
    application.updatedAt = now
    application.statusHistory.push({ status: 'WITHDRAWN', at: now })

    return application
  }

  return apiFetch(`/applications/${applicationId}/withdraw`, { method: 'POST' })
}

/** FR-APP-13: copy answers from a previous application into a new draft. */
export async function cloneApplication(applicationId, visaTypeSlug) {
  if (isMockMode) {
    await mockLatency()
    const source = store.get(applicationId)
    const draft = await createDraft(visaTypeSlug ?? source.visaTypeSlug)

    draft.steps = { ...source.steps }
    draft.passport = source.passport
    draft.travelers = source.travelers
    draft.completedStepKeys = [...source.completedStepKeys]
    draft.clonedFrom = source.reference ?? source.id

    store.set(draft.id, draft)
    return draft
  }

  return apiFetch(`/applications/${applicationId}/clone`, { method: 'POST' })
}

/** Test helper: restore fixtures between checks. */
export function __resetApplicationStore() {
  store = new Map(
    fixtureApplications.map((application) => [application.id, structuredClone(application)]),
  )
  draftCounter = 0
}