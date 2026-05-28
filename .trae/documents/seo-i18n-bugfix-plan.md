# 网站 SEO 与国际化 Bug 修复技术方案

## 问题总览

通过 Playwright 自动化测试发现 8 个问题，按严重程度分为 3 级。以下是详细的技术方案。

---

## 修复 1（P0）：所有页面 `<html>` 标签缺少 `lang` 属性 + 阿拉伯语 RTL 未生效

### 问题根因

- `<html>` 标签定义在 `app/layout.tsx`（根布局），写死了 `<html suppressHydrationWarning>`，没有 `lang` 和 `dir` 属性
- `app/[locale]/layout.tsx`（语言布局）只返回了 `<NextIntlClientProvider>` 包裹的 children，没有向父级的 `<html>` 传递 locale 信息
- `i18n.ts` 中 `languages.ar` 已配置 `dir: 'rtl'`，但 layout 从未使用此配置

### 技术方案

**方案选择：将 `<html>` 和 `<body>` 标签从根布局移到语言布局**

Next.js App Router 中，`app/[locale]/layout.tsx` 嵌套在 `app/layout.tsx` 内部。由于根布局已经定义了 `<html>` 和 `<body>`，语言布局无法再输出这两个标签。

正确的做法是：

1. **修改 `app/layout.tsx`**：移除 `<html>` 和 `<body>` 标签，仅保留全局脚本和样式。**但 Next.js 要求根布局必须包含 `<html>` 和 `<body>`**，所以不能直接移除。

2. **替代方案：在 `app/layout.tsx` 中接收 locale 参数**

   由于 `app/layout.tsx` 不在 `[locale]` 路由段内，无法直接获取 `params.locale`。但可以通过 `headers()` / `cookies()` 读取当前路径。

3. **最终方案：将 `<html>` 和 `<body>` 标签移到 `app/[locale]/layout.tsx`，根布局只做透明包裹**

   具体修改：

#### 步骤 A：修改 `app/layout.tsx`

```tsx
// 将 <html> 和 <body> 改为直接返回 children
// 因为 Next.js 要求根布局有 <html> 和 <body>，
// 我们改为在根布局中用 locale 布局的 html/body 来替代

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 注意：Next.js 要求根布局输出 <html> 和 <body>，
  // 但实际渲染由 [locale]/layout.tsx 负责
  // 这里的 children 就是 [locale]/layout.tsx 的输出
  return children;
}
```

**但 Next.js 14.2 要求根布局必须输出 `<html>` 和 `<body>`**，否则报错。所以需要换一个方案：

#### 修正方案：在根布局保留 `<html>` 和 `<body>`，但通过中间件注入 locale

**实际可行方案：**

1. **修改 `middleware.ts`**：在 middleware 中设置一个响应头 `x-locale`

2. **修改 `app/layout.tsx`**：从 `headers()` 读取 locale，动态设置 `lang` 和 `dir`

