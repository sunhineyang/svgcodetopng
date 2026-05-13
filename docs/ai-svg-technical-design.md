# AI SVG 助手技术实现方案

## 一、文件结构设计

```
utils/
├── ai-svg/
│   ├── types.ts              # 类型定义
│   ├── prompts.ts            # Prompt 构建
│   ├── validator.ts          # 验证器
│   ├── extractor.ts          # SVG 提取器
│   ├── differ.ts             # 差异对比
│   ├── ai-api.ts            # AI API 调用
│   └── index.ts             # 统一导出

components/
├── AiSvgAssistant.tsx       # AI 助手主组件
├── AiPromptButtons.tsx      # 快捷提示按钮
├── AiInputBar.tsx           # 输入栏
├── AiConversationHistory.tsx # 对话历史显示
├── AiVersionTimeline.tsx    # 版本时间线
├── AiDiffViewer.tsx         # 差异查看器

hooks/
└── useAiSvgAssistant.ts    # AI 助手 Hook
```

---

## 二、数据结构定义

### 2.1 AI 对话记录

```typescript
// utils/ai-svg/types.ts

/**
 * 对话轮次
 */
export interface ConversationTurn {
  /** 角色：user 或 assistant */
  role: 'user' | 'assistant';
  /** 消息内容 */
  content: string;
  /** 时间戳 */
  timestamp: number;
  /** AI 回复时的代码快照 */
  svgSnapshot?: string;
}

/**
 * SVG 版本记录
 */
export interface SvgVersion {
  /** 版本 ID */
  id: string;
  /** SVG 代码 */
  code: string;
  /** 创建时间 */
  timestamp: number;
  /** 版本描述 */
  description: string;
  /** 是否为当前版本 */
  isCurrent: boolean;
  /** 是否为 AI 修改 */
  isAiModified: boolean;
}

/**
 * SVG 差异信息
 */
export interface SvgDiff {
  /** 新增元素 */
  added: DiffElement[];
  /** 删除元素 */
  removed: DiffElement[];
  /** 修改属性 */
  modified: DiffModification[];
}

/**
 * 差异元素
 */
export interface DiffElement {
  /** 元素类型 */
  type: string;
  /** 元素索引 */
  index: number;
  /** 完整元素标签 */
  raw: string;
  /** 属性 */
  properties: Record<string, any>;
}

/**
 * 属性修改
 */
export interface DiffModification {
  /** 元素类型 */
  element: string;
  /** 元素索引 */
  index: number;
  /** 属性名 */
  property: string;
  /** 旧值 */
  oldValue: any;
  /** 新值 */
  newValue: any;
}

/**
 * AI 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  isValid: boolean;
  /** 问题列表 */
  issues: string[];
  /** 原始响应 */
  rawResponse?: string;
}

/**
 * AI 调用配置
 */
export interface AiConfig {
  /** API 端点 */
  apiEndpoint: string;
  /** API 密钥 */
  apiKey?: string;
  /** 模型名称 */
  model?: string;
  /** 最大 tokens */
  maxTokens?: number;
  /** 温度参数 */
  temperature?: number;
}

/**
 * 快捷提示词配置
 */
export interface QuickPrompt {
  /** 显示文本 */
  label: string;
  /** 图标 */
  icon?: string;
  /** 提示词内容 */
  prompt: string;
  /** 是否启用 */
  enabled?: boolean;
}
```

---

## 三、Prompt 构建

### 3.1 System Prompt

```typescript
// utils/ai-svg/prompts.ts

/**
 * System Prompt - 角色定义和强制规则
 */
export const SYSTEM_PROMPT = `# 角色定义
你是一个专业的 SVG 代码修改助手。

# 核心规则（必须严格执行）

## 规则 1：输出格式
- **只能输出 SVG 代码**，不要任何其他内容
- **禁止使用 Markdown 格式**，不要代码块标记
- **禁止添加解释、说明、注释**

## 规则 2：代码完整性
- 必须包含完整的 <svg> 开始标签
- 必须包含 </svg> 结束标签
- 所有子元素必须正确闭合

## 规则 3：保持一致性
- 保持原有的 viewBox 和 width/height
- 不要改变未要求修改的部分
- 保持原有的元素 ID 和结构

