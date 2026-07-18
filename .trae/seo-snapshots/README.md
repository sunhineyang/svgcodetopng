# SEO 版本快照（SEO Snapshots）

> 每次网站迭代时按统一大纲生成的 SEO 检查快照，沉淀下来用于跨版本对比。

---

## 📌 这是什么

这是一个**版本化的 SEO 检查记录系统**。每次网站发版（功能迭代 / SEO 专项 / 紧急修复），都在 `snapshots/` 目录下生成一份快照文件，记录当时的 SEO 全貌。

**价值**：
- 🔍 **可追溯**：任何一次 SEO 排名波动，都能找到对应版本的快照定位原因
- 📊 **可对比**：跨版本看 TDK / 关键词 / URL 结构的演化路径
- 🧯 **可兜底**：发现某次改动导致 SEO 退化时，能快速回滚到上一个健康的快照
- 📚 **可沉淀**：把每次的检查经验固化下来，避免重复踩坑

---

## 📂 目录结构

```
.trae/seo-snapshots/
├── README.md                          # 你正在看的这个文件（大纲定义 + 使用说明）
├── TEMPLATE.md                        # 空白快照模板（复制它开始写新快照）
├── CHANGELOG.md                       # 跨版本对比索引（每版一句话总结）
└── snapshots/
    ├── v1.0.0-base-2026-07-18.md      # 第一份基线快照
    ├── v1.1.0-xxx-2026-xx-xx.md       # 后续每次迭代
    └── ...
```

---

## 📋 快照大纲（11 章）

每份快照都按以下 11 章填写，缺项就写 `N/A` 或 `待补充`，**不要删章节**：

| # | 章节 | 沉淀什么 | 数据来源 |
|---|------|---------|---------|
| 1 | 快照元信息 | 版本号 / commit hash / 日期 / 触发原因 / 责任人 | git + 手填 |
| 2 | 改动范围 | 本次 SEO 相关文件清单 + 分类 | `git diff <上一版本tag>..HEAD` |
| 3 | TDK 快照 | 每页面 × 每语言的 title/description/keywords | 自动抓取 page.tsx |
| 4 | URL & 路由结构 | 总 URL 数、路由清单、sitemap 当前条目数 | sitemap.ts |
| 5 | 多语言 SEO | hreflang 完整性、canonical、`<html lang>`、RTL 处理 | 手动 + 自动 |
| 6 | 结构化数据 | JSON-LD 类型清单、是否过 Rich Results Test | page.tsx + Google 测试工具 |
| 7 | 技术 SEO | robots.txt / sitemap / OG / Twitter Card / favicon / llms.txt | 各配置文件 |
| 8 | 页面性能 | LCP / CLS / 关键图片 / 字体（线上有数据时填） | PageSpeed Insights |
| 9 | 内容 SEO | 主关键词密度、H1/H2 结构、img alt、内链 | 手动抽检 |
| 10 | 埋点 & 转化 | GA4 事件埋点变化、转化漏斗完整性 | analytics.ts |
| 11 | 风险 & 对比 | 本次问题清单（带优先级）+ 与上版的差异摘要 | 综合 |

---

## 🚀 怎么用

### 场景 1：发布新版本时生成快照

```bash
# 1. 确认本次版本号（语义化版本）
#    major.minor.patch，例如 1.1.0

# 2. 复制模板
cp .trae/seo-snapshots/TEMPLATE.md \
   .trae/seo-snapshots/snapshots/v1.1.0-{简短标识}-2026-07-25.md

# 3. 跑 git 命令拿改动范围（章节 2）
git log --oneline v1.0.0..HEAD
git diff --stat v1.0.0..HEAD -- 'app/**' 'config/**' '*.ts' '*.tsx'

# 4. 按模板填章节 1-11（每章顶部都有填写指引）

# 5. 在 CHANGELOG.md 顶部追加一行（版本 / 日期 / 一句话总结）

# 6. 提交：git add .trae/seo-snapshots/ && git commit
```

### 场景 2：对比两个版本的 SEO 变化

```bash
# 用 diff 直接对比两份快照
diff .trae/seo-snapshots/snapshots/v1.0.0-*.md \
     .trae/seo-snapshots/snapshots/v1.1.0-*.md

# 或在 CHANGELOG.md 里看跨版本的一句话总结
```

### 场景 3：定位 SEO 排名波动

1. 在 Google Search Console / GA4 看到某天排名/流量掉
2. 找到那天前最近的快照和之后的快照
3. 对比章节 3（TDK）/ 章节 5（多语言）/ 章节 9（关键词密度）
4. 找出哪个 SEO 维度被动了 → 定位到对应 commit → 决定是否回滚

---

## 📐 命名规则

**格式**：`v{语义化版本}-{简短标识}-{YYYY-MM-DD}.md`

**例子**：
- `v1.0.0-base-2026-07-18.md`（初始基线）
- `v1.1.0-add-pdf-export-2026-07-25.md`（新增 PDF 导出）
- `v1.0.1-fix-canonical-bug-2026-07-20.md`（修复 canonical bug）
- `v2.0.0-redesign-2026-09-01.md`（大改版）

**标识规则**：
- 全小写、连字符分隔
- 用动词+名词（`add-xxx` / `fix-xxx` / `redesign` / `refactor`）
- 不超过 25 个字符

---

## 🔖 版本号管理

**对齐 `package.json` 的 version 字段**，遵循 [语义化版本](https://semver.org/lang/zh-CN/)：

| 改动类型 | 版本升级 | 例子 |
|---------|---------|------|
| 🔴 Major（不兼容改动） | `1.0.0` → `2.0.0` | 改 URL 结构、删页面、换域名 |
| 🟡 Minor（向后兼容新功能） | `1.0.0` → `1.1.0` | 新增页面、新增语言、新增导出格式 |
| 🟢 Patch（向后兼容 bug 修复） | `1.0.0` → `1.0.1` | 修 TDK typo、修 canonical、修 hreflang |

**发布流程**：
1. 改 `package.json` 的 `version`
2. `git commit -m "chore: bump version to x.y.z"`
3. `git tag vx.y.z`
4. 生成对应版本的 SEO 快照

---

## ⚠️ 重要原则

1. **快照不可改**：发布后不再修改历史快照（除非有明确勘误）。新版本就写新文件。
2. **章节不可删**：即使本次某章节没改动，也要保留章节标题，内容写「无变化」。
3. **TDK 必须全量记录**：章节 3 即使没改也要全文复制一份（方便对比）。
4. **CHANGELOG 必须更新**：每生成一份新快照，都要在 CHANGELOG 顶部加一行索引。
5. **风险必带优先级**：章节 11 的每个问题都要标 `P0/P1/P2/P3`，便于排期。

---

## 🔗 相关文档

- 项目根目录的 [SEO_IMPLEMENTATION.md](../../docs/SEO_IMPLEMENTATION.md)：SEO 实现总览
- `.trae/documents/` 下的 SEO 审计/方案文档：一次性深度检查的产出
- 本目录的 [TEMPLATE.md](./TEMPLATE.md)：写新快照的起点
- 本目录的 [CHANGELOG.md](./CHANGELOG.md)：跨版本对比索引
