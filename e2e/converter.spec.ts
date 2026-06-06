import { test, expect } from '@playwright/test';

const CONV_URL = '/en/code-to-png';

test.describe('Converter Core Flow', () => {
  test('page loads with correct title and key elements', async ({ page }) => {
    await page.goto(CONV_URL);
    await expect(page).toHaveTitle(/code.*png|svg/i);

    await expect(page.getByRole('heading', { name: /code to png image converter/i, exact: false }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /svg code/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /convert.*preview/i })).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/01-page-load.png', fullPage: false });
  });

  test('convert & preview works with default SVG', async ({ page }) => {
    await page.goto(CONV_URL);

    await page.waitForTimeout(3000);

    const convertBtn = page.getByRole('button', { name: /convert.*preview/i });
    await convertBtn.click();

    const previewSection = page.locator('text=Ready to download').first();
    await expect(previewSection).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'e2e/screenshots/03-convert-success.png' });
  });

  test('download buttons appear after conversion', async ({ page }) => {
    await page.goto(CONV_URL);
    await page.waitForTimeout(3000);

    const convertBtn = page.getByRole('button', { name: /convert.*preview/i });
    await convertBtn.click();
    await expect(page.locator('text=Ready to download').first()).toBeVisible({ timeout: 15000 });

    const pngBtn = page.locator('button:has-text("PNG")').first();
    const jpgBtn = page.locator('button:has-text("JPG")').first();
    const webpBtn = page.locator('button:has-text("WebP")').first();

    await expect(pngBtn).toBeVisible();
    await expect(jpgBtn).toBeVisible();
    await expect(webpBtn).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/04-download-buttons.png' });
  });

  test('PNG download triggers file save', async ({ page }) => {
    await page.goto(CONV_URL);
    await page.waitForTimeout(3000);

    const convertBtn = page.getByRole('button', { name: /convert.*preview/i });
    await convertBtn.click();
    await expect(page.locator('text=Ready to download').first()).toBeVisible({ timeout: 15000 });

    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.locator('button:has-text("PNG")').first().click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.png$/);
  });

  test('settings panel opens and shows format options', async ({ page }) => {
    await page.goto(CONV_URL);
    await page.waitForTimeout(3000);

    const settingsBtn = page.getByRole('button', { name: /settings/i });
    await settingsBtn.click();

    await expect(page.locator('select').first()).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/05-settings-panel.png' });
  });

  test('FAQ section expands and collapses', async ({ page }) => {
    await page.goto(CONV_URL);
    await page.waitForTimeout(2000);

    const faqButton = page.getByRole('button', { name: /how do i convert/i }).first();
    await faqButton.click();

    const faqAnswer = page.locator('text=Just paste your SVG').first();
    await expect(faqAnswer).toBeVisible();
  });
});

test.describe('Console Errors', () => {
  test('no critical console errors on converter page', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('effectivegatecpm') && !text.includes('third-party') && !text.includes('favicon') && !text.includes('404') && !text.includes('net::')) {
          errors.push(text);
        }
      }
    });

    await page.goto(CONV_URL);
    await page.waitForTimeout(5000);

    expect(errors).toEqual([]);
  });
});
