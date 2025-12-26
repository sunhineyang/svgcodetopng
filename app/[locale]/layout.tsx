import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
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
        canonical: '/ko',
        languages: {
          'en-US': '/',
          'ko': '/ko',
          'ja': '/ja',
          'ru': '/ru',
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
        canonical: '/ja',
        languages: {
          'en-US': '/',
          'ko': '/ko',
          'ja': '/ja',
          'ru': '/ru',
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
        canonical: '/ru',
        languages: {
          'en-US': '/',
          'ko': '/ko',
          'ja': '/ja',
          'ru': '/ru',
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
  
  // Default English metadata
  return {
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
      canonical: '/',
      languages: {
        'en-US': '/',
        'ko': '/ko',
        'ja': '/ja',
        'ru': '/ru',
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
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5RPN0F4G3Y"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5RPN0F4G3Y');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
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
      </body>
    </html>
  );
}