import { useQuery } from '@tanstack/react-query'
import { MessageCircleQuestion, SearchX } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@visagate/ui/overlays'
import { Button } from '@visagate/ui/Button'
import { Container, Section } from '@visagate/ui/Container'
import { EmptyState, Skeleton } from '@visagate/ui/feedback'
import { Select, SelectItem } from '@visagate/ui/Select'
import { TextField } from '@visagate/ui/inputs'
import { PageHeader } from '../components/domain/PageHeader.jsx'
import { getFaqCategories, getFaqs } from '../services/contentService.js'
import { localize } from '../lib/format.js'
import { localePath } from '../config/site.js'

/**
 * Help centre (FR-PUB-07, §6.10): search first, then categories, then
 * questions. Searching matches both locales, so an Arabic query can find an
 * English answer and vice versa.
 */
export default function HelpPage() {
  const { t, i18n } = useTranslation()
  const { locale } = useParams()
  const [searchParams] = useSearchParams()
  const language = i18n.resolvedLanguage

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [openItems, setOpenItems] = useState(searchParams.get('faq') ? [searchParams.get('faq')] : [])

  const { data: categories = [] } = useQuery({
    queryKey: ['faq-categories'],
    queryFn: getFaqCategories,
  })

  const { data: faqs = [], isFetching } = useQuery({
    queryKey: ['faqs', { query, category }],
    queryFn: () => getFaqs({ query, category: category || undefined }),
  })

  return (
    <>
      <PageHeader
        title={t('helpPage.title')}
        description={t('helpPage.subtitle')}
        breadcrumbs={[{ label: t('nav.help'), key: 'help' }]}
      >
        <div className="mt-6 grid max-w-3xl gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <TextField
              label={t('helpPage.searchLabel')}
              type="search"
              placeholder={t('helpPage.searchPlaceholder')}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Select
            label={t('helpPage.categoryLabel')}
            value={category}
            onValueChange={setCategory}
          >
            <SelectItem value="all">{t('helpPage.categoryAll')}</SelectItem>
            {categories.map((entry) => (
              <SelectItem key={entry.code} value={entry.code}>
                {localize(entry.name, language)}
              </SelectItem>
            ))}
          </Select>
        </div>
      </PageHeader>

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              {isFetching ? (
                <Skeleton className="h-72" />
              ) : faqs.length === 0 ? (
                <EmptyState
                  icon={SearchX}
                  title={t('helpPage.emptyTitle')}
                  description={t('helpPage.emptyDescription')}
                  action={
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setQuery('')
                        setCategory('')
                      }}
                    >
                      {t('helpPage.clearFilters')}
                    </Button>
                  }
                />
              ) : (
                <>
                  <p className="text-neutral-700 mb-4 text-small" role="status" aria-live="polite">
                    {t('helpPage.resultCount', { count: faqs.length })}
                  </p>

                  <Accordion
                    type="multiple"
                    value={openItems}
                    onValueChange={setOpenItems}
                    className="border-neutral-300 rounded-card border px-5"
                  >
                    {faqs.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id}>
                        <AccordionTrigger>{localize(faq.question, language)}</AccordionTrigger>
                        <AccordionContent>
                          <p>{localize(faq.answer, language)}</p>

                          {faq.relatedVisaSlugs.length > 0 ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {faq.relatedVisaSlugs.map((slug) => (
                                <Button key={slug} variant="tertiary" size="s" asChild>
                                  <Link to={localePath(locale, `/visas/${slug}`)}>
                                    {t('helpPage.relatedVisa')}
                                  </Link>
                                </Button>
                              ))}
                            </div>
                          ) : null}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </>
              )}
            </div>

            <aside className="lg:col-span-4">
              <div className="bg-primary-100 rounded-card p-6">
                <MessageCircleQuestion
                  aria-hidden="true"
                  className="text-primary-700 size-7"
                />
                <h2 className="text-h3 mt-3 font-semibold">{t('helpPage.contactTitle')}</h2>
                <p className="text-neutral-700 mt-2 text-small">{t('helpPage.contactSubtitle')}</p>
                <Button className="mt-4" asChild>
                  <Link to={localePath(locale, '/help/contact')}>{t('helpPage.contactCta')}</Link>
                </Button>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  )
}