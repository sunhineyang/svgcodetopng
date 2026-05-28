---
name: "new-page-checklist"
description: "Checks all required work when adding or updating a public page. Invoke when creating a new route, landing page, tool page, or localized page."
---

# New Page Checklist

## 适用场景

当出现下面任一情况时，必须调用这个 skill：

- 新增公开页面
- 新增工具页、落地页、营销页、帮助页
- 给已有页面新增多语言版本
- 复制一个旧页面快速做新页面
- 修改页面路由、canonical、metadata、sitemap、结构化数据

不要只盯着页面组件本身。任何一个公开页面，通常至少同时影响：

- 路由
- metadata
- hreflang
- sitemap
- i18n 文案
- layout 继承链
- 结构化数据
- 内链入口
- 回归测试

## 核心原则

### 原则 1：一页多出口

一个页面不是只存在于 `page.tsx`。

它往往会同时出现在这些地方：

1. 页面组件本身
2. `generateMetadata`
3. layout 继承链
4. sitemap
5. robots / canonical / hreflang
6. 语言包
7. 导航、卡片、按钮、交叉推荐入口
8. 结构化数据

只改其中一个，通常是不够的。

### 原则 2：默认英语不是 `/en`

这个项目的默认语言是英语，默认路由就是英文，不要生成 `/en`。

因此所有新增页面都要优先检查：

- 英文 canonical 是否走默认路由
- `x-default` 是否指向英文默认路由
- 其它语言是否走 `/<locale>/...`

### 原则 3：先查“契约”，再查“页面”

如果页面依赖多语言、hooks、API、schema、错误文案，不能只看页面文件。

先找这些契约来源：

- 语言 key 在哪里定义
- 运行时实际读取哪些 key
- sitemap 如何生成
- layout 如何设置 `lang` / `dir`
- 默认语言规则在哪里定义

## 执行步骤

### 第 1 步：先确认页面的真实影响范围

至少搜索这些内容：

```text
路由文件
generateMetadata
alternates / canonical / x-default / hreflang
sitemap
messages/*.json
layout.tsx
导航或入口链接
结构化数据 script
```

如果是复制旧页面做新页面，再额外检查：

- 有没有沿用旧 title / description / keywords
- 有没有沿用错误 canonical
- 有没有沿用不该继承的 schema

### 第 2 步：建立“页面检查矩阵”

为每个新增页面至少列出这 10 项：

1. 路由路径
2. 英文默认地址
3. 非英文地址
4. canonical
5. hreflang + `x-default`
6. sitemap
7. metadata 文案
8. i18n 文案 key
9. 结构化数据
10. 页面入口和回链

如果其中任一项没有落点文件，就继续找，不要假设“应该自动处理了”。

### 第 3 步：检查 SEO 面

每个公开页面默认检查：

- `title`
- `description`
- `keywords`
- canonical
- `alternates.languages`
- `x-default`
- Open Graph
- Twitter Card
- robots

如果站点是多语言，还要检查：

- 默认语言是否错误地做成 `/en`
- 各语言 URL 是否完整
- 页面 metadata 和 sitemap 是否一致

### 第 4 步：检查 i18n 面

新增页面时，不只看“页面文案有没有翻译”，还要看“运行时 key 是否对齐”。

必须核对：

- `en.json` 里有哪些 key
- 其它语言是否一一对应
- hooks / components / utils 实际读了哪些 key
- 是否存在英文兜底误伤用户的问题

尤其注意这三类最容易漏：

1. 错误提示
2. 空状态
3. 按钮 / toast / modal / placeholder

### 第 5 步：检查 layout 和语言方向

如果页面支持多语言，必须确认：

- `<html lang>` 是否正确
- 阿拉伯语这类 RTL 语言是否输出 `dir="rtl"`
- 页面是否依赖根 layout 注入的 header / locale 信息

不要假设页面在某个 locale 路由下，`lang` 和 `dir` 就一定自动正确。

