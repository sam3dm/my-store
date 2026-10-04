/** Text helpers for the Metropolitan chatbot (Arabic + English). */

export type ChatLang = 'ar' | 'en';
/** 'other' = a script the bot does not speak (Cyrillic, Chinese, Devanagari…). */
export type DetectedLang = ChatLang | 'other';

const ARABIC_RE = /[؀-ۿ]/g;
const LATIN_RE = /[A-Za-z]/g;
const OTHER_LETTER_RE = /[Ѐ-ӿऀ-ॿ぀-ヿ㐀-鿿가-힯Ͱ-Ͽ֐-׿]/g;

/** Language of a message by dominant script. null when it has no letters at all. */
export function detectLang(text: string): ChatLang | null {
  const r = detectScript(text);
  return r === 'other' ? null : r;
}

export function detectScript(text: string): DetectedLang | null {
  const ar = (text.match(ARABIC_RE) ?? []).length;
  const en = (text.match(LATIN_RE) ?? []).length;
  const other = (text.match(OTHER_LETTER_RE) ?? []).length;
  if (ar === 0 && en === 0 && other === 0) return null;
  if (other > ar && other > en) return 'other';
  return ar >= en ? 'ar' : 'en';
}

const AR_PREFIXES = ['وبال', 'وال', 'بال', 'كال', 'فال', 'لل', 'ال'];

function stemToken(tok: string): string {
  if (/^[a-z]+$/.test(tok)) {
    if (tok.length > 4 && tok.endsWith('ies')) return `${tok.slice(0, -3)}y`;
    if (tok.length > 3 && tok.endsWith('s') && !tok.endsWith('ss')) return tok.slice(0, -1);
    return tok;
  }
  for (const p of AR_PREFIXES) {
    if (tok.startsWith(p) && tok.length - p.length >= 2) return tok.slice(p.length);
  }
  // Attached conjunction "و" ("وتيك توك" = "and TikTok"); short words like "وين" stay as they are.
  if (tok.length >= 4 && tok.startsWith('و') && /[\u0600-\u06FF]/.test(tok)) return tok.slice(1);
  return tok;
}

/** Lower-case, strip diacritics/punctuation, unify Arabic letter variants and drop common prefixes. */
export function normalize(text: string): string {
  const base = text
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, '') // tashkeel + tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\p{L}\p{N}\s+]/gu, ' ');
  return base
    .split(/\s+/)
    .filter(Boolean)
    .map(stemToken)
    .join(' ');
}

/** Also try Arabic words with an attached one-letter preposition removed ("لمطعمي" → "مطعمي"). */
function looseForm(haystack: string): string {
  return haystack
    .split(' ')
    .map((t) => (t.length >= 5 && /^[لبكف][\u0600-\u06FF]+$/.test(t) ? t.slice(1) : t))
    .join(' ');
}

/** True when `haystack` (already normalized) contains the normalized phrase on word boundaries. */
export function hasPhrase(haystack: string, phrase: string): boolean {
  const p = normalize(phrase);
  if (!p) return false;
  const needle = ` ${p} `;
  return ` ${haystack} `.includes(needle) || ` ${looseForm(haystack)} `.includes(needle);
}

export function hasAny(haystack: string, phrases: readonly string[]): boolean {
  return phrases.some((p) => hasPhrase(haystack, p));
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const QUESTION_STARTS = [
  'هل', 'ما', 'ماذا', 'كيف', 'كم', 'متي', 'اين', 'وين', 'لماذا', 'ليش', 'شو', 'ايش', 'مين', 'من', 'عندكم', 'لديكم', 'تقدمون', 'تعملون',
  'do', 'does', 'can', 'could', 'what', 'how', 'when', 'where', 'why', 'who', 'which', 'is', 'are', 'will', 'would', 'tell me',
];

/** Is the visitor asking something (as opposed to answering a question)? */
export function isQuestion(raw: string): boolean {
  if (/[?؟]/.test(raw)) return true;
  const first = normalize(raw).split(' ').slice(0, 2).join(' ');
  return QUESTION_STARTS.some((q) => first === normalize(q) || first.startsWith(`${normalize(q)} `));
}
