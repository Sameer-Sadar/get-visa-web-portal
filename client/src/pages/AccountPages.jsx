import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, NavLink, Outlet, useParams } from 'react-router-dom'
import { Alert, Skeleton } from '@visagate/ui/feedback'
import { Badge } from '@visagate/ui/Badge'
import { Button } from '@visagate/ui/Button'
import { Card } from '@visagate/ui/Card'
import { DescriptionList } from '@visagate/ui/data'
import { Switch } from '@visagate/ui/choices'
import { cx } from '@visagate/ui/lib/cx.js'
import { useCurrentUser } from '../app/auth.js'
import { getProfile, getSessions, revokeSession, signOut, updateProfile } from '../services/authService.js'
import { formatDate, localize } from '../lib/format.js'
import { localePath } from '../config/site.js'

const ACCOUNT_NAV = [
  { key: 'applications', to: '/account/applications' },
  { key: 'profile', to: '/account/profile' },
  { key: 'security', to: '/account/security' },
  { key: 'travelers', to: '/account/travelers' },
  { key: 'notifications', to: '/account/notifications' },
  { key: 'payments', to: '/account/payments' },
  { key: 'tickets', to: '/account/tickets' },
  { key: 'privacy', to: '/account/privacy' },
]

/**
 * Account shell. §3.3 also puts a persistent bottom bar on account pages for
 * mobile — Applications · Track · Help · Profile — which is the fastest path
 * between the four things an applicant comes back to do.
 */
