/**
 * Hreflang utilities for Metropolitan Digital Marketing.
 *
 * Generates the full set of <link rel="alternate" hreflang="..."> tags
 * required for Google to understand the multilingual structure of the site.
 *
 * Rules applied:
 * - One tag per language version, using the BCP-47 hreflang value.
 * - x-default points to the English version (primary market).
 * - zh-CN maps to hreflang="zh-Hans" (Simplified Chinese BCP-47).
 * - All hrefs use the live domain from SITE_URL.
 */

import { SITE_URL } from './seo-meta';

/** Map from our internal lang code to the BCP-47 hreflang value Google expects. */
const HREFLANG_MAP: Record<string, string> = {
  en:      'en',
  ar:      'ar',
  ru:      'ru',
  'zh-CN': 'zh-Hans',
  tr:      'tr',
  fr:      'fr',
  it:      'it',
  es:      'es',
  hi:      'hi',
};

export const ALL_LANGS = Object.keys(HREFLANG_MAP) as Array<keyof typeof HREFLANG_MAP>;

/**
 * Returns an array of { hreflang, href } objects for a given page slug.
 * Includes x-default pointing to the English version.
 *
 * @param pageSlug  The path segment after the lang prefix, e.g. '' for home,
 *                  '/about', '/industries/luxury-brands', etc.
 */
export function buildHreflangLinks(pageSlug: string): Array<{ hreflang: string; href: string }> {
  const links = ALL_LANGS.map((lang) => ({
    hreflang: HREFLANG_MAP[lang],
    href: `${SITE_URL}/${lang}${pageSlug}`,
  }));

  // x-default → English version
  links.push({
    hreflang: 'x-default',
    href: `${SITE_URL}/en${pageSlug}`,
  });

  return links;
}
