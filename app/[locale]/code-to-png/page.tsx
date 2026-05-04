import type { Metadata } from 'next';
import { siteConfig, metadataBase } from '../../../config/site';
import CodeToPngConverter from '../../../components/CodeToPngConverter';

const locales = ['en', 'ko', 'ja', 'ru', 'es', 'fr', 'de', 'zh', 'pt', 'it', 'id', 'ar'];

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = params.locale || 'en';

  const meta: Record<string, { title: string; description: string; keywords: string }> = {
    en: {
      title: 'Code to PNG Converter — SVG, HTML, CSS | Free & No Watermark',
      description: 'Free online code-to-image converter. Paste SVG, HTML or CSS code and download as high-quality PNG or JPG. No watermark or signup—instant browser rendering.',
      keywords: 'code to png, code to image, html to png, svg code to png, css to png, online converter',
    },
  };

  const m = meta[locale] || meta.en;

  return {
    metadataBase,
    title: m.title,
    description: m.description,
    keywords: m.keywords,
    alternates: {
      canonical: `${siteConfig.url}${locale === 'en' ? '/code-to-png' : `/${locale}/code-to-png`}`,
      languages: Object.fromEntries(
        locales.map((l) => [
          l,
          `${siteConfig.url}${l === 'en' ? '/code-to-png' : `/${l}/code-to-png`}`,
        ])
      ),
    },
    openGraph: {
      title: m.title,
      description: m.description,
      type: 'website',
      images: [{ url: '/logo.svg', width: 512, height: 512 }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: m.title,
      description: m.description,
      images: ['/logo.svg'],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function CodeToPngPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Code to PNG Image Converter',
            url: `${siteConfig.url}/code-to-png`,
            description: 'Convert SVG code, HTML, and CSS to PNG or JPG images for free. No watermark, no signup.',
            applicationCategory: 'Multimedia',
            operatingSystem: 'All',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
      <CodeToPngConverter />
    </>
  );
}
