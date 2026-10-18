import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { Check, Circle } from 'lucide-react'
import { forwardRef, useId } from 'react'
import { cx } from '../lib/cx.js'

/* Inline labels for binary/choice controls — the label sits beside the control
   rather than above it, which is the correct pattern for checkbox/radio/switch. */

export const Checkbox = forwardRef(function Checkbox(
  { label, description, error, hideLabel, className, id: providedId, ...props },
  ref,
) {
  const reactId = useId()
  const id = providedId ?? `checkbox-${reactId}`
  const descriptionId = description ? `${id}-description` : undefined

  return (
    <div className={cx('flex flex-col gap-1', className)}>
      <div className="flex items-start gap-3">
        <CheckboxPrimitive.Root
          ref={ref}
          id={id}
          aria-describedby={descriptionId}
          aria-invalid={error ? true : undefined}
          className={cx(
            'border-neutral-300 mt-0.5 grid size-5 shrink-0 place-items-center rounded-[4px] border bg-surface',
            'transition-colors duration-200 hover:border-primary-700',
            'data-[state=checked]:bg-primary-700 data-[state=checked]:border-primary-700',
            'data-[state=checked]:text-white',
            error && 'border-danger-600',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
          {...props}
        >
          <CheckboxPrimitive.Indicator>
            <Check aria-hidden="true" strokeWidth={3} className="size-3.5" />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>

        <label
          htmlFor={id}
          className={cx(
            'text-neutral-900 cursor-pointer text-body',
            hideLabel && 'sr-only',
          )}
        >
          {label}
        </label>
      </div>

      {description ? (
        <p id={descriptionId} className="text-neutral-700 ps-8 text-small">
          {description}
        </p>
      ) : null}
      {error ? <p className="text-danger-600 ps-8 text-small font-medium">{error}</p> : null}
    </div>
  )
})

export const RadioGroup = forwardRef(function RadioGroup(
  { label, description, error, options, name, value, onValueChange, hideLabel, className },
  ref,
) {
  const reactId = useId()
  const id = `radiogroup-${reactId}`
  const descriptionId = description ? `${id}-description` : undefined

  return (
    <fieldset className={cx('flex flex-col gap-2', className)} aria-describedby={descriptionId}>
      {label ? (
        <legend className={cx('text-small text-neutral-900 font-medium', hideLabel && 'sr-only')}>
          {label}
        </legend>
      ) : null}

      <RadioGroupPrimitive.Root
        ref={ref}
        id={id}
        name={name}
        value={value}
        onValueChange={onValueChange}
        className="flex flex-col gap-3"
      >
        {options.map((option) => {
          const optionId = `${id}-${option.value}`

          return (
            <div key={option.value} className="flex items-start gap-3">
              <RadioGroupPrimitive.Item
                id={optionId}
                value={option.value}
                disabled={option.disabled}
                className={cx(
                  'border-neutral-300 text-primary-700 mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border bg-surface',
                  'transition-colors duration-200 hover:border-primary-700',
                  'data-[state=checked]:border-primary-700',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                <RadioGroupPrimitive.Indicator>
                  <Circle aria-hidden="true" className="fill-primary-700 size-2.5 stroke-none" />
                </RadioGroupPrimitive.Indicator>
              </RadioGroupPrimitive.Item>

              <label htmlFor={optionId} className="text-neutral-900 cursor-pointer text-body">
                {option.label}
                {option.description ? (
                  <span className="text-neutral-700 block text-small">{option.description}</span>
                ) : null}
              </label>
            </div>
          )
        })}
      </RadioGroupPrimitive.Root>

      {description ? (
        <p id={descriptionId} className="text-neutral-700 text-small">
          {description}
        </p>
      ) : null}
      {error ? <p className="text-danger-600 text-small font-medium">{error}</p> : null}
    </fieldset>
  )
})

export const Switch = forwardRef(function Switch(
  { label, description, hideLabel, className, id: providedId, ...props },
  ref,
) {
  const reactId = useId()
  const id = providedId ?? `switch-${reactId}`
  const descriptionId = description ? `${id}-description` : undefined

  return (
    <div className={cx('flex items-start justify-between gap-4', className)}>
      <label htmlFor={id} className={cx('cursor-pointer', hideLabel && 'sr-only')}>
        <span className="text-neutral-900 block text-body">{label}</span>
        {description ? (
          <span id={descriptionId} className="text-neutral-700 block text-small">
            {description}
          </span>
        ) : null}
      </label>

      <SwitchPrimitive.Root
        ref={ref}
        id={id}
        aria-describedby={descriptionId}
        className={cx(
          'bg-neutral-300 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-pill',
          'transition-colors duration-200',
          'data-[state=checked]:bg-primary-700',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cx(
            'block size-5 translate-x-0.5 rounded-full bg-white shadow-1 transition-transform duration-200',
            'data-[state=checked]:translate-x-5.5',
          )}
        />
      </SwitchPrimitive.Root>
    </div>
  )
})