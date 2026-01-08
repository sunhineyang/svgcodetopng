# SEO 元素实现文档

## 概述

本项目使用 Next.js 14 的 Metadata API 实现全面的 SEO 优化，支持多语言环境、动态 Canonical URL、Open Graph、Twitter Cards 等高级 SEO 功能。

## 架构设计

### 1. 配置文件结构

```
├── config/
│   └── site.ts              # 站点配置（域名、名称、描述）
├── app/
│   ├── robots.ts            # 动态 robots.txt 生成
│   ├── sitemap.ts           # 动态 sitemap.xml 生成
│   └── [locale]/
│       └── layout.tsx       # 多语言 metadata 生成
├── .env.example             # 环境变量模板
└── middleware.ts            # 语言路由中间件
```

### 2. 核心配置文件

#### `config/site.ts`

```typescript
export const siteConfig = {
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://svgcodetopng.com/',
  name: 'SVG Code to PNG Converter',
  description: 'Convert SVG code to high-quality PNG, JPG, or GIF images for free...',
} as const;

export const metadataBase = new URL(siteConfig.url);
```

**关键特性：**
- 使用环境变量 `NEXT_PUBLIC_SITE_URL` 管理域名
- `metadataBase` 作为全局基础 URL，用于所有 canonical URL 拼接
- 支持开发环境自动回退到默认值

#### 环境变量配置

```bash
# .env.example
NEXT_PUBLIC_SITE_URL=https://svgcodetopng.com/
```

**使用说明：**
- 在生产环境设置 `NEXT_PUBLIC_SITE_URL` 为实际域名
- `NEXT_PUBLIC_` 前缀确保客户端可访问
- 必须包含尾部斜杠 `/`

## 多语言 Metadata 实现

### 1. 动态 Metadata 生成

**文件：** `app/[locale]/layout.tsx`

```typescript
export async function generateMetadata({ params }: { params: { locale: string } }) {
  const locale = params.locale || 'en';
  
  // 根据语言返回不同的 metadata
  if (locale === 'ko') {
    return {
      metadataBase,
      title: 'SVG 코드를 PNG 변환기...',
      description: '...',
      alternates: {
        canonical: '/ko',
        languages: {
          'en-US': '/',
          'ko': '/ko',
          // ...
        },
      },
    };
  }
  
  // 默认英文 metadata
  return {
    metadataBase,
    title: 'SVG Code to PNG Converter...',
    alternates: {
      canonical: '/',
      languages: { /* ... */ },
    },
  };
}
```

### 2. 支持的语言列表

| 语言 | Locale Code | Canonical 路径 |
|------|-------------|----------------|
| 英语（默认） | en | `/` |
| 韩语 | ko | `/ko` |
| 日语 | ja | `/ja` |
| 俄语 | ru | `/ru` |
| 西班牙语 | es | `/es` |
| 法语 | fr | `/fr` |
| 德语 | de | `/de` |
| 中文 | zh | `/zh` |
| 葡萄牙语 | pt | `/pt` |
| 意大利语 | it | `/it` |
| 印尼语 | id | `/id` |
| 阿拉伯语 | ar | `/ar` |

### 3. Canonical URL 生成规则

#### 首页（英语）
```typescript
alternates: {
  canonical: '/',  // 相对路径
  languages: {
    'en-US': '/',
    'ko': '/ko',
    // ...
  },
}
```

**最终 Canonical URL：**
- `metadataBase` (`https://svgcodetopng.com/`) + `canonical` (`/`) = `https://svgcodetopng.com/`
- **必须带尾部斜杠**

#### 其他语言页面
```typescript
alternates: {
  canonical: '/ko',  // 相对路径，不带斜杠
  languages: {
    'en-US': '/',
    'ko': '/ko',
    // ...
  },
}
```

**最终 Canonical URL：**
- `metadataBase` (`https://svgcodetopng.com/`) + `canonical` (`/ko`) = `https://svgcodetopng.com/ko`
- **不带尾部斜杠**

### 4. Metadata 字段详解

每个语言版本包含以下字段：

#### 基础 SEO 字段
```typescript
{
  metadataBase,              // 基础 URL
  title,                     // 页面标题
  description,               // 页面描述
  keywords,                  // 关键词
  authors,                   // 作者信息
  creator,                   // 创建者
  publisher,                 // 发布者
  icons,                     // 图标配置
  formatDetection,           // 格式检测设置
}
```

#### 图标配置
```typescript
icons: {
  icon: '/favicon.svg',
  shortcut: '/favicon.svg',
  apple: '/favicon.svg',
}
```

#### Open Graph 配置
```typescript
openGraph: {
  title: 'SVG PNG 转换器...',
  description: '...',
  locale: 'zh_CN',
  type: 'website',
}
```

**用途：** 社交媒体分享时显示的预览信息（Facebook、LinkedIn 等）

#### Twitter Cards 配置
```typescript
twitter: {
  card: 'summary_large_image',
  title: 'SVG PNG 转换器...',
  description: '...',
}
```

**用途：** Twitter 分享时显示的大图卡片

#### Robots 配置
```typescript
robots: {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
}
```

**说明：**
- 允许搜索引擎索引和跟踪链接
- 允许大型图片预览
- 不限制视频预览和代码片段长度

## 动态 Sitemap 生成

