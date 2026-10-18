import { useQuery } from '@tanstack/react-query'
import { Download, FileText } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Tabs, TabsContent, TabsList, TabsTrigger } from '@visagate/ui/overlays'
import { Alert, Skeleton } from '@visagate/ui/feedback'
import { Badge } from '@visagate/ui/Badge'
import { Button } from '@visagate/ui/Button'
import { Container, Section } from '@visagate/ui/Container'
import { PageHeader } from '../components/domain/PageHeader.jsx'
import { FeeBreakdown, FeeTotal } from '../components/domain/FeeBreakdown.jsx'
import { getCategories, getFeePreview, getVisaTypeBySlug } from '../services/catalogService.js'
import { getFaqs } from '../services/contentService.js'
import { visaStructuredData } from '../lib/structuredData.js'
import { formatDays, formatSla, localize } from '../lib/format.js'
import { localePath } from '../config/site.js'
import { NotFoundPage } from './ErrorPages.jsx'

/**
 * Visa detail (FR-PUB-04, §6.3): Overview · Eligibility · Fees & timing ·
 * Required documents · FAQ, with a sticky summary card carrying the fee total,
 * processing time and the apply CTA.
 *
 * The full fee breakdown is on the page *before* registration — §13 requires
 * transparency at that point, not after.
 */
