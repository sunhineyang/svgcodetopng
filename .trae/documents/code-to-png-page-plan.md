# Code to PNG 独立页面 — 分阶段实施规划

---

## 0. 架构确认

### 项目当前路由结构

```
app/
├── layout.tsx                          ← 根布局（Google Analytics、广告脚本、ThemeProvider）
├── page.tsx                            ← / → redirect('/en')
├── globals.css
├── robots.ts
├── sitemap.ts
└── [locale]/                           ← 动态路由：所有语言共用
    ├── layout.tsx                      ← 语言级布局（NextIntlClientProvider + ThemeProvider）
    └── page.tsx                        ← 主页（SVG 转换器，'use client'）
```

**新增页面的正确做法：** 在 `[locale]` 下新建文件夹，放入 `page.tsx`。

```
app/[locale]/code-to-png/
    └── page.tsx                        ← 🆕 Code to PNG 页面
```

**URL 对应关系（`middleware.ts` 配置 `localePrefix: 'as-needed'`）：**

| 语言 | URL |
|------|-----|
| 英语（默认） | `/code-to-png`（无前缀）或 `/en/code-to-png` |
| 韩语 | `/ko/code-to-png` |
| 日语 | `/ja/code-to-png` |
| ... | ... |

**复用现有组件：**
- `Navigation` — 直接引入（只有 logo + 语言/主题切换，无页面链接）
- `Footer` — 直接引入
- `utils/analytics.ts` → `trackEvent()` — 直接复用
- `@monaco-editor/react` — 已安装，直接使用
- Tailwind CSS 类名 — 完全沿用主站风格

---

## 1. 分阶段总览

| 阶段 | 内容 | 语言 | 预估时间 |
|------|------|------|----------|
| **Phase 1** | 英语 Code to PNG 页面 MVP | 仅英语 | 1-2 天 |
| **Phase 2** | 其他 11 种语言翻译 | 全部语言 | 0.5 天 |
| **Phase 3** | 迭代优化（根据 GSC 数据） | 按需 | 持续 |

---

## 2. Phase 1：英语 MVP（仅做英语）

### 2.1 变更文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `package.json` | 修改 | `pnpm add html2canvas` |
| `messages/en.json` | 修改 | 新增 `codeToPng` 翻译段 |
| `app/[locale]/code-to-png/page.tsx` | **新建** | 完整页面组件 |
| `app/sitemap.ts` | 修改 | 新增 `code-to-png` sitemap 条目 |

**不修改的文件：**
- `app/[locale]/layout.tsx` — 不动（页面级 `generateMetadata` 会覆盖）
- `app/[locale]/page.tsx` — 主页不动
- `middleware.ts` — 不动（`[locale]` 路由已自动匹配新页面）
- `components/Navigation.tsx` — 不动（无需添加链接）
- `i18n.ts` — 不动
- `config/site.ts` — 不动

### 2.2 新建文件夹

```bash
mkdir -p app/\[locale\]/code-to-png
```

### 2.3 步骤拆解

#### 步骤 1：安装依赖
```bash
cd /Users/y_sunshine/Documents/svgcodetopng
pnpm add html2canvas
```

#### 步骤 2：英语翻译文件
在 `messages/en.json` 中新增 `codeToPng` 字段（见下方翻译设计）。

#### 步骤 3：创建页面组件
`app/[locale]/code-to-png/page.tsx` 包含：

1. **`generateMetadata` 导出**（服务端，页面级 SEO）

2. **客户端组件主体**（`'use client'`）：
   - Tab 状态：`activeTab: 'svg' | 'html'`
   - 代码状态：`svgCode` / `htmlCode`
   - 转换设置：`ExportSettings`
   - 预览结果：`previewUrl`

3. **SVG 模式**（复用主站逻辑）：
   - Monaco 编辑器 → `language="xml"`
   - 预览：`dangerouslySetInnerHTML` 渲染 `<svg>` 标签
   - 转换：`SVG Blob → Image → Canvas → toBlob()`
   - 下载：PNG / JPG

4. **HTML/CSS 模式**（新逻辑）：
   - Monaco 编辑器 → `language="html"`
   - 安全清洗：移除 `<script>` 标签和事件属性
   - 预览：渲染到隔离 `<div>` 中
   - 转换：`html2canvas(隔离div) → Canvas.toBlob()`
   - 下载：PNG / JPG

5. **UI 区块**：
   - Hero 区域（H1 + 描述）
   - Tab 切换栏（SVG Code | HTML/CSS）
   - 代码编辑器面板
   - 实时预览面板
   - 导出设置（格式/质量/尺寸/背景色）
   - 下载按钮（PNG + JPG）
   - 简短 FAQ（3 条）
   - Footer

**核心代码结构：**
```
┌─ generateMetadata (服务端)
│   └─ 根据 locale 返回 title/description/keywords
│
└─ PageComponent ('use client')
    ├─ Tab 状态 + 代码状态 + 预览状态
    ├─ SVG转换函数 (复用)
    ├─ HTML转换函数 (html2canvas)
    ├─ 下载函数
    └─ JSX 渲染
```

#### 步骤 4：更新 sitemap.ts
在 `sitemap()` 函数中新增 `code-to-png` 的 12 个语言条目。

