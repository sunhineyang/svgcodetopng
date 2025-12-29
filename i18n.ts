import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'ko', 'ja', 'ru', 'es', 'fr', 'de', 'zh', 'pt', 'it', 'id', 'ar'];

// Language configuration with special properties
export const languages = {
  en: { name: 'English', flag: '🇺🇸', dir: 'ltr' },
  ko: { name: '한국어', flag: '🇰🇷', dir: 'ltr' },
  ja: { name: '日本語', flag: '🇯🇵', dir: 'ltr' },
  ru: { name: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  es: { name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  fr: { name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  de: { name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  zh: { name: '中文', flag: '🇨🇳', dir: 'ltr' },
  pt: { name: 'Português', flag: '🇵🇹', dir: 'ltr' },
  it: { name: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
  id: { name: 'Bahasa Indonesia', flag: '🇮🇩', dir: 'ltr' },
  ar: { name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
};

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