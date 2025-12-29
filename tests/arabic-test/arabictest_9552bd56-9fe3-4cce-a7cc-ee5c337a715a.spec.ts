
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('ArabicTest_2025-12-27', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:3001/ar');

    // Take screenshot
    await page.screenshot({ path: 'arabic-page-initial.png', { fullPage: true } });

    // Click element
    await page.click('button[aria-label="Switch language"]');

    // Take screenshot
    await page.screenshot({ path: 'language-switcher-open.png' });

    // Click element
    await page.click('button:has-text("English")');

    // Take screenshot
    await page.screenshot({ path: 'english-page-after-switch.png', { fullPage: true } });

    // Navigate to URL
    await page.goto('http://localhost:3001/ar');

    // Click element
    await page.click('button:has-text("ابدأ التحويل الآن")');

    // Take screenshot
    await page.screenshot({ path: 'converter-page-arabic.png', { fullPage: true } });
});