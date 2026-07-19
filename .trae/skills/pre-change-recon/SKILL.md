---
name: "pre-change-recon"
description: "Code change pre-flight checklist. Invoke BEFORE editing any file when user mentions a page/feature/section, to verify the exact route→component mapping and avoid editing the wrong file."
---

# Pre-Change Recon (改动前侦察)

## 痛点来源

反复把"首页核心功能"的改动错做进了子页组件 `components/CodeToPngConverter.tsx`，原因是凭"组件名听起来像主转换器"就动手，没有先验证 URL → page.tsx → 实际渲染组件的映射关系。

**血的教训**：在 Next.js + next-intl 项目里，一个功能可能同时存在于：
- 首页 `app/[locale]/page.tsx` 内联的 `HomePageContent`
- 子页 `app/[locale]/code-to-png/page.tsx` 引用的 `components/CodeToPngConverter.tsx`
- 其他相似命名组件

**不读代码就猜 = 100% 翻车。**

## 根因复盘（2026-07 真实事故）

用户反馈"你已经改了很多次了，每次都去改子页面，没搞懂为什么，一定是因为是不是你提前读的东西有问题"。grep 之后真相浮出水面：

| 现象 | 数据 | 后果 |
|------|------|------|
| `HomePageContent` 是内联未 export 组件 | 全项目仅出现 1 次，且在 `app/[locale]/page.tsx` 内部 | 按名字模糊搜索**永远搜不到**首页核心 |
| `CodeToPngConverter` 名字响亮且被 import | 在 4 个文件出现 | 模糊搜索"转换器"必中此文件 |
| 转换器相关代码两份几乎一样多 | 子页 99 处 vs 首页 108 处 | 光看代码量分不出主次 |
| `.trae/documents/code-to-png-page-plan.md` 标题误导 | 标题像在说子页，内容却写"主页 SVG 转换器在 app/[locale]/page.tsx" | 看标题就开工 → 100% 走偏 |

**核心教训：**
1. **不能凭文档/组件名字猜** —— 必须先 grep 确认功能在几个文件出现
2. **不能凭代码量分主次** —— 两份副本可能是历史遗留，用户口头说的"主功能"才是真相
3. **陷阱文档要先识别** —— 任何 `xxx-page-plan.md` 标题里的 "xxx" 不等于 URL 路径，必须打开看正文

## 何时调用

必调场景：
- 用户说"改 XX 页面" / "改首页的 XX 功能" / "优化 XX 模块"
- 用户说"我们的核心功能" / "主页" / "landing page" 等模糊指向
- 你准备打开一个 `.tsx` 文件准备编辑之前
- 第 N 次改同一个功能时（防止漂移到错误文件）

不要调：
- 用户明确给了完整文件路径
- 用户只让你读文件、不改文件
- 单纯的配置修改（package.json、tsconfig 等）

## 5 步预检清单

### Step 0：开工前必修 grep（最高优先级，跳过 = 必翻车）

在打开任何 .tsx 文件之前，**必须**先用 grep 搜索用户提到的功能关键词，看它在几个文件出现：

```bash
# 例 1：用户说"改转换器的导出功能"
grep -rn "convertToImage\|downloadFormat\|exportSettings" app/ components/

# 例 2：用户说"改 Settings 面板"
grep -rn "Settings\|exportSettings" app/ components/

# 例 3：用户说"改首页 hero"
grep -rn "Hero\|hero" app/ components/
```

**判断规则：**

| grep 结果 | 含义 | 动作 |
|----------|------|------|
| 只在 1 个文件命中 | 单一来源，安全 | 可直接打开该文件 |
| **在 ≥2 个文件命中** | **代码有副本！** | **必须问用户改哪一份，禁止自己决定** |
| 0 命中 | 关键词不对 | 换关键词再 grep（用 UI 上看到的英文文案） |

