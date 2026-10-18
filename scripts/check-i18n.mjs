import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

/**
 * i18n catalog validation.
 *
 * Three failure modes, all of which fail *silently* at runtime — i18next
 * returns the key itself, so the user sees `wizard.summaryTravelers` on screen
 * instead of a label:
 *
 *  1. **Duplicate keys in one file.** `JSON.parse` keeps the last occurrence, so
 *     a namespace defined twice quietly loses its first definition.
 *  2. **Key drift between locales.** A key present in `en` but missing from
 *     `ar` falls back to English rather than erroring, which on a bilingual
 *     portal means an English fragment in an Arabic page.
 *  3. **Keys used in code but absent from the catalogs.** The commonest one, and
 *     invisible until someone opens that page.
 *
 * Run via `npm run check:i18n` at the repo root.
 */

const ROOT = path.resolve(import.meta.dirname, '..')
const CATALOG_DIR = path.join(ROOT, 'packages/i18n/src/locales')
const UI_CATALOG_DIR = path.join(ROOT, 'packages/ui/src/locales')

const LOCALES = ['en', 'ar']
const REFERENCE = 'en'
const APP_NAMESPACE = 'translation'
const UI_NAMESPACE = 'ui'

/**
 * `defaultNamespace` is the namespace a *bare* key resolves to in that tree.
 * `packages/ui` calls `useTranslation('ui')`, so its bare keys belong to the
 * design-system catalog, not the app one.
 */
const SOURCE_DIRS = [
  { dir: path.join(ROOT, 'client/src'), defaultNamespace: APP_NAMESPACE },
  { dir: UI_CATALOG_DIR, defaultNamespace: UI_NAMESPACE },
]

/** Directories excluded from the static-key scan. */
const SCAN_IGNORE = [path.join(ROOT, 'client/src/dev')]

function isIgnored(file) {
  return SCAN_IGNORE.some((ignored) => file.startsWith(ignored))
}

const problems = []

/* ── Load and flatten catalogs ─────────────────────────────────────────── */

function parseWithDuplicateDetection(source, file) {
  const duplicates = []
  const seen = new Set()

  const walk = (node, trail) => {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) return
    for (const [key, value] of Object.entries(node)) {
      const nextTrail = trail ? `${trail}.${key}` : key
      if (seen.has(nextTrail)) duplicates.push(nextTrail)
      seen.add(nextTrail)
      walk(value, nextTrail)
    }
  }

  const parsed = JSON.parse(source)
  walk(parsed, '')

  if (duplicates.length > 0) {
    console.error(`\n✗ ${file}: duplicate keys — the last one silently wins:`)
    for (const key of duplicates) console.error(`    ${key}`)
  }

  return { parsed, duplicates }
}

function flatten(node, prefix = '', into = new Set()) {
  if (node === null || typeof node !== 'object' || Array.isArray(node)) {
    into.add(prefix)
    return into
  }
  for (const [key, value] of Object.entries(node)) {
    flatten(value, prefix ? `${prefix}.${key}` : key, into)
  }
  return into
}

const catalogs = {}

for (const [dir, namespace, label] of [
  [CATALOG_DIR, APP_NAMESPACE, 'app'],
  [UI_CATALOG_DIR, UI_NAMESPACE, 'ui'],
]) {
  for (const locale of LOCALES) {
    const file = path.join(dir, `${locale}.json`)
    if (!fs.existsSync(file)) {
      problems.push(`${label}/${locale}.json is missing`)
      continue
    }

    const { parsed, duplicates } = parseWithDuplicateDetection(fs.readFileSync(file, 'utf8'), `${label}/${locale}.json`)
    if (duplicates.length > 0) {
      problems.push(`${label}/${locale}.json has ${duplicates.length} duplicate key(s)`)
    }

    catalogs[`${namespace}.${locale}`] = flatten(parsed)
  }
}

/* ── ar/en parity ──────────────────────────────────────────────────────── */

