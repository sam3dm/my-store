import { Helmet } from '@dr.pogodin/react-helmet';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { useLocalizedContent } from '@/lib/i18n/content';
import {
  allBrandNames,
  knowsAbout,
  metaKeywords,
  placeNames,
  structuredKeywords,
} from '@/lib/seo-keywords';
import { BRAND, SITE_URL, getPageSeo, OG_IMAGE } from '@/lib/seo-meta';

const OG_LOCALE: Record<string, string> = {
  en: 'en_US', ar: 'ar_AE', ru: 'ru_RU', 'zh-CN': 'zh_CN', tr: 'tr_TR', fr: 'fr_FR', it: 'it_IT', es: 'es_ES', hi: 'hi_IN',
};
const LANGUAGE_NAMES = ['Arabic', 'English', 'Russian', 'Chinese', 'Turkish', 'French', 'Italian', 'Spanish', 'Hindi'];

/**
 * Search-engine metadata that visitors never see: the multilingual keyword set (meta keywords) and a
 * schema.org ProfessionalService record (services, areas served in every emirate, languages, contact,
 * keywords). Nothing here is rendered as page text.
 */
export default function SeoKeywords(): ReactElement {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const services = useLocalizedContent('services').services;
  const contact = useLocalizedContent('contact');

  const business = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}/#business`,
    name: BRAND,
    alternateName: allBrandNames(),
    url: `${SITE_URL}/${lang}`,
    image: OG_IMAGE,
    description: getPageSeo('home', lang).description,
    telephone: '+971508221108',
    email: 'info@metropolitandigitalmarketing.com',
    address: { '@type': 'PostalAddress', addressLocality: 'Dubai', addressCountry: 'AE' },
    geo: { '@type': 'GeoCoordinates', latitude: 25.2048, longitude: 55.2708 },
    areaServed: [
      { '@type': 'Country', name: 'United Arab Emirates' },
      ...placeNames()
        .filter((n) => n !== 'UAE')
        .map((name) => ({ '@type': 'AdministrativeArea', name })),
    ],
    availableLanguage: LANGUAGE_NAMES,
    inLanguage: lang,
    knowsAbout: knowsAbout(lang),
    keywords: structuredKeywords(lang).join(', '),
    serviceType: services.map((s) => s.title),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: BRAND,
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.title, description: s.tagline },
      })),
    },
    sameAs: [contact.social.instagram.href],
  };

  return (
    <Helmet>
      <meta name="keywords" content={metaKeywords(lang).join(', ')} />
      <meta name="geo.region" content="AE-DU" />
      <meta name="geo.placename" content="Dubai" />
      <meta name="geo.position" content="25.2048;55.2708" />
      <meta name="ICBM" content="25.2048, 55.2708" />
      <meta property="og:locale" content={OG_LOCALE[lang] ?? 'en_US'} />
      {Object.entries(OG_LOCALE)
        .filter(([l]) => l !== lang)
        .map(([l, loc]) => (
          <meta key={l} property="og:locale:alternate" content={loc} />
        ))}
      <script type="application/ld+json">{JSON.stringify(business).replace(/</g, '\\u003c')}</script>
    </Helmet>
  );
}
