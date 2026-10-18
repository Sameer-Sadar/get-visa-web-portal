import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { forwardRef } from 'react'
import { cx } from '../lib/cx.js'
import { Field } from './Field.jsx'

const TRIGGER =
  'flex min-h-11 w-full items-center justify-between gap-2 rounded-input border bg-surface ' +
  'px-3 py-2 text-body text-neutral-900 transition-colors duration-200 ' +
  'disabled:cursor-not-allowed disabled:bg-neutral-50'

export const Select = forwardRef(function Select(
  { label, hint, error, required, optional, hideLabel, className, children, id, ...props },
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
        <SelectPrimitive.Root {...props}>
          <SelectPrimitive.Trigger
            ref={ref}
            {...controlProps}
            className={cx(
              TRIGGER,
              controlProps.className,
              error
                ? 'border-danger-600 hover:border-danger-600'
                : 'border-neutral-300 hover:border-neutral-700/60',
            )}
          >
            <SelectPrimitive.Value placeholder="" />
            <SelectPrimitive.Icon asChild>
              <ChevronDown aria-hidden="true" className="size-4 shrink-0 opacity-60" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              position="popper"
              sideOffset={6}
              className="bg-surface border-neutral-300 z-50 max-h-80 w-[var(--radix-select-trigger-width)] min-w-40 overflow-hidden rounded-input border shadow-3"
            >
              <SelectPrimitive.Viewport className="scrollbar-thin p-1">
                {children}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
      )}
    </Field>
  )
})

export function SelectItem({ value, children, className, ...props }) {
  return (
    <SelectPrimitive.Item
      value={value}
      className={cx(
        'relative flex cursor-pointer items-center gap-2 rounded-input py-2 pe-8 ps-3',
        'text-body text-neutral-900 select-none outline-none',
        'data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-700',
        'data-[state=checked]:font-semibold',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute end-2 flex items-center">
        <Check aria-hidden="true" className="text-primary-700 size-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

export function SelectGroup({ label, children }) {
  return (
    <SelectPrimitive.Group>
      <SelectPrimitive.Label className="text-neutral-700 px-3 py-1.5 text-small font-semibold">
        {label}
      </SelectPrimitive.Label>
      {children}
    </SelectPrimitive.Group>
  )
}