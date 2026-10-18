import { createPortal } from 'react-dom'
import { SUPPORTED_LOCALES } from '@visagate/i18n'

/**
 * Per-page document head (§19).
 *
 * A React SPA has one static `index.html`, so every page has to set its own
 * `<title>`, description, canonical URL and `hreflang` alternates — without
 * this the whole portal is effectively a single page to a crawler, which
 * threatens FR-PUB-03/04.
 *
 * React 19 hoists `<title>`, `<meta>` and `<link>` into `<head>` wherever they
 * are rendered, so these are plain elements. An earlier version used
 * `react-helmet-async`, which the platform now does for free — dropping it
 * removed ~5 KB gzip from the home route and one more moving part. Inline
 * `<script>` is *not* hoisted, so the JSON-LD block is portalled into the head
 * explicitly.
 *
 * ⚠️ React 19 hoists but does **not** deduplicate, so exactly one component
 * may own each tag. That is why:
 *   - `index.html` carries no static `<title>` or `<meta name="description">`;
 *   - `robots` is emitted by `<LocaleLayout>` alone, derived from the URL, so
 *     a route physically cannot forget it (this component deliberately does not
 *     take `noindex`);
 *   - only one of these renders per page, which the app shell guarantees by
 *     rendering the robots-only variant when `path` is omitted.
 *
 * `path` is the locale-relative path (e.g. `/visas/tourism-single-entry`).
 * **Omit it** to publish nothing at all — that is what the shell does, so
 * exactly one canonical/hreflang set exists per page. Two competing canonical
 * links is invalid HTML, and search engines resolve the conflict arbitrarily.
 */

const SITE_URL = import.meta.env.VITE_SITE_URL ?? ''

function absoluteUrl(locale, path) {
  const origin = SITE_URL || (typeof window === 'undefined' ? '' : window.location.origin)
  const clean = path === '/' ? '' : path.replace(/\/$/, '')
  return `${origin}/${locale}${clean}`
}

export function PageMeta({ title, description, path, locale, structuredData }) {
  /* Shell-level instance: publishes nothing, so it never competes with the
     page's own canonical and hreflang tags. */
  if (path === undefined) return null

  const fullTitle = title ? `${title} | VisaGate` : 'VisaGate'

  return (
    <>
      <title>{fullTitle}</title>
      {description ? <meta name="description" content={description} /> : null}

      <link rel="canonical" href={absoluteUrl(locale, path)} />

      {/* Alternates let a crawler index both languages of the same page. */}
      {SUPPORTED_LOCALES.map((code) => (
        <link
          key={code}
          rel="alternate"
          hrefLang={code}
          href={absoluteUrl(code, path)}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={absoluteUrl(SUPPORTED_LOCALES[0], path)}
      />

      {structuredData && typeof document !== 'undefined'
        ? createPortal(
            <script type="application/ld+json">{JSON.stringify(structuredData)}</script>,
            document.head,
          )
        : null}
    </>
  )
}