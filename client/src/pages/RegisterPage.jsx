import { useMutation } from '@tanstack/react-query'
import { Check, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Alert } from '@visagate/ui/feedback'
import { Button } from '@visagate/ui/Button'
import { Checkbox } from '@visagate/ui/choices'
import { PasswordField, TextField } from '@visagate/ui/inputs'
import { cx } from '@visagate/ui/lib/cx.js'
import { AuthShell, VerifyEmailPanel } from './SignInPage.jsx'
import { localePath } from '../config/site.js'
import { register } from '../services/authService.js'
import { useParams } from 'react-router-dom'

/** Minimum viable strength rules; the server enforces the same set (FR-ACC-01). */
function evaluatePassword(password) {
  return [
    { key: 'length', met: password.length >= 8 },
    { key: 'number', met: /\d/.test(password) },
    { key: 'letter', met: /[a-zA-Z]/.test(password) },
  ]
}

/**
 * Registration (§6.4): email, password with a strength meter, consent, then a
 * verification code screen.
 *
 * The consent box starts unticked — §13 forbids pre-ticked consent, and a
 * pre-ticked privacy box is not consent.
 */
export function RegisterPage() {
  const { t } = useTranslation()
  const { locale } = useParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState({})
  const [registered, setRegistered] = useState(false)

  const rules = useMemo(() => evaluatePassword(password), [password])
  const passwordOk = rules.every((rule) => rule.met)

  const submit = useMutation({
    mutationFn: register,
    onSuccess: () => setRegistered(true),
    onError: (error) => {
      setErrors(
        Object.keys(error?.fieldErrors ?? {}).length > 0
          ? error.fieldErrors
          : { form: error?.message ?? t('auth.errorGeneric') },
      )
    },
  })

  const onSubmit = (event) => {
    event.preventDefault()

    const nextErrors = {}
    if (!email.trim()) nextErrors.email = t('auth.errorEmail')
    if (!password) nextErrors.password = t('auth.errorPassword')
    else if (!passwordOk) nextErrors.password = t('auth.passwordWeak')
    if (!consent) nextErrors.consent = t('auth.errorConsent')
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    submit.mutate({ email: email.trim(), password })
  }

  if (registered) {
    /* The code screen owns entry and the resend cooldown; going back lets the
       user correct a mistyped address rather than starting over. */
    return <VerifyEmailPanel email={email.trim()} onBack={() => setRegistered(false)} />
  }

  return (
    <AuthShell title={t('auth.registerTitle')} subtitle={t('auth.registerSubtitle')}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
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

        <div>
          <PasswordField
            label={t('auth.password')}
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
          />

          {/* Live strength feedback, but the rules stay visible so the user
              knows what is still missing (WCAG 3.3.1 error identification). */}
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {rules.map((rule) => (
              <li
                key={rule.key}
                className={cx(
                  'flex items-center gap-1.5 text-small',
                  rule.met ? 'text-success-600' : 'text-neutral-700',
                )}
              >
                {rule.met ? (
                  <Check aria-hidden="true" className="size-4" />
                ) : (
                  <X aria-hidden="true" className="size-4" />
                )}
                {t(`auth.rule.${rule.key}`)}
              </li>
            ))}
          </ul>
        </div>

        <Checkbox
          label={t('auth.consentLabel')}
          error={errors.consent}
          checked={consent}
          onCheckedChange={setConsent}
          description={
            <span className="flex flex-wrap gap-x-2">
              <Link
                to={localePath(locale, '/terms')}
                className="text-primary-700 underline underline-offset-4"
              >
                {t('nav.terms')}
              </Link>
              <span aria-hidden="true">·</span>
              <Link
                to={localePath(locale, '/privacy')}
                className="text-primary-700 underline underline-offset-4"
              >
                {t('nav.privacy')}
              </Link>
            </span>
          }
        />

        <Button type="submit" size="l" loading={submit.isPending} className="w-full">
          {t('auth.createAccount')}
        </Button>
      </form>

      <p className="text-neutral-700 mt-6 text-center text-small">
        {t('auth.haveAccount')}{' '}
        <Link
          to={localePath(locale, '/signin')}
          className="text-primary-700 font-semibold underline underline-offset-4"
        >
          {t('auth.signIn')}
        </Link>
      </p>
    </AuthShell>
  )
}