## 规则 4：SVG 标准
- 使用标准的 SVG 属性
- 不要使用 CSS 样式属性
- 确保属性值格式正确

## 错误处理
- 如果无法完成修改，输出原始 SVG 代码
- 如果用户需求不明确，输出原始 SVG 代码
- **永远不要输出 SVG 代码以外的任何内容**

# 输出格式示例

✅ 正确输出：
<svg width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="50" fill="blue"/></svg>

❌ 错误输出（不要这样）：
已修改完成：<svg>...</svg>

❌ 错误输出（不要这样）：
\`\`\`svg
<svg>...</svg>
\`\`\`

❌ 错误输出（不要这样）：
我将把圆形改成蓝色。以下是代码：<svg>...</svg>

# 重要提醒
输出时，直接写代码，不要有任何前缀或后缀。`;

/**
 * 构建用户 Prompt
 */
export const buildUserPrompt = (
  conversationHistory: ConversationTurn[],
  currentSvgCode: string,
  userIntent: string
): string => {
  let prompt = '';

  // 1. 对话历史（最多 3 轮）
  if (conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-6);
    prompt += `# 对话历史（仅供理解上下文）\n\n`;
    prompt += recentHistory.map(turn => {
      return `${turn.role === 'user' ? '用户' : '助手'}: ${turn.content}`;
    }).join('\n');
    prompt += '\n\n';
  }

  // 2. 当前 SVG 代码
  prompt += `# 当前 SVG 代码\n\n`;
  prompt += `\`\`\`xml\n${currentSvgCode}\n\`\`\`\n\n`;

  // 3. 用户需求
  prompt += `# 用户需求\n\n${userIntent}\n\n`;

  // 4. 明确输出要求
  prompt += `# 输出要求\n\n请根据用户需求修改 SVG 代码，直接输出修改后的完整 SVG 代码。不要添加任何解释文字。`;

  return prompt;
};
```

---

## 四、验证器

```typescript
// utils/ai-svg/validator.ts

import { ValidationResult } from './types';

/**
 * 验证 AI 输出格式
 */
export const validateOutput = (output: string): ValidationResult => {
  const issues: string[] = [];
  const trimmed = output.trim();

  // 问题 1：包含解释文字
  const explanationPatterns = [
    '已修改',
    '修改完成',
    '以下是',
    '代码如下',
    '已为您',
    '我来帮你',
    '好的',
    '可以的',
    '好的，',
    '已完成',
    '修改后的',
  ];

  for (const pattern of explanationPatterns) {
    if (trimmed.startsWith(pattern)) {
      issues.push(`包含解释文字: "${pattern}"`);
      break;
    }
  }

  // 问题 2：Markdown 格式
  if (trimmed.includes('```')) {
    issues.push('包含 Markdown 代码块标记');
  }

  // 问题 3：不完整代码
  if (!trimmed.includes('<svg')) {
    issues.push('缺少 <svg> 标签');
  }

  if (!trimmed.includes('</svg>')) {
    issues.push('缺少 </svg> 标签');
  }

  return {
    isValid: issues.length === 0,
    issues,
    rawResponse: output
  };
};

/**
 * XML 语法验证
 */
export const validateSvgSyntax = (svgCode: string): ValidationResult => {
  const issues: string[] = [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgCode, 'image/svg+xml');

    // 检查解析错误
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      const errorText = parseError.textContent || 'XML 解析错误';
      issues.push(`XML 语法错误: ${errorText.substring(0, 100)}`);
    }

    // 检查是否有 svg 元素
    const svg = doc.querySelector('svg');
    if (!svg) {
      issues.push('文档中未找到 <svg> 元素');
    }

  } catch (error) {
    issues.push(`解析异常: ${(error as Error).message}`);
  }

  return {
    isValid: issues.length === 0,
    issues
  };
};

/**
 * SVG 渲染验证
 */
export const validateSvgRender = (svgCode: string): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    const issues: string[] = [];

    try {
      const svgBlob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();

      const timeout = setTimeout(() => {
        URL.revokeObjectURL(url);
        issues.push('渲染超时');
        resolve({ isValid: false, issues });
      }, 5000);

      img.onload = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(url);
        resolve({ isValid: true, issues: [] });
      };

      img.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(url);
        issues.push('图片加载失败');
        resolve({ isValid: false, issues });
      };

      img.src = url;
    } catch (error) {
      issues.push(`创建图片失败: ${(error as Error).message}`);
      resolve({ isValid: false, issues });
    }
  });
};

