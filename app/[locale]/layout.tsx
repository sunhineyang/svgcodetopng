import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import { languages } from '../../i18n';
import { metadataBase, siteConfig } from '../../config/site';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

// Dynamic metadata will be handled by generateMetadata function
export async function generateMetadata({ params }: { params: { locale: string } }) {
  const locale = params.locale || 'en';
  
  if (locale === 'ko') {
    return {
      metadataBase,
      title: 'SVG 코드를 PNG 변환기 (PNG, JPG, GIF) | 무료 온라인 도구',
      description: 'SVG 코드를 고품질 PNG, JPG, GIF 이미지로 무료 변환하세요. 코드를 붙여넣고, SVG를 실시간 미리보기하고, 즉시 파일을 다운로드하세요. 빠르고, 쉽고, 가입 불필요.',
      keywords: 'svg to png, svg 변환기, svg to image, 코드 to png, 온라인 변환기',
      authors: [{ name: 'SVG 변환기 팀' }],
      creator: 'SVG 변환기',
      publisher: 'SVG 변환기',
      icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
        apple: '/favicon.svg',
      },
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      alternates: {
        canonical: `${siteConfig.url}/ko`,
        languages: {
          'en-US': '/',
          'ko': '/ko',
          'ja': '/ja',
          'ru': '/ru',
          'es': '/es',
          'fr': '/fr',
          'de': '/de',
          'zh': '/zh',
          'pt': '/pt',
          'it': '/it',
          'id': '/id',
          'ar': '/ar',
        },
      },
      openGraph: {
        title: 'SVG 코드를 PNG 변환기 - 무료 온라인 도구',
        description: 'SVG 코드를 고품질 PNG 이미지로 즉시 변환하세요. 실시간 미리보기가 있는 무료 온라인 변환기.',
        locale: 'ko_KR',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'SVG 코드를 PNG 변환기 - 무료 온라인 도구',
        description: 'SVG 코드를 고품질 PNG 이미지로 즉시 변환하세요.',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }
  
  if (locale === 'ja') {
    return {
      metadataBase,
      title: 'SVG PNG 変換 - 無料オンライン変換ツール | 高品質・即時',
      description: 'SVGコードをPNG画像に無料でオンライン変換。透明背景対応、高品質出力、即時変換。登録不要で簡単にSVG PNG 変換が可能。',
      keywords: 'SVG PNG 変換, SVGコード PNG変換, オンライン変換ツール, 無料, 高品質, 即時, 透明背景',
      authors: [{ name: 'SVG変換ツールチーム' }],
      creator: 'SVG変換ツール',
      publisher: 'SVG変換ツール',
      icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
        apple: '/favicon.svg',
      },
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      alternates: {
        canonical: `${siteConfig.url}/ja`,
        languages: {
          'en-US': '/',
          'ko': '/ko',
          'ja': '/ja',
          'ru': '/ru',
          'es': '/es',
          'fr': '/fr',
          'de': '/de',
          'zh': '/zh',
          'pt': '/pt',
          'it': '/it',
          'id': '/id',
          'ar': '/ar',
        },
      },
      openGraph: {
        title: 'SVG PNG 変換 - 無料オンライン変換ツール',
        description: 'SVGコードをPNG画像に即時変換。透明背景対応の無料オンライン変換ツール。',
        locale: 'ja_JP',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'SVG PNG 変換 - 無料オンライン変換ツール',
        description: 'SVGコードをPNG画像に即時変換。',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }
  
  if (locale === 'ru') {
    return {
      metadataBase,
      title: 'SVG PNG конвертер - Бесплатный онлайн инструмент | Высокое качество',
      description: 'Конвертируйте SVG код в PNG изображения бесплатно онлайн. Поддержка прозрачного фона, высокое качество, мгновенная конвертация. SVG PNG конвертер без регистрации.',
      keywords: 'SVG PNG конвертер, SVG код PNG конвертер, онлайн конвертер, бесплатно, высокое качество, мгновенно, прозрачный фон',
      authors: [{ name: 'SVG конвертер команда' }],
      creator: 'SVG конвертер',
      publisher: 'SVG конвертер',
      icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
        apple: '/favicon.svg',
      },
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      alternates: {
        canonical: `${siteConfig.url}/ru`,
        languages: {
          'en-US': '/',
          'ko': '/ko',
          'ja': '/ja',
          'ru': '/ru',
          'es': '/es',
          'fr': '/fr',
          'de': '/de',
          'zh': '/zh',
          'pt': '/pt',
          'it': '/it',
          'id': '/id',
          'ar': '/ar',
        },
      },
      openGraph: {
        title: 'SVG PNG конвертер - Бесплатный онлайн инструмент',
        description: 'Мгновенная конвертация SVG кода в PNG изображения. Бесплатный онлайн SVG PNG конвертер с поддержкой прозрачного фона.',
        locale: 'ru_RU',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'SVG PNG конвертер - Бесплатный онлайн инструмент',
        description: 'Мгновенная конвертация SVG кода в PNG изображения.',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }
  
  if (locale === 'es') {
    return {
      metadataBase,
      title: 'Convertidor SVG PNG - Herramienta Online Gratuita | Alta Calidad',
      description: 'Convierte código SVG a imágenes PNG gratis online. Soporte de fondo transparente, alta calidad, conversión instantánea. Convertidor SVG PNG sin registro.',
      keywords: 'convertidor SVG PNG, código SVG PNG convertidor, convertidor online, gratis, alta calidad, instantáneo, fondo transparente',
      authors: [{ name: 'Equipo Convertidor SVG' }],
      creator: 'Convertidor SVG',
      publisher: 'Convertidor SVG',
      icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
        apple: '/favicon.svg',
      },
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      alternates: {
        canonical: `${siteConfig.url}/es`,
        languages: {
          'en-US': '/',
          'ko': '/ko',
          'ja': '/ja',
          'ru': '/ru',
          'es': '/es',
          'fr': '/fr',
          'de': '/de',
          'zh': '/zh',
          'pt': '/pt',
          'it': '/it',
          'id': '/id',
          'ar': '/ar',
        },
      },
      openGraph: {
        title: 'Convertidor SVG PNG - Herramienta Online Gratuita',
        description: 'Conversión instantánea de código SVG a imágenes PNG. Convertidor SVG PNG online gratuito con soporte de fondo transparente.',
        locale: 'es_ES',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Convertidor SVG PNG - Herramienta Online Gratuita',
        description: 'Conversión instantánea de código SVG a imágenes PNG.',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }
  
  if (locale === 'pt') {
    return {
      title: 'Conversor SVG PNG - Ferramenta Online Gratuita | Alta Qualidade',
      description: 'Converta código SVG em imagens PNG grátis online. Suporte de fundo transparente, alta qualidade, conversão instantânea. Conversor SVG PNG sem registro.',
      keywords: 'conversor SVG PNG, código SVG PNG conversor, conversor online, grátis, alta qualidade, instantâneo, fundo transparente',
      authors: [{ name: 'Equipa Conversor SVG' }],
      creator: 'Conversor SVG',
      publisher: 'Conversor SVG',
      icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
        apple: '/favicon.svg',
      },
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      alternates: {
        canonical: `${siteConfig.url}/pt`,
        languages: {
          'en-US': '/',
          'ko': '/ko',
          'ja': '/ja',
          'ru': '/ru',
          'es': '/es',
          'fr': '/fr',
          'de': '/de',
          'zh': '/zh',
          'pt': '/pt',
          'it': '/it',
          'id': '/id',
          'ar': '/ar',
        },
      },
      openGraph: {
        title: 'Conversor SVG PNG - Ferramenta Online Gratuita',
        description: 'Conversão instantânea de código SVG em imagens PNG. Conversor SVG PNG online gratuito com suporte de fundo transparente.',
        locale: 'pt_PT',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Conversor SVG PNG - Ferramenta Online Gratuita',
        description: 'Conversão instantânea de código SVG em imagens PNG.',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }
  
  if (locale === 'it') {
    return {
      metadataBase,
      title: 'Convertitore SVG PNG - Strumento Online Gratuito | Alta Qualità',
      description: 'Converti codice SVG in immagini PNG gratis online. Supporto sfondo trasparente, alta qualità, conversione istantanea. Convertitore SVG PNG senza registrazione.',
      keywords: 'convertitore SVG PNG, codice SVG PNG convertitore, convertitore online, gratis, alta qualità, istantaneo, sfondo trasparente',
      authors: [{ name: 'Team Convertitore SVG' }],
      creator: 'Convertitore SVG',
      publisher: 'Convertitore SVG',
      icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
        apple: '/favicon.svg',
      },
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      alternates: {
        canonical: `${siteConfig.url}/it`,
        languages: {
          'en-US': '/',
          'ko': '/ko',
          'ja': '/ja',
          'ru': '/ru',
          'es': '/es',
          'fr': '/fr',
          'de': '/de',
          'zh': '/zh',
          'pt': '/pt',
          'it': '/it',
          'id': '/id',
          'ar': '/ar',
        },
      },
      openGraph: {
        title: 'Convertitore SVG PNG - Strumento Online Gratuito',
        description: 'Conversione istantanea di codice SVG in immagini PNG. Convertitore SVG PNG online gratuito con supporto sfondo trasparente.',
        locale: 'it_IT',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Convertitore SVG PNG - Strumento Online Gratuito',
        description: 'Conversione istantanea di codice SVG in immagini PNG.',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }
  
  if (locale === 'fr') {
    return {
      metadataBase,
      title: 'Convertisseur SVG PNG - Outil en Ligne Gratuit | Haute Qualité',
      description: 'Convertissez le code SVG en images PNG gratuitement en ligne. Support de fond transparent, haute qualité, conversion instantanée. Convertisseur SVG PNG sans inscription.',
      keywords: 'convertisseur SVG PNG, code SVG PNG convertisseur, convertisseur en ligne, gratuit, haute qualité, instantané, fond transparent',
      authors: [{ name: 'Équipe Convertisseur SVG' }],
      creator: 'Convertisseur SVG',
      publisher: 'Convertisseur SVG',
      icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
        apple: '/favicon.svg',
      },
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      alternates: {
        canonical: `${siteConfig.url}/fr`,
        languages: {
          'en-US': '/',
          'ko': '/ko',
          'ja': '/ja',
          'ru': '/ru',
          'es': '/es',
          'fr': '/fr',
          'de': '/de',
          'zh': '/zh',
          'pt': '/pt',
          'it': '/it',
          'id': '/id',
          'ar': '/ar',
        },
      },
      openGraph: {
        title: 'Convertisseur SVG PNG - Outil en Ligne Gratuit',
        description: 'Conversion instantanée de code SVG en images PNG. Convertisseur SVG PNG en ligne gratuit avec support de fond transparent.',
        locale: 'fr_FR',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Convertisseur SVG PNG - Outil en Ligne Gratuit',
        description: 'Conversion instantanée de code SVG en images PNG.',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }
  
  if (locale === 'de') {
    return {
      metadataBase,
      title: 'SVG PNG Konverter - Kostenloses Online-Tool | Hohe Qualität',
      description: 'Konvertieren Sie SVG-Code kostenlos online in PNG-Bilder. Unterstützung für transparenten Hintergrund, hohe Qualität, sofortige Konvertierung. SVG PNG Konverter ohne Registrierung.',
      keywords: 'SVG PNG Konverter, SVG-Code PNG Konverter, Online-Konverter, kostenlos, hohe Qualität, sofortig, transparenter Hintergrund',
      authors: [{ name: 'SVG Konverter Team' }],
      creator: 'SVG Konverter',
      publisher: 'SVG Konverter',
      icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
        apple: '/favicon.svg',
      },
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      alternates: {
        canonical: `${siteConfig.url}/de`,
        languages: {
          'en-US': '/',
          'ko': '/ko',
          'ja': '/ja',
          'ru': '/ru',
          'es': '/es',
          'fr': '/fr',
          'de': '/de',
          'zh': '/zh',
          'pt': '/pt',
          'it': '/it',
          'id': '/id',
          'ar': '/ar',
        },
      },
      openGraph: {
        title: 'SVG PNG Konverter - Kostenloses Online-Tool',
        description: 'Sofortige Konvertierung von SVG-Code in PNG-Bilder. Kostenloser Online-SVG PNG Konverter mit Unterstützung für transparenten Hintergrund.',
        locale: 'de_DE',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'SVG PNG Konverter - Kostenloses Online-Tool',
        description: 'Sofortige Konvertierung von SVG-Code in PNG-Bilder.',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }
  
  if (locale === 'zh') {
    return {
      metadataBase,
      title: 'SVG PNG 转换器 - 免费在线工具 | 高质量',
      description: '免费在线将SVG代码转换为PNG图像。支持透明背景,高质量,即时转换。无需注册的SVG PNG 转换器。',
      keywords: 'SVG PNG 转换器, SVG代码PNG转换器, 在线转换器, 免费, 高质量, 即时, 透明背景',
      authors: [{ name: 'SVG 转换器团队' }],
      creator: 'SVG 转换器',
      publisher: 'SVG 转换器',
      icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
        apple: '/favicon.svg',
      },
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      alternates: {
        canonical: `${siteConfig.url}/zh`,
        languages: {
          'en-US': '/',
          'ko': '/ko',
          'ja': '/ja',
          'ru': '/ru',
          'es': '/es',
          'fr': '/fr',
          'de': '/de',
          'zh': '/zh',
          'pt': '/pt',
          'it': '/it',
          'id': '/id',
          'ar': '/ar',
        },
      },
      openGraph: {
        title: 'SVG PNG 转换器 - 免费在线工具',
        description: '即时将SVG代码转换为PNG图像。支持透明背景的免费在线SVG PNG 转换器。',
        locale: 'zh_CN',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'SVG PNG 转换器 - 免费在线工具',
        description: '即时将SVG代码转换为PNG图像。',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }
  
  if (locale === 'id') {
    return {
      metadataBase,
      title: 'Konverter Kode SVG ke PNG - Alat Online Gratis',
      description: 'Konversi kode SVG ke gambar PNG berkualitas tinggi secara gratis online. Dukungan latar belakang transparan, kualitas tinggi, konversi instan. Konverter SVG PNG tanpa registrasi.',
      keywords: 'konverter SVG PNG, kode SVG PNG konverter, konverter online, gratis, kualitas tinggi, instan, latar belakang transparan',
      authors: [{ name: 'Tim Konverter SVG' }],
      creator: 'Konverter SVG',
      publisher: 'Konverter SVG',
      icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
        apple: '/favicon.svg',
      },
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      alternates: {
        canonical: `${siteConfig.url}/id`,
        languages: {
          'en-US': '/',
          'ko': '/ko',
          'ja': '/ja',
          'ru': '/ru',
          'es': '/es',
          'fr': '/fr',
          'de': '/de',
          'zh': '/zh',
          'pt': '/pt',
          'it': '/it',
          'id': '/id',
          'ar': '/ar',
        },
      },
      openGraph: {
        title: 'Konverter Kode SVG ke PNG - Alat Online Gratis',
        description: 'Konversi instan kode SVG ke gambar PNG. Konverter SVG PNG online gratis dengan dukungan latar belakang transparan.',
        locale: 'id_ID',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Konverter Kode SVG ke PNG - Alat Online Gratis',
        description: 'Konversi instan kode SVG ke gambar PNG.',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }
  
  if (locale === 'ar') {
    return {
      metadataBase,
      title: 'محول كود SVG إلى PNG عبر الإنترنت | أداة مجانية',
      description: 'حوّل كود SVG إلى صور PNG عالية الجودة مجانًا عبر الإنترنت. أداتنا المجانية سهلة الاستخدام مع خلفية شفافة وجودة عالية.',
      keywords: 'محول SVG إلى PNG، تحويل SVG، محول الصور، أداة عبر الإنترنت، مجاني',
      authors: [{ name: 'فريق محول SVG' }],
      creator: 'محول SVG',
      publisher: 'محول SVG',
      icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
        apple: '/favicon.svg',
      },
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      alternates: {
        canonical: `${siteConfig.url}/ar`,
        languages: {
          'en-US': '/',
          'ko': '/ko',
          'ja': '/ja',
          'ru': '/ru',
          'es': '/es',
          'fr': '/fr',
          'de': '/de',
          'zh': '/zh',
          'pt': '/pt',
          'it': '/it',
          'id': '/id',
          'ar': '/ar',
        },
      },
      openGraph: {
        title: 'محول كود SVG إلى PNG عبر الإنترنت',
        description: 'حوّل كود SVG إلى صور PNG عالية الجودة مجانًا عبر الإنترنت.',
        locale: 'ar_SA',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'محول كود SVG إلى PNG عبر الإنترنت',
        description: 'حوّل كود SVG إلى صور PNG عالية الجودة مجانًا.',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }
  
  // Default English metadata
  return {
    metadataBase,
    title: 'SVG Code to PNG Converter (PNG, JPG, GIF) | Free Online Tool',
    description: 'Convert SVG code to high-quality PNG, JPG, or GIF images for free. Paste your code, preview the SVG live, and instantly download your file.Fast,easy,no signup.',
    keywords: 'svg to png, svg converter, svg to image, code to png, online converter',
    authors: [{ name: 'SVG Converter Team' }],
    creator: 'SVG Converter',
    publisher: 'SVG Converter',
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
      apple: '/favicon.svg',
    },
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: `${siteConfig.url}/`,
      languages: {
        'en-US': '/',
        'ko': '/ko',
        'ja': '/ja',
        'ru': '/ru',
        'es': '/es',
        'fr': '/fr',
        'de': '/de',
        'zh': '/zh',
        'pt': '/pt',
        'it': '/it',
        'id': '/id',
        'ar': '/ar',
      },
    },
    openGraph: {
      title: 'SVG Code to PNG Converter - Free Online Tool',
      description: 'Convert SVG code to high-quality PNG images instantly. Free online converter with live preview.',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'SVG Code to PNG Converter - Free Online Tool',
      description: 'Convert SVG code to high-quality PNG images instantly.',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = params.locale || 'en';
  const messages = await getMessages({ locale });
  const languageConfig = languages[locale] || languages['en'];
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}