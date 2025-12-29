
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('ArabicDebug_2025-12-27', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:3001/ar');

    // Take screenshot
    await page.screenshot({ path: 'arabic-code-block-issue.png', { fullPage: true } });

    // Navigate to URL
    await page.goto('http://localhost:3001/ar');

    // Take screenshot
    await page.screenshot({ path: 'arabic-page-fixed.png', { fullPage: true } });
});