/**
 * 完整验证流程
 */
export const validateSvg = async (svgCode: string): Promise<ValidationResult> => {
  // 1. 格式验证
  const formatResult = validateOutput(svgCode);
  if (!formatResult.isValid) {
    return formatResult;
  }

  // 2. 语法验证
  const syntaxResult = validateSvgSyntax(svgCode);
  if (!syntaxResult.isValid) {
    return syntaxResult;
  }

  // 3. 渲染验证
  const renderResult = await validateSvgRender(svgCode);
  if (!renderResult.isValid) {
    return renderResult;
  }

  return { isValid: true, issues: [] };
};
```

---

## 五、SVG 代码提取器

```typescript
// utils/ai-svg/extractor.ts

/**
 * 从 AI 响应中提取 SVG 代码
 */
export const extractSvgCode = (response: string): string | null => {
  const trimmed = response.trim();

  // 策略 1：直接以 <svg 开头
  if (trimmed.startsWith('<svg')) {
    return extractCompleteSvg(trimmed);
  }

  // 策略 2：Markdown 代码块
  const codeBlockPatterns = [
    /```(?:\w+)?\n?([\s\S]*?)```/g,  // ```svg ... ```
    /`{3}(\w+)?\n?([\s\S]*?)`{3}/g,  // ` ` ` ... ` ` `
  ];

  for (const pattern of codeBlockPatterns) {
    let match;
    while ((match = pattern.exec(trimmed)) !== null) {
      const code = (match[2] || match[1]).trim();
      if (code.includes('<svg') && code.includes('</svg>')) {
        return extractCompleteSvg(code);
      }
    }
  }

  // 策略 3：从文本中提取
  if (trimmed.includes('<svg') && trimmed.includes('</svg>')) {
    const startIdx = trimmed.indexOf('<svg');
    const endIdx = trimmed.lastIndexOf('</svg>') + 6;
    const extracted = trimmed.substring(startIdx, endIdx);
    if (extracted.includes('<svg') && extracted.includes('</svg>')) {
      return extractCompleteSvg(extracted);
    }
  }

  return null;
};

/**
 * 提取完整的 SVG（处理多余内容）
 */
const extractCompleteSvg = (text: string): string => {
  // 找到 <svg 开始位置
  const startMatch = text.match(/<svg[\s>]/);
  if (!startMatch) return text;

  const startIdx = text.indexOf(startMatch[0]);
  let extracted = text.substring(startIdx);

  // 计数匹配标签
  let depth = 0;
  let inTag = false;
  let inString = false;
  let stringChar = '';
  let endIdx = -1;

  for (let i = 0; i < extracted.length; i++) {
    const char = extracted[i];

    // 处理字符串
    if ((char === '"' || char === "'") && !inString && (i === 0 || extracted[i - 1] !== '\\')) {
      inString = true;
      stringChar = char;
    } else if (char === stringChar && inString && extracted[i - 1] !== '\\') {
      inString = false;
      stringChar = '';
    }

    // 不在字符串内处理标签
    if (!inString) {
      if (char === '<') {
        // 检查是否是注释或 DOCTYPE
        if (extracted.substring(i, i + 4) === '<!--') {
          const commentEnd = extracted.indexOf('-->', i);
          if (commentEnd !== -1) {
            i = commentEnd + 2;
            continue;
          }
        }
        if (extracted.substring(i, i + 9) === '<![CDATA[') {
          const cdataEnd = extracted.indexOf(']]>', i);
          if (cdataEnd !== -1) {
            i = cdataEnd + 2;
            continue;
          }
        }

        // 检查是开始标签还是结束标签
        if (extracted.substring(i, i + 2) === '</') {
          depth--;
          if (depth === 0) {
            endIdx = i + extracted.substring(i).indexOf('>') + 1;
            break;
          }
        } else if (extracted[i + 1] !== '!') {
          depth++;
        }
      }
    }
  }

  if (endIdx === -1) {
    // 如果没找到完整的结束标签，尝试找 </svg>
    const svgEndMatch = extracted.match(/<\/svg>/i);
    if (svgEndMatch) {
      endIdx = extracted.indexOf(svgEndMatch[0]) + svgEndMatch[0].length;
    } else {
      // 返回原文本，让后续验证处理
      return extracted;
    }
  }

  return extracted.substring(0, endIdx);
};

