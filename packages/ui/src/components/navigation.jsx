import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../lib/cx.js'

/* ── Stepper ───────────────────────────────────────────────────────────── */

/**
 * Wizard progress indicator (§6.5): completed, current and upcoming steps.
 * Upcoming steps are non-interactive; the current step is announced via
 * `aria-current="step"`.
 */
export function Stepper({ steps, currentKey, onSelect, className }) {
  const { t } = useTranslation('ui')
  const currentIndex = steps.findIndex((step) => step.key === currentKey)

  return (
    <nav aria-label={t('progressLabel')} className={cx('w-full', className)}>
      <ol className="flex items-center gap-1 sm:gap-2">
        {steps.map((step, index) => {
          const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'todo'
          const isCurrent = state === 'current'
          const interactive = Boolean(onSelect) && state === 'done'

          const content = (
            <>
              <span
                aria-hidden="true"
                className={cx(
                  'grid size-7 shrink-0 place-items-center rounded-pill text-small font-semibold',
                  'transition-colors duration-200',
                  state === 'todo' && 'bg-neutral-50 text-neutral-700 border border-neutral-300',
                  state === 'current' && 'bg-primary-700 text-white',
                  state === 'done' && 'bg-primary-100 text-primary-700',
                )}
              >
                {index + 1}
              </span>
              <span
                className={cx(
                  'hidden text-small sm:block',
                  isCurrent ? 'text-primary-700 font-semibold' : 'text-neutral-700',
                )}
              >
                {step.label}
              </span>
            </>
          )

          return (
            <li key={step.key} className="flex flex-1 items-center gap-1 sm:gap-2">
              {interactive ? (
                <button
                  type="button"
                  onClick={() => onSelect(step.key)}
                  className="hover:text-primary-700 flex items-center gap-1 sm:gap-2"
                >
                  {content}
                </button>
              ) : (
                <span
                  aria-current={isCurrent ? 'step' : undefined}
                  className="flex items-center gap-1 sm:gap-2"
                >
                  {content}
                </span>
              )}

              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cx(
                    'mx-1 h-px flex-1 sm:mx-2',
                    state === 'done' ? 'bg-primary-600' : 'bg-neutral-300',
                  )}
                />
              ) : null}
            </li>
          )
        })}
      </ol>

      <p className="text-neutral-700 mt-2 text-small sm:hidden">
        {t('stepOf', { current: currentIndex + 1, total: steps.length })}
      </p>
    </nav>
  )
}

/* ── Breadcrumbs (depth ≥ 2 pages, §3.3) ───────────────────────────────── */

export function Breadcrumbs({ items, className }) {
  const labelId = useId()

  return (
    <nav aria-labelledby={labelId} className={cx('min-w-0', className)}>
      <ol className="flex flex-wrap items-center gap-1 text-small">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={item.key ?? item.label} className="flex items-center gap-1">
              {index > 0 ? (
                <ChevronRight
                  aria-hidden="true"
                  className="text-neutral-300 size-4 rtl:rotate-180"
                />
              ) : null}

              {isLast || !item.to ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={cx(isLast && 'text-neutral-900 font-medium')}
                >
                  {item.label}
                </span>
              ) : (
                <a href={item.to} className="text-primary-700 hover:underline">
                  {item.label}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/* ── Pagination ────────────────────────────────────────────────────────── */

export function Pagination({ page, pageCount, onPageChange, className }) {
  const { t } = useTranslation('ui')

  if (pageCount <= 1) return null

  return (
    <nav
      aria-label={t('paginationLabel')}
      className={cx('flex items-center justify-between gap-4', className)}
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="border-neutral-300 text-neutral-900 hover:border-primary-700 inline-flex min-h-11 items-center gap-1 rounded-input border px-3 text-body disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
        {t('previous')}
      </button>

      <p className="text-neutral-700 text-small">
        {t('pageOf', { current: page, total: pageCount })}
      </p>

      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        className="border-neutral-300 text-neutral-900 hover:border-primary-700 inline-flex min-h-11 items-center gap-1 rounded-input border px-3 text-body disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t('next')}
        <ChevronRight aria-hidden="true" className="size-4 rtl:rotate-180" />
      </button>
    </nav>
  )
}