/**
 * Application fixtures — mirrors `applications` and its children
 * (schema §4.4).
 *
 * ⚠️ Real passport and identity numbers are encrypted at rest and never
 * returned by list endpoints (schema §6, projections). These demo values are
 * deliberately fictitious and formatted so they are obviously not real
 * documents. The `masked*` fields are what public tracking may return before
 * step-up verification (FR-TRK-01, §6.8 "reduced dataset").
 */

export const applications = [
  {
    id: 'app_demo_under_review',
    reference: 'VG-7K2M-9QP4-TXZ8',
    applicantUserId: 'usr_demo',
    visaTypeSlug: 'tourism-single-entry',
    status: 'UNDER_REVIEW',
    travelerCount: 2,
    isPrimaryApplicant: true,
    travelers: [
      {
        position: 1,
        isPrimary: true,
        initials: 'S.H.',
        fullName: 'Sara Hassan',
        nationalityCode: 'EG',
        maskedPassportNo: '•••••4521',
        passportExpiryDate: '2029-03-14',
      },
      {
        position: 2,
        isPrimary: false,
        initials: 'M.H.',
        fullName: 'Mahmoud Hassan',
        nationalityCode: 'EG',
        maskedPassportNo: '•••••7803',
        passportExpiryDate: '2028-11-02',
      },
    ],
    travel: {
      purpose: 'TOURISM',
      arrivalDate: '2026-12-18',
      departureDate: '2026-12-28',
      entryPoint: 'King Abdulaziz International Airport',
    },
    feeQuote: {
      currency: 'SAR',
      totalMinor: 78100,
      lines: [
        { code: 'VISA_FEE', kind: 'VISA_FEE', qty: 2, unitMinor: 30000, amountMinor: 60000 },
        { code: 'DIGITAL_SERVICE', kind: 'SERVICE_FEE', qty: 2, unitMinor: 4000, amountMinor: 8000 },
        { code: 'VAT', kind: 'TAX', percentBp: 1500, amountMinor: 10100 },
      ],
    },
    submittedAt: '2026-10-12T09:14:00.000Z',
    paidAt: '2026-10-12T09:22:00.000Z',
    assignedAt: '2026-10-13T06:00:00.000Z',
    slaDueAt: '2026-10-16T09:14:00.000Z',
    statusHistory: [
      { status: 'DRAFT', at: '2026-10-10T11:02:00.000Z' },
      { status: 'PENDING_PAYMENT', at: '2026-10-12T09:14:00.000Z' },
      { status: 'SUBMITTED', at: '2026-10-12T09:22:00.000Z' },
      { status: 'UNDER_REVIEW', at: '2026-10-13T06:00:00.000Z' },
    ],
    nextStep: {
      en: 'Your application is being reviewed. Most decisions take about 3 days.',
      ar: 'يجري مراجعة طلبك. معظم القرارات تستغرق نحو 3 أيام.',
    },
  },

  {
    id: 'app_demo_info_requested',
    reference: 'VG-B4XN-3RKM-7WQ2',
    applicantUserId: 'usr_demo',
    visaTypeSlug: 'family-and-friends',
    status: 'INFO_REQUESTED',
    travelerCount: 1,
    travelers: [
      {
        position: 1,
        isPrimary: true,
        initials: 'L.A.',
        fullName: 'Lina Ayd',
        nationalityCode: 'SY',
        maskedPassportNo: '•••••9014',
        passportExpiryDate: '2027-06-30',
      },
    ],
    travel: {
      purpose: 'FAMILY',
      arrivalDate: '2026-11-20',
      departureDate: '2026-12-05',
      entryPoint: 'King Khalid International Airport',
    },
    feeQuote: { currency: 'SAR', totalMinor: 39050, lines: [] },
    submittedAt: '2026-10-08T14:30:00.000Z',
    paidAt: '2026-10-08T14:35:00.000Z',
    slaDueAt: '2026-10-15T14:30:00.000Z',
    statusHistory: [
      { status: 'SUBMITTED', at: '2026-10-08T14:35:00.000Z' },
      { status: 'UNDER_REVIEW', at: '2026-10-09T08:00:00.000Z' },
      { status: 'INFO_REQUESTED', at: '2026-10-11T10:45:00.000Z' },
    ],
    infoRequest: {
      requestedAt: '2026-10-11T10:45:00.000Z',
      deadlineAt: '2026-10-18T10:45:00.000Z',
      message: {
        en: 'We could not read the host’s residency permit. Please upload a clearer copy showing the full document.',
        ar: 'تعذر قراءة تصريح إقامة المضيف. يرجى رفع نسخة أوضح تُظهر المستند بالكامل.',
      },
      items: [{ code: 'HOST_ID', label: { en: "Host's ID copy", ar: 'نسخة هوية المضيف' } }],
    },
    nextStep: {
      en: 'Upload the requested document by 18 Oct 2026.',
      ar: 'ارفع المستند المطلوب بحلول 18 أكتوبر 2026.',
    },
  },

  {
    id: 'app_demo_issued',
    reference: 'VG-8TZW-6HJD-NK53',
    applicantUserId: 'usr_demo',
    visaTypeSlug: 'business-visit',
    status: 'ISSUED',
    travelerCount: 1,
    travelers: [
      {
        position: 1,
        isPrimary: true,
        initials: 'O.M.',
        fullName: 'Omar Mansour',
        nationalityCode: 'EG',
        maskedPassportNo: '•••••3347',
        passportExpiryDate: '2030-01-09',
      },
    ],
    travel: {
      purpose: 'BUSINESS',
      arrivalDate: '2026-10-28',
      departureDate: '2026-11-04',
      entryPoint: 'King Abdulaziz International Airport',
    },
    feeQuote: { currency: 'SAR', totalMinor: 39050, lines: [] },
    submittedAt: '2026-10-01T07:05:00.000Z',
    paidAt: '2026-10-01T07:11:00.000Z',
    slaDueAt: '2026-10-05T07:05:00.000Z',
    statusHistory: [
      { status: 'SUBMITTED', at: '2026-10-01T07:11:00.000Z' },
      { status: 'UNDER_REVIEW', at: '2026-10-01T09:00:00.000Z' },
      { status: 'APPROVED', at: '2026-10-02T12:20:00.000Z' },
      { status: 'ISSUED', at: '2026-10-02T13:02:00.000Z' },
    ],
    visa: {
      id: 'vsa_demo_issued',
      issuedAt: '2026-10-02T13:02:00.000Z',
      validFrom: '2026-10-28',
      validUntil: '2026-11-27',
      verificationToken: 'demo-verification-token',
    },
    nextStep: {
      en: 'Your visa is ready. Download it and carry a printed copy with your passport.',
      ar: 'تأشيرتك جاهزة. نزّلها واحمل نسخة مطبوعة مع جواز سفرك.',
    },
  },

  {
    id: 'app_demo_draft',
    reference: 'VG-DRAFT-0',
    applicantUserId: 'usr_demo',
    visaTypeSlug: 'tourism-multiple-entry',
    status: 'DRAFT',
    travelerCount: 1,
    completedStepKeys: ['applicant', 'passport'],
    travelers: [],
    feeQuote: null,
    statusHistory: [{ status: 'DRAFT', at: '2026-10-16T08:00:00.000Z' }],
    lastSavedAt: '2026-10-16T08:41:00.000Z',
    nextStep: {
      en: 'Continue where you left off — your progress is saved.',
      ar: 'تابع من حيث توقفت — تم حفظ تقدمك.',
    },
  },
]

export const applicationByReference = new Map(
  applications.map((application) => [application.reference, application]),
)

/**
 * Documents a demo applicant would see, in every checklist state the UI must
 * render (FR-DOC-05, §6.6).
 */
export const applicationDocuments = [
  { id: 'doc_1', code: 'PASSPORT_BIO', state: 'done', fileName: 'passport-bio.jpg', fileSize: 1_258_291 },
  { id: 'doc_2', code: 'PHOTO', state: 'done', fileName: 'photo.jpg', fileSize: 327_680 },
  { id: 'doc_3', code: 'RETURN_TICKET', state: 'rejected', reason: { en: 'The image is too blurry to read the booking reference. Upload a sharper copy.', ar: 'الصورة غير واضحة بما يكفي لقراءة رقم الحجز. ارفع نسخة أوضح.' } },
  { id: 'doc_4', code: 'HOTEL_BOOKING', state: 'pending' },
  { id: 'doc_5', code: 'BANK_STATEMENT', state: 'pending', isRequired: false },
]