import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes, useParams } from 'react-router-dom'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@visagate/i18n'
import { Container, Section } from '@visagate/ui/Container'
import { Skeleton } from '@visagate/ui/feedback'
import LocaleLayout from './app/LocaleLayout.jsx'
import { NotFoundPage } from './pages/ErrorPages.jsx'

/**
 * Every page lives under a locale prefix so it is linkable and indexable, and
 * so `hreflang` alternates can point at `/en/…` and `/ar/…` (§19).
 * Unsupported or missing prefixes fall back to the default locale.
 *
 * Each screen is a separate chunk (§19 "route-level code-splitting"). Phase 2
 * covers the public site; the applicant portal and auth arrive in Phase 3.
 */

const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const VisaCatalogPage = lazy(() => import('./pages/VisaCatalogPage.jsx'))
const VisaCategoryPage = lazy(() => import('./pages/VisaCategoryPage.jsx'))
const VisaDetailPage = lazy(() => import('./pages/VisaDetailPage.jsx'))
const FinderResultsPage = lazy(() => import('./pages/FinderResultsPage.jsx'))
const TrackApplicationPage = lazy(() => import('./pages/TrackApplicationPage.jsx'))
const VerifyVisaPage = lazy(() => import('./pages/VerifyVisaPage.jsx'))
const HelpPage = lazy(() => import('./pages/HelpPage.jsx'))
const CmsPage = lazy(() => import('./pages/CmsPage.jsx'))
const ComingSoonPage = lazy(() => import('./pages/ComingSoonPage.jsx'))
/* These modules export named components, so each import is mapped to a
   `default` — `lazy()` expects a component, and handing it a module object
   crashes at render time. */
const SignInPage = lazy(() =>
  import('./pages/SignInPage.jsx').then((m) => ({ default: m.SignInPage })),
)
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage.jsx').then((m) => ({ default: m.RegisterPage })),
)
const ForgotPasswordPage = lazy(() =>
  import('./pages/PasswordResetPages.jsx').then((m) => ({ default: m.ForgotPasswordPage })),
)
const MyApplicationsPage = lazy(() => import('./pages/MyApplicationsPage.jsx'))
const ApplicationDetailPage = lazy(() => import('./pages/ApplicationDetailPage.jsx'))
const ApplicationWizardPage = lazy(() => import('./pages/ApplicationWizardPage.jsx'))
const AccountLayout = lazy(() => import('./pages/AccountPages.jsx').then((m) => ({ default: m.AccountLayout })))
const AccountProfilePage = lazy(() => import('./pages/AccountPages.jsx').then((m) => ({ default: m.AccountProfilePage })))
const AccountSecurityPage = lazy(() => import('./pages/AccountPages.jsx').then((m) => ({ default: m.AccountSecurityPage })))
const AccountPrivacyPage = lazy(() => import('./pages/AccountPages.jsx').then((m) => ({ default: m.AccountPrivacyPage })))

const DesignSystemShowcase = import.meta.env.DEV
  ? lazy(() => import('./dev/DesignSystemShowcase.jsx'))
  : null

/** Legal/informational CMS slugs, each with its own route (see below). */
const CMS_SLUGS = ['about', 'terms', 'privacy', 'cookies', 'accessibility']

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${DEFAULT_LOCALE}`} replace />} />

      <Route path=":locale" element={<LocaleGuard />}>
        <Route element={<LocaleLayout />}>
          <Route index element={<Lazy><HomePage /></Lazy>} />

          {/* Discovery */}
          <Route path="visas" element={<Lazy><VisaCatalogPage /></Lazy>} />
          <Route path="visas/category/:categoryKey" element={<Lazy><VisaCategoryPage /></Lazy>} />
          <Route path="visas/:slug" element={<Lazy><VisaDetailPage /></Lazy>} />
          <Route path="find-a-visa" element={<Lazy><FinderResultsPage /></Lazy>} />

          {/* Tracking and verification */}
          <Route path="track" element={<Lazy><TrackApplicationPage /></Lazy>} />
          <Route path="verify/:token" element={<Lazy><VerifyVisaPage /></Lazy>} />

          {/* Help and CMS pages */}
          <Route path="help" element={<Lazy><HelpPage /></Lazy>} />
          <Route path="help/faq" element={<Lazy><HelpPage /></Lazy>} />
          <Route path="help/guides" element={<Lazy><ComingSoonPage /></Lazy>} />
          <Route path="help/contact" element={<Lazy><ComingSoonPage /></Lazy>} />
          {/* One explicit route per CMS slug.
              A `:slug(about|terms|…)` regex parameter silently fails to match
              in React Router 7, which sent every legal page to the 404. The
              slug is passed as a prop because a static path supplies no
              `useParams().slug`. */}
          {CMS_SLUGS.map((slug) => (
            <Route key={slug} path={slug} element={<Lazy><CmsPage slug={slug} /></Lazy>} />
          ))}

          {/* Phase 3: authentication */}
          <Route path="signin" element={<Lazy><SignInPage /></Lazy>} />
          <Route path="register" element={<Lazy><RegisterPage /></Lazy>} />
          <Route path="forgot-password" element={<Lazy><ForgotPasswordPage /></Lazy>} />
          <Route path="reset-password" element={<Lazy><ForgotPasswordPage /></Lazy>} />

          {/* Applicant portal */}
          <Route path="apply/*" element={<Lazy><ApplicationWizardPage /></Lazy>} />
          <Route path="account" element={<Lazy><AccountLayout /></Lazy>}>
            <Route index element={<Navigate to="applications" replace />} />
            <Route path="applications" element={<Lazy><MyApplicationsPage /></Lazy>} />
            <Route
              path="applications/:applicationId"
              element={<Lazy><ApplicationDetailPage /></Lazy>}
            />
            <Route path="profile" element={<Lazy><AccountProfilePage /></Lazy>} />
            <Route path="security" element={<Lazy><AccountSecurityPage /></Lazy>} />
            <Route path="privacy" element={<Lazy><AccountPrivacyPage /></Lazy>} />
            <Route path="travelers" element={<Lazy><ComingSoonPage /></Lazy>} />
            <Route path="notifications" element={<Lazy><ComingSoonPage /></Lazy>} />
            <Route path="payments" element={<Lazy><ComingSoonPage /></Lazy>} />
            <Route path="tickets" element={<Lazy><ComingSoonPage /></Lazy>} />
          </Route>

          {DesignSystemShowcase ? (
            <Route path="dev/design-system" element={<DesignSystemShowcase />} />
          ) : null}

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={`/${DEFAULT_LOCALE}`} replace />} />
    </Routes>
  )
}

function LocaleGuard() {
  const { locale } = useParams()

  if (!SUPPORTED_LOCALES.includes(locale)) {
    return <Navigate to={`/${DEFAULT_LOCALE}`} replace />
  }

  return <Outlet />
}

/** Skeletons while a route chunk loads — never a spinner for a whole page (§9). */
function Lazy({ children }) {
  return (
    <Suspense fallback={<RouteSkeleton />}>
      {children}
    </Suspense>
  )
}

function RouteSkeleton() {
  return (
    <Section>
      <Container>
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-4 h-4 w-1/2" />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      </Container>
    </Section>
  )
}