export default function VisaDetailPage() {
  const { t, i18n } = useTranslation()
  const { locale, slug } = useParams()
  const language = i18n.resolvedLanguage
  const [travelerCount, setTravelerCount] = useState(1)

  const { data: visaType, isLoading } = useQuery({
    queryKey: ['visa-type', slug, { locale: language }],
    queryFn: () => getVisaTypeBySlug(slug),
  })

  const { data: feePreview } = useQuery({
    queryKey: ['fee-preview', slug, travelerCount, language],
    queryFn: () => getFeePreview(slug, { travelerCount, locale: language }),
    enabled: Boolean(visaType),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['visa-categories'],
    queryFn: getCategories,
  })

  const { data: faqs = [] } = useQuery({
    queryKey: ['faqs', { query: '' }],
    queryFn: () => getFaqs({ query: '' }),
  })

  const relatedFaqs = faqs.filter(
    (faq) => !visaType || faq.relatedVisaSlugs.includes(visaType.slug),
  )

  if (!isLoading && !visaType) return <NotFoundPage />

  const category = categories.find((entry) => entry.code === visaType?.categoryCode)

  return (
    <>
      <PageHeader
        title={visaType ? localize(visaType.name, language) : ''}
        description={visaType ? localize(visaType.summary, language) : undefined}
        structuredData={
          visaType && feePreview
            ? visaStructuredData(visaType, language, {
                priceMinor: feePreview.totalMinor,
                currency: feePreview.currency,
                url: window.location.href,
              })
            : undefined
        }
        breadcrumbs={[
          { label: t('nav.visas'), to: '/visas', key: 'visas' },
          ...(category
            ? [
                {
                  label: localize(category.name, language),
                  to: `/visas/category/${category.key}`,
                  key: 'category',
                },
              ]
            : []),
          { label: visaType ? localize(visaType.name, language) : '…', key: 'visa' },
        ]}
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            {/* ── Main content ─────────────────────────────────────── */}
            <div className="lg:col-span-8">
              {isLoading ? (
                <Skeleton className="h-96" />
              ) : (
                <Tabs defaultValue="overview">
                  <TabsList label={t('visa.tabsLabel')}>
                    <TabsTrigger value="overview">{t('visa.tabOverview')}</TabsTrigger>
                    <TabsTrigger value="eligibility">{t('visa.tabEligibility')}</TabsTrigger>
                    <TabsTrigger value="fees">{t('visa.tabFees')}</TabsTrigger>
                    <TabsTrigger value="documents">{t('visa.tabDocuments')}</TabsTrigger>
                    <TabsTrigger value="faq">{t('visa.tabFaq')}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="pt-6">
                    <h2 className="text-h3 font-semibold">
                      {t('visa.overviewHeading')}
                    </h2>
                    <p className="mt-3">{localize(visaType.description, language)}</p>

                    <h3 className="text-neutral-900 mt-8 font-semibold">
                      {t('visa.keyFactsHeading')}
                    </h3>
                    <dl className="mt-3 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                      {[
                        {
                          label: t('visa.factValidity'),
                          value: formatDays(visaType.validityDays, language, t),
                        },
                        {
                          label: t('visa.factMaxStay'),
                          value: formatDays(visaType.maxStayDays, language, t),
                        },
                        {
                          label: t('visa.factEntries'),
                          value: t(`visa.entries.${visaType.entryType.toLowerCase()}`),
                        },
                        {
                          label: t('visa.factProcessing'),
                          value: formatSla(visaType.processingSlaHours, language, t),
                        },
                        {
                          label: t('visa.factPassport'),
                          value: t('visa.monthsCount', {
                            count: visaType.minPassportValidityMonths,
                          }),
                        },
                        {
                          label: t('visa.factTravelers'),
                          value: t('visa.travelerLimit', {
                            count: visaType.maxTravelers,
                          }),
                        },
                      ].map((fact) => (
                        <div key={fact.label}>
                          <dt className="text-neutral-700 text-small">{fact.label}</dt>
                          <dd className="text-neutral-900 font-semibold">{fact.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </TabsContent>

                  <TabsContent value="eligibility" className="pt-6">
                    <h2 className="text-h3 font-semibold">
                      {t('visa.eligibilityHeading')}
                    </h2>
                    <p className="text-neutral-700 mt-2">{t('visa.eligibilityIntro')}</p>

                    <ul className="mt-5 space-y-3">
                      <li className="flex items-start gap-2">
                        <span aria-hidden="true" className="text-success-600 mt-1">
                          ●
                        </span>
                        <span>
                          {t('visa.eligibilityPassport', {
                            count: visaType.minPassportValidityMonths,
                          })}
                        </span>
                      </li>
                      {visaType.minAge ? (
                        <li className="flex items-start gap-2">
                          <span aria-hidden="true" className="text-warning-600 mt-1">
                            ●
                          </span>
                          <span>
                            {t('visa.eligibilityMinAge', { count: visaType.minAge })}
                          </span>
                        </li>
                      ) : null}
                      <li className="flex items-start gap-2">
                        <span aria-hidden="true" className="text-info-600 mt-1">
                          ●
                        </span>
                        <span>{t('visa.eligibilityPurpose')}</span>
                      </li>
                      {visaType.requiresSponsor ? (
                        <li className="flex items-start gap-2">
                          <span aria-hidden="true" className="text-info-600 mt-1">
                            ●
                          </span>
                          <span>{t('visa.eligibilitySponsor')}</span>
                        </li>
                      ) : null}
                    </ul>

                    {/* Guide rather than gatekeep: always offer the finder. */}
                    <Alert tone="info" className="mt-6">
                      {t('visa.eligibilityCta')}{' '}
                      <Link
                        to={localePath(locale, '/find-a-visa')}
                        className="font-semibold underline underline-offset-4"
                      >
                        {t('finder.heading')}
                      </Link>
                    </Alert>
                  </TabsContent>

                  <TabsContent value="fees" className="pt-6">
                    <h2 className="text-h3 font-semibold">{t('visa.feesHeading')}</h2>
                    <p className="text-neutral-700 mt-2">{t('visa.feesIntro')}</p>

                    <div className="mt-6 max-w-xl">
                      <FeeBreakdown quote={feePreview} locale={language} />
                    </div>

                    <Alert tone="warning" className="mt-6">
                      {t('visa.feesSnapshotted')}
                    </Alert>
                  </TabsContent>

                  <TabsContent value="documents" className="pt-6">
                    <h2 className="text-h3 font-semibold">
                      {t('visa.documentsHeading')}
                    </h2>
                    <p className="text-neutral-700 mt-2">{t('visa.documentsIntro')}</p>

                    <ul className="mt-5 space-y-4">
                      {visaType.documents.map(({ code, isRequired, documentType }) => (
                        <li
                          key={code}
                          className="border-neutral-300 flex gap-4 rounded-card border p-4"
                        >
                          <FileText aria-hidden="true" className="text-primary-700 size-5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-neutral-900 font-semibold">
                              {documentType ? localize(documentType.name, language) : code}
                            </p>
                            {documentType ? (
                              <p className="text-neutral-700 mt-1 text-small">
                                {localize(documentType.instructions, language)}
                              </p>
                            ) : null}
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge tone={isRequired ? 'primary' : 'neutral'} size="s">
                                {isRequired ? t('visa.documentRequired') : t('visa.documentOptional')}
                              </Badge>
                              {documentType ? (
                                <Badge tone="neutral" size="s">
                                  <span className="ltr-nums">
                                    {t('visa.documentFormats', {
                                      formats: documentType.allowedFormats.join(', '),
                                    })}
                                  </span>
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>

                  <TabsContent value="faq" className="pt-6">
                    <h2 className="text-h3 font-semibold">{t('visa.faqHeading')}</h2>

                    <Accordion type="single" collapsible className="mt-4">
                      {relatedFaqs.map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id}>
                          <AccordionTrigger>
                            {localize(faq.question, language)}
                          </AccordionTrigger>
                          <AccordionContent>{localize(faq.answer, language)}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>

                    <Button variant="tertiary" asChild className="mt-4">
                      <Link to={localePath(locale, '/help')}>{t('visa.faqAllCta')}</Link>
                    </Button>
                  </TabsContent>
                </Tabs>
              )}
            </div>

            {/* ── Sticky summary ───────────────────────────────────── */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <div className="bg-surface border-neutral-300 rounded-card border p-6 shadow-1">
                  {visaType ? (
                    <>
                      <FeeTotal quote={feePreview} locale={language} />

                      <div className="mt-5">
                        <label
                          htmlFor="traveler-count"
                          className="text-small text-neutral-900 font-medium"
                        >
                          {t('feeBreakdown.travelers')}
                        </label>
                        <input
                          id="traveler-count"
                          type="number"
                          min={1}
                          max={visaType.maxTravelers}
                          value={travelerCount}
                          onChange={(event) =>
                            setTravelerCount(
                              Math.min(
                                visaType.maxTravelers,
                                Math.max(1, Number(event.target.value) || 1),
                              ),
                            )
                          }
                          className="border-neutral-300 mt-1.5 min-h-11 w-full rounded-input border bg-surface px-3 py-2"
                        />
                        {travelerCount > visaType.maxTravelers ? (
                          <p className="text-danger-600 mt-1.5 text-small font-medium">
                            {t('visa.travelerLimit', { count: visaType.maxTravelers })}
                          </p>
                        ) : null}
                      </div>

                      <Button size="l" asChild className="mt-5 w-full">
                        <Link to={localePath(locale, `/apply/${visaType.slug}`)}>
                          {t('visa.startApplication')}
                        </Link>
                      </Button>

                      <p className="text-neutral-700 mt-3 text-small">
                        {t('visa.processingNote', {
                          sla: formatSla(visaType.processingSlaHours, language, t),
                        })}
                      </p>

                      <div className="border-neutral-300 mt-5 border-t pt-5">
                        <Button variant="ghost" asChild className="w-full">
                          <Link to={localePath(locale, '/visas')}>{t('visa.compareOther')}</Link>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Skeleton className="h-48" />
                  )}
                </div>

                <p className="text-neutral-700 mt-4 flex items-start gap-2 text-small">
                  <Download aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  {t('visa.pdfNote')}
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  )
}