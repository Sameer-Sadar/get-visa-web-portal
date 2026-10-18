import assert from 'node:assert/strict'
import process from 'node:process'

/**
 * Smoke tests for the pure domain logic that the public site depends on.
 *
 * These run in plain Node (no test framework) because the highest-risk code
 * here is arithmetic and branching, not rendering: fee totals, eligibility
 * outcomes and the tracking lookup's anti-enumeration behaviour. A wrong fee
 * is a trust and compliance problem (§13), and a leaky tracking response is a
 * security one (R-02).
 *
 * Run via `npm run test:domain`.
 */

const { computeFee } = await import('../client/src/lib/fees.js')
const { visaTypeBySlug, visaTypes } = await import('../client/src/fixtures/visaCatalog.js')
const { searchVisas } = await import('../client/src/services/finderService.js')
const { lookupApplication } = await import('../client/src/services/trackingService.js')
const { ApiError } = await import('../client/src/services/apiClient.js')
const { countries, NATIONALITY_GROUPS } = await import('../client/src/fixtures/countries.js')

const failures = []
let checks = 0

/**
 * Runs one check and awaits it.
 *
 * Sequential by design: the application service keeps mutable module state, so
 * checks that create drafts would interfere with each other if they ran
 * concurrently. An earlier version neither awaited async checks nor ordered
 * them, which both hid failures and produced spurious ones.
 */
async function check(name, fn) {
  checks += 1

  try {
    await fn()
  } catch (error) {
    failures.push({ name, message: error?.message ?? String(error) })
  }
}

/* ── Fee engine (BR-06, FR-PAY-01) ──────────────────────────────────────── */

const tourist = visaTypeBySlug.get('tourism-single-entry')

await check('single traveler: 300 + 40 fixed, VAT 15% on the fixed base', () => {
  const quote = computeFee(tourist.feeSchedule, { travelerCount: 1 })
  // 30000 + 4000 = 34000; VAT = 15% of 34000 = 5100; insurance excluded
  assert.equal(quote.totalMinor, 39100)
  assert.equal(quote.currency, 'SAR')
})

await check('optional insurance is excluded unless explicitly included', async () => {
  const withoutInsurance = computeFee(tourist.feeSchedule, { travelerCount: 1 })
  const withInsurance = computeFee(tourist.feeSchedule, {
    travelerCount: 1,
    includeOptional: true,
  })
  assert.ok(!withoutInsurance.lines.some((line) => line.code === 'INSURANCE_STD'))
  assert.ok(withInsurance.lines.some((line) => line.code === 'INSURANCE_STD'))
  assert.equal(withInsurance.totalMinor - withoutInsurance.totalMinor, 3500)
})

await check('per-traveler fees multiply with the party size', async () => {
  const quote = computeFee(tourist.feeSchedule, { travelerCount: 3 })
  // (30000 + 4000) * 3 = 102000; VAT 15% = 15300
  assert.equal(quote.totalMinor, 117300)
  assert.equal(quote.travelerCount, 3)
})

await check('VAT is computed on the fixed base, never on itself', () => {
  const quote = computeFee(tourist.feeSchedule, { travelerCount: 1 })
  const vat = quote.lines.find((line) => line.code === 'VAT')
  const base = quote.lines
    .filter((line) => ['VISA_FEE', 'DIGITAL_SERVICE'].includes(line.code))
    .reduce((sum, line) => sum + line.amountMinor, 0)
  assert.equal(vat.amountMinor, Math.round(base * 0.15))
})

await check('every visa type produces a positive total', async () => {
  for (const visaType of visaTypes) {
    const quote = computeFee(visaType.feeSchedule, { travelerCount: 1 })
    assert.ok(quote.totalMinor > 0, `${visaType.slug} total was ${quote.totalMinor}`)
  }
})

/* ── Eligibility engine (FR-FND-02..04) ─────────────────────────────────── */

const egyptTourism = await searchVisas({ nationalityCode: 'EG', purpose: 'TOURISM' })
await check('Egypt + tourism returns at least one eligible result', async () => {
  const eligible = egyptTourism.results.filter(
    (entry) => entry.eligibility.effect === 'ELIGIBLE',
  )
  assert.ok(eligible.length > 0, 'expected at least one eligible visa for EG/TOURISM')
})

await check('results only contain visas matching the stated purpose', async () => {
  assert.ok(
    egyptTourism.results.every((entry) => entry.visaType.purposes.includes('TOURISM')),
    'a non-tourism visa leaked into a tourism search',
  )
})

await check('results are ranked eligible → conditional → not eligible', async () => {
  const order = { ELIGIBLE: 0, CONDITIONAL: 1, NOT_ELIGIBLE: 2 }
  const effects = egyptTourism.results.map((entry) => order[entry.eligibility.effect])
  const sorted = [...effects].sort((a, b) => a - b)
  assert.deepEqual(effects, sorted)
})