### 第 6 步：检查 sitemap

只要页面是公开可索引页面，就默认检查 sitemap。

必须确认：

- 页面是否被加入 sitemap
- alternate 语言链接是否完整
- `x-default` 是否也同步
- sitemap 和页面 metadata 的 URL 是否一致

### 第 7 步：检查结构化数据

如果页面带有 JSON-LD，必须确认：

- `url` 是否是新页面地址
- `name` / `description` 是否还是旧页面文案
- FAQ / HowTo / WebApplication 类型是否仍然适配该页面
- 不同语言页面是否需要不同文案

### 第 8 步：检查用户入口

新增页面后，确认用户是否真的能到达它：

- 导航
- Footer
- 首页 CTA
- 交叉推荐模块
- 模板卡片 / 工具卡片
- 语言切换后的对应页面

### 第 9 步：验证

最低验证集：

1. `npx next build`
2. 打开英文默认页
3. 打开至少一个非英文页
4. 检查 `<html lang>` 和 `dir`
5. 检查 canonical
6. 检查 hreflang / `x-default`
7. 检查 sitemap
8. 检查控制台错误

如果新增页面含有表单、AI、转换、上传、下载，还要补业务回归。

## 常见漏项清单

下面这些是最容易漏的：

- 只改了页面文件，没改 sitemap
- 只改了英文 metadata，没补其它语言
- 只补了语言包文案，没补运行时需要的 key
- `aiError` 和 `networkError` 这种语义相近的 key 混掉
- 把英文默认路由错误写成 `/en`
- 页面 hreflang 对了，但 sitemap alternate 还是旧的
- 页面支持阿拉伯语，但忘了 `dir="rtl"`
- schema 里的 `url` / `name` / `description` 还是旧页面

## 为什么计划会漏

如果你在复盘一个漏项很多的计划，优先按下面 5 个原因排查：

1. 只围绕“用户看到的页面”思考，没有围绕“系统输出面”思考
2. 只看了 `page.tsx`，没有追到 `layout`、`sitemap`、`messages`、hooks
3. 看到“文案问题”时，只盯翻译文本，没核对运行时 key 契约
4. 以为已有逻辑会自动覆盖新页面，但实际上是每个页面单独写 metadata
5. 没有建立固定检查清单，每次都靠脑子临时想

## 输出模板

当你完成检查后，输出结果必须至少包含：

### 1. 页面范围

- 新增了哪些 URL
- 默认英文 URL 是什么
- 涉及哪些语言

### 2. 影响文件

- 页面文件
- metadata 文件
- sitemap 文件
- messages 文件
- layout / middleware / config 文件

### 3. 必改项

- 哪些是必须改
- 为什么不改会出问题
- 哪些是 SEO 风险
- 哪些是运行时风险

### 4. 验证项

- build
- 浏览器检查
- console
- sitemap
- 多语言切换

## 简版口令

以后只要新增页面，先问自己这 8 句：

1. 页面路由在哪？
2. 英文默认地址对吗？
3. metadata 全了吗？
4. `x-default` 和 hreflang 全了吗？
5. sitemap 加了吗？
6. 文案 key 对齐了吗？
7. `lang` / `dir` 对了吗？
8. build 和页面回归做了吗？

## 示例

### 示例 1：新增工具页

用户说：“新增一个 `json-to-png` 页面。”

你要自动检查：

- `/json-to-png`
- `/<locale>/json-to-png`
- metadata
- alternate languages
- sitemap
- 对应 messages
- schema
- 首页入口

### 示例 2：给已有页面加阿拉伯语

用户说：“给这个页面补阿拉伯语。”

你要自动检查：

- `messages/ar.json` 是否完整
- `lang="ar"` 是否正确
- `dir="rtl"` 是否正确
- 阿拉伯语 metadata 是否单独存在
- hreflang 和 sitemap 是否包含 `ar`

