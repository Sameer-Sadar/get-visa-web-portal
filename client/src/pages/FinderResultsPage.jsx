import { useQuery } from '@tanstack/react-query'
import { CircleCheck, Info, SearchX, TriangleAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Badge } from '@visagate/ui/Badge'
import { Container, Section } from '@visagate/ui/Container'
import { EmptyState, Skeleton } from '@visagate/ui/feedback'
import { FinderForm } from '../components/domain/FinderForm.jsx'
import { VisaCard } from '../components/domain/VisaCard.jsx'
import { searchVisas } from '../services/finderService.js'
import { countryByCode } from '../fixtures/countries.js'
import { localize } from '../lib/format.js'

const EFFECTS = {
  ELIGIBLE: { Icon: CircleCheck, tone: 'success' },
  CONDITIONAL: { Icon: TriangleAlert, tone: 'warning' },
  NOT_ELIGIBLE: { Icon: SearchX, tone: 'danger' },
}

/**
 * Finder results (§6.2).
 *
 * Three ordered sections — available to you, conditions apply, not available —
 * with the last one collapsed by default. A refusal always explains itself:
 * the spec is explicit that we must not simply show "not eligible".
 */
export default function FinderResultsPage() {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage
  const [searchParams, setSearchParams] = useSearchParams()
  const [showUnavailable, setShowUnavailable] = useState(false)

  const criteria = useMemo(
    () => ({
      nationalityCode: searchParams.get('nationality') ?? '',
      purpose: searchParams.get('purpose') ?? '',
      arrivalDate: searchParams.get('arrival') ?? '',
      stayDays: searchParams.get('stay') ? Number(searchParams.get('stay')) : null,
      travelerCount: Number(searchParams.get('travelers')) || 1,
    }),
    [searchParams],
  )

  const hasCriteria = Boolean(criteria.nationalityCode && criteria.purpose)

  const { data, isLoading } = useQuery({
    queryKey: ['finder', criteria, language],
    queryFn: () => searchVisas(criteria, { locale: language }),
    enabled: hasCriteria,
  })

  const grouped = useMemo(() => {
    const results = data?.results ?? []
    return {
      eligible: results.filter((entry) => entry.eligibility.effect === 'ELIGIBLE'),
      conditional: results.filter((entry) => entry.eligibility.effect === 'CONDITIONAL'),
      unavailable: results.filter((entry) => entry.eligibility.effect === 'NOT_ELIGIBLE'),
    }
  }, [data])

  const country = countryByCode.get(criteria.nationalityCode)

  const updateCriteria = (next) => {
    const params = new URLSearchParams()
    params.set('nationality', next.nationalityCode)
    params.set('purpose', next.purpose)
    params.set('travelers', String(next.travelerCount))
    if (next.arrivalDate) params.set('arrival', next.arrivalDate)
    setSearchParams(params)
  }

  return (
    <>
      {/* Editable summary of the inputs — results are only useful if you can
          correct them without going back (FR-FND-02). */}
      <div className="bg-surface border-neutral-300 border-b">
        <Container className="py-8">
          <h1 className="text-h2 font-bold">{t('results.title')}</h1>

          {country ? (
            <p className="text-neutral-700 mt-2">
              <span aria-hidden="true">{country.flag}</span>{' '}
              {localize(country.names, language)} · {t(`purpose.${criteria.purpose.toLowerCase()}`)}
              {criteria.travelerCount > 1
                ? ` · ${t('feeBreakdown.travelerCount', { count: criteria.travelerCount })}`
                : ''}
            </p>
          ) : null}

          <details className="border-neutral-300 mt-5 rounded-card border">
            <summary className="text-primary-700 min-h-11 cursor-pointer py-3 font-medium">
              {t('results.changeSearch')}
            </summary>
            <div className="pb-5">
              <FinderForm
                defaultValues={{
                  nationalityCode: criteria.nationalityCode,
                  purpose: criteria.purpose,
                  arrivalDate: criteria.arrivalDate,
                  travelerCount: String(criteria.travelerCount),
                }}
                onSearch={updateCriteria}
              />
            </div>
          </details>
        </Container>
      </div>

      <Section>
        <Container>
          {!hasCriteria ? (
            <EmptyState
              icon={SearchX}
              title={t('results.noSearchTitle')}
              description={t('results.noSearchDescription')}
            />
          ) : isLoading ? (
            <div className="space-y-10">
              {[0, 1].map((section) => (
                <div key={section}>
                  <Skeleton className="mb-4 h-8 w-64" />
                  <div className="grid gap-5 lg:grid-cols-2">
                    {[0, 1].map((index) => (
                      <Skeleton key={index} className="h-64" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : data?.results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title={t('results.emptyTitle')}
              description={t('results.emptyDescription')}
            />
          ) : (
            <div className="space-y-12">
              {grouped.eligible.length > 0 ? (
                <ResultSection
                  tone="success"
                  title={t('results.sectionEligible')}
                  entries={grouped.eligible}
                />
              ) : null}

              {grouped.conditional.length > 0 ? (
                <ResultSection
                  tone="warning"
                  title={t('results.sectionConditional')}
                  entries={grouped.conditional}
                />
              ) : null}

              {grouped.unavailable.length > 0 ? (
                <section>
                  <button
                    type="button"
                    onClick={() => setShowUnavailable((value) => !value)}
                    aria-expanded={showUnavailable}
                    className="border-neutral-300 text-neutral-900 hover:border-primary-700 inline-flex min-h-11 items-center gap-2 rounded-input border px-4 font-medium"
                  >
                    <Info aria-hidden="true" className="size-4" />
                    {t('results.sectionUnavailable', { count: grouped.unavailable.length })}
                  </button>

                  {showUnavailable ? (
                    <div className="mt-4 grid gap-5 lg:grid-cols-2">
                      {grouped.unavailable.map((entry) => (
                        <VisaCard
                          key={entry.visaType.id}
                          visaType={entry.visaType}
                          eligibility={entry.eligibility}
                          feePreview={entry.feePreview}
                          travelerCount={criteria.travelerCount}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-700 mt-2 text-small">
                      {t('results.unavailableHint')}
                    </p>
                  )}
                </section>
              ) : null}
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}

function ResultSection({ tone, title, entries }) {
  const { Icon, tone: badgeTone } = EFFECTS[tone] ?? EFFECTS.ELIGIBLE

  return (
    <section aria-labelledby={`section-${tone}`}>
      <div className="mb-4 flex items-center gap-3">
        <Icon aria-hidden="true" className="text-neutral-700 size-5" />
        <h2 id={`section-${tone}`} className="text-h3 font-semibold">
          {title}
        </h2>
        <Badge tone={badgeTone} size="s">
          <span className="ltr-nums">{entries.length}</span>
        </Badge>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {entries.map((entry) => (
          <VisaCard
            key={entry.visaType.id}
            visaType={entry.visaType}
            eligibility={entry.eligibility}
            feePreview={entry.feePreview}
          />
        ))}
      </div>
    </section>
  )
}