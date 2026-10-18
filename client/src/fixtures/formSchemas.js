import { visaTypes } from './visaCatalog.js'

/**
 * Form schemas — mirrors `formSchemas` (schema §4.3, §5.1).
 *
 * One published version per visa type, pinned onto an application at creation
 * so a mid-application schema change cannot move the ground under a submitted
 * application (FR-APP-01, §6.1).
 *
 * `showIf` uses a deliberately tiny subset of the JSON-Logic expression
 * language the server uses: a single field comparison. The renderer evaluates
 * the same shape the API returns, so swapping in a full evaluator later is a
 * drop-in change.
 */

const applicantStep = {
  key: 'applicant',
  labelKey: 'wizard.step.applicant',
  fields: [
    {
      key: 'applicantIsSelf',
      type: 'radio',
      labelKey: 'wizard.field.applicantIsSelf',
      required: true,
      options: [
        { value: 'yes', labelKey: 'wizard.option.myself' },
        { value: 'no', labelKey: 'wizard.option.someoneElse' },
      ],
    },
    {
      key: 'applicantFullName',
      type: 'text',
      labelKey: 'wizard.field.fullName',
      hintKey: 'wizard.hint.fullName',
      required: true,
      autocomplete: 'name',
      whyWeAskKey: 'wizard.why.fullName',
      width: 'full',
    },
    {
      key: 'applicantFullNameAr',
      type: 'text',
      labelKey: 'wizard.field.fullNameAr',
      optional: true,
      dir: 'rtl',
      whyWeAskKey: 'wizard.why.fullNameAr',
    },
    {
      key: 'dateOfBirth',
      type: 'date',
      labelKey: 'wizard.field.dateOfBirth',
      required: true,
      autocomplete: 'bday',
    },
    {
      key: 'gender',
      type: 'select',
      labelKey: 'wizard.field.gender',
      required: true,
      options: [
        { value: 'F', labelKey: 'wizard.option.female' },
        { value: 'M', labelKey: 'wizard.option.male' },
        { value: 'X', labelKey: 'wizard.option.other' },
      ],
    },
    {
      key: 'nationalityCode',
      type: 'nationality',
      labelKey: 'wizard.field.nationality',
      required: true,
      whyWeAskKey: 'wizard.why.nationality',
    },
    {
      key: 'residenceCountryCode',
      type: 'nationality',
      labelKey: 'wizard.field.residence',
      required: true,
    },
    {
      key: 'maritalStatus',
      type: 'select',
      labelKey: 'wizard.field.maritalStatus',
      optional: true,
      options: [
        { value: 'SINGLE', labelKey: 'wizard.option.single' },
        { value: 'MARRIED', labelKey: 'wizard.option.married' },
        { value: 'DIVORCED', labelKey: 'wizard.option.divorced' },
        { value: 'WIDOWED', labelKey: 'wizard.option.widowed' },
      ],
    },
    {
      key: 'occupation',
      type: 'text',
      labelKey: 'wizard.field.occupation',
      required: true,
    },
    {
      key: 'isMinor',
      type: 'checkbox',
      labelKey: 'wizard.field.isMinor',
      descriptionKey: 'wizard.desc.isMinor',
    },
    {
      key: 'guardianDeclaration',
      type: 'text',
      labelKey: 'wizard.field.guardian',
      hintKey: 'wizard.hint.guardian',
      required: true,
      showIf: { field: 'isMinor', equals: true },
      whyWeAskKey: 'wizard.why.guardian',
      width: 'full',
    },
  ],
}

const passportStep = {
  key: 'passport',
  labelKey: 'wizard.step.passport',
  fields: [
    {
      key: 'passportNo',
      type: 'text',
      labelKey: 'wizard.field.passportNo',
      hintKey: 'wizard.hint.passportNo',
      required: true,
      dir: 'ltr',
      uppercase: true,
      whyWeAskKey: 'wizard.why.passportNo',
    },
    {
      key: 'issuingCountry',
      type: 'nationality',
      labelKey: 'wizard.field.issuingCountry',
      required: true,
    },
    {
      key: 'passportIssueDate',
      type: 'date',
      labelKey: 'wizard.field.issueDate',
      required: true,
    },
    {
      key: 'passportExpiryDate',
      type: 'date',
      labelKey: 'wizard.field.expiryDate',
      hintKey: 'wizard.hint.expiryDate',
      required: true,
      whyWeAskKey: 'wizard.why.passportExpiry',
    },
  ],
}

const contactStep = {
  key: 'contact',
  labelKey: 'wizard.step.contact',
  fields: [
    {
      key: 'email',
      type: 'email',
      labelKey: 'wizard.field.email',
      required: true,
      autocomplete: 'email',
      whyWeAskKey: 'wizard.why.email',
    },
    {
      key: 'phone',
      type: 'phone',
      labelKey: 'wizard.field.phone',
      hintKey: 'wizard.hint.phone',
      required: true,
      autocomplete: 'tel',
      whyWeAskKey: 'wizard.why.phone',
    },
    { key: 'addressLine1', type: 'text', labelKey: 'wizard.field.address1', required: true, width: 'full' },
    { key: 'addressCity', type: 'text', labelKey: 'wizard.field.city', required: true },
    { key: 'addressPostcode', type: 'text', labelKey: 'wizard.field.postcode', required: true, dir: 'ltr' },
  ],
}

