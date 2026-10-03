import { StrictMode, Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import type { HelmetServerState } from '@dr.pogodin/react-helmet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Outlet,
  StaticRouterProvider,
  createStaticHandler,
  createStaticRouter,
  type RouteObject,
} from 'react-router';

import RootLayout from './layouts/RootLayout';
import Spinner from './components/Spinner';
import { JsonLdSiteUrlProvider } from './lib/json-ld-site-url-context';
import i18n from './lib/i18n';
import { defaultLanguage, getLanguage, isLanguageSupported } from './lib/i18n/config';
import { routes } from './routes';

export interface RenderResult {
  html: string;
  head: string;
  status: number;
  /** Language of the rendered page and its text direction, for the <html> element. */
  lang?: string;
  dir?: 'ltr' | 'rtl';
  redirect?: string;
}

const SpinnerFallback = () => (
  <div className="flex justify-center py-8 h-screen items-center">
    <Spinner />
  </div>
);

// Mirrors the layout wrapping in App.tsx so client and server render the same
// tree. Kept separate from the client `router` in App.tsx because
// createBrowserRouter touches `window` at module load and must never be
// evaluated in the SSR bundle.
const routeTree: RouteObject[] = [
  {
    element: (
      <Suspense fallback={<SpinnerFallback />}>
        <RootLayout>
          <Outlet />
        </RootLayout>
      </Suspense>
    ),
    children: routes,
  },
];

const handler = createStaticHandler(routeTree);

/** The language segment of a /:lang/... URL, or the default language when it is missing or unknown. */
function languageFromUrl(url: string): string {
  const segment = url.split(/[?#]/)[0].split('/')[1];
  return segment && isLanguageSupported(segment) ? segment : defaultLanguage;
}

// Language codes the site used to offer. Old links and search results for them are
// permanently redirected to the same page in the default language.
const RETIRED_LANGUAGE = /^\/(?:de|ja|ko|pt|nl|nl-BE)(?=\/|$|\?)/i;

export async function render(url: string, siteOrigin?: string): Promise<RenderResult> {
  if (RETIRED_LANGUAGE.test(url)) {
    return {
      html: '',
      head: '',
      status: 301,
      redirect: url.replace(RETIRED_LANGUAGE, `/${defaultLanguage}`),
    };
  }

  // createStaticHandler works off a WHATWG Request. We only need the pathname +
  // search; scheme/host don't affect routing. Using a stable sentinel host
  // avoids env-dependent URL parsing.
  const context = await handler.query(new Request(`http://ssr${url}`));

  // A loader/action that throws a Response (or calls redirect()) surfaces here
  // as a Response instead of a StaticHandlerContext. Forward the redirect.
  if (context instanceof Response) {
    return {
      html: '',
      head: '',
      status: context.status,
      redirect: context.headers.get('Location') ?? undefined,
    };
  }

  const router = createStaticRouter(routeTree, context);
  const helmetContext: Record<string, unknown> & { helmet?: HelmetServerState } = {};
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: 0 },
    },
  });

  // One i18n instance per request so concurrent requests in different languages never mix.
  const lang = languageFromUrl(url);
  const requestI18n = i18n.cloneInstance({ lng: lang });

  const html = renderToString(
    <StrictMode>
      <I18nextProvider i18n={requestI18n}>
        <HelmetProvider context={helmetContext}>
          <QueryClientProvider client={queryClient}>
            <JsonLdSiteUrlProvider siteUrl={siteOrigin ?? ''}>
              <StaticRouterProvider router={router} context={context} />
            </JsonLdSiteUrlProvider>
          </QueryClientProvider>
        </HelmetProvider>
      </I18nextProvider>
    </StrictMode>
  );

  const h = helmetContext.helmet;
  const head = h
    ? [
        h.title?.toString() ?? '',
        h.meta?.toString() ?? '',
        h.link?.toString() ?? '',
        h.script?.toString() ?? '',
      ]
        .filter(Boolean)
        .join('\n')
    : '';

  return { html, head, status: context.statusCode ?? 200, lang, dir: getLanguage(lang)?.dir ?? 'ltr' };
}
