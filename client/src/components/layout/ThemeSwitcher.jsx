import { Moon, Sun } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '@visagate/ui/lib/cx.js'
import { initTheme } from '../../app/theme.js'

const subscribeToTheme = (onStoreChange) => initTheme().subscribe(onStoreChange)
const getResolvedTheme = () => initTheme().resolved()
const getLightTheme = () => 'light'

const OPTIONS = [
  { value: 'light', Icon: Sun, labelKey: 'theme.light' },
  { value: 'dark', Icon: Moon, labelKey: 'theme.dark' },
]

/**
 * Light / dark control. Shares the same theme controller as the footer so
 * a choice in the nav bar is reflected everywhere.
 */
export function ThemeSwitcher({ variant = 'segmented', className }) {
  const { t } = useTranslation()
  const theme = useSyncExternalStore(subscribeToTheme, getResolvedTheme, getLightTheme)

  if (variant === 'icon') {
    const isDark = theme === 'dark'
    return (
      <button
        type="button"
        onClick={() => initTheme().toggle()}
        aria-pressed={isDark}
        aria-label={isDark ? t('theme.light') : t('theme.dark')}
        title={isDark ? t('theme.light') : t('theme.dark')}
        className={cx(
          'inline-flex size-11 items-center justify-center rounded-input text-neutral-700',
          'transition-colors hover:bg-neutral-50 hover:text-primary-700',
          className,
        )}
      >
        {isDark ? <Sun aria-hidden="true" className="size-5" /> : <Moon aria-hidden="true" className="size-5" />}
      </button>
    )
  }

  return (
    <div
      role="group"
      aria-label={t('theme.label')}
      className={cx('bg-neutral-50 inline-flex items-center rounded-pill p-0.5', className)}
    >
      {OPTIONS.map(({ value, Icon, labelKey }) => {
        const isCurrent = theme === value

        return (
          <button
            key={value}
            type="button"
            aria-pressed={isCurrent}
            onClick={() => initTheme().set(value)}
            className={cx(
              'inline-flex min-h-9 items-center gap-1.5 rounded-pill px-3 text-small font-semibold',
              'transition-colors duration-200',
              isCurrent
                ? 'bg-surface text-primary-700 shadow-1'
                : 'text-neutral-700 hover:text-primary-700',
            )}
          >
            <Icon aria-hidden="true" className="size-3.5" />
            {t(labelKey)}
          </button>
        )
      })}
    </div>
  )
}
