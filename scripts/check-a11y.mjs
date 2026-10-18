import { execFileSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'

/**
 * Accessibility smoke checks for the rendered UI.
 *
 * ⚠️ These are cheap structural checks, not a substitute for axe-core, a manual
 * keyboard pass or screen-reader testing (§12 requires all three). They exist to
 * catch regressions that are invisible in a screenshot: a duplicated `<h1>`, a
 * missing landmark, an unlabelled control.
 *
 * The app is a client-rendered SPA, so `fetch()` only ever returns the empty Vite
 * shell. Every page is therefore rendered through headless Edge and audited from
 * `--dump-dom`, which captures the DOM after hydration and fixture queries settle.
 *
 * Usage: node scripts/check-a11y.mjs [baseUrl]
 */

const BASE = process.argv[2] ?? 'http://localhost:5173'
const PROFILE = join(tmpdir(), 'visagate-a11y-profile')
const EDGE_CANDIDATES = [
  process.env.EDGE_PATH,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean)

const browser = EDGE_CANDIDATES.find((candidate) => existsSync(candidate))

if (!browser) {
  console.error('✗ Could not find Microsoft Edge. Set EDGE_PATH to its executable.')
  process.exit(1)
}

const PAGES = [
  '/en',
  '/ar',
  '/en/visas',
  '/en/visas/tourism-single-entry',
  '/en/find-a-visa?nationality=EG&purpose=TOURISM',
  '/en/track',
  '/en/help',
  '/en/about',
  '/en/terms',
  '/en/privacy',
  '/en/cookies',
  '/en/accessibility',
  '/en/signin',
  '/en/register',
  '/en/account/applications',
  '/en/account/applications/app_demo_info_requested',
  '/en/apply/app_demo_draft/applicant',
  '/en/apply/app_demo_draft/documents',
  '/en/apply/app_demo_draft/review',
  '/ar/apply/app_demo_draft/passport',
  '/not-a-real-route',
]

/** Below this the page never hydrated and the audit results would be meaningless. */
const MIN_RENDERED_BYTES = 5_000

function render(path) {
  const url = `${BASE}${path}`
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--dump-dom',
    '--virtual-time-budget=6000',
    `--user-data-dir=${PROFILE}`,
    url,
  ]

  try {
    return execFileSync(browser, args, {
      encoding: 'utf8',
      timeout: 60_000,
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 32 * 1024 * 1024,
    })
  } catch (error) {
    throw new Error(`render failed (${error.killed ? 'timed out' : error.message})`)
  }
}

/* Strips tags so we can tell whether an element has any text content. */
const text = (html) => html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;|&#\d+;/gi, '').trim()

const problems = []

function check(page, name, ok, detail) {
  if (!ok) problems.push(`${page}: ${name}${detail ? ` — ${detail}` : ''}`)
}

function audit(path, html) {
  const count = (tag) => (html.match(new RegExp(`<${tag}[\\s>]`, 'gi')) ?? []).length

  /* Ids a <label> points at, plus ids that sit inside a wrapping <label>. */
  const labelTargets = new Set(
    [...html.matchAll(/<label\b[^>]*for="([^"]+)"/gi)].map(([, id]) => id),
  )
  for (const [, body] of html.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/gi)) {
    for (const [, id] of body.matchAll(/\bid="([^"]+)"/g)) labelTargets.add(id)
  }

  /* §12: exactly one top-level heading per page. */
  const h1s = count('h1')
  check(path, 'expected exactly one <h1>', h1s === 1, `found ${h1s}`)

  /* Landmarks so assistive tech can jump between regions. */
  check(path, 'expected one <main>', count('main') === 1, `found ${count('main')}`)
  check(path, 'expected one <header>', count('header') === 1, `found ${count('header')}`)
  check(path, 'expected one <footer>', count('footer') === 1, `found ${count('footer')}`)

  /* The skip link must be the first focusable element (§12.2.1 / 2.4.1). */
  const skipLink = html.match(/<a\b[^>]*href="#[^"]*(main|content)[^"]*"[^>]*>([\s\S]*?)<\/a>/i)
  check(path, 'missing skip link to main content', Boolean(skipLink))

  /* Multiple navigation landmarks need distinguishing names. */
  const navs = [...html.matchAll(/<nav\b([^>]*)>/gi)]
  const unnamedNavs = navs.filter(([, attrs]) => !/aria-label(ledby)?=/i.test(attrs))
  check(path, 'has an unnamed <nav>', unnamedNavs.length === 0, `${unnamedNavs.length} of ${navs.length}`)

  /* Images need text alternatives; decorative ones need alt="". */
  const images = [...html.matchAll(/<img\b[^>]*>/gi)]
  const imagesWithoutAlt = images.filter(([tag]) => !/\balt\s*=/i.test(tag))
  check(path, 'has <img> without alt', imagesWithoutAlt.length === 0, `${imagesWithoutAlt.length} found`)

  /* Interactive elements need an accessible name — from their own content,
     an aria-label/aria-labelledby, or an associated <label>. Radix primitives
     (Select triggers, radio/checkbox items) render an empty element and take
     their name from a wrapping <label>, which the content check alone misses. */
  const unnamed = []
  for (const [element, attrs, content] of [
    ...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi),
    ...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi),
  ]) {
    const named =
      /aria-label(ledby)?=/i.test(attrs) ||
      /\btitle=/i.test(attrs) ||
      text(content).length > 0 ||
      labelTargets.has(element.match(/\bid="([^"]+)"/i)?.[1] ?? '')
    if (!named) unnamed.push(`${element} ${attrs.trim().slice(0, 60)}`)
  }
  check(path, 'has a control with no accessible name', unnamed.length === 0, `${unnamed.length} found`)

  /* Form controls need a label, aria-label or wrapping <label> (§12.3.1). */
  const controls = [
    ...html.matchAll(/<input\b[^>]*>/gi),
    ...html.matchAll(/<select\b[^>]*>/gi),
    ...html.matchAll(/<textarea\b[^>]*>/gi),
  ]

  const unlabelled = controls.filter(([tag]) => {
    if (/\btype="hidden"/i.test(tag)) return false
    if (/aria-label(ledby)?=/i.test(tag)) return false
    if (/aria-hidden="true"/i.test(tag)) return false

    const type = tag.match(/\btype="([^"]+)"/i)?.[1]
    if (['checkbox', 'radio', 'button', 'submit', 'reset'].includes(type)) return false

    return !labelTargets.has(tag.match(/\bid="([^"]+)"/i)?.[1] ?? '')
  })

  check(path, 'has an unlabelled form control', unlabelled.length === 0, `${unlabelled.length} found`)
}

try {
  for (const path of PAGES) {
    let html
    try {
      html = render(path)
    } catch (error) {
      problems.push(`${path}: ${error.message}`)
      continue
    }

    if (html.length < MIN_RENDERED_BYTES) {
      problems.push(`${path}: page did not render (${html.length} bytes) — is the dev server running?`)
      continue
    }

    audit(path, html)
  }
} finally {
  rmSync(PROFILE, { recursive: true, force: true })
}

if (problems.length > 0) {
  console.error(`\n✗ ${problems.length} accessibility issue(s) across ${PAGES.length} pages:\n`)
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

console.log(`✓ a11y smoke checks passed across ${PAGES.length} rendered pages.`)