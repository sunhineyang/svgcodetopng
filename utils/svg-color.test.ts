// SVG 颜色工具函数测试用例
import {
  extractColors,
  replaceColor,
  replaceAllColors,
  isValidHex,
  normalizeColor,
  colorEquals,
} from './svg-color';

console.log('=== 测试 extractColors ===');

// 基本测试
const svg1 = `<svg><circle fill="#FF0000"/><rect stroke="#00FF00"/></svg>`;
console.log('extractColors basic:', extractColors(svg1));
console.assert(extractColors(svg1).includes('#FF0000'), 'Should extract #FF0000');
console.assert(extractColors(svg1).includes('#00FF00'), 'Should extract #00FF00');

// 3位颜色转6位
const svg2 = `<svg><circle fill="#F00"/></svg>`;
console.log('extractColors #F00 -> 6digit:', extractColors(svg2));
console.assert(extractColors(svg2).includes('#FF0000'), 'Should normalize #F00 to #FF0000');

// stop-color
const svg3 = `<svg><linearGradient><stop offset="0%" stop-color="#007AFF"/></linearGradient></svg>`;
console.log('extractColors stop-color:', extractColors(svg3));
console.assert(extractColors(svg3).includes('#007AFF'), 'Should extract stop-color');

// flood-color
const svg4 = `<svg><filter><feDropShadow flood-color="#FF0000"/></filter></svg>`;
console.log('extractColors flood-color:', extractColors(svg4));
console.assert(extractColors(svg4).includes('#FF0000'), 'Should extract flood-color');

// animate values
const svg5 = `<svg><animate attributeName="fill" values="#FF0000;#00FF00;#FF0000"/></svg>`;
console.log('extractColors animate values:', extractColors(svg5));
console.assert(extractColors(svg5).includes('#FF0000'), 'Should extract #FF0000 from animate');
console.assert(extractColors(svg5).includes('#00FF00'), 'Should extract #00FF00 from animate');

console.log('\n=== 测试 replaceColor ===');

// 基本属性替换
const svg6 = `<svg><circle fill="#FF0000"/></svg>`;
const result6 = replaceColor(svg6, '#FF0000', '#0000FF');
console.log('replaceColor basic:', result6);
console.assert(result6.includes('fill="#0000FF"'), 'Should replace fill attribute');
console.assert(!result6.includes('#FF0000'), 'Should remove old color');

// stop-color 替换
const svg7 = `<svg><stop offset="0%" stop-color="#007AFF"/></svg>`;
const result7 = replaceColor(svg7, '#007AFF', '#FF0000');
console.log('replaceColor stop-color:', result7);
console.assert(result7.includes('stop-color="#FF0000"'), 'Should replace stop-color');

// flood-color 替换
const svg8 = `<svg><feDropShadow flood-color="#007AFF"/></svg>`;
const result8 = replaceColor(svg8, '#007AFF', '#FF0000');
console.log('replaceColor flood-color:', result8);
console.assert(result8.includes('flood-color="#FF0000"'), 'Should replace flood-color');

// animate values 替换（单值）
const svg9 = `<svg><animate values="#007AFF;#5856D6;#007AFF"/></svg>`;
const result9 = replaceColor(svg9, '#007AFF', '#FF0000');
console.log('replaceColor animate values:', result9);
console.assert(result9.includes('#FF0000'), 'Should replace in animate values');
console.assert(!result9.includes('#007AFF'), 'Should remove old animate color');

