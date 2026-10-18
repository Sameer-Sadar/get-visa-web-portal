import { useCallback, useEffect, useRef } from 'react'
import { cx } from '../lib/cx.js'
import { Field } from './Field.jsx'

/**
 * One-time-code entry rendered as boxes (§6.4).
 *
 * Accessibility note: this is a *single* real input painted over decorative
 * boxes, not six separate inputs. That keeps one tab stop, native paste,
 * `autocomplete="one-time-code"`, screen-reader announcements and mobile
 * numeric keyboards all working.
 */
export function OtpInput({
  label,
  hint,
  error,
  length = 6,
  value,
  onChange,
  disabled,
  autoFocus = false,
  className,
}) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  const handleChange = useCallback(
    (event) => {
      const digits = event.target.value.replace(/\D/g, '').slice(0, length)
      onChange(digits)
    },
    [length, onChange],
  )

  return (
    <Field label={label} hint={hint} error={error} className={className}>
      {(controlProps) => (
        <div className="relative" onClick={() => inputRef.current?.focus()}>
          <div aria-hidden="true" className="flex gap-2">
            {Array.from({ length }, (_, index) => {
              const char = value?.[index]
              const isActive = index === (value?.length ?? 0)

              return (
                <div
                  key={index}
                  className={cx(
                    'grid size-12 place-items-center rounded-input border text-h2 font-semibold',
                    'sm:size-14',
                    error
                      ? 'border-danger-600'
                      : isActive && value
                        ? 'border-primary-700'
                        : 'border-neutral-300',
                  )}
                >
                  {char ?? ''}
                </div>
              )
            })}
          </div>

          <input
            ref={inputRef}
            {...controlProps}
            value={value ?? ''}
            onChange={handleChange}
            disabled={disabled}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={length}
            dir="ltr"
            className="absolute inset-0 h-full w-full bg-transparent text-transparent caret-primary-700"
            style={{ clipPath: 'inset(0 0 0 0)' }}
          />
        </div>
      )}
    </Field>
  )
}