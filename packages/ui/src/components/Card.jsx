import { forwardRef } from 'react'
import { cx } from '../lib/cx.js'

export const Card = forwardRef(function Card(
  { as: Component = 'div', interactive = false, className, ...props },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={cx(
        /* `relative` supports the stretched-link pattern used by cards whose
           whole surface is the click target. */
        'bg-surface border-neutral-300 rounded-card relative border shadow-1',
        interactive &&
          'hover:border-primary-700 hover:shadow-2 transition-shadow duration-200 ease-out',
        className,
      )}
      {...props}
    />
  )
})

export const CardHeader = forwardRef(function CardHeader({ className, ...props }, ref) {
  return <div ref={ref} className={cx('flex flex-col gap-1 p-6 pb-0', className)} {...props} />
})

export const CardTitle = forwardRef(function CardTitle({ as: Component = 'h2', className, ...props }, ref) {
  return (
    <Component
      ref={ref}
      className={cx('text-h3 text-neutral-900 font-semibold text-balance', className)}
      {...props}
    />
  )
})

export const CardDescription = forwardRef(function CardDescription({ className, ...props }, ref) {
  return <p ref={ref} className={cx('text-neutral-700 text-small', className)} {...props} />
})

export const CardBody = forwardRef(function CardBody({ className, ...props }, ref) {
  return <div ref={ref} className={cx('p-6', className)} {...props} />
})

export const CardFooter = forwardRef(function CardFooter({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cx('border-neutral-300 flex items-center gap-3 border-t p-6 pt-4', className)}
      {...props}
    />
  )
})