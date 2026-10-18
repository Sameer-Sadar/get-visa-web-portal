/**
 * Document types — mirrors `documentTypes` (schema §4.3).
 *
 * Limits here are the same ones the UI enforces client-side before upload
 * (FR-DOC-02), so the applicant gets the reason immediately instead of after
 * a round trip.
 */
export const documentTypes = [
  {
    code: 'PASSPORT_BIO',
    name: { en: 'Passport bio page', ar: 'صفحة بيانات جواز السفر' },
    instructions: {
      en: 'A clear photo of the page showing your name, photo and passport number.',
      ar: 'صورة واضحة للصفحة التي تُظهر اسمك وصورتك ورقم جواز السفر.',
    },
    allowedMime: ['application/pdf', 'image/jpeg', 'image/png'],
    allowedFormats: ['pdf', 'jpg', 'png'],
    maxSizeBytes: 5 * 1024 * 1024,
    isPhoto: false,
    isActive: true,
  },
  {
    code: 'PHOTO',
    name: { en: 'Personal photo', ar: 'صورة شخصية' },
    instructions: {
      en: 'A recent colour photo with a plain white background. Face clearly visible.',
      ar: 'صورة ملونة حديثة بخلفية بيضاء، ووجهك ظاهر بوضوح.',
    },
    allowedMime: ['application/pdf', 'image/jpeg', 'image/png'],
    allowedFormats: ['pdf', 'jpg', 'png'],
    maxSizeBytes: 5 * 1024 * 1024,
    isPhoto: true,
    isActive: true,
  },
  {
    code: 'RETURN_TICKET',
    name: { en: 'Return ticket', ar: 'تذكرة العودة' },
    instructions: {
      en: 'A confirmed booking for your trip home, or a reservation for open-jaw travel.',
      ar: 'حجز مؤكد لرحلتك عودة، أو حجز لرحلة مفتوحة الاتجاهين.',
    },
    allowedMime: ['application/pdf', 'image/jpeg', 'image/png'],
    allowedFormats: ['pdf', 'jpg', 'png'],
    maxSizeBytes: 5 * 1024 * 1024,
    isPhoto: false,
    isActive: true,
  },
  {
    code: 'HOTEL_BOOKING',
    name: { en: 'Hotel booking', ar: 'حجز الفندق' },
    instructions: {
      en: 'Confirmed accommodation for your whole stay. A booking reference is enough.',
      ar: 'تأكيد حجز الإقامة طوال مدة إقامتك. يكفي رقم الحجز.',
    },
    allowedMime: ['application/pdf', 'image/jpeg', 'image/png'],
    allowedFormats: ['pdf', 'jpg', 'png'],
    maxSizeBytes: 5 * 1024 * 1024,
    isPhoto: false,
    isActive: true,
  },
  {
    code: 'BANK_STATEMENT',
    name: { en: 'Bank statement', ar: 'كشف حساب بنكي' },
    instructions: {
      en: 'Three months of statements showing your name and an available balance.',
      ar: 'كشوف حساب لثلاثة أشهر تُظهر اسمك والرصيد المتاح.',
    },
    allowedMime: ['application/pdf', 'image/jpeg', 'image/png'],
    allowedFormats: ['pdf', 'jpg', 'png'],
    maxSizeBytes: 5 * 1024 * 1024,
    isPhoto: false,
    isActive: true,
  },
  {
    code: 'INVITATION_LETTER',
    name: { en: 'Invitation letter', ar: 'خطاب دعوة' },
    instructions: {
      en: 'From your host, stating the reason, dates and who is paying.',
      ar: 'من المضيف، يوضح سبب الزيارة والتواريخ ومن يتحمل التكلفة.',
    },
    allowedMime: ['application/pdf', 'image/jpeg', 'image/png'],
    allowedFormats: ['pdf', 'jpg', 'png'],
    maxSizeBytes: 5 * 1024 * 1024,
    isPhoto: false,
    isActive: true,
  },
  {
    code: 'HOST_ID',
    name: { en: "Host's ID copy", ar: 'نسخة هوية المضيف' },
    instructions: {
      en: 'A copy of your host’s national ID or residency permit.',
      ar: 'نسخة من الهوية الوطنية أو تصريح إقامة المضيف.',
    },
    allowedMime: ['application/pdf', 'image/jpeg', 'image/png'],
    allowedFormats: ['pdf', 'jpg', 'png'],
    maxSizeBytes: 5 * 1024 * 1024,
    isPhoto: false,
    isActive: true,
  },
  {
    code: 'MEDICAL_REPORT',
    name: { en: 'Medical report', ar: 'تقرير طبي' },
    instructions: {
      en: 'A current report from a licensed hospital, with your diagnosis and treatment plan.',
      ar: 'تقرير حديث من مستشفى مرخّص يتضمن التشخيص وخطة العلاج.',
    },
    allowedMime: ['application/pdf', 'image/jpeg', 'image/png'],
    allowedFormats: ['pdf', 'jpg', 'png'],
    maxSizeBytes: 5 * 1024 * 1024,
    isPhoto: false,
    isActive: true,
  },
  {
    code: 'INSURANCE_POLICY',
    name: { en: 'Medical insurance policy', ar: 'وثيقة التأمين الطبي' },
    instructions: {
      en: 'Coverage valid for your whole stay, with a minimum of USD 30,000.',
      ar: 'تغطية سارية طوال مدة إقامتك وبحد أدنى 30,000 دولار أمريكي.',
    },
    allowedMime: ['application/pdf', 'image/jpeg', 'image/png'],
    allowedFormats: ['pdf', 'jpg', 'png'],
    maxSizeBytes: 5 * 1024 * 1024,
    isPhoto: false,
    isActive: true,
  },
  {
    code: 'EMPLOYMENT_CONTRACT',
    name: { en: 'Employment contract', ar: 'عقد العمل' },
    instructions: {
      en: 'Signed by you and the employer, stating role, salary and contract dates.',
      ar: 'موقّع منك ومن صاحب العمل ويذكر الوظيفة والراتب وتواريخ العقد.',
    },
    allowedMime: ['application/pdf', 'image/jpeg', 'image/png'],
    allowedFormats: ['pdf', 'jpg', 'png'],
    maxSizeBytes: 5 * 1024 * 1024,
    isPhoto: false,
    isActive: true,
  },
  {
    code: 'UNIVERSITY_LETTER',
    name: { en: 'University acceptance letter', ar: 'خطاب قبول جامعي' },
    instructions: {
      en: 'A conditional or unconditional offer from your institution, dated within 3 months.',
      ar: 'عرض قبول مشروط أو غير مشروط من مؤسستك صادر خلال آخر 3 أشهر.',
    },
    allowedMime: ['application/pdf', 'image/jpeg', 'image/png'],
    allowedFormats: ['pdf', 'jpg', 'png'],
    maxSizeBytes: 5 * 1024 * 1024,
    isPhoto: false,
    isActive: true,
  },
]

export const documentTypeByCode = new Map(documentTypes.map((type) => [type.code, type]))