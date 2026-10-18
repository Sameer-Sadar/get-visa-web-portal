import { cx } from '../lib/cx.js'

/**
 * Key/value pairs for summaries (fees, travel dates, applicant details).
 * Uses a real description list so the association survives for screen readers.
 */
export function DescriptionList({ items, columns = 1, className }) {
  return (
    <dl
      className={cx(
        'grid gap-x-8 gap-y-4',
        columns === 2 ? 'sm:grid-cols-2' : columns === 3 ? 'sm:grid-cols-3' : 'grid-cols-1',
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-neutral-700 text-small">{item.label}</dt>
          <dd className="text-neutral-900 mt-0.5 font-medium break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Single headline number for dashboards (FR-ADM-13). */
export function KpiTile({ label, value, delta, icon: Icon, className }) {
  return (
    <div
      className={cx(
        'bg-surface border-neutral-300 flex items-start gap-4 rounded-card border p-5 shadow-1',
        className,
      )}
    >
      {Icon ? (
        <span className="bg-primary-100 text-primary-700 grid size-10 shrink-0 place-items-center rounded-pill">
          <Icon aria-hidden="true" className="size-5" />
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="text-neutral-700 text-small">{label}</p>
        <p className="text-h2 text-neutral-900 font-semibold">{value}</p>
        {delta ? <p className="text-neutral-700 text-small">{delta}</p> : null}
      </div>
    </div>
  )
}

/**
 * Data table. Horizontal scroll wrapper keeps wide tables usable on mobile
 * until §10 converts them to stacked cards at the page level.
 */
export function Table({ caption, columns, rows, empty, className }) {
  return (
    <div className={cx('scrollbar-thin w-full overflow-x-auto', className)}>
      <table className="w-full min-w-max border-collapse text-start">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-neutral-300 border-b">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                aria-sort={column.sort}
                className="text-neutral-700 px-4 py-3 text-start text-small font-semibold"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-neutral-300/70 divide-y">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-neutral-700 px-4 py-10 text-center">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.key} className="hover:bg-neutral-50 transition-colors duration-150">
                {columns.map((column) => (
                  <td key={column.key} className="text-neutral-900 px-4 py-3 text-body">
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}