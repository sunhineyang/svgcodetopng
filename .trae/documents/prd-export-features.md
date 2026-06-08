# SVGCodeToPNG 核心导出功能迭代 - 产品设计与交互规范 (PRD)

## 1. 文档概述
本文档旨在为 SVGCodeToPNG 网站未来最核心的 4 个导出迭代功能（P0-1 至 P0-4）提供清晰的产品设计指引。
核心原则是：**在不破坏现有直观交互（左右双栏：编辑器 + 预览/设置）的前提下，通过渐进式披露（Progressive Disclosure）的方式，将更强大的能力无缝融入当前的工作流中。**

---

## 2. 详细功能拆解与交互规范

### P0-1 高质量导出引擎 (resvg-wasm) + 质量预设
**【目标】** 解决复杂 SVG（含渐变、滤镜、文本）在使用原生 Canvas 导出时出现模糊或失真的问题。
**【用户触点】** `ExportSettings` 区域（目前位于预览区域的 Settings Modal 内）。
**【交互设计】**
1. **引擎选择/渲染模式（隐式或显式）**：
   - 默认情况下，系统自动判断。如果是常规导出，直接走高质量（resvg）引擎。
   - 在 Settings 面板的 `Quality` 设置旁，增加一个 "HD / Retina (2x/4x)" 的快速拨动开关（Toggle）或预设按钮，而不是仅保留输入框。
2. **加载状态感知**：
   - 因为 Wasm 初始化或高精度渲染可能比当前原生 Canvas 略慢（约多耗时几十到几百毫秒），点击 `Convert & Preview` 时，`isConverting` 状态的 Loading 动画必须保持平滑。
3. **降级体验**：
   - 如果用户浏览器不支持 Wasm 或加载失败，系统应**静默降级**到现有的 `Canvas` 渲染方案，并可在控制台或界面底部轻量提示 "Falling back to standard rendering"。

### P0-2 便捷导出预设 + 一键多尺寸/多格式
**【目标】** 解决设计师和开发者需要手动计算尺寸，以及多次重复点击导出不同格式的痛点。
**【用户触点】** Settings 面板的 `Width / Height` 区域，以及生成预览后的 `Download` 按钮区。
**【交互设计】**
1. **尺寸预设下拉框**：
   - 在 `Width / Height` 输入框上方或旁边，新增一个 "Presets" 下拉框（或标签组）。
   - **预设内容**：`Original`, `Favicon (32x32)`, `App Icon (1024x1024)`, `Social Media (1200x630)`。
   - 点击预设后，自动联动填充 `Width` 和 `Height` 的输入框。
2. **一键打包下载 (Batch Export)**：
   - 当用户点击 `Convert & Preview` 后，底部出现的下载按钮区（目前是一排 PNG/JPG/GIF 等按钮），新增一个 **"Export All (ZIP)"** 按钮。
   - 允许用户勾选需要的格式/尺寸，一键生成一个 `.zip` 文件，内含所有选中的变体。

### P0-3 导出前智能优化 (SVGO 集成)
**【目标】** 在导出前自动清理冗余代码（如 Figma 导出的无用 `<g>` 标签、隐式样式），使导出的组件或图片更轻量。
**【用户触点】** 左侧代码编辑器（`Editor` 组件）的工具栏。
**【交互设计】**
1. **一键优化按钮**：
   - 在代码编辑器的右上角工具栏（目前有 Copy, Trash, Reset 按钮处），新增一个 **"Magic Optimize"** (✨) 按钮。
2. **视觉反馈**：
   - 点击后，代码瞬间更新为优化后的代码。
   - 在按钮旁或代码框上方出现临时 Toast 提示：“Cleaned! Saved 45% (2.1KB)”（清理成功！节省 45%）。
3. **安全与撤销**：
   - 优化操作必须是非破坏性的。用户可以通过原本的 `Reset` 按钮（RotateCcw）恢复到原始代码，或者通过编辑器自带的 `Cmd/Ctrl + Z` 撤销。

### P0-4 导出错误诊断与修复建议
**【目标】** 防止用户在遇到无法渲染的 SVG（如跨域图片 `<image>`、`<foreignObject>`）时，面对空白画布或静默失败而感到困惑。
**【用户触点】** 右侧预览区域（`htmlPreviewRef` 或 `svg` 渲染区）及 `ConvertError` 提示区。
**【交互设计】**
1. **实时诊断警告**：
   - 在用户粘贴代码后，系统在后台（或使用 debounce）快速进行正则或 DOM 扫描。
   - 如果发现不支持的标签（如 `<foreignObject>`）或可能引发 CORS 的外部图片，在预览区右上角显示一个黄色的 **⚠️ Warning** 徽标。
2. **智能修复建议 (AI 联动)**：
   - 点击 ⚠️ Warning 徽标，展开一个提示框（Popover）。
   - 提示内容：“This SVG contains remote images which may block exporting due to browser security.”
   - 提供一个 **"Fix with AI"** 按钮（如果后续接入 AI 助手）或 **"Auto-remove external links"** 的快捷修复按钮。
3. **拦截静默失败**：
   - 修改当前的 `try-catch` 逻辑。如果 `convertSvgToImage` 抛出错误，不要只显示红色的 "Conversion failed"，应输出具体的诊断词，如 "Error: Remote image blocked. Please remove the `<image>` tag or encode it in Base64."

---

## 3. 兼容性与当前功能保护
- **暗黑模式（Dark Mode）**：新增的下拉框、Warning 徽标、Toggle 开关必须严格遵守 Tailwind 的 `dark:` 前缀规范，与现有的 `slate-800` 等色调对齐。
- **多语言（i18n）**：所有新增的文案（"HD", "Presets", "Export All", "Cleaned", 错误提示等）必须通过 `next-intl` 提取到 `en.json` 等翻译文件中，不可硬编码在组件内。
- **性能影响**：所有的检测和优化逻辑不应阻塞用户在 Monaco Editor 中的实时输入体验。
