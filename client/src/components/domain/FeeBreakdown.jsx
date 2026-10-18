import { useTranslation } from 'react-i18next'
import { Badge } from '@visagate/ui/Badge'
import { cx } from '@visagate/ui/lib/cx.js'
import { formatMoney, localize } from '../../lib/format.js'

/**
 * Transparent fee breakdown (§6.3, §13).
 *
 * Every component is listed separately — visa fee, service fee, insurance, VAT
 * — with the total called out. Optional items are visibly optional and never
 * pre-selected: §13 forbids hidden fees and pre-selected add-ons.
 */
export function FeeBreakdown({ quote, locale = 'en', showOptional = true, className }) {
  const { t } = useTranslation()

  if (!quote) return null

  const lines = quote.lines.filter((line) => showOptional || !line.isOptional)

  return (
    <div className={cx('flex flex-col', className)}>
      <table className="w-full">
        <caption className="sr-only">{t('feeBreakdown.caption')}</caption>
        <tbody>
          {lines.map((line) => (
            <tr key={line.code} className="border-neutral-300 border-b last:border-b-0">
              <th scope="row" className="py-3 pe-4 text-start font-normal">
                <span className="text-neutral-900 block text-body">
                  {line.label ?? t(`feeKind.${line.kind}`)}
                </span>

                {line.isOptional ? (
                  <Badge
                    tone="neutral"
                    size="s"
                    className="mt-1"
                  >
                    {t('feeBreakdown.optional')}
                  </Badge>
                ) : null}

                {line.qty > 1 ? (
                  <span className="text-neutral-700 mt-1 block text-small">
                    <span className="ltr-nums">
                      {t('feeBreakdown.quantity', {
                        count: line.qty,
                        amount: formatMoney(line.unitMinor, quote.currency, locale),
                      })}
                    </span>
                  </span>
                ) : null}

                {line.percentBp ? (
                  <span className="text-neutral-700 mt-1 block text-small">
                    <span className="ltr-nums">
                      {t('feeBreakdown.percentOf', {
                        percent: line.percentBp / 100,
                      })}
                    </span>
                  </span>
                ) : null}
              </th>

              <td
                className={cx(
                  'text-neutral-900 py-3 text-end text-body font-semibold',
                  !line.isRefundable && 'text-neutral-700 font-normal',
                )}
              >
                <span className="ltr-nums">
                  {formatMoney(line.amountMinor, quote.currency, locale)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <th scope="row" className="text-neutral-900 pt-4 text-start text-body font-semibold">
              {t('feeBreakdown.total')}
            </th>
            <td className="text-neutral-900 pt-4 text-end text-h3 font-bold">
              <span className="ltr-nums">
                {formatMoney(quote.totalMinor, quote.currency, locale)}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>

      {quote.travelerCount > 1 ? (
        <p className="text-neutral-700 mt-3 text-small">
          {localize(
            { en: `Total for ${quote.travelerCount} travelers.`, ar: `الإجمالي لـ ${quote.travelerCount} مسافرين.` },
            locale,
          )}
        </p>
      ) : null}

      <p className="text-neutral-700 mt-3 text-small">{t('feeBreakdown.assurance')}</p>
    </div>
  )
}

/** Compact single figure for the sticky summary card. */
export function FeeTotal({ quote, locale = 'en', className }) {
  const { t } = useTranslation()
  if (!quote) return null

  return (
    <div className={cx('flex flex-col gap-1', className)}>
      <span className="text-neutral-700 text-small">{t('feeBreakdown.estimatedTotal')}</span>
      <span className="text-h2 text-neutral-900 font-bold">
        <span className="ltr-nums">{formatMoney(quote.totalMinor, quote.currency, locale)}</span>
      </span>
      <span className="text-neutral-700 text-small">{t('visa.feePerTraveler')}</span>
    </div>
  )
}