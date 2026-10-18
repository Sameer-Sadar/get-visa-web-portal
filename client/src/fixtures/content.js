/**
 * CMS content fixtures — mirrors `faqs`, `announcements` and `cmsPages`
 * (schema §1.4, Content domain).
 *
 * Legal copy here is a structural placeholder. PRD §12 requires operator,
 * legal and privacy review before launch, so these pages are built as
 * structured blocks the CMS can replace wholesale.
 */

export const announcements = [
  {
    id: 'ann_policy_2026_10',
    level: 'info',
    title: {
      en: 'New processing times for medical visas from 20 October',
      ar: 'مدة معالجة جديدة لتأشيرات العلاج الطبي اعتباراً من 20 أكتوبر',
    },
    body: {
      en: 'Medical treatment visa decisions now take up to 7 days instead of 3. Other visa types are unaffected.',
      ar: 'تستغرق قرارات تأشيرات العلاج الطبي الآن حتى 7 أيام بدلاً من 3. تأشيرات الأنواع الأخرى لم تتأثر.',
    },
    publishedAt: '2026-10-18T06:00:00.000Z',
    expiresAt: '2026-11-30T23:59:59.000Z',
    isActive: true,
  },
  {
    id: 'ann_maintenance',
    level: 'warning',
    title: {
      en: 'Document uploads paused on Sunday 25 October, 02:00–04:00',
      ar: 'تعطل رفع المستندات يوم الأحد 25 أكتوبر من 02:00 إلى 04:00',
    },
    body: {
      en: 'You can still complete every other step of an application. Any answers you enter are saved.',
      ar: 'لا يزال بإمكانك إكمال بقية خطوات الطلب. سيتم حفظ جميع الإجابات التي تدخلها.',
    },
    publishedAt: '2026-10-19T06:00:00.000Z',
    expiresAt: '2026-10-26T23:59:59.000Z',
    isActive: true,
  },
]

