import { Check, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@visagate/ui/Badge'
import { Alert, ProgressBar } from '@visagate/ui/feedback'
import { DocumentUploadRow } from '@visagate/ui/FileUploader'
import { documentTypeByCode } from '../../fixtures/documentTypes.js'
import { localize } from '../../lib/format.js'

/**
 * Required-documents step (§6.6).
 *
 * The checklist is generated per visa type and applicant context (FR-DOC-01),
 * and each row shows its own state: pending, uploading with real percentage,
 * "Checking file…" while the server verifies, uploaded, or rejected with a
 * plain-language reason and a Replace action.
 *
 * Upload transport (signed Cloudinary direct upload, client-side HEIC
 * conversion and compression) is injected via `onUpload` so this component
 * stays presentational; the mock drives the same states.
 */
export function DocumentsStep({ documents = [], onReplace, onCancel, onRemove, onRetry }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage

  const required = documents.filter((document) => document.isRequired)
  const accepted = documents.filter(
    (document) => document.state === 'accepted' || document.state === 'done',
  ).length

  /* With nothing required there is no progress to report — claiming success on
     an empty checklist would be a false all-clear. */
  const hasRequirements = required.length > 0
  const percent = hasRequirements ? Math.round((accepted / required.length) * 100) : 0
  const allDone = hasRequirements && percent === 100

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-surface border-neutral-300 rounded-card border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-h3 font-semibold">{t('wizard.documentsHeading')}</h2>
          <Badge tone={allDone ? 'success' : 'warning'}>
            <span className="ltr-nums">{accepted}</span> /{' '}
            <span className="ltr-nums">{required.length}</span>
          </Badge>
        </div>

        <ProgressBar value={percent} label={t('wizard.documentsProgress')} className="mt-4" />
        <p className="text-neutral-700 mt-2 text-small">{t('wizard.documentsAccepted')}</p>
      </div>

      {!hasRequirements ? (
        <Alert tone="info">{t('wizard.documentsNoneRequired')}</Alert>
      ) : null}

      <ul className="flex flex-col gap-3">
        {documents.map((document) => {
          const documentType = documentTypeByCode.get(document.code)

          return (
            <DocumentUploadRow
              key={document.id}
              label={documentType ? localize(documentType.name, locale) : document.code}
              state={document.state}
              fileName={document.fileName}
              fileSize={document.fileSize}
              progress={document.progress}
              previewUrl={document.previewUrl}
              reason={localize(document.reason, locale)}
              /* Only wire handlers that exist — a row whose `onRemove` is
                 undefined must not render a Remove button that does nothing. */
              onReplace={onReplace ? () => onReplace(document) : undefined}
              onCancel={onCancel ? () => onCancel(document) : undefined}
              onRemove={onRemove ? () => onRemove(document) : undefined}
              onRetry={onRetry ? () => onRetry(document) : undefined}
            />
          )
        })}
      </ul>

      <p className="text-neutral-700 flex items-start gap-2 text-small">
        <FileText aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        {t('wizard.documentsPrivacy')}
      </p>

      {allDone ? (
        <p className="text-success-600 flex items-center gap-2 text-small font-medium">
          <Check aria-hidden="true" className="size-4" />
          {t('wizard.documentsAllDone')}
        </p>
      ) : null}
    </div>
  )
}