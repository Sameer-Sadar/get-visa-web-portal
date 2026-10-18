import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, FileText, MessageCircleQuestion } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { Alert, EmptyState, Skeleton } from '@visagate/ui/feedback'
import { Badge } from '@visagate/ui/Badge'
import { Button } from '@visagate/ui/Button'
import { Card } from '@visagate/ui/Card'
import { Container, Section } from '@visagate/ui/Container'
import { StatusPill, statusLabelKey } from '@visagate/ui/StatusPill'
import { cx } from '@visagate/ui/lib/cx.js'
import { PageHeader } from '../components/domain/PageHeader.jsx'
import { getMyApplications, withdrawApplication } from '../services/applicationsService.js'
import { visaTypeBySlug } from '../fixtures/visaCatalog.js'
import { formatDate, localize } from '../lib/format.js'
import { localePath } from '../config/site.js'

const FILTERS = [
  { key: 'all', labelKey: 'account.filterAll' },
  { key: 'action', labelKey: 'account.filterAction' },
  { key: 'inProgress', labelKey: 'account.filterInProgress' },
  { key: 'completed', labelKey: 'account.filterCompleted' },
]

/** Statuses where the applicant still has something to do. */
const ACTION_REQUIRED = new Set(['DRAFT', 'PENDING_PAYMENT', 'INFO_REQUESTED'])
const IN_PROGRESS = new Set(['SUBMITTED', 'UNDER_REVIEW', 'APPROVED'])
const COMPLETED = new Set(['ISSUED', 'REJECTED', 'WITHDRAWN', 'CANCELLED', 'EXPIRED'])

/**
 * "My applications" (§6.7).
 *
 * The action-required band is pinned to the top whenever an application is
 * waiting on the applicant — that is the single most important thing on the
 * page, and burying it in a list is how deadlines get missed.
 */
