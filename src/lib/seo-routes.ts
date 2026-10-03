/**
 * Auto-synced registry of publicly-crawlable routes. Consumed by the
 * /sitemap.xml handler in src/server/entry.ts.
 *
 * DO NOT add or remove paths by hand. Static paths are mirrored here from
 * src/routes.tsx automatically whenever that file is edited (any manual
 * path edit would be overwritten on the next routes.tsx change). For sync
 * to pick up a route, its `path` must be a literal string starting with "/";
 * template literals and identifier refs are skipped, and dynamic-param routes
 * like "/products/:id" are excluded.
 *
 * The only fields safe to hand-edit are the per-entry metadata below, after a
 * sync:
 * - `priority` (0.0–1.0): Home = 1.0, main sections = 0.8, deep pages = 0.5.
 * - `changefreq` and `lastmod`.
 */

export interface SeoRoute {
  path: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
  lastmod?: string;
}

const LANGS = [
  'en', 'ar', 'ru', 'fr', 'de',
  'zh-CN', 'ja', 'hi', 'es', 'nl-BE',
  'pt', 'it', 'tr', 'ko',
] as const;

const LASTMOD = '2026-09-18';

/**
 * Build all language-prefixed routes for a given page path segment.
 * e.g. pageSlug = '' → /en, /ar, ...
 *      pageSlug = '/about' → /en/about, /ar/about, ...
 */
function langRoutes(
  pageSlug: string,
  priority: number,
  changefreq: SeoRoute['changefreq'] = 'weekly',
): SeoRoute[] {
  return LANGS.map((lang) => ({
    path: `/${lang}${pageSlug}`,
    changefreq,
    priority,
    lastmod: LASTMOD,
  }));
}

export const seoRoutes: SeoRoute[] = [
  // NOTE: The root path "/" is a redirect to /en and is intentionally excluded
  // from the sitemap — search engines should index the canonical /en URL, not
  // the redirect. All 14 language homepages are listed below.

  // ── Homepages (/:lang) ─────────────────────────────────────────────────────
  ...langRoutes('', 1.0, 'weekly'),

  // ── Main sections ──────────────────────────────────────────────────────────
  ...langRoutes('/about',      0.8, 'monthly'),
  ...langRoutes('/services',   0.8, 'monthly'),
  ...langRoutes('/industries', 0.8, 'monthly'),
  ...langRoutes('/portfolio',  0.8, 'monthly'),
  ...langRoutes('/contact',    0.8, 'monthly'),

  // ── Industry sub-pages ─────────────────────────────────────────────────────
  ...langRoutes('/industries/luxury-brands', 0.7, 'monthly'),
];
