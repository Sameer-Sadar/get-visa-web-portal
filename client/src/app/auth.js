import { useSyncExternalStore } from 'react'
import { session } from './session.js'

/**
 * React bindings for the session store.
 *
 * `useSyncExternalStore` keeps every consumer (header, account pages, route
 * guards) consistent without prop drilling or a context provider.
 */
export function useCurrentUser() {
  return useSyncExternalStore(session.subscribe, session.getSnapshot, session.getServerSnapshot)
}

export function useIsSignedIn() {
  return useCurrentUser() !== null
}