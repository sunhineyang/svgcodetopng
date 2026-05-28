# Post-Conversion Feedback Module — 完整实现方案

> 项目：svgcodetopng.com  
> 日期：2026-05-20  
> 状态：待确认后执行

---

## 一、功能概述

### 核心目标
让用户在下载转换结果后，低成本地告诉我们"好不好"。如果不好，能收集到**问题描述 + 原始 SVG + 转换参数**，帮助我们快速迭代渲染引擎。

### 设计原则
- **极简**：用户最多 4-5 次点击完成反馈
- **非侵入**：不挡住下载内容，可随时关闭
- **高价值数据优先**：重点收集 👎 + SVG + 转换参数的组合
- **隐私透明**：明确告知文件用途，匿名上传

---

## 二、用户交互流程（Step by Step）

### 步骤 1：下载后自动触发反馈卡片

**触发时机：**
- 用户点击任意下载按钮（PNG / JPG / GIF / WebP / PDF）后，**立即**在界面右下角弹出非模态反馈卡片
- 批量下载场景：全部下载完成后弹出一次总反馈（避免多次打扰）

**卡片样式：**
- 位置：页面右下角，固定定位（`fixed bottom-6 right-6`）
- 非模态，不遮挡下载结果区域
- 默认显示 **8 秒**后自动淡出
- 右上角有 × 关闭按钮，用户可随时关闭
- 出场动画：从底部滑入 + 淡入（`slide-up + fade-in`，300ms）

**卡片内容：**

```
┌─────────────────────────────────────┐
│  ×                                   │
│                                      │
│  Are you satisfied with the          │
│  conversion result?                  │
│  Help us improve our tool 👍         │
│                                      │
│  ┌──────────┐   ┌──────────┐        │
│  │ 👍 Good  │   │ 👎 Issues│        │
│  └──────────┘   └──────────┘        │
│                                      │
└─────────────────────────────────────┘
```

---

### 步骤 2：点击「👍 Looks Good」

- 立即显示 Toast 提示（2 秒后自动消失）：
  > "Thank you for your feedback! We'll keep working to improve quality~"
- 卡片淡出消失
- **后台记录**：
  - `rating: positive`
  - 关联的转换参数（format, scale, quality, has_bg 等）
  - 时间戳

---

### 步骤 3：点击「👎 Has Issues」→ 弹出模态窗口

模态窗口标题：**Help Us Improve the Conversion Result**

#### 第一屏：问题选择

```
┌──────────────────────────────────────────────┐
│  Help Us Improve the Conversion Result    ×  │
│──────────────────────────────────────────────│
│                                              │
│  Please tell us what went wrong              │
│  (select all that apply):                    │
│                                              │
│  ☐ Elements missing or disappeared           │
│  ☐ Image is blurry / pixelated               │
│  ☐ Colors incorrect or gradient issues       │
│  ☐ Transparent background failed             │
│  ☐ Text display error                        │
│  ☐ Other issues                              │
│                                              │
│  Additional description (optional):          │
│  ┌──────────────────────────────────────┐    │
│  │                                      │    │
│  │  [多行文本输入框]                     │    │
│  │                                      │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                              │
│  ⭐ Would you like to provide the original   │
│     SVG to help us fix it?                   │
│                                              │
│  ☐ Yes, anonymously upload my original SVG   │
│     file (recommended)                       │
│     → 勾选后显示文件名预览                    │
│     "Your file is only used to improve       │
│      rendering quality. We promise not to    │
│      disclose or use it for other purposes." │
│                                              │
│  ┌──────────────┐  ┌──────────┐             │
│  │ Submit       │  │  Cancel  │             │
│  │ Feedback     │  │          │             │
│  └──────────────┘  └──────────┘             │
│  (提交按钮默认禁用，至少选择一个问题后激活)    │
│                                              │
└──────────────────────────────────────────────┘
```

