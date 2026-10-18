import { computeFee } from '../lib/fees.js'
import { apiFetch, isMockMode, mockLatency } from './apiClient.js'
import { documentTypeByCode } from '../fixtures/documentTypes.js'
import { visaCategories, visaTypeBySlug, visaTypes } from '../fixtures/visaCatalog.js'

/**
 * Catalog reads (TRD §5.2, Catalog & Finder endpoints).
 *
 * Every function is async and returns the shape the UI needs, so switching from
 * fixtures to the API is invisible above this layer.
 */

/** Resolves document requirement codes to full document definitions. */
function withDocuments(visaType) {
  return {
    ...visaType,
    documents: visaType.documents.map((requirement) => ({
      ...requirement,
      documentType: documentTypeByCode.get(requirement.code),
    })),
  }
}

export async function getCategories() {
  if (isMockMode) {
    await mockLatency()
    return visaCategories.filter((category) => category.isActive)
  }

  return apiFetch('/catalog/categories')
}

export async function getVisaTypes({ categoryCode, locale } = {}) {
  if (isMockMode) {
    await mockLatency()
    return visaTypes
      .filter((visaType) => visaType.isActive)
      .filter((visaType) => !categoryCode || visaType.categoryCode === categoryCode)
      .map(withDocuments)
  }

  const query = categoryCode ? `?category=${categoryCode}` : ''
  return apiFetch(`/catalog/visa-types${query}`, { locale })
}

export async function getVisaTypeBySlug(slug) {
  if (isMockMode) {
    await mockLatency()
    const visaType = visaTypeBySlug.get(slug)
    return visaType?.isActive ? withDocuments(visaType) : null
  }

  return apiFetch(`/catalog/visa-types/${slug}`)
}

/**
 * Pre-registration fee preview (FR-PAY-01, surfaced on the visa detail page
 * before the user has an account — §13 transparency).
 */
export async function getFeePreview(slug, { travelerCount = 1, locale = 'en' } = {}) {
  if (isMockMode) {
    await mockLatency()
    const visaType = visaTypeBySlug.get(slug)
    if (!visaType) return null

    return computeFee(visaType.feeSchedule, { travelerCount, locale })
  }

  return apiFetch(`/catalog/visa-types/${slug}/fee-preview?travelers=${travelerCount}`, { locale })
}