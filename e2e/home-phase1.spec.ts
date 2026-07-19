import { test, expect, type Page, type Locator } from '@playwright/test';

// 首页加载较慢（client-rendered + GA），给足超时
test.setTimeout(60000);

// Phase 1 - 首页（HomePageContent）专项测试
// dev server 跑在 3001（3000 被其他项目占用）
const BASE = process.env.PHASE1_BASE || 'http://localhost:3001';
const HOME_URL = `${BASE}/en`;

async function preparePage(page: Page) {
  await page.goto(HOME_URL, { waitUntil: 'domcontentloaded' });
  // 首页有 GA 持续请求，networkidle 永远不会触发——直接等 Settings 按钮出现
  const settingsBtn = page
    .locator('button')
    .filter({ hasText: /settings|设置/i })
    .or(page.locator('button:has(svg.lucide-settings)'))
    .first();
  await settingsBtn.waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForTimeout(1500);
}

async function openSettings(page: Page) {
  const btn = page
    .locator('button')
    .filter({ hasText: /settings|设置/i })
    .or(page.locator('button:has(svg.lucide-settings)'))
    .first();
  await btn.click();
  await page.waitForTimeout(500);
}

async function typeInto(input: Locator, value: string) {
  await input.click();
  await input.fill('');
  await input.pressSequentially(value, { delay: 30 });
}

// 首页真正的 Convert 按钮文案是 t('converter.export') = "Export Settings"
// 注意：hero 区还有 "Start Converting Now" 也会匹配 /convert/i，必须用精确文案避坑
async function clickConvert(page: Page) {
  await page.getByRole('button', { name: /export settings/i }).first().click();
}

// 首页 settings 面板里 width/height 用 placeholder="Auto" 定位
const widthInputOf = (page: Page) => page.locator('input[type="number"][placeholder="Auto"]').nth(0);
const heightInputOf = (page: Page) => page.locator('input[type="number"][placeholder="Auto"]').nth(1);

// ====== C1：倍率按钮组 + 参数摘要（首页版）======
test.describe('Home C1: scale buttons & summary', () => {
  test('scale 1x/2x/3x buttons visible in home settings', async ({ page }) => {
    await preparePage(page);
    await openSettings(page);

    const x1 = page.locator('button', { hasText: /^1x$/ }).first();
    const x2 = page.locator('button', { hasText: /^2x$/ }).first();
    const x3 = page.locator('button', { hasText: /^3x$/ }).first();
    await expect(x1).toBeVisible();
    await expect(x2).toBeVisible();
    await expect(x3).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/home-c1-scale.png' });
  });

  test('scale 2x button click updates summary', async ({ page }) => {
    await preparePage(page);
    await openSettings(page);

    await page.locator('button', { hasText: /^2x$/ }).first().click();
    await page.waitForTimeout(300);

    // 摘要应包含 "2x"
    await expect(page.locator('text=/2x/').first()).toBeVisible();
  });

  test('precise width clears scale mode (mutual exclusion)', async ({ page }) => {
    await preparePage(page);
    await openSettings(page);

    await page.locator('button', { hasText: /^2x$/ }).first().click();
    await page.waitForTimeout(200);

    // 首页默认 SVG 是 200×200（1:1 比例），输 width=500 → height 自动 = 500
    await typeInto(widthInputOf(page), '500');
    await page.waitForTimeout(400);

    // 摘要切到 custom 模式
    await expect(page.locator('text=/500×500 px.*custom/').first()).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/home-c1-custom.png' });
  });

  test('aspect ratio lock auto-calculates height from width', async ({ page }) => {
    await preparePage(page);
    await openSettings(page);

    // 默认 Lock aspect ratio checkbox 应该 checked
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

// ====== A2：超大尺寸拦截（首页版）======
test.describe('Home A2: oversize export interception', () => {
  test('oversize width triggers sizeBlock panel on home', async ({ page }) => {
    await preparePage(page);
    await openSettings(page);

    // 输入 width=60000（超过 Chromium 的 32767 max dim 上限）
    await typeInto(widthInputOf(page), '60000');
    await page.waitForTimeout(300);

    // 首页 Convert 按钮：英文文案含 "Convert"
    await clickConvert(page);
    await page.waitForTimeout(2500);

    // sizeBlock 应出现：title 文案里有 "exceeds your browser"
    await expect(page.locator('text=/exceeds your browser/i').first()).toBeVisible({ timeout: 8000 });

    await page.screenshot({ path: 'e2e/screenshots/home-a2-sizeblock.png' });
  });

  test('sizeBlock shows 3 action buttons on home', async ({ page }) => {
    await preparePage(page);
    await openSettings(page);

    await typeInto(widthInputOf(page), '60000');
    await page.waitForTimeout(300);

    await clickConvert(page);
    await page.waitForTimeout(2500);

    // 3 个按钮
    await expect(page.getByRole('button', { name: /export at maximum/i }).first()).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('button', { name: /copy link/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i }).first()).toBeVisible();
  });
});

// ====== A1：浏览器检测（首页版）======
test.describe('Home A1: browser warning detection', () => {
  test('Chromium UA: no modal on first convert', async ({ page }) => {
    await preparePage(page);

    await clickConvert(page);
    await page.waitForTimeout(1500);

    // Chrome 下不应弹 BrowserWarningModal
    await expect(page.locator('text=/Continue anyway/i')).toHaveCount(0);
    await expect(page.locator('text=/For the most accurate rendering, use Chrome/i')).toHaveCount(0);
  });

  test('detectBrowserVariant logic: iPadOS detection via maxTouchPoints', async ({ page }) => {
    await page.goto(HOME_URL);
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
});

// ====== D1：埋点事件触发（首页版）======
test.describe('Home D1: analytics events fire', () => {
  test('oversize export fires export_size_blocked on home', async ({ page }) => {
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

    await clickConvert(page);
    await page.waitForTimeout(2500);

    const hasSizeBlocked = analyticsLogs.some((l) => l.includes('export_size_blocked'));
    expect(hasSizeBlocked).toBe(true);
  });

  test('scale change fires export_setting_change on home', async ({ page }) => {
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
});