for (const namespace of [APP_NAMESPACE, UI_NAMESPACE]) {
  const reference = catalogs[`${namespace}.${REFERENCE}`]
  const arabic = catalogs[`${namespace}.ar`]
  if (!reference || !arabic) continue

  const missingInArabic = [...reference].filter((key) => !arabic.has(key))
  const missingInEnglish = [...arabic].filter((key) => !reference.has(key))

  const describe = (list) =>
    `${list.length} key(s): ${list.slice(0, 10).join(', ')}${list.length > 10 ? ' …' : ''}`

  if (missingInArabic.length > 0) {
    problems.push(`${namespace}: missing from ar.json — ${describe(missingInArabic)}`)
  }
  if (missingInEnglish.length > 0) {
    problems.push(`${namespace}: missing from en.json — ${describe(missingInEnglish)}`)
  }
}

/* ── Keys used in code but missing everywhere ──────────────────────────── */

/**
 * Matches static translation keys only:
 *   t('a.b')   t("a.b")   t('ns:a.b')   t(`a.b`)   i18nKey="a.b"
 * Dynamic keys (`t(\`wizard.step.${key}\`)`) are deliberately skipped — they
 * cannot be enumerated statically — so this is a floor, not a proof.
 */
const STATIC_KEY_PATTERNS = [
  /\bt\(\s*['"]([a-zA-Z][\w.]*)['"]/g,
  /\bt\(\s*`([a-zA-Z][\w.]*)`\s*[),]/g,
  /\bi18nKey=["']([a-zA-Z][\w.]*)["']/g,
  /\b(?:labelKey|hintKey|descriptionKey|titleKey|textKey|whyWeAskKey|labelSuffix|label|headingKey)="([a-zA-Z][\w.]*)"/g,
]

function collectSourceFiles(dir) {
  const files = []
  if (!fs.existsSync(dir)) return files

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...collectSourceFiles(full))
    else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) files.push(full)
  }

  return files
}

/** Keys the design system owns (`ui:` namespace) versus app keys. */
function splitByNamespace(key) {
  return key.startsWith(`${UI_NAMESPACE}:`) ? UI_NAMESPACE : APP_NAMESPACE
}

const missing = new Map()

for (const { dir, defaultNamespace } of SOURCE_DIRS) {
  for (const file of collectSourceFiles(dir)) {
    /* The dev showcase hardcodes English demo copy on purpose. */
    if (isIgnored(file)) continue

    const source = fs.readFileSync(file, 'utf8')
    const relative = path.relative(ROOT, file)

    for (const pattern of STATIC_KEY_PATTERNS) {
      pattern.lastIndex = 0
      let match
      while ((match = pattern.exec(source)) !== null) {
        const raw = match[1]

        /* An explicit `ns:key` wins; otherwise the tree decides. */
        const namespace = raw.includes(':')
          ? splitByNamespace(raw)
          : defaultNamespace
        const bare = raw.includes(':') ? raw.slice(raw.indexOf(':') + 1) : raw

        const known = catalogs[`${namespace}.${REFERENCE}`]
        if (known && !known.has(bare)) {
          const list = missing.get(`${namespace}:${bare}`) ?? []
          if (!list.includes(relative)) list.push(relative)
          missing.set(`${namespace}:${bare}`, list)
        }
      }
    }
  }
}

if (missing.size > 0) {
  console.error('\n✗ translation keys used in code but missing from the catalogs:')
  for (const [key, files] of missing) {
    console.error(`    ${key}  —  ${files.join(', ')}`)
  }
  problems.push(`${missing.size} key(s) used in code are missing from the catalogs`)
}

/* ── Report ────────────────────────────────────────────────────────────── */

if (problems.length > 0) {
  console.error('\n✗ i18n check failed:')
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

console.log('✓ i18n catalogs valid — no duplicates, ar/en parity, all static keys resolve.')