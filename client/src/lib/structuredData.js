/**
 * Structured data builders (schema.org) for the public pages (§5.1 asks for
 * FAQ and Breadcrumb markup).
 *
 * Kept out of `PageMeta.jsx` so that file exports only a component, which
 * keeps React Fast Refresh working.
 */

function localizeField(field, locale) {
  if (field == null) return ''
  if (typeof field === 'string') return field
  return field[locale] ?? field.en ?? ''
}

/** FAQPage markup from `LocalizedText` question/answer pairs. */
export function faqStructuredData(faqs, locale, baseUrl = '') {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: localizeField(faq.question, locale),
      acceptedAnswer: { '@type': 'Answer', text: localizeField(faq.answer, locale) },
    })),
    ...(baseUrl ? { url: baseUrl } : {}),
  }
}

/** BreadcrumbList markup for pages at depth ≥ 2. */
export function breadcrumbStructuredData(items, locale, absoluteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: localizeField(item.label, locale),
      item: absoluteUrl ? absoluteUrl(item.path ?? '/') : undefined,
    })),
  }
}

/** VisaProduct markup for a visa detail page — the page most likely to be
 *  searched, and the one a rich result would help most. */
export function visaStructuredData(visaType, locale, { priceMinor, currency, url }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: localizeField(visaType.name, locale),
    description: localizeField(visaType.summary, locale),
    serviceType: localizeField(visaType.summary, locale),
    provider: { '@type': 'Organization', name: 'VisaGate' },
    offers: {
      '@type': 'Offer',
      price: (priceMinor ?? 0) / 100,
      priceCurrency: currency ?? 'SAR',
      availability: 'https://schema.org/InStock',
      url,
    },
  }
}