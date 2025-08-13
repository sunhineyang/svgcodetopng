import { locales } from '../i18n';

export const metadata = {
  title: 'SVG Code to PNG Converter (PNG, JPG, GIF) | Free Online Tool',
  description: 'Convert SVG code to high-quality PNG, JPG, or GIF images for free. Paste your code, preview the SVG live, and instantly download your file.Fast,easy,no signup.',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}