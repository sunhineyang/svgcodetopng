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

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const messages = await getMessages({ locale });
  
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
      canonical: `/${locale}`,
      languages: {
        'en': '/en',
        'ko': '/ko',
      },
    },
    openGraph: {
      title: 'SVG Code to PNG Converter - Free Online Tool',
      description: 'Convert SVG code to high-quality PNG images instantly. Free online converter with live preview.',
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
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
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
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
        <NextIntlClientProvider messages={messages}>
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