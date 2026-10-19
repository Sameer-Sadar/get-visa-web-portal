import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../lib/cx.js'
import { CircleAlert } from 'lucide-react'

const CONTROL =
  'w-full min-h-11 rounded-input border bg-surface px-3 py-2 text-body text-neutral-900 ' +
  'placeholder:text-neutral-700/60 transition-colors duration-200 ' +
  'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-700 ' +
  'read-only:bg-neutral-50'

const CONTROL_OK = 'border-neutral-300 hover:border-neutral-700/60 focus:border-primary-700'
const CONTROL_ERR = 'border-danger-600 hover:border-danger-600'

/**
 * Shared field shell: label above the control (never placeholder-only, §8),
 * hint, and an error message tied to the control with `aria-describedby`.
 *
 * Children receive the accessibility wiring so each input stays thin:
 *   <Field label="…">{({ controlProps }) => <input {...controlProps} />}</Field>
 */
export function Field({
  label,
  hint,
  error,
  required = false,
  optional = false,
  hideLabel = false,
  labelSuffix,
  id: providedId,
  className,
  children,
}) {
  const reactId = useId()
  /* A caller-supplied id keeps anchors stable — the wizard's error summary
     links to `#field-<key>`, which a generated id could not satisfy. */
  const controlId = providedId ?? `field-${reactId}`
  const hintId = `${controlId}-hint`
  const errorId = `${controlId}-error`
  const { t } = useTranslation('ui')

  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(' ')

  const controlProps = {
    id: controlId,
    'aria-describedby': describedBy || undefined,
    'aria-invalid': error ? true : undefined,
    'aria-required': required || undefined,
    className: cx(CONTROL, error ? CONTROL_ERR : CONTROL_OK),
  }

  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      {label ? (
        <label
          htmlFor={controlId}
          className={cx(
            'text-small text-neutral-900 font-medium',
            hideLabel && 'sr-only',
          )}
        >
          {label}
          {required ? (
            <span className="text-danger-600 ms-0.5" aria-hidden="true">
              *
            </span>
          ) : optional ? (
            <span className="text-neutral-700 font-normal"> ({t('optionalMarker')})</span>
          ) : null}
          {required ? <span className="sr-only"> {t('requiredMarker')}</span> : null}
        </label>
      ) : null}

      {labelSuffix ? <div className="text-end">{labelSuffix}</div> : null}

      {typeof children === 'function' ? children(controlProps) : children}

      {hint ? (
        <p id={hintId} className="text-neutral-700 text-small">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={errorId}
          className="text-danger-600 flex items-start gap-1.5 text-small font-medium"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  )
}

export { CONTROL, CONTROL_OK, CONTROL_ERR }