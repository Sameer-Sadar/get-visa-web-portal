import { cx } from '../lib/cx.js'

/**
 * Indeterminate progress indicator. Use for blocking actions under ~1s;
 * longer waits should show skeletons or a status message (§9 States).
 */
export function Spinner({ className, label, size = 'm' }) {
  const dimension = size === 's' ? 'size-4' : size === 'l' ? 'size-7' : 'size-5'

  return (
    <span
      className={cx('inline-flex items-center', className)}
      role={label ? 'status' : undefined}
    >
      <span
        aria-hidden="true"
        className={cx(
          dimension,
          'animate-spin rounded-full border-2 border-current border-t-transparent opacity-70',
        )}
      />
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  )
}