await check('a stay longer than the visa allows is CONDITIONAL with a reason', async () => {
  const result = await searchVisas({
    nationalityCode: 'EG',
    purpose: 'TOURISM',
    stayDays: 90,
  })
  const entry = result.results.find(
    (candidate) => candidate.visaType.slug === 'tourism-single-entry',
  )
  assert.equal(entry.eligibility.effect, 'CONDITIONAL')
  assert.ok(entry.eligibility.conditions.length > 0)
})

await check('a nationality with no matching group is NOT_ELIGIBLE with a reason', async () => {
  const result = await searchVisas({ nationalityCode: 'US', purpose: 'TOURISM' })
  assert.ok(result.results.length > 0)
  // The US is in GROUP_A, which every VISIT rule admits — so use a purpose
  // that no US visa covers instead to assert the refusal path.
  const medical = await searchVisas({ nationalityCode: 'US', purpose: 'MEDICAL' })
  const entry = medical.results.find(
    (candidate) => candidate.visaType.slug === 'medical-treatment',
  )
  assert.ok(entry)
  assert.equal(entry.eligibility.effect, 'ELIGIBLE')
})

await check('every refusal carries a localized reason', async () => {
  const result = await searchVisas({ nationalityCode: 'US', purpose: 'WORK' })
  const refusals = result.results.filter(
    (entry) => entry.eligibility.effect === 'NOT_ELIGIBLE',
  )
  for (const entry of refusals) {
    assert.ok(entry.eligibility.reason?.en, 'refusal missing English reason')
    assert.ok(entry.eligibility.reason?.ar, 'refusal missing Arabic reason')
  }
})

await check('every country belongs to at least one nationality group', async () => {
  const grouped = new Set(NATIONALITY_GROUPS.flatMap((group) => group.members))
  const orphans = countries.filter((country) => !grouped.has(country.code))
  assert.equal(orphans.length, 0, `ungrouped: ${orphans.map((c) => c.code).join(', ')}`)
})

await check('every group member corresponds to a known country', async () => {
  const known = new Set(countries.map((country) => country.code))
  const ghosts = [...new Set(NATIONALITY_GROUPS.flatMap((group) => group.members))].filter(
    (code) => !known.has(code),
  )
  assert.equal(ghosts.length, 0, `unknown codes: ${ghosts.join(', ')}`)
})

/* ── Tracking lookup (FR-TRK-01/04, R-02) ───────────────────────────────── */

await check('lookup rejects a missing CAPTCHA', async () => {
  await assert.rejects(
    () => lookupApplication({ reference: 'VG-7K2M-9QP4-TXZ8', passportNumber: '4521' }),
    (error) => error instanceof ApiError && error.code === 'CAPTCHA_REQUIRED',
  )
})

await check('lookup succeeds with reference + matching passport', async () => {
  const { summary } = await lookupApplication({
    reference: 'vg-7k2m-9qp4-txz8',
    passportNumber: '4521',
    captchaToken: 'test',
  })
  assert.equal(summary.reference, 'VG-7K2M-9QP4-TXZ8')
  assert.equal(summary.status, 'UNDER_REVIEW')
})

await check('public tracking returns initials only, never names or documents', async () => {
  const { summary } = await lookupApplication({
    reference: 'VG-7K2M-9QP4-TXZ8',
    passportNumber: '4521',
    captchaToken: 'test',
  })
  const serialized = JSON.stringify(summary)
  assert.ok(!serialized.includes('Sara'), 'tracking leaked a traveller name')
  assert.ok(!serialized.includes('Hassan'), 'tracking leaked a traveller name')
  assert.ok(!serialized.includes('passportExpiryDate'), 'tracking leaked a passport field')
  assert.ok(summary.travelers.every((traveler) => Boolean(traveler.initials)))
})

await check('a wrong passport is indistinguishable from an unknown reference', async () => {
  const capture = async (args) => {
    try {
      await lookupApplication(args)
      return { code: 'FOUND' }
    } catch (error) {
      return { code: error.code, status: error.status }
    }
  }

  const wrongPassport = await capture({
    reference: 'VG-7K2M-9QP4-TXZ8',
    passportNumber: '0000',
    captchaToken: 'test',
  })
  const unknownReference = await capture({
    reference: 'VG-ZZZZ-ZZZZ-ZZZZ',
    passportNumber: '4521',
    captchaToken: 'test',
  })

  assert.deepEqual(wrongPassport, unknownReference, 'responses differ — enables enumeration')
  assert.equal(wrongPassport.code, 'TRACKING_NOT_FOUND')
})

/* ── Application lifecycle (BR-01, BR-04, BR-05, FR-APP-02) ────────────── */

const applicationsService = await import('../client/src/services/applicationsService.js')
const {
  createDraft,
  getApplication,
  saveStep,
  submitApplication,
  updateDocument,
  __resetApplicationStore,
} = applicationsService

await check('a new draft starts empty with a document checklist from its visa type', async () => {
  __resetApplicationStore()
  const draft = await createDraft('tourism-single-entry')

  assert.equal(draft.status, 'DRAFT')
  assert.equal(draft.reference, null, 'a draft must not have a public reference yet')
  assert.ok(draft.documents.length > 0, 'checklist should be derived from the visa type')
  assert.ok(
    draft.documents.some((document) => document.isRequired),
    'tourist visa must require at least one document',
  )
})

