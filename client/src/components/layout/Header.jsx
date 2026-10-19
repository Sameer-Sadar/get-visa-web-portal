import { ChevronDown, Menu, User } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useParams } from 'react-router-dom'
import { Button } from '@visagate/ui/Button'
import { Drawer, DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@visagate/ui/overlays'
import { cx } from '@visagate/ui/lib/cx.js'
import { site, localePath } from '../../config/site.js'
import { useCurrentUser } from '../../app/auth.js'
import { LanguageSwitcher } from './LanguageSwitcher.jsx'
import { Logo } from './Logo.jsx'
import { ThemeSwitcher } from './ThemeSwitcher.jsx'

const NAV_ITEM =
  'text-neutral-700 hover:text-primary-700 rounded-input px-3 py-2 text-body font-medium ' +
  'transition-colors duration-200 aria-[current=page]:text-primary-700 aria-[current=page]:font-semibold'

export function Header() {
  const { t } = useTranslation()
  const { locale } = useParams()
  const user = useCurrentUser()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <header className="bg-surface sticky top-0 z-40 shadow-1 no-print">
      <div className="mx-auto flex h-[4.5rem] max-w-75rem items-center gap-4 px-4 sm:px-6">
        <Link
          to={localePath(locale)}
          className="rounded-input"
          aria-label={t('brand.name')}
        >
          <Logo />
        </Link>

        <nav aria-label={t('header.primaryNavLabel')} className="hidden lg:flex lg:flex-1 lg:items-center">
          <ul className="flex items-center gap-1">
            {site.primaryNav.map((item) => (
              <li key={item.key}>
                <NavLink to={localePath(locale, item.path)} className={NAV_ITEM}>
                  {t(`nav.${item.key}`)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-3 lg:ms-0">
          <ThemeSwitcher className="hidden lg:inline-flex" />
          <LanguageSwitcher
            variant="official"
            className="hidden lg:flex lg:items-center"
          />

          <div className="hidden lg:flex lg:items-center lg:gap-2">
            {user ? <AccountMenu locale={locale} /> : <AuthActions locale={locale} />}
          </div>

          <ThemeSwitcher variant="icon" className="lg:hidden" />
          <LanguageSwitcher variant="official" className="lg:hidden" />

          <Button
            variant="ghost"
            size="m"
            className="w-11 lg:hidden"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <Menu aria-hidden="true" className="size-5" />
            <span className="sr-only">{t('common.menu')}</span>
          </Button>
        </div>
      </div>
      <div className="h-0.5 w-full bg-linear-to-r from-primary-700 via-accent-500 to-primary-700" />

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} title={t('common.menu')}>
        <nav aria-label={t('header.drawerNavLabel')}>
          <ul className="flex flex-col gap-1">
            {site.primaryNav.map((item) => (
              <li key={item.key}>
                <NavLink
                  to={localePath(locale, item.path)}
                  onClick={() => setDrawerOpen(false)}
                  className={cx(
                    'text-neutral-900 hover:bg-primary-100 block min-h-11 rounded-input px-3 py-3',
                    'text-body font-medium transition-colors duration-200',
                    'aria-[current=page]:bg-primary-100 aria-[current=page]:text-primary-700',
                  )}
                >
                  {t(`nav.${item.key}`)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-neutral-300 mt-6 border-t pt-6">
          <p className="text-neutral-700 mb-3 text-small font-semibold">{t('theme.label')}</p>
          <ThemeSwitcher />
        </div>

        <div className="border-neutral-300 mt-6 border-t pt-6">
          {user ? (
            <ul className="flex flex-col gap-1">
              <li>
                <Link
                  to={localePath(locale, '/account/applications')}
                  onClick={() => setDrawerOpen(false)}
                  className="text-neutral-900 hover:bg-primary-100 block min-h-11 rounded-input px-3 py-3"
                >
                  {t('nav.myApplications')}
                </Link>
              </li>
              <li>
                <Link
                  to={localePath(locale, '/account/profile')}
                  onClick={() => setDrawerOpen(false)}
                  className="text-neutral-900 hover:bg-primary-100 block min-h-11 rounded-input px-3 py-3"
                >
                  {t('nav.myProfile')}
                </Link>
              </li>
            </ul>
          ) : (
            <div className="flex flex-col gap-3">
              <Button
                variant="secondary"
                onClick={() => setDrawerOpen(false)}
                asChild
              >
                <Link to={localePath(locale, '/signin')}>{t('nav.signIn')}</Link>
              </Button>
              <Button asChild onClick={() => setDrawerOpen(false)}>
                <Link to={localePath(locale, '/register')}>{t('nav.createAccount')}</Link>
              </Button>
            </div>
          )}
        </div>
      </Drawer>
    </header>
  )
}

function AuthActions({ locale }) {
  const { t } = useTranslation()

  return (
    <>
      <Button variant="secondary" asChild>
        <Link to={localePath(locale, '/signin')}>{t('nav.signIn')}</Link>
      </Button>
      <Button asChild>
        <Link to={localePath(locale, '/register')}>{t('nav.createAccount')}</Link>
      </Button>
    </>
  )
}

function AccountMenu({ locale }) {
  const { t } = useTranslation()
  const user = useCurrentUser()

  return (
    <DropdownMenu
      trigger={
        <Button variant="secondary" className="justify-between" aria-label={t('nav.myProfile')}>
          <span className="flex items-center gap-2">
            <User aria-hidden="true" className="size-4" />
            {user?.displayName ?? t('nav.myProfile')}
          </span>
          <ChevronDown aria-hidden="true" className="size-4 opacity-60" />
        </Button>
      }
    >
      <DropdownMenuLabel>{user?.email ?? t('nav.myProfile')}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link to={localePath(locale, '/account/applications')}>
          {t('nav.myApplications')}
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to={localePath(locale, '/account/profile')}>{t('nav.myProfile')}</Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to={localePath(locale, '/account/security')}>{t('nav.security')}</Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link to={localePath(locale, '/signout')}>{t('nav.signOut')}</Link>
      </DropdownMenuItem>
    </DropdownMenu>
  )
}
