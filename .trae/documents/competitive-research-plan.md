# 竞品调研计划 — SVGCodeToPNG 下阶段方向

## 1. 项目现状概述

**产品**: svgcodetopng.com — 免费在线 SVG Code 转 PNG/JPG/GIF 工具
**技术栈**: Next.js 14 + TypeScript + Tailwind CSS + next-intl（12 语言）
**核心功能**:

* SVG 代码粘贴 → 实时预览 → PNG/JPG/GIF 下载

* AI SVG 助手（代码生成/优化/动画规划）

* 多语言支持（en, ko, ja, de, fr, es, pt, it, ru, zh, ar, id）

* 暗色/亮色主题

**已有页面规划**: Code to PNG 独立页面（SVG + HTML/CSS 转图片）— 见 `code-to-png-page-plan.md`

***

## 2. 竞品分类与调研范围

### 2.1 直接竞品（SVG Code → PNG 转换）

| 竞品                          | 网址                                | 核心差异点                                   | 威胁等级 |
| --------------------------- | --------------------------------- | --------------------------------------- | ---- |
| **SVGGenie**                | svggenie.com                      | 支持 1x-4x 分辨率、文件上传+代码粘贴、SEO 内容极丰富        | 高    |
| **SVG2PNG.com**             | svg2png.com                       | 批量处理、20+ 格式互转、100% 客户端处理、隐私优先           | 高    |
| **SVGMaker**                | svgmaker.io                       | AI 生成 SVG、PNG→SVG 矢量化、MCP/API 支持、面向电商卖家 | 中    |
| **Fix42 SVG Code to Image** | fix42.com/tools/svg-code-to-image | PNG/JPG/WebP 多格式、自定义尺寸、简洁界面             | 中    |
| **FreeSanTools**            | freesantools.com                  | 文件上传为主、简单三步流程、FAQ 丰富                    | 低    |

### 2.2 间接竞品（HTML/CSS → Image）

| 竞品                   | 网址                   | 核心差异点                                                     | 威胁等级 |
| -------------------- | -------------------- | --------------------------------------------------------- | ---- |
| **HTMLImgConverter** | htmlimgconverter.com | 支持 Tailwind CSS、SVG/PNG/JPG/WebP 导出、Monaco 编辑器            | 高    |
| **HTMLToImages.com** | htmltoimages.com     | 8 个细分工具（HTML→PNG/Code→Image/Table→Image/Tailwind→Image 等） | 高    |
| **HTML2IMG.com**     | html2img.com         | API 服务为主、模板系统、OG Image 生成、付费模式                            | 中    |

### 2.3 代码截图/分享工具

| 竞品            | 网址             | 核心差异点                             | 威胁等级 |
| ------------- | -------------- | --------------------------------- | ---- |
| **Carbon**    | carbon.now\.sh | 代码美化截图鼻祖、100+ 主题、社交分享、开源          | 中    |
| **Ray.so**    | ray.so         | Raycast 出品、极简设计、VSCode 插件、8 种配色   | 中    |
| **CodingVox** | codingvox.com  | Carbon 替代品、2x PNG、透明背景、macOS 窗口风格 | 低    |
| **Snappify**  | snappify.io    | 动画/GIF、多窗口、团队协作、付费                | 低    |

### 2.4 综合型设计工具

| 竞品                | 网址                | 核心差异点                       | 威胁等级 |
| ----------------- | ----------------- | --------------------------- | ---- |
| **CloudConvert**  | cloudconvert.com  | 200+ 格式、批量转换、API、云端处理       | 中    |
| **Convertio**     | convertio.co      | 3000+ 格式、简单易用、OCR、每天 10 个免费 | 中    |
| **Adobe Express** | adobe.com/express | 品牌资产、编辑工具、Adobe 生态          | 低    |

***

## 3. 竞品功能对比矩阵

| 功能维度                    | SVGCodeToPNG(我们) | SVGGenie | SVG2PNG | HTMLImgConverter    | HTMLToImages | Carbon     |
| ----------------------- | ---------------- | -------- | ------- | ------------------- | ------------ | ---------- |
| SVG Code 粘贴转换           | ✅                | ✅        | ✅       | ✅                   | ❌            | ❌          |
| 文件上传转换                  | ❌                | ✅        | ✅       | ✅                   | ❌            | ✅(drop)    |
| HTML/CSS 转图片            | 🚧 计划中           | ❌        | ❌       | ✅                   | ✅            | ❌          |
| 实时预览                    | ✅                | ✅        | ✅       | ✅                   | ✅            | ✅          |
| Monaco 代码编辑器            | ✅                | ❌        | ❌       | ✅                   | ❌            | ✅(简化)      |
| 多格式导出(PNG/JPG/GIF/WebP) | ✅(PNG/JPG/GIF)   | ✅(PNG)   | ✅(20+)  | ✅(SVG/PNG/JPG/WebP) | ✅            | ✅(PNG/SVG) |
| 自定义分辨率/尺寸               | ✅                | ✅(1x-4x) | ✅       | ✅                   | ❌            | ❌          |
| 批量处理                    | ❌                | ❌        | ✅       | ❌                   | ❌            | ❌          |
| AI 辅助功能                 | ✅                | ❌        | ❌       | ❌                   | ❌            | ❌          |
| 代码截图美化                  | ❌                | ❌        | ❌       | ❌                   | ❌            | ✅          |
| 模板库                     | ❌                | ❌        | ❌       | ❌                   | ❌            | ❌          |
| 100% 客户端处理              | ✅                | ✅        | ✅       | ✅                   | ✅            | ✅          |
| 多语言支持                   | ✅(12种)           | ❌        | ❌       | ❌                   | ❌            | ❌          |
| SEO 内容深度                | 中                | 极高       | 高       | 中                   | 中            | 低          |
| API/开发者集成               | ❌                | ❌        | ❌       | ❌                   | ❌            | CLI        |

