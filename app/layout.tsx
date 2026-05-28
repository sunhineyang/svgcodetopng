import { ThemeProvider } from 'next-themes';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import { headers } from 'next/headers';
import { languages } from '../i18n';
import { metadataBase, siteConfig } from '../config/site';
import './globals.css';

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

export const metadata = {
  metadataBase,
  title: 'SVG Code to PNG Converter (PNG, JPG, GIF) | Free Online Tool',
  description: 'Convert SVG code to high-quality PNG, JPG, or GIF images for free. Paste your code, preview the SVG live, and instantly download your file. Fast, easy, no signup.',
  keywords: 'svg to png, svg converter, svg to image, code to png, online converter',
  icons: {
    icon: '/favicon.svg',
  },
  authors: [{ name: 'SVG Converter Team' }],
  creator: 'SVG Converter',
  publisher: 'SVG Converter',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: `${siteConfig.url}/`,
    languages: {
      'x-default': '/',
      'en': '/',
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
    images: [{ url: '/logo.svg', width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SVG Code to PNG Converter - Free Online Tool',
    description: 'Convert SVG code to high-quality PNG images instantly.',
    images: ['/logo.svg'],
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const locale = headersList.get('x-locale') || 'en';
  const langConfig = languages[locale] || languages['en'];
  const dir = langConfig.dir || 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'SVG Code to PNG Converter',
              url: siteConfig.url,
              description: 'Convert SVG code to high-quality PNG, JPG, or GIF images for free.',
              applicationCategory: 'Multimedia',
              operatingSystem: 'All',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            }),
          }}
        />
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
        <Script
          src="https://pl28593994.effectivegatecpm.com/80/29/dd/8029dd06a3e4c3c6ae68f72715059ae7.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Script
            src="https://pl28593999.effectivegatecpm.com/30/de/85/30de85869b1f125809c7c4f10d85b458.js"
            strategy="lazyOnload"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}