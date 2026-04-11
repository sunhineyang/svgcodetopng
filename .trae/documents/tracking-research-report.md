# 埋点调研报告与实现方案

## 1. 现状分析
目前代码库中已经集成了 **Google Analytics 4 (GA4)**，但仅限于基础的自动收集事件，尚未实现业务逻辑相关的自定义埋点。

### 核心集成点
- **文件位置**: [layout.tsx](file:///Users/y_sunshine/Documents/svgcodetopng/app/layout.tsx#L87-L99)
- **集成方式**: 使用 `next/script` 加载 `gtag.js`，并初始化了 Measurement ID `G-5RPN0F4G3Y`。
- **自动收集**: GA4 已经能够自动记录 `page_view` (页面浏览)、`session_start` (会话开始)、`first_visit` (首次访问) 等基础数据。

## 2. 问题回答：直接加代码 GA4 能收到吗？
**是的，可以直接收到。**

由于 `gtag` 已经在根布局中全局初始化，你可以在任何 **客户端组件 (Client Components)** 中通过 `window.gtag` 直接发送事件。

### 示例代码：
```javascript
if (typeof window !== 'undefined' && window.gtag) {
  window.gtag('event', 'button_click', {
    'event_category': 'engagement',
    'event_label': 'convert_button'
  });
}
```

## 3. 拟改进方案与最佳实践

为了提高代码的可维护性和 TypeScript 的类型支持，建议进行以下优化：

### 步骤 A：声明全局类型
在 `next-env.d.ts` 或新创建的 `types/global.d.ts` 中声明 `gtag` 类型，避免 TS 报错。

### 步骤 B：封装埋点工具类 (Utility)
创建一个简单的工具函数，统一管理埋点逻辑，方便后续替换或扩展。

### 步骤 C：在核心业务逻辑中添加埋点
建议在以下关键位置添加埋点：
1. **SVG 转换成功**: 在 `convertToImage` 函数成功生成预览图后。
2. **图片下载**: 在 `downloadImage` 函数触发时。
3. **代码复制**: 在 `copyCode` 函数触发时。

## 4. 验证步骤
1. 在本地开发环境调用埋点代码。
2. 登录 [Google Analytics 控制台](https://analytics.google.com/)。
3. 进入 **"实时 (Real-time)"** 报告视图。
4. 观察 **"事件 (Events)"** 卡片中是否出现了对应的事件名称。

---
**注意**: 由于默认域名下是英语且无 `/en` 后缀，埋点数据将统一汇总，可以根据 GA4 自带的 `page_location` 维度来区分不同语言路径（如 `/ko`, `/ja`）的用户行为。
