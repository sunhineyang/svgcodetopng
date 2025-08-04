import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import { Inter, JetBrains_Mono } from 'next/font/google';
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
  title: 'SVG Code to PNG: Free & Instant Online SVG Converter',
  description: 'Convert SVG code to high-quality PNG, JPG, or GIF images for free. Paste your code, preview the SVG live, and instantly download your file.Fast,easy,no signup.',
  keywords: 'svg code to png, svg code to jpg, svg to image converter, svg viewer, svg to code',
  authors: [{ name: 'SVGCodeToPNG Team' }],
  creator: 'SVGCodeToPNG',
  publisher: 'SVGCodeToPNG',
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
  metadataBase: new URL('https://svgcodetopng.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
    },
  },
  openGraph: {
    title: 'SVG Code to PNG Converter - Free Online Tool',
    description: 'Convert SVG code to high-quality PNG images instantly. Free online converter with AI assistance.',
    url: 'https://svgcodetopng.com',
    siteName: 'SVGCodeToPNG',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SVG Code to PNG Converter - Free Online Tool',
    description: 'Convert SVG code to high-quality PNG images instantly.',
    creator: '@svgcodetopng',
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}