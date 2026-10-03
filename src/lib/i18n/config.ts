export interface Language {
  code: string;
  name: string;
  dir: 'ltr' | 'rtl';
  nativeName: string;
}

export const supportedLanguages: Language[] = [
  { code: 'en',    name: 'English',            nativeName: 'English',    dir: 'ltr' },
  { code: 'ar',    name: 'Arabic',             nativeName: 'العربية',    dir: 'rtl' },
  { code: 'ru',    name: 'Russian',            nativeName: 'Русский',    dir: 'ltr' },
  { code: 'fr',    name: 'French',             nativeName: 'Français',   dir: 'ltr' },
  { code: 'de',    name: 'German',             nativeName: 'Deutsch',    dir: 'ltr' },
  { code: 'zh-CN', name: 'Simplified Chinese', nativeName: '简体中文',    dir: 'ltr' },
  { code: 'ja',    name: 'Japanese',           nativeName: '日本語',      dir: 'ltr' },
  { code: 'hi',    name: 'Hindi',              nativeName: 'हिन्दी',      dir: 'ltr' },
  { code: 'es',    name: 'Spanish',            nativeName: 'Español',    dir: 'ltr' },
  { code: 'nl-BE', name: 'Dutch (Belgium)',    nativeName: 'Nederlands', dir: 'ltr' },
  { code: 'pt',    name: 'Portuguese',         nativeName: 'Português',  dir: 'ltr' },
  { code: 'it',    name: 'Italian',            nativeName: 'Italiano',   dir: 'ltr' },
  { code: 'tr',    name: 'Turkish',            nativeName: 'Türkçe',     dir: 'ltr' },
  { code: 'ko',    name: 'Korean',             nativeName: '한국어',      dir: 'ltr' },
];

export const defaultLanguage = 'en';
export const languageCodes = supportedLanguages.map((l) => l.code);

export function isLanguageSupported(code: string): boolean {
  return languageCodes.includes(code);
}

export function getLanguage(code: string): Language | undefined {
  return supportedLanguages.find((l) => l.code === code);
}
