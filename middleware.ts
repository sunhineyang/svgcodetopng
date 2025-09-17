import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'ko'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Always show locale prefix to avoid confusion
  // Root path / redirects to /en, /ko shows Korean
  localePrefix: 'always'
});

export const config = {
  // Match all paths except static files and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.svg|robots.txt|sitemap.xml).*)'],
};