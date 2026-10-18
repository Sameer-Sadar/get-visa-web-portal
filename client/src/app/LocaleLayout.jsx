import { useEffect } from 'react'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import { applyDocumentLocale } from '@visagate/i18n'
import { useTranslation } from 'react-i18next'
import { Footer } from '../components/layout/Footer.jsx'
import { Header } from '../components/layout/Header.jsx'
import { SkipLink } from '../components/layout/SkipLink.jsx'
import { CookieConsent } from '../components/domain/CookieConsent.jsx'
import { PageMeta } from './PageMeta.jsx'
import { ErrorBoundary } from './ErrorBoundary.jsx'
import { RouteEffects } from './RouteEffects.jsx'
import { reportHorizontalOverflow } from './dev/overflowDebug.js'

/**
 * Shell for every localized page: skip link, header, the routed page, footer.
 *
 * `html lang`/`dir` and the i18next language are driven from the URL segment so
 * a deep link, a back-button visit and a manual language switch all land in the
 * same state (§11.1).
 */
export default function LocaleLayout() {
  const { locale } = useParams()
  const location = useLocation()
  const { i18n } = useTranslation()

  /* Applicant portal and auth routes hold personal data and must not be
     indexed (§19); public pages get their own head from <PageHeader>. */
  const relativePath = location.pathname.replace(new RegExp(`^/${locale}`), '') || '/'
  const isPrivate = /^\/(account|apply|signin|register|forgot-password|reset-password)/.test(
    relativePath,
  )

  useEffect(() => {
    applyDocumentLocale(locale)
  }, [locale])

  useEffect(() => {
    if (i18n.language !== locale) i18n.changeLanguage(locale)
  }, [locale, i18n])

  useEffect(() => reportHorizontalOverflow(), [])

  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <RouteEffects />
      {/* Sole owner of the robots policy (§19). Deriving it from the URL rather
          than a page prop means an applicant route cannot be indexed by
          omission — React 19 hoists but does not deduplicate, so a second
          robots tag from <PageMeta> would be a duplicate, not an override. */}
      {isPrivate ? <meta name="robots" content="noindex, nofollow" /> : null}
      <PageMeta />

      <Header />

      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {/* Reset on navigation so a crash on one page doesn't persist (§9). */}
        <ErrorBoundary resetKeys={[location.pathname]}>
          <Outlet />
        </ErrorBoundary>
      </main>

      <Footer />
      <CookieConsent />
    </div>
  )
}