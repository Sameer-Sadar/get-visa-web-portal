import { NATIONALITY_GROUPS, countryByCode } from '../fixtures/countries.js'
import { computeFee } from '../lib/fees.js'
import { apiFetch, isMockMode, mockLatency } from './apiClient.js'
import { documentTypeByCode } from '../fixtures/documentTypes.js'
import { visaTypes } from '../fixtures/visaCatalog.js'

/**
 * Visa Finder (FR-FND-01..04).
 *
 * Design principle: "guide, don't gatekeep" (§1). A refusal is only returned
 * when we know why, and it always comes with the reason and an alternative —
 * never a dead end.
 *
 * ⚠️ FR-FND-04 requires this evaluation to happen **server-side** against the
 * configurable `eligibilityRules` collection. The logic below is a faithful
 * stand-in that exercises the same `{ effect, reason, conditions }` response
 * shape, so swapping in `POST /finder/search` changes nothing above this file.
 * It must never be treated as authoritative.
 */

const CATEGORY_NATIONALITY_GROUPS = {
  VISIT: ['GROUP_A', 'GROUP_B', 'GROUP_C', 'GROUP_D', 'GROUP_E'],
  TRANSIT: ['GROUP_A', 'GROUP_B', 'GROUP_C', 'GROUP_D', 'GROUP_E'],
  WORK: ['GROUP_A', 'GROUP_B', 'GROUP_C', 'GROUP_D'],
  RESIDENCE: ['GROUP_A', 'GROUP_B', 'GROUP_C'],
  STUDY: ['GROUP_A', 'GROUP_B', 'GROUP_C', 'GROUP_E'],
  SPECIAL: ['GROUP_A', 'GROUP_B', 'GROUP_C', 'GCC'],
  SERVICES: ['GROUP_A', 'GROUP_B', 'GROUP_C', 'GROUP_D', 'GROUP_E'],
}

function groupsForCountry(countryCode) {
  return NATIONALITY_GROUPS.filter((group) => group.members.includes(countryCode)).map(
    (group) => group.code,
  )
}

function evaluate(visaType, criteria) {
  const groups = groupsForCountry(criteria.nationalityCode)
  const eligibleGroups = CATEGORY_NATIONALITY_GROUPS[visaType.categoryCode] ?? []
  const nationalityName = countryByCode.get(criteria.nationalityCode)?.names

  /* Not eligible: the nationality cannot use this visa category at all. */
  if (!groups.some((group) => eligibleGroups.includes(group))) {
    return {
      effect: 'NOT_ELIGIBLE',
      reason: {
        en: 'This visa type is not available to holders of this nationality.',
        ar: 'هذا النوع من التأشيرات غير متاح لحاملي هذه الجنسية.',
      },
      conditions: [],
    }
  }

  /* Not eligible: the purpose does not match what this visa is for. */
  if (criteria.purpose && !visaType.purposes.includes(criteria.purpose)) {
    return {
      effect: 'NOT_ELIGIBLE',
      reason: {
        en: 'This visa is not for this purpose of travel.',
        ar: 'هذه التأشيرة ليست للغرض الذي حددته للسفر.',
      },
      conditions: [],
    }
  }

  const conditions = []

  /* BR-04: passport validity is checked in the wizard, but a stay that
     outruns the visa's max stay is worth surfacing now. */
  if (criteria.stayDays && criteria.stayDays > visaType.maxStayDays) {
    conditions.push({
      en: `This visa allows a stay of up to ${visaType.maxStayDays} days. You planned ${criteria.stayDays} days.`,
      ar: `تتيح هذه التأشيرة إقامة حتى ${visaType.maxStayDays} يوماً. خطّطت لـ ${criteria.stayDays} يوماً.`,
    })
  }

  /* BR-10: minors need a guardian declaration. */
  if (criteria.age != null && visaType.minAge != null && criteria.age < visaType.minAge) {
    conditions.push({
      en: `Applicants must be ${visaType.minAge} or older. A guardian must sign the declaration.`,
      ar: `يجب أن يكون عمر المتقدم ${visaType.minAge} سنة أو أكثر. يجب أن يوقّع ولي الأمر على الإقرار.`,
    })
  }

  if (criteria.travelerCount > visaType.maxTravelers) {
    conditions.push({
      en: `This visa allows up to ${visaType.maxTravelers} travelers per application. You selected ${criteria.travelerCount}.`,
      ar: `تتيح هذه التأشيرة حتى ${visaType.maxTravelers} مسافر في الطلب الواحد. اخترت ${criteria.travelerCount}.`,
    })
  }

  if (visaType.requiresSponsor) {
    conditions.push({
      en: 'You need a host or employer to confirm the invitation.',
      ar: 'تحتاج إلى مضيف أو صاحب عمل يؤكد الدعوة.',
    })
  }

  return {
    effect: conditions.length > 0 ? 'CONDITIONAL' : 'ELIGIBLE',
    reason: null,
    conditions,
    /* Kept so the results page can explain the nationality decision in the
       applicant's own language rather than showing a bare "not eligible". */
    nationalityContext: nationalityName,
  }
}

/**
 * Ranks results by relevance (FR-FND-02): visa-free routes first, then the
 * closest match, with the shortfall for "not available" made explicit.
 */
function rank(results) {
  const order = { ELIGIBLE: 0, CONDITIONAL: 1, NOT_ELIGIBLE: 2 }

  return [...results].sort((a, b) => {
    if (order[a.eligibility.effect] !== order[b.eligibility.effect]) {
      return order[a.eligibility.effect] - order[b.eligibility.effect]
    }
    if (a.visaType.processingSlaHours !== b.visaType.processingSlaHours) {
      return a.visaType.processingSlaHours - b.visaType.processingSlaHours
    }
    return a.visaType.sortOrder - b.visaType.sortOrder
  })
}

export async function searchVisas(criteria, { locale = 'en' } = {}) {
  if (isMockMode) {
    await mockLatency()

    const results = visaTypes
      .filter((visaType) => visaType.isActive)
      .filter((visaType) => !criteria.purpose || visaType.purposes.includes(criteria.purpose))
      .map((visaType) => {
        const eligibility = evaluate(visaType, criteria)

        return {
          visaType: {
            ...visaType,
            documents: visaType.documents.map((requirement) => ({
              ...requirement,
              documentType: documentTypeByCode.get(requirement.code),
            })),
          },
          eligibility,
          feePreview: computeFee(visaType.feeSchedule, {
            travelerCount: criteria.travelerCount ?? 1,
            locale,
          }),
        }
      })

    return {
      criteria,
      groups: groupsForCountry(criteria.nationalityCode),
      results: rank(results),
    }
  }

  return apiFetch('/finder/search', { method: 'POST', body: criteria, locale })
}