/**
 * Localised page content.
 *
 * English page copy lives in src/content/pages/*.json and is exposed through
 * `virtual:content`. Translations live in src/locales/content/<lang>.json,
 * keyed by page name, with the same shape as the English file (only the
 * translatable strings are required). The two are deep-merged by position, so
 * ids, numbers, links, image slots and anything missing from a translation fall
 * back to the English original.
 */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { pages } from 'virtual:content';
import { defaultLanguage } from './config';

import ar from '../../locales/content/ar.json';
import ru from '../../locales/content/ru.json';
import zhCN from '../../locales/content/zh-CN.json';
import tr from '../../locales/content/tr.json';
import fr from '../../locales/content/fr.json';
import it from '../../locales/content/it.json';
import es from '../../locales/content/es.json';
import hi from '../../locales/content/hi.json';

type Pages = typeof pages;
type PageKey = keyof Pages;

const translations: Record<string, Partial<Record<string, unknown>>> = {
  ar,
  ru,
  'zh-CN': zhCN,
  tr,
  fr,
  it,
  es,
  hi,
};

function merge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (Array.isArray(base)) {
    if (!Array.isArray(override)) return base;
    return base.map((item, i) => merge(item, override[i])) as unknown as T;
  }
  if (base && typeof base === 'object') {
    if (typeof override !== 'object' || Array.isArray(override)) return base;
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const key of Object.keys(out)) {
      out[key] = merge(out[key], (override as Record<string, unknown>)[key]);
    }
    return out as T;
  }
  if (typeof base === 'string') {
    return (typeof override === 'string' && override.trim() !== '' ? override : base) as T;
  }
  return base;
}

export function getLocalizedContent<K extends PageKey>(key: K, lang: string): Pages[K] {
  const base = pages[key];
  if (!lang || lang === defaultLanguage) return base;
  const dict = translations[lang] ?? translations[lang.split('-')[0]];
  return merge(base, dict?.[key]);
}

export function useLocalizedContent<K extends PageKey>(key: K): Pages[K] {
  const { i18n } = useTranslation();
  const lang = i18n.language || defaultLanguage;
  return useMemo(() => getLocalizedContent(key, lang), [key, lang]);
}
