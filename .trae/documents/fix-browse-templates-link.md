# 修复"浏览模板"按钮跳转计划

## 1. 现状分析

当前站点中有 3 处"浏览模板 / View Templates / Browse Templates"按钮：

| 位置 | 文件 | 行号 | 当前行为 |
|---|---|---|---|
| 首页 Hero 区 | `components/HeroSection.tsx` | 56-62 | `<Link href="/templates">` → 指向不存在的内部页面 |
| 首页 page.tsx | `app/[locale]/page.tsx` | 398-401 | `<button>` 纯按钮，无任何跳转 |
| CTA 区 | `components/CTASection.tsx` | 58-64 | `<Link href="/templates">` → 指向不存在的内部页面 |

问题：`/templates` 路由页面不存在，点击后要么 404，要么（page.tsx 中的）完全无反应。

## 2. 改进方案

将全部 3 处按钮改为跳转到外部链接 `https://svgtopng.app/free-svgs`（SVG TO PNG 网站的免费模板页）。

### 具体修改

#### 2.1 HeroSection.tsx（第 56-62 行）

```tsx
// 修改前：
<Link
  href="/templates"
  className="..."
>
  <PlayIcon className="w-5 h-5 mr-2" />
  View Templates
</Link>

// 修改后：
<a
  href="https://svgtopng.app/free-svgs"
  target="_blank"
  rel="noopener noreferrer"
  className="..."
>
  <PlayIcon className="w-5 h-5 mr-2" />
  View Templates
</a>
```

- `<Link>` 替换为 `<a>`（因为是外部链接，不需要 Next.js 客户端路由）
- 添加 `target="_blank"` 在新标签页打开
- 添加 `rel="noopener noreferrer"` 保证安全性

#### 2.2 CTASection.tsx（第 58-64 行）

同 HeroSection，将 `<Link href="/templates">` 替换为：
```tsx
<a
  href="https://svgtopng.app/free-svgs"
  target="_blank"
  rel="noopener noreferrer"
  className="..."
>
```

#### 2.3 app/[locale]/page.tsx（第 398-401 行）

这是目前最关键的修改——该按钮使用 i18n 翻译（`{t('hero.secondaryCta')}`），在不同语言下会显示对应文字，但它只是一个 `<button>` 没有任何跳转。

将 `<button>` 替换为：
```tsx
<a
  href="https://svgtopng.app/free-svgs"
  target="_blank"
  rel="noopener noreferrer"
  className="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-8 py-4 rounded-lg font-semibold transition-colors flex items-center gap-2 justify-center"
>
  <Layers className="w-5 h-5" />
  {t('hero.secondaryCta')}
</a>
```

## 3. 假设与决策

- **外部地址**：`https://svgtopng.app/free-svgs`（用户已确认）
- **打开方式**：新标签页打开（`target="_blank"`），不影响当前页面的转化流程
- **安全性**：添加 `rel="noopener noreferrer"` 防止 `window.opener` 安全风险
- **不修改翻译文件**：buttons 上的文本保持不变，已有的 i18n 翻译继续使用

## 4. 验证步骤

1. 启动开发服务器 `npm run dev`
2. 打开 `http://localhost:3000`
3. 分别检查 3 处"浏览模板"按钮：
   - 首页 Hero 区的 "View Templates" 按钮
   - 首页下方的 "Browse Templates" 按钮（page.tsx 中的 i18n 按钮）
   - 页面底部的 CTA 区的 "Browse Templates" 按钮
4. 确认点击后在新标签页打开 `https://svgtopng.app/free-svgs`
5. 切换到其他语言，确认按钮文字正确翻译且链接不变
