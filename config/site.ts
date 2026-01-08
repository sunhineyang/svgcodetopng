export const siteConfig = {
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://svgcodetopng.com',
  name: 'SVG Code to PNG Converter',
  description: 'Convert SVG code to high-quality PNG, JPG, or GIF images for free. Paste your code, preview the SVG live, and instantly download your file.',
} as const;

export const metadataBase = new URL(siteConfig.url);
