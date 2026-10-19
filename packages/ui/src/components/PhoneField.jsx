import { forwardRef, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../lib/cx.js'
import { Field } from './Field.jsx'
import { Select, SelectItem } from './Select.jsx'

/**
 * Phone entry as country calling code + national number (§8).
 * `countries` is passed in so the caller owns the (and future server-owned)
 * list: `[{ code: 'SA', dialCode: '+966', label: 'Saudi Arabia', flag: '🇸🇦' }]`.
 *
 * Pasted values in international format (`+966512345678`) are split across
 * the two inputs instead of being rejected.
 */
export const PhoneField = forwardRef(function PhoneField(
  {
    label,
    hint,
    error,
    required,
    optional,
    hideLabel,
    countries = [],
    value,
    onChange,
    className,
    id,
    ...props
  },
  ref,
) {
  const reactId = useId()
  const { t } = useTranslation('ui')
  const numberId = id ?? `phone-${reactId}`
  const hintId = `${numberId}-hint`
  const errorId = `${numberId}-error`
  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(' ')

  const update = (patch) => {
    const current = value ?? { countryCode: countries[0]?.code ?? '', number: '' }
    onChange({ ...current, ...patch })
  }

  const handleNumber = (raw) => {
    const typed = raw.replace(/[^\d+\s()-]/g, '')
    const match = typed.match(/^\+\d{1,4}/)

    if (match) {
      const dialCode = match[0]
      const matched = countries.find(
        (country) => country.dialCode === dialCode || country.dialCode === `+${dialCode.slice(1)}`,
      )

      if (matched) {
        onChange({
          countryCode: matched.code,
          number: typed.slice(dialCode.length).trimStart(),
        })
        return
      }
    }

    update({ number: typed })
  }

  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={numberId}
        className={cx('text-small text-neutral-900 font-medium', hideLabel && 'sr-only')}
      >
        {label}
        {required ? (
          <>
            <span className="text-danger-600 ms-0.5" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> {t('requiredMarker')}</span>
          </>
        ) : optional ? (
          <span className="text-neutral-700 font-normal"> ({t('optionalMarker')})</span>
        ) : null}
      </label>

      <div className="flex gap-2">
        <div className="w-40 shrink-0">
          <Select
            hideLabel
            value={value?.countryCode}
            onValueChange={(countryCode) => update({ countryCode })}
            aria-label={`${label} — country code`}
          >
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.flag ? <span aria-hidden="true">{country.flag}</span> : null}
                <span>{country.dialCode}</span>
              </SelectItem>
            ))}
          </Select>
        </div>

        <input
          ref={ref}
          id={numberId}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          dir="ltr"
          value={value?.number ?? ''}
          onChange={(event) => handleNumber(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={cx(
            'min-h-11 w-full flex-1 rounded-input border bg-surface px-3 py-2 text-body',
            error ? 'border-danger-600' : 'border-neutral-300',
          )}
          {...props}
        />
      </div>

      {hint ? (
        <p id={hintId} className="text-neutral-700 text-small">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-danger-600 text-small font-medium">
          {error}
        </p>
      ) : null}
    </div>
  )
})