import { test, expect } from '@playwright/test';

const CONV_URL = '/en/code-to-png';

// 强制让 shouldShowFeedback 返回 true：设置高 conversion_count
async function primeFeedbackState(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    localStorage.setItem(
      'svgcodetopng:feedback',
      JSON.stringify({
        client_id: 'e2e-test-' + Date.now(),
        conversion_count: 10,
        last_feedback_at: null,
        dismissed_count: 0,
        dont_show_again: false,
        cooldown_until: null,
      }),
    );
  });
}

async function triggerConversion(page: import('@playwright/test').Page) {
  await page.waitForTimeout(3000);
  await page.getByRole('button', { name: /convert.*preview/i }).click();
  await expect(page.locator('text=Ready to download').first()).toBeVisible({ timeout: 15000 });
}

test.describe('Feedback Card', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CONV_URL);
    await primeFeedbackState(page);
    await page.reload();
  });

  test('card appears after PNG download', async ({ page }) => {
    await triggerConversion(page);

    // 触发下载（反馈触发点）
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.locator('button:has-text("PNG")').first().click();
    await downloadPromise;

    // 等待卡片弹出
    const card = page.getByRole('dialog').filter({ hasText: /How was your conversion/i });
    await expect(card).toBeVisible({ timeout: 5000 });
    await expect(card.getByRole('button', { name: /great/i })).toBeVisible();
    await expect(card.getByRole('button', { name: /has issues/i })).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/fb-01-card.png' });
  });

  test('clicking 👍 (Great) sends positive feedback and shows toast', async ({ page }) => {
    await triggerConversion(page);

    const apiResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/feedback') && resp.request().method() === 'POST' && resp.status() !== 308 && resp.status() !== 307,
      { timeout: 15000 },
    );

    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.locator('button:has-text("PNG")').first().click();
    await downloadPromise;

    const card = page.getByRole('dialog').filter({ hasText: /How was your conversion/i });
    await expect(card).toBeVisible({ timeout: 5000 });
    await card.getByRole('button', { name: /great/i }).click();

    const response = await apiResponsePromise;
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.id).toBeTruthy();

    // Toast 出现
    await expect(page.locator('text=/Thanks for your feedback/i').first()).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'e2e/screenshots/fb-02-positive-toast.png' });
  });

  test('clicking 👎 (Has issues) opens Modal', async ({ page }) => {
    await triggerConversion(page);

    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.locator('button:has-text("PNG")').first().click();
    await downloadPromise;

    const card = page.getByRole('dialog').filter({ hasText: /How was your conversion/i });
    await expect(card).toBeVisible({ timeout: 5000 });
    await card.getByRole('button', { name: /has issues/i }).click();

    // Modal 出现
    await expect(page.locator('text=/Help us improve/i').first()).toBeVisible({ timeout: 5000 });

    // Submit 应默认禁用
    const submitBtn = page.getByRole('button', { name: /^submit$/i });
    await expect(submitBtn).toBeDisabled();

    await page.screenshot({ path: 'e2e/screenshots/fb-03-modal-open.png' });
  });

  test('Modal: select tag enables Submit, full submit flow works', async ({ page }) => {
    await triggerConversion(page);

    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.locator('button:has-text("PNG")').first().click();
    await downloadPromise;

    const card = page.getByRole('dialog').filter({ hasText: /How was your conversion/i });
    await expect(card).toBeVisible({ timeout: 5000 });
    await card.getByRole('button', { name: /has issues/i }).click();

    await expect(page.locator('text=/Help us improve/i').first()).toBeVisible();

    // 选择一个标签（checkbox 形式）
    const blurryCheckbox = page.locator('label').filter({ hasText: /blurry|pixelated/i }).first();
    await blurryCheckbox.click();

    // Submit 应启用
    const submitBtn = page.getByRole('button', { name: /^submit$/i });
    await expect(submitBtn).toBeEnabled();

    // 监听 API
    const apiResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/feedback') && resp.request().method() === 'POST' && resp.status() !== 308 && resp.status() !== 307,
      { timeout: 20000 },
    );

    await submitBtn.click();

    const response = await apiResponsePromise;
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);

    // Toast 感谢
    await expect(page.locator('text=/Thanks/i').first()).toBeVisible({ timeout: 8000 });
    await page.screenshot({ path: 'e2e/screenshots/fb-04-submit-success.png' });
  });
});

test.describe('Feedback - localStorage Behavior', () => {
  test('dont_show_again prevents card', async ({ page }) => {
    await page.goto(CONV_URL);
    await page.evaluate(() => {
      localStorage.setItem(
        'svgcodetopng:feedback',
        JSON.stringify({
          client_id: 'e2e-no-show',
          conversion_count: 100,
          last_feedback_at: null,
          dismissed_count: 0,
          dont_show_again: true,
          cooldown_until: null,
        }),
      );
    });
    await page.reload();
    await triggerConversion(page);

    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.locator('button:has-text("PNG")').first().click();
    await downloadPromise;

    await page.waitForTimeout(2000);
    const card = page.getByRole('dialog').filter({ hasText: /How was your conversion/i });
    await expect(card).not.toBeVisible();
  });

  test('cooldown prevents card', async ({ page }) => {
    await page.goto(CONV_URL);
    await page.evaluate(() => {
      localStorage.setItem(
        'svgcodetopng:feedback',
        JSON.stringify({
          client_id: 'e2e-cooldown',
          conversion_count: 100,
          last_feedback_at: Date.now(),
          dismissed_count: 0,
          dont_show_again: false,
          cooldown_until: Date.now() + 86400000,
        }),
      );
    });
    await page.reload();
    await triggerConversion(page);

    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.locator('button:has-text("PNG")').first().click();
    await downloadPromise;

    await page.waitForTimeout(2000);
    const card = page.getByRole('dialog').filter({ hasText: /How was your conversion/i });
    await expect(card).not.toBeVisible();
  });
});
