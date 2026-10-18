import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { Alert } from '@visagate/ui/feedback'
import { Button } from '@visagate/ui/Button'
import { PasswordField, TextField } from '@visagate/ui/inputs'
import { AuthShell } from './SignInPage.jsx'
import { localePath } from '../config/site.js'
import { requestPasswordReset, resetPassword } from '../services/authService.js'

/**
 * Password reset (§6.4, FR-ACC-03).
 *
 * Both screens are deliberately vague about whether the account exists: the
 * request screen confirms unconditionally, so it cannot be used to enumerate
 * registered addresses.
 */
export function ForgotPasswordPage() {
  const { t } = useTranslation()
  const { locale } = useParams()
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)

  const send = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => setSent(true),
    onError: (mutationError) => setError(mutationError.message ?? t('auth.errorGeneric')),
  })

  const submit = (event) => {
    event.preventDefault()
    if (!email.trim()) {
      setError(t('auth.errorEmail'))
      return
    }
    setError(null)
    send.mutate({ email: email.trim() })
  }

  if (sent) {
    return (
      <AuthShell title={t('auth.resetSentTitle')} subtitle={t('auth.resetSentSubtitle', { email })}>
        <p className="text-neutral-700">{t('auth.resetSentBody')}</p>
        <Button
          variant="secondary"
          className="mt-6 w-full"
          asChild
        >
          <Link to={localePath(locale, '/signin')}>{t('auth.backToSignIn')}</Link>
        </Button>
      </AuthShell>
    )
  }

  return (
    <AuthShell title={t('auth.forgotTitle')} subtitle={t('auth.forgotSubtitle')}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        {error ? <Alert tone="danger">{error}</Alert> : null}

        <TextField
          label={t('auth.email')}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <Button type="submit" size="l" loading={send.isPending} className="w-full">
          {t('auth.sendResetLink')}
        </Button>

        <Link
          to={localePath(locale, '/signin')}
          className="text-neutral-700 hover:text-neutral-900 text-center text-small underline underline-offset-4"
        >
          {t('auth.backToSignIn')}
        </Link>
      </form>
    </AuthShell>
  )
}

/** Token comes from the emailed link; the mock accepts any token. */
export function ResetPasswordPage() {
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)

  const reset = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => setDone(true),
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
    if (password.length < 8) nextErrors.password = t('auth.passwordWeak')
    if (password !== confirm) nextErrors.confirm = t('auth.passwordMismatch')
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    reset.mutate({ token: 'reset-token', password })
  }

  if (done) {
    return (
      <AuthShell title={t('auth.resetDoneTitle')}>
        <p className="text-neutral-700">{t('auth.resetDoneBody')}</p>
      </AuthShell>
    )
  }

  return (
    <AuthShell title={t('auth.resetTitle')} subtitle={t('auth.resetSubtitle')}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        {errors.form ? <Alert tone="danger">{errors.form}</Alert> : null}

        <PasswordField
          label={t('auth.newPassword')}
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />

        <PasswordField
          label={t('auth.confirmPassword')}
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          error={errors.confirm}
        />

        <Button type="submit" size="l" loading={reset.isPending} className="w-full">
          {t('auth.savePassword')}
        </Button>
      </form>
    </AuthShell>
  )
}