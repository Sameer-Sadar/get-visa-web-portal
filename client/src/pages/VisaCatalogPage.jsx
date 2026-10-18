import { useQuery } from '@tanstack/react-query'
import { SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@visagate/ui/Button'
import { Container, Section } from '@visagate/ui/Container'
import { EmptyState, Skeleton } from '@visagate/ui/feedback'
import { TextField } from '@visagate/ui/inputs'
import { PageHeader } from '../components/domain/PageHeader.jsx'
import { VisaCard } from '../components/domain/VisaCard.jsx'
import { getCategories, getVisaTypes } from '../services/catalogService.js'
import { computeFee } from '../lib/fees.js'
import { localize } from '../lib/format.js'
import { normalizeSearchText } from '../lib/search.js'

/** Visa catalog (FR-PUB-03), grouped by category with free-text search. */
export default function VisaCatalogPage() {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage
  const [query, setQuery] = useState('')

  const { data: visaTypes = [], isLoading } = useQuery({
    queryKey: ['visa-types', { locale: language }],
    queryFn: () => getVisaTypes({ locale: language }),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['visa-categories'],
    queryFn: getCategories,
  })

  const grouped = useMemo(() => {
    const needle = normalizeSearchText(query)

    const matching = needle
      ? visaTypes.filter((visaType) =>
          normalizeSearchText(
            `${localize(visaType.name, language)} ${localize(visaType.summary, language)}`,
          ).includes(needle),
        )
      : visaTypes

    return categories
      .map((category) => ({
        category,
        items: matching.filter((visaType) => visaType.categoryCode === category.code),
      }))
      .filter((group) => group.items.length > 0)
  }, [visaTypes, categories, query, language])

  return (
    <>
      <PageHeader
        title={t('catalog.title')}
        description={t('catalog.subtitle')}
        breadcrumbs={[{ label: t('catalog.title'), key: 'catalog' }]}
      >
        <div className="mt-6 max-w-md">
          <TextField
            label={t('catalog.searchLabel')}
            type="search"
            placeholder={t('catalog.searchPlaceholder')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </PageHeader>

      <Section>
        <Container>
          {isLoading ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {[0, 1, 2, 3].map((index) => (
                <Skeleton key={index} className="h-64" />
              ))}
            </div>
          ) : grouped.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title={t('catalog.emptyTitle')}
              description={t('catalog.emptyDescription')}
              action={
                <Button variant="secondary" onClick={() => setQuery('')}>
                  {t('catalog.clearSearch')}
                </Button>
              }
            />
          ) : (
            <div className="space-y-12">
              {grouped.map(({ category, items }) => (
                <section key={category.code} aria-labelledby={`group-${category.code}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2
                      id={`group-${category.code}`}
                      className="text-h2 font-semibold"
                    >
                      {localize(category.name, language)}
                    </h2>
                    <p className="text-neutral-700 text-small">
                      {localize(category.description, language)}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-5 lg:grid-cols-2">
                    {items.map((visaType) => (
                      <VisaCard
                        key={visaType.id}
                        visaType={visaType}
                        feePreview={computeFee(visaType.feeSchedule, { locale: language })}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}