#### 交互细节：
- **多选 Checkbox**：6 个预设问题选项，可多选
- **描述输入框**：可选，多行文本，最大 500 字符
- **SVG 上传勾选**：默认不勾选，勾选后显示文件名预览和隐私说明
- **提交按钮**：默认 `disabled`，至少选择 1 个问题后激活
- **取消按钮**：关闭模态窗口，不记录任何数据

---

### 步骤 4：点击提交

- 提交按钮显示 loading 状态（1-2 秒）
- 成功后关闭模态窗口，显示 Toast：
  > "Thank you for your feedback! We've received your issue description, which is very important for improving the tool."
- **后台记录数据**：
  - 选择的痛点标签（issues array）
  - 用户描述文本（description）
  - 原始 SVG 文件内容（svg_content，如果用户同意上传）
  - 转换参数（conversion_params JSON）
  - 时间戳（created_at）
  - 浏览器 User-Agent（可选）

---

## 三、防骚扰机制

| 机制 | 说明 |
|------|------|
| 自动消失 | 反馈卡片 8 秒后自动淡出 |
| 手动关闭 | 卡片和模态窗口都有 × 按钮 |
| 频率控制 | 同一浏览器 24 小时内最多弹出 3 次反馈卡片（用 localStorage 记录） |
| 转换计数 | 至少完成 1 次转换才弹出（不会在用户刚进入页面时就打扰） |
| 不再显示 | 用户关闭卡片 3 次后，7 天内不再弹出（localStorage 标记） |

---

## 四、技术方案

### 4.1 技术栈选型

| 层级 | 技术选择 | 理由 |
|------|---------|------|
| 前端组件 | React + Tailwind CSS | 与现有项目一致 |
| 状态管理 | Zustand store | 项目已安装 zustand@5.0.3 |
| 国际化 | next-intl | 项目已使用 |
| 后端 API | Next.js API Route | 与现有 `/api/ai/route.ts` 模式一致 |
| 数据库 | Vercel Postgres (Neon) + Drizzle ORM | Serverless 友好，Vercel 原生支持 |
| SVG 存储 | Vercel Blob | 适合存储小文件，与 Vercel 生态集成 |

### 4.2 文件结构（新增/修改）

```
新增文件：
├── app/api/feedback/route.ts          # 反馈提交 API
├── components/ConversionFeedback.tsx   # 反馈卡片 + 模态窗口组件
├── stores/feedbackStore.ts             # Zustand 反馈状态管理
├── db/
│   ├── index.ts                        # Drizzle 数据库连接
│   ├── schema.ts                       # 数据表 Schema
│   └── migrate.ts                      # 迁移脚本
├── drizzle.config.ts                   # Drizzle 配置

修改文件：
├── app/[locale]/page.tsx               # 集成反馈组件 + 触发逻辑
├── utils/analytics.ts                  # 新增反馈相关事件追踪
├── messages/en.json                    # 新增 feedback i18n 键
├── messages/ko.json                    # 同上
├── messages/ja.json                    # 同上
├── messages/ru.json                    # 同上
├── messages/es.json                    # 同上
├── messages/fr.json                    # 同上
├── messages/de.json                    # 同上
├── messages/zh.json                    # 同上
├── messages/pt.json                    # 同上
├── messages/it.json                    # 同上
├── messages/id.json                    # 同上
├── messages/ar.json                    # 同上
├── .env.example                        # 新增 DATABASE_URL, BLOB_READ_WRITE_TOKEN
├── package.json                        # 新增 drizzle-orm, @vercel/postgres, @vercel/blob 依赖
```

### 4.3 数据库设计

#### 表：`conversion_feedback`

