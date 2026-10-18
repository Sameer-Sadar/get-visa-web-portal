import { Check, Circle, Clock } from 'lucide-react'
import { cx } from '../lib/cx.js'

const STATE_ICONS = {
  done: Check,
  current: Clock,
  todo: Circle,
}

/**
 * Application status timeline (§6.8). The list order follows the document's
 * logical reading order, so it mirrors automatically in RTL.
 */
export function Timeline({ items, className }) {
  return (
    <ol className={cx('flex flex-col', className)}>
      {items.map((item, index) => {
        const state = item.state ?? 'todo'
        const Icon = STATE_ICONS[state] ?? Circle
        const isCurrent = state === 'current'
        const isLast = index === items.length - 1

        return (
          <li key={item.key ?? item.label} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                aria-hidden="true"
                className={cx(
                  'grid size-7 shrink-0 place-items-center rounded-pill',
                  state === 'done' && 'bg-success-600 text-white',
                  isCurrent && 'bg-info-600 text-white',
                  state === 'todo' && 'bg-neutral-50 text-neutral-300 border border-neutral-300',
                )}
              >
                <Icon className={cx('size-4', state === 'todo' && 'fill-current stroke-none')} />
              </span>
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className={cx(
                    'my-1 w-0.5 flex-1',
                    state === 'done' ? 'bg-success-600/40' : 'bg-neutral-300',
                  )}
                />
              ) : null}
            </div>

            <div className={cx('pb-8', isLast && 'pb-0')}>
              <p
                aria-current={isCurrent ? 'step' : undefined}
                className={cx(
                  'font-medium',
                  state === 'todo' ? 'text-neutral-700' : 'text-neutral-900',
                )}
              >
                {item.label}
              </p>
              {item.date ? (
                <p className="text-neutral-700 text-small">{item.date}</p>
              ) : null}
              {item.description ? (
                <p className="text-neutral-700 mt-1 text-small">{item.description}</p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}