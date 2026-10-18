/**
 * The one place that knows how to reach the API.
 *
 * With no `VITE_API_BASE_URL` configured the services fall back to fixtures, so
 * the UI is fully explorable before the backend exists. Setting the variable
 * switches every service to real `fetch` calls without touching a component —
 * the swap TRD §5.1 describes, minus the parts that need a server.
 */

/** Optional chaining on `import.meta.env` keeps this module importable from
 *  plain Node (the smoke tests), where Vite does not inject it. */
const BASE_URL = import.meta.env?.VITE_API_BASE_URL?.replace(/\/$/, '')

export const isMockMode = !BASE_URL

/** RFC 9457 problem+json shape the API returns on error (TRD §5.1). */
export class ApiError extends Error {
  constructor(problem) {
    super(problem?.title ?? 'Request failed')
    this.name = 'ApiError'
    this.status = problem?.status ?? 0
    this.code = problem?.code ?? 'UNKNOWN'
    this.traceId = problem?.traceId
    this.errors = problem?.errors ?? []
  }

  /** Maps `errors[].field` to the field-level messages forms expect (§19). */
  get fieldErrors() {
    return this.errors.reduce((accumulator, entry) => {
      if (entry.field) accumulator[entry.field] = entry.message
      return accumulator
    }, {})
  }
}

export async function apiFetch(path, { method = 'GET', body, headers, signal, locale } = {}) {
  if (isMockMode) {
    throw new Error(`apiFetch("${path}") called while VITE_API_BASE_URL is unset — mock services should be used instead.`)
  }

  const response = await fetch(`${BASE_URL}/api/v1${path}`, {
    method,
    signal,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Accept-Language': locale ?? 'en',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) return null

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(payload ?? { status: response.status, title: response.statusText })
  }

  return payload
}

/** Small delay so loading states are visible while developing against fixtures. */
export function mockLatency() {
  return new Promise((resolve) => {
    setTimeout(resolve, 120 + Math.random() * 180)
  })
}