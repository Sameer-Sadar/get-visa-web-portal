import { announcements, cmsPages, faqCategories, faqs } from '../fixtures/content.js'
import { normalizeSearchText } from '../lib/search.js'
import { apiFetch, isMockMode, mockLatency } from './apiClient.js'

/**
 * CMS reads (FR-PUB-06..08): announcements, FAQ with search, static pages.
 */

export async function getActiveAnnouncements({ now = new Date() } = {}) {
  if (isMockMode) {
    await mockLatency()
    const timestamp = now.getTime()

    return announcements.filter((announcement) => {
      if (!announcement.isActive) return false
      const published = new Date(announcement.publishedAt).getTime()
      const expires = new Date(announcement.expiresAt).getTime()
      return published <= timestamp && timestamp <= expires
    })
  }

  return apiFetch('/content/announcements?active=true')
}

export async function getFaqCategories() {
  if (isMockMode) {
    await mockLatency()
    return faqCategories
  }

  return apiFetch('/catalog/faq-categories')
}

/**
 * FR-PUB-07: FAQ with search and categories. Matching runs over both locales so
 * a search typed in Arabic can still match English content, and vice versa —
 * users mix the two freely on bilingual portals.
 */
export async function getFaqs({ query = '', category } = {}) {
  if (isMockMode) {
    await mockLatency()

    const needle = normalizeSearchText(query)

    return faqs
      .filter((faq) => !category || faq.category === category)
      .filter((faq) => {
        if (!needle) return true
        const haystack = normalizeSearchText(
          `${faq.question.en} ${faq.question.ar} ${faq.answer.en} ${faq.answer.ar}`,
        )
        return haystack.includes(needle)
      })
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }

  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (category) params.set('category', category)
  return apiFetch(`/content/faqs?${params}`)
}

export async function getCmsPage(slug) {
  if (isMockMode) {
    await mockLatency()
    return cmsPages[slug] ?? null
  }

  return apiFetch(`/content/pages/${slug}`)
}