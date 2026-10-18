import { localize } from './format.js'

/**
 * Fee calculation from a `feeSchedules` document (schema §4.3).
 *
 * BR-06: fees are calculated server-side using the schedule effective on the
 * submission date, then snapshotted onto the application. This client-side
 * version exists so the applicant sees a full, honest breakdown *before*
 * registering (§13: "clear fee transparency before the user registers"); the
 * server remains authoritative and the snapshot is what gets charged.
 *
 * Output mirrors `applications.feeQuote.lines` (schema §5.3) so the payment
 * step and the pre-registration quote render from one shape.
 */
export function computeFee(schedule, { travelerCount = 1, locale = 'en', includeOptional = false } = {}) {
  const components = [...(schedule?.components ?? [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  )

  const quantityFor = (component) =>
    component.appliesTo === 'PER_APPLICATION' ? 1 : Math.max(1, travelerCount)

  /* Fixed components first — percentage components are a share of the fixed
     base, so they cannot be resolved in a single pass. */
  const fixedSubtotalByCode = new Map()

  const lines = components
    .filter((component) => includeOptional || !component.isOptional)
    .map((component) => {
      const qty = quantityFor(component)

      if (component.amountMinor == null) return { component, qty, deferred: true }

      const amountMinor = component.amountMinor * qty
      fixedSubtotalByCode.set(component.code, amountMinor)

      return { component, qty, amountMinor }
    })

  const resolved = []

  for (const line of lines) {
    const { component, qty } = line

    if (line.deferred) {
      const baseMinor = (component.baseCodes ?? []).reduce(
        (sum, code) => sum + (fixedSubtotalByCode.get(code) ?? 0),
        0,
      )
      const amountMinor = Math.round((baseMinor * (component.percentBp ?? 0)) / 10_000)

      resolved.push({ component, qty, amountMinor, baseMinor })
      continue
    }

    resolved.push(line)
  }

  const totalMinor = resolved.reduce((sum, line) => sum + line.amountMinor, 0)

  return {
    currency: schedule?.currency ?? 'SAR',
    travelerCount,
    totalMinor,
    optionalExcluded: components.some((component) => component.isOptional) && !includeOptional,
    lines: resolved.map(({ component, qty, amountMinor }) => ({
      code: component.code,
      kind: component.kind,
      label: localize(component.label, locale) || null,
      qty,
      unitMinor: component.amountMinor ?? null,
      percentBp: component.percentBp ?? null,
      amountMinor,
      isOptional: Boolean(component.isOptional),
      isRefundable: Boolean(component.isRefundable),
      appliesTo: component.appliesTo,
    })),
  }
}

/**
 * Headline "from" price for cards and finder results — required components
 * only, so an optional insurance add-on is never presented as mandatory
 * (§13: "no hidden fees or pre-selected add-ons").
 */
export function minimumFee(schedule, options) {
  return computeFee(schedule, options).totalMinor
}