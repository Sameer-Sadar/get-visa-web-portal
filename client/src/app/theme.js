/**
 * Theme wiring (§5.1).
 *
 * `tokens.css` defines the full dark palette under `.dark`, so switching is a
 * single class on the root element — no component needs to know about it.
 *
 * Default follows the OS `prefers-color-scheme`. A manual choice, once made,
 * wins over the OS and is remembered, because a user who picked light mode
 * should not be overridden every time their system is in dark mode.
 */

const STORAGE_KEY = 'visagate.theme'

export const THEMES = ['light', 'dark', 'system']

function readStoredTheme() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return THEMES.includes(stored) ? stored : 'system'
  } catch {
    /* Private browsing can throw on access; fall back to following the OS. */
    return 'system'
  }
}

function systemPrefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function resolve(preference) {
  return preference === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : preference
}

function apply(preference) {
  const resolved = resolve(preference)
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  document.documentElement.style.colorScheme = resolved
  return resolved
}

/**
 * Idempotent. `main.jsx` calls this once before the first render and the footer
 * toggle calls it again, so returning a new controller each time would attach a
 * second `matchMedia` listener per call — and re-apply the class mid-render.
 */
let controller = null

export function initTheme() {
  if (controller) return controller

  const listeners = new Set()
  const notify = () => {
    for (const listener of listeners) listener()
  }

  apply(readStoredTheme())

  const media = window.matchMedia?.('(prefers-color-scheme: dark)')
  media?.addEventListener?.('change', () => {
    /* Only follow the OS while the user has not made an explicit choice. */
    if (readStoredTheme() === 'system') {
      apply('system')
      notify()
    }
  })

  controller = {
    /** The stored preference: `light`, `dark` or `system`. */
    get: () => readStoredTheme(),

    /** What is actually on screen. Differs from `get()` while following the OS. */
    resolved: () => resolve(readStoredTheme()),

    set(next) {
      const preference = THEMES.includes(next) ? next : 'system'
      try {
        window.localStorage.setItem(STORAGE_KEY, preference)
      } catch {
        /* Non-critical: the choice still applies for this page view. */
      }
      apply(preference)
      notify()
      return preference
    },

    /** Pins the opposite of what is showing, so a `system` user gets a real choice. */
    toggle() {
      return this.set(this.resolved() === 'dark' ? 'light' : 'dark')
    },

    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }

  return controller
}