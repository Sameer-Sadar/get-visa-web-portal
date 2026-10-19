import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@visagate/ui/Button'
import { Container } from '@visagate/ui/Container'
import { cx } from '@visagate/ui/lib/cx.js'
import { localePath } from '../../config/site.js'

const SLIDES = [
  { key: 'package', to: '/visas/category/visit', image: '/hero/package.jpg', tone: 'from-[#092a1e]/90 via-[#14573a]/55 to-transparent' },
  { key: 'culture', to: '/visas/category/visit', image: '/hero/culture.jpg', tone: 'from-[#0d121c]/85 via-[#166a45]/45 to-transparent' },
  { key: 'spiritual', to: '/visas/category/visit', image: '/hero/spiritual.jpg', tone: 'from-[#092a1e]/88 via-[#14573a]/50 to-transparent' },
  { key: 'business', to: '/visas/category/work', image: '/hero/business.jpg', tone: 'from-[#0d121c]/80 via-[#14573a]/40 to-transparent' },
  { key: 'medical', to: '/visas/category/visit', image: '/hero/medical.jpg', tone: 'from-[#104631]/80 via-[#1b8354]/40 to-transparent' },
]

export function HeroCarousel() {
  const { t } = useTranslation()
  const { locale } = useParams()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length)
    }, 6500)

    return () => window.clearInterval(timer)
  }, [paused])

  const go = (next) => {
    setIndex((current) => (current + next + SLIDES.length) % SLIDES.length)
  }

  const slide = SLIDES[index]

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t('home.hero.label')}
      className="relative isolate overflow-hidden text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {SLIDES.map((item, slideIndex) => (
        <div
          key={item.key}
          aria-hidden={slideIndex !== index}
          className={cx(
            'absolute inset-0 bg-cover bg-center transition-opacity duration-700',
            slideIndex === index ? 'opacity-100' : 'opacity-0',
          )}
          style={{ backgroundImage: `url(${item.image})` }}
        />
      ))}

      <div className={cx('absolute inset-0 bg-linear-to-r', slide.tone)} />

      <Container className="relative flex min-h-[36rem] flex-col justify-center py-20 sm:min-h-[80vh] sm:py-28">
        <p className="text-accent-500 mb-3 text-small font-semibold tracking-[0.18em] uppercase">
          {t('brand.name')}
        </p>
        <div className="max-w-2xl">
          <h1 className="text-display font-bold text-balance text-white">
            {t(`home.hero.slides.${slide.key}.title`)}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/90">
            {t(`home.hero.slides.${slide.key}.subtitle`)}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="l" asChild>
              <Link to={localePath(locale, slide.to)}>{t('home.hero.getStarted')}</Link>
            </Button>
            <Link
              to={localePath(locale, '/visas')}
              className="inline-flex min-h-12 items-center justify-center rounded-input border border-white/80 px-6 text-button font-semibold text-white transition-colors hover:bg-white/15"
            >
              {t('home.hero.learnMore')}
            </Link>
          </div>
        </div>

        <div className="mt-10 flex items-center gap-3">
          <Button
            variant="ghost"
            size="s"
            className="size-10 rounded-pill border border-white/30 bg-white/10 text-white hover:bg-white/20"
            onClick={() => go(-1)}
            aria-label={t('home.hero.previous')}
          >
            <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden="true" />
          </Button>
          <ol className="flex items-center gap-2">
            {SLIDES.map((item, slideIndex) => (
              <li key={item.key}>
                <button
                  type="button"
                  aria-label={t(`home.hero.slides.${item.key}.title`)}
                  aria-current={slideIndex === index ? 'true' : undefined}
                  onClick={() => setIndex(slideIndex)}
                  className={cx(
                    'block size-2.5 rounded-pill transition-all',
                    slideIndex === index ? 'w-6 bg-accent-500' : 'bg-white/50 hover:bg-white',
                  )}
                />
              </li>
            ))}
          </ol>
          <Button
            variant="ghost"
            size="s"
            className="size-10 rounded-pill border border-white/30 bg-white/10 text-white hover:bg-white/20"
            onClick={() => go(1)}
            aria-label={t('home.hero.next')}
          >
            <ChevronRight className="size-5 rtl:rotate-180" aria-hidden="true" />
          </Button>
        </div>
      </Container>
    </section>
  )
}
