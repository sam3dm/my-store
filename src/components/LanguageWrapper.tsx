/**
 * Language Wrapper Component
 *
 * Wraps routes to handle language prefix in URL (e.g., /en/about, /es/about).
 * Syncs the URL language parameter with i18next.
 * Redirects to default language if invalid language code is provided.
 */

import { useEffect } from 'react';
import { useParams, Navigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { isLanguageSupported, getLanguage, defaultLanguage } from '../lib/i18n/config';

interface LanguageWrapperProps {
  children: React.ReactNode;
}

export default function LanguageWrapper({ children }: LanguageWrapperProps) {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    if (lang && isLanguageSupported(lang)) {
      i18n.changeLanguage(lang);

      const language = getLanguage(lang);
      if (language) {
        document.documentElement.dir = language.dir;
        document.documentElement.lang = lang;
      }
    }
  }, [lang, i18n]);

  if (lang && !isLanguageSupported(lang)) {
    // Retired language codes (e.g. /de/about) land on the same page in the default language.
    const rest = location.pathname.replace(/^\/[^/]+/, '');
    return <Navigate to={`/${defaultLanguage}${rest}${location.search}`} replace />;
  }

  return <>{children}</>;
}
