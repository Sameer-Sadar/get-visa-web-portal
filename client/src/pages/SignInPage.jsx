import { useMutation } from '@tanstack/react-query'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from '@visagate/ui/feedback'
import { Button } from '@visagate/ui/Button'
import { Card } from '@visagate/ui/Card'
import { Container, Section } from '@visagate/ui/Container'
import { OtpInput } from '@visagate/ui/OtpInput'
import { PasswordField, TextField } from '@visagate/ui/inputs'
import { localePath } from '../config/site.js'
import { PageMeta } from '../app/PageMeta.jsx'
import { requestOtp, signIn, verifyOtp } from '../services/authService.js'

/**
 * Sign in and email/phone verification (§6.4).
 *
 * Error copy never reveals whether an account exists: the service returns one
 * generic failure for an unknown email and a wrong password alike, so the page
 * has nothing to leak even by accident.
 */
export function SignInPage() {
  const { t } = useTranslation()
  const { locale } = useParams()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})

  const signInMutation = useMutation({
    mutationFn: signIn,
    onSuccess: () => navigate(localePath(locale, '/account/applications'), { replace: true }),
    onError: (error) => {
      setErrors(
        Object.keys(error?.fieldErrors ?? {}).length > 0
          ? error.fieldErrors
          : { form: error?.message ?? t('auth.errorGeneric') },
      )
    },
  })

  const submit = (event) => {
    event.preventDefault()

    const nextErrors = {}
    if (!email.trim()) nextErrors.email = t('auth.errorEmail')
    if (!password) nextErrors.password = t('auth.errorPassword')
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    signInMutation.mutate({ email: email.trim(), password })
  }

  return (
    <AuthShell title={t('auth.signInTitle')} subtitle={t('auth.signInSubtitle')}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        {errors.form ? <Alert tone="danger">{errors.form}</Alert> : null}

        <TextField
          label={t('auth.email')}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />

        <PasswordField
          label={t('auth.password')}
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />

        <div className="flex justify-end">
          <Link
            to={localePath(locale, '/forgot-password')}
            className="text-primary-700 text-small underline underline-offset-4"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>

        <Button type="submit" size="l" loading={signInMutation.isPending} className="w-full">
          {t('auth.signIn')}
        </Button>
      </form>

      <p className="text-neutral-700 mt-6 text-center text-small">
        {t('auth.noAccount')}{' '}
        <Link
          to={localePath(locale, '/register')}
          className="text-primary-700 font-semibold underline underline-offset-4"
        >
          {t('auth.createAccount')}
        </Link>
      </p>
    </AuthShell>
  )
}

/** Email verification with a 6-box code, paste support and resend countdown. */
export function VerifyEmailPanel({ email, onBack }) {
  const { t } = useTranslation()
  const { locale } = useParams()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [resendIn, setResendIn] = useState(30)

  const send = useMutation({
    mutationFn: () => requestOtp({ email, purpose: 'EMAIL_VERIFY' }),
    onSuccess: (result) => setResendIn(result.resendAfterSeconds ?? 30),
  })

  const verify = useMutation({
    mutationFn: verifyOtp,
    onSuccess: () => navigate(localePath(locale, '/account/applications'), { replace: true }),
    onError: (mutationError) => setError(mutationError.message ?? t('auth.errorCode')),
  })

  /* Resend cooldown — a real limit on the server, mirrored here so the button
     state matches the rule rather than pretending to. */
  useEffect(() => {
    if (resendIn <= 0) return undefined

    const timer = setInterval(() => {
      setResendIn((value) => Math.max(0, value - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [resendIn])

  return (
    <AuthShell title={t('auth.verifyTitle')} subtitle={t('auth.verifySubtitle', { email })}>
      {error ? <Alert tone="danger">{error}</Alert> : null}

      <OtpInput
        label={t('auth.codeLabel')}
        hint={t('auth.codeHint')}
        value={code}
        onChange={setCode}
        autoFocus
      />

      <Button
        className="mt-5 w-full"
        size="l"
        loading={verify.isPending}
        disabled={code.length !== 6}
        onClick={() => verify.mutate({ email, code, purpose: 'EMAIL_VERIFY' })}
      >
        {t('auth.verify')}
      </Button>

      <div className="mt-5 flex items-center justify-between text-small">
        <button
          type="button"
          onClick={onBack}
          className="text-neutral-700 hover:text-neutral-900 underline underline-offset-4"
        >
          {t('auth.changeEmail')}
        </button>

        <button
          type="button"
          disabled={resendIn > 0 || send.isPending}
          onClick={() => send.mutate()}
          className="text-primary-700 underline underline-offset-4 disabled:cursor-not-allowed disabled:text-neutral-700 disabled:no-underline"
        >
          {resendIn > 0 ? t('auth.resendIn', { seconds: resendIn }) : t('auth.resend')}
        </button>
      </div>

      {/* Demo affordance: the mock channel never actually sends an SMS/email. */}
      <p className="text-neutral-700 mt-6 border-t pt-4 text-center text-small">
        {t('auth.demoCode')}
      </p>
    </AuthShell>
  )
}

/**
 * Shared single-card layout for auth screens (§6.4).
 *
 * Also publishes the page head — these screens do not use `PageHeader`, and an
 * untitled page is a crawler and browser-tab defect.
 */
export function AuthShell({ title, subtitle, children, footer }) {
  const { locale } = useParams()
  const { pathname } = useLocation()

  const relativePath = pathname.replace(new RegExp(`^/${locale}`), '') || '/'

  return (
    <>
      <PageMeta title={title} description={subtitle} path={relativePath} locale={locale} />

      <Section>
        <Container size="narrow">
          <Card className="p-6 sm:p-8">
            <h1 className="text-h2 font-bold">{title}</h1>
            {subtitle ? <p className="text-neutral-700 mt-2">{subtitle}</p> : null}
            <div className="mt-6">{children}</div>
            {footer ? <div className="mt-6">{footer}</div> : null}
          </Card>
        </Container>
      </Section>
    </>
  )
}