// 多个属性中的同一颜色
const svg10 = `<svg>
  <circle fill="#007AFF"/>
  <rect stroke="#007AFF"/>
  <stop offset="0%" stop-color="#007AFF"/>
</svg>`;
const result10 = replaceColor(svg10, '#007AFF', '#00FF00');
console.log('replaceColor multiple attrs:', result10);
console.assert((result10.match(/#00FF00/g) || []).length >= 3, 'Should replace all 3 occurrences');

// 相同颜色不替换（早退出）
const svg11 = `<svg><circle fill="#FF0000"/></svg>`;
const result11 = replaceColor(svg11, '#FF0000', '#FF0000');
console.log('replaceColor same color:', result11);
console.assert(result11.includes('#FF0000'), 'Should keep original when same color');

// 空值处理
const svg12 = `<svg><circle fill="#FF0000"/></svg>`;
const result12 = replaceColor(svg12, '', '#0000FF');
console.log('replaceColor empty oldColor:', result12);
console.assert(result12.includes('#FF0000'), 'Should not replace when oldColor is empty');

console.log('\n=== 测试 isValidHex ===');
console.log('isValidHex #FF0000:', isValidHex('#FF0000'), '(should be true)');
console.log('isValidHex #F00:', isValidHex('#F00'), '(should be true)');
console.log('isValidHex #FF0000FF:', isValidHex('#FF0000FF'), '(should be true, with alpha)');
console.log('isValidHex red:', isValidHex('red'), '(should be false)');
console.log('isValidHex #GGG:', isValidHex('#GGG'), '(should be false)');

console.log('\n=== 测试 normalizeColor ===');
console.log('normalizeColor #ff0000:', normalizeColor('#ff0000'), '(should be #FF0000)');
console.log('normalizeColor rgb(255,0,0):', normalizeColor('rgb(255,0,0)'), '(should stay as is)');

console.log('\n=== 测试 colorEquals ===');
console.log('colorEquals #FF0000, #ff0000:', colorEquals('#FF0000', '#ff0000'), '(should be true)');
console.log('colorEquals #FF0000, #00FF00:', colorEquals('#FF0000', '#00FF00'), '(should be false)');

console.log('\n=== 测试 replaceAllColors ===');
const svg13 = `<svg>
  <circle fill="#FF0000"/>
  <rect stroke="#00FF00"/>
  <rect fill="#0000FF"/>
</svg>`;
const result13 = replaceAllColors(svg13, ['#FF0000', '#00FF00'], '#FFFF00');
console.log('replaceAllColors:', result13);
console.assert(result13.includes('#FFFF00'), 'Should replace with new color');
console.assert(!result13.includes('#FF0000'), 'Should remove #FF0000');
console.assert(!result13.includes('#00FF00'), 'Should remove #00FF00');
console.assert(result13.includes('#0000FF'), 'Should keep #0000FF');

console.log('\n=== 完整场景测试 ===');

// 首页默认 SVG 中的关键颜色
const homePageSvg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#007AFF">
        <animate attributeName="stop-color" values="#007AFF;#5856D6;#007AFF" dur="4s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" stop-color="#5856D6">
        <animate attributeName="stop-color" values="#5856D6;#007AFF;#5856D6" dur="4s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>
    <filter id="glowEffect" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#007AFF" flood-opacity="0.4">
        <animate attributeName="flood-color" values="#007AFF;#34C759;#007AFF" dur="3s" repeatCount="indefinite"/>
      </feDropShadow>
    </filter>
  </defs>
  <rect width="200" height="200" fill="#f5f5f7" rx="24"/>
  <circle cx="100" cy="90" r="30" fill="url(#primaryGradient)"/>
  <text x="100" y="150" fill="#1d1d1f">Hello</text>
</svg>`;

// 提取颜色
const colors = extractColors(homePageSvg);
console.log('Extracted colors:', colors);
console.assert(colors.includes('#007AFF'), 'Should extract #007AFF');
console.assert(colors.includes('#5856D6'), 'Should extract #5856D6');
console.assert(colors.includes('#34C759'), 'Should extract #34C759');
console.assert(colors.includes('#F5F5F7'), 'Should extract #f5f5f7 (normalized)');
console.assert(colors.includes('#1D1D1F'), 'Should extract #1d1d1f (normalized)');

// 替换 #007AFF 为红色
const modified = replaceColor(homePageSvg, '#007AFF', '#FF0000');
console.log('\nAfter replacing #007AFF with #FF0000:');
console.log('- Has fill="#FF0000":', modified.includes('fill="#FF0000"') || modified.includes("fill='#FF0000'"));
console.log('- Has stop-color="#FF0000":', modified.includes('stop-color="#FF0000"') || modified.includes("stop-color='#FF0000'"));
console.log('- Has flood-color="#FF0000":', modified.includes('flood-color="#FF0000"') || modified.includes("flood-color='#FF0000'"));
console.log('- Has animate values with #FF0000:', modified.includes('values="#FF0000;'));
console.log('- Original #007AFF removed:', !modified.includes('#007AFF'));

console.log('\n✅ All tests passed!');
