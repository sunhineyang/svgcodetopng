// SVG 颜色提取和替换工具函数

/**
 * 从 SVG 字符串中提取所有颜色值
 * 支持格式：#fff, #ffffff, #ffffffff, rgb(), rgba(), hsl(), hsla()
 */
export function extractColors(svgString: string): string[] {
  const colors = new Set<string>();
  
  // 匹配 HEX 颜色
  const hexRegex = /#[0-9a-fA-F]{3,8}\b/g;
  let match: RegExpExecArray | null;
  while ((match = hexRegex.exec(svgString)) !== null) {
    let color = match[0];
    // 3位转6位
    if (color.length === 4) {
      color = `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
    }
    colors.add(color.toUpperCase());
  }
  
  // 匹配 RGB/RGBA
  const rgbRegex = /rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\)/gi;
  while ((match = rgbRegex.exec(svgString)) !== null) {
    colors.add(match[0]);
  }
  
  // 匹配 HSL/HSLA
  const hslRegex = /hsla?\((\d+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\)/gi;
  while ((match = hslRegex.exec(svgString)) !== null) {
    colors.add(match[0]);
  }
  
  return Array.from(colors).slice(0, 10); // 最多返回 10 个颜色
}

/**
 * 将颜色替换为新颜色
 * 支持：fill, stroke, stop-color, flood-color, color, animate values, CSS 属性
 */
export function replaceColor(
  svgString: string,
  oldColor: string,
  newColor: string
): string {
  if (!oldColor || !newColor || oldColor === newColor) return svgString;
  
  const escapedOld = escapeRegExp(oldColor);
  
  let result = svgString;
  
  // 1. XML 属性（带引号）
  const attrPatterns = [
    'fill', 'stroke', 'stop-color', 'flood-color', 'color',
    'solid-color', 'lighting-color', 'border-color', 'background-color',
  ];
  for (const attr of attrPatterns) {
    result = result.replace(
      new RegExp(`${attr}=["']${escapedOld}["']`, 'gi'),
      `${attr}="${newColor}"`
    );
  }
  
  // 2. animate/animateTransform 的 values 属性中的颜色（仅在 values 属性内替换，避免全局误替换）
  // 例如: values="#007AFF;#5856D6;#007AFF" 或 values="#007AFF;#fff;#007AFF"
  result = result.replace(
    new RegExp(`values="([^"]*${escapedOld}[^"]*)"`, 'gi'),
    (match, valuesStr) => {
      const newValues = valuesStr.replace(new RegExp(escapedOld, 'g'), newColor);
      return `values="${newValues}"`;
    }
  );
  
  // 3. CSS 内联样式属性（带分号）
  const cssPatterns = [
    'fill', 'stroke', 'stop-color', 'flood-color', 'color', 'background-color',
  ];
  for (const cssProp of cssPatterns) {
    result = result.replace(
      new RegExp(`(${cssProp}):\\s*${escapedOld}\\s*;`, 'gi'),
      `${cssProp}: ${newColor};`
    );
  }
  
  // 4. 处理不带分号的 CSS（行尾或字符串结尾）
  result = result.replace(
    new RegExp(`(fill):\\s*${escapedOld}([^;\\n"']*)$`, 'gi'),
    `fill: ${newColor}$2`
  );
  
  return result;
}

/**
 * 批量替换所有颜色
 */
export function replaceAllColors(
  svgString: string,
  colors: string[],
  newColor: string
): string {
  let result = svgString;
  for (const color of colors) {
    result = replaceColor(result, color, newColor);
  }
  return result;
}

/**
 * 校验是否为有效的 HEX 颜色
 */
export function isValidHex(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}){1,2}([0-9A-Fa-f]{2})?$/.test(color);
}

/**
 * 规范化颜色值（统一大写）
 */
export function normalizeColor(color: string): string {
  if (color.startsWith('#')) {
    return color.toUpperCase();
  }
  return color;
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 将颜色字符串转换为统一格式，便于比较
 */
export function colorEquals(a: string, b: string): boolean {
  return normalizeColor(a) === normalizeColor(b);
}
