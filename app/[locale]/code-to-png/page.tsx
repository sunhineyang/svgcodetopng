import type { Metadata } from 'next';
import { siteConfig, metadataBase } from '../../../config/site';
import CodeToPngConverter from '../../../components/CodeToPngConverter';
import FeedbackProviderWrapper from '../../../components/feedback/FeedbackProviderWrapper';

const locales = ['en', 'ko', 'ja', 'ru', 'es', 'fr', 'de', 'zh', 'pt', 'it', 'id', 'ar'];

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = params.locale || 'en';

  const meta: Record<string, { title: string; description: string; keywords: string }> = {
    en: {
      title: 'Code to PNG Converter — SVG, HTML, CSS | Free & No Watermark',
      description: 'Convert SVG, HTML or CSS code to PNG images instantly. Free online Code to PNG converter — no watermark, no signup, runs entirely in your browser.',
      keywords: 'code to png, code to image, html to png, svg code to png, css to png, online converter, svg tag to png',
    },
    ko: {
      title: '코드 to PNG 변환기 — SVG, HTML, CSS | 무료 & 워터마크 없음',
      description: 'SVG, HTML 또는 CSS 코드를 PNG 이미지로 즉시 변환하세요. 무료 온라인 코드 to PNG 변환기 — 워터마크 없음, 가입 불필요, 브라우저에서 실행.',
      keywords: '코드 to png, 코드 이미지 변환, html to png, svg 코드 to png, css to png, 온라인 변환기, 무료 변환',
    },
    ja: {
      title: 'コード to PNG 変換ツール — SVG, HTML, CSS | 無料 & 透かしなし',
      description: 'SVG、HTML、CSS コードを PNG 画像に即座に変換。無料オンラインコード to PNG 変換ツール — 透かしなし、登録不要、ブラウザで完結。',
      keywords: 'コード to png, コード 画像変換, html to png, svg コード to png, css to png, オンライン変換, 無料',
    },
    ru: {
      title: 'Конвертер Кода в PNG — SVG, HTML, CSS | Бесплатно & Без Водяных Знаков',
      description: 'Мгновенно конвертируйте SVG, HTML или CSS код в PNG изображения. Бесплатный онлайн конвертер — без водяных знаков, без регистрации, работает в браузере.',
      keywords: 'код в png, код в изображение, html в png, svg код в png, css в png, онлайн конвертер, бесплатно',
    },
    es: {
      title: 'Convertidor de Código a PNG — SVG, HTML, CSS | Gratis y Sin Marca de Agua',
      description: 'Convertidor gratuito de código a imagen online. Pega código SVG, HTML o CSS y descarga como PNG o JPG de alta calidad. Sin marca de agua, sin registro — renderizado instantáneo en el navegador.',
      keywords: 'codigo a png, code to png, codigo a imagen, html a png, svg codigo a png, css a png, convertidor online gratis',
    },
    fr: {
      title: 'Convertisseur de Code en PNG — SVG, HTML, CSS | Gratuit & Sans Filigrane',
      description: 'Convertissez instantanément du code SVG, HTML ou CSS en images PNG. Convertisseur en ligne gratuit — sans filigrane, sans inscription, fonctionne dans votre navigateur.',
      keywords: 'code en png, code en image, html en png, svg code en png, css en png, convertisseur en ligne, gratuit',
    },
    de: {
      title: 'Code zu PNG Konverter — SVG, HTML, CSS | Kostenlos & Ohne Wasserzeichen',
      description: 'Kostenloser Code-to-Bild-Konverter online. SVG-Code, HTML oder CSS einfügen und als hochwertiges PNG- oder JPG-Bild herunterladen. Ohne Wasserzeichen, ohne Anmeldung — sofortige Browser-Konvertierung.',
      keywords: 'code to png, code zu png, code to image, html zu png, svg code zu png, css zu png, online konverter, kostenlos',
    },
    zh: {
      title: '代码转PNG转换器 — SVG、HTML、CSS | 免费无水印',
      description: '即时将SVG、HTML或CSS代码转换为PNG图片。免费在线代码转PNG工具 — 无水印、无需注册、完全在浏览器中运行。',
      keywords: '代码转png, 代码转图片, html转png, svg代码转png, css转png, 在线转换器, 免费工具',
    },
    pt: {
      title: 'Conversor de Código para PNG — SVG, HTML, CSS | Grátis e Sem Marca d\'Água',
      description: 'Converta código SVG, HTML ou CSS em imagens PNG instantaneamente. Conversor online gratuito — sem marca d\'água, sem cadastro, funciona no navegador.',
      keywords: 'código para png, código para imagem, html para png, svg código para png, css para png, conversor online, grátis',
    },
    it: {
      title: 'Convertitore da Codice a PNG — SVG, HTML, CSS | Gratuito e Senza Filigrana',
      description: 'Converti istantaneamente codice SVG, HTML o CSS in immagini PNG. Convertitore online gratuito — senza filigrana, senza registrazione, funziona nel browser.',
      keywords: 'codice in png, codice in immagine, html in png, svg codice in png, css in png, convertitore online, gratuito',
    },
    id: {
      title: 'Konverter Kode ke PNG — SVG, HTML, CSS | Gratis & Tanpa Watermark',
      description: 'Konversi kode SVG, HTML, atau CSS menjadi gambar PNG secara instan. Konverter online gratis — tanpa watermark, tanpa pendaftaran, berjalan di browser.',
      keywords: 'kode ke png, kode ke gambar, html ke png, svg kode ke png, css ke png, konverter online, gratis',
    },
    ar: {
      title: 'محول الكود إلى PNG — SVG, HTML, CSS | مجاني وبدون علامة مائية',
      description: 'حوّل كود SVG أو HTML أو CSS إلى صور PNG فورًا. محول مجاني عبر الإنترنت — بدون علامة مائية، بدون تسجيل، يعمل في المتصفح.',
      keywords: 'كود إلى png, كود إلى صورة, html إلى png, svg كود إلى png, css إلى png, محول مجاني عبر الإنترنت',
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
    openGraph: {
        title: m.title,
        description: m.description,
        type: 'website',
        images: [{ url: '/og-image.png', width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image' as const,
        title: m.title,
        description: m.description,
        images: ['/og-image.png'],
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
      <FeedbackProviderWrapper>
        <CodeToPngConverter />
      </FeedbackProviderWrapper>
    </>
  );
}
