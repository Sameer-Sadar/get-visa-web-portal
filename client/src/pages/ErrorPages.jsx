import { Compass, FileQuestion, SearchX, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@visagate/ui/Button'
import { Container } from '@visagate/ui/Container'
import { EmptyState } from '@visagate/ui/feedback'
import { localePath } from '../config/site.js'

/**
 * Friendly page for 404 / 403 / 500 (§9). Always offers a way out and a trace
 * ID the applicant can quote to support, instead of a dead end.
 */
export function ErrorPage({
  code = '404',
  titleKey = 'errors.notFound.title',
  descriptionKey = 'errors.notFound.description',
  traceId,
  icon: Icon = SearchX,
  children,
}) {
  const { t } = useTranslation()
  const { locale } = useParams()

  return (
    <Container size="narrow" className="py-20">
      <EmptyState
        icon={Icon}
        titleAs="h1"
        title={
          <>
            <span className="ltr-nums text-neutral-700 block text-small">{code}</span>
            {t(titleKey)}
          </>
        }
        description={t(descriptionKey)}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to={localePath(locale)}>{t('errors.backHome')}</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link to={localePath(locale, '/help')}>{t('nav.help')}</Link>
            </Button>
          </div>
        }
      />

      {traceId ? (
        <p className="text-neutral-700 mt-6 text-center text-small">
          {t('errors.traceId')}{' '}
          <code className="ltr-nums text-neutral-900 font-semibold">{traceId}</code>
        </p>
      ) : null}

      {children}
    </Container>
  )
}

export function NotFoundPage() {
  return (
    <ErrorPage
      code="404"
      titleKey="errors.notFound.title"
      descriptionKey="errors.notFound.description"
      icon={SearchX}
    />
  )
}

export function ForbiddenPage() {
  return (
    <ErrorPage
      code="403"
      titleKey="errors.forbidden.title"
      descriptionKey="errors.forbidden.description"
      icon={FileQuestion}
    />
  )
}

export function ServerErrorPage({ traceId }) {
  return (
    <ErrorPage
      code="500"
      titleKey="errors.serverError.title"
      descriptionKey="errors.serverError.description"
      traceId={traceId}
      icon={TriangleAlert}
    />
  )
}

/** Used by the error boundary when no navigation is available (root level). */
export function StandaloneErrorPage({ traceId }) {
  const { t } = useTranslation()

  return (
    <Container size="narrow" className="py-20">
      <EmptyState
        icon={Compass}
        titleAs="h1"
        title={t('errors.serverError.title')}
        description={t('errors.serverError.description')}
      />
      {traceId ? (
        <p className="text-neutral-700 mt-6 text-center text-small">
          {t('errors.traceId')}{' '}
          <code className="ltr-nums text-neutral-900 font-semibold">{traceId}</code>
        </p>
      ) : null}
    </Container>
  )
}