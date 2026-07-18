<!--
快照使用说明：
1. 复制本文件到 snapshots/ 目录，命名为 v{版本号}-{简短标识}-{YYYY-MM-DD}.md
2. 按章节填空，每章顶部的 <!-- 填写指引 --> 注释写完后删掉
3. 缺项写 N/A 或「待补充」，不要删章节
4. 完成后在 CHANGELOG.md 顶部追加一行索引
-->

# SEO 快照 · vX.Y.Z-{标识}

> 一句话总结本次版本和 SEO 影响（用于 CHANGELOG 索引）

---

## 1. 快照元信息

| 字段 | 值 |
|------|---|
| 版本号 | vX.Y.Z |
| 对应 package.json version | x.y.z |
| Git Tag | vx.y.z |
| 主 commit hash | `<填>` |
| 生成日期 | YYYY-MM-DD |
| 上一版本 | vX.Y.Z-{标识} |
| 触发原因 | 功能迭代 / SEO 专项 / 紧急修复 / 内容更新 |
| 责任人 | `<填>` |
| 是否上线 | 是 / 否 |

---

## 2. 改动范围

<!-- 跑这两条命令贴结果：
git log --oneline v上一版本..HEAD
git diff --stat v上一版本..HEAD -- 'app/**' 'config/**' '*.ts' '*.tsx' 'public/**'
-->

### 2.1 本次涉及的文件清单

```
（贴 git diff --stat 输出）
```

### 2.2 SEO 相关文件分类

| 类别 | 文件 | 是否影响 SEO |
|------|------|-------------|
| 页面（pages） | app/[locale]/page.tsx | 是 / 否 |
| 页面（pages） | app/[locale]/code-to-png/page.tsx | 是 / 否 |
| Metadata | app/[locale]/layout.tsx | 是 / 否 |
| 多语言 | i18n.ts / messages/*.json | 是 / 否 |
| 站点配置 | config/site.ts | 是 / 否 |
| 路由 | app/sitemap.ts / app/robots.ts | 是 / 否 |
| 埋点 | utils/analytics.ts | 是 / 否 |
| 其他 | `<填>` | 是 / 否 |

---

## 3. TDK 快照

<!-- 全量记录每页面 × 每语言的 title / description / keywords
     即使本次没改也要复制一份，方便对比。
     数据来源：app/[locale]/layout.tsx 和 app/[locale]/*/page.tsx 的 generateMetadata
-->

### 3.1 主页 `/` TDK

| 语言 | 路由 | Title | Description | Keywords |
|------|------|-------|-------------|----------|
| en | `/ | `<填>` | `<填>` | `<填>` |
| ko | `/ko` | `<填>` | `<填>` | `<填>` |
| ja | `/ja` | `<填>` | `<填>` | `<填>` |
| ru | `/ru` | `<填>` | `<填>` | `<填>` |
| es | `/es` | `<填>` | `<填>` | `<填>` |
| fr | `/fr` | `<填>` | `<填>` | `<填>` |
| de | `/de` | `<填>` | `<填>` | `<填>` |
| zh | `/zh` | `<填>` | `<填>` | `<填>` |
| pt | `/pt` | `<填>` | `<填>` | `<填>` |
| it | `/it` | `<填>` | `<填>` | `<填>` |
| id | `/id` | `<填>` | `<填>` | `<填>` |
| ar | `/ar` | `<填>` | `<填>` | `<填>` |

### 3.2 Code-to-PNG 页 `/code-to-png` TDK

| 语言 | 路由 | Title | Description | Keywords |
|------|------|-------|-------------|----------|
| en | `/code-to-png` | `<填>` | `<填>` | `<填>` |
| ... | ... | ... | ... | ... |

### 3.3 OG / Twitter Card（按语言）

| 语言 | OG Title | OG Description | OG Locale |
|------|---------|---------------|-----------|
| en | `<填>` | `<填>` | en_US |
| ... | ... | ... | ... |

---

## 4. URL & 路由结构

### 4.1 总 URL 数

- 支持语言数：12（en/ko/ja/ru/es/fr/de/zh/pt/it/id/ar）
- 核心页面数：2（`/` + `/code-to-png`）
- **总 URL 数：24**

### 4.2 路由清单

| 页面 | 路由模板 | 是否在 sitemap |
|------|---------|---------------|
| 主页 | `/{locale}` | 是 / 否 |
| Code-to-PNG | `/{locale}/code-to-png` | 是 / 否 |

### 4.3 sitemap.xml 当前状态

```
（贴 sitemap.ts 里 locales × pages 的当前逻辑 + 输出条目数）
```

---

## 5. 多语言 SEO

### 5.1 hreflang 完整性

- [ ] 每个页面都声明了全部 12 个语言的 hreflang？
- [ ] 都有 `x-default` 指向 `/`？
- [ ] hreflang URL 用绝对路径（含 metadataBase）？

### 5.2 Canonical 正确性

| 页面 × 语言 | Canonical 值 | 是否自指 |
|------------|-------------|---------|
| `/` × en | `https://svgcodetopng.com/` | 是 |
| `/ko` × ko | `https://svgcodetopng.com/ko` | 是 |
| ... | ... | ... |

