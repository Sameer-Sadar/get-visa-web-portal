import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Container, Section } from '@visagate/ui/Container'
import { Skeleton } from '@visagate/ui/feedback'
import { PageHeader } from '../components/domain/PageHeader.jsx'
import { getCmsPage } from '../services/contentService.js'
import { localize } from '../lib/format.js'
import { NotFoundPage } from './ErrorPages.jsx'

/**
 * CMS-driven legal and informational pages (FR-PUB-06): About, Terms, Privacy,
 * Cookies, Accessibility.
 *
 * Content arrives as structured blocks rather than HTML, so the renderer has
 * no injection surface. Real CMS HTML still needs sanitising (§19) — that
 * belongs in the CMS layer, not here.
 */
export default function CmsPage({ slug: slugProp }) {
  const { t, i18n } = useTranslation()
  const params = useParams()
  /* Each slug has its own static route, so the slug arrives as a prop; the
     param is the fallback for any future `:slug` route. */
  const slug = slugProp ?? params.slug
  const language = i18n.resolvedLanguage

  const { data: page, isLoading } = useQuery({
    queryKey: ['cms-page', slug],
    queryFn: () => getCmsPage(slug),
  })

  if (!isLoading && !page) return <NotFoundPage />

  return (
    <>
      <PageHeader
        title={page ? localize(page.title, language) : ''}
        description={page ? localize(page.summary, language) : undefined}
        breadcrumbs={[{ label: page ? localize(page.title, language) : '…', key: slug }]}
      />

      <Section>
        <Container size="narrow">
          {isLoading || !page ? (
            <Skeleton className="h-96" />
          ) : (
            <div className="space-y-6">
              {page.blocks.map((block, index) => (
                <Block key={`${block.type}-${index}`} block={block} language={language} />
              ))}

              <p className="text-neutral-700 border-neutral-300 border-t pt-6 text-small">
                {t('footer.independentService')}: {t('brand.independentService')}
              </p>
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}

function Block({ block, language }) {
  switch (block.type) {
    case 'heading': {
      const Heading = `h${Math.min(block.level ?? 2, 3)}`
      return (
        <Heading className={Heading === 'h2' ? 'text-h2 mt-8 font-semibold' : 'text-h3 mt-6 font-semibold'}>
          {localize(block.text, language)}
        </Heading>
      )
    }

    case 'paragraph':
      return <p className="mt-3">{localize(block.text, language)}</p>

    case 'list':
      return (
        <ul className="mt-3 space-y-2">
          {block.items.map((item, index) => (
            <li key={index} className="flex gap-3">
              <span aria-hidden="true" className="text-primary-700 mt-2">
                ●
              </span>
              <span>{localize(item, language)}</span>
            </li>
          ))}
        </ul>
      )

    default:
      return null
  }
}