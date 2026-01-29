# 在网站中集成 Adsterra Social Bar 广告

## 目标
按照 Adsterra 的要求，在 `</body>` 标签闭合前加入 Social Bar 广告脚本。

## 调研结论与最佳实践
1. **放置位置**：Adsterra 要求放在 `</body>` 闭合前。在 Next.js 中，我们可以将脚本放在布局文件（Layout）的 `<body>` 标签内的最后。
2. **使用 `next/script` 组件**：
   - 使用 `strategy="lazyOnload"`：Social Bar 属于次要内容，不应影响页面的首屏加载和核心功能（SVG 转换）。使用 `lazyOnload` 可以在浏览器空闲时加载，对性能最友好。
3. **全语言覆盖**：同样需要在根布局和语言布局中同时添加。

## 详细执行计划

### 1. 修改根布局 [app/layout.tsx](file:///Users/y_sunshine/Documents/svgcodetopng/app/layout.tsx)
* 在 `<body>` 标签闭合前（即 `{children}` 之后）添加 Adsterra Social Bar 脚本。

### 2. 修改语言布局 [app/[locale]/layout.tsx](file:///Users/y_sunshine/Documents/svgcodetopng/app/%5Blocale%5D/layout.tsx)
* 在 `<body>` 标签闭合前添加该脚本。

### 3. 代码实现细节
```tsx
{/* Adsterra Social Bar */}
<Script
  src="https://pl28593999.effectivegatecpm.com/30/de/85/30de85869b1f125809c7c4f10d85b458.js"
  strategy="lazyOnload"
/>
```

## 预期效果
* Social Bar 将在页面完全加载后的空闲时间异步加载。
* 脚本位置符合 Adsterra 的“</body> 闭合前”要求。
* 全站所有页面均会生效。

请确认以上方案，确认后我将立即开始实施。