### 5.3 `<html lang>` 和 dir 属性

| 语言 | `<html lang>` | `dir` |
|------|--------------|-------|
| ar | ar | rtl |
| 其他 11 个 | 各自代码 | ltr |

---

## 6. 结构化数据（JSON-LD）

### 6.1 当前页面拥有的 Schema 类型

| 页面 | WebApplication | HowTo | FAQPage | BreadcrumbList | 其他 |
|------|---------------|-------|---------|---------------|------|
| `/` | ✓ / ✗ | ✓ / ✗ | ✓ / ✗ | ✓ / ✗ | `<填>` |
| `/code-to-png` | ✓ / ✗ | ✓ / ✗ | ✓ / ✗ | ✓ / ✗ | `<填>` |

### 6.2 Rich Results Test 验证

- 测试 URL：`<填>`
- 测试结果：通过 / 警告 / 错误
- 截图：`<贴>`

---

## 7. 技术 SEO

| 检查项 | 状态 | 备注 |
|-------|------|------|
| robots.txt 可达 | ✓ / ✗ | `/robots.txt` |
| sitemap.xml 可达 | ✓ / ✗ | `/sitemap.xml` |
| metadataBase 已设 | ✓ / ✗ | `config/site.ts` |
| OG image 存在 | ✓ / ✗ | `/logo.svg` 或专用图 |
| Twitter Card | ✓ / ✗ | summary_large_image |
| favicon.svg | ✓ / ✗ | `/favicon.svg` |
| llms.txt（AI 抓取） | ✓ / ✗ | `/llms.txt` |
| canonical link | ✓ / ✗ | 见章节 5.2 |
| hreflang tags | ✓ / ✗ | 见章节 5.1 |
| HTTPS 强制 | ✓ / ✗ | `<填>` |
| www/non-www 跳转 | ✓ / ✗ | `<填>` |

---

## 8. 页面性能（Core Web Vitals）

<!-- 线上才有真实数据，本地/dev 跳过此章
     数据源：PageSpeed Insights / Search Console Core Web Vitals 报告
-->

| 指标 | 主页 `/` | Code-to-PNG |
|------|---------|-------------|
| LCP（秒） | `<填>` | `<填>` |
| CLS | `<填>` | `<填>` |
| INP（毫秒） | `<填>` | `<填>` |
| 关键图片优化 | ✓ / ✗ | ✓ / ✗ |
| 字体加载策略 | display: swap | display: swap |
| 首屏 JS bundle 大小 | `<填>` kB | `<填>` kB |

---

## 9. 内容 SEO

### 9.1 主关键词密度（首页）

| 关键词 | 目标密度 | 实际密度 | 出现次数 | 评估 |
|-------|---------|---------|---------|------|
| svg to png | 1.5%~2.5% | `<填>`% | `<填>` | ✓ / ⚠️ / ❌ |
| code to png | 0.5%~1.5% | `<填>`% | `<填>` | ✓ / ⚠️ / ❌ |
| svg converter | 0.5%~1.5% | `<填>`% | `<填>` | ✓ / ⚠️ / ❌ |

### 9.2 H 标签结构

| 页面 | H1 | H2 数量 | H3 数量 | 是否符合金字塔 |
|------|----|---------|---------|--------------|
| `/` | `<填>` | `<填>` | `<填>` | ✓ / ✗ |
| `/code-to-png` | `<填>` | `<填>` | `<填>` | ✓ / ✗ |

