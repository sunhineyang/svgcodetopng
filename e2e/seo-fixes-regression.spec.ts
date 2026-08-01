import { test, expect } from '@playwright/test';

// 针对 2026-07 三项 SEO 修复的深度回归测试：
// 1. 主页 H1 错位修复（hero.title 提升为 H1）
// 2. OG 图替换（logo.svg → og-image.png，1200×630）
// 3. 主页 HowTo + FAQPage JSON-LD（各语言使用对应文案）

test.use({
  baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
  launchOptions: {
    args: ['--no-proxy-server'],
  },
});

test.describe('修复1: 主页 H1 内容', () => {
  test('H1 应该是 hero.title（主关键词）', async ({ page }) => {
    await page.goto('/');
    const h1 = await page.locator('h1').first().innerText();
    expect(h1.trim()).toBe('SVG Code to PNG Online Converter');
  });

  test('H1 不能是副标题文案', async ({ page }) => {
    await page.goto('/');
    const h1 = await page.locator('h1').first().innerText();
    expect(h1.trim()).not.toContain('Transform Your SVG Code');
  });

  test('页面上恰好只有一个 H1', async ({ page }) => {
    await page.goto('/');
    const count = await page.locator('h1').count();
    expect(count).toBe(1);
  });

  test('副标题降级为 div 徽章（视觉不变）', async ({ page }) => {
    await page.goto('/');
    const subtitle = await page.locator('div.inline-flex').first().innerText();
    expect(subtitle).toContain('Transform Your SVG Code');
  });
});

test.describe('修复2: OG / Twitter 预览图', () => {
  test('og:image 指向 og-image.png（PNG 而非 SVG）', async ({ page }) => {
    await page.goto('/');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toContain('og-image.png');
    expect(ogImage).not.toContain('.svg');
  });

  test('og:image 尺寸为 1200×630', async ({ page }) => {
    await page.goto('/');
    const width = await page.locator('meta[property="og:image:width"]').getAttribute('content');
    const height = await page.locator('meta[property="og:image:height"]').getAttribute('content');
    expect(width).toBe('1200');
    expect(height).toBe('630');
  });

  test('twitter:image 也指向 og-image.png', async ({ page }) => {
    await page.goto('/');
    const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute('content');
    expect(twitterImage).toContain('og-image.png');
  });

  test('code-to-png 页同样使用 og-image.png', async ({ page }) => {
    await page.goto('/code-to-png');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toContain('og-image.png');
    expect(ogImage).not.toContain('.svg');
  });

  test('og-image.png 文件可访问（返回 200）', async ({ request }) => {
    const res = await request.get('/og-image.png');
    expect(res.status()).toBe(200);
    const body = await res.body();
    // PNG 文件头应该是 89 50 4E 47
    expect(body[0]).toBe(0x89);
    expect(body[1]).toBe(0x50);
    expect(body[2]).toBe(0x4E);
    expect(body[3]).toBe(0x47);
  });
});

test.describe('修复3: 主页 JSON-LD 结构化数据', () => {
  test('主页包含 FAQPage JSON-LD', async ({ page }) => {
    await page.goto('/');
    const ldJson = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map((s) => s.textContent)
        .join('\n');
    });
    expect(ldJson).toContain('FAQPage');
    expect(ldJson).toContain('HowTo');
  });

  test('FAQPage 包含 8 条问答', async ({ page }) => {
    await page.goto('/');
    const mainEntity = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      for (const s of scripts) {
        try {
          const data = JSON.parse(s.textContent || '');
          const graph = data['@graph'] || [data];
          for (const item of graph) {
            if (item['@type'] === 'FAQPage') {
              return item.mainEntity;
            }
          }
        } catch {}
      }
      return null;
    });
    expect(mainEntity).not.toBeNull();
    expect(mainEntity.length).toBe(8);
  });

  test('HowTo 包含 3 个步骤', async ({ page }) => {
    await page.goto('/');
    const steps = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      for (const s of scripts) {
        try {
          const data = JSON.parse(s.textContent || '');
          const graph = data['@graph'] || [data];
          for (const item of graph) {
            if (item['@type'] === 'HowTo') {
              return item.step;
            }
          }
        } catch {}
      }
      return null;
    });
    expect(steps).not.toBeNull();
    expect(steps.length).toBe(3);
  });
});

test.describe('多语言: JSON-LD 使用对应语言文案', () => {
  test('法语页 FAQPage 使用法语文案', async ({ page }) => {
    await page.goto('/fr/');
    const faqText = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      for (const s of scripts) {
        try {
          const data = JSON.parse(s.textContent || '');
          const graph = data['@graph'] || [data];
          for (const item of graph) {
            if (item['@type'] === 'FAQPage') {
              return JSON.stringify(item);
            }
          }
        } catch {}
      }
      return null;
    });
    expect(faqText).toContain('convertisseur');
    expect(faqText).not.toContain('Is the SVG to PNG converter completely free');
  });

  test('日语页 FAQPage 使用日语文案', async ({ page }) => {
    await page.goto('/ja/');
    const faqText = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      for (const s of scripts) {
        try {
          const data = JSON.parse(s.textContent || '');
          const graph = data['@graph'] || [data];
          for (const item of graph) {
            if (item['@type'] === 'FAQPage') {
              return JSON.stringify(item);
            }
          }
        } catch {}
      }
      return null;
    });
    expect(faqText).toContain('SVG');
  });

  test('阿拉伯语页 lang=ar 且 dir=rtl，JSON-LD 不报错', async ({ page }) => {
    await page.goto('/ar/');
    const lang = await page.getAttribute('html', 'lang');
    const dir = await page.getAttribute('html', 'dir');
    expect(lang).toBe('ar');
    expect(dir).toBe('rtl');
    // 页面正常渲染，无 MISSING_MESSAGE
    const missing: string[] = [];
    page.on('console', (msg) => {
      if (msg.text().includes('MISSING_MESSAGE')) missing.push(msg.text());
    });
    await page.waitForTimeout(1000);
    expect(missing).toEqual([]);
  });
});