#### 步骤 5：验证
```bash
pnpm dev
# 访问 http://localhost:3000/code-to-png
# 测试 SVG 转换
# 测试 HTML/CSS 转换
# 检查页面 metadata
# 检查 /sitemap.xml 输出
```

---

## 3. 翻译设计（仅英语，Phase 1）

在 `messages/en.json` 中新增以下内容：

```json
{
  "codeToPng": {
    "hero": {
      "title": "Code to PNG Image Converter",
      "subtitle": "Convert SVG, HTML & CSS Code to PNG Images Instantly",
      "description": "Free online tool to turn your code into high-quality images. Paste SVG, HTML or CSS and download as PNG or JPG. No watermark, no signup."
    },
    "tabs": {
      "svgCode": "SVG Code",
      "htmlCss": "HTML / CSS"
    },
    "editor": {
      "label": "Code Editor",
      "placeholderSvg": "Paste your SVG code here...",
      "placeholderHtml": "Paste your HTML/CSS code here..."
    },
    "preview": {
      "title": "Live Preview",
      "empty": "Preview will appear here"
    },
    "settings": {
      "format": "Format",
      "quality": "Quality",
      "width": "Width",
      "height": "Height",
      "background": "Background",
      "transparent": "Transparent",
      "white": "White",
      "black": "Black"
    },
    "actions": {
      "downloadPng": "Download PNG",
      "downloadJpg": "Download JPG",
      "converting": "Converting...",
      "copy": "Copy",
      "clear": "Clear"
    },
    "faq": {
      "title": "FAQ",
      "q1": "Can I convert HTML/CSS to an image?",
      "a1": "Yes! Switch to the HTML/CSS tab, paste your code, and download as PNG or JPG.",
      "q2": "Is it really free?",
      "a2": "Completely free — no registration, no watermark, no file size limits.",
      "q3": "What formats are supported?",
      "a3": "PNG (supports transparency) and JPG. Need GIF? Try our main SVG converter."
    }
  }
}
```

---

## 4. Metadata 设计（页面级 generateMetadata）

在 `page.tsx` 中直接导出 `generateMetadata`，按 locale 返回不同语言的 meta：

```typescript
export async function generateMetadata({ params }: { params: { locale: string } }) {
  const locale = params.locale || 'en';

  // Phase 1: 只有英语。Phase 2 补充其他语言。
  const meta: Record<string, { title: string; description: string; keywords: string }> = {
    en: {
      title: 'Code to PNG Image Converter — SVG, HTML, CSS | Free Online',
      description: 'Convert SVG code, HTML, and CSS to PNG or JPG images — free, instant, no watermark. Paste code and download.',
      keywords: 'code to png, code to image, html to png, svg code to png, css to png, online converter',
    },
    // Phase 2 补充:
    // ko: { title: '...', description: '...', keywords: '...' },
    // ja: { ... },
    // ...
  };

  const m = meta[locale] || meta['en'];

  return {
    metadataBase: new URL(siteConfig.url),
    title: m.title,
    description: m.description,
    keywords: m.keywords,
    alternates: {
      canonical: `${siteConfig.url}${locale === 'en' ? '/code-to-png' : `/${locale}/code-to-png`}`,
    },
    openGraph: {
      title: m.title,
      description: m.description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: m.title,
      description: m.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
```

---

## 5. Sitemap 更新

在 `app/sitemap.ts` 中新增 code-to-png 条目：

```typescript
// 现有主页条目保持不变，新增以下 code-to-png 条目：
const codeToPngUrls: MetadataRoute.Sitemap = locales.map((locale) => {
  const path = locale === 'en' ? '/code-to-png' : `/${locale}/code-to-png`;
  return {
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${siteConfig.url}${l === 'en' ? '/code-to-png' : `/${l}/code-to-png`}`])
      ),
    },
  };
});

// 返回 [...urls, ...codeToPngUrls]
```

---

## 6. Phase 2：其他 11 种语言（后续）

当英语页面稳定运行、数据验证通过后执行：

| 步骤 | 内容 |
|------|------|
| 1 | 给 `messages/ko.json, ja.json, ...` 等 11 个文件加 `codeToPng` 段 |
| 2 | 在 `page.tsx` 的 `generateMetadata` 中补充其他语言的 meta |
| 3 | 构建验证 |

---

## 7. Phase 3：迭代优化（持续）

- 根据 GSC 数据优化 title/description
- 可选：从主页导航栏加链接指向 code-to-png 页面
- 可选：提升 HTML 预览精度（处理图片跨域、字体加载等）
- 可选：加 Google Analytics 事件追踪

---

## 8. 风险与技术验证

| 风险 | 缓解 |
|------|------|
| html2canvas 对某些 CSS 渲染异常 | 页面上不承诺完美支持所有 CSS；首次上线覆盖面 80% 常见布局即可 |
| React 渲染时序问题（DOM 未就绪就截图） | `useEffect` + `requestAnimationFrame` 延迟截图 |
| 用户输入恶意脚本 | 注入前用正则剥离 `<script>` 标签和事件属性 |
| 外部图片跨域导致截图空白 | 首次实现限制用户使用内联图片或 data URI |