const travelStep = {
  key: 'travel',
  labelKey: 'wizard.step.travel',
  fields: [
    {
      key: 'purposeDetail',
      type: 'textarea',
      labelKey: 'wizard.field.purposeDetail',
      hintKey: 'wizard.hint.purposeDetail',
      required: true,
      width: 'full',
    },
    { key: 'arrivalDate', type: 'date', labelKey: 'wizard.field.arrivalDate', required: true },
    { key: 'departureDate', type: 'date', labelKey: 'wizard.field.departureDate', required: true },
    {
      key: 'entryPoint',
      type: 'select',
      labelKey: 'wizard.field.entryPoint',
      required: true,
      options: [
        { value: 'RUH', labelKey: 'wizard.option.entryRuh' },
        { value: 'JED', labelKey: 'wizard.option.entryJed' },
        { value: 'DMM', labelKey: 'wizard.option.entryDmm' },
        { value: 'MED', labelKey: 'wizard.option.entryMed' },
        { value: 'OTHER', labelKey: 'wizard.option.entryOther' },
      ],
    },
    {
      key: 'previousVisits',
      type: 'radio',
      labelKey: 'wizard.field.previousVisits',
      required: true,
      options: [
        { value: 'yes', labelKey: 'wizard.option.yes' },
        { value: 'no', labelKey: 'wizard.option.no' },
      ],
    },
    {
      key: 'otherCountriesVisited',
      type: 'text',
      labelKey: 'wizard.field.otherCountries',
      hintKey: 'wizard.hint.otherCountries',
      required: true,
      width: 'full',
      showIf: { field: 'previousVisits', equals: 'yes' },
    },
  ],
}

const stayStep = {
  key: 'stay',
  labelKey: 'wizard.step.stay',
  fields: [
    {
      key: 'accommodationType',
      type: 'radio',
      labelKey: 'wizard.field.accommodation',
      required: true,
      options: [
        { value: 'hotel', labelKey: 'wizard.option.hotel' },
        { value: 'host', labelKey: 'wizard.option.host' },
      ],
      whyWeAskKey: 'wizard.why.accommodation',
    },
    {
      key: 'hotelName',
      type: 'text',
      labelKey: 'wizard.field.hotelName',
      required: true,
      showIf: { field: 'accommodationType', equals: 'hotel' },
    },
    {
      key: 'hotelBookingRef',
      type: 'text',
      labelKey: 'wizard.field.bookingRef',
      hintKey: 'wizard.hint.bookingRef',
      required: true,
      dir: 'ltr',
      uppercase: true,
      showIf: { field: 'accommodationType', equals: 'hotel' },
    },
    {
      key: 'inviterName',
      type: 'text',
      labelKey: 'wizard.field.inviterName',
      required: true,
      showIf: { field: 'accommodationType', equals: 'host' },
    },
    {
      key: 'inviterPhone',
      type: 'phone',
      labelKey: 'wizard.field.inviterPhone',
      hintKey: 'wizard.hint.inviterPhone',
      required: true,
      showIf: { field: 'accommodationType', equals: 'host' },
      whyWeAskKey: 'wizard.why.inviterPhone',
    },
  ],
}

const documentsStep = {
  key: 'documents',
  labelKey: 'wizard.step.documents',
  /* Rendered by the dedicated documents step, not the field loop. */
  custom: 'documents',
  fields: [],
}

const declarationsStep = {
  key: 'declarations',
  labelKey: 'wizard.step.declarations',
  /* Rendered by the dedicated declarations step. */
  custom: 'declarations',
  fields: [],
}

/** Declarations and the consent version captured with them (FR-APP-09). */
export const CONSENT_VERSION = '2026-10-18'

/**
 * Declarations and the consent version captured with them (FR-APP-09).
 *
 * Every statement carries a checkbox the applicant must tick before
 * submitting, so all are `required`. `isConsent` marks the one that captures
 * legal consent and therefore shows the linked terms — recording the document
 * version is what makes that consent provable later.
 */
export const declarations = [
  { key: 'truth', textKey: 'wizard.declaration.truth', required: true },
  { key: 'documentsOwned', textKey: 'wizard.declaration.documentsOwned', required: true },
  { key: 'overstay', textKey: 'wizard.declaration.overstay', required: true },
  {
    key: 'consent',
    textKey: 'wizard.declaration.consent',
    required: true,
    isConsent: true,
  },
]

/**
 * Only these steps are rendered from the field schema; review, payment and
 * confirmation are dedicated screens (FR-APP-08, FR-PAY-01).
 */
export const WIZARD_STEPS = [
  applicantStep,
  passportStep,
  contactStep,
  travelStep,
  stayStep,
  documentsStep,
  declarationsStep,
]

export const formSchemas = visaTypes
  .filter((visaType) => visaType.isActive)
  .map((visaType) => ({
    visaTypeId: visaType.id,
    visaTypeSlug: visaType.slug,
    version: 3,
    status: 'PUBLISHED',
    steps: WIZARD_STEPS,
    publishedAt: '2026-10-18T00:00:00.000Z',
  }))

const bySlug = new Map(formSchemas.map((schema) => [schema.visaTypeSlug, schema]))

export function getFormSchema(visaTypeSlug) {
  return bySlug.get(visaTypeSlug) ?? null
}

export const STEP_KEYS = WIZARD_STEPS.map((step) => step.key)