import { useQuery } from '@tanstack/react-query'
import { BadgeCheck, CircleX } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@visagate/ui/Button'
import { Container, Section } from '@visagate/ui/Container'
import { DescriptionList } from '@visagate/ui/data'
import { verifyVisa } from '../services/trackingService.js'
import { formatDate, localize } from '../lib/format.js'

/**
 * Public visa verification (FR-TRK-03, §6.9) — the QR landing page.
 *
 * Deliberately minimal: BR-09 requires a public URL that exposes *minimal*
 * data, so there is no name, no passport number and no application reference
 * here. A carrier can confirm the document is genuine; nobody else learns
 * anything about the holder.
 */
export default function VerifyVisaPage() {
  const { t, i18n } = useTranslation()
  const { token } = useParams()
  const language = i18n.resolvedLanguage

  const { data, isLoading } = useQuery({
    queryKey: ['verify-visa', token],
    queryFn: () => verifyVisa(token),
    retry: false,
  })

  const isValid = Boolean(data?.isValid)

  return (
    <Section>
      <Container size="narrow">
        <div
          className={
            isValid
              ? 'bg-success-600/10 border-success-600/30 rounded-card border p-6 text-center'
              : 'bg-danger-600/10 border-danger-600/30 rounded-card border p-6 text-center'
          }
        >
          <span
            className={
              isValid
                ? 'bg-success-600 mx-auto grid size-14 place-items-center rounded-pill text-white'
                : 'bg-danger-600 mx-auto grid size-14 place-items-center rounded-pill text-white'
            }
          >
            {isValid ? (
              <BadgeCheck aria-hidden="true" className="size-7" />
            ) : (
              <CircleX aria-hidden="true" className="size-7" />
            )}
          </span>

          <h1 className="text-h2 mt-4 font-bold">
            {isLoading ? t('verify.checking') : isValid ? t('verify.valid') : t('verify.invalid')}
          </h1>

          <p className="text-neutral-700 mt-2">
            {isValid ? t('verify.validSubtitle') : t('verify.invalidSubtitle')}
          </p>
        </div>

        {isValid ? (
          <div className="bg-surface border-neutral-300 mt-6 rounded-card border p-6">
            <DescriptionList
              items={[
                { label: t('verify.holder'), value: data.holderInitials ?? '—' },
                { label: t('verify.visaType'), value: localize(data.visaTypeName, language) },
                { label: t('verify.issuedAt'), value: formatDate(data.issuedAt, language) },
                { label: t('verify.validFrom'), value: formatDate(data.validFrom, language) },
                { label: t('verify.validUntil'), value: formatDate(data.validUntil, language) },
              ]}
            />

            <p className="text-neutral-700 mt-6 text-small">{t('verify.privacyNote')}</p>
          </div>
        ) : null}

        <div className="mt-8 text-center">
          <Button variant="secondary" onClick={() => window.print()}>
            {t('verify.print')}
          </Button>
        </div>

        <p className="text-neutral-700 mt-6 text-center text-small">
          {t('verify.reportProblem')}
        </p>
      </Container>
    </Section>
  )
}