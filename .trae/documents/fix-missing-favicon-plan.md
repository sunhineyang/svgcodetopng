# 修复浏览器标签页 Icon 丢失问题计划

## 1. 现状分析
用户反馈在浏览器标签页中，网站的图标（favicon）没有正常显示，而是显示了默认的地球图标。
经过对代码库的探索发现：
- 项目使用的是 Next.js App Router。
- 网站目前的图标配置是在 `app/layout.tsx` 和 `app/[locale]/layout.tsx` 中通过 `metadata.icons` 属性硬编码指定的，指向了 `/favicon.svg`。
- 这种硬编码方式生成的 `<link>` 标签缺少了 `type="image/svg+xml"` 属性。因为没有指定 MIME 类型，部分浏览器（如 Chrome）在某些情况下可能无法正确识别并渲染 SVG 格式的图标，从而导致 fallback 到默认图标。

## 2. 改进方案 (Proposed Changes)
利用 Next.js App Router 的内置静态文件约定来处理网站图标，这不仅能自动生成带有正确 MIME 类型和尺寸的标签，还能自动处理缓存 hash。

具体步骤如下：
1. **复制图标文件**：
   - 将 `public/favicon.svg` 复制一份到 `app/icon.svg`。注意：**仅复制，不要删除或移动原有的 `public/favicon.svg`**，因为其他地方可能仍在引用它。
   - Next.js 会自动探测 `app/icon.svg`，并在所有页面自动生成如 `<link rel="icon" href="/icon.svg?... " type="image/svg+xml" sizes="any">` 的标签。

2. **清理冗余配置**：
   - 在 `app/layout.tsx` 中，删除 `metadata` 对象里的 `icons` 配置块。
   - 在 `app/[locale]/layout.tsx` 中，删除 `generateMetadata` 函数里每个语言返回值中的 `icons` 配置块（共有 12 处）。

## 3. 假设与决策 (Assumptions & Decisions)
- **假设**：目前只有 `favicon.svg` 作为唯一图标。现代浏览器均已良好支持 SVG 作为 Favicon。通过 Next.js 的原生支持，自动补充的 `type="image/svg+xml"` 足够解决当前未显示的问题。
- **决策**：不再通过 metadata 繁琐地配置 icon，而是采用 Next.js 推荐的基于文件约定的路由配置（File-based metadata API）。

## 4. 验证步骤 (Verification steps)
- 执行代码修改后，运行 `npm run build` 和 `npm run dev`。
- 访问本地服务 `http://localhost:3000`。
- 查看 HTML `<head>` 源码，确认生成了正确的 `<link rel="icon" href="/icon.svg?..." type="image/svg+xml" sizes="any">` 标签。
- 刷新浏览器页面，确认浏览器标签页能够正确渲染并展示自定义图标。