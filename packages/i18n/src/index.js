import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ICU from 'i18next-icu'
/* Import attributes keep this module loadable from plain Node (the domain
   smoke tests) as well as from Vite. */
import ar from './locales/ar.json' with { type: 'json' }
import en from './locales/en.json' with { type: 'json' }
import uiAr from '@visagate/ui/locales/ar.json' with { type: 'json' }
import uiEn from '@visagate/ui/locales/en.json' with { type: 'json' }

/**
 * Locale lives in the URL (`/en/…`, `/ar/…`) so pages stay linkable and
 * indexable, and so `hreflang` alternates can be generated per page (§19).
 * This object is the single source of truth for what those prefixes mean.
 */
export const SUPPORTED_LOCALES = ['en', 'ar']

export const DEFAULT_LOCALE = 'en'

export const LOCALE_META = {
  en: { label: 'English', nativeLabel: 'English', shortLabel: 'EN', dir: 'ltr', dateLocale: 'en-GB' },
  ar: { label: 'Arabic', nativeLabel: 'العربية', shortLabel: 'عربي', dir: 'rtl', dateLocale: 'ar-SA' },
}

/**
 * Namespaces:
 *   - `translation` — product copy (shared with the staff console)
 *   - `ui`           — design-system strings, owned by @visagate/ui
 *
 * Both locales are bundled rather than lazily fetched: the catalogs are a few
 * KB, and a network round-trip would delay the first paint on 3G (§2 of §19's
 * performance budget).
 */
export const resources = {
  en: { translation: en, ui: uiEn },
  ar: { translation: ar, ui: uiAr },
}

export function createI18n(locale = DEFAULT_LOCALE) {
  if (!i18n.isInitialized) {
    i18n
      .use(ICU)
      .use(initReactI18next)
      .init({
        resources,
        lng: locale,
        fallbackLng: DEFAULT_LOCALE,
        defaultNS: 'translation',
        ns: ['translation', 'ui'],
        interpolation: { escapeValue: false },
        react: { useSuspense: false },
      })
  }

  return i18n
}

/**
 * Applies the locale to the document element: `lang` for screen readers and
 * the browser's hyphenation, `dir` for the RTL mirror (§11). Both attributes
 * belong on the root so assistive tech sees them before any content renders.
 */
export function applyDocumentLocale(locale) {
  const meta = LOCALE_META[locale] ?? LOCALE_META[DEFAULT_LOCALE]
  const root = document.documentElement

  root.lang = meta.dateLocale === 'ar-SA' ? 'ar' : locale
  root.dir = meta.dir
}

export default i18n