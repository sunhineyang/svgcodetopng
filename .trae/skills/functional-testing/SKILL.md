---
name: "functional-testing"
description: "Systematic functional testing for Next.js web apps with Playwright. Invoke when deploying, after bug fixes, before release, or when user asks to test pages, APIs, database writes, i18n, or SEO elements."
---

# Functional Testing

## 适用场景

当出现下面任一情况时，必须调用这个 skill：

- 准备上线或发布新版本
- 修复了 bug，需要回归验证
- 新增了页面或功能，需要全面验证
- 用户要求测试某个功能（API、数据库写入、多语言、SEO）
- 需要确认 Supabase 数据表能否正常写入
- 多语言站点需要验证各语言版本

## 核心原则

### 原则 1：测试不是"打开看看"

功能测试必须覆盖完整的用户路径，不只是"页面能不能打开"。
每个页面至少验证：页面加载 → 交互操作 → 数据流向 → 控制台干净。

### 原则 2：先启动、再测试、最后出报告

1. 启动 dev server（注意端口冲突）
2. 按模块逐项测试
3. 汇总所有问题为一份测试报告

### 原则 3：控制台是第二双眼睛

很多 bug 不在页面上可见，但在控制台有警告或错误。
每次测试一个页面后，必须检查 console logs。

### 原则 4：改了代码必须回归

修复 bug 后不能只验证那个 bug，还要确认：
- build 通过
- 相关页面没有新错误
- 之前正常的功能没有被破坏

## 执行步骤

### 第 1 步：环境准备

```text
1. 确认 dev server 没有运行：lsof -ti:3000 | xargs kill -9
2. 启动 dev server：npm run dev
3. 等待 "Ready in" 出现
4. 用 Playwright navigate 到首页确认能打开
```

注意：
- 如果端口被占用，先 kill 再启动
- HMR 缓存可能导致旧代码残留，改完 bug 后建议重启 server

### 第 2 步：核心功能测试

对每个主要功能页面，至少验证：

| 测试项 | 方法 |
|--------|------|
| 页面加载 | navigate + screenshot |
| 核心交互 | 点击关键按钮、填写输入框 |
| 结果输出 | 验证转换/计算/生成结果是否出现 |
| 设置面板 | 展开/折叠、切换选项、验证变化生效 |

用 Playwright 的 `click`、`fill`、`screenshot` 来验证。

### 第 3 步：数据库写入测试

对每个有数据写入的 API 路由，必须测试：

#### 3.1 正常写入

```javascript
const formData = new FormData();
formData.append('field1', 'value1');
formData.append('field2', 'value2');

const res = await fetch('/api/your-endpoint', {
  method: 'POST',
  body: formData
});
const data = await res.json();
console.log('Status:', res.status, 'Response:', JSON.stringify(data));
```

验证点：
- 返回状态码 200
- 返回数据包含成功标识（如 `{ ok: true, id: "..." }`）
- 如果有文件上传字段，附带真实文件测试

#### 3.2 边界验证

对 API 至少测试这些边界情况：

| 场景 | 预期 |
|------|------|
| 缺少必填字段 | 400 + 具体错误信息 |
| 非法参数值 | 400 + invalid_xxx |
| 文件过大 | 400 + file_too_large |
| 文件类型不对 | 400 + invalid_file_type |
| 空请求体 | 400 + invalid_payload |

用 `playwright_evaluate` + `fetch()` 来测试。

### 第 4 步：多语言测试

选择 3-5 个代表性语言（建议：中文 zh、阿拉伯语 ar、英语 en + 1-2 个其他）。

对每种语言验证：

| 检查项 | 方法 |
|--------|------|
| 页面能正常打开 | navigate 到 `/<locale>/` |
| `<html lang>` 正确 | `document.documentElement.lang` |
| RTL 语言有 `dir="rtl"` | `document.documentElement.dir`（ar 必须是 rtl） |
| 页面文案已翻译 | screenshot + get_visible_text |
| Footer/导航翻译完整 | 特别检查之前硬编码的文本 |
| 切换语言后功能正常 | 核心交互在非英语下也能工作 |

### 第 5 步：SEO 元素验证

用 `playwright_evaluate` 检查以下 SEO 元素：

#### 5.1 hreflang

```javascript
const links = Array.from(document.querySelectorAll('link[rel="alternate"]'));
const hreflangs = links.map(l => ({ hreflang: l.getAttribute('hreflang'), href: l.getAttribute('href') }));
JSON.stringify(hreflangs);
```

验证点：
- 数量是否覆盖所有支持语言
- 是否有 `x-default`
- `x-default` 是否指向英文默认路由（非 `/en`）
- 每个语言 URL 格式是否正确

