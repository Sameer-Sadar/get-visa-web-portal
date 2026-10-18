import { useTranslation } from 'react-i18next'

/**
 * WCAG 2.4.1 bypass block: the first focusable element on every page. It is
 * visually hidden until focused, then pins itself to the top of the viewport.
 */
export function SkipLink({ targetId = 'main-content' }) {
  const { t } = useTranslation()

  return (
    <a
      href={`#${targetId}`}
      className="sr-only-focusable bg-primary-700 fixed start-4 top-4 z-[100] rounded-input px-4 py-2.5 text-body font-semibold text-white shadow-3"
    >
      {t('common.skipToContent')}
    </a>
  )
}