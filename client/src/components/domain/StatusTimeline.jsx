import { StatusPill, statusLabelKey } from '@visagate/ui/StatusPill'
import { Timeline } from '@visagate/ui/Timeline'
import { useTranslation } from 'react-i18next'
import { formatDate, localize } from '../../lib/format.js'

/**
 * Application lifecycle timeline (FR-TRK-02, §6.8).
 *
 * History is shown up to the current status; the remaining steps are shown as
 * "todo" so the applicant can see what still happens rather than guessing.
 */
const UPCOMING = ['UNDER_REVIEW', 'APPROVED', 'ISSUED']

export function StatusTimeline({ status, history = [], processedAt, locale = 'en' }) {
  const { t } = useTranslation()

  const reached = new Set(history.map((entry) => entry.status))
  reached.add(status)

  const ordered = [...history]
  const lastStatus = history.at(-1)?.status

  const steps = [
    ...ordered.map((entry) => ({
      key: entry.status,
      status: entry.status,
      date: entry.at,
      state: 'done',
    })),
    ...UPCOMING.filter((upcoming) => !reached.has(upcoming)).map((upcoming) => ({
      key: upcoming,
      status: upcoming,
      date: null,
      state: 'todo',
    })),
  ]

  return (
    <div className="flex flex-col gap-4">
      <StatusPill status={status} label={t(statusLabelKey(status))} className="self-start" />

      <Timeline
        items={steps.map((step) => ({
          key: step.key,
          label: t(statusLabelKey(step.status)),
          date: step.date ? formatDate(step.date, locale) : undefined,
          /* The last completed step gets the "you are here" wording. */
          description:
            step.status === lastStatus && processedAt ? localize(processedAt, locale) : undefined,
          state: step.state,
        }))}
      />
    </div>
  )
}