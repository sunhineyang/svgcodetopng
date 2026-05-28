# Post-Conversion Feedback 技术详细设计（v1.0）

> 基于 Supabase 的 SVG Code to PNG 转换后快速反馈系统

---

## 0. 项目背景

- 项目：`svgcodetopng`
- 技术栈：Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS + next-intl
- 现有转换入口：[CodeToPngConverter.tsx](file:///Users/y_sunshine/Documents/svgcodetopng/components/CodeToPngConverter.tsx)
- 现有埋点：[analytics.ts](file:///Users/y_sunshine/Documents/svgcodetopng/utils/analytics.ts)（基于 gtag）
- 存储方案：**Supabase**（Postgres + Storage + Edge Functions 可选）

---

## 1. 方案总览

```
┌─────────────────────────────────────────────────────────────┐
│  浏览器 (Next.js Client)                                     │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ FeedbackCard     │  │ FeedbackModal    │                 │
│  │ (非模态卡片)      │  │ (负反馈详情)     │                 │
│  └────────┬─────────┘  └────────┬─────────┘                 │
│           └──────────┬──────────┘                            │
│                      ↓                                       │
│           ┌──────────────────────┐                          │
│           │ useFeedback (hook)    │ ← localStorage 状态     │
│           └──────────┬───────────┘                          │
└──────────────────────┼──────────────────────────────────────┘
                       ↓ fetch
            ┌──────────────────────┐
            │  /api/feedback (POST) │ ← Next.js Route Handler
            └──────────┬───────────┘
                       ↓ supabase-js (service role)
       ┌───────────────────────────────────────┐
       │  Supabase                              │
       │  ├─ Postgres: feedback                 │
       │  └─ Storage:  feedback-svgs (bucket)   │
       └───────────────────────────────────────┘
```

**关键决策：**
- 客户端 **不直接调用** Supabase，所有写入走 Next.js API Route（避免暴露 anon key 给非授信请求，统一限流和校验）。
- SVG 文件存 **Supabase Storage**，元数据 + 文件路径存 **Postgres**。
- 客户端用 `localStorage` 控制显示频率，**不依赖** 用户登录。

---

## 2. Supabase 资源设计

### 2.1 数据库表 `feedback`

```sql
create table public.feedback (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),

  -- 反馈类型
  sentiment       text not null check (sentiment in ('positive', 'negative')),

  -- 负反馈专属字段（positive 时为 null）
  issue_tags      text[] default null,         -- 多选标签
  description     text default null,           -- 用户描述（max 2000 chars）

  -- SVG 文件引用（Storage path，positive 时为 null）
  svg_storage_path text default null,          -- 例 "2026/05/<uuid>.svg"
  svg_size_bytes  integer default null,

  -- 转换上下文
  mode            text not null check (mode in ('svg', 'html')),
  format          text not null,               -- png/jpg/gif/webp/pdf
  quality         integer,
  width           integer,
  height          integer,
  background      text,
  scale           numeric,

  -- 环境信息
  locale          text,                        -- en/zh/...
  user_agent      text,
  referer         text,
  ip_hash         text,                        -- SHA-256(ip + salt)，用于限流去重，不存原始 IP

  -- 客户端标识（匿名）
  client_id       text                         -- localStorage uuid，用于去重统计
);

create index idx_feedback_created_at on public.feedback (created_at desc);
create index idx_feedback_sentiment  on public.feedback (sentiment);
create index idx_feedback_ip_hash    on public.feedback (ip_hash);
```

**问题标签枚举（issue_tags 取值约束在应用层）：**

| Key | 英文文案 |
|-----|---------|
| `missing_elements` | Elements missing or disappeared |
| `blurry` | Blurry / pixelated |
| `color_issue` | Wrong colors or broken gradients |
| `transparency_failed` | Transparent background not working |
| `text_error` | Text rendered incorrectly |
| `other` | Other issue |

### 2.2 Storage Bucket

- 名称：`feedback-svgs`
- 类型：**Private**（不公开访问）
- 路径规则：`{YYYY}/{MM}/{uuid}.svg`
- 文件大小上限：**512 KB**（应用层校验）
- 仅 service role 可读写

### 2.3 RLS 策略

```sql
alter table public.feedback enable row level security;

-- 客户端 anon key 一律拒绝（所有写入只能通过 service role 后端走）
create policy "no_anon_access" on public.feedback
  for all using (false);
```

Storage Bucket 同理：仅 service role 可访问。

---

## 3. 环境变量

`.env.local` 新增：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx        # 仅服务端使用
FEEDBACK_IP_SALT=<random-32-bytes-hex>    # 用于 IP 哈希
FEEDBACK_RATE_LIMIT_PER_HOUR=20           # 每 IP/小时上限
```

---

## 4. 后端 API 设计

### 4.1 路由：`POST /api/feedback`

**新增文件**：`app/api/feedback/route.ts`

**请求格式：`multipart/form-data`**（因为可能带文件）

| 字段名 | 类型 | 必填 | 说明 |
|--------|-----|------|-----|
| `sentiment` | `'positive' \| 'negative'` | 是 | 反馈类型 |
| `issue_tags` | `string` (JSON array) | negative 时必填 | 至少 1 个 |
| `description` | `string` | 否 | max 2000 |
| `svg_file` | `File` | 否 | max 512KB, mime=image/svg+xml |
| `context` | `string` (JSON) | 是 | 转换上下文，见下方 |
| `client_id` | `string` | 是 | localStorage 中的 uuid |

**`context` JSON 结构：**
```ts
{
  mode: 'svg' | 'html',
  format: 'png'|'jpg'|'gif'|'webp'|'pdf',
  quality: number,
  width: number,
  height: number,
  background: string,
  scale: number,
  locale: string
}
```

**响应：**
```ts
// 成功
200 { ok: true, id: "<feedback uuid>" }

// 失败
400 { ok: false, error: 'invalid_payload' | 'file_too_large' | 'invalid_svg' }
429 { ok: false, error: 'rate_limited' }
500 { ok: false, error: 'internal_error' }
```

### 4.2 后端处理流程（伪代码）

```ts
export async function POST(req: Request) {
  // 1. 限流：根据 ip_hash 查最近 1 小时计数
  const ip = getIp(req);
  const ipHash = sha256(ip + process.env.FEEDBACK_IP_SALT);
  if (await isRateLimited(ipHash)) return json(429, { error: 'rate_limited' });

  // 2. 解析 multipart
  const form = await req.formData();
  const sentiment = form.get('sentiment');
  const context = JSON.parse(form.get('context'));
  // ... 校验

  // 3. 校验 SVG（负反馈且用户勾选上传时）
  let svgPath = null;
  const file = form.get('svg_file');
  if (file && file.size > 0) {
    if (file.size > 512 * 1024) return json(400, { error: 'file_too_large' });
    if (file.type !== 'image/svg+xml') return json(400, { error: 'invalid_svg' });

    const path = `${yyyy}/${mm}/${uuid}.svg`;
    await supabase.storage.from('feedback-svgs').upload(path, file);
    svgPath = path;
  }

  // 4. 写入 DB
  const { data, error } = await supabase.from('feedback').insert({
    sentiment,
    issue_tags: sentiment === 'negative' ? JSON.parse(form.get('issue_tags')) : null,
    description: form.get('description') || null,
    svg_storage_path: svgPath,
    svg_size_bytes: file?.size || null,
    ...context,
    user_agent: req.headers.get('user-agent'),
    referer: req.headers.get('referer'),
    ip_hash: ipHash,
    client_id: form.get('client_id'),
  }).select('id').single();

  return json(200, { ok: true, id: data.id });
}
```

**限流实现**：简单方案直接查 DB `select count(*) from feedback where ip_hash=? and created_at > now() - interval '1 hour'`。如需更严格可上 Upstash Redis。

---

## 5. 前端组件设计

### 5.1 新增文件清单

```
components/feedback/
  ├── FeedbackCard.tsx         # 非模态卡片（右下角）
  ├── FeedbackModal.tsx        # 负反馈详情 Modal（移动端=Bottom Sheet）
  ├── FeedbackToast.tsx        # 成功 Toast（可复用现有 toast）
  └── FeedbackProvider.tsx     # Context，管理跨组件状态

hooks/
  └── useFeedback.ts           # 触发逻辑 + localStorage

utils/
  └── feedback-client.ts       # API 调用封装 + client_id 生成
```

### 5.2 localStorage Schema

Key: `svgcodetopng:feedback`

```ts
{
  client_id: string,             // uuid，首次生成
  conversion_count: number,      // 自上次反馈以来的转换次数
  last_feedback_at: number|null, // 时间戳
  dismissed_count: number,       // 关闭次数
  dont_show_again: boolean,      // 用户设置永久关闭
  cooldown_until: number|null    // 提交/关闭后冷却到此时间戳
}
```

### 5.3 触发策略（useFeedback）

```ts
function shouldShowFeedback(state): boolean {
  if (state.dont_show_again) return false;
  if (state.cooldown_until && Date.now() < state.cooldown_until) return false;

  // 基础概率
  let probability = 0.5;

  // 3 次转换内未反馈 → 提高概率
  if (state.conversion_count >= 3) probability = 1.0;

  // 已关闭 ≥ 2 次 → 大幅降低
  if (state.dismissed_count >= 2) probability *= 0.3;

  return Math.random() < probability;
}
```

**冷却时间：**
- 👍 后：7 天
- 提交负反馈后：14 天
- 主动关闭：1 天
- "不再显示"：永久（直到清除 localStorage）

### 5.4 FeedbackCard（非模态卡片）

- 位置：`fixed bottom-4 right-4`，移动端 `bottom-4 left-4 right-4`
- 8 秒自动淡出（CSS transition + setTimeout）
- 包含：标题文案 + 👍 / 👎 两个按钮 + 右上角 × 关闭
- 无障碍：`role="dialog"` `aria-live="polite"`，Tab/Enter 可操作

### 5.5 FeedbackModal（负反馈详情）

桌面端：居中 Modal（max-w-md）
移动端：底部抽屉（`fixed bottom-0`，圆角顶部）

**结构：**
1. 标题 + × 关闭
2. 6 个 checkbox（必选至少一个）
3. textarea（选填，max 2000 字）
4. 分隔线
5. 上传 SVG 复选框 + 隐私说明小字
6. 勾选后显示：当前 SVG 大小 + 文件名（伪文件名 `your-svg.svg`，因为是 inline code，不是文件）
7. Cancel / Submit 按钮（Submit 默认禁用，至少 1 个 checkbox 选中后启用）

**提交按钮 loading 状态**：1–2 秒最小展示时间（即使响应更快），提升仪式感。

---

## 6. 集成点修改

### 6.1 `CodeToPngConverter.tsx`

在 `downloadImage` 函数内，下载成功后追加：

```ts
// 下载成功后
incrementConversionCount();
maybeShowFeedback({
  mode: activeTab,
  format,
  quality: exportSettings.quality,
  width: exportSettings.width,
  height: exportSettings.height,
  background: exportSettings.backgroundColor,
  scale: exportSettings.scale,
  svgCode: activeTab === 'svg' ? svgCode : null,  // 备用上传
});
```

`<FeedbackProvider>` 包在页面根部或 `CodeToPngConverter` 外层。

### 6.2 `utils/analytics.ts`

新增事件：

```ts
FEEDBACK_CARD_SHOWN: 'feedback_card_shown',
FEEDBACK_CARD_DISMISSED: 'feedback_card_dismissed',
FEEDBACK_POSITIVE: 'feedback_positive',
FEEDBACK_NEGATIVE_OPEN: 'feedback_negative_open',
FEEDBACK_SUBMITTED: 'feedback_submitted',     // 带 with_svg: boolean, tags_count: number
FEEDBACK_SUBMIT_FAILED: 'feedback_submit_failed',
FEEDBACK_DONT_SHOW_AGAIN: 'feedback_dont_show_again',
```

---

## 7. i18n 文案（⚠️ 需你最终确认后再写入 JSON）

**新增命名空间** `feedback`，先给英文版（English first），其他 10 种语言后续翻译：

```json
"feedback": {
  "card": {
    "title": "How was your conversion?",
    "subtitle": "Help us make the tool better 👍",
    "positive": "Great",
    "negative": "Has issues",
    "close": "Close"
  },
  "modal": {
    "title": "Help us improve the conversion",
    "questionLabel": "Tell us what went wrong (select all that apply):",
    "tags": {
      "missing_elements": "Elements missing or disappeared",
      "blurry": "Blurry / pixelated",
      "color_issue": "Wrong colors or broken gradients",
      "transparency_failed": "Transparent background not working",
      "text_error": "Text rendered incorrectly",
      "other": "Other issue"
    },
    "descriptionLabel": "Other details (optional)",
    "descriptionPlaceholder": "Describe the issue...",
    "uploadLabel": "Yes, anonymously share my SVG to help fix it (recommended)",
    "privacyNote": "Your file is used only to improve rendering quality and is automatically deleted after processing.",
    "cancel": "Cancel",
    "submit": "Submit",
    "submitting": "Submitting..."
  },
  "toast": {
    "thanksPositive": "Thanks for your feedback! We'll keep improving 💪",
    "thanksNegative": "Thanks! Your input helps us improve the tool.",
    "submitFailed": "Submission failed. Please try again."
  },
  "settings": {
    "dontShowAgain": "Don't show feedback requests again"
  }
}
```

**🛑 SEO/i18n 重要提醒**：以上文案在写入 `messages/*.json` 之前必须你二次确认。下游执行时若你已审过，可直接落库；否则下游应只新增 `en.json` 并暂留 TODO。

---

## 8. 安全 & 隐私

| 项 | 措施 |
|----|------|
| Anon Key 暴露 | 不存在 — 全部走后端 service role |
| IP 直存 | ❌ 不存原始 IP，仅存 SHA-256(ip + salt) |
| SVG 内容审核 | 服务端校验 `<svg` 标签存在 + 大小限制 + MIME 校验 |
| XSS | SVG 文件存 Storage 私有桶，不公开访问；DB 字段不在前端 dangerouslySetInnerHTML 使用 |
| 限流 | 每 IP/小时 20 条；同 client_id 24h 内同 sentiment 只记 1 条（DB 唯一约束可选） |
| GDPR | 不收集 PII；隐私说明明确告知 |
| user_agent | 仅做技术统计，不与个人身份关联 |

---

## 9. 验收测试用例

| # | 场景 | 预期 |
|---|-----|------|
| 1 | 首次下载后 | 卡片在右下角弹出，8s 后自动淡出 |
| 2 | 点击 👍 | 卡片消失，Toast 显示感谢，DB 写入 sentiment=positive，cooldown 7 天 |
| 3 | 点击 👎 | 打开 Modal；未选 checkbox 时 Submit 禁用 |
| 4 | 选标签 + 提交（不上传 SVG） | DB 写入 issue_tags，svg_storage_path 为 null |
| 5 | 勾选上传 SVG + 提交 | Storage 出现新文件，DB svg_storage_path 正确指向 |
| 6 | SVG > 512KB | 服务端返回 400，前端 Toast 提示 |
| 7 | 1 小时内提交 21 次 | 第 21 次返回 429 |
| 8 | 勾选"不再显示" | 后续所有转换都不再弹出 |
| 9 | 移动端 | Modal 以 Bottom Sheet 形式呈现 |
| 10 | 键盘导航 | Tab 可遍历所有按钮，Enter 触发 |
| 11 | 关闭 3 次后 | 弹出概率显著降低 |

---

## 10. 实现优先级（建议给下游的迭代顺序）

**P0（MVP，1 期上线）：**
- Supabase 表 + Storage Bucket 建好
- `/api/feedback` 后端
- FeedbackCard + FeedbackModal（桌面端）
- 英文 i18n
- 触发逻辑（基础版，固定概率 0.5）
- 埋点

**P1（2 期）：**
- 移动端 Bottom Sheet 适配
- 触发策略优化（3 次未反馈提高概率）
- "不再显示"设置
- 完整 10 种语言翻译

**P2（可选）：**
- Supabase Edge Function 替代 Next.js API（如有冷启动诉求）
- 后台管理页查看反馈

---

## 11. 给下游执行的注意事项

1. **i18n JSON 改动是 SEO 关键路径**，所有非英语文案必须等用户确认后再改。
2. 修改 `CodeToPngConverter.tsx` 时遵循现有代码风格（hooks 顺序、命名）。
3. `downloadImage()` 是触发点，但要注意它在 try/finally 中临时切换格式状态，反馈触发应在 `finally` 之后或确认下载成功后调用。
4. Supabase 客户端只在 `app/api/feedback/route.ts` 中实例化，**禁止**在客户端代码 import service role key。
5. 新增依赖：`@supabase/supabase-js`（仅服务端用即可）。
6. lint 命令：`npm run lint`（提交前必跑）。
