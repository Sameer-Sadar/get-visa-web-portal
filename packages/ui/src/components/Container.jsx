import { forwardRef } from 'react'
import { cx } from '../lib/cx.js'

/** Max content width is 1200px (75rem) per §5.1 spacing/grid. */
export const Container = forwardRef(function Container(
  { as: Component = 'div', size = 'default', className, ...props },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={cx(
        'mx-auto w-full px-4 sm:px-6',
        size === 'narrow' ? 'max-w-2xl' : size === 'wide' ? 'max-w-90rem' : 'max-w-75rem',
        className,
      )}
      {...props}
    />
  )
})

export function Section({ as: Component = 'section', className, ...props }) {
  return <Component className={cx('py-12 sm:py-16', className)} {...props} />
}

export function Divider({ orientation = 'horizontal', className, ...props }) {
  const horizontal = orientation === 'horizontal'

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cx(
        'bg-neutral-300',
        horizontal ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  )
}