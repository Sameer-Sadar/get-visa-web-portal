import { useQuery } from '@tanstack/react-query'
import { ArrowRight, MessageCircleQuestion, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@visagate/ui/Button'
import { Card } from '@visagate/ui/Card'
import { Container, Section } from '@visagate/ui/Container'
import { cx } from '@visagate/ui/lib/cx.js'
import { localePath } from '../config/site.js'
import { PageMeta } from '../app/PageMeta.jsx'
import { faqStructuredData } from '../lib/structuredData.js'
import { CategoryIcon } from '../components/domain/CategoryIcon.jsx'
import { FinderForm } from '../components/domain/FinderForm.jsx'
import { HeroCarousel } from '../components/domain/HeroCarousel.jsx'
import { HowItWorks } from '../components/domain/HowItWorks.jsx'
import { VisaCard } from '../components/domain/VisaCard.jsx'
import { getFaqs } from '../services/contentService.js'
import { getCategories, getVisaTypes } from '../services/catalogService.js'
import { localize } from '../lib/format.js'

const PILL =
  'inline-flex min-h-11 items-center rounded-pill border border-neutral-300 bg-surface px-4 text-small font-semibold text-neutral-700 transition-colors hover:border-primary-700 hover:text-primary-700'

export default function HomePage() {
  const { t, i18n } = useTranslation()
  const { locale } = useParams()
  const language = i18n.resolvedLanguage

  const { data: visaTypes = [] } = useQuery({
    queryKey: ['visa-types'],
    queryFn: () => getVisaTypes({ locale: language }),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['visa-categories'],
    queryFn: getCategories,
  })

  const { data: faqs = [] } = useQuery({
    queryKey: ['faqs', { query: '' }],
    queryFn: () => getFaqs({ query: '' }),
  })

  const popular = visaTypes.filter((visaType) => visaType.sortOrder <= 2).slice(0, 4)

  return (
    <>
      <PageMeta
        title={t('meta.homeTitle')}
        description={t('meta.homeDescription')}
        path="/"
        locale={locale}
        structuredData={faqStructuredData(faqs.slice(0, 6), language)}
      />

      <HeroCarousel />

      <div className="relative z-10 -mt-10 px-4 sm:-mt-12 sm:px-6">
        <div className="bg-surface mx-auto flex max-w-75rem flex-wrap items-center justify-center gap-2 rounded-card px-4 py-4 shadow-3 sm:justify-between sm:px-6">
          <Link to={localePath(locale, '/visas')} className={cx(PILL, 'border-primary-700 bg-primary-100 text-primary-700')}>
            {t('home.categoryAll')}
          </Link>
          <ul className="flex flex-wrap items-center justify-center gap-2">
            {categories.slice(0, 5).map((category) => (
              <li key={category.code}>
                <Link
                  to={localePath(locale, `/visas/category/${category.key}`)}
                  className={PILL}
                >
                  {localize(category.name, language)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Section>
        <Container>
          <div className="max-w-3xl">
            <h2 className="text-h2 font-semibold">{t('home.findYourVisa')}</h2>
            <p className="text-neutral-700 mt-2">{t('home.findYourVisaText')}</p>
          </div>
          <Card className="mt-8 p-6 shadow-2 sm:p-8">
            <h3 className="text-h3 text-neutral-900 font-semibold">{t('finder.heading')}</h3>
            <p className="text-neutral-700 mt-1 mb-5">{t('finder.intro')}</p>
            <FinderForm />
          </Card>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <div className="overflow-hidden rounded-card bg-linear-to-r from-primary-800 to-primary-700 text-white shadow-2">
            <div className="grid gap-6 p-6 sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <div>
                <p className="text-accent-500 text-small font-semibold tracking-[0.16em] uppercase">
                  {t('home.packageKicker')}
                </p>
                <h2 className="text-h2 mt-2 font-semibold text-white">{t('home.packageTitle')}</h2>
                <p className="mt-3 max-w-2xl text-white/90">{t('home.packageDescription')}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to={localePath(locale, '/visas/category/visit')}
                    className="inline-flex min-h-11 items-center justify-center rounded-input bg-[#14573a] px-4 text-button font-semibold text-white hover:bg-[#0f3d2c]"
                  >
                    {t('home.packageCta')}
                  </Link>
                  <Link
                    to={localePath(locale, '/visas')}
                    className="inline-flex min-h-11 items-center justify-center rounded-input border border-white/70 px-4 text-button font-semibold text-white hover:bg-white/10"
                  >
                    {t('home.hero.learnMore')}
                  </Link>
                </div>
              </div>
              <dl className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  { label: t('home.statVisas'), value: t('home.statVisasValue') },
                  { label: t('home.statCountries'), value: t('home.statCountriesValue') },
                  { label: t('home.statSeconds'), value: t('home.statSecondsValue') },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-card bg-white/10 px-4 py-3">
                    <dd className="text-h2 font-bold text-white">{stat.value}</dd>
                    <dt className="text-small text-white/80">{stat.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-neutral-50">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-h2 font-semibold">{t('home.categoriesTitle')}</h2>
              <p className="text-neutral-700 mt-1">{t('home.categoriesSubtitle')}</p>
            </div>
            <Button variant="tertiary" asChild>
              <Link to={localePath(locale, '/visas')}>
                {t('home.allVisas')}
                <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>

          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <li key={category.code}>
                <Card interactive className="h-full">
                  <Link
                    to={localePath(locale, `/visas/category/${category.key}`)}
                    className="flex h-full gap-4 p-5 after:absolute after:inset-0 after:content-['']"
                  >
                    <span className="bg-primary-100 text-primary-700 grid size-11 shrink-0 place-items-center rounded-pill">
                      <CategoryIcon name={category.icon} className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="text-neutral-900 block text-h3 font-semibold">
                        {localize(category.name, language)}
                      </span>
                      <span className="text-neutral-700 mt-1 block text-small">
                        {localize(category.description, language)}
                      </span>
                    </span>
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="text-h2 font-semibold">{t('home.popularTitle')}</h2>
          <p className="text-neutral-700 mt-1">{t('home.popularSubtitle')}</p>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {popular.map((visaType) => (
              <VisaCard key={visaType.id} visaType={visaType} />
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-neutral-50">
        <Container>
          <h2 className="text-h2 font-semibold">{t('home.howItWorksTitle')}</h2>
          <HowItWorks className="mt-8" />
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="rounded-card bg-primary-100 p-6 sm:p-10">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-h2 font-semibold">{t('home.trackTitle')}</h2>
                <p className="text-neutral-700 mt-2">{t('home.trackSubtitle')}</p>
                <Button asChild className="mt-4">
                  <Link to={localePath(locale, '/track')}>
                    <Search aria-hidden="true" className="size-4" />
                    {t('home.trackCta')}
                  </Link>
                </Button>
              </div>

              <dl className="bg-surface rounded-card border-neutral-300 grid gap-4 border p-5 sm:grid-cols-3">
                {[
                  { label: t('home.trackStat1'), value: t('home.trackStatValue1') },
                  { label: t('home.trackStat2'), value: t('home.trackStatValue2') },
                  { label: t('home.trackStat3'), value: t('home.trackStatValue3') },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dd className="text-h2 text-primary-700 font-bold">{stat.value}</dd>
                    <dt className="text-neutral-700 text-small">{stat.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-surface border-neutral-300 border-t">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-h2 font-semibold">{t('home.faqTitle')}</h2>
              <p className="text-neutral-700 mt-1">{t('home.knowMoreText')}</p>
            </div>
            <Button variant="tertiary" asChild>
              <Link to={localePath(locale, '/help')}>
                {t('home.faqCta')}
                <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>

          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {faqs.slice(0, 3).map((faq) => (
              <li key={faq.id}>
                <Card className="h-full">
                  <Link
                    to={localePath(locale, `/help?faq=${faq.id}`)}
                    className="flex h-full flex-col gap-2 p-5 after:absolute after:inset-0 after:content-['']"
                  >
                    <span className="text-neutral-900 font-semibold">
                      {localize(faq.question, language)}
                    </span>
                    <span className="text-neutral-700 line-clamp-3 text-small">
                      {localize(faq.answer, language)}
                    </span>
                  </Link>
                </Card>
              </li>
            ))}
          </ul>

          <Card className="mt-8 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <MessageCircleQuestion
                aria-hidden="true"
                className="text-primary-700 mt-0.5 size-6 shrink-0"
              />
              <div>
                <p className="text-neutral-900 font-semibold">{t('home.supportTitle')}</p>
                <p className="text-neutral-700 text-small">{t('home.supportSubtitle')}</p>
              </div>
            </div>
            <Button variant="secondary" asChild>
              <Link to={localePath(locale, '/help/contact')}>{t('home.supportCta')}</Link>
            </Button>
          </Card>
        </Container>
      </Section>
    </>
  )
}
