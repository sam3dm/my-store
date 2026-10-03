import { RouteObject, Navigate } from 'react-router';
import { lazy } from 'react';
import HomePage from './pages/index';
import ProdNotFoundPage from './pages/_404';
import LanguageWrapper from './components/LanguageWrapper';
import { defaultLanguage } from './lib/i18n/config';

const AboutPage = lazy(() => import('./pages/about'));
const ServicesPage = lazy(() => import('./pages/services'));
const IndustriesPage = lazy(() => import('./pages/industries'));
const LuxuryBrandsPage = lazy(() => import('./pages/industries/luxury-brands'));
const PortfolioPage = lazy(() => import('./pages/portfolio'));
const ContactPage = lazy(() => import('./pages/contact'));

const NotFoundPage = ProdNotFoundPage;

export const routes: RouteObject[] = [
  // Root redirect: / → /en
  {
    path: '/',
    element: <Navigate to={`/${defaultLanguage}`} replace />,
  },
  // Language-prefixed routes: /:lang/*
  {
    path: ':lang',
    element: (
      <LanguageWrapper>
        <HomePage />
      </LanguageWrapper>
    ),
  },
  {
    path: ':lang/about',
    element: (
      <LanguageWrapper>
        <AboutPage />
      </LanguageWrapper>
    ),
  },
  {
    path: ':lang/services',
    element: (
      <LanguageWrapper>
        <ServicesPage />
      </LanguageWrapper>
    ),
  },
  {
    path: ':lang/industries',
    element: (
      <LanguageWrapper>
        <IndustriesPage />
      </LanguageWrapper>
    ),
  },
  {
    path: ':lang/industries/luxury-brands',
    element: (
      <LanguageWrapper>
        <LuxuryBrandsPage />
      </LanguageWrapper>
    ),
  },
  {
    path: ':lang/portfolio',
    element: (
      <LanguageWrapper>
        <PortfolioPage />
      </LanguageWrapper>
    ),
  },
  {
    path: ':lang/contact',
    element: (
      <LanguageWrapper>
        <ContactPage />
      </LanguageWrapper>
    ),
  },
  { id: 'airo-not-found', path: '*', element: <NotFoundPage /> },
];

export type Path = '/' | '/about' | '/services' | '/industries' | '/portfolio' | '/contact';
export type Params = Record<string, string | undefined>;
