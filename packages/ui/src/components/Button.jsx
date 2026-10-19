import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cx } from '../lib/cx.js'
import { Spinner } from './Spinner.jsx'

const VARIANTS = {
  primary:
    'bg-primary-700 !text-white hover:bg-primary-600 hover:!text-white active:bg-primary-800 disabled:hover:bg-primary-700 [&_svg]:text-white',
  secondary:
    'border border-neutral-300 bg-surface text-primary-700 hover:border-primary-700 hover:bg-primary-100',
  tertiary:
    'text-primary-700 underline underline-offset-4 hover:text-primary-600',
  destructive: 'bg-danger-600 text-white hover:brightness-110',
  ghost: 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900',
}

/* M/L meet the 44px touch-target guidance from §10; S stays at 36px for dense toolbars. */
const SIZES = {
  s: 'min-h-9 gap-1.5 px-3 text-small font-semibold rounded-input',
  m: 'min-h-11 gap-2 px-4 text-button font-semibold rounded-input',
  l: 'min-h-12 gap-2.5 px-6 text-button font-semibold rounded-input',
}

const BASE =
  'inline-flex items-center justify-center text-center whitespace-nowrap ' +
  'transition-colors duration-200 ease-out select-none ' +
  'disabled:opacity-50 disabled:cursor-not-allowed ' +
  'aria-busy:opacity-70 aria-busy:cursor-progress'

export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'm',
    asChild = false,
    loading = false,
    disabled,
    className,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const Component = asChild ? Slot : 'button'

  /* Slot merges props onto exactly one child element, and `null` still counts
     as a child — so the spinner can only be injected on the non-asChild path. */
  const content = asChild ? (
    children
  ) : (
    <>
      {loading ? <Spinner size="s" className="shrink-0" /> : null}
      {children}
    </>
  )

  return (
    <Component
      ref={ref}
      type={asChild ? undefined : type}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      className={cx(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    >
      {content}
    </Component>
  )
})

export const IconButton = forwardRef(function IconButton(
  { variant = 'ghost', size = 'm', label, className, ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      aria-label={label}
      title={label}
      className={cx('px-0', size === 's' ? 'w-9' : 'w-11', className)}
      {...props}
    />
  )
})