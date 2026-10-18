import { Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@visagate/ui/overlays'
import { Badge } from '@visagate/ui/Badge'
import { valueToText } from '../../lib/fieldValue.js'
import { declarations } from '../../fixtures/formSchemas.js'
import { FeeBreakdown } from '../domain/FeeBreakdown.jsx'
import { localePath } from '../../config/site.js'
import { formatMoney, localize } from '../../lib/format.js'

/**
 * Review step (FR-APP-08): a collapsible summary per step with Edit links, the
 * fee breakdown, and the declarations that will be submitted with it.
 *
 * The Edit link deep-links into the wizard step so Back/Forward still work —
 * the wizard is a nested route, not a hidden dialog (§19).
 */
export function ReviewStep({ application, schema, answers, declarationsAccepted, feeQuote }) {
  const { t, i18n } = useTranslation()
  const { locale } = useParams()
  const language = i18n.resolvedLanguage

  return (
    <div className="flex flex-col gap-6">
      <div>
        {/* This is the review step's page heading. The wizard frame suppresses
            its own <h1> for this step so there is exactly one (§12). */}
        <h1 className="text-h2 font-bold">{t('wizard.reviewHeading')}</h1>
        <p className="text-neutral-700 mt-1">{t('wizard.reviewIntro')}</p>
      </div>

      <Accordion type="multiple" defaultValue={[schema.steps[0].key]} className="border-neutral-300 rounded-card border px-5">
        {schema.steps.map((step) => {
          const stepAnswers = answers[step.key] ?? {}
          const fields = step.fields.filter(
            (field) => stepAnswers[field.key] !== undefined && stepAnswers[field.key] !== '',
          )

          return (
            <AccordionItem key={step.key} value={step.key}>
              <AccordionTrigger>
                <span className="flex w-full items-center justify-between gap-3 pe-4">
                  {t(step.labelKey)}
                  {step.custom === 'documents' ? (
                    <Badge tone="neutral" size="s">
                      {t('wizard.reviewDocuments')}
                    </Badge>
                  ) : null}
                </span>
              </AccordionTrigger>

              <AccordionContent>
                {step.custom === 'documents' ? (
                  <DocumentSummary documents={application.documents} language={language} />
                ) : step.custom === 'declarations' ? (
                  <ul className="space-y-1">
                    {declarations.map((declaration) => (
                      <li key={declaration.key} className="flex items-center gap-2">
                        <Badge tone={declarationsAccepted?.[declaration.key] ? 'success' : 'neutral'} size="s">
                          {declarationsAccepted?.[declaration.key]
                            ? t('wizard.declarationAccepted')
                            : t('wizard.declarationPending')}
                        </Badge>
                        <span className="text-neutral-700 text-small">
                          {t(declaration.textKey)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : fields.length === 0 ? (
                  <p className="text-neutral-700 text-small">{t('wizard.reviewEmptyStep')}</p>
                ) : (
                  <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                    {fields.map((field) => (
                      <div key={field.key} className="min-w-0">
                        <dt className="text-neutral-700 text-small">{t(field.labelKey)}</dt>
                        <dd className="text-neutral-900 break-words font-medium">
                          {valueToText(field, stepAnswers[field.key], { t, locale: language })}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                <Link
                  to={localePath(locale, `/apply/${application.id}/${step.key}`)}
                  state={{ fromReview: true }}
                  className="text-primary-700 hover:text-primary-600 mt-4 inline-flex min-h-9 items-center gap-1.5 text-small font-medium"
                >
                  <Pencil aria-hidden="true" className="size-4" />
                  {t('wizard.editStep')}
                </Link>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      <section aria-labelledby="review-fees">
        <h3 id="review-fees" className="text-h3 font-semibold">
          {t('wizard.reviewFeesHeading')}
        </h3>
        <div className="mt-4 max-w-xl">
          <FeeBreakdown quote={feeQuote} locale={language} />
        </div>
      </section>

      <p className="text-neutral-700 text-small">{t('wizard.reviewFinal')}</p>
    </div>
  )
}

function DocumentSummary({ documents = [], language }) {
  const { t } = useTranslation()

  return (
    <ul className="space-y-2">
      {documents.map((document) => (
        <li key={document.id} className="flex flex-wrap items-center gap-2">
          <Badge tone={document.state === 'accepted' || document.state === 'done' ? 'success' : 'warning'} size="s">
            {t(`documentState.${document.state}`, {
              defaultValue:
                document.state === 'accepted' || document.state === 'done'
                  ? 'Uploaded'
                  : 'Not uploaded',
            })}
          </Badge>
          <span className="text-neutral-900 text-small">
            {localize(document.label, language) ?? document.code}
          </span>
          {document.fileSize ? (
            <span className="text-neutral-700 ltr-nums text-small">
              {Math.round(document.fileSize / 1024)} KB
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

/** Confirmation screen (post-payment) with a copyable reference. */
export function ConfirmationSummary({ application, feeQuote }) {
  const { t, i18n } = useTranslation()
  const { locale } = useParams()
  const language = i18n.resolvedLanguage

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="bg-success-600/10 text-success-600 grid size-16 place-items-center rounded-pill">
        <Badge size="m" tone="success" className="text-h3">
          ✓
        </Badge>
      </div>

      <div>
        <h2 className="text-h2 font-bold">{t('wizard.confirmationHeading')}</h2>
        <p className="text-neutral-700 mx-auto mt-2 max-w-lg">{t('wizard.confirmationIntro')}</p>
      </div>

      <div className="bg-surface border-neutral-300 w-full max-w-md rounded-card border p-6">
        <p className="text-neutral-700 text-small">{t('wizard.referenceNumber')}</p>
        <p className="text-h3 ltr-nums mt-1 font-bold">{application.reference}</p>

        <div className="border-neutral-300 mt-4 border-t pt-4">
          <p className="text-neutral-700 text-small">{t('wizard.paidAmount')}</p>
          <p className="text-neutral-900 text-h3 font-bold">
            <span className="ltr-nums">
              {formatMoney(feeQuote?.totalMinor ?? 0, feeQuote?.currency ?? 'SAR', language)}
            </span>
          </p>
        </div>
      </div>

      <p className="text-neutral-700 max-w-lg text-small">{t('wizard.confirmationEmail')}</p>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to={localePath(locale, `/account/applications/${application.id}`)}
          className="inline-flex min-h-11 items-center rounded-input bg-primary-700 px-4 font-semibold text-white"
        >
          {t('wizard.viewApplication')}
        </Link>
        <Link
          to={localePath(locale, '/track')}
          className="inline-flex min-h-11 items-center rounded-input border border-neutral-300 px-4 font-semibold"
        >
          {t('wizard.trackCta')}
        </Link>
      </div>
    </div>
  )
}