import { applicationByReference, applications } from '../fixtures/applications.js'
import { visaTypeBySlug } from '../fixtures/visaCatalog.js'
import { ApiError, apiFetch, isMockMode, mockLatency } from './apiClient.js'

/**
 * Public tracking and visa verification (FR-TRK-01..04).
 *
 * Security rules baked into the response shape, not left to the UI:
 *  - lookup requires BOTH reference and passport number (two-factor lookup), so
 *    a reference alone cannot be enumerated (R-02);
 *  - the response is reduced — initials and visa type only — until the applicant
 *    completes step-up verification (FR-TRK-03, §6.8);
 *  - failures are deliberately vague, to avoid confirming whether a reference
 *    exists.
 */

const VAGUE_FAILURE = {
  status: 404,
  code: 'TRACKING_NOT_FOUND',
  title: 'No matching application',
}

function toTrackingSummary(application, { verified = false } = {}) {
  const visaType = visaTypeBySlug.get(application.visaTypeSlug)

  const summary = {
    reference: application.reference,
    status: application.status,
    visaTypeName: visaType?.name ?? null,
    travelerCount: application.travelerCount,
    submittedAt: application.submittedAt ?? null,
    nextStep: application.nextStep ?? null,
    timeline: (application.statusHistory ?? []).map((entry) => ({
      status: entry.status,
      at: entry.at,
    })),
  }

  /* Minimal dataset until step-up (FR-TRK-04 + §6.8): initials only, no
     names, no document numbers, no travel dates. */
  summary.travelers = (application.travelers ?? []).map((traveler) => ({
    initials: traveler.initials,
    maskedPassportNo: traveler.maskedPassportNo,
  }))

  if (verified) {
    summary.travel = application.travel ?? null
    summary.feeQuote = application.feeQuote ?? null
    summary.visa = application.visa
      ? { ...application.visa, verificationToken: undefined }
      : null
  }

  return summary
}

export async function lookupApplication({ reference, passportNumber, captchaToken }) {
  if (isMockMode) {
    await mockLatency()

    if (!captchaToken) {
      throw new ApiError({ ...VAGUE_FAILURE, code: 'CAPTCHA_REQUIRED', status: 400 })
    }

    const normalized = String(reference ?? '').trim().toUpperCase()
    const application = applicationByReference.get(normalized)

    /* Same failure for a wrong passport and a wrong reference: never confirm
       that a reference exists (R-02 enumeration defence). */
    const passportMatches =
      application &&
      (application.travelers ?? []).some((traveler) =>
        traveler.maskedPassportNo?.endsWith(String(passportNumber ?? '').trim().slice(-4)),
      )

    if (!application || !passportMatches) {
      throw new ApiError(VAGUE_FAILURE)
    }

    return { lookupToken: `lookup_${normalized}`, summary: toTrackingSummary(application) }
  }

  return apiFetch('/tracking/lookup', {
    method: 'POST',
    body: { reference, passportNumber, captchaToken },
  })
}

/** Step-up: OTP on the verified destination, then the full dataset (§6.2). */
export async function completeStepUp(lookupToken, otpCode) {
  if (isMockMode) {
    await mockLatency()

    const reference = lookupToken?.replace('lookup_', '')
    const application = applicationByReference.get(reference)
    if (!application) throw new ApiError(VAGUE_FAILURE)

    if (otpCode !== '123456') {
      throw new ApiError({
        status: 401,
        code: 'OTP_INVALID',
        title: 'That code is not correct',
      })
    }

    return { summary: toTrackingSummary(application, { verified: true }) }
  }

  return apiFetch(`/tracking/${lookupToken}/otp`, { method: 'POST', body: { otpCode } })
}

/** FR-TRK-03: public QR verification. Exposes minimal data by design (§8.2 BR-09). */
export async function verifyVisa(token) {
  if (isMockMode) {
    await mockLatency()

    const application = applications.find(
      (candidate) => candidate.visa?.verificationToken === token,
    )

    if (!application) return null

    const visaType = visaTypeBySlug.get(application.visaTypeSlug)

    return {
      isValid: true,
      holderInitials: application.travelers?.[0]?.initials ?? null,
      visaTypeName: visaType?.name ?? null,
      issuedAt: application.visa.issuedAt,
      validFrom: application.visa.validFrom,
      validUntil: application.visa.validUntil,
    }
  }

  return apiFetch(`/verify/${token}`)
}