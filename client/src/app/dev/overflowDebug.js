/**
 * Dev-only layout guard.
 *
 * Horizontal overflow is the most common responsive/RTL defect and is invisible
 * in a screenshot until something important falls off the edge. This reports
 * the offending elements to the console during development only.
 *
 * Enabled from LocaleLayout behind `import.meta.env.DEV`, so it never reaches
 * a production bundle.
 */
export function reportHorizontalOverflow() {
  if (!import.meta.env.DEV) return () => {}

  let frame = 0

  const check = () => {
    frame = 0
    const docWidth = document.documentElement.clientWidth

    if (document.documentElement.scrollWidth <= docWidth + 1) return

    const offenders = [...document.querySelectorAll('body *')]
      .filter((element) => {
        const rect = element.getBoundingClientRect()
        return rect.width > 0 && rect.right > docWidth + 1
      })
      .slice(0, 8)
      .map((element) => {
        const rect = element.getBoundingClientRect()
        const id = element.id ? `#${element.id}` : ''
        const classes = typeof element.className === 'string'
          ? `.${element.className.trim().split(/\s+/).slice(0, 3).join('.')}`
          : ''
        return `  ${element.tagName.toLowerCase()}${id}${classes} — right edge ${Math.round(rect.right)}px, width ${Math.round(rect.width)}px`
      })

    console.warn(
      `[overflow] document is ${document.documentElement.scrollWidth}px wide in a ${docWidth}px viewport:\n${offenders.join('\n')}`,
    )
  }

  const schedule = () => {
    if (frame) return
    frame = requestAnimationFrame(check)
  }

  window.addEventListener('resize', schedule)

  return () => {
    if (frame) cancelAnimationFrame(frame)
    window.removeEventListener('resize', schedule)
  }
}