export const faqs = [
  {
    id: 'faq_processing_time',
    category: 'faqCategory.applying',
    question: { en: 'How long does a visa decision take?', ar: 'كم تستغرق معالجة الطلب؟' },
    answer: {
      en: 'Most standard visit visas are decided within three business days of payment. Medical, work and student visas are reviewed by a case officer and can take up to ten days. The exact processing time is shown on each visa before you apply.',
      ar: 'تُتخذ معظم قرارات تأشيرات الزيارة خلال ثلاثة أيام عمل من الدفع. أما تأشيرات العلاج والعمل والدراسة فتُراجَع من قبل ضابط حالة وقد تستغرق حتى عشرة أيام. تُعرض مدة المعالجة الدقيقة على كل تأشيرة قبل تقديم الطلب.',
    },
    relatedVisaSlugs: ['tourism-single-entry', 'medical-treatment', 'student'],
    sortOrder: 1,
  },
  {
    id: 'faq_passport_validity',
    category: 'faqCategory.applying',
    question: { en: 'How long must my passport be valid?', ar: 'كم يجب أن تكون صلاحية جواز السفر؟' },
    answer: {
      en: 'Your passport must be valid for at least six months beyond the end of your intended stay, and it must have at least two blank pages. We check this while you type and warn you before you submit.',
      ar: 'يجب أن يكون جواز سفرك سارياً لمدة ستة أشهر على الأقل بعد نهاية إقامتك المخططة، وأن يحتوي على صفحتين فارغتين على الأقل. نتحقق من ذلك أثناء إدخال البيانات وننبّهك قبل الإرسال.',
    },
    relatedVisaSlugs: [],
    sortOrder: 2,
  },
  {
    id: 'faq_apply_for_family',
    category: 'faqCategory.applying',
    question: { en: 'Can I apply for my family in one application?', ar: 'هل يمكنني التقديم لأفراد عائلتي في طلب واحد؟' },
    answer: {
      en: 'Yes. Add each traveler to the application, complete their details, upload a document set per traveler and pay once. Every traveler is decided individually, so one refusal does not cancel the others.',
      ar: 'نعم. أضف كل مسافر إلى الطلب، وأكمل بياناته، وارفع مجموعة مستندات لكل مسافر، وادفع مرة واحدة. ويُتخذ قرار لكل مسافر على حدة، لذا لا يُلغي رفض أحدهم بقية الطلبات.',
    },
    relatedVisaSlugs: ['tourism-single-entry'],
    sortOrder: 3,
  },
  {
    id: 'faq_refund',
    category: 'faqCategory.payments',
    question: { en: 'When is a fee refunded?', ar: 'متى تُسترد الرسوم؟' },
    answer: {
      en: 'Fees are refundable when your application is refused for a reason outside your control, or when a processing error is confirmed. Refunds go back to the original payment method. The service fee is not refundable once your application has been submitted for review.',
      ar: 'تُسترد الرسوم عند رفض طلبك لسبب خارج عن إرادتك، أو عند التأكد من وجود خطأ في المعالجة. تعود المبالغ إلى وسيلة الدفع الأصلية. رسوم الخدمة غير قابلة للاسترداد بمجرد تقديم طلبك للمراجعة.',
    },
    relatedVisaSlugs: [],
    sortOrder: 4,
  },
  {
    id: 'faq_payment_safety',
    category: 'faqCategory.payments',
    question: { en: 'Is it safe to pay on this site?', ar: 'هل الدفع آمن عبر هذا الموقع؟' },
    answer: {
      en: 'Payment is handled on the payment provider’s hosted page. We never see or store your card number. You will receive a receipt by email as soon as the payment succeeds.',
      ar: 'يتم الدفع عبر صفحة مزوّد الدفع المستضافة. لا نرى بيانات بطاقتك ولا نخزّنها. وستستلم الإيصال عبر البريد الإلكتروني فور نجاح الدفع.',
    },
    relatedVisaSlugs: [],
    sortOrder: 5,
  },
  {
    id: 'faq_track',
    category: 'faqCategory.tracking',
    question: { en: 'I lost my application number. Can I still track?', ar: 'فقدت رقم الطلب. هل ما زال بإمكانني المتابعة؟' },
    answer: {
      en: 'Yes. Sign in to your account and open "My applications" — every application is listed there. Tracking by number also works without signing in, using the passport number you applied with.',
      ar: 'نعم. سجّل الدخول إلى حسابك وافتح "طلباتي" — ستجد جميع الطلبات مدرجة هناك. ويمكن أيضاً المتابعة برقم الطلب دون تسجيل الدخول باستخدام رقم جواز السفر الذي قدّمت به.',
    },
    relatedVisaSlugs: [],
    sortOrder: 6,
  },
  {
    id: 'faq_info_request',
    category: 'faqCategory.tracking',
    question: { en: 'What does "action required" mean?', ar: 'ماذا يعني "يتطلب إجراء منك"؟' },
    answer: {
      en: 'A case officer needs something we could not verify from what you uploaded — a clearer document, or a detail about your trip. You have seven days to respond, and your application stays open while you do.',
      ar: 'يحتاج ضابط الحالة إلى معلومات لم نتمكن من التحقق منها من مستنداتك المرفوعة — مستند أوضح أو تفصيل عن رحلتك. لديك سبعة أيام للرد، ويبقى طلبك مفتوحاً خلال ذلك الوقت.',
    },
    relatedVisaSlugs: [],
    sortOrder: 7,
  },
  {
    id: 'faq_visa_free',
    category: 'faqCategory.eligibility',
    question: { en: 'Do I still need a visa?', ar: 'هل ما زلت أحتاج إلى تأشيرة؟' },
    answer: {
      en: 'Some nationalities do not need one for short visits. The Visa Finder checks your nationality against the current rules and tells you whether you need a visa, which one fits, and what to bring.',
      ar: 'لا تحتاج بعض الجنسيات إلى تأشيرة للزيارات القصيرة. يتحقق باحث التأشيرات من جنسيتك وفق القواعد الحالية ويخبرك ما إذا كنت بحاجة إلى تأشيرة، وأيها يناسبك، وما يجب إحضاره.',
    },
    relatedVisaSlugs: [],
    sortOrder: 8,
  },
]

export const faqCategories = [
  { code: 'faqCategory.applying', name: { en: 'Applying', ar: 'تقديم الطلب' }, sortOrder: 1 },
  { code: 'faqCategory.eligibility', name: { en: 'Who needs a visa', ar: 'من يحتاج تأشيرة' }, sortOrder: 2 },
  { code: 'faqCategory.payments', name: { en: 'Payments & refunds', ar: 'الدفع والاسترداد' }, sortOrder: 3 },
  { code: 'faqCategory.tracking', name: { en: 'Tracking & decisions', ar: 'المتابعة والقرارات' }, sortOrder: 4 },
]

/**
 * Legal and informational pages. Blocks are structured rather than HTML so the
 * CMS owns ordering and the renderer stays free of `dangerouslySetInnerHTML`
 * (DOMPurify sanitisation is still required for real CMS HTML, §19).
 */