***

## 4. 竞品 SEO 策略分析

### 4.1 高威胁竞品 SEO 特点

**SVGGenie (svggenie.com)**:

* 每个工具页面都有 2000+ 字的指南内容（How to / Why / When / FAQ）

* 大量长尾关键词覆盖："convert svg code to png", "svg markup to png", "svg to png for instagram"

* 结构化数据完整、内部链接丰富

**SVG2PNG.com**:

* 20+ 独立转换页面，每个页面都有独立 URL 和 meta

* 格式对比表格（SVG vs PNG）吸引信息类搜索

* 强调隐私/安全/本地处理，差异化定位清晰

**HTMLToImages.com**:

* 8 个细分工具页面，覆盖长尾关键词

* 内容策略：每个子工具都有独立落地页

* 技术博客文章支撑 SEO

### 4.2 关键词机会分析

| 关键词类型 | 示例                                 | 竞争度 | 我们的机会                   |
| ----- | ---------------------------------- | --- | ----------------------- |
| 核心词   | "svg to png"                       | 极高  | 差异化定位 "svg code to png" |
| 长尾词   | "svg code to png converter"        | 高   | ✅ 已定位，需加强内容             |
| 场景词   | "svg to png for social media"      | 中   | 🚧 可拓展内容页               |
| 技术词   | "html to png converter"            | 高   | 🚧 Code to PNG 页面上线后竞争  |
| 新兴词   | "code to image", "code screenshot" | 中   | 🚧 可拓展新功能               |
| 对比词   | "svg vs png"                       | 中   | 🚧 可添加对比页面              |

***

## 5. 下阶段可做的方向（按优先级排序）

### 🔥 P0 — 高优先级（立即执行）

#### 5.1 完成 Code to PNG 页面上线

* **原因**: HTMLImgConverter 和 HTMLToImages 已验证市场需求

* **价值**: 覆盖 "html to png", "code to image" 等高价值关键词

* **状态**: 已有完整技术方案（`code-to-png-page-plan.md`）

* **预期**: 新增 1 个高转化落地页，12 语言 SEO 覆盖

#### 5.2 加强现有页面的 SEO 内容深度

* **对标 SVGGenie**: 每个页面增加 1500+ 字的指南内容

* **具体动作**:

  * 首页增加 "What is SVG?" / "SVG vs PNG" 对比板块

  * 增加 "How to Convert SVG to PNG" 步骤指南

  * 丰富 FAQ 至 8-10 条（目前约 5 条）

  * 增加 "Use Cases" 场景板块（Social Media / Email / Presentations / Print）

#### 5.3 批量转换/文件上传功能

* **对标 SVG2PNG.com**: 支持文件上传 + 批量处理

* **价值**: 大幅提升实用性，覆盖 "batch svg to png" 等关键词

* **技术**: 客户端 FileReader + Canvas 批量处理

### 🚀 P1 — 中优先级（下季度）

#### 5.4 代码截图美化工具（Code Screenshot）

* **对标 Carbon / Ray.so**: 将代码片段转为美观图片

* **差异化**: 结合我们现有 Monaco 编辑器 + 主题系统

* **价值**: 覆盖 "code screenshot", "code to image" 等社交分享场景

* **关键词**: code screenshot generator, carbon alternative, code snippet image

#### 5.5 模板库/示例库

* **对标 SVGMaker**: 提供 100+ 预设 SVG 模板

* **价值**: 增加用户停留时间、降低跳出率、提升转化

* **SEO**: 每个模板可生成独立页面（类似 SVG2PNG 的格式页面策略）

#### 5.6 格式对比/教育页面

* **对标 SVG2PNG**: 独立页面 "SVG vs PNG", "SVG vs JPG", "PNG vs WebP"

* **价值**: 信息类搜索流量、建立权威、内部链接枢纽

* **SEO**: 高搜索量信息类关键词

### 💡 P2 — 探索性（未来）

#### 5.7 API/开发者工具

* **对标 html2img.com**: 提供 API 服务

* **模式**: Freemium（免费 100 次/月，付费扩展）

* **价值**: B2B 市场、开发者生态

#### 5.8 AI 功能扩展

* **当前**: AI SVG 代码生成/优化

* **扩展**: AI 自动调整尺寸、AI 推荐最佳格式、AI 批量优化建议

#### 5.9 Chrome 扩展/VSCode 插件

* **对标 Ray.so**: 编辑器插件直接截图

* **价值**: 开发者工作流集成、品牌曝光

***

## 6. 执行建议

### 第一阶段（1-2 周）

1. 上线 Code to PNG 页面（已有完整方案）
2. 首页增加 SEO 内容板块（SVG vs PNG 对比、使用场景）
3. 丰富 FAQ 至 10 条

### 第二阶段（2-4 周）

1. 添加文件上传 + 批量转换功能
2. 创建 3-5 个格式对比/教育页面
3. 开始积累模板库（20-50 个）

### 第三阶段（1-2 个月）

1. 探索代码截图美化功能 MVP
2. 模板库扩展至 100+
3. 评估 API 服务可行性

***

## 7. 风险与注意事项

* **SEO 内容改动**: 所有 SEO 相关改动（标题、描述、JSON 翻译文件）需用户确认后再执行

* **English First**: 所有新功能先上英语版本，验证后再扩展多语言

* **性能**: 批量处理/复杂 HTML 渲染需注意客户端性能

* **安全**: HTML 转换需严格过滤 script 标签和事件属性

