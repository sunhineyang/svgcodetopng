# 在网站中集成 Adsterra Popunder 广告

## 调研结论与最佳实践

针对 Next.js (App Router) 项目集成 Adsterra Popunder，最佳实践如下：
1. **使用 `next/script` 组件**：这是 Next.js 推荐的方式，可以优化脚本加载顺序，避免阻塞页面渲染。
2. **加载策略 (Strategy)**：建议使用 `afterInteractive`。由于 Popunder 通常是由用户点击触发的，不需要在页面加载的第一时间阻塞渲染，这样可以保持极快的首屏速度。
3. **全语言覆盖**：由于项目采用了多语言路由，我们需要在根布局和语言布局中同时添加，以确保所有页面（如 `/`、`/zh`、`/en` 等）都能加载广告。

## 详细执行计划

### 1. 修改根布局 [app/layout.tsx](file:///Users/y_sunshine/Documents/svgcodetopng/app/layout.tsx)
* 在 `<head>` 标签内（紧随 Google Analytics 脚本之后）添加 Adsterra 脚本。
* 使用 `next/script` 组件并设置 `strategy="afterInteractive"`。

### 2. 修改语言布局 [app/[locale]/layout.tsx](file:///Users/y_sunshine/Documents/svgcodetopng/app/%5Blocale%5D/layout.tsx)
* 同样在 `<head>` 标签内添加该脚本，确保通过语言路径访问的用户也能看到广告。

### 3. 代码实现细节
```tsx
<Script
  src="https://pl28593994.effectivegatecpm.com/80/29/dd/8029dd06a3e4c3c6ae68f72715059ae7.js"
  strategy="afterInteractive"
/>
```

## 预期效果
* 广告脚本将在页面互动后异步加载，不影响 SEO 和首屏性能。
* 全站（所有语言、所有页面）均会生效。
* 符合 Adsterra “每页一个 Popunder” 的建议。

请确认以上方案，确认后我将立即开始实施。