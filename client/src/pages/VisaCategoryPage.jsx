import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Container, Section } from '@visagate/ui/Container'
import { Skeleton } from '@visagate/ui/feedback'
import { PageHeader } from '../components/domain/PageHeader.jsx'
import { VisaCard } from '../components/domain/VisaCard.jsx'
import { getCategories, getVisaTypes } from '../services/catalogService.js'
import { computeFee } from '../lib/fees.js'
import { localize } from '../lib/format.js'
import { NotFoundPage } from './ErrorPages.jsx'
import { localePath } from '../config/site.js'

/** All visa types in one category (FR-PUB-03). */
export default function VisaCategoryPage() {
  const { t, i18n } = useTranslation()
  const { locale, categoryKey } = useParams()
  const language = i18n.resolvedLanguage

  const { data: categories = [] } = useQuery({
    queryKey: ['visa-categories'],
    queryFn: getCategories,
  })

  const category = categories.find((entry) => entry.key === categoryKey)

  const { data: visaTypes = [], isLoading } = useQuery({
    queryKey: ['visa-types', { locale: language }],
    queryFn: () => getVisaTypes({ locale: language }),
    enabled: Boolean(category),
  })

  if (categories.length > 0 && !category) return <NotFoundPage />

  const items = visaTypes.filter((visaType) => visaType.categoryCode === category?.code)

  return (
    <>
      <PageHeader
        title={category ? localize(category.name, language) : t('catalog.title')}
        description={category ? localize(category.description, language) : undefined}
        breadcrumbs={[
          { label: t('nav.visas'), to: '/visas', key: 'visas' },
          { label: category ? localize(category.name, language) : '…', key: 'category' },
        ]}
      />

      <Section>
        <Container>
          {isLoading ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {[0, 1].map((index) => (
                <Skeleton key={index} className="h-64" />
              ))}
            </div>
          ) : (
            <>
              <ul className="grid gap-5 lg:grid-cols-2">
                {items.map((visaType) => (
                  <li key={visaType.id}>
                    <VisaCard
                      visaType={visaType}
                      feePreview={computeFee(visaType.feeSchedule, { locale: language })}
                    />
                  </li>
                ))}
              </ul>

              <p className="text-neutral-700 mt-8 text-small">
                <Link
                  to={localePath(locale, '/visas')}
                  className="text-primary-700 underline underline-offset-4"
                >
                  {t('catalog.backToAll')}
                </Link>
              </p>
            </>
          )}
        </Container>
      </Section>
    </>
  )
}