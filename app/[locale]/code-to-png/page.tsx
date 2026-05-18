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
    de: {
      title: 'Code zu PNG Konverter — SVG, HTML, CSS | Kostenlos & Ohne Wasserzeichen',
      description: 'Kostenloser Code-to-Bild-Konverter online. SVG-Code, HTML oder CSS einfügen und als hochwertiges PNG- oder JPG-Bild herunterladen. Ohne Wasserzeichen, ohne Anmeldung — sofortige Browser-Konvertierung.',
      keywords: 'code to png, code zu png, code to image, html zu png, svg code zu png, css zu png, online konverter, kostenlos',
    },
    es: {
      title: 'Convertidor de Código a PNG — SVG, HTML, CSS | Gratis y Sin Marca de Agua',
      description: 'Convertidor gratuito de código a imagen online. Pega código SVG, HTML o CSS y descarga como PNG o JPG de alta calidad. Sin marca de agua, sin registro — renderizado instantáneo en el navegador.',
      keywords: 'codigo a png, code to png, codigo a imagen, html a png, svg codigo a png, css a png, convertidor online gratis',
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
