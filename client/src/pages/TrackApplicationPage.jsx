import { useMutation } from '@tanstack/react-query'
import { Lock, Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { Alert } from '@visagate/ui/feedback'
import { Button } from '@visagate/ui/Button'
import { Card } from '@visagate/ui/Card'
import { Container, Section } from '@visagate/ui/Container'
import { DescriptionList } from '@visagate/ui/data'
import { TextField } from '@visagate/ui/inputs'
import { useLocalizedToast } from '@visagate/ui/Toast'
import { PageHeader } from '../components/domain/PageHeader.jsx'
import { StatusTimeline } from '../components/domain/StatusTimeline.jsx'
import { lookupApplication } from '../services/trackingService.js'
import { ApiError } from '../services/apiClient.js'
import { formatDate, localize } from '../lib/format.js'
import { localePath } from '../config/site.js'

/**
 * Public tracking (FR-TRK-01..04, §6.2, §6.8).
 *
 * Two-factor lookup: reference **and** passport number, plus a CAPTCHA. Both
 * are load-bearing against enumeration (R-02), so neither is ever offered as
 * an alternative to the other, and every failure returns the same message.
 *
 * The result shows the **reduced** dataset — initials, visa type, status,
 * dates. Travel dates and the visa document unlock only after step-up
 * verification.
 */
export default function TrackApplicationPage() {
  const { t, i18n } = useTranslation()
  const { locale } = useParams()
  const toast = useLocalizedToast()
  const language = i18n.resolvedLanguage

  const [reference, setReference] = useState('')
  const [passportNumber, setPassportNumber] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [errors, setErrors] = useState({})
  const [summary, setSummary] = useState(null)

  const lookup = useMutation({
    mutationFn: lookupApplication,
    onSuccess: ({ summary: found }) => {
      setSummary(found)
      toast.success(t('track.foundTitle'))
    },
    onError: (error) => {
      /* One message for every failure mode — never confirm that a reference
         exists (R-02). */
      if (error instanceof ApiError && error.code === 'CAPTCHA_REQUIRED') {
        setErrors({ captcha: t('track.errorCaptcha') })
        return
      }
      toast.danger(t('track.errorNotFound'))
    },
  })

  const submit = (event) => {
    event.preventDefault()

    const nextErrors = {}
    if (!reference.trim()) nextErrors.reference = t('track.errorReference')
    if (!passportNumber.trim()) nextErrors.passportNumber = t('track.errorPassport')
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    lookup.mutate({ reference, passportNumber, captchaToken })
  }

  return (
    <>
      <PageHeader
        title={t('track.title')}
        description={t('track.subtitle')}
        breadcrumbs={[{ label: t('nav.track'), key: 'track' }]}
      />

      <Section>
        <Container size="narrow">
          <Card className="p-6 sm:p-8">
            <form onSubmit={submit} noValidate>
              <div className="space-y-5">
                <div>
                  <TextField
                    label={t('track.referenceLabel')}
                    required
                    hint={t('track.referenceHint')}
                    error={errors.reference}
                    value={reference}
                    onChange={(event) => setReference(event.target.value)}
                    dir="ltr"
                    placeholder="VG-XXXX-XXXX-XXXX"
                  />
                </div>

                <div>
                  <TextField
                    label={t('track.passportLabel')}
                    required
                    hint={t('track.passportHint')}
                    error={errors.passportNumber}
                    value={passportNumber}
                    onChange={(event) => setPassportNumber(event.target.value)}
                    dir="ltr"
                    inputMode="numeric"
                  />
                </div>

                {/* Cloudflare Turnstile / hCaptcha mount point (TRD §5.2).
                    Until a key exists this is a visible, keyboard-operable
                    stand-in rather than a box that silently never validates. */}
                <fieldset>
                  <legend className="text-small text-neutral-900 font-medium">
                    {t('track.captchaLabel')}
                  </legend>
                  <p className="text-neutral-700 mt-1 text-small">{t('track.captchaNote')}</p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-2"
                    aria-pressed={Boolean(captchaToken)}
                    onClick={() => setCaptchaToken(`demo-${captchaToken ? '' : Date.now()}`)}
                  >
                    <Lock aria-hidden="true" className="size-4" />
                    {captchaToken ? t('track.captchaDone') : t('track.captchaAction')}
                  </Button>
                  {errors.captcha ? (
                    <p className="text-danger-600 mt-1.5 text-small font-medium">
                      {errors.captcha}
                    </p>
                  ) : null}
                </fieldset>
              </div>

              <Button type="submit" size="l" className="mt-6" loading={lookup.isPending}>
                <Search aria-hidden="true" className="size-4" />
                {t('track.submit')}
              </Button>
            </form>

            <Alert tone="info" className="mt-6">
              {t('track.signInHint')}{' '}
              <Link
                to={localePath(locale, '/signin')}
                className="font-semibold underline underline-offset-4"
              >
                {t('nav.signIn')}
              </Link>
            </Alert>
          </Card>

          {summary ? <TrackingResult summary={summary} language={language} /> : null}
        </Container>
      </Section>
    </>
  )
}

/**
 * Reduced status view. Step-up is Phase 3 (it needs a real OTP channel), so the
 * unlock affordance is described rather than faked — §9 says never to show a
 * control that does nothing.
 */
function TrackingResult({ summary, language }) {
  const { t } = useTranslation()

  return (
    <Card className="mt-8 p-6" aria-labelledby="tracking-result-heading">
      <h2 id="tracking-result-heading" className="sr-only">
        {t('track.resultHeading')}
      </h2>

      <p className="font-mono text-neutral-900 font-semibold">
        <span className="ltr-nums">{summary.reference}</span>
      </p>

      <div className="mt-4">
        <StatusTimeline
          status={summary.status}
          history={summary.timeline}
          processedAt={summary.nextStep}
          locale={language}
        />
      </div>

      <div className="border-neutral-300 mt-6 border-t pt-6">
        <DescriptionList
          columns={2}
          items={[
            {
              label: t('track.visaType'),
              value: localize(summary.visaTypeName, language),
            },
            {
              label: t('track.travelers'),
              value: t('feeBreakdown.travelerCount', { count: summary.travelers.length }),
            },
            {
              label: t('track.submittedAt'),
              value: summary.submittedAt ? formatDate(summary.submittedAt, language) : '—',
            },
            {
              label: t('track.nextStep'),
              value: localize(summary.nextStep, language),
            },
          ]}
        />
      </div>

      <Alert tone="info" className="mt-6">
        {t('track.stepUpHint')}
      </Alert>
    </Card>
  )
}