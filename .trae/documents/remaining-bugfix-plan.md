# SEO/i18n 残留问题修复方案（Skill Review 修订版）

> 基于 `new-page-checklist` skill 9 步框架逐条复核后的完整修订版。
> 原计划覆盖了 3 个修复项，经 skill review 后发现 **3 个额外遗漏**。

---

## Skill Review 总结

| 检查维度 | 原计划是否覆盖 | 发现 |
|----------|:-:|------|
| 路由 | ✅ | 已确认 |
| metadata | ✅ | 已确认 |
| canonical / hreflang / x-default | ✅ | 已修复 + 本轮补齐 code-to-png |
| **sitemap** | ⚠️ 原计划已覆盖 | 已有 sitemap x-default 修复项 |
| **i18n 文案 — aiAssistant.errors** | ⚠️ 严重不足 | **不只是 ar.json，全部 11 个非英语文件都是英文** |
| **Footer 国际化** | ❌ 完全遗漏 | **Footer.tsx 完全没用 useTranslations，所有文本硬编码英文** |
| **JSON-LD 结构化数据** | ❌ 完全遗漏 | **Code-to-PNG 的 JSON-LD 全部硬编码英文，非英语页面也在输出英文 schema** |
| layout lang/dir | ✅ | 上一轮已修复 |
| 用户入口 | ⚠️ | Footer 链接不跟随 locale |

### 发现了什么？

#### 🔴 发现 A：aiAssistant.errors — 不只是阿拉伯语，11 个语言文件全是英文

原计划只修 `ar.json`，但实际上：

- `en.json`：7 个英文 key ✅（源文件）
- `ar.json`：6 个英文 key（缺 `networkError`）
- `fr.json` / `ko.json` / `ja.json` / `de.json` / `ru.json` / `es.json` / `pt.json` / `it.json` / `id.json` / `zh.json`：**全部 7 个 key 都是英文**

这意味着：**任何非英语用户使用 AI 助手遇到错误时，看到的都是英文提示**。

原计划的"修复 ar.json"只解决了 1/11 的问题。

#### 🔴 发现 B：Footer 组件完全未国际化

`en.json` 已经有完整的 `footer.*` i18n key（description、contactUs、navigation、legal、copyright 等），但 `components/Footer.tsx`：

1. 没有引入 `useTranslations`
2. 所有文本（"Navigation"、"Legal"、"Contact Us"、"Made with ❤️ for developers"、"Available Worldwide"、"All Systems Operational"）全部硬编码英文
3. Footer 的 Code-to-PNG 链接是 `/code-to-png`，不会根据当前语言自动变成 `/ar/code-to-png`
4. 版权年份硬编码 `2024`，而 `en.json` 已经写了 `2025`

这意味着：**任何非英语用户滚动到页面底部，看到的 Footer 全是英文**。

#### 🟡 发现 C：Code-to-PNG JSON-LD 结构化数据全部硬编码英文

`app/[locale]/code-to-png/page.tsx` 的 `generateMetadata` 虽然已经翻译了 12 种语言的 title/description/keywords，但页面底部的 JSON-LD 结构化数据：

1. `WebApplication.name` = "Code to PNG Image Converter"（英文）
2. `WebApplication.description` = 英文
3. `HowTo.name` / `HowTo.description` / 所有 `HowToStep` = 英文
4. `FAQPage` 所有问题 = 英文

这意味着：**即使阿拉伯语页面的 `<title>` 是阿拉伯语，Google 看到的结构化数据仍然是英文**。

---

## 修复范围决策

由于本次 skill review 发现的问题比原计划大得多，需要分优先级处理：

### 本轮必须修（P0/P1）

| # | 问题 | 影响 | 修复文件 |
|---|------|------|----------|
| 1 | Code-to-PNG 页面缺少 `x-default` | SEO 合规 | `app/[locale]/code-to-png/page.tsx` |
| 2 | Sitemap 缺少 `x-default` | SEO 合规 | `app/sitemap.ts` |
| 3 | **11 个非英语文件的 aiAssistant.errors 未翻译** | 非英语用户体验 | `messages/ar.json` + 10 个其它语言文件 |
| 4 | **Footer 组件未国际化** | 非英语用户体验 | `components/Footer.tsx` |