export const cmsPages = {
  about: {
    slug: 'about',
    title: { en: 'About us', ar: 'من نحن' },
    summary: {
      en: 'We make it possible to apply for a visa online, in your own language, and to see where your application is at every step.',
      ar: 'نتيح لك التقديم على تأشيرة عبر الإنترنت بلغتك الخاصة، ومعرفة حالة طلبك في كل خطوة.',
    },
    blocks: [
      { type: 'heading', level: 2, text: { en: 'What this service does', ar: 'ما الذي تقدمه هذه الخدمة' } },
      {
        type: 'paragraph',
        text: {
          en: 'We publish the visa rules in one place, let you check which visa fits your trip before you register, take your application and documents through a single secure process, and tell you the current status without you having to ask.',
          ar: 'ننشر قواعد التأشيرات في مكان واحد، ونتيح لك التحقق من التأشيرة المناسبة لرحلتك قبل التسجيل، ونتولى طلبك ومستنداتك عبر عملية واحدة آمنة، ونطلعك على الحالة الحالية دون أن تضطر إلى السؤال.',
        },
      },
      { type: 'heading', level: 2, text: { en: 'Who we are', ar: 'من نحن' } },
      {
        type: 'paragraph',
        text: {
          en: '[Operator legal entity] operates this portal. We are an independent service and do not issue visas on behalf of a government authority.',
          ar: 'يشغّل هذه البوابة [الكيان القانوني للمشغّل]. نحن خدمة مستقلة ولا نُصدر التأشيرات نيابة عن أي جهة حكومية.',
        },
      },
    ],
  },

  terms: {
    slug: 'terms',
    title: { en: 'Terms of use', ar: 'شروط الاستخدام' },
    summary: {
      en: 'The agreement between you and [Operator legal entity] when you use this portal.',
      ar: 'الاتفاق بينك وبين [الكيان القانوني للمشغّل] عند استخدام هذه البوابة.',
    },
    blocks: [
      { type: 'heading', level: 2, text: { en: '1. What this portal is', ar: '1. ما هي هذه البوابة' } },
      {
        type: 'paragraph',
        text: {
          en: 'This portal lets you prepare and submit a visa application and pay the published fees. It is an independent service. It does not replace any government system of record, and a decision on your application is made by the authorised authority, not by this portal.',
          ar: 'تتيح لك هذه البوابة إعداد وتقديم طلب تأشيرة وسداد الرسوم المعلنة. وهي خدمة مستقلة، ولا تحل محل أي نظام حكومي رسمي، ويصدر قرار طلبك من الجهة المختصة وليس من هذه البوابة.',
        },
      },
      { type: 'heading', level: 2, text: { en: '2. Your responsibilities', ar: '2. مسؤولياتك' } },
      {
        type: 'list',
        items: [
          {
            en: 'Give information that is true, complete and identical to your travel documents.',
            ar: 'تقديم معلومات صحيحة وكاملة ومطابقة لوثائق سفرك.',
          },
          {
            en: 'Upload only documents that belong to the traveler named in the application.',
            ar: 'رفع مستندات تخص المسافر المذكور في الطلب فقط.',
          },
          {
            en: 'Tell us promptly if your circumstances change before a decision is made.',
            ar: 'إعلامنا فوراً إذا تغيرت ظروفك قبل صدور القرار.',
          },
        ],
      },
      { type: 'heading', level: 2, text: { en: '3. Fees', ar: '3. الرسوم' } },
      {
        type: 'paragraph',
        text: {
          en: 'Fees are calculated from the schedule in force on the date you submit, and are shown as a full breakdown before you pay. Refunds are handled under section 4 of this document.',
          ar: 'تُحتسب الرسوم وفق الجدول الساري في تاريخ التقديم، وتُعرض مفصّلة بالكامل قبل الدفع. وتُعالَج الاستردادات وفق البند 4 من هذه الوثيقة.',
        },
      },
    ],
  },

  privacy: {
    slug: 'privacy',
    title: { en: 'Privacy policy', ar: 'سياسة الخصوصية' },
    summary: {
      en: 'What personal data we collect, why we collect it, how long we keep it and the rights you have over it.',
      ar: 'ما البيانات الشخصية التي نجمعها، ولماذا نجمعها، وكم نحتفظ بها، وما حقوقك عليها.',
    },
    blocks: [
      { type: 'heading', level: 2, text: { en: 'What we collect', ar: 'ما الذي نجمعه' } },
      {
        type: 'list',
        items: [
          {
            en: 'Identity and passport data you enter, plus the documents you upload.',
            ar: 'بيانات الهوية وجواز السفر التي تدخلها، إضافة إلى المستندات التي ترفعها.',
          },
          {
            en: 'Application progress, payments and communications with our support team.',
            ar: 'تقدم الطلب، والمدفوعات، والمراسلات مع فريق الدعم.',
          },
          {
            en: 'Technical data such as IP address and device type, kept for fraud prevention.',
            ar: 'بيانات تقنية مثل عنوان IP ونوع الجهاز، وتُحفظ لمنع الاحتيال.',
          },
        ],
      },
      { type: 'heading', level: 2, text: { en: 'How we protect it', ar: 'كيف نحميها' } },
      {
        type: 'paragraph',
        text: {
          en: 'Passport and identity numbers are encrypted at rest. Documents are stored as private files and are never served from a public link. Access by staff is role-based and logged.',
          ar: 'تُشفَّر أرقام جواز السفر والبيانات الشخصية أثناء التخزين. وتُحفظ المستندات كملفات خاصة ولا تُقدَّم أبداً عبر رابط عام. ويكون وصول الموظفين مبنياً على الأدوار ومسجَّلاً.',
        },
      },
      { type: 'heading', level: 2, text: { en: 'Your rights', ar: 'حقوقك' } },
      {
        type: 'paragraph',
        text: {
          en: 'You can ask for a copy of your data or ask us to delete it from your account settings. Some records must be retained for legal reasons, and we will tell you when that applies.',
          ar: 'يمكنك طلب نسخة من بياناتك أو طلب حذفها من إعدادات حسابك. وقد يُلزم الاحتفاظ ببعض السجلات لأسباب قانونية، وسنبلغك عند انطباق ذلك.',
        },
      },
    ],
  },

  cookies: {
    slug: 'cookies',
    title: { en: 'Cookie policy', ar: 'سياسة ملفات تعريف الارتباط' },
    summary: {
      en: 'Which cookies we set, why, and how to change your choices.',
      ar: 'ملفات تعريف الارتباط التي نضعها، ولماذا، وكيف يمكنك تغيير اختياراتك.',
    },
    blocks: [
      { type: 'heading', level: 2, text: { en: 'Essential cookies', ar: 'الملفات الضرورية' } },
      {
        type: 'paragraph',
        text: {
          en: 'These keep you signed in and protect forms against cross-site request forgery. They cannot be switched off and are not used for advertising.',
          ar: 'تحافظ هذه على تسجيل دخولك وتحمي النماذج من تزوير الطلبات عبر المواقع. لا يمكن تعطيلها ولا تُستخدم للإعلانات.',
        },
      },
      { type: 'heading', level: 2, text: { en: 'Analytics cookies', ar: 'ملفات التحليلات' } },
      {
        type: 'paragraph',
        text: {
          en: 'With your consent, these tell us which pages are useful so we can improve them. You can refuse them without losing any functionality.',
          ar: 'بإذنك، تخبرنا هذه الصفحات المفيدة لنحسّنها. يمكنك رفضها دون فقدان أي وظيفة.',
        },
      },
    ],
  },

  accessibility: {
    slug: 'accessibility',
    title: { en: 'Accessibility', ar: 'إمكانية الوصول' },
    summary: {
      en: 'Our commitment to WCAG 2.2 level AA, and how to tell us when something does not work for you.',
      ar: 'التزامنا بمعيار WCAG 2.2 المستوى AA، وكيف تخبرنا عند وجود ما لا يعمل معك.',
    },
    blocks: [
      { type: 'heading', level: 2, text: { en: 'What we support', ar: 'ما الذي ندعمه' } },
      {
        type: 'list',
        items: [
          { en: 'The full site is available in Arabic and English, with correct reading direction in both.', ar: 'الموقع متاح بالكامل بالعربية والإنجليزية، مع اتجاه قراءة صحيح في اللغتين.' },
          { en: 'Every page works with a keyboard alone, with a visible focus indicator.', ar: 'تعمل كل الصفحات بلوحة المفاتيح وحدها، مع مؤشر تركيز مرئي.' },
          { en: 'Screen readers are tested in both languages.', ar: 'تُختبر قارئات الشاشة باللغتين.' },
          { en: 'Text can be resized to 200% and the layout reflows on small screens.', ar: 'يمكن تكبير النص حتى 200% وتُعاد تخطيط الصفحات على الشاشات الصغيرة.' },
        ],
      },
      { type: 'heading', level: 2, text: { en: 'Telling us about a problem', ar: 'الإبلاغ عن مشكلة' } },
      {
        type: 'paragraph',
        text: {
          en: 'If any part of this service is hard to use with your technology, contact us and tell us the page and what happened. We aim to reply within two business days.',
          ar: 'إذا واجهت صعوبة في استخدام أي جزء من هذه الخدمة مع تقنيتك، تواصل معنا واذكر الصفحة وما حدث. ونهدف إلى الرد خلال يومي عمل.',
        },
      },
    ],
  },
}