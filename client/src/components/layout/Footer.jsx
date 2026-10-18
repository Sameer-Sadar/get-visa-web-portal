import { Moon, Sun } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { Container } from '@visagate/ui/Container'
import { Divider } from '@visagate/ui/Container'
import { initTheme } from '../../app/theme.js'
import { site, localePath } from '../../config/site.js'
import { LanguageSwitcher } from './LanguageSwitcher.jsx'
import { Logo } from './Logo.jsx'

const LINK =
  'text-neutral-700 hover:text-primary-700 inline-flex min-h-11 items-center text-small ' +
  'transition-colors duration-200 hover:underline'

const HEADING = 'text-neutral-900 text-small font-semibold'

/* `useSyncExternalStore` bindings for the shared theme controller. The
   third argument is the server/SSR snapshot; this app is client-only, so it
   never runs but keeps the hook contract satisfied. */
const subscribeToTheme = (onStoreChange) => initTheme().subscribe(onStoreChange)
const getResolvedTheme = () => initTheme().resolved()
const getLightTheme = () => 'light'

export function Footer() {
  const { t } = useTranslation()
  const { locale } = useParams()

  /* Subscribes to the shared controller rather than holding its own copy, so
     the control stays correct when the preference is `system` and the OS flips
     while the page is open. */
  const theme = useSyncExternalStore(subscribeToTheme, getResolvedTheme, getLightTheme)
  const isDark = theme === 'dark'

  return (
    <footer className="bg-surface border-neutral-300 mt-auto border-t no-print">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="text-neutral-700 mt-3 max-w-xs text-small">
              {t('brand.tagline')}
            </p>
            <LanguageSwitcher className="mt-4" />

            {/* Discreet and in the footer rather than the header: theme is a
                personal preference, not a primary navigation item (§3.3). */}
            <button
              type="button"
              onClick={() => initTheme().toggle()}
              aria-pressed={isDark}
              className="text-neutral-700 hover:bg-neutral-50 mt-2 inline-flex min-h-11 items-center gap-2 rounded-input px-3 text-small transition-colors"
            >
              {isDark ? (
                <Sun aria-hidden="true" className="size-4" />
              ) : (
                <Moon aria-hidden="true" className="size-4" />
              )}
              {isDark ? t('footer.lightMode') : t('footer.darkMode')}
            </button>
          </div>

          <nav aria-labelledby="footer-visas-heading">
            <h2 id="footer-visas-heading" className={HEADING}>
              {t('footer.visas')}
            </h2>
            <ul className="mt-3 flex flex-col">
              {site.visaCategories.map((category) => (
                <li key={category.key}>
                  <Link to={localePath(locale, category.path)} className={LINK}>
                    {t(`category.${category.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {site.footerNav.map((group) => (
            <nav key={group.headingKey} aria-labelledby={`footer-${group.headingKey}`}>
              <h2 id={`footer-${group.headingKey}`} className={HEADING}>
                {t(group.headingKey)}
              </h2>
              <ul className="mt-3 flex flex-col">
                {group.links.map((link) => (
                  <li key={link.key}>
                    <Link to={localePath(locale, link.path)} className={LINK}>
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Operator identity is a legal requirement, not decoration: PRD §12
            requires it on every page, together with a clear statement that the
            service is independent and does not issue visas on behalf of an
            authority. */}
        <section aria-labelledby="footer-operator-heading" className="mt-10">
          <Divider />
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div>
              <h2 id="footer-operator-heading" className={HEADING}>
                {t('footer.operatorIdentity')}
              </h2>
              <address className="text-neutral-700 mt-2 text-small not-italic">
                {site.operator.legalName}
                <br />
                {site.operator.registrationNumber}
                <br />
                {site.operator.address}
              </address>
            </div>

            <div>
              <h3 className={HEADING}>{t('footer.contact')}</h3>
              <ul className="mt-2 flex flex-col">
                <li>
                  <a href={`mailto:${site.operator.supportEmail}`} className={LINK}>
                    {site.operator.supportEmail}
                  </a>
                </li>
                <li>
                  <a href={`tel:${site.operator.supportPhone.replace(/\s/g, '')}`} className={LINK}>
                    <span className="ltr-nums">{site.operator.supportPhone}</span>
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className={HEADING}>{t('footer.independentService')}</h3>
              <p className="text-neutral-700 mt-2 text-small">
                {t(site.operator.independentServiceStatementKey)}
              </p>
            </div>
          </div>
        </section>

        <Divider className="mt-8" />

        <p className="text-neutral-700 mt-6 text-small">
          © <span className="ltr-nums">{new Date().getFullYear()}</span>{' '}
          {site.operator.legalName}. {t('footer.rights')}
        </p>
      </Container>
    </footer>
  )
}