/**
 * 清理 SVG 代码
 */
export const cleanSvgCode = (svgCode: string): string => {
  // 移除 BOM
  let cleaned = svgCode.replace(/^\uFEFF/, '');

  // 移除 XML 声明
  cleaned = cleaned.replace(/<\?xml[^?]*\?>/gi, '');

  // 移除 DOCTYPE
  cleaned = cleaned.replace(/<!DOCTYPE[^>]*>/gi, '');

  // 清理多余空白
  cleaned = cleaned.replace(/\s+/g, ' ');

  // 清理注释
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  return cleaned.trim();
};
```

---

## 六、差异对比

```typescript
// utils/ai-svg/differ.ts

import { SvgDiff, DiffElement, DiffModification } from './types';

/**
 * 解析 SVG 元素
 */
const parseSvgElements = (svgCode: string): DiffElement[] => {
  const elements: DiffElement[] = [];

  // 匹配所有标签
  const tagRegex = /<(\w+)([^>]*?)(\/?)>/g;
  let match;
  let index = 0;

  while ((match = tagRegex.exec(svgCode)) !== null) {
    const tagName = match[1];
    const attributes = match[2];
    const isSelfClosing = match[3] === '/';

    // 解析属性
    const props: Record<string, any> = {};
    const attrRegex = /(\w+(?:-\w+)?)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
    let attrMatch;

    while ((attrMatch = attrRegex.exec(attributes)) !== null) {
      props[attrMatch[1]] = attrMatch[2] || attrMatch[3] || '';
    }

    elements.push({
      type: tagName,
      index,
      raw: match[0],
      properties: props
    });

    index++;
  }

  return elements;
};

/**
 * 对比两个 SVG 代码
 */
export const compareSvg = (oldCode: string, newCode: string): SvgDiff => {
  const diff: SvgDiff = {
    added: [],
    removed: [],
    modified: []
  };

  const oldElements = parseSvgElements(oldCode);
  const newElements = parseSvgElements(newCode);

  // 使用简单的位置对比（更智能的方案需要 DOM 结构对比）
  const maxLen = Math.max(oldElements.length, newElements.length);

  for (let i = 0; i < maxLen; i++) {
    const oldEl = oldElements[i];
    const newEl = newElements[i];

    if (!oldEl && newEl) {
      // 新增元素
      diff.added.push(newEl);
    } else if (oldEl && !newEl) {
      // 删除元素
      diff.removed.push(oldEl);
    } else if (oldEl && newEl) {
      // 检查属性修改
      const allKeys = new Set([
        ...Object.keys(oldEl.properties),
        ...Object.keys(newEl.properties)
      ]);

      for (const key of allKeys) {
        const oldVal = oldEl.properties[key];
        const newVal = newEl.properties[key];

        if (oldVal !== newVal) {
          diff.modified.push({
            element: newEl.type,
            index: newEl.index,
            property: key,
            oldValue: oldVal || '(无)',
            newValue: newVal || '(无)'
          });
        }
      }
    }
  }

  return diff;
};

/**
 * 生成可读的差异描述
 */
export const generateDiffDescription = (diff: SvgDiff): string[] => {
  const descriptions: string[] = [];

  if (diff.added.length > 0) {
    descriptions.push(`✅ 新增 ${diff.added.length} 个元素`);
    diff.added.slice(0, 3).forEach(el => {
      descriptions.push(`   + ${el.type}`);
    });
    if (diff.added.length > 3) {
      descriptions.push(`   ...还有 ${diff.added.length - 3} 个`);
    }
  }

  if (diff.removed.length > 0) {
    descriptions.push(`❌ 删除 ${diff.removed.length} 个元素`);
    diff.removed.slice(0, 3).forEach(el => {
      descriptions.push(`   - ${el.type}`);
    });
    if (diff.removed.length > 3) {
      descriptions.push(`   ...还有 ${diff.removed.length - 3} 个`);
    }
  }

  if (diff.modified.length > 0) {
    descriptions.push(`✏️  修改 ${diff.modified.length} 处`);
    diff.modified.slice(0, 5).forEach(mod => {
      const oldVal = String(mod.oldValue).substring(0, 20);
      const newVal = String(mod.newValue).substring(0, 20);
      descriptions.push(
        `   • ${mod.element}.${mod.property}: ${oldVal} → ${newVal}`
      );
    });
    if (diff.modified.length > 5) {
      descriptions.push(`   ...还有 ${diff.modified.length - 5} 处`);
    }
  }

  if (descriptions.length === 0) {
    descriptions.push('代码未发生变化');
  }

  return descriptions;
};
```

---

## 七、AI API 调用

```typescript
// utils/ai-svg/ai-api.ts

