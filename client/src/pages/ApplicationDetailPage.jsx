import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock, Download, FileText, MessageCircleQuestion } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { Alert, Skeleton } from '@visagate/ui/feedback'
import { Badge } from '@visagate/ui/Badge'
import { Button } from '@visagate/ui/Button'
import { Card } from '@visagate/ui/Card'
import { Container, Section } from '@visagate/ui/Container'
import { DescriptionList } from '@visagate/ui/data'
import { StatusPill, statusLabelKey } from '@visagate/ui/StatusPill'
import { Textarea } from '@visagate/ui/inputs'
import { PageHeader } from '../components/domain/PageHeader.jsx'
import { StatusTimeline } from '../components/domain/StatusTimeline.jsx'
import { getApplication, respondToInfoRequest } from '../services/applicationsService.js'
import { visaTypeBySlug } from '../fixtures/visaCatalog.js'
import { formatDate, formatMoney, localize } from '../lib/format.js'
import { localePath } from '../config/site.js'

/**
 * Application detail for the signed-in owner (§6.8).
 *
 * Unlike the public tracking page this shows the full record — travel dates,
 * fees, documents — because the applicant is authenticated and owns the data.
 * The same route renders the info-request response panel when one is open.
 */
export default function ApplicationDetailPage() {
  const { applicationId, locale } = useParams()
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage

  const { data: application, isLoading, error } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => getApplication(applicationId),
  })

  const visaType = visaTypeBySlug.get(application?.visaTypeSlug)

  if (isLoading) {
    return (
      <Section>
        <Container>
          <Skeleton className="h-96" />
        </Container>
      </Section>
    )
  }

  if (error || !application) {
    return (
      <Section>
        <Container size="narrow">
          <Alert tone="danger">{t('account.applicationNotFound')}</Alert>
        </Container>
      </Section>
    )
  }

  const infoRequest = application.infoRequest
  const deadlinePassed = infoRequest?.deadlineAt && new Date(infoRequest.deadlineAt) < new Date()

  return (
    <>
      <PageHeader
        title={visaType ? localize(visaType.name, language) : t('account.applicationTitle')}
        breadcrumbs={[
          { label: t('account.nav.applications'), to: '/account/applications', key: 'applications' },
          { label: application.reference ?? t('account.draftReference'), key: 'application' },
        ]}
      />

      <Section>
        <Container>
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              {/* Next step — the single most useful sentence on the page (§6.8). */}
              <Alert tone={application.status === 'INFO_REQUESTED' ? 'warning' : 'info'}>
                <span className="font-semibold">{t('account.nextStep')}: </span>
                {localize(application.nextStep, language)}
              </Alert>

              {infoRequest ? (
                <InfoRequestPanel
                  application={application}
                  language={language}
                  deadlinePassed={Boolean(deadlinePassed)}
                />
              ) : null}

              <Card className="p-6">
                <h2 className="text-h3 font-semibold">{t('account.progress')}</h2>
                <div className="mt-5">
                  <StatusTimeline
                    status={application.status}
                    history={application.statusHistory ?? []}
                    processedAt={application.nextStep}
                    locale={language}
                  />
                </div>
              </Card>

              {application.travel ? (
                <Card className="p-6">
                  <h2 className="text-h3 font-semibold">{t('account.travelDetails')}</h2>
                  <DescriptionList
                    className="mt-4"
                    columns={2}
                    items={[
                      {
                        label: t('account.arrival'),
                        value: formatDate(application.travel.arrivalDate, language),
                      },
                      {
                        label: t('account.departure'),
                        value: formatDate(application.travel.departureDate, language),
                      },
                      { label: t('account.purpose'), value: t(`purpose.${application.travel.purpose?.toLowerCase()}`) },
                      { label: t('account.entryPoint'), value: application.travel.entryPoint ?? '—' },
                    ]}
                  />
                </Card>
              ) : null}

              {application.documents?.length ? (
                <Card className="p-6">
                  <h2 className="text-h3 font-semibold">{t('account.documents')}</h2>
                  <ul className="mt-4 space-y-2">
                    {application.documents.map((document) => (
                      <li key={document.id} className="flex flex-wrap items-center gap-3">
                        <FileText aria-hidden="true" className="text-neutral-700 size-4" />
                        <span className="text-neutral-900 text-body">{document.code}</span>
                        <Badge
                          tone={
                            document.state === 'accepted' || document.state === 'done'
                              ? 'success'
                              : document.state === 'rejected' || document.state === 'error'
                                ? 'danger'
                                : 'neutral'
                          }
                          size="s"
                        >
                          {t(`documentState.${document.state}`, { defaultValue: document.state })}
                        </Badge>
                        {!document.isRequired ? (
                          <Badge tone="neutral" size="s">
                            {t('visa.documentOptional')}
                          </Badge>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </Card>
              ) : null}
            </div>

            <aside className="space-y-4 lg:col-span-4">
              <Card className="p-5">
                <h2 className="text-neutral-900 text-small font-semibold">
                  {t('account.summary')}
                </h2>

                <dl className="mt-4 space-y-3 text-small">
                  <div>
                    <dt className="text-neutral-700">{t('account.reference')}</dt>
                    <dd className="ltr-nums font-mono font-semibold">
                      {application.reference ?? '—'}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-neutral-700">{t('account.status')}</dt>
                    <dd className="mt-1">
                      <StatusPill
                        status={application.status}
                        label={t(statusLabelKey(application.status))}
                        size="s"
                      />
                    </dd>
                  </div>

                  <div>
                    <dt className="text-neutral-700">{t('account.travelers')}</dt>
                    <dd className="font-medium">
                      {t('feeBreakdown.travelerCount', { count: application.travelerCount ?? 1 })}
                    </dd>
                  </div>

                  {application.feeQuote ? (
                    <div>
                      <dt className="text-neutral-700">{t('account.feesPaid')}</dt>
                      <dd className="ltr-nums font-semibold">
                        {formatMoney(
                          application.feeQuote.totalMinor,
                          application.feeQuote.currency,
                          language,
                        )}
                      </dd>
                    </div>
                  ) : null}

                  {application.submittedAt ? (
                    <div>
                      <dt className="text-neutral-700">{t('account.submitted')}</dt>
                      <dd className="font-medium">
                        {formatDate(application.submittedAt, language)}
                      </dd>
                    </div>
                  ) : null}
                </dl>

                <div className="mt-5 flex flex-col gap-2">
                  {application.status === 'ISSUED' && application.visa ? (
                    <>
                      <Button>{t('account.downloadVisa')}</Button>
                      <Button variant="secondary" asChild>
                        <Link to={localePath(locale, `/verify/${application.visa.verificationToken}`)}>
                          {t('account.verifyVisa')}
                        </Link>
                      </Button>
                      <p className="text-neutral-700 text-small">
                        <Download aria-hidden="true" className="me-1 inline size-4" />
                        {t('account.visaPdfNote')}
                      </p>
                    </>
                  ) : null}

                  {application.status === 'DRAFT' ? (
                    <Button asChild>
                      <Link to={localePath(locale, `/apply/${application.id}`)}>
                        {t('account.continueDraft')}
                      </Link>
                    </Button>
                  ) : null}

                  <Button variant="secondary" asChild>
                    <Link to={localePath(locale, '/help/contact')}>{t('account.contactSupport')}</Link>
                  </Button>
                </div>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  )
}

/**
 * Information-request panel (FR-TRK-05, §6.8): the officer's message, the
 * items asked for, the deadline, and a response form.
 */
function InfoRequestPanel({ application, language, deadlinePassed }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')

  const infoRequest = application.infoRequest

  const respond = useMutation({
    mutationFn: () =>
      respondToInfoRequest(application.id, {
        message,
        documentIds: (infoRequest.items ?? []).map((item) =>
          application.documents?.find((document) => document.code === item.code)?.id,
        ).filter(Boolean),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', application.id] })
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
    },
  })

  const daysLeft = infoRequest.deadlineAt
    ? Math.ceil((new Date(infoRequest.deadlineAt) - new Date()) / 86_400_000)
    : null

  return (
    <Card className="border-warning-600/40 border p-6">
      <div className="flex items-start gap-3">
        <MessageCircleQuestion aria-hidden="true" className="text-warning-600 mt-1 size-6 shrink-0" />
        <div className="min-w-0 flex-1">
          <h2 className="text-h3 font-semibold">{t('account.infoRequestHeading')}</h2>
          <p className="text-neutral-700 mt-1 text-small">{t('account.infoRequestIntro')}</p>

          <p className="text-neutral-900 mt-4">{localize(infoRequest.message, language)}</p>

          {infoRequest.items?.length ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {infoRequest.items.map((item) => (
                <li key={item.code}>
                  <Badge tone="warning">{localize(item.label, language)}</Badge>
                </li>
              ))}
            </ul>
          ) : null}

          {daysLeft !== null && !infoRequest.respondedAt ? (
            <p
              className={
                daysLeft <= 1
                  ? 'text-danger-600 mt-4 flex items-center gap-2 text-small font-medium'
                  : 'text-neutral-700 mt-4 flex items-center gap-2 text-small'
              }
            >
              <Clock aria-hidden="true" className="size-4" />
              {t('account.infoDeadline', { date: formatDate(infoRequest.deadlineAt, language) })}
            </p>
          ) : null}

          {infoRequest.respondedAt ? (
            <Alert tone="success" className="mt-4">
              {t('account.infoResponded')}
            </Alert>
          ) : (
            <div className="mt-6">
              <Textarea
                label={t('account.infoResponseLabel')}
                hint={t('account.infoResponseHint')}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
              <Button
                className="mt-4"
                onClick={respond.mutate}
                loading={respond.isPending}
                disabled={deadlinePassed}
              >
                {t('account.infoSend')}
              </Button>

              {deadlinePassed ? (
                <Alert tone="warning" className="mt-4">
                  {t('account.infoDeadlinePassed')}
                </Alert>
              ) : null}

              {respond.isError ? (
                <Alert tone="danger" className="mt-4">
                  {respond.error?.message ?? t('account.infoSendFailed')}
                </Alert>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}