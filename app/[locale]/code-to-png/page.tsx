import type { Metadata } from 'next';
import { siteConfig, metadataBase } from '../../../config/site';
import CodeToPngConverter from '../../../components/CodeToPngConverter';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = params.locale || 'en';

  const meta: Record<string, { title: string; description: string; keywords: string }> = {
    en: {
      title: 'Code to PNG Image Converter — SVG, HTML, CSS | Free Online',
      description: 'Convert SVG code, HTML, and CSS to PNG or JPG images — free, instant, no watermark. Paste code and download.',
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
    },
    openGraph: {
      title: m.title,
      description: m.description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: m.title,
      description: m.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function CodeToPngPage() {
  return <CodeToPngConverter />;
}