### 下轮再修（P2 — 建议单独开一轮）

| # | 问题 | 原因 |
|---|------|------|
| 5 | Code-to-PNG JSON-LD 未国际化 | 改动量大（需要把 JSON-LD 的 3 种 schema 拆成 i18n key 或从 metadata 读取），且 Google 对 JSON-LD 的语言匹配没有硬性要求，优先级相对低 |

---

## Proposed Changes

### 变更 1：补齐 Code-to-PNG 页面的 `x-default`（不变）

**文件**：`app/[locale]/code-to-png/page.tsx`

**怎么改**

把当前的 `alternates.languages`：

```ts
languages: Object.fromEntries(
  locales.map((l) => [
    l,
    `${siteConfig.url}${l === 'en' ? '/code-to-png' : `/${l}/code-to-png`}`,
  ])
),
```

改成：

```ts
languages: {
  'x-default': `${siteConfig.url}/code-to-png`,
  ...Object.fromEntries(
    locales.map((l) => [
      l,
      `${siteConfig.url}${l === 'en' ? '/code-to-png' : `/${l}/code-to-png`}`,
    ])
  ),
},
```

---

### 变更 2：补齐 sitemap 的 `x-default`（不变）

**文件**：`app/sitemap.ts`

**怎么改**

在 `urls` 和 `codeToPngUrls` 两处 `alternates.languages` 中，都加入 `x-default`：

首页 sitemap：

```ts
alternates: {
  languages: {
    'x-default': `${siteConfig.url}/`,
    ...Object.fromEntries(
      locales.map((l) => [
        l,
        `${siteConfig.url}${l === 'en' ? '' : `/${l}`}`,
      ])
    ),
  },
},
```

Code-to-PNG sitemap：

```ts
alternates: {
  languages: {
    'x-default': `${siteConfig.url}/code-to-png`,
    ...Object.fromEntries(
      locales.map((l) => [
        l,
        `${siteConfig.url}${l === 'en' ? '/code-to-png' : `/${l}/code-to-png`}`,
      ])
    ),
  },
},
```

---

### 变更 3：翻译 11 个非英语文件的 aiAssistant.errors（扩展）

**文件**：
- `messages/ar.json`（需补 `networkError` key + 翻译全部 7 个）
- `messages/fr.json` / `ko.json` / `ja.json` / `de.json` / `ru.json` / `es.json` / `pt.json` / `it.json` / `id.json` / `zh.json`（各 7 个错误翻译）

**当前状态**：11 个文件的 `aiAssistant.errors` 全部是英文原文。

**目标**：将每个文件的 7 个错误 key（`svgTooLong`、`svgSyntaxError`、`extractionFailed`、`timeout`、`rateLimit`、`networkError`、`aiError`）翻译成对应语言。

**翻译原则**：
- 自然、直接、可操作
- `networkError` = 网络连接失败，`aiError` = AI 服务内部错误，两者语义不能混
- JSON 转义正确（双引号用 `\"`）

---

### 变更 4：Footer 组件国际化（新增）

**文件**：`components/Footer.tsx`

**为什么改**

- `en.json` 已经有完整的 `footer.*` key
- 但 Footer 组件完全没使用 `useTranslations`
- 所有非英语用户看到的 Footer 都是英文
- Footer 链接不跟随 locale（`/code-to-png` 不会变成 `/ar/code-to-png`）

**怎么改**

1. 引入 `useTranslations` 和 `useLocale`（next-intl）
2. 将所有硬编码英文替换为 `t('footer.xxx')` 调用
3. 将 `/code-to-png` 链接改为根据当前 locale 动态生成路径
4. 版权年份使用 `new Date().getFullYear()` 动态获取

**具体替换清单**：

