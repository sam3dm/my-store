import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { defaultLanguage, languageCodes } from './config.js';

import en from '../../locales/en.json';
import ar from '../../locales/ar.json';
import ru from '../../locales/ru.json';
import fr from '../../locales/fr.json';
import de from '../../locales/de.json';
import zhCN from '../../locales/zh-CN.json';
import ja from '../../locales/ja.json';
import hi from '../../locales/hi.json';
import es from '../../locales/es.json';
import nlBE from '../../locales/nl-BE.json';
import pt from '../../locales/pt.json';
import it from '../../locales/it.json';
import tr from '../../locales/tr.json';
import ko from '../../locales/ko.json';

const resources = {
  en:    { translation: en },
  ar:    { translation: ar },
  ru:    { translation: ru },
  fr:    { translation: fr },
  de:    { translation: de },
  'zh-CN': { translation: zhCN },
  ja:    { translation: ja },
  hi:    { translation: hi },
  es:    { translation: es },
  'nl-BE': { translation: nlBE },
  pt:    { translation: pt },
  it:    { translation: it },
  tr:    { translation: tr },
  ko:    { translation: ko },
};

i18n
  .use(LanguageDetector)
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
