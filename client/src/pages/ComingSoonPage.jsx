import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { Button } from '@visagate/ui/Button'
import { Container, Section } from '@visagate/ui/Container'
import { EmptyState } from '@visagate/ui/feedback'
import { Hammer } from 'lucide-react'

/**
 * Placeholder for screens that ship in a later phase.
 *
 * It names the phase instead of rendering a blank page or a dead button, and
 * it gives the user a way back. Replaced route by route as each phase lands.
 */
export default function ComingSoonPage() {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <Section>
      <Container size="narrow">
        <EmptyState
          icon={Hammer}
          title={t('comingSoon.title')}
          description={t('comingSoon.description')}
          action={
            <Button variant="secondary" onClick={() => window.history.back()}>
              {t('comingSoon.back')}
            </Button>
          }
        />

        {/* Useful when reviewing the prototype: shows which route is stubbed. */}
        <p className="text-neutral-700 mt-6 text-center font-mono text-small">
          <code className="ltr-nums">{location.pathname}</code>
        </p>
      </Container>
    </Section>
  )
}