```sql
CREATE TABLE conversion_feedback (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rating        VARCHAR(10) NOT NULL,           -- 'positive' | 'negative'
  issues        TEXT[],                         -- 问题标签数组
  description   TEXT,                           -- 用户描述
  svg_file_url  TEXT,                           -- Vercel Blob 存储 URL（如果用户上传了 SVG）
  svg_file_name VARCHAR(255),                   -- 原始文件名
  svg_file_size INTEGER,                        -- 文件大小（bytes）
  conversion_params JSONB NOT NULL,             -- 转换参数
  user_agent    TEXT,                           -- 浏览器 UA
  locale        VARCHAR(5),                     -- 用户语言
  created_at    TIMESTAMPTZ DEFAULT NOW()       -- 创建时间
);

-- 索引
CREATE INDEX idx_feedback_rating ON conversion_feedback(rating);
CREATE INDEX idx_feedback_created_at ON conversion_feedback(created_at);
CREATE INDEX idx_feedback_issues ON conversion_feedback USING GIN(issues);
```

#### Drizzle Schema 定义

```typescript
// db/schema.ts
import { pgTable, uuid, varchar, text, integer, jsonb, timestamp, index } from 'drizzle-orm/pg-core';

export const conversionFeedback = pgTable('conversion_feedback', {
  id: uuid('id').defaultRandom().primaryKey(),
  rating: varchar('rating', { length: 10 }).notNull(),
  issues: text('issues').array(),
  description: text('description'),
  svgFileUrl: text('svg_file_url'),
  svgFileName: varchar('svg_file_name', { length: 255 }),
  svgFileSize: integer('svg_file_size'),
  conversionParams: jsonb('conversion_params').notNull(),
  userAgent: text('user_agent'),
  locale: varchar('locale', { length: 5 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_feedback_rating').on(table.rating),
  index('idx_feedback_created_at').on(table.createdAt),
]);
```

### 4.4 API 设计

#### `POST /api/feedback`

**Request:**

```typescript
interface FeedbackRequest {
  rating: 'positive' | 'negative';
  issues?: string[];           // 仅 negative 时有值
  description?: string;        // 仅 negative 时有值
  svgContent?: string;         // 仅用户勾选上传时有值
  svgFileName?: string;        // 原始文件名
  conversionParams: {
    format: string;
    scale: number;
    quality: number;
    width: number;
    height: number;
    backgroundColor: string;
    hasCustomColors: boolean;
  };
  locale?: string;
}
```

**Response (成功):**

```json
{
  "success": true,
  "feedbackId": "uuid-xxx"
}
```

**Response (失败):**

```json
{
  "success": false,
  "error": "Invalid request data"
}
```

**API Route 实现逻辑：**

```typescript
// app/api/feedback/route.ts
export async function POST(request: NextRequest) {
  // 1. 解析请求体
  // 2. 校验 rating 必填，issues 在 negative 时至少 1 个
  // 3. 如果有 svgContent：
  //    a. 校验大小 < 2MB
  //    b. 校验是否为合法 SVG（简单校验 <svg 标签）
  //    c. 上传到 Vercel Blob，获取 URL
  // 4. 写入数据库
  // 5. 返回成功
}
```

**安全措施：**
- Rate Limiting：同一 IP 每分钟最多 5 次提交
- SVG 文件大小限制：< 2MB
- SVG 内容校验：必须包含 `<svg` 标签
- description 长度限制：< 500 字符
- issues 数量限制：最多 6 个

### 4.5 Zustand Store 设计

```typescript
// stores/feedbackStore.ts
import { create } from 'zustand';

interface FeedbackState {
  // 卡片显示状态
  showCard: boolean;
  showModal: boolean;
  
  // 反馈数据
  rating: 'positive' | 'negative' | null;
  selectedIssues: string[];
  description: string;
  uploadSvg: boolean;
  
  // 转换上下文（下载时自动填充）
  lastConversionParams: Record<string, any> | null;
  lastSvgCode: string | null;
  lastSvgFileName: string | null;
  
  // 防骚扰计数
  dismissCount: number;
  lastDismissTime: number | null;
  
  // Actions
  triggerFeedback: (conversionParams: Record<string, any>, svgCode: string, fileName?: string) => void;
  setRating: (rating: 'positive' | 'negative') => void;
  toggleIssue: (issue: string) => void;
  setDescription: (desc: string) => void;
  setUploadSvg: (upload: boolean) => void;
  dismissCard: () => void;
  closeModal: () => void;
  submitFeedback: () => Promise<void>;
  reset: () => void;
}
```