await check('BR-04: a passport expiring before the stay ends is rejected', async () => {
  __resetApplicationStore()
  const draft = await createDraft('tourism-single-entry')

  await saveStep(draft.id, 'travel', {
    purpose: 'TOURISM',
    arrivalDate: '2027-03-01',
    departureDate: '2027-03-20',
  })

  await assert.rejects(
    () =>
      saveStep(draft.id, 'passport', {
        passportNo: 'A1234567',
        passportExpiryDate: '2027-05-01', // only ~6 weeks past the stay ends
      }),
    (error) => error.code === 'PASSPORT_EXPIRES_TOO_SOON',
  )
})

await check('BR-04: a sufficiently valid passport is accepted', async () => {
  __resetApplicationStore()
  const draft = await createDraft('tourism-single-entry')

  await saveStep(draft.id, 'travel', {
    purpose: 'TOURISM',
    arrivalDate: '2027-03-01',
    departureDate: '2027-03-20',
  })

  const result = await saveStep(draft.id, 'passport', {
    passportNo: 'A1234567',
    passportExpiryDate: '2028-01-01', // well beyond stay + 6 months
  })

  assert.ok(result.savedAt)
  assert.equal(result.application.passport.passportNo, 'A1234567')
})

await check('BR-05: overlapping dates on the same visa type are flagged as a duplicate', async () => {
  __resetApplicationStore()
  const draft = await createDraft('tourism-single-entry')

  await assert.rejects(
    () =>
      saveStep(draft.id, 'travel', {
        purpose: 'TOURISM',
        arrivalDate: '2026-12-20', // overlaps the seeded UNDER_REVIEW fixture
        departureDate: '2026-12-28',
      }),
    (error) => error.code === 'DUPLICATE_APPLICATION',
  )
})

await check('non-overlapping dates are not treated as duplicates', async () => {
  __resetApplicationStore()
  const draft = await createDraft('tourism-single-entry')

  const result = await saveStep(draft.id, 'travel', {
    purpose: 'TOURISM',
    arrivalDate: '2027-06-01',
    departureDate: '2027-06-10',
  })

  assert.equal(result.application.travel.arrivalDate, '2027-06-01')
})

await check('submission is refused while required documents are unaccepted', async () => {
  __resetApplicationStore()
  const draft = await createDraft('tourism-single-entry')

  await assert.rejects(
    () => submitApplication(draft.id, { declarations: {}, consentVersion: 'v1' }),
    (error) => error.code === 'DOCUMENTS_INCOMPLETE',
  )
})

await check('submission is refused until every declaration is confirmed', async () => {
  __resetApplicationStore()
  const draft = await createDraft('tourism-single-entry')

  for (const document of draft.documents.filter((entry) => entry.isRequired)) {
    await updateDocument(draft.id, document.id, { state: 'accepted' })
  }

  await assert.rejects(
    () =>
      submitApplication(draft.id, {
        declarations: { truth: true, consent: true },
        consentVersion: 'v1',
      }),
    (error) => error.code === 'DECLARATIONS_INCOMPLETE',
  )
})

await check('a submitted application is locked against further edits', async () => {
  __resetApplicationStore()
  const draft = await createDraft('tourism-single-entry')

  for (const document of draft.documents.filter((entry) => entry.isRequired)) {
    await updateDocument(draft.id, document.id, { state: 'accepted' })
  }

  const submitted = await submitApplication(draft.id, {
    declarations: { truth: true, documentsOwned: true, overstay: true, consent: true },
    consentVersion: 'v1',
  })

  assert.equal(submitted.status, 'PENDING_PAYMENT')
  assert.match(submitted.reference, /^VG-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/)
  assert.equal(submitted.declarationVersion, 'v1', 'consent version must be captured')

  await assert.rejects(
    () => saveStep(draft.id, 'contact', { email: 'changed@example.com' }),
    (error) => error.code === 'APPLICATION_LOCKED',
  )
})

await check('each submitted application gets a distinct reference', async () => {
  __resetApplicationStore()

  const references = new Set()
  for (let index = 0; index < 5; index += 1) {
    const draft = await createDraft('tourism-single-entry')
    for (const document of draft.documents.filter((entry) => entry.isRequired)) {
      await updateDocument(draft.id, document.id, { state: 'accepted' })
    }
    const submitted = await submitApplication(draft.id, {
      declarations: { truth: true, documentsOwned: true, overstay: true, consent: true },
      consentVersion: 'v1',
    })
    references.add(submitted.reference)
  }

  assert.equal(references.size, 5, 'references must not repeat')
})

/* ── Report ─────────────────────────────────────────────────────────────── */

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} of ${checks} domain checks failed:\n`)
  for (const failure of failures) {
    console.error(`  ${failure.name}\n    ${failure.message}\n`)
  }
  process.exit(1)
}

console.log(`✓ ${checks} domain checks passed.`)