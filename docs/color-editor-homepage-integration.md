# 颜色编辑功能融入首页方案

## 文档信息
- **版本**: 1.0
- **日期**: 2026-05-13

---

## 1. 现状分析

### 1.1 问题
颜色编辑功能目前只在 `CodeToPngConverter.tsx`（`/[locale]/code-to-png` 页面）中实现，但**首页**才是用户最常使用的入口，首页转换器没有颜色编辑能力。

### 1.2 首页转换器现状
首页有两个 SVG 转换区域：

| 区域 | 文件 | 功能完整度 | 是否有颜色编辑 |
|------|------|-----------|--------------|
| 主转换器 | `app/[locale]/page.tsx` | 完整（编辑器+预览+导出+AI） | ❌ 无 |
| Hero 迷你转换器 | `components/MiniConverter.tsx` | 简化（文本框+预览+下载） | ❌ 无 |

### 1.3 核心矛盾
- 首页主转换器功能已经很完整，但缺少颜色编辑
- 首页空间有限，不能像 Code to PNG 页面那样放完整的颜色编辑面板
- 需要找到一种**轻量、不干扰、够用**的融入方式

---

## 2. 融入策略

### 2.1 核心原则
1. **首页优先**：颜色编辑必须出现在首页主转换器中
2. **轻量融入**：不占太多空间，不干扰核心转换流程
3. **渐进展示**：默认收起，用户需要时才展开
4. **复用代码**：抽取公共组件，避免重复代码

### 2.2 两个区域的不同策略

| 区域 | 策略 | 理由 |
|------|------|------|
| 首页主转换器 | **完整融入**（Settings 面板加 Color 标签） | 功能完整，空间够 |
| Hero 迷你转换器 | **轻量融入**（颜色条 + 快速替换） | 空间有限，保持简洁 |

---

## 3. 首页主转换器融入方案

### 3.1 改造点
修改 `app/[locale]/page.tsx`，在 Settings 面板中添加 Color 标签页（与 Code to PNG 页面一致）。

### 3.2 具体改动

#### 3.2.1 新增状态
```typescript
// 颜色编辑相关状态
const [extractedColors, setExtractedColors] = useState<string[]>([]);
const [colorMappings, setColorMappings] = useState<Record<string, string>>({});
const [renderedSvg, setRenderedSvg] = useState<string>(svgCode);
const [targetColor, setTargetColor] = useState<string>('#3B82F6');
const [pickerOpen, setPickerOpen] = useState<string | null>(null);
const [settingsTab, setSettingsTab] = useState<'format' | 'color'>('format');
```

#### 3.2.2 新增 import
```typescript
import { HexColorPicker } from 'react-colorful';
import {
  extractColors, replaceColor, replaceAllColors,
  isValidHex, colorEquals,
} from '../../utils/svg-color';
import { PRESET_PALETTES } from '../../utils/color-palettes';
import {
  trackSettingsOpen, trackSettingsTabSwitch,
  trackColorTabOpen, trackColorReplaceSingle,
  trackColorReplaceAll, trackColorPresetUsed,
  trackColorResetAll, trackColorWheelOpen, trackColorWheelClose,
} from '../../utils/analytics';
```

#### 3.2.3 新增 useEffect
```typescript
// 自动提取 SVG 颜色
useEffect(() => {
  if (svgCode) {
    const colors = extractColors(svgCode);
    setExtractedColors(colors);
    const initialMappings = colors.reduce((acc, c) => ({ ...acc, [c]: c }), {});
    setColorMappings(initialMappings);
  }
}, [svgCode]);

// 应用颜色替换到渲染副本
useEffect(() => {
  let result = svgCode;
  for (const [oldColor, newColor] of Object.entries(colorMappings)) {
    if (!colorEquals(oldColor, newColor)) {
      result = replaceColor(result, oldColor, newColor);
    }
  }
  setRenderedSvg(result);
}, [colorMappings, svgCode]);
```

#### 3.2.4 修改预览渲染
```typescript
// 原来：dangerouslySetInnerHTML={{ __html: svgCode }}
// 改为：dangerouslySetInnerHTML={{ __html: renderedSvg }}
```

#### 3.2.5 修改转换函数
```typescript
// 原来：const svgBlob = new Blob([svgCode], ...)
// 改为：const svgBlob = new Blob([renderedSvg], ...)
```

#### 3.2.6 Settings 面板加标签页
与 CodeToPngConverter.tsx 完全一致的 Format/Color 标签页结构。

### 3.3 UI 布局（与 Code to PNG 页面一致）

```
┌──────────────────────────────────────────────────────┐
│ Settings                                              │
│ ┌──────────┬──────────┐                              │
│ │  Format  │  Color   │  ← 新增 Color 标签           │
│ └──────────┴──────────┘                              │
│                                                       │
│ [Format Tab 内容保持不变]                              │
│                                                       │
│ [Color Tab]                                           │
│  Detected 5 colors:                                   │
│  ■ #007AFF  [input]  ← 点击打开色轮                   │
│  ■ #5856D6  [input]                                   │
│  ■ #34C759  [input]                                   │
│  ■ #1D1D1F  [input]                                   │
│  ■ #F5F5F7  [input]                                   │
│                                                       │
│  Presets:                                             │
│  🌊 Serenity Calm  ■■■■■■■■■■■■■■■■                  │
│  🌅 Sunset Glow    ■■■■■■■■■■■■■■■■                  │
│  ...                                                  │
│                                                       │
│  [#3B82F6] [Replace All]                              │
│  [Reset All Colors]                                   │
└──────────────────────────────────────────────────────┘
```

