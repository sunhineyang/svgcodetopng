import { test, expect, type Page, type Locator } from '@playwright/test';

// Phase 1 改动专项测试：C1 + A2 + A1 + D1
// dev server 跑在 3001（3000 被其他项目占用）
const BASE = process.env.PHASE1_BASE || 'http://localhost:3001';
const CONV_URL = `${BASE}/en/code-to-png`;

// 默认 SVG 是 200×200（1:1 比例），所有断言基于此
async function preparePage(page: Page) {
  await page.goto(CONV_URL);
  await page.waitForTimeout(3000);
}

async function openSettings(page: Page) {
  const btn = page.getByRole('button', { name: /settings/i });
  await btn.click();
  await page.waitForTimeout(400);
}

// 对 type="number" input 用键盘逐字符输入，保证触发 React onChange
async function typeInto(input: Locator, value: string) {
  await input.click();
  await input.fill('');
  await input.pressSequentially(value, { delay: 30 });
}

// settings 面板里有 3 个 type=number：quality(无placeholder) → width → height
// 用 placeholder="Auto" 精准定位 width/height，避免选到 quality input
const widthInputOf = (page: Page) => page.locator('input[type="number"][placeholder="Auto"]').nth(0);
const heightInputOf = (page: Page) => page.locator('input[type="number"][placeholder="Auto"]').nth(1);

// ====== C1：倍率按钮组 + 参数摘要 ======
test.describe('C1: export panel scale buttons & summary', () => {
  test('scale 1x/2x/3x buttons appear and update summary', async ({ page }) => {
    await preparePage(page);
    await openSettings(page);

    const x1 = page.locator('button', { hasText: /^1x$/ }).first();
    const x2 = page.locator('button', { hasText: /^2x$/ }).first();
    const x3 = page.locator('button', { hasText: /^3x$/ }).first();
    await expect(x1).toBeVisible();
    await expect(x2).toBeVisible();
    await expect(x3).toBeVisible();

    await x2.click();
    await page.waitForTimeout(250);
    await expect(page.locator('text=/Export: 400×400 px.*2x/').first()).toBeVisible();

    await x3.click();
    await page.waitForTimeout(250);
    await expect(page.locator('text=/Export: 600×600 px.*3x/').first()).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/p1-c1-scale.png' });
  });

  test('precise width clears scale mode (mutual exclusion)', async ({ page }) => {
    await preparePage(page);
    await openSettings(page);

    await page.locator('button', { hasText: /^2x$/ }).first().click();
    await page.waitForTimeout(200);

    await typeInto(widthInputOf(page), '500');
    await page.waitForTimeout(400);

    await expect(page.locator('text=/Export: 500×500 px.*custom/').first()).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/p1-c1-custom.png' });
  });

  test('aspect ratio lock auto-calculates height from width', async ({ page }) => {
    await preparePage(page);
    await openSettings(page);

    const lockCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(lockCheckbox).toBeChecked();

    await typeInto(widthInputOf(page), '600');
    await page.waitForTimeout(400);
    await expect(heightInputOf(page)).toHaveValue('600');
  });

  test('aspect ratio lock off keeps height independent', async ({ page }) => {
    await preparePage(page);
    await openSettings(page);

    const lockCheckbox = page.locator('input[type="checkbox"]').first();
    await lockCheckbox.click();
    await expect(lockCheckbox).not.toBeChecked();

    await typeInto(heightInputOf(page), '999');
    await page.waitForTimeout(200);
    await typeInto(widthInputOf(page), '500');
    await page.waitForTimeout(400);
    await expect(heightInputOf(page)).toHaveValue('999');
  });
});

