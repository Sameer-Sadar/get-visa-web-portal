import { cx } from '@visagate/ui/lib/cx.js'
import { useTranslation } from 'react-i18next'
import { site } from '../../config/site.js'

/**
 * Original brand mark. Deliberately not a state emblem, seal or coat of arms —
 * PRD §1 requires an independent visual identity that cannot be mistaken for
 * a government authority.
 *
 * `wordmark` is off for icon-only placements (the mobile drawer, favicons).
 */
export function Logo({ className, showWordmark = true }) {
  const { t } = useTranslation()

  return (
    <span className={cx('inline-flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 32 32"
        role="img"
        aria-label={showWordmark ? undefined : t('brand.name')}
        aria-hidden={showWordmark ? 'true' : undefined}
        focusable="false"
        className="size-8 shrink-0"
      >
        {/* An abstract gate: two uprights and a lintel, open at the base. */}
        <rect width="32" height="32" rx="8" fill="var(--vg-primary-700)" />
        <path
          d="M10 11v11M22 11v11M10 16h12"
          stroke="var(--vg-surface)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {showWordmark ? (
        <span className="text-h3 text-neutral-900 font-bold tracking-tight">
          {site.brand.name}
        </span>
      ) : null}
    </span>
  )
}