import { MetadataRoute } from 'next';
import { siteConfig } from '../config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['en', 'ko', 'ja', 'ru', 'es', 'fr', 'de', 'zh', 'pt', 'it', 'id', 'ar'];

  const urls: MetadataRoute.Sitemap = locales.map((locale) => {
    const path = locale === 'en' ? '' : `/${locale}`;
    return {
      url: `${siteConfig.url}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: locale === 'en' ? 1 : 0.9,
      alternates: {
        languages: {
          'x-default': `${siteConfig.url}/`,
          ...Object.fromEntries(
            locales.map((l) => [
              l,
              `${siteConfig.url}${l === 'en' ? '' : `/${l}`}`,
            ])
          ),
        },
      },
    };
  });

  const codeToPngUrls: MetadataRoute.Sitemap = locales.map((locale) => {
    const path = locale === 'en' ? '/code-to-png' : `/${locale}/code-to-png`;
    return {
      url: `${siteConfig.url}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
      alternates: {
        languages: {
          'x-default': `${siteConfig.url}/code-to-png`,
          ...Object.fromEntries(
            locales.map((l) => [
              l,
              `${siteConfig.url}${l === 'en' ? '/code-to-png' : `/${l}/code-to-png`}`,
            ])
          ),
        },
      },
    };
  });

  return [...urls, ...codeToPngUrls];
}
