import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'ko', 'ja', 'ru', 'es', 'fr', 'de', 'zh'];

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;
  
  // Force English for root path - ignore browser language preferences
  if (!locale || locale === 'en') {
    locale = 'en';
  }
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) {
    locale = 'en'; // Fallback to default instead of notFound
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});

export { locales };