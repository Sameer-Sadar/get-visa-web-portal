import { ClipboardCheck, CreditCard, FileCheck2, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cx } from '@visagate/ui/lib/cx.js'

const STEPS = [
  { key: 'find', Icon: Search },
  { key: 'apply', Icon: ClipboardCheck },
  { key: 'pay', Icon: CreditCard },
  { key: 'track', Icon: FileCheck2 },
]

/**
 * "How it works" — four steps, no jargon (§1 clarity over cleverness).
 * The number is decorative; the heading carries the meaning.
 */
export function HowItWorks({ className }) {
  const { t } = useTranslation()

  return (
    <ol className={cx('grid gap-6 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {STEPS.map(({ key, Icon }, index) => (
        <li key={key} className="flex flex-col gap-3">
          <span
            aria-hidden="true"
            className="bg-primary-100 text-primary-700 grid size-11 place-items-center rounded-pill"
          >
            <Icon className="size-5" />
          </span>

          <div>
            <p className="text-neutral-700 text-small">
              <span className="ltr-nums">
                {index + 1}
                <span aria-hidden="true">/4</span>
              </span>
            </p>
            <h3 className="text-neutral-900 text-h3 font-semibold">{t(`howItWorks.${key}.title`)}</h3>
            <p className="text-neutral-700 mt-1">{t(`howItWorks.${key}.body`)}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}