import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'ko', 'ja', 'ru', 'es', 'fr', 'de', 'zh', 'pt', 'it', 'id', 'ar'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Always show locale prefix to avoid confusion
  // Root path / redirects to /en, /ko shows Korean
  localePrefix: 'as-needed'
});

export const config = {
  // Match all paths except static files and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.svg|robots.txt|sitemap.xml|llms.txt).*)'],
};