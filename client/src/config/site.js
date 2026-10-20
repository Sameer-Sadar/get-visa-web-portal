/**
 * Single source of truth for anything that would otherwise be hardcoded in
 * components: brand, operator identity, navigation structure.
 *
 * ⚠️ `operator` must be completed before go-live. PRD §12 requires the
 * operator's legal name and contact details on every page, and §1 forbids
 * presenting the portal as, or in the visual style of, a government
 * authority. The placeholders below are deliberately non-official.
 */

export const site = {
  brand: {
    name: 'VisaGate',
    /** Used in <title> and structured data; the visible wordmark is translated. */
    legalName: 'VisaGate',
  },

  operator: {
    legalName: '[Operator legal entity]',
    registrationNumber: '[Registration number]',
    address: '[Registered address]',
    supportEmail: 'support@example.com',
    supportPhone: '+000 000 0000',
    /**
     * Shown in the footer on every page (PRD §12). Wording is fixed by policy,
     * not marketing — do not soften it.
     */
    independentServiceStatementKey: 'brand.independentService',
  },

  /** Public header links (§3.3). Paths are locale-relative. */
  primaryNav: [
    { key: 'visas', path: '/visas' },
    { key: 'findAVisa', path: '/find-a-visa' },
    { key: 'track', path: '/track' },
    { key: 'help', path: '/help' },
  ],

  /** Visa categories from PRD Appendix B, grouped for the footer and Find a visa menu. */
  visaCategories: [
    { key: 'visit', path: '/visas/category/visit', icon: 'Plane' },
    { key: 'transit', path: '/visas/category/transit', icon: 'Route' },
    { key: 'work', path: '/visas/category/work', icon: 'Briefcase' },
    { key: 'residence', path: '/visas/category/residence', icon: 'Home' },
    { key: 'study', path: '/visas/category/study', icon: 'GraduationCap' },
    { key: 'special', path: '/visas/category/special', icon: 'ShieldCheck' },
    { key: 'services', path: '/visas/category/services', icon: 'RefreshCw' },
  ],

  /** Second column in the Find a visa hover menu. */
  findAVisaInfoLinks: [
    { key: 'browseAll', path: '/visas', labelKey: 'header.browseAllVisas' },
    { key: 'finder', path: '/find-a-visa', labelKey: 'nav.findAVisa' },
    { key: 'help', path: '/help', labelKey: 'nav.help' },
    { key: 'contact', path: '/help/contact', labelKey: 'footer.contact' },
  ],

  footerNav: [
    {
      headingKey: 'footer.help',
      links: [
        { key: 'help.faq', path: '/help/faq' },
        { key: 'help.guides', path: '/help/guides' },
        { key: 'help.contact', path: '/help/contact' },
      ],
    },
    {
      headingKey: 'footer.legal',
      links: [
        { key: 'nav.terms', path: '/terms' },
        { key: 'nav.privacy', path: '/privacy' },
        { key: 'nav.cookies', path: '/cookies' },
        { key: 'nav.accessibility', path: '/accessibility' },
        { key: 'nav.about', path: '/about' },
      ],
    },
  ],
}

/** Builds a locale-prefixed href: localePath('en', '/visas') → '/en/visas'. */
export function localePath(locale, path = '/') {
  return `/${locale}${path === '/' ? '' : path}`
}