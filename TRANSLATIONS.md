# Languages and translations

The site is available in 9 languages: English (default), Arabic, Russian, Simplified Chinese, Turkish, French, Italian, Spanish and Hindi. Each language lives under its own URL prefix (`/ru/about`, `/zh-CN/contact`, …).

## Where the text lives

| What | English source | Translations |
| --- | --- | --- |
| Menus, buttons, footer, form labels, home page headings, accessibility labels | `src/locales/en.json` | `src/locales/<lang>.json` |
| Page copy (About, Services, Industries, Luxury Brands, Portfolio, Contact, home lists) | `src/content/pages/*.json` | `src/locales/content/<lang>.json` |
| Page titles and meta descriptions (SEO) | `src/lib/seo-meta.ts` | same file, one block per language |

`src/locales/content/<lang>.json` mirrors the structure of the English page files and is merged over them by position, so ids, numbers, links and image slots always come from English. Anything missing from a translation falls back to English.

## Changing a translation

Edit the text in the language file and rebuild. Keep `{{name}}`/`{{count}}` placeholders intact. Plural forms use i18next suffixes (`workCount_one`, `workCount_other`, plus `_few`/`_many` for Russian and `_zero`/`_two`/`_few`/`_many` for Arabic).

## Adding or removing a language

1. `src/lib/i18n/config.ts` – add/remove the language (code, name, direction).
2. `src/lib/i18n/index.ts` – register its `src/locales/<lang>.json`.
3. `src/lib/i18n/content.ts` – register its `src/locales/content/<lang>.json`.
4. `src/lib/hreflang.ts`, `src/lib/seo-routes.ts`, `src/lib/seo-meta.ts` – hreflang, sitemap and SEO titles.
5. Old links to a removed language are redirected to English in `src/entry-server.tsx` (`RETIRED_LANGUAGE`).

## Checks

`npm test` includes `src/lib/i18n/__tests__/content.test.ts`, which fails if a language is missing part of the page content.
