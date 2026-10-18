import {
  BadgeCheck,
  CircleAlert,
  CircleCheck,
  CircleX,
  CreditCard,
  Hourglass,
  Pencil,
  Slash,
  TimerOff,
  TriangleAlert,
} from 'lucide-react'
import { Badge } from './Badge.jsx'

/**
 * Application lifecycle statuses (PRD §8.1) and their presentation
 * (UX §5.3). Status is never colour-only: every pill carries an icon and a
 * text label, so it survives greyscale, colour blindness and screen readers.
 */
export const APPLICATION_STATUS = {
  DRAFT: { tone: 'neutral', Icon: Pencil, labelKey: 'status.draft' },
  PENDING_PAYMENT: { tone: 'warning', Icon: CreditCard, labelKey: 'status.pendingPayment' },
  SUBMITTED: { tone: 'info', Icon: CircleCheck, labelKey: 'status.submitted' },
  UNDER_REVIEW: { tone: 'info', Icon: Hourglass, labelKey: 'status.underReview' },
  INFO_REQUESTED: { tone: 'warning', Icon: CircleAlert, labelKey: 'status.infoRequested' },
  APPROVED: { tone: 'success', Icon: CircleCheck, labelKey: 'status.approved' },
  ISSUED: { tone: 'success', Icon: BadgeCheck, labelKey: 'status.issued' },
  REJECTED: { tone: 'danger', Icon: CircleX, labelKey: 'status.rejected' },
  WITHDRAWN: { tone: 'neutral', Icon: Slash, labelKey: 'status.withdrawn' },
  CANCELLED: { tone: 'neutral', Icon: Slash, labelKey: 'status.cancelled' },
  EXPIRED: { tone: 'neutral', Icon: TimerOff, labelKey: 'status.expired' },
}

/** Finder verdicts (FR-FND-02). */
export const ELIGIBILITY = {
  ELIGIBLE: { tone: 'success', Icon: CircleCheck, labelKey: 'eligibility.eligible' },
  CONDITIONAL: { tone: 'warning', Icon: TriangleAlert, labelKey: 'eligibility.conditional' },
  NOT_ELIGIBLE: { tone: 'danger', Icon: CircleX, labelKey: 'eligibility.notEligible' },
}

/**
 * i18n key for an application status, derived from the map above so every
 * call site agrees. Deriving it from the status string in each component is
 * how `status.info_requested` ends up on screen instead of "Action required".
 */
export function statusLabelKey(status) {
  return APPLICATION_STATUS[status]?.labelKey ?? null
}

/**
 * Renders a status/eligibility chip. Pass the already-translated label from
 * `labelKey`, or let the component resolve it via `useTranslation`.
 */
export function StatusPill({ status, map = APPLICATION_STATUS, label, className, ...props }) {
  const config = map[status]
  if (!config) return null

  return (
    <Badge tone={config.tone} icon={config.Icon} className={className} {...props}>
      {label}
    </Badge>
  )
}