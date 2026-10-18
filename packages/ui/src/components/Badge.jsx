import { forwardRef } from 'react'
import { cx } from '../lib/cx.js'

const TONES = {
  neutral: 'bg-neutral-50 text-neutral-700 border-neutral-300',
  primary: 'bg-primary-100 text-primary-700 border-transparent',
  accent: 'bg-accent-500/15 text-accent-500 border-accent-500/30',
  success: 'bg-success-600/10 text-success-600 border-success-600/30',
  warning: 'bg-warning-600/10 text-warning-600 border-warning-600/30',
  danger: 'bg-danger-600/10 text-danger-600 border-danger-600/30',
  info: 'bg-info-600/10 text-info-600 border-info-600/30',
}

const SIZES = {
  s: 'px-2 py-0.5 text-[0.75rem] gap-1',
  m: 'px-2.5 py-1 text-small gap-1.5',
}

export const Badge = forwardRef(function Badge(
  { tone = 'neutral', size = 'm', icon: Icon, className, children, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx(
        'inline-flex items-center rounded-pill border font-medium',
        TONES[tone],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {Icon ? <Icon aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2} /> : null}
      {children}
    </span>
  )
})