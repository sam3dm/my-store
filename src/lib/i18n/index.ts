import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { defaultLanguage, languageCodes } from './config.js';

import en from '../../locales/en.json';
import ar from '../../locales/ar.json';
import ru from '../../locales/ru.json';
import fr from '../../locales/fr.json';
import zhCN from '../../locales/zh-CN.json';
import hi from '../../locales/hi.json';
import es from '../../locales/es.json';
import it from '../../locales/it.json';
import tr from '../../locales/tr.json';

const resources = {
  en:    { translation: en },
  ar:    { translation: ar },
  ru:    { translation: ru },
  fr:    { translation: fr },
  'zh-CN': { translation: zhCN },
  hi:    { translation: hi },
  es:    { translation: es },
  it:    { translation: it },
  tr:    { translation: tr },
};

// The detector reads the URL, localStorage and navigator, so it only runs in the browser.
// On the server the language is chosen per request from the URL (see entry-server.tsx).
if (typeof window !== 'undefined') {
  i18n.use(LanguageDetector);
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: defaultLanguage,
    supportedLngs: languageCodes,
    defaultNS: 'translation',
    ns: ['translation'],
    detection: {
      order: ['path', 'localStorage', 'navigator', 'htmlTag'],
      lookupFromPathIndex: 0,
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: {
      escapeValue: false,
    },
    saveMissing: false,
    debug: false,
  });

export default i18n;
