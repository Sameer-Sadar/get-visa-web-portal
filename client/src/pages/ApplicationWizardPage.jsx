import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreditCard, Lock } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { Alert, Skeleton } from '@visagate/ui/feedback'
import { Container, Section } from '@visagate/ui/Container'
import { RadioGroup } from '@visagate/ui/choices'
import { WizardLayout } from '../components/wizard/WizardLayout.jsx'
import { SchemaStepForm } from '../components/wizard/SchemaStepForm.jsx'
import { DocumentsStep } from '../components/wizard/DocumentsStep.jsx'
import { DeclarationsStep } from '../components/wizard/DeclarationsStep.jsx'
import { ConfirmationSummary, ReviewStep } from '../components/wizard/ReviewStep.jsx'
import { FeeBreakdown } from '../components/domain/FeeBreakdown.jsx'
import { computeFee } from '../lib/fees.js'
import { validateStep } from '../lib/formSchema.js'
import { formatMoney } from '../lib/format.js'
import { visaTypeBySlug } from '../fixtures/visaCatalog.js'
import { CONSENT_VERSION, STEP_KEYS, getFormSchema } from '../fixtures/formSchemas.js'
import {
  confirmPayment,
  createDraft,
  createPayment,
  getApplication,
  saveStep,
  submitApplication,
  updateDocument,
} from '../services/applicationsService.js'
import { localePath } from '../config/site.js'

/**
 * Application wizard (§6.5, §6.6).
 *
 * Steps are nested routes (`/apply/:applicationId/:stepKey`) so Back, Forward
 * and deep links all work and an interrupted application resumes at the exact
 * step it stopped on (§19). Starting an application goes through
 * `/apply/new/:visaTypeSlug`, which creates the draft once and redirects, so a
 * refresh never creates a second draft.
 */
export default function ApplicationWizardPage() {
  return (
    <Routes>
      <Route path="new/:visaTypeSlug" element={<StartApplicationRoute />} />
      <Route path=":applicationId" element={<RedirectToFirstIncompleteStep />} />
      <Route path=":applicationId/:stepKey" element={<WizardStep />} />
    </Routes>
  )
}

function StartApplicationRoute() {
  const { visaTypeSlug, locale } = useParams()
  const { t } = useTranslation()
  const [created, setCreated] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false

    createDraft(visaTypeSlug)
      .then((application) => {
        if (!cancelled) setCreated(application)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [visaTypeSlug])

  if (failed) {
    return (
      <Section>
        <Container size="narrow">
          <Alert tone="danger">{t('wizard.cannotStart')}</Alert>
        </Container>
      </Section>
    )
  }

  if (!created) {
    return (
      <Section>
        <Container>
          <Skeleton className="h-64" />
        </Container>
      </Section>
    )
  }

  return <Navigate to={localePath(locale, `/apply/${created.id}/applicant`)} replace />
}

/** §4.3: resume at the first incomplete step, not at the start. */
function RedirectToFirstIncompleteStep() {
  const { applicationId, locale } = useParams()

  const { data: application } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => getApplication(applicationId),
  })

  const firstIncomplete =
    STEP_KEYS.find((key) => !application?.completedStepKeys?.includes(key)) ?? STEP_KEYS[0]

  return <Navigate to={localePath(locale, `/apply/${applicationId}/${firstIncomplete}`)} replace />
}

/**
 * Loads the application, then hands off to `WizardBody`.
 *
 * The split exists so answers can be seeded from props in a state initialiser.
 * `key={application.id}` remounts the body when the application itself changes
 * — not on every autosave — so in-progress edits are never clobbered by a
 * refetch, and no ref has to be read during render.
 */
