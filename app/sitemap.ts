import { MetadataRoute } from 'next';
import { siteConfig } from './config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['en', 'ko', 'ja', 'ru', 'es', 'fr', 'de', 'zh', 'pt', 'it', 'id', 'ar'];

  const urls: MetadataRoute.Sitemap = locales.map((locale) => {
    const path = locale === 'en' ? '' : `/${locale}`;
    return {
      url: `${siteConfig.url}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: locale === 'en' ? 1 : 0.9,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [
            l,
            `${siteConfig.url}${l === 'en' ? '' : `/${l}`}`,
          ])
        ),
      },
    };
  });

  return urls;
}
