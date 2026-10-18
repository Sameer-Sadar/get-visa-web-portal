/**
 * Session store — the client half of "who is signed in".
 *
 * §19 requires cookie-based sessions: the browser never holds a token, and the
 * API sets an `HttpOnly` cookie. Until the backend exists, this module plays
 * that role with **in-memory state only**:
 *
 *  - nothing is written to `localStorage` or `sessionStorage`, so there is no
 *    artifact an XSS payload could exfiltrate;
 *  - state is deliberately lost on reload, which is the honest behaviour for a
 *    placeholder — a "remember me" that silently persists a fake session would
 *    be worse than one that doesn't.
 *
 * Phase 3 replaces `signIn`/`signOut` with real calls; `useSyncExternalStore`
 * consumers keep working unchanged.
 */

let currentUser = null

const listeners = new Set()

function notify() {
  for (const listener of listeners) listener()
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return currentUser
}

/** Demo account, used only while running against fixtures. */
export const DEMO_ACCOUNT = {
  id: 'usr_demo',
  email: 'sara.hassan@example.com',
  displayName: 'Sara Hassan',
  initials: 'S.H.',
  emailVerified: true,
  phoneVerified: false,
  mfaEnabled: false,
  role: 'APPLICANT',
}

export const session = {
  subscribe,
  getSnapshot,
  getServerSnapshot: getSnapshot,

  setUser(user) {
    currentUser = user
    notify()
  },

  clear() {
    currentUser = null
    notify()
  },

  isSignedIn() {
    return currentUser !== null
  },
}

/** Test/demo hook: signs in as the fixture applicant. */
export function signInDemoUser() {
  currentUser = DEMO_ACCOUNT
  notify()
}