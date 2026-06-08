# SVGCodeToPNG 核心导出功能迭代 - 架构与技术实现方案 (Tech Design)

## 1. 架构目标与现状分析

### 1.1 当前架构现状
- **核心组件**：`components/CodeToPngConverter.tsx`
- **状态管理**：使用 React `useState` 集中管理 `svgCode`, `exportSettings`, `activeTab` 等。
- **渲染方案**：
  - SVG 渲染：依赖浏览器原生的 `<img src="blob:...">` 配合 `CanvasRenderingContext2D.drawImage`。
  - HTML 渲染：依赖 `html2canvas`。
  - 动图/PDF：依赖 `gif.js` (含 Web Worker) 和 `jspdf`。
- **痛点**：原生 Canvas 在处理 SVG 的 `<foreignObject>`、复杂 CSS 渐变、外部字体时容易失败或变糊。所有逻辑耦合在一个近 1000 行的大组件中。

### 1.2 架构演进目标
- **解耦**：将渲染引擎、优化逻辑从 UI 组件中抽离为独立的 Services 或 Custom Hooks。
- **高性能**：引入 WebAssembly (Wasm) 处理密集型计算，避免阻塞 React 主线程。
- **健壮性**：增加前端代码诊断（Linter），提供更明确的错误边界。

---

## 2. 核心功能技术拆解

### P0-1 高质量导出引擎 (resvg-wasm)
**【技术选型】** `@resvg/resvg-wasm` (Rust 编译的 WebAssembly 模块)
**【实现方案】**
1. **Wasm 初始化**：
   - 在应用启动或进入 Converter 页面时，异步加载并初始化 `resvg.wasm` 二进制文件。
   - 需要配置 Next.js 的 `next.config.js`，允许 served wasm 文件，或将 wasm 文件放置在 `public/` 目录下。
2. **渲染逻辑封装 (`utils/svg-renderer.ts`)**：
   ```typescript
   import { renderAsync, initWasm } from '@resvg/resvg-wasm';
   
   export async function renderSvgToBitmap(svgString: string, options: { width?: number, fitTo?: number }): Promise<Uint8Array> {
     // 1. Ensure Wasm is initialized
     // 2. Call resvg render
     const resvg = new Resvg(svgString, {
       fitTo: options.fitTo ? { mode: 'width', value: options.fitTo } : undefined,
     });
     const image = resvg.render();
     return image.asPng(); // Returns PNG buffer
   }
   ```
3. **集成与降级**：
   - 在 `CodeToPngConverter.tsx` 的 `convertSvgToImage` 函数中，优先调用 `renderSvgToBitmap`。
   - 如果抛出异常（例如 Wasm 不兼容），`catch` 块中回退到现有的 `DOMParser -> Image -> Canvas` 链路。

### P0-2 便捷导出预设 + 一键多尺寸 (Batch Export)
**【技术选型】** `jszip` + FileSaver.js (或原生 `<a>` 标签)
**【实现方案】**
1. **状态扩展**：
   - 扩展 `ExportSettings`，增加一个 `presets` 数组，或者在 UI 层处理。
2. **并发渲染控制**：
   - 编写一个批量导出函数 `handleBatchExport`。
   - 使用 `Promise.all`（针对并发小任务）或异步队列（避免内存溢出），遍历所需的尺寸 `[32, 128, 512, 1024]`，调用渲染引擎。
3. **ZIP 打包**：
   ```typescript
   import JSZip from 'jszip';
   
   const zip = new JSZip();
   // 伪代码
   for (const size of sizes) {
      const blob = await renderForSize(size);
      zip.file(`icon_${size}x${size}.png`, blob);
   }
   const content = await zip.generateAsync({ type: 'blob' });
   // 触发下载
   ```

### P0-3 导出前智能优化 (SVGO 集成)
**【技术选型】** `svgo/dist/svgo.browser.js`
**【实现方案】**
1. **依赖引入**：安装 `svgo`，并在客户端引入其 browser build。注意 Next.js SSR 需要将其动态导入（Dynamic Import）或在 `useEffect` 中使用。
2. **封装 Hook (`hooks/useSvgOptimizer.ts`)**：
   ```typescript
   import { optimize } from 'svgo/dist/svgo.browser.js';
   
   export const optimizeSvg = (code: string) => {
     try {
       const result = optimize(code, {
         multipass: true,
         plugins: [
           'preset-default',
           'removeDimensions', // 可选，视具体产品需求
           'prefixIds'
         ]
       });
       return result.data;
     } catch (e) {
       console.error(e);
       return code; // 失败时返回原代码，保证非破坏性
     }
   };
   ```
3. **与现有 UI 结合**：绑定到编辑器工具栏的 ✨ 按钮，点击时调用 `setSvgCode(optimizeSvg(svgCode))`。

### P0-4 导出错误诊断与修复建议
**【技术选型】** 正则表达式 + DOMParser Linter
**【实现方案】**
1. **诊断器封装 (`utils/svg-linter.ts`)**：
   - 监听 `svgCode` 的变化（使用 `useDebounce` 防抖，延迟约 500ms）。
   - 检查规则：
     - `/<foreignObject/i.test(code)` -> 警告：Canvas/resvg 可能无法渲染外部 HTML。
     - `/<image[^>]*href=["']http/i.test(code)` -> 警告：跨域图片将污染 Canvas 导致 `toBlob` 抛出 Security Error。
     - `xmlns` 缺失检查。
2. **状态注入**：
   - 组件内新增状态 `const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);`
   - 将诊断结果映射到 UI 的 ⚠️ 提示上。
   - `handleConvert` 时，主动校验 CORS 图片。如果是 Canvas 模式，自动尝试将外部图片替换为 Base64（如果需要做深度修复），或者直接拦截抛出易读的错误信息 `setConvertError('CORS Image detected...')`。

---

## 3. 演进路线与重构建议 (Refactoring)
鉴于 `CodeToPngConverter.tsx` 已经接近 1000 行，在接入这 4 个新功能之前或同时，**强烈建议**进行以下轻量级重构：
1. **抽离颜色逻辑**：将 104-152 行的颜色提取、映射逻辑，以及渲染颜色面板的 JSX，抽离为 `<ColorSettingsPanel />` 和 `useSvgColors` hook。
2. **抽离导出逻辑**：将 `convertSvgToImage`、`convertHtmlToImage`、`downloadImage` 抽离为 `useExportEngine` hook。
3. **i18n 规范**：新功能的文案（如 "HD Render", "Batch Export", "Optimize"）必须同步写入 `messages/en.json`。
