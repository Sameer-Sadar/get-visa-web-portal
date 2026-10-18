import { countries } from '../fixtures/countries.js'
import { localize } from './format.js'

/**
 * Read-back of a saved answer for the review step.
 *
 * Lives outside the component file so `SchemaStepForm` exports only
 * components (fast-refresh rule) and so the logic can be unit-tested.
 */
export function valueToText(field, value, { t, locale } = {}) {
  if (value === undefined || value === null || value === '') return '—'
  if (typeof value === 'boolean') return value ? t('common.yes') : t('common.no')

  if (field.type === 'nationality') {
    return localize(countries.find((country) => country.code === value)?.names, locale)
  }

  if (field.options) {
    return t(field.options.find((option) => option.value === value)?.labelKey ?? '') || '—'
  }

  if (field.type === 'phone') {
    return [value.countryCode && `+${value.countryCode}`, value.number].filter(Boolean).join(' ')
  }

  return String(value)
}