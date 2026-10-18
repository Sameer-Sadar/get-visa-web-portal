import { useTranslation } from 'react-i18next'
import { Alert } from '@visagate/ui/feedback'
import { localize } from '../../lib/format.js'

/**
 * Announcement banner (FR-PUB-08) — policy changes and maintenance notices.
 * Placed above the header so it cannot be missed, and rendered as a `status`
 * region so assistive tech announces it without interrupting.
 */
export function AnnouncementBanner({ announcements = [] }) {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage

  if (announcements.length === 0) return null

  return (
    <div className="no-print flex flex-col">
      {announcements.map((announcement) => (
        <Alert
          key={announcement.id}
          tone={announcement.level === 'warning' ? 'warning' : 'info'}
          title={localize(announcement.title, language)}
        >
          {localize(announcement.body, language)}{' '}
          <span className="sr-only">{t('announcement.label')}</span>
        </Alert>
      ))}
    </div>
  )
}