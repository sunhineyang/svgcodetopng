import { test, expect } from '@playwright/test';

// 控制台错误监控：检查各关键页面是否有 MISSING_MESSAGE / hydration 错误 / 资源加载失败
test.use({
  baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
  launchOptions: {
    args: ['--no-proxy-server'],
  },
});

const PAGES = ['/', '/code-to-png', '/zh/', '/ja/', '/ar/', '/de/'];

for (const path of PAGES) {
  test(`控制台无错误: ${path}`, async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // 第三方广告/分析脚本的错误不是代码 bug（如 effectivegatecpm.com 403）
        if (!text.includes('effectivegatecpm') && !text.includes('googletagmanager') && !text.includes('gtag')) {
          errors.push(text);
        }
      }
    });

    page.on('pageerror', (err) => {
      errors.push(`PAGEERROR: ${err.message}`);
    });

    await page.goto(path);
    await page.waitForTimeout(2000);

    expect(errors, `页面 ${path} 控制台错误: ${JSON.stringify(errors)}`).toEqual([]);
  });
}

test('首页无 MISSING_MESSAGE（i18n key 完整）', async ({ page }) => {
  const missing: string[] = [];
  page.on('console', (msg) => {
    if (msg.text().includes('MISSING_MESSAGE')) missing.push(msg.text());
  });
  await page.goto('/');
  await page.waitForTimeout(2000);
  expect(missing).toEqual([]);
});

test('code-to-png 页无 MISSING_MESSAGE', async ({ page }) => {
  const missing: string[] = [];
  page.on('console', (msg) => {
    if (msg.text().includes('MISSING_MESSAGE')) missing.push(msg.text());
  });
  await page.goto('/code-to-png');
  await page.waitForTimeout(2000);
  expect(missing).toEqual([]);
});
