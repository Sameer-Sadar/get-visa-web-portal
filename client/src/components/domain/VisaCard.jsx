import { ArrowRight, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '@visagate/ui/Badge'
import { Button } from '@visagate/ui/Button'
import { Card } from '@visagate/ui/Card'
import { ELIGIBILITY, StatusPill } from '@visagate/ui/StatusPill'
import { formatMoney, localize } from '../../lib/format.js'
import { localePath } from '../../config/site.js'
import { VisaFacts } from './VisaFacts.jsx'

/**
 * Result card for the finder and catalog (§6.2): name, short description,
 * eligibility pill, key facts, and two clear actions.
 *
 * The primary action is always "View details" — applying is a considered step
 * that follows reading the requirements (§1, "guide, don't gatekeep").
 */
export function VisaCard({ visaType, eligibility, feePreview }) {
  const { t, i18n } = useTranslation()
  const { locale } = useParams()
  const language = i18n.resolvedLanguage
  const detailPath = localePath(locale, `/visas/${visaType.slug}`)

  return (
    <Card interactive className="relative flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-h3 text-neutral-900 font-semibold text-balance">
              {/* Stretched link: the card surface is the click target, while
                  the accessibility tree still exposes one link named by the
                  heading. The actions below sit above it with z-index. */}
              <Link
                to={detailPath}
                className="hover:text-primary-700 transition-colors after:absolute after:inset-0 after:content-['']"
              >
                {localize(visaType.name, language)}
              </Link>
            </h3>
            <p className="text-neutral-700 mt-1">{localize(visaType.summary, language)}</p>
          </div>

          {eligibility ? (
            <StatusPill
              status={eligibility.effect}
              map={ELIGIBILITY}
              label={t(`eligibility.${eligibilityKey(eligibility.effect)}`)}
            />
          ) : null}
        </div>

        {eligibility?.reason ? (
          <p className="text-neutral-700 flex items-start gap-2 text-small">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {localize(eligibility.reason, language)}
          </p>
        ) : null}

        {eligibility?.conditions?.length ? (
          <ul className="space-y-1">
            {eligibility.conditions.map((condition) => (
              <li key={condition.en} className="text-warning-600 flex items-start gap-2 text-small">
                <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {localize(condition, language)}
              </li>
            ))}
          </ul>
        ) : null}

        <VisaFacts
          visaType={visaType}
          feeTotalMinor={feePreview?.totalMinor}
          currency={feePreview?.currency}
          travelerCount={feePreview?.travelerCount ?? 1}
        />
      </div>

      <div className="border-neutral-300 relative z-10 flex flex-wrap items-center gap-3 border-t p-6 pt-4">
        <Button asChild>
          <Link to={detailPath}>
            {t('visa.viewDetails')}
            <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
          </Link>
        </Button>

        {feePreview?.totalMinor != null ? (
          <Badge tone="neutral">
            <span className="ltr-nums">
              {t('visa.feeFrom')}{' '}
              {formatMoney(feePreview.totalMinor, feePreview.currency, language)}
            </span>
          </Badge>
        ) : null}
      </div>
    </Card>
  )
}

function eligibilityKey(effect) {
  if (effect === 'NOT_ELIGIBLE') return 'notEligible'
  return effect.toLowerCase()
}