### 4.6 组件设计

#### `ConversionFeedback` 组件

```
ConversionFeedback (主组件)
├── FeedbackCard (非模态反馈卡片，右下角)
│   ├── 标题 + 副标题
│   ├── 👍 Good 按钮
│   └── 👎 Issues 按钮
│
└── FeedbackModal (模态窗口)
    ├── 问题多选区 (CheckboxGroup)
    ├── 描述输入框 (Textarea)
    ├── SVG 上传区 (UploadConsent)
    └── 提交/取消按钮
```

**组件 Props：**

```typescript
interface ConversionFeedbackProps {
  // 无需外部 props，所有状态由 feedbackStore 管理
  // 组件通过 store 监听 showCard / showModal 来控制显示
}
```

**组件使用方式：**

在 `app/[locale]/page.tsx` 中，只需在页面底部添加：

```tsx
<ConversionFeedback />
```

然后在下载函数中调用 store 的 `triggerFeedback` 方法即可。

### 4.7 触发点集成

在 `app/[locale]/page.tsx` 的三个下载函数中集成：

```typescript
// downloadFormat() — 下载 PNG/JPG/WebP/PDF
const handleBlob = (blob: Blob | null) => {
  if (blob) {
    // ... 原有下载逻辑 ...
    
    // 新增：触发反馈
    const { triggerFeedback } = useFeedbackStore.getState();
    triggerFeedback(
      {
        format,
        scale: exportSettings.scale,
        quality: exportSettings.quality,
        width: finalWidth,
        height: finalHeight,
        backgroundColor: exportSettings.backgroundColor,
        hasCustomColors: Object.values(colorMappings).some((v, i) => v !== extractedColors[i]),
      },
      svgCode,
      `converted-image.${format}`
    );
  }
};

// downloadImage() — 下载预览图
const downloadImage = () => {
  // ... 原有下载逻辑 ...
  
  // 新增：触发反馈
  triggerFeedback({ format: exportSettings.format, ... }, svgCode);
};

// downloadGIF() — 下载 GIF
gif.on('finished', function(blob) {
  // ... 原有下载逻辑 ...
  
  // 新增：触发反馈
  triggerFeedback({ format: 'gif', ... }, svgCode, 'converted-image.gif');
});
```

### 4.8 Analytics 事件追踪

在 `utils/analytics.ts` 中新增：

```typescript
// 新增事件常量
FEEDBACK_CARD_SHOWN: 'feedback_card_shown',
FEEDBACK_POSITIVE: 'feedback_positive',
FEEDBACK_NEGATIVE: 'feedback_negative',
FEEDBACK_MODAL_OPENED: 'feedback_modal_opened',
FEEDBACK_SUBMITTED: 'feedback_submitted',
FEEDBACK_CARD_DISMISSED: 'feedback_card_dismissed',
FEEDBACK_SVG_UPLOADED: 'feedback_svg_uploaded',

// 新增追踪函数
trackFeedbackCardShown(conversionFormat: string)
trackFeedbackPositive(conversionFormat: string)
trackFeedbackNegative(conversionFormat: string)
trackFeedbackModalOpened()
trackFeedbackSubmitted(issues: string[], hasSvgUpload: boolean, hasDescription: boolean)
trackFeedbackCardDismissed()
trackFeedbackSvgUploaded()
```

---

## 五、i18n 文案（English First）

以下为 `en.json` 中新增的 `feedback` 节点，**需要确认后再写入所有语言文件**：

