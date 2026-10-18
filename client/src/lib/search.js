/**
 * Search normalization for bilingual content (schema §6, search notes).
 *
 * Arabic readers routinely type without diacritics or tatweel, and often with
 * alef/ya/ta-marbuta variants. Folding these means "الرحمن", "الرحمان" and
 * "الرحمٰن" all match the same FAQ.
 */
export function normalizeSearchText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[ً-ٰٟ]/g, '')
    .trim()
}