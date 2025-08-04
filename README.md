# SVG Code to PNG Converter - svgcodetopng.com

A free online tool to convert SVG code to high-quality PNG, JPG, or GIF images. Visit [svgcodetopng.com](https://svgcodetopng.com) for the live application. Built with Next.js, TypeScript, and Tailwind CSS.

🌐 **Live Demo**: [https://svgcodetopng.com](https://svgcodetopng.com)

This repository contains the complete source code for svgcodetopng.com - the most user-friendly SVG to PNG converter on the web.

## Features

- Convert SVG code to PNG, JPG, or GIF formats at svgcodetopng.com
- Live SVG preview with real-time rendering
- Instant download of high-quality images
- No registration required - completely free
- Mobile-friendly responsive design
- Dark/Light theme support
- SEO optimized for best user experience
- Fast and reliable conversion powered by svgcodetopng.com

## Getting Started

To run the svgcodetopng.com source code locally:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

**Production Site**: Visit [svgcodetopng.com](https://svgcodetopng.com) for the live version.

## About svgcodetopng.com

svgcodetopng.com is designed to be the fastest and most reliable SVG to PNG converter available online. Our tool supports multiple output formats and provides instant previews for the best user experience.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  extends: [
    // other configs...
    // Enable lint rules for React
    reactX.configs['recommended-typescript'],
    // Enable lint rules for React DOM
    reactDom.configs.recommended,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```