function WizardStep() {
  const { applicationId, stepKey, locale } = useParams()
  const { t } = useTranslation()

  const { data: application, isLoading, error: loadError } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => getApplication(applicationId),
  })

  if (isLoading) {
    return (
      <Section>
        <Container>
          <Skeleton className="h-96" />
        </Container>
      </Section>
    )
  }

  if (loadError || !application) {
    return (
      <Section>
        <Container size="narrow">
          <Alert tone="danger">{t('wizard.loadFailed')}</Alert>
        </Container>
      </Section>
    )
  }

  return (
    <WizardBody
      key={application.id}
      application={application}
      applicationId={applicationId}
      stepKey={stepKey}
      locale={locale}
    />
  )
}

function WizardBody({ application, applicationId, stepKey, locale }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage

  const schema = useMemo(() => getFormSchema(application.visaTypeSlug), [application.visaTypeSlug])
  const visaType = visaTypeBySlug.get(application.visaTypeSlug)

  /* One answers map holds every schema step plus the declarations, so Back can
     never drop a value and autosave has a single source of truth.
     Errors are stored per step, so a new step starts clean without an effect
     to reset it. */
  const [answers, setAnswers] = useState(() => application.steps ?? {})
  const [errorsByStep, setErrorsByStep] = useState({})
  const [touched, setTouched] = useState({})
  const [saveState, setSaveState] = useState({ status: 'idle' })

  const dirtyKeys = useRef(new Set())
  const idleTimer = useRef(null)

  const errors = errorsByStep[stepKey] ?? {}
  const setErrors = (next) =>
    setErrorsByStep((current) => ({ ...current, [stepKey]: next }))

  const step = schema?.steps.find((entry) => entry.key === stepKey)
  const stepIndex = STEP_KEYS.indexOf(stepKey)
  const isDeclarations = stepKey === 'declarations'
  const isDocuments = stepKey === 'documents'

  const feeQuote = useMemo(
    () =>
      visaType
        ? computeFee(visaType.feeSchedule, {
            travelerCount: application.travelerCount ?? 1,
            locale: language,
          })
        : null,
    [visaType, application.travelerCount, language],
  )

  const save = useMutation({
    mutationFn: ({ key, values }) => saveStep(applicationId, key, values),
    onMutate: () => setSaveState({ status: 'saving' }),
    onSuccess: (_result, variables) => {
      setSaveState({ status: 'saved', savedAt: new Date().toISOString() })
      dirtyKeys.current.delete(variables.key)
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] })
    },
    onError: () => setSaveState({ status: 'error' }),
  })

  const persist = useCallback(
    (key = stepKey, values = answers) => {
      /* Documents live on their own sub-resource, not in step answers. */
      if (key === 'documents') return
      save.mutate({ key, values })
    },
    [answers, save, stepKey],
  )

  /* Autosave after 20 s idle (§6.5), only when this step has unsaved edits. */
  useEffect(() => {
    if (!dirtyKeys.current.has(stepKey)) return undefined

    idleTimer.current = setTimeout(() => persist(), 20_000)
    return () => clearTimeout(idleTimer.current)
  }, [answers, stepKey, persist])

  const setAnswer = (key, value) => {
    setAnswers((current) => ({ ...current, [key]: value }))
    dirtyKeys.current.add(stepKey)
    setSaveState({ status: 'idle' })

    /* Validate on change only once a field has already failed (§8). */
    if (touched[key] && step?.fields?.length) {
      setErrors(validateStep(step, { ...answers, [key]: value }, { locale: language }))
    }
  }

  const blurField = (key) => {
    setTouched((current) => ({ ...current, [key]: true }))

    if (step?.fields?.length) {
      const nextErrors = validateStep(step, answers, { locale: language })
      setErrors((current) => ({ ...current, [key]: nextErrors[key] }))
    }
  }

  const goTo = (key) => {
    /* Leaving a step is also a save point (§6.5). */
    if (stepKey !== 'documents') persist(stepKey, answers)
    navigate(localePath(locale, `/apply/${applicationId}/${key}`))
  }

  const submit = useMutation({
    mutationFn: () =>
      submitApplication(applicationId, {
        declarations: answers.declarations ?? {},
        consentVersion: CONSENT_VERSION,
      }),
    onSuccess: (submitted) => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] })
      navigate(localePath(locale, `/apply/${applicationId}/payment`), {
        state: { reference: submitted.reference },
      })
    },
  })

  const handleContinue = () => {
    if (stepKey === 'payment') {
      navigate(localePath(locale, `/apply/${applicationId}/confirmation`))
      return
    }

    if (stepKey === 'confirmation') {
      navigate(localePath(locale, '/account/applications'))
      return
    }

    if (isDocuments) {
      goTo('declarations')
      return
    }

    if (isDeclarations) {
      const accepted = answers.declarations ?? {}
      const allTicked = Object.values(accepted).length >= 4 && Object.values(accepted).every(Boolean)
      if (!allTicked) {
        setErrors({ declarations: t('wizard.declarationsIncomplete') })
        return
      }
      goTo('review')
      return
    }

    if (stepKey === 'review') {
      submit.mutate()
      return
    }

    if (!step) return

    const stepErrors = validateStep(step, answers, { locale: language })
    setErrors(stepErrors)
    if (Object.keys(stepErrors).length > 0) return

    goTo(STEP_KEYS[stepIndex + 1] ?? 'review')
  }

  const handleBack = () => {
    if (stepKey === 'payment') goTo('review')
    else if (stepKey === 'review') goTo('declarations')
    else if (stepKey === 'confirmation') goTo('payment')
    else if (stepIndex > 0) goTo(STEP_KEYS[stepIndex - 1])
    else navigate(localePath(locale, `/apply/${applicationId}/applicant`))
  }

  if (!schema) {
    return (
      <Section>
        <Container>
          <Skeleton className="h-96" />
        </Container>
      </Section>
    )
  }

  if (stepKey === 'payment') {
    return (
      <PaymentStep
        application={application}
        feeQuote={feeQuote}
        language={language}
        onBack={handleBack}
        onContinue={handleContinue}
      />
    )
  }

  if (stepKey === 'confirmation') {
    return (
      <Section>
        <Container size="narrow">
          <ConfirmationSummary application={application} feeQuote={feeQuote} />
        </Container>
      </Section>
    )
  }

  const errorSummary = Object.entries(errors)
    .filter(([, message]) => Boolean(message))
    .map(([field, message]) => ({ field, message }))

  return (
    <WizardLayout
      application={application}
      stepKeys={STEP_KEYS}
      currentStepKey={stepKey}
      completedStepKeys={application.completedStepKeys ?? []}
      feeQuote={feeQuote}
      saveState={saveState}
      onBack={handleBack}
      onContinue={handleContinue}
      onSaveAndExit={() => navigate(localePath(locale, '/account/applications'))}
      continueLoading={submit.isPending}
      errorSummary={errorSummary}
    >
      {/* The review step brings its own heading, so the wizard's would be a
          duplicate <h1> on the page. */}
      {stepKey !== 'review' ? (
        <h1 className="text-h2 mb-6 font-bold">
          {step ? t(step.labelKey) : t('wizard.reviewHeading')}
        </h1>
      ) : null}

      {step?.fields?.length ? (
        <SchemaStepForm
          step={step}
          values={answers}
          errors={errors}
          onChange={setAnswer}
          onBlur={blurField}
        />
      ) : null}

      {isDocuments ? (
        <DocumentsStep
          documents={application.documents ?? []}
          onReplace={(document) => simulateUpload(applicationId, document, queryClient)}
          onRetry={(document) => simulateUpload(applicationId, document, queryClient)}
        />
      ) : null}

      {isDeclarations ? (
        <DeclarationsStep
          values={answers.declarations ?? {}}
          onChange={(key, value) =>
            setAnswer('declarations', { ...(answers.declarations ?? {}), [key]: value })
          }
        />
      ) : null}

      {stepKey === 'review' ? (
        <ReviewStep
          application={application}
          schema={schema}
          answers={answers}
          declarationsAccepted={answers.declarations ?? {}}
          feeQuote={feeQuote}
        />
      ) : null}

      {errors.declarations ? (
        <Alert tone="danger" className="mt-4">
          {errors.declarations}
        </Alert>
      ) : null}

      {submit.isError ? (
        <Alert tone="danger" className="mt-4">
          {submit.error?.message ?? t('wizard.submitFailed')}
        </Alert>
      ) : null}
    </WizardLayout>
  )
}

