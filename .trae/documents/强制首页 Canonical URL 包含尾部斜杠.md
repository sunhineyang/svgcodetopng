我已完成了详细调查。现状分析：

1. **当前问题**：Canonical URL 目前使用 `new URL('https://svgcodetopng.com')`，这可能不会生成带 `/` 的完整 URL
2. **环境变量**：项目中未使用环境变量管理域名，域名都是硬编码的
3. **影响范围**：

   * `app/[locale]/layout.tsx` - 所有语言的 metadata

   * `app/layout.tsx` - 根布局的 metadata

   * `public/sitemap.xml` - 站点地图

   * `public/robots.txt` - 站点地图引用

### 实施计划

#### 1. 创建环境变量配置

* 在项目根目录创建 `.env.example` 作为模板（不提交实际值）

* 添加 `NEXT_PUBLIC_SITE_URL` 变量

* 说明文档：如何在 `.env.local` 中配置（开发用 `localhost:3000`，生产用 `https://svgcodetopng.com/`）

#### 2. 创建域名配置工具

* 新建 `config/site.ts` 文件

* 导出统一的 `siteConfig` 对象，包含：

  * `url`（从环境变量读取）

  * `name`、`description` 等基础信息

* 提供类型安全保证

#### 3. 更新 metadata 配置

**方式一：在 metadataBase 中添加尾随斜杠**

```typescript
metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://svgcodetopng.com/')
```

**方式二：在 canonical 中明确指定完整 URL**

```typescript
alternates: {
  canonical: locale === 'en' ? '/' : `/${locale}`,
}
```

结合 metadataBase 自动解析为完整 URL

#### 4. 更新 sitemap.xml

* 使用环境变量读取域名

* 确保所有 URL 都带有尾随斜杠（如 `https://svgcodetopng.com/`）

#### 5. 更新 robots.txt

* Sitemap URL 使用环境变量

#### 6. 验证影响

* 确保所有生成的 Canonical URL 格式为 `https://svgcodetopng.com/` 或 `https://svgcodetopng.com/ko/`

* 其他语言版本：`https://svgcodetopng.com/ja/`、`https://svgcodetopng.com/ru/` 等

* 不破坏现有的 SEO 结构

### 关键点

* **环境变量**：`NEXT_PUBLIC_SITE_URL` 应该包含尾随斜杠（如 `https://svgcodetopng.com/`）

* **默认值**：开发环境使用 `http://localhost:3000/`，生产环境使用 `https://svgcodetopng.com/`

* **安全性**：`.env.local` 已被 `.gitignore` 忽略，不会泄露敏感信息

