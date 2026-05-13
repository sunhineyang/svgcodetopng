/**
 * AI SVG 助手测试脚本 - 使用 mock 数据
 *
 * 测试核心模块的功能，不需要真实 API
 */

import {
  validateOutput,
  validateSvgSyntax,
  extractSvgCode,
  compareSvg,
  generateDiffDescription,
  createVersion,
  addVersion,
  rollbackToVersion,
  getCurrentVersion
} from '@/utils/ai-svg';

// 原始 SVG（来自首页）
const ORIGINAL_SVG = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
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
</svg>`;

// 场景 1：完美情况（纯 SVG 代码）
const MOCK_1_RESPONSE = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
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
  <circle cx="45" cy="55" r="4" fill="#007AFF" opacity="0.9"/>
  <circle cx="45" cy="157" r="4" fill="#007AFF" opacity="0.9"/>
</svg>`;

// 场景 2：带解释文字
const MOCK_2_RESPONSE = `好的，我已经优化了 SVG 代码，移除了冗余的属性和不必要的元素，同时保持了相同的视觉效果。以下是优化后的代码：

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
</svg>`;

// 场景 3：Markdown 格式
const MOCK_3_RESPONSE = `\`\`\`svg
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5f5f7"/>
      <stop offset="100%" stop-color="#e8e8ed"/>
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
    <circle cx="0" cy="0" r="22" fill="#007AFF"/>
    <path d="M-7 -3 L0 5 L7 -3" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </g>
  <g filter="url(#softShadow)">
    <rect x="20" y="135" width="160" height="45" rx="12" fill="white"/>
    <text x="100" y="164" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif" font-size="18" font-weight="600" fill="#1d1d1f">
      PNG Image
    </text>
  </g>
  <circle cx="45" cy="55" r="4" fill="#007AFF" opacity="0.9"/>
</svg>
\`\`\`

这应该可以了！`;

// 场景 4：不完整代码
const MOCK_4_RESPONSE = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="50" fill="purple"/>`;

/**
 * 运行测试
 */
console.log('🚀 AI SVG 助手 - 测试脚本\n');

console.log('='.repeat(60));
console.log('测试 1：场景 1 - 完美情况（纯 SVG 代码）');
console.log('='.repeat(60));

const result1 = validateOutput(MOCK_1_RESPONSE);
console.log('验证输出格式:', result1.isValid ? '✅ 通过' : '❌ 失败');
if (!result1.isValid) {
  console.log('问题:', result1.issues);
}
const extracted1 = extractSvgCode(MOCK_1_RESPONSE);
console.log('提取 SVG:', extracted1 ? '✅ 成功' : '❌ 失败');
if (extracted1) {
  const syntax1 = validateSvgSyntax(extracted1);
  console.log('语法验证:', syntax1.isValid ? '✅ 通过' : '❌ 失败');
}
console.log('\n');

console.log('='.repeat(60));
console.log('测试 2：场景 2 - 带解释文字');
console.log('='.repeat(60));

const result2 = validateOutput(MOCK_2_RESPONSE);
console.log('验证输出格式:', result2.isValid ? '✅ 通过' : '❌ 失败 (预期失败，但尝试提取)');
console.log('问题:', result2.issues);
const extracted2 = extractSvgCode(MOCK_2_RESPONSE);
console.log('提取 SVG:', extracted2 ? '✅ 成功' : '❌ 失败');
if (extracted2) {
  const syntax2 = validateSvgSyntax(extracted2);
  console.log('语法验证:', syntax2.isValid ? '✅ 通过' : '❌ 失败');
  // 对比
  const diff2 = compareSvg(ORIGINAL_SVG, extracted2);
  console.log('差异对比:');
  generateDiffDescription(diff2).forEach(line => console.log(`  ${line}`));
}
console.log('\n');

console.log('='.repeat(60));
console.log('测试 3：场景 3 - Markdown 格式');
console.log('='.repeat(60));

const result3 = validateOutput(MOCK_3_RESPONSE);
console.log('验证输出格式:', result3.isValid ? '✅ 通过' : '❌ 失败 (预期失败，但尝试提取)');
console.log('问题:', result3.issues);
const extracted3 = extractSvgCode(MOCK_3_RESPONSE);
console.log('提取 SVG:', extracted3 ? '✅ 成功' : '❌ 失败');
if (extracted3) {
  const syntax3 = validateSvgSyntax(extracted3);
  console.log('语法验证:', syntax3.isValid ? '✅ 通过' : '❌ 失败');
  // 对比
  const diff3 = compareSvg(ORIGINAL_SVG, extracted3);
  console.log('差异对比:');
  generateDiffDescription(diff3).forEach(line => console.log(`  ${line}`));
}
console.log('\n');

console.log('='.repeat(60));
console.log('测试 4：场景 4 - 不完整代码');
console.log('='.repeat(60));

const result4 = validateOutput(MOCK_4_RESPONSE);
console.log('验证输出格式:', result4.isValid ? '✅ 通过' : '❌ 失败 (预期)');
console.log('问题:', result4.issues);
const extracted4 = extractSvgCode(MOCK_4_RESPONSE);
console.log('提取 SVG:', extracted4 ? '✅ 成功提取片段' : '❌ 失败');
if (extracted4) {
  const syntax4 = validateSvgSyntax(extracted4);
  console.log('语法验证:', syntax4.isValid ? '✅ 通过' : '❌ 失败 (预期)');
  console.log('问题:', syntax4.issues);
}
console.log('\n');

console.log('='.repeat(60));
console.log('测试 5：版本管理');
console.log('='.repeat(60));

let versions = [];
console.log('初始状态: 0 个版本');

// 初始版本
const v1 = createVersion(ORIGINAL_SVG, '初始版本', false);
versions = addVersion(versions, v1);
console.log(`添加 v1 后: ${versions.length} 个版本`);

// AI 修改版本
const v2 = createVersion(MOCK_1_RESPONSE, 'AI 修改 - 优化代码', true);
versions = addVersion(versions, v2);
console.log(`添加 v2 后: ${versions.length} 个版本`);
console.log(`当前版本: v${getCurrentVersion(versions)?.id}`);

// 再添加几个版本
for (let i = 3; i <= 12; i++) {
  const v = createVersion(MOCK_1_RESPONSE, `测试版本 ${i}`, true);
  versions = addVersion(versions, v);
  console.log(`添加 v${i} 后: ${versions.length} 个版本 (最多 10 个)`);
}
console.log(`最终版本数: ${versions.length} (应该是 10)`);

// 测试回滚
const rollbackResult = rollbackToVersion(versions, versions[0].id);
if (rollbackResult) {
  versions = rollbackResult.versions;
  console.log('回滚到 v1');
  console.log(`当前版本: v${getCurrentVersion(versions)?.id}`);
}

console.log('\n✅ 测试完成！');