```tsx
// app/layout.tsx
import { headers } from 'next/headers';
import { languages } from '../i18n';

export default async function RootLayout({ children }) {
  const headersList = headers();
  const locale = headersList.get('x-locale') || 'en';
  const langConfig = languages[locale] || languages['en'];
  const dir = langConfig.dir || 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        {/* 全局脚本保持不变 */}
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider ...>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

3. **修改 `app/[locale]/layout.tsx`**：移除重复的 `ThemeProvider`（已在根布局中），只保留 `NextIntlClientProvider`

```tsx
// app/[locale]/layout.tsx
export default async function LocaleLayout({ children, params }) {
  const locale = params.locale || 'en';
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
```

### 涉及文件

| 文件 | 修改内容 |
|------|---------|
| `app/layout.tsx` | 从 headers 读取 locale，设置 `lang` 和 `dir`；移除 ThemeProvider 中重复的包裹 |
| `app/[locale]/layout.tsx` | 移除 ThemeProvider（已在根布局），仅保留 NextIntlClientProvider |
| `middleware.ts` | 添加 `x-locale` 响应头 |

### 风险点

- `headers()` 在静态导出时不可用，但项目使用 SSR（有 middleware），不影响
- ThemeProvider 从 `[locale]/layout.tsx` 移到 `app/layout.tsx`，需确保主题切换逻辑不受影响

---

## 修复 2（P0）：所有 12 个语言文件中 `<svg>` 和 `<text>` 标签未转义

### 问题根因

`messages/*.json` 中 FAQ 的 `question6.answer` 和 `question8.answer` 含有字面量 `<svg>` 和 `<text>`，next-intl 将其解析为 HTML 标签，触发 `UNCLOSED_TAG` 错误。

### 技术方案

将所有 12 个 JSON 文件中的 `<svg>` 替换为 `&lt;svg&gt;`，`<text>` 替换为 `&lt;text&gt;`。

**注意：** next-intl 的 ICU 消息格式中，`<` 和 `>` 被视为 HTML 标签。需要使用 HTML 实体转义。

#### 具体替换

**每个文件的 `question6.answer`：**

```diff
- "answer": "...whether it's a single <svg> tag..."
+ "answer": "...whether it's a single &lt;svg&gt; tag..."
```

**每个文件的 `question8.answer`（仅 en 有 `<text>`）：**

```diff
- "answer": "...SVG files with <text> elements perfectly..."
+ "answer": "...SVG files with &lt;text&gt; elements perfectly..."
```

### 涉及文件

| 文件 | 修改 key |
|------|---------|
| `messages/en.json` | `faq.question6.answer` + `faq.question8.answer` |
| `messages/ko.json` | `faq.question6.answer` + `faq.question8.answer` |
| `messages/ja.json` | `faq.question6.answer` + `faq.question8.answer` |
| `messages/ru.json` | `faq.question6.answer` + `faq.question8.answer` |
| `messages/es.json` | `faq.question6.answer` + `faq.question8.answer` |
| `messages/fr.json` | `faq.question6.answer` + `faq.question8.answer` |
| `messages/de.json` | `faq.question6.answer` + `faq.question8.answer` |
| `messages/zh.json` | `faq.question6.answer` + `faq.question8.answer` |
| `messages/pt.json` | `faq.question6.answer` + `faq.question8.answer` |
| `messages/it.json` | `faq.question6.answer` + `faq.question8.answer` |
| `messages/id.json` | `faq.question6.answer` + `faq.question8.answer` |
| `messages/ar.json` | `faq.question6.answer` + `faq.question8.answer` |

---

## 修复 3（P1）：Code-to-PNG 页面缺少 9 种语言的 metadata 翻译

### 问题根因

`app/[locale]/code-to-png/page.tsx` 的 `meta` 对象只定义了 `en`、`de`、`es` 三种语言的 title/description/keywords，其余 9 种语言 fallback 到英文。

### 技术方案

在 `meta` Record 中补充 `ko`、`ja`、`ru`、`fr`、`zh`、`pt`、`it`、`id`、`ar` 的翻译。

### 涉及文件

| 文件 | 修改内容 |
|------|---------|
| `app/[locale]/code-to-png/page.tsx` | 在 `meta` 对象中补充 9 种语言的翻译 |

### 翻译内容来源

从各语言首页的 metadata 翻译风格推断，为 Code-to-PNG 页面编写本地化的 title、description、keywords。

---

## 修复 4（P1）：所有页面 hreflang 缺少 `x-default` + 英文 hreflang 不一致

### 问题根因

1. 所有页面的 `alternates.languages` 中没有 `x-default` 条目
2. 首页用 `'en-US'` 作为英文 hreflang，code-to-png 页面用 `'en'`

### 技术方案

1. 在所有 `alternates.languages` 中添加 `'x-default': '/'`
2. 统一英文 hreflang 为 `'en'`（Google 推荐用 `en` 而非 `en-US`，因为我们的内容不区分地区）

### 涉及文件

| 文件 | 修改内容 |
|------|---------|
| `app/layout.tsx` | metadata 中的 `alternates.languages`：`'en-US'` → `'en'`，新增 `'x-default': '/'` |
| `app/[locale]/layout.tsx` | 所有 12 个 locale 分支的 `alternates.languages`：同上 |
| `app/[locale]/code-to-png/page.tsx` | `alternates.languages`：新增 `'x-default'` |

注意：`app/[locale]/layout.tsx` 有 12 个 if 分支，每个都需要修改，总共 13 处 languages 对象要更新。

---

## 修复 5（P2）：英文 description 标点缺空格

### 问题根因

`app/layout.tsx` 第 23 行和 `app/[locale]/layout.tsx` 第 656 行：

```
"file.Fast,easy,no signup."
```

应为：

```
"file. Fast, easy, no signup."
```

### 技术方案

全局替换此字符串。

### 涉及文件

| 文件 | 修改内容 |
|------|---------|
| `app/layout.tsx` | `description` 字段修复标点 |
| `app/[locale]/layout.tsx` | 英文默认 metadata 的 `description` 字段修复标点 |

---

## 修复 6（P2）：ar.json 的 `aiAssistant.errors` 区块内容为英文

### 问题根因

`messages/ar.json` 的 `aiAssistant.errors` 对象（第 545-569 行）中，`svgSyntaxError`、`extractionFailed`、`timeout`、`rateLimit`、`aiError` 的 title/message/suggestion 均为英文，未翻译为阿拉伯语。

### 技术方案

将这 5 个错误对象的 title、message、suggestion 翻译为阿拉伯语。

### 涉及文件

| 文件 | 修改内容 |
|------|---------|
| `messages/ar.json` | `aiAssistant.errors` 下 5 个错误对象的阿拉伯语翻译 |

---

## 执行顺序

```
Step 1: 修复 <html> lang/dir 属性（修复 1）
  ├── 修改 middleware.ts（添加 x-locale header）
  ├── 修改 app/layout.tsx（动态 lang/dir + ThemeProvider 移入）
  └── 修改 app/[locale]/layout.tsx（移除 ThemeProvider）

Step 2: 转义 <svg> 和 <text> 标签（修复 2）
  └── 修改 12 个 messages/*.json 文件

Step 3: 补齐 Code-to-PNG metadata 翻译（修复 3）
  └── 修改 app/[locale]/code-to-png/page.tsx

Step 4: 统一 hreflang（修复 4）
  ├── 修改 app/layout.tsx
  ├── 修改 app/[locale]/layout.tsx（12 个分支）
  └── 修改 app/[locale]/code-to-png/page.tsx

Step 5: 修复英文 description 标点（修复 5）
  └── 修改 app/layout.tsx + app/[locale]/layout.tsx

Step 6: 修复 ar.json AI 错误翻译（修复 6）
  └── 修改 messages/ar.json

Step 7: 验证
  ├── npx next build（构建通过）
  └── Playwright 回归测试（随机抽查 3-4 个语言版本）
```

## 验证标准

1. **构建通过**：`npx next build` 无错误
2. **`<html>` 属性**：各语言页面 `<html lang="xx" dir="ltr|rtl">` 正确
3. **无 IntlError**：控制台无 `UNCLOSED_TAG` 错误
4. **hreflang 完整**：所有页面有 12 种语言 + `x-default`，英文统一为 `en`
5. **Code-to-PNG metadata**：12 种语言均有本地化 title 和 description
6. **阿拉伯语 RTL**：`dir="rtl"` 生效，页面从右到左排列
