# 优化广告集成并修复 HTML 结构

## 问题诊断
1. **代码重复**：广告脚本在根布局 `app/layout.tsx` 和语言布局 `app/[locale]/layout.tsx` 中同时存在，导致重复加载，可能触发广告平台的防作弊拦截。
2. **非法 HTML 嵌套**：`app/[locale]/layout.tsx` 错误地包含了 `<html>`、`<head>` 和 `<body>` 标签。在 Next.js 中，子布局不应包含这些标签，否则会导致 DOM 结构混乱。

## 修复计划

### 1. 清理语言布局 [app/[locale]/layout.tsx](file:///Users/y_sunshine/Documents/svgcodetopng/app/%5Blocale%5D/layout.tsx)
* 移除所有 `<html>`, `<head>`, `<body>` 标签。
* 移除所有重复的 `<Script>` 脚本（包括 Google Analytics 和 Adsterra）。
* 仅保留必要的 Provider 包装逻辑。

### 2. 验证根布局 [app/layout.tsx](file:///Users/y_sunshine/Documents/svgcodetopng/app/layout.tsx)
* 确保根布局中已包含所有必要的脚本：
  - Google Analytics (in head)
  - Adsterra Popunder (in head)
  - Adsterra Social Bar (before body closing)

### 3. 构建与部署
* 执行 `npm run build` 确保没有编译错误。
* 提交代码并推送到远程仓库，触发生产环境更新。

## 预期效果
* 广告脚本全站唯一加载，消除重复加载导致的屏蔽风险。
* HTML 结构恢复标准，提升浏览器解析效率和稳定性。
* 广告显示成功率将显著提高。

确认后我将立即开始执行。