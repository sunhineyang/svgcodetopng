import { test, expect } from '@playwright/test';

const LOCALES = ['en', 'zh', 'ja', 'ar', 'es'];

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
