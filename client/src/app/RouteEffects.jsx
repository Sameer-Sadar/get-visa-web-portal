import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

const MAIN_ID = 'main-content'

/**
 * Route-level a11y and scroll behaviour (§19).
 *
 * - Moves focus to the new page's `<h1>` so keyboard and screen-reader users
 *   land at the top of the content instead of mid-page.
 * - Announces the page in a polite live region.
 * - Restores scroll on back/forward, and starts at the top on a new
 *   navigation — the behaviour people expect from a site rather than an app.
 *
 * Document titles are owned by `<PageMeta>`. Setting
 * `document.title` here as well produced two competing `<title>` elements.
 */
export function RouteEffects() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const [announcement, setAnnouncement] = useState('')
  const scrollPositions = useRef(new Map())
  const previousKey = useRef(null)

  useEffect(() => {
    const key = location.key

    if (previousKey.current !== null) {
      scrollPositions.current.set(previousKey.current, window.scrollY)
    }
    previousKey.current = key

    if (navigationType === 'POP') {
      window.scrollTo({ top: scrollPositions.current.get(key) ?? 0, behavior: 'instant' })
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }

    // Runs after the new page has painted, so the heading exists.
    const frame = requestAnimationFrame(() => {
      const heading = document.getElementById(MAIN_ID)?.querySelector('h1')
      if (!heading) return

      // Make the heading programmatically focusable, then hand focus over.
      heading.setAttribute('tabindex', '-1')
      heading.focus({ preventScroll: true })

      setAnnouncement(heading.textContent ?? '')
    })

    return () => cancelAnimationFrame(frame)
  }, [location.key, navigationType])

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
  )
}