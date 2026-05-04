# Code to PNG 页面 SEO 审计报告

> 审计标准：`seo-landing-page` Skill 规范  
> 审计日期：2026-05-04  
> 核心关键词：`code to png`

---

## 1. TDK 审计

### Title（当前）
```
Code to PNG Image Converter — SVG, HTML, CSS | Free Online
```

| 指标 | 当前值 | 标准 | 结果 |
|------|--------|------|------|
| 字符数 | **61** | ≤60 | ❌ 超标 1 字符 |
| 核心词前置 | "Code to PNG" 在开头 | 是 | ✅ |
| 品牌名 | 无 | 应有 | ❌ 缺少 `- SVGCodeToPNG` |
| 吸引力 | "Free Online" | 弱 | ⚠️ 建议改为 `No Watermark` |

**建议修改：**
```
Code to PNG Converter — SVG, HTML, CSS | Free & No Watermark
（59 字符 ✅）
```

### Description（当前）
```
Convert SVG code, HTML, and CSS to PNG or JPG images — free, instant, no watermark. Paste code and download.
```

| 指标 | 当前值 | 标准 | 结果 |
|------|--------|------|------|
| 字符数 | 112 | ≤160 | ✅ |
| 核心词 | "code", "PNG" | 有 | ✅ |
| 长尾词 | 无 "screenshot"、"render" | 缺 | ⚠️ |

**建议修改：**
```
Free online code-to-image converter. Paste SVG, HTML or CSS code and download as high-quality PNG or JPG. No watermark, no signup — instant browser-based rendering.
（153 字符 ✅，加了 "rendering"、"code-to-image"）
```

### Keywords（当前）
```
code to png, code to image, html to png, svg code to png, css to png, online converter
```

| 指标 | 当前值 | 标准 | 结果 |
|------|--------|------|------|
| 个数 | 6 | 5-7 | ✅ |
| 字符数 | 83 | ≤100 | ✅ |

**建议补充：** `code screenshot`

### Title/Description/Keywords 字符数汇总

| 字段 | 当前 | 修复后 | 标准 |
|------|------|--------|------|
| Title | 61 ❌ | 59 ✅ | ≤60 |
| Description | 112 ✅ | 153 ✅ | ≤160 |
| Keywords | 83 ✅ | 98 ✅ | ≤100 |

---

## 2. H 标签层级审计

### 当前 HTML 结构（实际渲染）

```html
H1: "Code to PNG Image Converter"
  (无 H2！Hero 副标题是 <p> 标签)
<section>
  H3: "Code Editor"          ← H1 → H3 跳级！❌
  H3: "Live Preview"         ← H1 → H3 跳级！❌
</section>
<section>
  H2: "FAQ"                  ← 全页唯一 H2 ✅ 但后面又跳级
    (FAQ 项是 <span> 非 <h3>) ← 缺少 H3 ❌
</section>
<footer>
  H3: "Navigation"           ← H2(FAQ) → H3 跳级 ❌
  H3: "Legal & Related"
</footer>
```

### 问题清单

