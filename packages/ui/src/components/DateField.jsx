import { forwardRef } from 'react'
import { Field } from './Field.jsx'

/**
 * Gregorian date picker built on the native control — it gives us the OS
 * picker on mobile, correct keyboard behaviour and locale formatting for free
 * (§8 forbids text-mask-only inputs). The visible format hint follows the
 * active locale; an optional Hijri rendering is left to the consumer, which
 * passes `formatHint`.
 *
 * No custom calendar icon: browsers already render one inside the control,
 * and a second one would sit on top of it.
 */
export const DateField = forwardRef(function DateField(
  { label, hint, error, required, optional, hideLabel, min, max, className, id, ...props },
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
      {(controlProps) => (
        <input
          ref={ref}
          type="date"
          min={min}
          max={max}
          {...controlProps}
          {...props}
        />
      )}
    </Field>
  )
})