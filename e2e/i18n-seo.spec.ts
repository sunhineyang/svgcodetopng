import { test, expect } from '@playwright/test';

// Allow overriding the base URL via env var for environments where the default port is busy.
// Disable Chromium system proxy so local dev server requests are not routed through an external proxy.
test.use({
  baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
  launchOptions: {
    args: ['--no-proxy-server'],
  },
});

const LOCALES = ['en', 'zh', 'ja', 'ar', 'es'];

// Expected TDK for the locales modified in the 2026-07-12 SEO alignment.
const EXPECTED_TDK: Record<string, { title: string; description: string; ogTitle: string; ogDescription: string; twitterTitle: string }> = {
  fr: {
    title: 'Convertisseur Code SVG en PNG - Outil en Ligne Gratuit',
    description: 'Convertissez le code SVG en images PNG gratuitement en ligne. Support de fond transparent, haute qualité, conversion instantanée. Convertisseur de code SVG sans inscription.',
    ogTitle: 'Convertisseur Code SVG en PNG - Outil en Ligne Gratuit',
    ogDescription: 'Conversion instantanée de code SVG en images PNG. Convertisseur de code SVG en ligne gratuit avec support de fond transparent.',
    twitterTitle: 'Convertisseur Code SVG en PNG - Outil en Ligne Gratuit',
  },
  ja: {
    title: 'SVGコードをPNG画像に変換 - 無料オンラインツール | 高品質',
    description: 'SVGコードをPNG画像に無料でオンライン変換。透明背景対応、高品質出力、即時変換。登録不要で簡単にSVGコード変換が可能。',
    ogTitle: 'SVGコードをPNG画像に変換 - 無料オンラインツール',
    ogDescription: 'SVGコードをPNG画像に即時変換。透明背景対応の無料オンライン変換ツール。',
    twitterTitle: 'SVGコードをPNG画像に変換 - 無料オンラインツール',
  },
  it: {
    title: 'Convertitore Codice SVG in PNG - Strumento Online Gratuito',
    description: 'Converti codice SVG in immagini PNG gratis online. Supporto sfondo trasparente, alta qualità, conversione istantanea. Convertitore di codice SVG senza registrazione.',
    ogTitle: 'Convertitore Codice SVG in PNG - Strumento Gratuito',
    ogDescription: 'Conversione istantanea di codice SVG in immagini PNG. Convertitore di codice SVG online gratuito con supporto sfondo trasparente.',
    twitterTitle: 'Convertitore Codice SVG in PNG - Strumento Gratuito',
  },
  pt: {
    title: 'Conversor de Código SVG para PNG - Ferramenta Online Grátis',
    description: 'Converta código SVG em imagens PNG grátis online. Suporte de fundo transparente, alta qualidade, conversão instantânea. Conversor de código SVG sem registro.',
    ogTitle: 'Conversor de Código SVG para PNG - Ferramenta Grátis',
    ogDescription: 'Conversão instantânea de código SVG em imagens PNG. Conversor de código SVG online gratuito com suporte de fundo transparente.',
    twitterTitle: 'Conversor de Código SVG para PNG - Ferramenta Grátis',
  },
};

test.describe('i18n Basic Validation', () => {
  for (const locale of LOCALES) {
    test(`${locale} - page loads with correct lang attribute`, async ({ page }) => {
      await page.goto(`/${locale}/code-to-png`);
      const lang = await page.getAttribute('html', 'lang');
      expect(lang).toBe(locale);

      if (locale === 'ar') {
        const dir = await page.getAttribute('html', 'dir');
        expect(dir).toBe('rtl');
      }

      await page.screenshot({ path: `e2e/screenshots/i18n-${locale}.png`, fullPage: false });
    });

    test(`${locale} - no MISSING_MESSAGE errors`, async ({ page }) => {
      const missingMessages: string[] = [];
      page.on('console', (msg) => {
        if (msg.text().includes('MISSING_MESSAGE')) {
          missingMessages.push(msg.text());
        }
      });

      await page.goto(`/${locale}/code-to-png`);
      await page.waitForTimeout(3000);

      expect(missingMessages).toEqual([]);
    });
  }
});

test.describe('SEO Elements', () => {
  test('hreflang tags present', async ({ page }) => {
    await page.goto('/en/code-to-png');
    const hreflangs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('link[rel="alternate"]')).map((l) => ({
        hreflang: l.getAttribute('hreflang'),
        href: l.getAttribute('href'),
      }));
    });
    expect(hreflangs.length).toBeGreaterThan(0);
    const hasXDefault = hreflangs.some((h) => h.hreflang === 'x-default');
    expect(hasXDefault).toBeTruthy();
  });

  test('canonical tag present', async ({ page }) => {
    await page.goto('/en/code-to-png');
    const canonical = await page.evaluate(() => {
      return document.querySelector('link[rel="canonical"]')?.getAttribute('href');
    });
    expect(canonical).toBeTruthy();
  });

  test('OG meta tags present', async ({ page }) => {
    await page.goto('/en/code-to-png');
    const og = await page.evaluate(() => {
      const tags: Record<string, string> = {};
      document.querySelectorAll('meta[property^="og:"]').forEach((m) => {
        tags[m.getAttribute('property')!] = m.getAttribute('content')!;
      });
      return tags;
    });
    expect(og['og:title']).toBeTruthy();
    expect(og['og:description']).toBeTruthy();
  });
});

test.describe('TDK Metadata Validation', () => {
  for (const [locale, expected] of Object.entries(EXPECTED_TDK)) {
    const path = `/${locale}/`;

    test(`${locale} - title matches expected`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(expected.title);
    });

    test(`${locale} - description meta matches expected`, async ({ page }) => {
      await page.goto(path);
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBe(expected.description);
    });

    test(`${locale} - og:title matches expected`, async ({ page }) => {
      await page.goto(path);
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      expect(ogTitle).toBe(expected.ogTitle);
    });

    test(`${locale} - og:description matches expected`, async ({ page }) => {
      await page.goto(path);
      const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
      expect(ogDescription).toBe(expected.ogDescription);
    });

    test(`${locale} - twitter:title matches expected`, async ({ page }) => {
      await page.goto(path);
      const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content');
      expect(twitterTitle).toBe(expected.twitterTitle);
    });

    test(`${locale} - html lang attribute is correct`, async ({ page }) => {
      await page.goto(path);
      const lang = await page.getAttribute('html', 'lang');
      expect(lang).toBe(locale);
    });
  }

  test('regression: en title must remain unchanged', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('SVG Code to PNG Converter (PNG, JPG, GIF) | Free Online Tool');
  });

  test('regression: ko title must remain unchanged', async ({ page }) => {
    await page.goto('/ko/');
    await expect(page).toHaveTitle('SVG 코드를 PNG 변환기 (PNG, JPG, GIF) | 무료 온라인 도구');
  });
});