---

## 4. Hero 迷你转换器融入方案

### 4.1 设计理念
MiniConverter 是首页 Hero 区域的轻量展示，空间有限。不适合放完整的颜色编辑面板，但可以加一个**颜色快速替换条**。

### 4.2 具体方案：颜色检测条 + 快速替换

```
┌──────────────────────────────────────────────────────┐
│ SVG Code                                              │
│ ┌──────────────────────────────────────────────────┐ │
│ │ <svg width="100" height="100" ...>              │ │
│ │   <circle cx="50" cy="50" r="40" .../>          │ │
│ │ </svg>                                           │ │
│ └──────────────────────────────────────────────────┘ │
│                                                       │
│ 🎨 Colors:  ■ #3B82F6  ■ #EFF6FF  ■ #1E40AF        │  ← 新增
│             [Replace All → #____] [Apply]             │  ← 新增
│                                                       │
│ [Convert to PNG]                                      │
│                                                       │
│ Preview                          [Download PNG]       │
│ ┌──────────────────────────────────────────────────┐ │
│ │                                                  │ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### 4.3 MiniConverter 改动

#### 4.3.1 新增状态
```typescript
const [extractedColors, setExtractedColors] = useState<string[]>([]);
const [colorMappings, setColorMappings] = useState<Record<string, string>>({});
const [renderedSvg, setRenderedSvg] = useState<string>(svgCode);
const [targetColor, setTargetColor] = useState<string>('#3B82F6');
```

#### 4.3.2 新增 import
```typescript
import { extractColors, replaceColor, isValidHex, colorEquals } from '../utils/svg-color';
import { PRESET_PALETTES } from '../utils/color-palettes';
```

#### 4.3.3 颜色检测条 UI
```tsx
{extractedColors.length > 0 && (
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-xs text-gray-500">🎨</span>
    {extractedColors.slice(0, 5).map((color, i) => (
      <div
        key={i}
        className="w-5 h-5 rounded border border-gray-300 cursor-pointer"
        style={{ backgroundColor: color }}
        title={color}
      />
    ))}
    <input
      type="text"
      value={targetColor}
      onChange={(e) => isValidHex(e.target.value) && setTargetColor(e.target.value)}
      className="w-20 px-1 py-0.5 text-xs font-mono border border-gray-300 rounded"
      placeholder="#HEX"
    />
    <button
      onClick={() => {
        const newMappings: Record<string, string> = {};
        for (const c of extractedColors) newMappings[c] = targetColor;
        setColorMappings(newMappings);
      }}
      className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Apply
    </button>
  </div>
)}
```

---

## 5. 代码复用方案

### 5.1 抽取公共组件

为避免三个地方（CodeToPngConverter、首页主转换器、MiniConverter）重复代码，建议抽取：

| 组件 | 用途 | 使用位置 |
|------|------|---------|
| `ColorEditorPanel` | 完整颜色编辑面板（色轮+预设+替换） | CodeToPngConverter、首页主转换器 |
| `ColorQuickBar` | 轻量颜色快速替换条 | MiniConverter |

### 5.2 组件结构

```
components/
  color/
    ColorEditorPanel.tsx   ← 完整面板（Settings 中的 Color Tab）
    ColorQuickBar.tsx      ← 轻量条（MiniConverter 用）
```

### 5.3 ColorEditorPanel 接口

```typescript
interface ColorEditorPanelProps {
  svgCode: string;
  onRenderedSvgChange: (svg: string) => void;
}
```

内部管理 extractedColors、colorMappings、pickerOpen 等状态，对外只暴露渲染后的 SVG。

### 5.4 ColorQuickBar 接口

```typescript
interface ColorQuickBarProps {
  svgCode: string;
  onRenderedSvgChange: (svg: string) => void;
}
```

---

## 6. 实施步骤

| 步骤 | 任务 | 预计工时 |
|------|------|---------|
| 1 | 抽取 `ColorEditorPanel` 公共组件 | 1h |
| 2 | 抽取 `ColorQuickBar` 公共组件 | 0.5h |
| 3 | 重构 CodeToPngConverter 使用公共组件 | 0.5h |
| 4 | 首页主转换器融入 ColorEditorPanel | 0.5h |
| 5 | MiniConverter 融入 ColorQuickBar | 0.5h |
| 6 | 添加埋点 | 0.5h |
| 7 | 测试验证 | 0.5h |
| **合计** | | **4h** |

---

## 7. 优先级建议

| 优先级 | 任务 | 理由 |
|--------|------|------|
| **P0** | 首页主转换器融入颜色编辑 | 首页是用户主入口，必须要有 |
| **P1** | 抽取公共组件 | 避免代码重复，便于维护 |
| **P2** | MiniConverter 融入 | 锦上添花，非必须 |

建议先做 P0（直接在首页主转换器中添加颜色编辑），再重构为公共组件。