| # | 问题 | 严重度 | 文件位置 |
|---|------|--------|----------|
| 1 | Hero 副标题是 `<p>` 不是 `<h2>` | 🔴 高 | [CodeToPngConverter.tsx:253](file:///Users/y_sunshine/Documents/svgcodetopng/components/CodeToPngConverter.tsx#L253) |
| 2 | "Code Editor" / "Live Preview" 用 `<h3>` 但前面无 `<h2>` | 🔴 高 | [CodeToPngConverter.tsx:294](file:///Users/y_sunshine/Documents/svgcodetopng/components/CodeToPngConverter.tsx#L294), [333](file:///Users/y_sunshine/Documents/svgcodetopng/components/CodeToPngConverter.tsx#L333) |
| 3 | FAQ 项是 `<span>` 非 `<h3>` | 🟡 中 | [CodeToPngConverter.tsx:484](file:///Users/y_sunshine/Documents/svgcodetopng/components/CodeToPngConverter.tsx#L484) |
| 4 | Footer 描述 `<h3>` 前缺 `<h2>` | 🟡 中 | [Footer.tsx:98](file:///Users/y_sunshine/Documents/svgcodetopng/components/Footer.tsx#L98) |
| 5 | 工具区没有 H2 包裹（Section 无标题） | 🔴 高 | [CodeToPngConverter.tsx:262](file:///Users/y_sunshine/Documents/svgcodetopng/components/CodeToPngConverter.tsx#L262) |

### 建议修复后结构

```html
H1: "Code to PNG Image Converter"

  H2: "Convert SVG, HTML & CSS Code to PNG Images Instantly" ← 原 <p> 升级
    (工具直接用，无额外标题)

  H2: "How to Convert Code to PNG in 3 Simple Steps" ← 🆕 新增
    H3: "Step 1: Paste Your Code"
    H3: "Step 2: Customize Settings"
    H3: "Step 3: Download Your Image"

  H2: "Why Use Our Code to PNG Converter" ← 🆕 新增 Features
    H3: "Instant Browser-Based Rendering"
    H3: "No Watermark or Signup Required"
    H3: "Convert SVG, HTML & CSS Code"
    H3: "High-Quality PNG & JPG Export"

  H2: "Frequently Asked Questions" ← 已有
    H3: "Can I convert HTML/CSS to an image?"  ← 原 <span> 升级
    H3: "Is it really free?"
    H3: "What formats are supported?"
    H3: "How do I convert my code to PNG?"     ← 🆕 加"how to"问题

  H2: "Start Converting Your Code to PNG Now" ← 🆕 CTA

  H2: "Footer" (hidden/aria-label)            ← 或直接用 role="contentinfo"
    H3: "Navigation"
    H3: "Legal & Related"
```

---

## 3. 八大模块覆盖度

| 模块 | 规范要求 | 当前状态 | 差距 |
|------|----------|----------|------|
| **Hero** | H2 副标题 + 描述 + 双 CTA + 工具区 | ✅ H1 + 描述 → ⚠️ 缺 CTA 按钮 + 副标题非 H2 | 缺 CTA 按钮 |
| **How To** | H2 + 3 步 H3 | ❌ 完全缺失 | 全模块缺失 |
| **Features** | H2 + 4-6 H3 功能点 | ❌ 完全缺失 | 全模块缺失 |
| **Gallery** | H2 + 案例/模板 | ❌ 完全缺失 | 可暂不做，工具站核心是工具 |
| **FAQ** | H2 + 5-8 H3 Q&A | ⚠️ 有 H2 + 3 个 Q（非 H3） | 只有 3 问，少 2-5 问；缺 H3 标签 |
| **Testimonials** | H2 + 2-3 条 | ❌ 完全缺失 | 低优先级 |
| **CTA** | H2 + 引导按钮 | ❌ 完全缺失 | 页面结尾无 CTA |
| **Footer** | 品牌 + 导航 + 法律 + 友链 | ✅ 基本完整 | 1 个问题 |

### 覆盖率：**3/8 = 37.5%** 🔴

---

## 4. Footer SEO 审计

| 要素 | 规范 | 当前 | 结果 |
|------|------|------|------|
| 品牌描述 | 含核心关键词 | "Convert SVG code to..." — 只提 SVG | ❌ 应改为含 "code" 和 "HTML/CSS" |
| 导航链接 | "Home" + 内页链接 | 只有 "Home" | ❌ 缺 "Code to PNG" 内链 |
| Legal | Privacy + Terms | 都是 `#` 禁用链接 | ❌ Google 标记为劣质 |
| 友链区域 | 关联产品链接 | 4 个相关站点 ✅ | ✅ |
| Tools 区域 | 次核心词内链 | 无 | ⚠️ 可加 |
| 社交媒体 | 图标链接 | 无 | ⚠️ 可加 |

---

## 5. Hreflang 多语言标签

| 指标 | 当前状态 | 结果 |
|------|----------|------|
| Canonical | `https://svgcodetopng.com/code-to-png` ✅ | ✅ |
| alternates.languages | ❌ 缺失！页面级 metadata 没有设置 | 🔴 |
| Sitemap alternates | ✅ 已设置 12 种语言 | ✅ |

**问题：** 页面 `<head>` 中没有 `<link rel="alternate" hreflang="ko" href="/ko/code-to-png">` 等标签。

---

## 6. 多语言 SEO 元数据

| 问题 | 说明 |
|------|------|
| 非英语页面 meta 全是英语 | `page.tsx` 的 `generateMetadata` 中 `meta` Record 只有 `en`，fallback 到英语 |
| 非英语 TDK 未独立优化 | 韩语/日语/德语页面标题仍是英文 → Google 可能不认为这是本地化页面 |

**代码位置：** [page.tsx:8-14](file:///Users/y_sunshine/Documents/svgcodetopng/app/[locale]/code-to-png/page.tsx#L8-L14)

---

## 7. 修复优先级

### 🔴 P0（必须修，影响索引和排名）

| # | 问题 | 改动位置 |
|---|------|----------|
| 1 | Title 超 60 字符 → 缩到 59 | `page.tsx` L10 |
| 2 | 缺少 hreflang `alternates.languages` | `page.tsx` generateMetadata |
| 3 | 非英语页面 meta 英语（加其他语言 meta） | `page.tsx` meta Record |
| 4 | H1→H3 跳级 → 编辑器和预览标题改 `<h2>` | `CodeToPngConverter.tsx` L294, L333 |
| 5 | Hero 副标题 `<p>` → `<h2>` | `CodeToPngConverter.tsx` L253 |

### 🟡 P1（应该修，影响内容质量和长尾词）

| # | 问题 |
|---|------|
| 6 | 新增 How To 模块（3 步 H3） |
| 7 | 新增 Features 模块（4 点 H3） |
| 8 | FAQ 补到 5 问，`<span>` → `<h3>` |
| 9 | 新增 CTA 模块 |
| 10 | Footer 品牌描述含 code/HTML/CSS |
| 11 | Footer 加 "Code to PNG" 内链 |

### 🟢 P2（锦上添花）

| # | 问题 |
|---|------|
| 12 | Footer Legal 链接补真实 URL |
| 13 | Title 加品牌后缀 |
| 14 | 加 Testimonials 模块 |

---

## 8. 关键词密度快速检查

页面对 "code to png" 核心词的当前覆盖：

| 位置 | 是否出现 |
|------|----------|
| Title | ✅ "Code to PNG" |
| H1 | ✅ "Code to PNG Image Converter" |
| Description | ✅ "code" + "PNG" |
| H2 | ❌ 全页唯一 H2 是 "FAQ"，不含关键词 |
| 正文 | ⚠️ Hero 描述中间接出现 |
| ALT | ❌ 无 alt 文本 |
| Footer | ⚠️ 只提 SVG |

**核心问题：** 全页 H2 只有 1 个（FAQ），关键词只能出现在 H1 和 Title 中，Google 看到的关键词密度极低。
