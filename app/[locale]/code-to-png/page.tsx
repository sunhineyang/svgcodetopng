import type { Metadata } from 'next';
import { siteConfig, metadataBase } from '../../../config/site';
import CodeToPngConverter from '../../../components/CodeToPngConverter';

const locales = ['en', 'ko', 'ja', 'ru', 'es', 'fr', 'de', 'zh', 'pt', 'it', 'id', 'ar'];

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = params.locale || 'en';

  const meta: Record<string, { title: string; description: string; keywords: string }> = {
    en: {
      title: 'Code to PNG Converter — SVG, HTML, CSS | Free & No Watermark',
      description: 'Convert SVG, HTML or CSS code to PNG images instantly. Free online Code to PNG converter — no watermark, no signup, runs entirely in your browser.',
      keywords: 'code to png, code to image, html to png, svg code to png, css to png, online converter, svg tag to png',
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

export default function CodeToPngPage({ params }: { params: { locale: string } }) {
  const locale = params.locale || 'en';
  const pageUrl = `${siteConfig.url}${locale === 'en' ? '/code-to-png' : `/${locale}/code-to-png`}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebApplication',
                name: 'Code to PNG Image Converter',
                url: pageUrl,
                description: 'Convert SVG code, HTML, and CSS to PNG or JPG images for free. No watermark, no signup.',
                applicationCategory: 'Multimedia',
                operatingSystem: 'All',
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              },
              {
                '@type': 'HowTo',
                name: 'How to Convert Code to PNG',
                description: 'Convert SVG, HTML or CSS code to PNG images in 3 simple steps.',
                step: [
                  {
                    '@type': 'HowToStep',
                    name: 'Paste Your SVG, HTML or CSS Code',
                    text: 'Just copy and paste any SVG markup, HTML snippet, or CSS-styled code into the editor. Our tool instantly renders a live preview.',
                    position: 1,
                  },
                  {
                    '@type': 'HowToStep',
                    name: 'Choose Your Format and Settings',
                    text: 'Select PNG or JPG, adjust quality and dimensions. Add a white, black or transparent background to match your needs.',
                    position: 2,
                  },
                  {
                    '@type': 'HowToStep',
                    name: 'Download Your High-Quality Image',
                    text: "Click convert and instantly download your rendered image. No watermark, no signup needed — it's that simple.",
                    position: 3,
                  },
                ],
              },
              {
                '@type': 'FAQPage',
                mainEntity: [
                  {
                    '@type': 'Question',
                    name: 'How do I convert my code to PNG?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Just paste your SVG, HTML or CSS code into the editor, choose PNG or JPG as your format, adjust any settings, and click Convert. Your image downloads instantly.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Can I convert HTML/CSS to an image?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Yes! Switch to the HTML/CSS tab, paste your code, and download as PNG or JPG. Our tool renders any HTML markup with inline or embedded CSS into a crisp image.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Does my code get uploaded to a server?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: "No. All conversion happens entirely in your browser using JavaScript. Your code never leaves your device — it's 100% private and secure.",
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Is it really free? Will there be a watermark?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Completely free — no registration, no watermark, no file size limits. Use it as many times as you want.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'What formats can I export to?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'PNG (supports transparency) and JPG. Need GIF? Try our main SVG converter.',
                    },
                  },
                ],
              },
            ],
          }),
        }}
      />
      <CodeToPngConverter />
    </>
  );
}