**真实教训**：转换器功能 grep 后在 `components/CodeToPngConverter.tsx`（99 处）和 `app/[locale]/page.tsx`（108 处）都命中，且 `CodeToPngConverter` 名字更显眼 → 容易自动选子页。**正确做法是问用户"两个文件都有，你要改哪个？"**

### Step 1：把用户的自然语言落到具体路由

用户说"首页"→ 你要问清楚：
- 是 `/`（根）还是 `/en`、`/zh` 等本地化根路径？
- 是 landing page 还是 converter 主入口？

用户说"那个功能"→ 你要问：
- 在哪个页面看到的？（让用户给 URL 或截图）
- 是 hero 区？Settings 面板？下载区？

**红线**：用户没确认路由前，禁止打开任何 .tsx 准备改。

### Step 2：建立 URL → 组件映射表

在动手前，用 LS / Read 扫一遍 `app/` 目录，画出映射：

```
URL 路径                    → page.tsx                     → 实际渲染组件
─────────────────────────────────────────────────────────────────────
/                          → app/page.tsx (redirect)      → app/[locale]/page.tsx
/en, /zh, /ja ...          → app/[locale]/page.tsx        → 内联 HomePageContent ⭐
/code-to-png               → app/[locale]/code-to-png/... → components/CodeToPngConverter.tsx
/api/ai                    → app/api/ai/route.ts          → (API, 无 UI)
```

**关键检查点**：
1. 根路径 `app/page.tsx` 是不是 redirect？redirect 到哪？
2. `[locale]` 动态段下有几个 page.tsx？哪个是首页？
3. 首页的 page.tsx 是内联组件还是 import 外部组件？

### Step 3：用 grep 二次确认（防止映射表猜错）

```bash
# 确认某个功能在哪几个文件出现
grep -rn "某个独特的字符串" app/ components/

# 例如确认"导出按钮"在哪：
grep -rn "convertToImage\|exportSettings" app/ components/
```

如果一个功能在 N 个文件都出现，**说明这个项目有代码重复**，用户说"改这个功能"时必须问"改哪个副本"。

### Step 4：把映射表给用户看，明确确认

输出格式：

```
我准备改：app/[locale]/page.tsx 里的 HomePageContent（首页核心）
不准备改：components/CodeToPngConverter.tsx（/code-to-png 子页）
请确认这个目标对吗？
```

**红线**：用户没说"对/确认/Yes"之前，禁止开始编辑。

### Step 5：改完后用 OpenPreview 让用户浏览器核对

改完后不要只跑 build，必须：
1. `OpenPreview` 打开用户最初指的那个 URL（不是你猜的）
2. 告诉用户："请打开 [URL]，点 [具体位置] 看看 [具体效果] 对不对"
3. 等用户在浏览器里核对完再继续

## 反面案例（禁止做的事）

❌ "CodeToPngConverter 听起来就是主转换器，改它"
❌ "我之前改过 components/X.tsx，这次也改它"
❌ "app 目录结构我大概记得"
❌ 不读 app/page.tsx 就开始改
❌ 改完只跑 build，不让用户浏览器核对
❌ 看到 `.trae/documents/xxx-page-plan.md` 就以为功能在 `/xxx` 路由（标题 ≠ URL，必须看正文）
❌ grep 出 ≥2 个文件命中后不问用户、自己拍板选一个
❌ 凭"哪个文件代码量大"判断主次（两份副本可能一样大）

## 正面案例

✅ "你说的是首页，我先看一下 app/page.tsx 和 app/[locale]/page.tsx 的关系"
✅ "我看到首页和 /code-to-png 子页都有 Settings 面板，你要改哪个？"
✅ "改完了我打开 http://localhost:3001/en，你看看 Settings 里的 2x 按钮对不对"

## 输出格式

预检完成后，输出一个简短的确认块：

```
📍 改动目标确认
- 路由：/en（首页，[locale] 动态段）
- 文件：app/[locale]/page.tsx
- 组件：HomePageContent（内联在第 X 行）
- 不改动：components/CodeToPngConverter.tsx（/code-to-png 子页独立组件）
```

用户确认后再动手。
