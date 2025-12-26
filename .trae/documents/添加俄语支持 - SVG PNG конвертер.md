# 添加俄语支持执行计划

## SEO 关键词策略
- **核心关键词**: SVG PNG конвертер (SVG PNG 转换器)
- **关键词密度**: 确保在页面中至少出现 10 次以上
- **关键词位置**: 标题、描述、导航、功能介绍、FAQ、CTA 等关键位置

## 执行步骤

### 1. 更新 i18n 配置文件
- 修改 `i18n.ts`: 在 locales 数组中添加 'ru'
- 修改 `middleware.ts`: 在 locales 数组中添加 'ru'

### 2. 创建俄语翻译文件
- 创建 `messages/ru.json`
- 完整翻译所有内容，保持与 en.json、ko.json、ja.json 相同的 key 结构
- 确保核心关键词 "SVG PNG конвертер" 在以下位置出现：
  - hero.title (1次)
  - hero.description (1次)
  - features.title (1次)
  - features.description (1次)
  - howItWorks.title (1次)
  - gallery.subtitle (1次)
  - testimonials.subtitle (1次)
  - faq.subtitle (1次)
  - cta.subtitle (1次)
  - converter.title (1次)
  - footer.description (1次)
  - 以及其他适当位置，确保总数 ≥10 次

### 3. 更新语言切换组件
- 修改 `components/LanguageSwitcher.tsx`
- 在 languages 数组中添加俄语选项：
  ```typescript
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
  ```
- 更新 getCurrentLanguage 函数以支持俄语路径检测

### 4. 更新布局元数据
- 修改 `app/[locale]/layout.tsx`
- 添加俄语元数据块 (locale === 'ru')
- 包含：
  - title: "SVG PNG конвертер - Бесплатный онлайн инструмент | Высокое качество"
  - description: 包含核心关键词
  - keywords: "SVG PNG конвертер, SVG код PNG конвертер, онлайн конвертер, бесплатно, высокое качество, мгновенно, прозрачный фон"
  - hreflang 配置 (包含所有 4 种语言)
  - OpenGraph 元数据 (locale: 'ru_RU')
  - Twitter Card 元数据
  - robots 配置

### 5. 测试验证
- 运行 `npm run dev` 启动开发服务器
- 访问 `http://localhost:3000/ru` 验证俄语页面
- 测试语言切换器是否正常工作
- 检查所有页面元素是否正确显示俄语
- 验证关键词密度是否达到要求 (≥10 次)

## 关键注意事项
- 确保翻译文件的所有 key 与其他语言文件完全一致
- 注意俄语语法和表达的自然性
- 关键词要自然融入，避免堆砌
- 保持与日语实现相同的 SEO 优化标准