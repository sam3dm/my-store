import { Helmet } from '@dr.pogodin/react-helmet';
import { type ReactElement } from 'react';
import { ScrollRestoration, useLocation } from 'react-router';

import HomepageSameAsJsonLd from '@/components/HomepageSameAsJsonLd';
import Footer from '@/layouts/parts/Footer';
import Header from '@/layouts/parts/Header';
import Website from '@/layouts/Website';
import { supportedLanguages } from '@/lib/i18n/config';
import { SITE_URL, OG_IMAGE } from '@/lib/seo-meta';

interface RootLayoutProps {
  children: ReactElement;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const location = useLocation();

  // Strip the lang prefix to get the page path (e.g. /en/about → /about)
  const pagePath = location.pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '') || '/';

  // Derive current lang from URL (e.g. /ar/services → 'ar')
  const langMatch = location.pathname.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)/);
  const currentLang = langMatch ? langMatch[1] : 'en';

  // Canonical URL for this page in the current language
  const canonicalUrl = `${SITE_URL}/${currentLang}${pagePath === '/' ? '' : pagePath}`;

  return (
    <Website>
      <Helmet>
        {/* Site-wide defaults — overridden by per-page <Helmet> blocks */}
        <title>Metropolitan Digital Marketing — We Create What the World Remembers</title>
        <meta
          name="description"
          content="Dubai's premier digital marketing and cinematic production agency. Social media, video production, 3D animation, CGI, VFX and AI creative solutions."
        />
        <link rel="icon" href="/airo-assets/images/logo/favicon" />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph defaults */}
        <meta property="og:site_name" content="Metropolitan Digital Marketing" />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Metropolitan Digital Marketing — Dubai Creative Production Studio" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={OG_IMAGE} />
        <meta name="twitter:site" content="@MetroDigitalAE" />

        {/* hreflang annotations for all supported languages */}
        {supportedLanguages.map((lang) => (
          <link
            key={lang.code}
            rel="alternate"
            hrefLang={lang.code}
            href={`${SITE_URL}/${lang.code}${pagePath === '/' ? '' : pagePath}`}
          />
        ))}
        {/* x-default points to English */}
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${SITE_URL}/en${pagePath === '/' ? '' : pagePath}`}
        />
      </Helmet>
      <HomepageSameAsJsonLd />
      <ScrollRestoration />
      <Header />
      {children}
      <Footer />
    </Website>
  );
}
