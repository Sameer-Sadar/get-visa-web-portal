import { LOCALE_META, SUPPORTED_LOCALES } from '@visagate/i18n'
import { cx } from '@visagate/ui/lib/cx.js'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useParams } from 'react-router-dom'

/**
 * Segmented language control (§11.9).
 *
 * Rendered as real `<Link>`s rather than buttons for two reasons: the `href`
 * is what search engines follow for `hreflang` alternates, and a client-side
 * navigation keeps the mounted page — and therefore any half-filled form
 * state — alive across the switch (§3.3).
 *
 * Only the path is swapped; the rest of the URL is left untouched.
 */
export function LanguageSwitcher({ variant = 'inline', className }) {
  const { t, i18n } = useTranslation()
  const { locale } = useParams()
  const { pathname, search, hash } = useLocation()

  const pathFor = (target) => {
    const withoutLocale = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), '')
    return `/${target}${withoutLocale}${search}${hash}`
  }

  return (
    <ul
      aria-label={t('common.language')}
      className={cx('flex items-center gap-1', className)}
    >
      {SUPPORTED_LOCALES.map((code) => {
        const meta = LOCALE_META[code]
        const isCurrent = code === locale

        return (
          <li key={code}>
            <Link
              to={pathFor(code)}
              hrefLang={code}
              lang={code}
              aria-current={isCurrent ? 'true' : undefined}
              onClick={() => i18n.changeLanguage(code)}
              className={cx(
                'inline-flex min-h-11 items-center rounded-input px-3 text-small font-semibold',
                'transition-colors duration-200',
                variant === 'official'
                  ? isCurrent
                    ? 'text-primary-700 underline decoration-2 underline-offset-4'
                    : 'text-neutral-700 hover:text-primary-700'
                  : isCurrent
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900',
                variant === 'compact' && 'min-h-9 px-2.5',
                variant === 'official' && 'min-h-9 px-2',
              )}
            >
              {variant === 'compact' || variant === 'official' ? meta.shortLabel : meta.nativeLabel}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}