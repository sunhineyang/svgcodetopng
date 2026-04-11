# SVG Converter 核心功能埋点方案

## 1. 概述 (Summary)
根据当前网站的实际功能，我们需要监控用户在“输入代码 -> 调整参数 -> 转换 -> 下载/复制”这一核心漏斗中的行为。同时，我们也需要了解用户对多语言、主题等辅助功能的使用情况。

通过实现本方案，我们将能回答以下业务问题：
1. 用户最喜欢转换成哪种格式 (PNG/JPG/GIF)？
2. 用户下载图片的转化率是多少？
3. 哪些语言的切换最频繁？
4. 用户是否经常调整分辨率(Scale)和质量(Quality)？

## 2. 现状分析 (Current State Analysis)
- **已安装**: Google Analytics 4 (GA4) 基础代码已在 `app/layout.tsx` 中集成。
- **缺失**: 没有任何业务逻辑的自定义事件埋点。

## 3. 核心事件字典 (Proposed Event Dictionary)

我们将设计以下自定义事件来追踪用户的核心交互：

| 事件名称 (Event Name) | 触发时机 (Trigger) | 参数 (Parameters) | 业务价值 (Value) |
| :--- | :--- | :--- | :--- |
| `convert_image` | 用户点击“Convert”且转换成功时 | `format` (png/jpg/gif)<br>`scale` (放大倍数)<br>`quality` (质量)<br>`has_bg` (是否有背景色) | 了解用户最常用的导出配置 |
| `download_image` | 用户点击“Download”按钮时 | `format` (png/jpg/gif) | 衡量核心转化率（成功下载） |
| `copy_svg_code` | 用户点击“Copy Code”按钮时 | 无 | 了解复制功能的使用频率 |
| `editor_action` | 用户点击编辑器工具（Clear/Reset） | `action` (clear/reset) | 了解用户如何与代码编辑器交互 |
| `switch_language` | 用户在导航栏切换语言时 | `to_lang` (目标语言代码) | 了解多语言受众分布和偏好 |
| `switch_theme` | 用户切换亮/暗模式时 | `theme` (light/dark) | 了解用户的视觉偏好 |

## 4. 具体实现步骤 (Proposed Changes)

### 第一步：创建全局埋点工具类
**文件**: `utils/analytics.ts` (新建)
**内容**: 封装 `window.gtag` 调用，提供类型安全的埋点函数，确保在 SSR 或无 GA 拦截器的情况下不会报错。
```typescript
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  } else {
    console.warn(`Analytics event tracked (dev): ${eventName}`, eventParams);
  }
};
```

### 第二步：配置全局类型
**文件**: `types/global.d.ts` (新建或添加到现有类型声明)
**内容**: 声明 `window.gtag` 避免 TypeScript 报错。

### 第三步：在核心转换页面集成埋点
**文件**: `app/[locale]/page.tsx` 或 `app/page.tsx` (视主要逻辑所在文件而定)
- **在 `convertToImage` 成功的回调中**: 
  `trackEvent('convert_image', { format: exportSettings.format, scale: exportSettings.scale, quality: exportSettings.quality })`
- **在 `downloadImage` 函数中**: 
  `trackEvent('download_image', { format: exportSettings.format })`
- **在 `copyCode` 函数中**: 
  `trackEvent('copy_svg_code')`
- **在 `clearCode` 和 `resetCode` 中**: 
  `trackEvent('editor_action', { action: 'clear' / 'reset' })`

### 第四步：在辅助组件集成埋点
**文件**: `components/LanguageSwitcher.tsx`
- **在 `switchLanguage` 函数中**:
  `trackEvent('switch_language', { to_lang: newLang })`

**文件**: `components/ThemeToggle.tsx`
- **在 `toggleTheme` 函数中**:
  `trackEvent('switch_theme', { theme: theme === 'dark' ? 'light' : 'dark' })`

## 5. 验证与测试步骤 (Verification)
1. 使用 Trae 启动本地服务器。
2. 打开浏览器的开发者工具 (Network 面板)，过滤 `collect?v=2`（GA4 的请求特征）。
3. 尝试使用上述每一个功能（转换、下载、切换语言等）。
4. 确认每次交互都会发出包含 `en=事件名` 的网络请求。
5. 登录 GA4 控制台的“实时 (Real-time)”面板，检查事件是否正确上报。
