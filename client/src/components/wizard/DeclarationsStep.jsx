import { ExternalLink } from 'lucide-react'
import { useTranslation, Trans } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { Checkbox } from '@visagate/ui/choices'
import { declarations, CONSENT_VERSION } from '../../fixtures/formSchemas.js'
import { localePath } from '../../config/site.js'

/**
 * Declarations and consent capture (FR-APP-09).
 *
 * Every box starts unticked — §13 forbids pre-ticked consent. The required
 * declaration carries the document version that was actually agreed to, so a
 * later change to the wording cannot retroactively apply to old applications.
 */
export function DeclarationsStep({ values = {}, onChange }) {
  const { t } = useTranslation()
  const { locale } = useParams()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-h3 font-semibold">{t('wizard.declarationsHeading')}</h2>
        <p className="text-neutral-700 mt-1">{t('wizard.declarationsIntro')}</p>
      </div>

      <ul className="border-neutral-300 divide-neutral-300 divide-y rounded-card border">
        {declarations.map((declaration) => (
          <li key={declaration.key} className="p-5">
            <Checkbox
              label={t(declaration.textKey)}
              checked={values[declaration.key] === true}
              onCheckedChange={(checked) => onChange(declaration.key, checked)}
            />

            {declaration.isConsent ? (
              <p className="text-neutral-700 ps-8 pt-2 text-small">
                {/* Trans keeps the sentence, its punctuation and its word order
                    in the catalog — hard-coding "," and "." here would read
                    wrong in Arabic. */}
                <Trans
                  i18nKey="wizard.declarationsLegal"
                  values={{ terms: '', privacy: '' }}
                  components={{
                    terms: (
                      <Link
                        to={localePath(locale, '/terms')}
                        className="text-primary-700 inline-flex items-center gap-1 underline underline-offset-4"
                      />
                    ),
                    privacy: (
                      <Link
                        to={localePath(locale, '/privacy')}
                        className="text-primary-700 underline underline-offset-4"
                      />
                    ),
                  }}
                />
                <ExternalLink aria-hidden="true" className="size-3" />
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      <p className="text-neutral-700 font-mono text-small">
        {t('wizard.declarationsVersion')} <code className="ltr-nums">{CONSENT_VERSION}</code>
      </p>
    </div>
  )
}