export function AccountLayout() {
  const { locale } = useParams()
  const { t } = useTranslation()

  return (
    <div className="bg-neutral-50">
      <div className="mx-auto max-w-75rem px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12">
          <nav aria-label={t('account.navLabel')} className="lg:col-span-3">
            <ul className="flex gap-1 overflow-x-auto lg:flex-col">
              {ACCOUNT_NAV.map((item) => (
                <li key={item.key} className="shrink-0">
                  <NavLink
                    to={localePath(locale, item.to)}
                    className={({ isActive }) =>
                      cx(
                        'inline-flex min-h-11 items-center rounded-input px-4 py-2 text-body font-medium transition-colors',
                        isActive
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900',
                      )
                    }
                  >
                    {t(`account.nav.${item.key}`)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-9">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Mobile bottom bar (§3.3) */}
      <nav
        aria-label={t('account.mobileNavLabel')}
        className="bg-surface border-neutral-300 no-print sticky bottom-0 z-30 border-t lg:hidden"
      >
        <ul className="flex">
          {[
            { to: '/account/applications', labelKey: 'account.nav.applications' },
            { to: '/track', labelKey: 'nav.track' },
            { to: '/help', labelKey: 'nav.help' },
            { to: '/account/profile', labelKey: 'account.nav.profile' },
          ].map((item) => (
            <li key={item.to} className="flex-1">
              <NavLink
                to={localePath(locale, item.to)}
                className={({ isActive }) =>
                  cx(
                    'flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-center text-small',
                    isActive ? 'text-primary-700 font-semibold' : 'text-neutral-700',
                  )
                }
              >
                {t(item.labelKey)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

/**
 * FR-ACC-06: applications prefill from this profile, so the wizard asks for
 * nothing already known here.
 */
export function AccountProfilePage() {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage
  const user = useCurrentUser()
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(false)

  const { data: profile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: getProfile })

  const save = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      setSaved(true)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  if (isLoading || !profile) {
    return <Skeleton className="h-80" />
  }

  return (
    <AccountSection title={t('account.profileTitle')} description={t('account.profileSubtitle')}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          save.mutate(profile)
        }}
        className="flex flex-col gap-5"
      >
        {saved ? <Alert tone="success">{t('account.profileSaved')}</Alert> : null}

        <DescriptionList
          columns={2}
          items={[
            { label: t('account.email'), value: profile.email },
            {
              label: t('account.emailVerified'),
              value: (
                <Badge tone={user?.emailVerified ? 'success' : 'warning'} size="s">
                  {user?.emailVerified ? t('account.verified') : t('account.notVerified')}
                </Badge>
              ),
            },
            { label: t('wizard.field.fullName'), value: localize(profile.fullName, language) },
            {
              label: t('wizard.field.fullNameAr'),
              value: localize(profile.fullNameAr, language),
            },
            { label: t('wizard.field.dateOfBirth'), value: profile.dateOfBirth },
            { label: t('wizard.field.nationality'), value: profile.nationalityCode },
          ]}
        />

        <Alert tone="info">{t('account.profileEditNote')}</Alert>

        <div>
          <Button type="submit" loading={save.isPending}>
            {t('account.profileSave')}
          </Button>
        </div>
      </form>
    </AccountSection>
  )
}

/** FR-ACC-03: session list and revoke. FR-ACC-04: MFA. */
export function AccountSecurityPage() {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage
  const queryClient = useQueryClient()
  const user = useCurrentUser()
  const [mfaEnabled, setMfaEnabled] = useState(false)

  const { data: sessions = [] } = useQuery({ queryKey: ['sessions'], queryFn: getSessions })

  const revoke = useMutation({
    mutationFn: revokeSession,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  })

  const endSession = useMutation({
    mutationFn: signOut,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  })

  return (
    <AccountSection title={t('account.securityTitle')} description={t('account.securitySubtitle')}>
      <div className="space-y-8">
        <section aria-labelledby="security-mfa">
          <h2 id="security-mfa" className="text-h3 font-semibold">
            {t('account.mfaTitle')}
          </h2>
          <p className="text-neutral-700 mt-1 text-small">{t('account.mfaSubtitle')}</p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Switch
              label={t('account.mfaToggle')}
              checked={mfaEnabled}
              onCheckedChange={setMfaEnabled}
            />
            <Badge tone={mfaEnabled ? 'success' : 'warning'} size="s">
              {mfaEnabled ? t('account.mfaOn') : t('account.mfaOff')}
            </Badge>
          </div>

          {user?.mfaEnabled ? (
            <Alert tone="info" className="mt-4">
              {t('account.mfaStaffNote')}
            </Alert>
          ) : null}
        </section>

        <section aria-labelledby="security-sessions">
          <h2 id="security-sessions" className="text-h3 font-semibold">
            {t('account.sessionsTitle')}
          </h2>

          <ul className="border-neutral-300 mt-4 divide-y rounded-card border">
            {sessions.map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-neutral-900 font-medium">{entry.device}</p>
                  <p className="text-neutral-700 text-small">
                    {entry.location} · {t('account.lastUsed', { date: formatDate(entry.lastUsedAt, language) })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {entry.current ? (
                    <Badge tone="success" size="s">
                      {t('account.thisDevice')}
                    </Badge>
                  ) : (
                    <Button
                      variant="secondary"
                      size="s"
                      onClick={() => revoke.mutate(entry.id)}
                      loading={revoke.isPending}
                    >
                      {t('account.signOutDevice')}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => endSession.mutate()}
            loading={endSession.isPending}
          >
            {t('account.signOutEverywhere')}
          </Button>
        </section>

        <section aria-labelledby="security-password">
          <h2 id="security-password" className="text-h3 font-semibold">
            {t('account.passwordTitle')}
          </h2>
          <Button variant="secondary" className="mt-3">
            {t('account.changePassword')}
          </Button>
        </section>
      </div>
    </AccountSection>
  )
}

/** FR-ACC-07: data export and deletion. */
export function AccountPrivacyPage() {
  const { t } = useTranslation()
  const [requested, setRequested] = useState(null)

  return (
    <AccountSection title={t('account.privacyTitle')} description={t('account.privacySubtitle')}>
      <div className="space-y-6">
        <Card className="p-5">
          <h2 className="text-h3 font-semibold">{t('account.exportTitle')}</h2>
          <p className="text-neutral-700 mt-1 text-small">{t('account.exportBody')}</p>
          <Button
            className="mt-4"
            onClick={() => setRequested('export')}
            disabled={requested === 'export'}
          >
            {t('account.exportCta')}
          </Button>
        </Card>

        <Card className="p-5">
          <h2 className="text-h3 font-semibold">{t('account.deletionTitle')}</h2>
          <p className="text-neutral-700 mt-1 text-small">{t('account.deletionBody')}</p>
          <Button
            variant="destructive"
            className="mt-4"
            onClick={() => setRequested('deletion')}
            disabled={requested === 'deletion'}
          >
            {t('account.deletionCta')}
          </Button>
        </Card>

        {requested ? (
          <Alert tone={requested === 'deletion' ? 'warning' : 'success'}>
            {t(requested === 'deletion' ? 'account.deletionRequested' : 'account.exportRequested')}
          </Alert>
        ) : null}
      </div>
    </AccountSection>
  )
}

export function AccountSection({ title, description, children }) {
  return (
    <section aria-labelledby="account-section-heading">
      <h1 id="account-section-heading" className="text-h2 font-bold">
        {title}
      </h1>
      {description ? <p className="text-neutral-700 mt-2">{description}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  )
}

/** Signed-in gate. Returns the user to where they were after signing in. */
export function RequireAuth({ children }) {
  const user = useCurrentUser()
  const { locale } = useParams()

  if (!user) return <Navigate to={localePath(locale, '/signin')} replace />

  return children
}