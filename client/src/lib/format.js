import { LOCALE_META } from '@visagate/i18n'

/**
 * Resolves a `LocalizedText` field (`{ en, ar }` — see
 * `4-Backend-Schema.md` §1.2) for the active locale, falling back to English
 * rather than rendering an empty string.
 */
export function localize(value, locale = 'en') {
  if (value == null) return ''
  if (typeof value === 'string') return value

  return value[locale] ?? value[DEFAULT_FALLBACK] ?? ''
}

const DEFAULT_FALLBACK = 'en'

/** BCP 47 tag for Intl formatters, so Arabic gets Arabic digits and ordering. */
export function intlLocale(locale = 'en') {
  return LOCALE_META[locale]?.dateLocale ?? LOCALE_META.en.dateLocale
}

/**
 * §11.6: Western digits are the default, in both languages. The Arabic locale
 * would otherwise render Arabic-Indic digits (٣٩١ ر.س.), which is a
 * user *setting*, not the default — and mixing the two in one table of fees
 * makes amounts hard to compare.
 *
 * To offer Eastern Arabic digits, read the user's preference and pass it here;
 * everything downstream (fees, references, dates) follows in one change.
 */
const NUMBERING_SYSTEM = 'latn'

export function formatMoney(amountMinor, currency = 'SAR', locale = 'en') {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: 'currency',
    currency,
    numberingSystem: NUMBERING_SYSTEM,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100)
}

/** Unambiguous dates — "12 Oct 2026" / "١٢ أكتوبر ٢٠٢٦" (§7 microcopy). */
export function formatDate(value, locale = 'en', options = {}) {
  if (!value) return ''

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
    numberingSystem: NUMBERING_SYSTEM,
    ...options,
  }).format(date)
}

export function formatDateRange(startValue, endValue, locale = 'en') {
  if (!startValue) return ''

  const start = formatDate(startValue, locale)
  if (!endValue) return start

  return `${start} – ${formatDate(endValue, locale)}`
}

/** "3 business days" / "about 24 hours" — driven by the SLA in hours. */
export function formatSla(hours, locale = 'en', t) {
  if (!t) {
    if (hours < 24) return `${hours} h`
    return `${Math.round(hours / 24)} ${locale === 'ar' ? 'يوم' : 'days'}`
  }

  return hours < 24
    ? t('visa.slaHours', { count: hours })
    : t('visa.slaDays', { count: Math.round(hours / 24) })
}

export function formatDays(days, locale = 'en', t) {
  if (!t) return `${days} ${locale === 'ar' ? 'يوم' : 'days'}`

  return t('visa.durationDays', { count: days })
}

/** Masks an identifier for display: A•••••4521 (§13). */
export function maskValue(value, visible = 4) {
  if (!value) return ''
  if (value.length <= visible) return '•'.repeat(value.length)

  return `${'•'.repeat(Math.max(3, value.length - visible))}${value.slice(-visible)}`
}