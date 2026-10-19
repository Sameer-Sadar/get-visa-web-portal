import { cx } from '@visagate/ui/lib/cx.js'
import { useTranslation } from 'react-i18next'
import { site } from '../../config/site.js'

/**
 * Wordmark for the portal. The mark is a leaf/crescent monogram in the
 * official digital-green palette — not a state emblem or coat of arms.
 */
export function Logo({ className, showWordmark = true, invert = false }) {
  const { t } = useTranslation()

  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <svg
        viewBox="0 0 40 40"
        role="img"
        aria-label={showWordmark ? undefined : t('brand.name')}
        aria-hidden={showWordmark ? 'true' : undefined}
        focusable="false"
        className="size-10 shrink-0"
      >
        <circle cx="20" cy="20" r="20" fill={invert ? '#ffffff' : 'var(--vg-primary-700)'} />
        <path
          d="M12.5 24.5c4.2-1.2 7.2-4.8 8.1-9.4.8 4.6 3.8 8.2 8 9.4-3.8 2.8-8.7 3.4-12.7 1.6-1.3-.6-2.4-1.4-3.4-2.4Z"
          fill={invert ? 'var(--vg-primary-700)' : '#ffffff'}
        />
        <circle cx="20" cy="13.2" r="2.1" fill="var(--vg-accent-500)" />
      </svg>

      {showWordmark ? (
        <span
          className={cx(
            'text-[1.25rem] leading-none font-semibold tracking-tight',
            invert ? 'text-white' : 'text-neutral-900',
          )}
        >
          {site.brand.name}
        </span>
      ) : null}
    </span>
  )
}
