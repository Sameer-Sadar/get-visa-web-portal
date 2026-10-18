import { Camera, CircleCheck, CircleX, FileText, TriangleAlert, Upload } from 'lucide-react'
import { forwardRef, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../lib/cx.js'
import { ACCEPT_ATTRIBUTE, formatBytes, validateFile } from '../lib/files.js'
import { Button } from './Button.jsx'

/**
 * Drop zone + camera trigger for a single document (§6.6).
 *
 * It owns the local pre-flight only: type/size validation against the same
 * limits the API enforces, plus a locally generated preview. The signed
 * Cloudinary round-trip (FR-DOC-02/03) is supplied by the caller through
 * `onSelect`, so this component stays free of transport concerns.
 */
export const FileUploader = forwardRef(function FileUploader(
  { label, hint, accept = ACCEPT_ATTRIBUTE, maxSizeBytes, disabled, onSelect, error, className },
  ref,
) {
  const { t } = useTranslation('ui')
  const inputRef = useRef(null)
  const cameraRef = useRef(null)
  const [localError, setLocalError] = useState(null)
  const [dragging, setDragging] = useState(false)
  const reactId = useId()
  const hintId = `${reactId}-hint`

  const handleFiles = (files) => {
    const file = files?.[0]
    if (!file) return

    const result = validateFile(file, { maxSizeBytes })
    if (!result.ok) {
      setLocalError(
        result.reason === 'size'
          ? t('fileTooLarge', { size: formatBytes(result.maxSizeBytes) })
          : t('fileWrongType'),
      )
      return
    }

    setLocalError(null)
    onSelect?.(file)
  }

  const sharedProps = {
    accept,
    disabled,
    className: 'sr-only',
    onChange: (event) => {
      handleFiles(event.target.files)
      event.target.value = ''
    },
  }

  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      {label ? (
        <span className="text-small text-neutral-900 font-medium">{label}</span>
      ) : null}

      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          handleFiles(event.dataTransfer.files)
        }}
        className={cx(
          'flex flex-col items-center gap-3 rounded-card border border-dashed p-6 text-center',
          'transition-colors duration-200',
          dragging ? 'border-primary-700 bg-primary-100' : 'border-neutral-300 bg-surface',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        <Upload aria-hidden="true" className="text-primary-700 size-8" />
        <p className="text-neutral-700 text-small">{t('dropFileHere')}</p>

        <div className="flex flex-wrap justify-center gap-2">
          <Button ref={ref} onClick={() => inputRef.current?.click()} disabled={disabled}>
            {t('chooseFile')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => cameraRef.current?.click()}
            disabled={disabled}
            className="sm:hidden"
          >
            <Camera aria-hidden="true" className="size-4" />
            {t('takePhoto')}
          </Button>
        </div>

        <p id={hintId} className="text-neutral-700 text-small">
          {hint ?? t('acceptedFilesHint')}
        </p>

        <input ref={inputRef} {...sharedProps} type="file" aria-describedby={hintId} />
        <input
          ref={cameraRef}
          {...sharedProps}
          type="file"
          accept="image/*"
          capture="environment"
          aria-label={t('takePhoto')}
        />
      </div>

      {localError || error ? (
        <p className="text-danger-600 flex items-start gap-1.5 text-small font-medium">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{localError ?? error}</span>
        </p>
      ) : null}
    </div>
  )
})

const ROW_STATE_STYLE = {
  pending: 'border-neutral-300',
  uploading: 'border-info-600',
  checking: 'border-info-600',
  done: 'border-success-600',
  error: 'border-danger-600',
  rejected: 'border-danger-600',
}

/**
 * One line of the required-documents checklist (§6.6).
 * `state` drives the icon, the wording and the available action; progress and
 * status are exposed as live regions so screen-reader users hear "Uploading
 * 64%" and "Checking file…" without polling the page.
 */
export function DocumentUploadRow({
  label,
  state = 'pending',
  fileName,
  fileSize,
  progress = 0,
  fileKey,
  previewUrl,
  reason,
  onReplace,
  onRetry,
  onCancel,
  onRemove,
}) {
  const { t } = useTranslation('ui')

  return (
    <li
      className={cx(
        'rounded-card border bg-surface p-4 transition-colors duration-200',
        ROW_STATE_STYLE[state],
      )}
    >
      <div className="flex items-center gap-4">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt=""
            className="border-neutral-300 size-12 shrink-0 rounded-input border object-cover"
          />
        ) : (
          <span className="bg-neutral-50 border-neutral-300 grid size-12 shrink-0 place-items-center rounded-input border">
            <FileText aria-hidden="true" className="text-neutral-700 size-5" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-neutral-900 truncate text-body font-medium">{label}</p>

          {state === 'done' ? (
            <p className="text-success-600 flex items-center gap-1.5 text-small font-medium">
              <CircleCheck aria-hidden="true" className="size-4 shrink-0" />
              {t('uploadComplete')}
              {fileName ? <span className="text-neutral-700 truncate"> · {fileName}</span> : null}
            </p>
          ) : null}

          {state === 'uploading' ? (
            <>
              <p
                role="status"
                aria-live="polite"
                className="text-neutral-700 text-small"
              >
                {t('uploadingPercent', { percent: Math.round(progress) })}
              </p>
              <div
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t('uploadProgressLabel')}
                className="bg-neutral-300/60 mt-2 h-1.5 w-full overflow-hidden rounded-pill"
              >
                <div
                  className="bg-info-600 h-full rounded-pill transition-[width] duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : null}

          {state === 'checking' ? (
            <p role="status" aria-live="polite" className="text-neutral-700 text-small">
              {t('checkingFile')}
            </p>
          ) : null}

          {state === 'rejected' ? (
            <p className="text-danger-600 flex items-start gap-1.5 text-small font-medium">
              <CircleX aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>{reason ?? t('fileRejected')}</span>
            </p>
          ) : null}

          {/* Transient failure (network, provider outage) is recoverable, so it
              offers Retry rather than forcing a fresh selection (§9). */}
          {state === 'error' ? (
            <p className="text-danger-600 flex items-start gap-1.5 text-small font-medium">
              <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>{reason ?? t('uploadFailed')}</span>
            </p>
          ) : null}

          {state === 'pending' && fileKey ? (
            <p className="text-neutral-700 text-small">{fileKey}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {state === 'uploading' ? (
            <Button variant="ghost" size="s" onClick={onCancel}>
              {t('cancel')}
            </Button>
          ) : null}

          {state === 'done' || state === 'rejected' ? (
            <Button variant="secondary" size="s" onClick={onReplace}>
              {t('replace')}
            </Button>
          ) : null}

          {state === 'error' ? (
            <Button variant="secondary" size="s" onClick={onRetry}>
              {t('retry')}
            </Button>
          ) : null}

          {state === 'pending' && onRemove ? (
            <Button variant="ghost" size="s" onClick={onRemove}>
              {t('remove')}
            </Button>
          ) : null}
        </div>
      </div>

      {fileSize ? (
        <p className="text-neutral-700 ltr-nums mt-2 text-small">{formatBytes(fileSize)}</p>
      ) : null}
    </li>
  )
}