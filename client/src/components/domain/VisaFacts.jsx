import { Clock, Coins, CalendarRange, Repeat } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatDays, formatMoney, formatSla, localize } from '../../lib/format.js'

/**
 * Key facts strip shown on visa cards and the detail summary (§6.2/§6.3):
 * validity · max stay · entries · processing time · fee "from".
 */
export function VisaFacts({
  visaType,
  feeTotalMinor,
  currency = 'SAR',
  travelerCount = 1,
  compact = false,
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage

  const facts = [
    {
      key: 'validity',
      Icon: CalendarRange,
      label: t('visa.factValidity'),
      value: formatDays(visaType.validityDays, locale, t),
    },
    {
      key: 'maxStay',
      Icon: CalendarRange,
      label: t('visa.factMaxStay'),
      value: formatDays(visaType.maxStayDays, locale, t),
    },
    {
      key: 'entries',
      Icon: Repeat,
      label: t('visa.factEntries'),
      value: t(`visa.entries.${visaType.entryType.toLowerCase()}`),
    },
    {
      key: 'processing',
      Icon: Clock,
      label: t('visa.factProcessing'),
      value: formatSla(visaType.processingSlaHours, locale, t),
    },
    {
      key: 'fee',
      Icon: Coins,
      label: t('visa.factFeeFrom'),
      value: formatMoney(feeTotalMinor, currency, locale),
      /* Optional add-ons are never folded into the headline figure (§13).
         For a group the quoted amount is the total, not a per-person rate —
         saying "per traveler" there would understate it by the party size. */
      suffix:
        travelerCount > 1
          ? t('feeBreakdown.travelerCount', { count: travelerCount })
          : t('visa.feePerTraveler'),
    },
  ]

  return (
    <dl className={compact ? 'grid grid-cols-2 gap-x-4 gap-y-3' : 'flex flex-wrap gap-x-8 gap-y-3'}>
      {facts.map(({ key, Icon, label, value, suffix }) => (
        <div key={key} className="flex min-w-0 items-start gap-2">
          <Icon aria-hidden="true" className="text-primary-700 mt-0.5 size-4 shrink-0" />
          <div className="min-w-0">
            <dt className="text-neutral-700 text-small">{label}</dt>
            <dd className="text-neutral-900 text-small font-semibold">
              <span className="ltr-nums">{value}</span>
              {suffix ? <span className="text-neutral-700 font-normal"> {suffix}</span> : null}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  )
}

/** Single-line summary used in finder result chips and list rows. */
export function VisaFactLine({ visaType, locale }) {
  return (
    <p className="text-neutral-700 text-small">
      {formatDays(visaType.maxStayDays, locale)} ·{' '}
      {formatSla(visaType.processingSlaHours, locale)} ·{' '}
      {localize(visaType.summary, locale)}
    </p>
  )
}