```json
"feedback": {
  "card": {
    "title": "Are you satisfied with the conversion result?",
    "subtitle": "Help us improve our tool 👍",
    "good": "Looks Good",
    "bad": "Has Issues"
  },
  "modal": {
    "title": "Help Us Improve the Conversion Result",
    "issuePrompt": "Please tell us what went wrong (select all that apply):",
    "issue1": "Elements missing or disappeared",
    "issue2": "Image is blurry / pixelated",
    "issue3": "Colors incorrect or gradient issues",
    "issue4": "Transparent background failed",
    "issue5": "Text display error",
    "issue6": "Other issues",
    "descriptionLabel": "Additional description (optional):",
    "descriptionPlaceholder": "Please describe the issue you encountered...",
    "uploadTitle": "Would you like to provide the original SVG to help us fix it?",
    "uploadCheckbox": "Yes, anonymously upload my original SVG file (recommended)",
    "uploadPrivacy": "Your file is only used to improve rendering quality. We promise not to disclose or use it for other purposes.",
    "submit": "Submit Feedback",
    "cancel": "Cancel",
    "submitting": "Submitting..."
  },
  "toast": {
    "positive": "Thank you for your feedback! We'll keep working to improve quality~",
    "negative": "Thank you for your feedback! We've received your issue description, which is very important for improving the tool."
  }
}
```

---

## 六、移动端适配

| 元素 | 桌面端 | 移动端 |
|------|--------|--------|
| 反馈卡片 | 右下角固定，宽度 320px | 底部居中，宽度 calc(100% - 32px)，max-width 360px |
| 模态窗口 | 居中弹窗，max-width 520px | 底部抽屉（Bottom Sheet），圆角顶部，max-height 85vh |
| 按钮尺寸 | py-2.5 px-4 | py-3 px-4（更大点击区域） |
| 文字大小 | text-sm | text-base（移动端稍大） |
| Checkbox | 标准 | 增大点击区域至 44x44px |

---

## 七、无障碍（A11y）

- 所有按钮有 `aria-label`
- 模态窗口有 `role="dialog"` 和 `aria-modal="true"`
- 支持键盘操作：Tab 切换焦点，Enter/Space 激活，Esc 关闭
- 文字对比度符合 WCAG 2.1 AA 标准
- Focus trap 在模态窗口打开时生效

---

## 八、执行步骤（按顺序）

### Phase 1：基础设施（后端）
1. 安装依赖：`drizzle-orm`, `@vercel/postgres`, `@vercel/blob`
2. 配置 `.env.local`：添加 `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`
3. 创建 `db/schema.ts` + `db/index.ts` + `drizzle.config.ts`
4. 运行数据库迁移
5. 实现 `app/api/feedback/route.ts` API

### Phase 2：前端组件
6. 创建 `stores/feedbackStore.ts`（Zustand）
7. 创建 `components/ConversionFeedback.tsx`（卡片 + 模态窗口）
8. 在 `utils/analytics.ts` 中新增反馈事件追踪

### Phase 3：集成
9. 在 `app/[locale]/page.tsx` 中引入组件和触发逻辑
10. 添加 i18n 键到所有 12 个语言 JSON 文件

### Phase 4：验证
11. 本地测试完整流程
12. 运行 `pnpm build` 确认无错误
13. 部署到 Vercel 预览环境验证

---

## 九、后续可扩展方向（本次不实现）

1. **反馈管理后台**：查看/筛选反馈数据，下载 SVG 文件
2. **回归测试集成**：自动将 👎 + SVG 喂给渲染引擎做回归测试
3. **NPS 评分**：在 positive 路径追加 1-5 分评分
4. **反馈趋势看板**：按时间/格式/问题类型统计
5. **邮件通知**：收到新 👎 反馈时发送通知
6. **A/B 测试**：测试不同卡片文案的转化率