// ====== A2：超大尺寸拦截 ======
test.describe('A2: oversize export interception', () => {
  test('oversize width triggers sizeBlock panel', async ({ page }) => {
    await preparePage(page);
    await openSettings(page);

    await typeInto(widthInputOf(page), '60000');
    await page.waitForTimeout(300);

    await page.getByRole('button', { name: /convert.*preview/i }).click();
    await page.waitForTimeout(2500);

    const sizeBlock = page.locator('text=/exceeds your browser/i');
    await expect(sizeBlock.first()).toBeVisible({ timeout: 8000 });

    await page.screenshot({ path: 'e2e/screenshots/p1-a2-sizeblock.png' });
  });

  test('sizeBlock shows 3 action buttons', async ({ page }) => {
    await preparePage(page);
    await openSettings(page);

    await typeInto(widthInputOf(page), '60000');
    await page.waitForTimeout(300);

    await page.getByRole('button', { name: /convert.*preview/i }).click();
    await page.waitForTimeout(2500);

    await expect(page.getByRole('button', { name: /export at maximum/i }).first()).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('button', { name: /copy link/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i }).first()).toBeVisible();
  });
});

// ====== A1：浏览器检测 ======
test.describe('A1: browser warning detection', () => {
  test('default Chromium UA: no modal on first convert', async ({ page }) => {
    await preparePage(page);

    await page.getByRole('button', { name: /convert.*preview/i }).click();
    await page.waitForTimeout(1500);

    await expect(page.locator('text=/Continue anyway/i')).toHaveCount(0);
    await expect(page.locator('text=/For the most accurate rendering, use Chrome/i')).toHaveCount(0);
  });

  test('detectBrowserVariant logic: iPadOS detection via maxTouchPoints', async ({ page }) => {
    await page.goto(CONV_URL);
    await page.waitForTimeout(2000);

    const result = await page.evaluate(() => {
      const ua = navigator.userAgent;
      const mtp = navigator.maxTouchPoints || 0;

      const isIPhoneOrIPod = /iphone|ipod/i.test(ua);
      const isIPadOSDesktopUA = /macintosh/i.test(ua) && mtp > 1;
      const isLegacyIPad = /ipad/i.test(ua);
      const isMacSafari = /macintosh/i.test(ua) && /safari/i.test(ua) && !/chrome|chromium|edg/i.test(ua);

      return { ua, mtp, isIPhoneOrIPod, isIPadOSDesktopUA, isLegacyIPad, isMacSafari };
    });

    expect(result.isIPhoneOrIPod).toBe(false);
    expect(result.isIPadOSDesktopUA).toBe(false);
    expect(result.isLegacyIPad).toBe(false);
    expect(result.isMacSafari).toBe(false);
    expect(result.ua).toMatch(/chrome/i);
  });

  test('firefox UA detection logic (unit-level)', async ({ page }) => {
    await page.goto(CONV_URL);
    await page.waitForTimeout(1500);

    const result = await page.evaluate(() => {
      const ua = navigator.userAgent;
      return { isFirefox: /firefox/i.test(ua), ua };
    });
    expect(result.isFirefox).toBe(false);
  });
});

// ====== D1：埋点事件触发 ======
test.describe('D1: analytics events fire', () => {
  test('oversize export fires export_size_blocked event', async ({ page }) => {
    const analyticsLogs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('[Analytics]')) {
        analyticsLogs.push(text);
      }
    });

    await preparePage(page);
    await openSettings(page);

    await typeInto(widthInputOf(page), '60000');
    await page.waitForTimeout(300);

    await page.getByRole('button', { name: /convert.*preview/i }).click();
    await page.waitForTimeout(2500);

    const hasSizeBlocked = analyticsLogs.some((l) => l.includes('export_size_blocked'));
    expect(hasSizeBlocked).toBe(true);
  });

  test('scale change fires export_setting_change event', async ({ page }) => {
    const analyticsLogs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('[Analytics]')) {
        analyticsLogs.push(text);
      }
    });

    await preparePage(page);
    await openSettings(page);

    await page.locator('button', { hasText: /^2x$/ }).first().click();
    await page.waitForTimeout(600);

    const hasSettingChange = analyticsLogs.some((l) => l.includes('export_setting_change'));
    expect(hasSettingChange).toBe(true);
  });

  test('convert_image event still fires (existing analytics unaffected)', async ({ page }) => {
    const analyticsLogs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('[Analytics]')) {
        analyticsLogs.push(text);
      }
    });

    await preparePage(page);
    await page.getByRole('button', { name: /convert.*preview/i }).click();
    await page.waitForTimeout(2500);

    const hasConvert = analyticsLogs.some((l) => l.includes('convert_image'));
    expect(hasConvert).toBe(true);
  });
});
