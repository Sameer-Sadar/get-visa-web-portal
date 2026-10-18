import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
} from 'lucide-react'
import { cx } from '../lib/cx.js'

const ALERT_TONES = {
  info: { Icon: Info, className: 'bg-info-600/10 text-info-600 border-info-600/30' },
  success: { Icon: CircleCheck, className: 'bg-success-600/10 text-success-600 border-success-600/30' },
  warning: {
    Icon: TriangleAlert,
    className: 'bg-warning-600/10 text-warning-600 border-warning-600/30',
  },
  danger: { Icon: CircleAlert, className: 'bg-danger-600/10 text-danger-600 border-danger-600/30' },
}

/**
 * Page or inline banner. Errors are announced assertively; everything else
 * politely, so a page load never interrupts a screen-reader user.
 */
export function Alert({ tone = 'info', title, children, action, className, ...props }) {
  const { Icon, className: toneClass } = ALERT_TONES[tone]

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cx('flex gap-3 rounded-input border p-4', toneClass, className)}
      {...props}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="flex-1 text-neutral-900 text-body">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function ProgressBar({ value = 0, max = 100, label, className, ...props }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={cx('bg-neutral-300/60 h-2 w-full overflow-hidden rounded-pill', className)}
      {...props}
    >
      <div
        className="bg-primary-700 h-full rounded-pill transition-[width] duration-300 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

/** Loading placeholder — preferred over spinners for lists and cards (§9). */
export function Skeleton({ className, ...props }) {
  return (
    <div
      aria-hidden="true"
      className={cx('bg-neutral-300/50 animate-pulse rounded-input', className)}
      {...props}
    />
  )
}

/**
 * Empty state: illustration slot + explanation + one primary action (§7 microcopy).
 *
 * `titleAs` defaults to a paragraph because most empty states sit *below* an
 * existing page heading. Pass `"h1"` only where the state is the whole page
 * (404/403/500), where it has to be the top-level heading.
 */
export function EmptyState({ icon: Icon, title, titleAs: TitleTag = 'p', description, action, className }) {
  return (
    <div
      className={cx(
        'border-neutral-300 flex flex-col items-center gap-3 rounded-card border border-dashed p-10 text-center',
        className,
      )}
    >
      {Icon ? (
        <span className="bg-primary-100 text-primary-700 grid size-12 place-items-center rounded-pill">
          <Icon aria-hidden="true" className="size-6" />
        </span>
      ) : null}
      <div className="max-w-md space-y-1">
        <TitleTag className="text-h3 text-neutral-900 font-semibold">{title}</TitleTag>
        {description ? <p className="text-neutral-700">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}