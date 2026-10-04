# Search visibility (Google, Bing, Yandex, Baidu…)

## What the site publishes (invisible to visitors)
* `<meta name="keywords">` in the page's own language: brand names, ~35 services, ~16 sectors, production software (3ds Max, Maya, Blender…), and the main searches combined with Dubai / Abu Dhabi / Sharjah / Ajman / Umm Al Quwain / Ras Al Khaimah / Fujairah / Al Ain / UAE.
* **schema.org structured data** (`ProfessionalService`) on every page: brand names in all nine languages, ~320 keyword phrases, services offered (the 23 services as an offer catalogue), areas served (each emirate), languages, phone, e-mail, Instagram, Dubai location.
* Geo tags (`geo.region AE-DU`, coordinates), `og:locale` per language, `hreflang` alternates, per-page titles and descriptions in all nine languages (already in `seo-meta.ts`).
* Nothing is placed as hidden text on the page — search engines penalise that.

Edit the terms in `src/lib/seo-keywords.ts` (one row per concept, nine languages per row).

## Honest expectations
* **Google ignores the `keywords` meta tag** (and Bing/Yandex give it little weight). It is included as requested, but it does not by itself rank the site. What helps Google is the structured data, the titles / descriptions, the real page text and speed — all present — plus the steps below, which only you can do.

## Steps that actually move rankings (needs your accounts)
1. **Google Search Console** → add `metropolitandigitalmarketing.com`, verify, and submit `https://metropolitandigitalmarketing.com/sitemap.xml`. Do the same in **Bing Webmaster Tools** (also feeds DuckDuckGo/Yahoo) and **Yandex Webmaster** (Russian audience).
2. **Google Business Profile** (Google Maps listing) for the Dubai office – the single biggest factor for "near me / in Dubai" searches. Use the same name, phone (+971 50 822 1108) and website.
3. Keep the same name/phone/website on Instagram, LinkedIn, Facebook, TikTok, YouTube and directories (UAE business directories, Clutch, Behance) and link back to the site.
4. Publish real content in each language (case studies, articles such as "how to choose a content-creation company in Dubai"). More real text about a service = better ranking for that service.
5. Reviews: ask clients to leave Google reviews.
