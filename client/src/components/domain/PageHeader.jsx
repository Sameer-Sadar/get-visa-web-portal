import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { Breadcrumbs } from '@visagate/ui/navigation'
import { Container } from '@visagate/ui/Container'
import { Link, useParams } from 'react-router-dom'
import { PageMeta } from '../../app/PageMeta.jsx'
import { localePath } from '../../config/site.js'

/**
 * Page header with breadcrumbs — required on every page at depth ≥ 2 (§3.3).
 *
 * Also publishes the document head for the page. Doing it here rather than in
 * each page means no route can ship without a title, description, canonical
 * and hreflang alternates — which is the failure mode §19 warns about for a
 * single-page app.
 *
 * Indexing policy is not set here: <LocaleLayout> owns `robots` for the whole
 * shell, because it can derive it from the URL and no page can forget to opt in.
 */
export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
  structuredData,
  children,
}) {
  const { t } = useTranslation()
  const { locale } = useParams()
  const { pathname } = useLocation()

  /* Strip the locale prefix to get the locale-relative path used for
     canonical and hreflang URLs. */
  const relativePath = pathname.replace(new RegExp(`^/${locale}`), '') || '/'

  const items = [
    { label: t('brand.name'), to: localePath(locale), key: 'home' },
    ...breadcrumbs.map((crumb) => ({
      label: crumb.label,
      to: crumb.to ? localePath(locale, crumb.to) : undefined,
      key: crumb.key ?? crumb.label,
    })),
  ]

  return (
    <>
      <PageMeta
        title={title}
        description={description}
        path={relativePath}
        locale={locale}
        structuredData={structuredData}
      />

      <div className="bg-surface border-neutral-300 border-b">
        <Container className="py-8">
          {breadcrumbs.length > 0 ? <Breadcrumbs items={items} className="mb-4" /> : null}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              {title ? <h1 className="text-h2 font-bold">{title}</h1> : null}
              {description ? <p className="text-neutral-700 mt-2 text-lg">{description}</p> : null}
            </div>
            {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
          </div>

          {children}
        </Container>
      </div>
    </>
  )
}

/** Convenience wrapper for CMS/legal pages driven by a `cmsPages` document. */
export function LegalPageHeader({ page }) {
  return <PageHeader title={page.title} description={page.summary} />
}

/** Link that keeps the locale prefix — used in cards and inline prose. */
export function LocalizedLink({ to, children, className, ...props }) {
  const { locale } = useParams()

  return (
    <Link to={localePath(locale, to)} className={className} {...props}>
      {children}
    </Link>
  )
}