import { AiConfig, ConversationTurn } from './types';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts';

/**
 * 调用 AI API
 */
export const callAI = async (
  config: AiConfig,
  conversationHistory: ConversationTurn[],
  currentSvgCode: string,
  userIntent: string
): Promise<string> => {
  const { apiEndpoint, apiKey, model = 'gpt-4', maxTokens = 2000, temperature = 0.3 } = config;

  const systemPrompt = SYSTEM_PROMPT;
  const userPrompt = buildUserPrompt(conversationHistory, currentSvgCode, userIntent);

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...(conversationHistory.length > 0 ? conversationHistory.map(turn => ({
          role: turn.role,
          content: turn.content
        })) : []),
        { role: 'user', content: userPrompt }
      ],
      max_tokens: maxTokens,
      temperature
    })
  });

  if (!response.ok) {
    throw new Error(`AI API 请求失败: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // 解析不同 API 格式
  if (data.choices && data.choices[0]) {
    return data.choices[0].message.content;
  }

  if (data.response) {
    return data.response;
  }

  if (typeof data === 'string') {
    return data;
  }

  throw new Error('AI 响应格式无法解析');
};

/**
 * 完整的 AI 工作流
 */
export const aiSvgWorkflow = async (
  config: AiConfig,
  conversationHistory: ConversationTurn[],
  currentSvgCode: string,
  userIntent: string
): Promise<{
  success: boolean;
  svgCode?: string;
  error?: string;
  validationIssues?: string[];
}> => {
  try {
    // 1. 调用 AI
    const aiResponse = await callAI(config, conversationHistory, currentSvgCode, userIntent);

    // 2. 提取 SVG 代码
    const { extractSvgCode } = await import('./extractor');
    let svgCode = extractSvgCode(aiResponse);

    if (!svgCode) {
      return {
        success: false,
        error: '无法从 AI 响应中提取 SVG 代码',
        validationIssues: ['AI 输出格式不正确']
      };
    }

    // 3. 验证 SVG
    const { validateSvg } = await import('./validator');
    const validation = await validateSvg(svgCode);

    if (!validation.isValid) {
      return {
        success: false,
        error: 'SVG 代码验证失败',
        validationIssues: validation.issues
      };
    }

    return {
      success: true,
      svgCode
    };

  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
};
```

---

## 八、快捷提示词配置

```typescript
// utils/ai-svg/quick-prompts.ts

import { QuickPrompt } from './types';

export const QUICK_PROMPTS: QuickPrompt[] = [
  {
    label: '优化代码',
    icon: '✨',
    prompt: '优化这段 SVG 代码，移除冗余属性和不必要的元素，压缩代码体积但保持可读性。'
  },
  {
    label: '改变颜色',
    icon: '🎨',
    prompt: '把所有颜色改成蓝色渐变效果（#007AFF 到 #5856D6）。'
  },
  {
    label: '调整尺寸',
    icon: '📏',
    prompt: '把 SVG 尺寸放大 2 倍，同时保持所有元素的比例和位置不变。'
  },
  {
    label: '添加动画',
    icon: '✨',
    prompt: '给图形添加简单的呼吸动画效果（透明度或缩放变化），动画时长 3 秒，无限循环。'
  },
  {
    label: '添加阴影',
    icon: '🌫️',
    prompt: '给主要图形添加柔和的阴影效果（blur: 8px, offset: 0 4px, opacity: 0.2）。'
  },
  {
    label: '居中裁剪',
    icon: '✂️',
    prompt: '调整 viewBox 使图形居中显示，并添加适当的边距（20px）。'
  }
];
```

---

## 九、版本管理

```typescript
// utils/ai-svg/version-manager.ts

import { SvgVersion } from './types';

const MAX_VERSIONS = 10;

/**
 * 创建新版本
 */
export const createVersion = (
  code: string,
  description: string,
  isAiModified: boolean = false
): SvgVersion => {
  return {
    id: Date.now().toString(),
    code,
    timestamp: Date.now(),
    description,
    isCurrent: true,
    isAiModified
  };
};

/**
 * 添加版本（自动清理旧版本）
 */
export const addVersion = (
  versions: SvgVersion[],
  newVersion: SvgVersion
): SvgVersion[] => {
  // 移除所有版本的 isCurrent 标记
  const updated = versions.map(v => ({ ...v, isCurrent: false }));

  // 添加新版本
  const withNew = [...updated, newVersion];

  // 如果超过最大数量，删除最早的版本
  if (withNew.length > MAX_VERSIONS) {
    return withNew.slice(-MAX_VERSIONS);
  }

  return withNew;
};

/**
 * 回滚到指定版本
 */
export const rollbackToVersion = (
  versions: SvgVersion[],
  versionId: string
): { versions: SvgVersion[]; code: string } | null => {
  const targetVersion = versions.find(v => v.id === versionId);

  if (!targetVersion) {
    return null;
  }

  // 更新版本列表
  const updated = versions.map(v => ({
    ...v,
    isCurrent: v.id === versionId
  }));

  return {
    versions: updated,
    code: targetVersion.code
  };
};

/**
 * 获取当前版本
 */
export const getCurrentVersion = (versions: SvgVersion[]): SvgVersion | null => {
  return versions.find(v => v.isCurrent) || null;
};
```

---

## 十、API 路由设计

```typescript
// app/api/ai-svg/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/utils/ai-svg/ai-api';
import { extractSvgCode } from '@/utils/ai-svg/extractor';
import { validateSvg } from '@/utils/ai-svg/validator';
import { ConversationTurn } from '@/utils/ai-svg/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationHistory, currentSvgCode, userIntent } = body;

    // 验证必需参数
    if (!currentSvgCode || !userIntent) {
      return NextResponse.json(
        { error: '缺少必需参数' },
        { status: 400 }
      );
    }

    // AI 配置（从环境变量读取）
    const aiConfig = {
      apiEndpoint: process.env.AI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions',
      apiKey: process.env.AI_API_KEY,
      model: process.env.AI_MODEL || 'gpt-4',
      maxTokens: 2000,
      temperature: 0.3
    };

    // 调用 AI
    const aiResponse = await callAI(
      aiConfig,
      conversationHistory || [],
      currentSvgCode,
      userIntent
    );

    // 提取 SVG 代码
    const svgCode = extractSvgCode(aiResponse);

    if (!svgCode) {
      return NextResponse.json({
        success: false,
        error: '无法从 AI 响应中提取 SVG 代码',
        rawResponse: aiResponse
      }, { status: 422 });
    }

    // 验证 SVG
    const validation = await validateSvg(svgCode);

    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'SVG 验证失败',
        issues: validation.issues,
        svgCode: currentSvgCode // 返回原始代码
      }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      svgCode,
      rawResponse: aiResponse
    });

  } catch (error) {
    console.error('AI SVG API Error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
```

---

## 十一、环境变量配置

```bash
# .env.example

# AI API 配置
AI_API_ENDPOINT=https://api.openai.com/v1/chat/completions
AI_API_KEY=your-api-key-here
AI_MODEL=gpt-4

# 可选：Claude API 配置
# CLAUDE_API_KEY=your-claude-key
```

---

## 十二、技术实现优先级

| 优先级 | 模块 | 工作量 | 说明 |
|--------|------|--------|------|
| P0 | 类型定义 + Prompt | 1h | 数据结构和提示词 |
| P0 | 验证器 + 提取器 | 2h | 核心解析逻辑 |
| P0 | API 路由 | 2h | 后端接口 |
| P0 | 版本管理 | 1h | 版本控制 |
| P1 | 差异对比 | 1h | diff 功能 |
| P1 | UI 组件 | 3h | 交互界面 |
| P1 | AI Hook | 2h | 状态管理 |
| P2 | 快捷提示词优化 | 1h | 持续优化 |

**预计总工期：约 13 小时**