**文件：** `app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://svgcodetopng.com/';
  
  const locales = ['en', 'ko', 'ja', 'ru', 'es', 'fr', 'de', 'zh', 'pt', 'it', 'id', 'ar'];
  
  const routes = locales.map(locale => ({
    url: `${baseUrl}${locale === 'en' ? '' : locale}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: locale === 'en' ? 1 : 0.9,
  }));

  return routes;
}
```

**特性：**
- 自动生成所有语言版本的 URL
- 根据环境变量动态调整域名
- 设置合理的更新频率和优先级
- 首页（英语）优先级为 1，其他语言为 0.9

## 动态 Robots.txt 生成

**文件：** `app/robots.ts`

```typescript
import { MetadataRoute } from 'next';
import { metadataBase } from '../config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${metadataBase.origin}/sitemap.xml`,
  };
}
```

**特性：**
- 允许所有搜索引擎爬取所有页面
- 自动引用当前环境的 sitemap URL
- 使用配置文件中的 `metadataBase` 确保一致性

## 路由和语言配置

**文件：** `middleware.ts`

```typescript
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ko', 'ja', 'ru', 'es', 'fr', 'de', 'zh', 'pt', 'it', 'id', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.svg|robots.txt|sitemap.xml).*)'],
};
```

**配置说明：**
- `localePrefix: 'as-needed'`：英语版本不显示 `/en` 前缀
- 默认语言为英语
- 排除静态文件和 API 路由

## SEO 最佳实践

### 1. Canonical URL 规范化

- **首页：** 必须带尾部斜杠（`https://svgcodetopng.com/`）
- **其他语言：** 不带尾部斜杠（`https://svgcodetopng.com/ko`）
- **目的：** 避免重复内容问题，告诉搜索引擎这是页面的权威版本

### 2. 多语言替代链接

每个语言版本的 `alternates.languages` 包含所有语言版本，帮助搜索引擎理解多语言结构：

```typescript
languages: {
  'en-US': '/',
  'ko': '/ko',
  'ja': '/ja',
  // ...
}
```

**效果：** 搜索引擎会在搜索结果中显示正确的语言版本。

### 3. 元数据本地化

每个语言版本都有完全本地化的：
- 标题
- 描述
- 关键词
- 作者信息
- Open Graph 内容

### 4. 图片优化

```typescript
openGraph: {
  type: 'website',
}
```

**注意：** 建议在 Open Graph 中添加图片字段以获得更好的社交媒体展示效果。

### 5. 移动端优化

```typescript
viewport: {
  width: 'device-width',
  initialScale: 1,
}
```

**响应式设计确保在所有设备上都有良好的用户体验。**

## 部署和环境配置

### 开发环境

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=http://localhost:3000/
```

### 生产环境

```bash
# .env.production
NEXT_PUBLIC_SITE_URL=https://svgcodetopng.com/
```

### 构建验证

```bash
# 类型检查
npm run typecheck

# 构建
npm run build
```

## SEO 监控和验证

### 1. 本地验证

启动开发服务器后，访问：
- http://localhost:3000/robots.txt
- http://localhost:3000/sitemap.xml

### 2. 页面源代码检查

查看 `<head>` 部分的元素：
```html
<link rel="canonical" href="https://svgcodetopng.com/">
<meta name="description" content="...">
<meta property="og:title" content="...">
<meta name="twitter:card" content="summary_large_image">
```

### 3. 在线工具验证

- Google Rich Results Test: https://search.google.com/test/rich-results
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator

## 性能优化

### 1. 静态生成

所有 metadata 在构建时生成，不会在运行时动态计算。

### 2. 缓存策略

- Sitemap: 每日更新
- Robots: 静态生成
- Metadata: 构建时生成

### 3. Core Web Vitals

项目已优化：
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)

## 常见问题

### Q: 为什么首页的 canonical 必须带斜杠？

A: 这是 SEO 最佳实践。根路径带斜杠表示这是目录的首页，搜索引擎更倾向于这种格式。同时，这与大多数用户的期望一致。

### Q: 其他语言为什么不带斜杠？

A: 这与 `middleware.ts` 中的 `localePrefix: 'as-needed'` 配置一致。其他语言版本通过路由参数访问，不需要尾部斜杠。

### Q: 如何添加新的语言版本？

A: 需要在以下文件中添加：
1. `middleware.ts`: 添加到 `locales` 数组
2. `app/[locale]/layout.tsx`: 添加新的语言分支
3. `app/sitemap.ts`: 添加到 `locales` 数组
4. 创建对应的翻译文件

### Q: 环境变量更改后需要重新构建吗？

A: 是的，因为 metadata 在构建时生成。更改环境变量后需要重新构建项目。

## 总结

本项目的 SEO 实现遵循了最新的 Next.js 最佳实践：

1. ✅ 使用 Next.js Metadata API
2. ✅ 支持 12 种语言
3. ✅ 动态生成 sitemap 和 robots.txt
4. ✅ 正确配置 Canonical URL
5. ✅ 完整的 Open Graph 和 Twitter Cards
6. ✅ 环境变量管理域名
7. ✅ 搜索引擎友好的 URL 结构
8. ✅ 移动端优化

所有配置都经过验证，确保在生产环境中提供最佳的 SEO 效果。