#### 5.2 Canonical

```javascript
document.querySelector('link[rel="canonical"]')?.getAttribute('href');
```

#### 5.3 Open Graph / Twitter Card

```javascript
const og = {};
document.querySelectorAll('meta[property^="og:"]').forEach(m => og[m.getAttribute('property')] = m.getAttribute('content'));
document.querySelectorAll('meta[name^="twitter:"]').forEach(m => og[m.getAttribute('name')] = m.getAttribute('content'));
JSON.stringify(og);
```

#### 5.4 JSON-LD 结构化数据

```javascript
JSON.parse(document.querySelector('script[type="application/ld+json"]')?.textContent || 'null');
```

#### 5.5 sitemap.xml

navigate 到 `/sitemap.xml`，验证：
- 包含所有公开页面 URL
- 每个页面有 alternate 语言链接
- URL 格式正确

#### 5.6 robots.txt

navigate 到 `/robots.txt`，验证：
- Allow/Disallow 规则合理
- Sitemap 指向正确地址

### 第 6 步：控制台错误监控

每个关键页面测试后执行：

```javascript
// 用 playwright_console_logs 工具
// search: "error" 或 "warning" 或 "MISSING_MESSAGE" 或 "did not match"
```

重点关注：
- `IntlError: MISSING_MESSAGE` → i18n key 缺失
- `did not match` → React Hydration 不匹配
- `Failed to load resource` → 资源加载失败（区分第一方和第三方）
- `Warning:` → React/Next.js 警告

注意：第三方广告/分析脚本（如 `effectivegatecpm.com`）的 403 错误通常不是代码 bug。

### 第 7 步：回归验证（修 bug 后必须做）

修复 bug 后执行：

1. `npx next build` — 确认构建无错误
2. 重启 dev server（避免 HMR 缓存）
3. 回到之前报 bug 的页面验证已修复
4. 检查控制台确认相关错误已消失
5. 测试一个其他页面确认没有引入新问题

## 常见 Bug 模式

以下是 Next.js + next-intl + Supabase 项目中最常出现的问题：

| 模式 | 症状 | 排查方向 |
|------|------|----------|
| 死代码调用 `_t.raw('')` | IntlError 控制台疯狂刷 | 搜索 `_t.raw('')` 或空字符串 key |
| SSR 用了 `window.location` | Hydration mismatch | 换用 `useLocale()` |
| 硬编码英文文本 | 非英语页面出现英文 | 搜索组件中的裸英文字符串 |
| `locale` 变量定义但未使用 | 可能触发 IntlError | 检查变量是否被引用 |
| API 返回 400 | 边界验证不通过 | 检查 route handler 的验证逻辑 |
| HMR 缓存旧代码 | 改了但没生效 | 重启 dev server |

## 输出模板

测试完成后，输出一份结构化测试报告：

```markdown
# 功能测试报告

日期：YYYY-MM-DD
环境：localhost / production

## 测试概览

| 类别 | 通过 | 失败 | 跳过 |
|------|------|------|------|
| 核心功能 | x | x | x |
| 数据库写入 | x | x | x |
| API 边界验证 | x | x | x |
| 多语言 | x | x | x |
| SEO | x | x | x |
| 控制台 | x | x | x |

## 发现的问题

### BUG-N: 问题标题
- 严重级别：Critical / Major / Minor
- 复现步骤：...
- 根因分析：...
- 修复方案：...
- 验证结果：✅ 已修复 / ❌ 待修复

## 回归测试

- [ ] `npx next build` 通过
- [ ] 修复页面验证通过
- [ ] 控制台无新增错误
- [ ] 其他页面未受影响
```

## 简版口令

以后做功能测试时，按这个顺序走：

1. **起服务** — 启动 dev server
2. **测功能** — 核心页面 + 交互
3. **写数据** — API 正常写入 + 边界验证
4. **换语言** — 3-5 个语言 + lang/dir/翻译
5. **查 SEO** — hreflang/canonical/OG/sitemap/robots/JSON-LD
6. **看控制台** — 错误/警告/MISSING_MESSAGE
7. **改了回归** — build + 重启 + 复验 + 旁验
8. **出报告** — 结构化汇总

## 测试优先级

如果时间有限，按以下优先级裁剪：

| 优先级 | 必须测 | 有空再测 |
|--------|--------|----------|
| P0 | 页面加载、核心交互、API 写入 | 全部 SEO 元素 |
| P1 | 控制台错误、多语言 lang/dir | 全部 API 边界 |
| P2 | hreflang/canonical/sitemap | JSON-LD、OG/Twitter |
| P3 | 全语言覆盖 | robots.txt |
