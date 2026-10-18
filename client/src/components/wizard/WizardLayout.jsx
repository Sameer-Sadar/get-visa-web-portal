import { Check, CloudUpload, LifeBuoy } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { Alert } from '@visagate/ui/feedback'
import { Button } from '@visagate/ui/Button'
import { Stepper } from '@visagate/ui/navigation'
import { FeeTotal } from '../domain/FeeBreakdown.jsx'
import { PageMeta } from '../../app/PageMeta.jsx'
import { localePath } from '../../config/site.js'
import { completionPercent } from '../../lib/formSchema.js'

/**
 * Wizard chrome: step progress, autosave state, summary rail, and the sticky
 * Back/Continue actions (§6.5).
 *
 * Autosave runs on step change and after an idle period. The "Saved" message
 * lives in an `aria-live` region so a screen-reader user learns their work is
 * safe without hunting for it (§6.5).
 */
export function WizardLayout({
  application,
  stepKeys,
  currentStepKey,
  completedStepKeys,
  feeQuote,
  saveState,
  onBack,
  onContinue,
  onSaveAndExit,
  continueLabel,
  continueLoading = false,
  errorSummary,
  hideStepper = false,
  children,
}) {
  const { t, i18n } = useTranslation()
  const { locale } = useParams()
  const language = i18n.resolvedLanguage
  const summaryRef = useRef(null)

  /* §6.5: on a multi-error step, move focus to the summary at the top. */
  useEffect(() => {
    if (errorSummary?.length > 0) summaryRef.current?.focus()
  }, [errorSummary])

  const steps = stepKeys.map((key) => ({
    key,
    label: t(`wizard.step.${key}`),
  }))

  const isLastStep = currentStepKey === 'review'
  const percent = completionPercent(completedStepKeys, stepKeys.length)

  return (
    <div className="bg-neutral-50">
      {/* A wizard step in a tab still deserves a meaningful title (FR-APP-02
          drafts are resumable). The `noindex` for this area comes from
          <LocaleLayout>, which owns the robots policy for the shell. */}
      <PageMeta
        title={`${t(`wizard.step.${currentStepKey}`) ?? t('wizard.reviewHeading')} — ${t('wizard.applicationTitle')}`}
        path={`/apply/${application.id}/${currentStepKey}`}
        locale={locale}
      />

      <div className="border-neutral-300 border-b">
        <div className="mx-auto max-w-75rem px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-neutral-700 text-small">
                {t('wizard.referenceLabel')}{' '}
                <span className="ltr-nums text-neutral-900 font-semibold">
                  {application.reference ?? t('wizard.referencePending')}
                </span>
              </p>
              <p className="text-neutral-700 text-small">
                <span className="ltr-nums">{percent}%</span> {t('wizard.complete')}
              </p>
            </div>

            <SaveIndicator state={saveState} />

            <Button variant="ghost" size="s" onClick={onSaveAndExit} className="ms-auto">
              {t('wizard.saveAndExit')}
            </Button>
          </div>

          {!hideStepper ? <Stepper steps={steps} currentKey={currentStepKey} className="mt-5" /> : null}
        </div>
      </div>

      <div className="mx-auto max-w-75rem px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {/* Error summary with anchor links for multi-error steps (§8). */}
            {errorSummary?.length > 0 ? (
              <div
                ref={summaryRef}
                tabIndex={-1}
                role="alert"
                className="border-danger-600 bg-danger-600/10 rounded-card mb-6 border p-5 focus:outline-none"
              >
                <h2 className="text-danger-600 text-body font-semibold">
                  {t('wizard.errorSummaryTitle', { count: errorSummary.length })}
                </h2>
                <ul className="mt-2 space-y-1">
                  {errorSummary.map((entry) => (
                    <li key={entry.field}>
                      <a
                        href={`#field-${entry.field}`}
                        className="text-danger-600 text-small underline underline-offset-4"
                      >
                        {entry.message}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="bg-surface border-neutral-300 rounded-card border p-6 sm:p-8">
              {children}
            </div>

            {/* Sticky action bar; §10 keeps it pinned on mobile. */}
            <div className="border-neutral-300 bg-surface sticky bottom-0 z-10 mt-6 flex flex-wrap items-center gap-3 rounded-card border p-4 shadow-2">
              <Button
                variant="secondary"
                onClick={onBack}
                disabled={!onBack}
                className="order-2 sm:order-1"
              >
                {t('wizard.back')}
              </Button>
              <Button
                onClick={onContinue}
                loading={continueLoading}
                className="order-1 w-full sm:order-2 sm:w-auto"
              >
                {continueLabel ?? (isLastStep ? t('wizard.continueToPayment') : t('wizard.continue'))}
              </Button>
              <p className="text-neutral-700 order-3 w-full text-small sm:ms-auto sm:w-auto">
                {t('wizard.backKeepsData')}
              </p>
            </div>
          </div>

          {/* Summary panel — collapses above the form on narrow screens (§10). */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 flex flex-col gap-4">
              <div className="bg-surface border-neutral-300 rounded-card border p-5">
                <FeeTotal quote={feeQuote} locale={language} />

                <dl className="border-neutral-300 mt-4 flex flex-col gap-3 border-t pt-4 text-small">
                  <div className="flex justify-between gap-3">
                    <dt className="text-neutral-700">{t('wizard.summaryTravelers')}</dt>
                    <dd className="font-medium">
                      <span className="ltr-nums">{application.travelerCount ?? 1}</span>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-neutral-700">{t('wizard.summaryDocuments')}</dt>
                    <dd className="font-medium">
                      <span className="ltr-nums">
                        {
                          (application.documents ?? []).filter(
                            (document) => document.state === 'accepted' || document.state === 'done',
                          ).length
                        }
                        /
                        <span className="ltr-nums">
                          {(application.documents ?? []).filter((document) => document.isRequired).length}
                        </span>
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              {saveState?.status === 'error' ? (
                <Alert tone="warning">{t('wizard.saveFailed')}</Alert>
              ) : null}

              <div className="bg-surface border-neutral-300 rounded-card border p-5">
                <h2 className="text-neutral-900 text-small font-semibold">
                  {t('wizard.needHelp')}
                </h2>
                <p className="text-neutral-700 mt-1 text-small">{t('wizard.needHelpBody')}</p>
                <Link
                  to={localePath(locale, '/help')}
                  className="text-primary-700 mt-3 inline-flex min-h-9 items-center gap-1.5 text-small font-medium"
                >
                  <LifeBuoy aria-hidden="true" className="size-4" />
                  {t('nav.help')}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

/**
 * Autosave status. Three honest states, none of them "probably saved":
 * saving, saved, and failed. The parent clears it back to idle on the next
 * edit, so the message always describes the current truth.
 */
export function SaveIndicator({ state }) {
  const { t } = useTranslation()

  if (!state) return null

  if (state.status === 'error') {
    return (
      <p role="alert" className="text-danger-600 text-small font-medium">
        {t('wizard.saveFailed')}
      </p>
    )
  }

  if (state.status === 'saving') {
    return (
      <p className="text-neutral-700 inline-flex items-center gap-1.5 text-small">
        <CloudUpload aria-hidden="true" className="size-4 animate-pulse" />
        {t('wizard.saving')}
      </p>
    )
  }

  if (state.status === 'saved') {
    return (
      <p
        role="status"
        aria-live="polite"
        className="text-success-600 inline-flex items-center gap-1.5 text-small font-medium"
      >
        <Check aria-hidden="true" className="size-4" />
        {t('wizard.savedJustNow')}
      </p>
    )
  }

  return null
}