### 9.3 图片 alt 文本

- 抽检页面：`<填>`
- 缺 alt 图片数：`<填>`
- 关键图片 alt 是否含目标关键词：✓ / ✗

### 9.4 内链结构

- 主页 → Code-to-PNG：✓ / ✗（位置：`<填>`）
- Code-to-PNG → 主页：✓ / ✗（位置：`<填>`）
- 语言切换链接：✓ / ✗（位置：`<填>`）

---

## 10. 埋点 & 转化（GA4）

### 10.1 当前埋点事件清单

| 事件名 | 触发位置 | 涉及页面 | 状态 |
|-------|---------|---------|------|
| page_view | gtag 自动 | 全站 | ✓ |
| svg_paste | Monaco onChange | `/` + `/code-to-png` | ✓ / ✗ |
| svg_render_success | blob 生成成功 | `/` + `/code-to-png` | ✓ / ✗ |
| svg_render_error | 转换失败 | `/` + `/code-to-png` | ✓ / ✗ |
| png_download_click | 下载按钮点击 | `/` + `/code-to-png` | ✓ / ✗ |
| download_failed | 下载失败 | `/` + `/code-to-png` | ✓ / ✗ |
| export_setting_change | 设置变更 | `/` + `/code-to-png` | ✓ / ✗ |
| template_use | Reset 按钮 | `/` + `/code-to-png` | ✓ / ✗ |
| example_copy | Copy 按钮 | `/` + `/code-to-png` | ✓ / ✗ |
| ai_assistant_open | AI 面板挂载 | `/` | ✓ / ✗ |
| ai_prompt_submit | 发送 AI 指令 | `/` | ✓ / ✗ |
| ai_quick_action_click | 快捷指令 | `/` | ✓ / ✗ |
| second_conversion_same_session | 第 2 次成功转换 | 全站共享 | ✓ / ✗ |
| tool_repeat_intent | 重复操作意图 | `/` + `/code-to-png` | ✓ / ✗ |

### 10.2 转化漏斗完整性

```
page_view → svg_paste → svg_render_success → export_setting_change(可选) → png_download_click
```

- [ ] 主页 `/` 漏斗通顺
- [ ] Code-to-PNG `/code-to-png` 漏斗通顺

---

## 11. 风险 & 与上版对比

### 11.1 本次发现的问题（带优先级）

| 优先级 | 问题描述 | 影响范围 | 建议修复方式 | 负责人 |
|-------|---------|---------|-------------|-------|
| P0（紧急） | `<填>` | `<填>` | `<填>` | `<填>` |
| P1（高） | `<填>` | `<填>` | `<填>` | `<填>` |
| P2（中） | `<填>` | `<填>` | `<填>` | `<填>` |
| P3（低） | `<填>` | `<填>` | `<填>` | `<填>` |

**优先级定义**：
- **P0**：影响线上 SEO（canonical 错、404、TDK 丢失）
- **P1**：影响排名但可缓修（关键词密度异常、Schema 缺失）
- **P2**：可优化项（性能、可读性）
- **P3**：长期积累项（技术债）

### 11.2 与上一版本（vX.Y.Z）的差异摘要

| 维度 | 上一版本 | 本次版本 | 变化 |
|------|---------|---------|------|
| TDK 改动 | — | — | 无 / 列出 |
| URL 数量 | `<填>` | `<填>` | ±N |
| Schema 类型 | `<填>` | `<填>` | ±N |
| 埋点事件数 | `<填>` | `<填>` | ±N |
| 关键词覆盖 | `<填>` | `<填>` | ±N |

### 11.3 下一步行动

- [ ] `<填>`
- [ ] `<填>`

---

## 附：本快照生成命令

```bash
# 改动范围
git log --oneline v上一版本..HEAD
git diff --stat v上一版本..HEAD

# TDK 抓取（手动从 layout.tsx / page.tsx 复制）

# sitemap 当前条目数
curl -s https://svgcodetopng.com/sitemap.xml | grep -c "<loc>"

# 性能（线上）
# PageSpeed Insights: https://pagespeed.web.dev/?url=https://svgcodetopng.com/
```
