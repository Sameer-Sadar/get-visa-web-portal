/**
 * Reference data — mirrors `countries` (schema §4.2).
 *
 * `flag` is presentation-only and derived here rather than stored server-side.
 * Country data is never filtered out of `<select>`s — it is reference data,
 * not personal data, so labelling it is required by WCAG 3.3.2.
 */
const RAW = [
  ['SA', 'SAU', 'Saudi Arabia', 'المملكة العربية السعودية', 'السعودي', '+966', '🇸🇦'],
  ['AE', 'ARE', 'United Arab Emirates', 'الإمارات العربية المتحدة', 'الإماراتي', '+971', '🇦🇪'],
  ['KW', 'KWT', 'Kuwait', 'الكويت', 'الكويتي', '+965', '🇰🇼'],
  ['QA', 'QAT', 'Qatar', 'قطر', 'القطري', '+974', '🇶🇦'],
  ['BH', 'BHR', 'Bahrain', 'البحرين', 'البحريني', '+973', '🇧🇭'],
  ['OM', 'OMN', 'Oman', 'سلطنة عُمان', 'العماني', '+968', '🇴🇲'],
  ['EG', 'EGY', 'Egypt', 'مصر', 'المصري', '+20', '🇪🇬'],
  ['JO', 'JOR', 'Jordan', 'الأردن', 'الأردني', '+962', '🇯🇴'],
  ['LB', 'LBN', 'Lebanon', 'لبنان', 'اللبناني', '+961', '🇱🇧'],
  ['IQ', 'IRQ', 'Iraq', 'العراق', 'العراقي', '+964', '🇮🇶'],
  ['SY', 'SYR', 'Syria', 'سوريا', 'السوري', '+963', '🇸🇾'],
  ['YE', 'YEM', 'Yemen', 'اليمن', 'اليمني', '+967', '🇾🇪'],
  ['PS', 'PSE', 'Palestine', 'فلسطين', 'الفلسطيني', '+970', '🇵🇸'],
  ['SD', 'SDN', 'Sudan', 'السودان', 'السوداني', '+249', '🇸🇩'],
  ['PK', 'PAK', 'Pakistan', 'باكستان', 'الباكستاني', '+92', '🇵🇰'],
  ['IN', 'IND', 'India', 'الهند', 'الهندي', '+91', '🇮🇳'],
  ['BD', 'BGD', 'Bangladesh', 'بنغلاديش', 'البنغلاديشي', '+880', '🇧🇩'],
  ['ID', 'IDN', 'Indonesia', 'إندونيسيا', 'الإندونيسي', '+62', '🇮🇩'],
  ['MY', 'MYS', 'Malaysia', 'ماليزيا', 'الماليزي', '+60', '🇲🇾'],
  ['PH', 'PHL', 'Philippines', 'الفلبين', 'الفلبيني', '+63', '🇵🇭'],
  ['TR', 'TUR', 'Türkiye', 'تركيا', 'التركي', '+90', '🇹🇷'],
  ['RU', 'RUS', 'Russia', 'روسيا', 'الروسي', '+7', '🇷🇺'],
  ['UA', 'UKR', 'Ukraine', 'أوكرانيا', 'الأوكراني', '+380', '🇺🇦'],
  ['FR', 'FRA', 'France', 'فرنسا', 'الفرنسي', '+33', '🇫🇷'],
  ['DE', 'DEU', 'Germany', 'ألمانيا', 'الألماني', '+49', '🇩🇪'],
  ['GB', 'GBR', 'United Kingdom', 'المملكة المتحدة', 'البريطاني', '+44', '🇬🇧'],
  ['IT', 'ITA', 'Italy', 'إيطاليا', 'الإيطالي', '+39', '🇮🇹'],
  ['ES', 'ESP', 'Spain', 'إسبانيا', 'الإسباني', '+34', '🇪🇸'],
  ['US', 'USA', 'United States', 'الولايات المتحدة', 'الأمريكي', '+1', '🇺🇸'],
  ['CA', 'CAN', 'Canada', 'كندا', 'الكندي', '+1', '🇨🇦'],
  ['AU', 'AUS', 'Australia', 'أستراليا', 'الأسترالي', '+61', '🇦🇺'],
  ['NZ', 'NZL', 'New Zealand', 'نيوزيلندا', 'النيوزيلندي', '+64', '🇳🇿'],
  ['CN', 'CHN', 'China', 'الصين', 'الصيني', '+86', '🇨🇳'],
  ['JP', 'JPN', 'Japan', 'اليابان', 'الياباني', '+81', '🇯🇵'],
  ['KR', 'KOR', 'South Korea', 'كوريا الجنوبية', 'الكوري الجنوبي', '+82', '🇰🇷'],
  ['ZA', 'ZAF', 'South Africa', 'جنوب أفريقيا', 'جنوب الأفريقي', '+27', '🇿🇦'],
  ['NG', 'NGA', 'Nigeria', 'نيجيريا', 'النيجيري', '+234', '🇳🇬'],
  ['KE', 'KEN', 'Kenya', 'كينيا', 'الكيني', '+254', '🇰🇪'],
  ['MA', 'MAR', 'Morocco', 'المغرب', 'المغربي', '+212', '🇲🇦'],
  ['DZ', 'DZA', 'Algeria', 'الجزائر', 'الجزائري', '+213', '🇩🇿'],
  ['AZ', 'AZE', 'Azerbaijan', 'أذربيجان', 'الأذربيجاني', '+994', '🇦🇿'],
]

export const countries = RAW.map(([code, alpha3, name, nameAr, nationality, dialCode, flag]) => ({
  code,
  alpha3,
  flag,
  dialCode,
  names: { en: name, ar: nameAr },
  nationalityNames: { en: nationality, ar: nationality },
  isActive: true,
}))

export const countryByCode = new Map(countries.map((country) => [country.code, country]))

/** Grouped for the finder/nationality combobox. */
export const NATIONALITY_GROUPS = [
  { code: 'GCC', members: ['BH', 'KW', 'OM', 'QA', 'SA', 'AE'] },
  { code: 'GROUP_A', members: ['AU', 'CA', 'DE', 'ES', 'FR', 'GB', 'IT', 'JP', 'KR', 'NZ', 'US'] },
  { code: 'GROUP_B', members: ['BD', 'ID', 'IN', 'MY', 'PH', 'PK'] },
  /* Arabic-speaking and MENA travellers — the largest group on a real portal,
     and the one the demo persona belongs to. */
  { code: 'GROUP_C', members: ['DZ', 'EG', 'IQ', 'JO', 'LB', 'MA', 'PS', 'SD', 'SY', 'YE'] },
  { code: 'GROUP_D', members: ['AZ', 'RU', 'TR', 'UA'] },
  { code: 'GROUP_E', members: ['CN', 'ZA', 'NG', 'KE'] },
]