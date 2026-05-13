# AI 输入输出模拟用例

## 场景 1：完美情况（纯 SVG 代码）

### 用户输入
```
把圆形改成蓝色
```

### AI 预期输出（纯代码）
```xml
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5f5f7"/>
      <stop offset="100%" stop-color="#e8e8ed"/>
    </linearGradient>
    <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#007AFF"/>
      <stop offset="100%" stop-color="#5856D6"/>
    </linearGradient>
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#007AFF"/>
      <stop offset="100%" stop-color="#5AC8FA"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.08"/>
    </filter>
  </defs>
  <rect width="200" height="200" fill="url(#cardGradient)" rx="24"/>
  <g filter="url(#softShadow)">
    <rect x="20" y="25" width="160" height="60" rx="12" fill="white"/>
    <text x="100" y="62" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif" font-size="18" font-weight="600" fill="#1d1d1f">
      SVG Code
    </text>
  </g>
  <g transform="translate(100, 110)">
    <circle cx="0" cy="0" r="22" fill="url(#primaryGradient)"/>
    <path d="M-7 -3 L0 5 L7 -3" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <g filter="url(#softShadow)">
    <rect x="20" y="135" width="160" height="45" rx="12" fill="white"/>
    <text x="100" y="164" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif" font-size="18" font-weight="600" fill="#1d1d1f">
      PNG Image
    </text>
  </g>
  <circle cx="45" cy="55" r="4" fill="url(#iconGradient)" opacity="0.9"/>
  <circle cx="45" cy="157" r="4" fill="#007AFF" opacity="0.9"/>
</svg>
```

---

## 场景 2：AI 返回解释文字（需要解析）

### 用户输入
```
优化这个 SVG，压缩一下
```

### AI 输出（带解释，需要处理）
```
好的，我已经优化了 SVG 代码，移除了冗余的属性和不必要的元素，同时保持了相同的视觉效果。以下是优化后的代码：

<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f5f5f7"/>
      <stop offset="1" stop-color="#e8e8ed"/>
    </linearGradient>
    <linearGradient id="p" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#007AFF"/>
      <stop offset="1" stop-color="#5856D6"/>
    </linearGradient>
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.08"/>
    </filter>
  </defs>
  <rect width="200" height="200" fill="url(#g)" rx="24"/>
  <g filter="url(#s)">
    <rect x="20" y="25" width="160" height="60" rx="12" fill="#fff"/>
    <text x="100" y="62" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#1d1d1f">
      SVG Code
    </text>
  </g>
  <g transform="translate(100,110)">
    <circle cx="0" cy="0" r="22" fill="url(#p)"/>
    <path d="M-7 -3 L0 5 L7 -3" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </g>
  <g filter="url(#s)">
    <rect x="20" y="135" width="160" height="45" rx="12" fill="#fff"/>
    <text x="100" y="164" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#1d1d1f">
      PNG Image
    </text>
  </g>
  <circle cx="45" cy="55" r="4" fill="#007AFF" opacity="0.9"/>
  <circle cx="45" cy="157" r="4" fill="#007AFF" opacity="0.9"/>
</svg>
```

---

## 场景 3：AI 返回 Markdown 格式

### 用户输入
```
添加呼吸动画
```

### AI 输出
```
\`\`\`svg
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5f5f7"/>
      <stop offset="100%" stop-color="#e8e8ed"/>
    </linearGradient>
    <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#007AFF"/>
      <stop offset="100%" stop-color="#5856D6"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.08"/>
    </filter>
    <style>
      @keyframes breathe {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(0.98); }
      }
      .breathe { animation: breathe 3s ease-in-out infinite; }
    </style>
  </defs>
  <rect width="200" height="200" fill="url(#cardGradient)" rx="24"/>
  <g filter="url(#softShadow)">
    <rect x="20" y="25" width="160" height="60" rx="12" fill="white"/>
    <text x="100" y="62" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif" font-size="18" font-weight="600" fill="#1d1d1f">
      SVG Code
    </text>
  </g>
  <g transform="translate(100, 110)" class="breathe">
    <circle cx="0" cy="0" r="22" fill="url(#primaryGradient)"/>
    <path d="M-7 -3 L0 5 L7 -3" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <g filter="url(#softShadow)">
    <rect x="20" y="135" width="160" height="45" rx="12" fill="white"/>
    <text x="100" y="164" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif" font-size="18" font-weight="600" fill="#1d1d1f">
      PNG Image
    </text>
  </g>
  <circle cx="45" cy="55" r="4" fill="#007AFF" opacity="0.9"/>
  <circle cx="45" cy="157" r="4" fill="#007AFF" opacity="0.9"/>
</svg>
\`\`\`

这应该可以了！
```

---

## 场景 4：AI 返回不完整代码（需要验证失败）

### 用户输入
```
只改颜色
```

### AI 输出
```
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="50" fill="purple"/>
```

---

## 场景 5：多轮对话

### 对话历史
```
用户: 把圆形改成蓝色
助手: <svg>...蓝色...</svg>

用户: 再放大 2 倍
助手: <svg>...放大...</svg>
```

### 用户最新输入
```
添加阴影
```

### AI 预期输出
```xml
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="22" fill="#007AFF" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2))"/>
</svg>
```
