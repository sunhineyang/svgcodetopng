# 修复首页 Canonical URL 实现方案

## 目标
- 首页 canonical URL：`https://svgcodetopng.com/`
- 其他语言 canonical URL：`https://svgcodetopng.com/zh`, `https://svgcodetopng.com/ko` 等（完整绝对 URL）

## 当前问题
1. **URL 格式不一致**：英语使用完整 URL，其他语言使用相对路径
2. **缺少印尼语 metadata**：middleware 支持 12 种语言，但 layout 只有 11 种
3. **尾部斜杠处理**：siteConfig.url 带尾部斜杠，可能产生双斜杠
4. **根布局语言列表不完整**：只包含部分语言的 hreflang

## 修复步骤

### 1. 修改 config/site.ts
- 移除 `siteConfig.url` 的尾部斜杠

### 2. 修改 app/layout.tsx
- 添加尾部斜杠到 canonical：`${siteConfig.url}/`
- 补全所有 12 种语言的 hreflang 链接

### 3. 修改 app/[locale]/layout.tsx
- 为所有 12 种语言使用完整的绝对 URL
- 将所有相对路径 canonical 改为 `${siteConfig.url}/locale`
- 添加缺失的印尼语（id）metadata 块
- 确保所有语言的语言列表完整一致

### 4. 更新 .env.example
- 移除 NEXT_PUBLIC_SITE_URL 的尾部斜杠
- 更新注释说明不包含尾部斜杠

## 修改文件清单
- config/site.ts
- app/layout.tsx
- app/[locale]/layout.tsx
- .env.example