import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cx } from '../lib/cx.js'
import { Field } from './Field.jsx'

/**
 * Plain text input. Pass `autoComplete` so browsers can fill it —
 * §8 lists `autocomplete="given-name"` etc. as a requirement.
 */
export const TextField = forwardRef(function TextField(
  { label, hint, error, required, optional, hideLabel, className, id, ...props },
  ref,
) {
  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      hideLabel={hideLabel}
      className={className}
    >
      {(controlProps) => <input ref={ref} type="text" {...controlProps} {...props} />}
    </Field>
  )
})

export function Textarea({
  label,
  hint,
  error,
  required,
  optional,
  hideLabel,
  className,
  rows = 4,
  id,
  ...props
}) {
  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      hideLabel={hideLabel}
      className={className}
    >
      {(controlProps) => <textarea rows={rows} {...controlProps} {...props} />}
    </Field>
  )
}

/** Password field with a show/hide toggle. Paste is always allowed (WCAG 3.3.8). */
export const PasswordField = forwardRef(function PasswordField(
  { label, hint, error, required, optional, hideLabel, className, id, ...props },
  ref,
) {
  const [revealed, setRevealed] = useState(false)
  const { t } = useTranslation('ui')

  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      hideLabel={hideLabel}
      className={className}
    >
      {(controlProps) => (
        <div className="relative">
          <input
            ref={ref}
            type={revealed ? 'text' : 'password'}
            autoComplete="current-password"
            {...controlProps}
            {...props}
            className={cx(controlProps.className, 'pe-28')}
          />
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-pressed={revealed}
            className={cx(
              'text-primary-700 hover:text-primary-600 absolute end-2 top-1/2 inline-flex -translate-y-1/2',
              'min-h-9 items-center gap-1.5 rounded-input px-2 text-small font-medium',
            )}
          >
            {revealed ? (
              <EyeOff aria-hidden="true" className="size-4" />
            ) : (
              <Eye aria-hidden="true" className="size-4" />
            )}
            {revealed ? t('showValue') : t('hideValue')}
          </button>
        </div>
      )}
    </Field>
  )
})