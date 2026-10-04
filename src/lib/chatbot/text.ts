/** Text helpers for the Metropolitan chatbot (Arabic + English). */

export type ChatLang = 'ar' | 'en';

const ARABIC_RE = /[؀-ۿ]/g;
const LATIN_RE = /[A-Za-z]/g;

/** Language of a message, judged by which script dominates. null when it has no letters. */
export function detectLang(text: string): ChatLang | null {
  const ar = (text.match(ARABIC_RE) ?? []).length;
  const en = (text.match(LATIN_RE) ?? []).length;
  if (ar === 0 && en === 0) return null;
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

/** True when `haystack` (already normalized) contains the normalized phrase on word boundaries. */
export function hasPhrase(haystack: string, phrase: string): boolean {
  const p = normalize(phrase);
  if (!p) return false;
  return ` ${haystack} `.includes(` ${p} `);
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
