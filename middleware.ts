import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'ko', 'ja', 'ru', 'es', 'fr', 'de', 'zh', 'pt', 'it', 'id', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  const pathname = request.nextUrl.pathname;
  const segments = pathname.split('/').filter(Boolean);
  const localeCandidates = ['ko', 'ja', 'ru', 'es', 'fr', 'de', 'zh', 'pt', 'it', 'id', 'ar'];
  const locale = localeCandidates.includes(segments[0]) ? segments[0] : 'en';

  response.headers.set('x-locale', locale);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|icon.svg|logo.svg|og-image.png|robots.txt|sitemap.xml|llms.txt).*)'],
};