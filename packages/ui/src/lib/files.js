export const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/heic': ['.heic'],
  'image/heif': ['.heif'],
}

export const ACCEPT_ATTRIBUTE = '.pdf,.jpg,.jpeg,.png,.heic,.heif'

/**
 * FR-DOC-02: the client applies exactly the limits the server enforces, so the
 * user gets the reason immediately instead of after an upload round-trip.
 */
export function validateFile(file, { maxSizeBytes = 5 * 1024 * 1024, acceptedTypes } = {}) {
  const allowed = acceptedTypes ?? Object.keys(ACCEPTED_TYPES)

  if (!allowed.includes(file.type)) {
    return { ok: false, reason: 'type' }
  }

  if (file.size > maxSizeBytes) {
    return { ok: false, reason: 'size', maxSizeBytes }
  }

  return { ok: true }
}

/** HEIC/HEIF are converted on the device before upload (§6.6 step 2). */
export function needsHeicConversion(file) {
  return file.type === 'image/heic' || file.type === 'image/heif'
}

export function isImage(file) {
  return file.type.startsWith('image/')
}

/** Object URL for a local preview. Always paired with `revokeObjectUrl`. */
export function createObjectUrl(file) {
  return URL.createObjectURL(file)
}

export function revokeObjectUrl(url) {
  if (url) URL.revokeObjectURL(url)
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}