/**
 * Drives a document row through the real state sequence — uploading with
 * percentage progress, then "Checking file…" while the server verifies, then
 * accepted. The transport is stubbed; the state machine the UI renders is not.
 */
async function simulateUpload(applicationId, document, queryClient) {
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['application', applicationId] })

  await updateDocument(applicationId, document.id, { state: 'uploading', progress: 10, reason: null })
  await refresh()

  for (const progress of [40, 70, 90]) {
    await new Promise((resolve) => setTimeout(resolve, 180))
    await updateDocument(applicationId, document.id, { state: 'uploading', progress })
    await refresh()
  }

  await updateDocument(applicationId, document.id, {
    state: 'checking',
    fileName: `${document.code.toLowerCase()}.jpg`,
    fileSize: 420_000,
    progress: 100,
  })
  await refresh()

  await new Promise((resolve) => setTimeout(resolve, 400))
  await updateDocument(applicationId, document.id, { state: 'accepted' })
  await refresh()
}

/**
 * Payment (FR-PAY-01..04).
 *
 * There is deliberately no card field here. Card capture belongs to the PSP's
 * hosted elements, which is what keeps PCI scope at SAQ-A (PRD §12); a form on
 * this page would be a compliance regression, not a shortcut.
 */
function PaymentStep({ application, feeQuote, language, onBack, onContinue }) {
  const { t } = useTranslation()
  const [method, setMethod] = useState('card')

  const pay = useMutation({
    mutationFn: async () => {
      await createPayment(application.id)
      return confirmPayment(application.id)
    },
  })

  const amount = formatMoney(feeQuote?.totalMinor ?? 0, feeQuote?.currency ?? 'SAR', language)

  return (
    <WizardLayout
      application={application}
      stepKeys={[]}
      currentStepKey="payment"
      completedStepKeys={[]}
      feeQuote={feeQuote}
      saveState={{ status: 'saved' }}
      onBack={onBack}
      onContinue={onContinue}
      continueLabel={`${t('wizard.payNow')} ${amount}`}
      continueLoading={pay.isPending}
      hideStepper
    >
      <h1 className="text-h2 mb-2 font-bold">{t('wizard.paymentHeading')}</h1>
      <p className="text-neutral-700 mb-6">{t('wizard.paymentIntro')}</p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <RadioGroup
            label={t('wizard.paymentMethod')}
            hideLabel
            value={method}
            onValueChange={setMethod}
            options={[
              { value: 'card', label: t('wizard.methodCard') },
              { value: 'bank', label: t('wizard.methodBank') },
            ]}
          />

          <Alert tone="info" className="mt-5">
            {t('wizard.paymentHosted')}
          </Alert>

          {pay.isError ? (
            <Alert tone="danger" className="mt-4">
              {t('wizard.paymentFailed')}
            </Alert>
          ) : null}
        </div>

        <div>
          <h2 className="text-h3 mb-3 font-semibold">{t('feeBreakdown.total')}</h2>
          <FeeBreakdown quote={feeQuote} locale={language} />
        </div>
      </div>

      <p className="text-neutral-700 mt-6 flex items-center gap-2 text-small">
        <Lock aria-hidden="true" className="size-4" />
        {t('wizard.paymentSecure')}
      </p>
      <p className="text-neutral-700 mt-2 flex items-center gap-2 text-small">
        <CreditCard aria-hidden="true" className="size-4" />
        {t('wizard.paymentReceipt')}
      </p>
    </WizardLayout>
  )
}