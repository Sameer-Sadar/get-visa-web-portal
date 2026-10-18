import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@visagate/ui/Button'
import { localePath } from '../../config/site.js'

const STORAGE_KEY = 'visagate.cookie-consent'

/** Reads the stored choice once. Private browsing can throw on access, which
 *  we treat as "no stored choice" rather than an error. */
function hasStoredChoice() {
  try {
    return Boolean(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return false
  }
}

/**
 * Cookie consent (FR-PUB-10): granular categories, nothing pre-selected.
 *
 * Storage is a local record of the *choice*, not a tracking token — the §19
 * "no tokens in localStorage" rule is about session and identity, and this
 * holds no identifier. Essential cookies cannot be switched off, and that is
 * stated rather than implied.
 */
export function CookieConsent() {
  const { t } = useTranslation()
  const { locale } = useParams()

  /* Lazy initialiser: reads storage once during the first render instead of
     setting state from an effect, which would cause a second render pass. */
  const [visible, setVisible] = useState(() => !hasStoredChoice())
  const [analytics, setAnalytics] = useState(false)

  const decide = (acceptAnalytics) => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ essential: true, analytics: acceptAnalytics, at: new Date().toISOString() }),
      )
    } catch {
      /* Non-critical: the banner simply returns next visit. */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <>
      {/* The banner is fixed, so it needs a matching band of space in the flow.
          Without it the banner sits on top of the wizard's sticky Continue bar
          and the account bottom bar — the two controls a user most needs. */}
      <div aria-hidden="true" className="no-print h-40 shrink-0" />

      <div
        role="region"
        aria-label={t('cookies.title')}
        className="bg-surface border-neutral-300 no-print fixed inset-x-0 bottom-0 z-40 border-t shadow-3"
      >
        <div className="mx-auto flex max-w-75rem flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-neutral-900 text-body font-semibold">{t('cookies.title')}</h2>
            <p className="text-neutral-700 mt-1 text-small">{t('cookies.body')}</p>
            <p className="text-neutral-700 mt-1 text-small">
              <Link
                to={localePath(locale, '/cookies')}
                className="text-primary-700 underline underline-offset-4"
              >
                {t('cookies.readPolicy')}
              </Link>
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-3 text-small">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
                className="border-neutral-300 size-5 rounded-[4px] accent-primary-700"
              />
              {t('cookies.analyticsLabel')}
            </label>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => decide(false)}>
                {t('cookies.essentialOnly')}
              </Button>
              <Button onClick={() => decide(analytics)}>{t('cookies.accept')}</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}