| 当前硬编码 | 替换为 |
|-----------|--------|
| `"Convert SVG code to high-quality..."` | `t('footer.description')` |
| `"Contact Us"` | `t('footer.contactUs')` |
| `"Navigation"` | `t('footer.navigation.title')` |
| `"Home"` | `t('footer.navigation.home')` |
| `"Legal & Related"` | `t('footer.legal.title')` |
| `"Privacy Policy"` | `t('footer.legal.privacy')` |
| `"Terms of Service"` | `t('footer.legal.terms')` |
| `"© 2024 SVGCodeToPNG..."` | `t('footer.copyright')` |
| `"Made with"` | `t('footer.madeWith')` |
| `"for developers"` | `t('footer.forDevelopers')` |
| `"Available Worldwide"` | `t('footer.availableWorldwide')` |
| `"All Systems Operational"` | `t('footer.systemsOperational')` |
| `{ name: 'Home', href: '/' }` | 使用 i18n key + locale-aware href |
| `{ name: 'Code to PNG', href: '/code-to-png' }` | 使用 i18n key + locale-aware href |
| `alert('Invalid link...')` | `t('footer.linkError')` |
| `alert('Email address copied...')` | `t('footer.emailCopied')` |
| `alert('Please copy this email...')` | `t('footer.emailCopyManual')` |

**注意**：需要先确认 11 个非英语文件的 `footer.*` key 是否已经翻译。如果已翻译则直接用；如果仍是英文，则需要一并翻译。

---

## 变更 5 暂缓：Code-to-PNG JSON-LD 国际化

**原因**：
- 改动量大（WebApplication + HowTo + FAQPage 三种 schema，每种有多个字段）
- 需要在 `messages/*.json` 中新增大量 key（约 20+ 个 per language）
- Google 对 JSON-LD 语言匹配没有硬性要求
- 建议作为单独一轮优化

---

## Assumptions & Decisions

- 默认语言仍然是英语，`x-default` 指向英文默认路由
- 本轮修 4 个问题（3 个原计划 + 1 个新增），JSON-LD 下轮再修
- Footer 国际化前提是各语言的 `footer.*` key 已经翻译好，如果没翻译，需要同步补上
- `aiAssistant.errors` 的 11 个文件翻译可以批量处理（sed 或逐文件修改）

---

## Verification Steps

### 构建验证

1. 运行 `npx next build`
2. 确认无 TypeScript 报错、无 JSON 解析错误

### SEO 验证

1. `/code-to-png` — 检查 `x-default` hreflang
2. `/sitemap.xml` — 检查首页和 code-to-png 的 `x-default`
3. `/<locale>/code-to-png` — 检查 hreflang 完整性

### Footer 验证

1. 打开 `/` — Footer 显示英文
2. 打开 `/ar` — Footer 显示阿拉伯语
3. 打开 `/ko` — Footer 显示韩语
4. 点击 Footer 的 "Code to PNG" 链接 — 跳转到对应语言版本

### i18n 错误文案验证

1. 抽查 `messages/fr.json` 的 `aiAssistant.errors` — 全部法语
2. 抽查 `messages/ar.json` — 7 个 key 齐全，阿拉伯语
3. 抽查 `messages/zh.json` — 7 个 key 齐全，中文

---

## 执行顺序

| 步骤 | 操作 | 影响文件 | 风险 |
|------|------|----------|------|
| 1 | Code-to-PNG `x-default` | `app/[locale]/code-to-png/page.tsx` | 低 |
| 2 | Sitemap `x-default` | `app/sitemap.ts` | 低 |
| 3 | 11 个语言文件 AI 错误翻译 | `messages/*.json`（11 个） | 中（翻译质量） |
| 4 | Footer 国际化 | `components/Footer.tsx` | 中（需验证各语言 footer key 是否已翻译） |
| 5 | 构建验证 + 回归测试 | 无代码修改 | 无 |

**总修改文件数**：14 个（1 + 1 + 11 + 1）
**预计新增/修改代码行**：约 150-200 行