export default function MyApplicationsPage() {
  const { t, i18n } = useTranslation()
  const { locale } = useParams()
  const language = i18n.resolvedLanguage
  const [filter, setFilter] = useState('all')

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: getMyApplications,
  })

  const grouped = useMemo(
    () => ({
      action: applications.filter((application) => ACTION_REQUIRED.has(application.status)),
      rest: applications.filter((application) => !ACTION_REQUIRED.has(application.status)),
    }),
    [applications],
  )

  const filtered = useMemo(() => {
    const pool = [...grouped.action, ...grouped.rest]

    if (filter === 'action') return grouped.action
    if (filter === 'inProgress') return pool.filter((application) => IN_PROGRESS.has(application.status))
    if (filter === 'completed') return pool.filter((application) => COMPLETED.has(application.status))
    return pool
  }, [filter, grouped])

  return (
    <>
      <PageHeader
        title={t('account.applicationsTitle')}
        description={t('account.applicationsSubtitle')}
        breadcrumbs={[{ label: t('account.nav.applications'), key: 'applications' }]}
        actions={
          <Button asChild>
            <Link to={localePath(locale, '/find-a-visa')}>
              {t('account.startNew')}
              <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
            </Link>
          </Button>
        }
      />

      <Section>
        <Container>
          {grouped.action.length > 0 ? (
            <section aria-labelledby="action-required" className="mb-8">
              <h2 id="action-required" className="text-h3 mb-3 font-semibold">
                {t('account.actionRequiredHeading')}
              </h2>

              <ul className="border-warning-600/30 bg-warning-600/10 space-y-3 rounded-card border p-4">
                {grouped.action.map((application) => (
                  <li key={application.id}>
                    <ApplicationCard application={application} language={language} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="border-neutral-300 scrollbar-none mb-6 flex gap-1 overflow-x-auto border-b">
            {FILTERS.map((entry) => {
              const isActive = filter === entry.key
              const count =
                entry.key === 'all'
                  ? applications.length
                  : entry.key === 'action'
                    ? grouped.action.length
                    : applications.filter((application) =>
                        entry.key === 'inProgress'
                          ? IN_PROGRESS.has(application.status)
                          : COMPLETED.has(application.status),
                      ).length

              return (
                <button
                  key={entry.key}
                  type="button"
                  onClick={() => setFilter(entry.key)}
                  aria-current={isActive ? 'true' : undefined}
                  className={cx(
                    'inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-4 py-2 text-body font-medium transition-colors',
                    isActive
                      ? 'border-primary-700 text-primary-700'
                      : 'text-neutral-700 hover:text-neutral-900 border-transparent',
                  )}
                >
                  {t(entry.labelKey)}
                  <Badge tone={isActive ? 'primary' : 'neutral'} size="s">
                    <span className="ltr-nums">{count}</span>
                  </Badge>
                </button>
              )
            })}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((index) => (
                <Skeleton key={index} className="h-28" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={t('account.emptyTitle')}
              description={t('account.emptyDescription')}
              action={
                <Button asChild>
                  <Link to={localePath(locale, '/find-a-visa')}>{t('account.emptyCta')}</Link>
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3">
              {filtered.map((application) => (
                <li key={application.id}>
                  <ApplicationCard application={application} language={language} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>
    </>
  )
}

/**
 * ApplicationCard (§6.7): visa type, travelers, reference, status, next step,
 * and the single primary action for that state.
 */
export function ApplicationCard({ application, language }) {
  const { t } = useTranslation()
  const { locale } = useParams()
  const queryClient = useQueryClient()

  const visaType = visaTypeBySlug.get(application.visaTypeSlug)

  const withdraw = useMutation({
    mutationFn: () => withdrawApplication(application.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-applications'] }),
  })

  const { actionTo, actionLabelKey, actionVariant } = primaryAction(application)

  return (
    <Card interactive={false} className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill
              status={application.status}
              label={t(statusLabelKey(application.status))}
            />
            {application.reference ? (
              <span className="text-neutral-700 ltr-nums font-mono text-small">
                {application.reference}
              </span>
            ) : null}
          </div>

          <h3 className="text-h3 mt-2 font-semibold">
            {visaType ? localize(visaType.name, language) : application.visaTypeSlug}
          </h3>

          <p className="text-neutral-700 mt-1 text-small">
            {application.travelerCount > 1
              ? t('feeBreakdown.travelerCount', { count: application.travelerCount })
              : (application.travelers?.[0]?.fullName ?? t('account.applicantOnly'))}
            {application.submittedAt
              ? ` · ${t('account.submittedOn', { date: formatDate(application.submittedAt, language) })}`
              : ''}
          </p>

          {application.nextStep ? (
            <p className="text-neutral-900 mt-2">{localize(application.nextStep, language)}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          {actionTo ? (
            <Button variant={actionVariant} asChild>
              <Link to={localePath(locale, actionTo)}>{t(actionLabelKey)}</Link>
            </Button>
          ) : null}

          {application.status === 'DRAFT' && application.lastSavedAt ? (
            <p className="text-neutral-700 text-small">
              {t('account.lastSaved', { date: formatDate(application.lastSavedAt, language) })}
            </p>
          ) : null}

          {['DRAFT', 'PENDING_PAYMENT', 'SUBMITTED', 'UNDER_REVIEW', 'INFO_REQUESTED'].includes(
            application.status,
          ) ? (
            <button
              type="button"
              onClick={() => withdraw.mutate()}
              disabled={withdraw.isPending}
              className="text-neutral-700 hover:text-danger-600 text-small"
            >
              {t('account.withdraw')}
            </button>
          ) : null}
        </div>
      </div>

      {withdraw.isError ? (
        <Alert tone="danger" className="mt-4">
          {withdraw.error?.message ?? t('account.withdrawFailed')}
        </Alert>
      ) : null}

      {application.infoRequest ? (
        <p className="text-warning-600 mt-3 flex items-start gap-2 text-small">
          <MessageCircleQuestion aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {localize(application.infoRequest.message, language)}
        </p>
      ) : null}
    </Card>
  )
}

/** One primary action per state, so the card never offers competing CTAs. */
function primaryAction(application) {
  switch (application.status) {
    case 'DRAFT':
      return {
        actionTo: `/apply/${application.id}`,
        actionLabelKey: 'account.continueDraft',
        actionVariant: 'primary',
      }
    case 'PENDING_PAYMENT':
      return {
        actionTo: `/apply/${application.id}/payment`,
        actionLabelKey: 'account.payNow',
        actionVariant: 'primary',
      }
    case 'INFO_REQUESTED':
      return {
        actionTo: `/account/applications/${application.id}`,
        actionLabelKey: 'account.respond',
        actionVariant: 'primary',
      }
    case 'ISSUED':
      return {
        actionTo: `/account/applications/${application.id}`,
        actionLabelKey: 'account.downloadVisa',
        actionVariant: 'primary',
      }
    default:
      return {
        actionTo: `/account/applications/${application.id}`,
        actionLabelKey: 'account.viewDetails',
        actionVariant: 'secondary',
      }
  }
}