# AI SVG Assistant - Complete Technical Design

## Overview

### Purpose
Add AI conversation capabilities to the SVG/HTML to image converter, allowing users to modify SVG code using natural language without manual editing.

### Core Value
- Reduced barrier to entry: Non-technical users can modify SVGs
- Improved efficiency: Describe in natural language → auto-modify
- Differentiated value: Unique feature not available in competitors

### Competitor Comparison

| Feature | SoConvert | Carbon | CloudConvert | **Our Tool** |
|---------|-----------|--------|--------------|--------------|
| SVG code input | ❌ | ❌ | ❌ | ✅ |
| HTML/CSS input | ❌ | ❌ | ❌ | ✅ |
| Real-time preview | ❌ | ✅ | ❌ | ✅ |
| AI code modification | ❌ | ❌ | ❌ | ✅ (New) |
| Batch conversion | ✅ | ❌ | ✅ | ✅ (Redirect) |
| Multi-format export | ✅ | ❌ | ✅ | ✅ |

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (React/Next.js)                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐     ┌──────────────────┐                  │
│  │   UI Components  │ ←── │    AI Hook       │                  │
│  └──────────────────┘     └──────────────────┘                  │
│           ↑                       ↑                             │
│           │                       │                             │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │               State Management (useState/Context)       │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                   ┌───────────────────┐
                   │  API Route (/api/ai) │
                   └───────────────────┘
                            ↓
                   ┌───────────────────┐
                   │   AI Provider     │
                   └───────────────────┘
```

### File Structure

```
utils/ai-svg/
├── types.ts                # Type definitions
├── prompts.ts              # Prompt construction
├── validator.ts            # Output validation
├── extractor.ts            # SVG extraction
├── differ.ts               # Diff comparison
├── version-manager.ts      # Version management
├── error-handler.ts        # Error handling
├── token-control.ts        # Token control
├── constants.ts           # Constant configuration
└── index.ts              # Unified export

components/
├── AiAssistant.tsx        # Main component
├── AiPromptButtons.tsx     # Quick prompts
├── AiInputBar.tsx         # Input bar
├── AiVersionTimeline.tsx  # Version timeline
├── AiDiffViewer.tsx       # Diff viewer

hooks/
└── useAiSvgAssistant.ts  # AI Hook

app/api/ai/
└── route.ts              # API endpoint
```

---

## Core Modules

### 3.1 Constants Configuration

```typescript
// utils/ai-svg/constants.ts

/**
 * AI capability boundaries
 */
export const AI_CAPABILITIES = {
  CAN_DO: [
    'Modify colors (fill, stroke, stop-color)',
    'Adjust dimensions (width, height, viewBox)',
    'Add/modify animations (animate, animateTransform)',
    'Add filter effects (filter, feDropShadow)',
    'Modify text content',
    'Adjust positioning (transform)',
    'Add/remove elements',
    'Optimize code structure',
    'Add gradients (linearGradient, radialGradient)',
    'Add shadow and blur effects',
  ],
  CANNOT_DO: [
    'Generate entirely new SVG from scratch (only modify existing)',
    'Handle external image references (img, use href)',
    'Load external fonts',
    'Create complex 3D effects',
    'Handle non-standard SVG tags',
    'Handle CSS animations (only SMIL supported)',
    'Handle foreignObject',
  ],
};

/**
 * SVG limits configuration
 */
export const SVG_LIMITS = {
  MAX_SVG_LENGTH: 8000,         // Max characters
  MAX_FILE_SIZE: '10KB',        // Max file size (display only)
  MAX_CONVERSATION_TURNS: 6,    // Max conversation turns
  MAX_TOTAL_TOKENS: 2000,      // Max total tokens
  MAX_UNDO_STEPS: 10,           // Max undo steps
};

/**
 * Supported SVG elements
 */
export const SUPPORTED_ELEMENTS = [
  // Basic shapes
  'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path', 'text',
  // Containers
  'g', 'svg', 'defs', 'symbol', 'use',
  // Gradients
  'linearGradient', 'radialGradient', 'stop',
  // Filters
  'filter', 'feGaussianBlur', 'feDropShadow', 'feColorMatrix',
  // Clipping
  'clipPath', 'mask',
  // Animations
  'animate', 'animateTransform', 'animateMotion',
  // Other
  'title', 'desc', 'style',
];

/**
 * Error message configuration
 */
export const ERROR_MESSAGES = {
  SVG_TOO_LONG: {
    title: '📦 SVG is too long',
    message: 'This SVG exceeds processing limits.',
    suggestion: 'Please simplify the SVG or clear conversation history.',
  },
  SVG_SYNTAX_ERROR: {
    title: '🤔 Invalid SVG from AI',
    message: 'The AI generated invalid SVG code. Keeping original.',
    suggestion: 'Try phrasing your request differently (e.g., "optimize code").',
  },
  EXTRACTION_FAILED: {
    title: '🤔 Could not extract SVG',
    message: 'The AI response could not be parsed properly.',
    suggestion: 'Try being more specific (e.g., "change all text to red").',
  },
  TIMEOUT: {
    title: '⏰ Request timed out',
    message: 'The AI is taking too long.',
    suggestion: 'Please try again later or check your network.',
  },
  RATE_LIMIT: {
    title: '🚦 Too many requests',
    message: 'Please try again later.',
    suggestion: 'Wait at least 5 seconds between requests.',
  },
  NETWORK_ERROR: {
    title: '🌐 Network error',
    message: 'Could not connect to AI service.',
    suggestion: 'Please check your network and try again.',
  },
  AI_ERROR: {
    title: '🤖 AI service error',
    message: 'The AI service encountered an error.',
    suggestion: 'Please try again later.',
  },
};

/**
 * Quick prompts configuration
 */
export const QUICK_PROMPTS = [
  {
    label: 'Optimize Code',
    icon: '✨',
    prompt: 'Optimize this SVG code: Remove unnecessary attributes, compress whitespace, simplify paths while maintaining readability.',
    category: 'Optimize',
  },
  {
    label: 'Blue Gradient',
    icon: '🎨',
    prompt: 'Change all colors to a blue gradient from #007AFF to #5856D6, gradient direction from top-left to bottom-right.',
    category: 'Colors',
  },
  {
    label: 'Red Theme',
    icon: '❤️',
    prompt: 'Change all colors to a red theme from #FF3B30 to #FF6B6B.',
    category: 'Colors',
  },
  {
    label: '2x Larger',
    icon: '📏',
    prompt: 'Make this SVG 2x larger: Multiply width, height, and viewBox coordinates by 2 while maintaining correct element positioning.',
    category: 'Size',
  },
  {
    label: '50% Smaller',
    icon: '📐',
    prompt: 'Reduce this SVG by 50%: Divide width, height, and viewBox coordinates by 2 while maintaining correct element positioning.',
    category: 'Size',
  },
  {
    label: 'Breathing Animation',
    icon: '✨',
    prompt: 'Add a breathing animation to the main graphics: Opacity between 0.7-1.0, 3-second cycle, infinite loop.',
    category: 'Effects',
  },
  {
    label: 'Soft Shadow',
    icon: '🌫️',
    prompt: 'Add a soft shadow to the main elements: feDropShadow with blur 8px, offset 0 4px, color #000000, opacity 0.15.',
    category: 'Effects',
  },
  {
    label: 'Center Content',
    icon: '🎯',
    prompt: 'Adjust viewBox to center the content with 20px margin around all sides.',
    category: 'Layout',
  },
];

/**
 * Version management config
 */
export const VERSION_CONFIG = {
  MAX_VERSIONS: 10,
  SHOW_COUNT: 5,         // Timeline default display count
  COLLAPSE_THRESHOLD: 3, // Collapse when exceeding this many versions
};
```

---

### 3.2 Prompt Design

```typescript
// utils/ai-svg/prompts.ts

/**
 * System Prompt - Role definition and rules
 */
export const SYSTEM_PROMPT = `# Role Definition
You are a professional SVG code modification assistant.

# Core Rules (Must Follow)

## Rule 1: Output Format
- **ONLY output SVG code**, no other content
- **NO markdown formatting**, no code block markers
- **NO explanations, descriptions, or comments**

## Rule 2: Code Integrity
- Must include complete <svg> opening tag
- Must include </svg> closing tag
- All child elements must be properly closed

## Rule 3: Maintain Consistency
- Keep original viewBox and dimensions (unless user explicitly requests change)
- Don't change unrequested parts
- Maintain existing element IDs and structure

## Rule 4: SVG Standards
- Use standard SVG attributes
- Avoid CSS style attributes (except style attribute itself)
- Ensure proper attribute value formatting

## Rule 5: Animation Specification
- Use only SMIL animations (animate, animateTransform)
- NO CSS animations or JavaScript

## Rule 6: Limits
- If SVG code exceeds 8000 chars, output original code
- If request cannot be completed, output original SVG code
- **NEVER output anything other than SVG code**

# Output Examples

✅ Correct Output:
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="50" fill="blue"/>
</svg>

❌ Wrong Output (Don't do this):
Done modifying: <svg>...</svg>

❌ Wrong Output (Don't do this):
Okay, here's the modified code.
<svg>...</svg>

❌ Wrong Output (Don't do this):
\`\`\`svg
<svg>...</svg>
\`\`\`

# Important Reminder
Just write the code directly, no prefix or suffix.
`;

import { ConversationTurn } from './types';

/**
 * Build user prompt
 */
export const buildUserPrompt = (
  conversationHistory: ConversationTurn[],
  currentSvgCode: string,
  userIntent: string
): string => {
  let prompt = '';

  // 1. Conversation history (max 3 turns)
  if (conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-6);
    prompt += `# Conversation History (Context Only)\n\n`;
    prompt += recentHistory.map(turn => {
      return `${turn.role === 'user' ? 'User' : 'Assistant'}: ${turn.content}`;
    }).join('\n');
    prompt += '\n\n';
  }

  // 2. Current SVG code
  prompt += `# Current SVG Code\n\n`;
  prompt += `${currentSvgCode}\n\n`;

  // 3. User intent
  prompt += `# User Request\n\n${userIntent}\n\n`;

  // 4. Output requirements
  prompt += `# Output Requirements\n\nPlease modify the SVG code based on user request and output ONLY the complete SVG code. No explanations.`;

  return prompt;
};
```

---

### 3.3 Validator

```typescript
// utils/ai-svg/validator.ts

import { ValidationResult } from './types';
import { SVG_LIMITS } from './constants';

/**
 * Validate SVG length
 */
export const validateSvgLength = (svgCode: string): ValidationResult => {
  const issues: string[] = [];

  if (svgCode.length > SVG_LIMITS.MAX_SVG_LENGTH) {
    issues.push(`SVG exceeds ${SVG_LIMITS.MAX_SVG_LENGTH} character limit`);
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};

/**
 * Validate AI output format
 */
export const validateOutput = (output: string): ValidationResult => {
  const issues: string[] = [];
  const trimmed = output.trim();

  // Issue 1: Explanatory text
  const explanationPatterns = [
    'Here is', 'I have', 'Modified', 'Done', 'Okay', 'Ok,', 'Here\'s',
    'Here are', 'This is', 'The code', 'Changed', 'Updated', 'Done',
    'Okay,', 'I\'ve', 'I modified', 'Here you go', 'Sure', 'Sure,',
    'Absolutely', 'Certainly', 'Of course', 'You bet', 'Alright',
    'Alright,', 'Let\'s see', 'Let me', 'I can do that',
  ];

  for (const pattern of explanationPatterns) {
    const normalizedPattern = pattern.toLowerCase();
    if (trimmed.toLowerCase().startsWith(normalizedPattern)) {
      issues.push(`Contains explanation text starting with "${pattern}"`);
      break;
    }
  }

  // Issue 2: Markdown format
  if (trimmed.includes('```')) {
    issues.push('Contains markdown code block markers');
  }

  // Issue 3: Incomplete code
  if (!trimmed.includes('<svg')) {
    issues.push('Missing <svg> tag');
  }

  if (!trimmed.includes('</svg>')) {
    issues.push('Missing </svg> closing tag');
  }

  return {
    isValid: issues.length === 0,
    issues,
    rawResponse: output,
  };
};

/**
 * XML syntax validation
 */
export const validateSvgSyntax = (svgCode: string): ValidationResult => {
  const issues: string[] = [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgCode, 'image/svg+xml');

    // Check parser errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      const errorText = parseError.textContent || 'XML Parse Error';
      issues.push(`XML syntax error: ${errorText.substring(0, 100)}`);
    }

    // Check for svg element
    const svg = doc.querySelector('svg');
    if (!svg) {
      issues.push('No <svg> element found in document');
    }

    // Check for script tags
    const scripts = doc.querySelectorAll('script');
    if (scripts.length > 0) {
      issues.push('SVG contains script tags (will be auto-removed)');
    }

  } catch (error) {
    issues.push(`Parse exception: ${(error as Error).message}`);
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};

/**
 * SVG rendering validation
 */
export const validateSvgRender = (svgCode: string): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    const issues: string[] = [];

    try {
      const svgBlob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();

      // 5 second timeout
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(url);
        issues.push('Render timeout (exceeded 5 seconds)');
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
        issues.push('Image load failed');
        resolve({ isValid: false, issues });
      };

      img.src = url;
    } catch (error) {
      issues.push(`Create image failed: ${(error as Error).message}`);
      resolve({ isValid: false, issues });
    }
  });
};

/**
 * Complete validation flow
 */
export const validateSvg = async (svgCode: string): Promise<ValidationResult> => {
  // 1. Length validation
  const lengthResult = validateSvgLength(svgCode);
  if (!lengthResult.isValid) {
    return lengthResult;
  }

  // 2. Format validation
  const formatResult = validateOutput(svgCode);
  if (!formatResult.isValid) {
    return formatResult;
  }

  // 3. Syntax validation
  const syntaxResult = validateSvgSyntax(svgCode);
  if (!syntaxResult.isValid) {
    return syntaxResult;
  }

  // 4. Render validation
  const renderResult = await validateSvgRender(svgCode);
  if (!renderResult.isValid) {
    return renderResult;
  }

  return { isValid: true, issues: [] };
};
```

---

### 3.4 SVG Extractor

```typescript
// utils/ai-svg/extractor.ts

/**
 * Extract SVG code from AI response
 */
export const extractSvgCode = (response: string): string | null => {
  const trimmed = response.trim();

  // Strategy 1: Direct <svg> start
  if (trimmed.startsWith('<svg')) {
    return extractCompleteSvg(trimmed);
  }

  // Strategy 2: Markdown code blocks
  const codeBlockPatterns = [
    /```(?:\w+)?\n?([\s\S]*?)```/g,
    /`{3}(\w+)?\n?([\s\S]*?)`{3}/g,
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

  // Strategy 3: Extract from text
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
 * Extract complete SVG (handle extra content)
 */
const extractCompleteSvg = (text: string): string => {
  const startMatch = text.match(/<svg[\s>]/);
  if (!startMatch) return text;

  const startIdx = text.indexOf(startMatch[0]);
  let extracted = text.substring(startIdx);

  let depth = 0;
  let inString = false;
  let stringChar = '';
  let endIdx = -1;

  for (let i = 0; i < extracted.length; i++) {
    const char = extracted[i];

    // String handling
    if ((char === '"' || char === "'") && (i === 0 || extracted[i - 1] !== '\\')) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
    }

    // Tag handling (only outside strings)
    if (!inString) {
      if (char === '<') {
        // Comment check
        if (extracted.substring(i, i + 4) === '<!--') {
          const commentEnd = extracted.indexOf('-->', i);
          if (commentEnd !== -1) {
            i = commentEnd + 2;
            continue;
          }
        }

        // Open/close tag
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
    const svgEndMatch = extracted.match(/<\/svg>/i);
    if (svgEndMatch) {
      endIdx = extracted.indexOf(svgEndMatch[0]) + svgEndMatch[0].length;
    } else {
      return extracted;
    }
  }

  return extracted.substring(0, endIdx);
};

/**
 * Clean SVG code
 */
export const cleanSvgCode = (svgCode: string): string => {
  // Remove BOM
  let cleaned = svgCode.replace(/^\uFEFF/, '');

  // Remove XML declaration
  cleaned = cleaned.replace(/<\?xml[^?]*\?>/gi, '');

  // Remove DOCTYPE
  cleaned = cleaned.replace(/<!DOCTYPE[^>]*>/gi, '');

  // Remove script tags
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '');

  // Remove comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  return cleaned.trim();
};
```

---

### 3.5 Error Handler

```typescript
// utils/ai-svg/error-handler.ts

import { ERROR_MESSAGES } from './constants';

export type ErrorType = keyof typeof ERROR_MESSAGES;

export interface ErrorInfo {
  type: ErrorType;
  title: string;
  message: string;
  suggestion: string;
  canRetry: boolean;
}

/**
 * Get error information
 */
export const getErrorInfo = (errorType: ErrorType): ErrorInfo => {
  const errorConfig = ERROR_MESSAGES[errorType];
  const canRetry = !['SVG_TOO_LONG'].includes(errorType);

  return {
    type: errorType,
    ...errorConfig,
    canRetry,
  };
};

/**
 * Parse network errors
 */
export const parseNetworkError = (error: Error): ErrorInfo => {
  if (error.message.includes('timeout')) {
    return getErrorInfo('TIMEOUT');
  }

  if (error.message.includes('fetch') || error.message.includes('network')) {
    return getErrorInfo('NETWORK_ERROR');
  }

  return getErrorInfo('AI_ERROR');
};

/**
 * Error handler hook return type
 */
export interface ErrorHandlerReturn {
  error: ErrorInfo | null;
  setError: (type: ErrorType) => void;
  clearError: () => void;
  handleApiError: (error: Error) => void;
}
```

---

### 3.6 Token Control

```typescript
// utils/ai-svg/token-control.ts

import { SVG_LIMITS } from './constants';
import { ConversationTurn } from './types';

/**
 * Estimate tokens (rough calculation)
 * ~1 token ≈ 4 characters
 */
export const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

/**
 * Calculate total estimated tokens for SVG + history
 */
export const calculateTotalTokens = (
  svgCode: string,
  conversationHistory: ConversationTurn[]
): number => {
  let total = estimateTokens(svgCode);

  // Add history tokens
  for (const turn of conversationHistory.slice(-SVG_LIMITS.MAX_CONVERSATION_TURNS)) {
    total += estimateTokens(turn.content);
  }

  // Add system prompt (estimated ~500 tokens)
  total += 500;

  return total;
};

/**
 * Check if within token limit
 */
export const isWithinTokenLimit = (
  svgCode: string,
  conversationHistory: ConversationTurn[]
): { within: boolean; estimated: number; limit: number } => {
  const estimated = calculateTotalTokens(svgCode, conversationHistory);
  const within = estimated <= SVG_LIMITS.MAX_TOTAL_TOKENS;

  return {
    within,
    estimated,
    limit: SVG_LIMITS.MAX_TOTAL_TOKENS,
  };
};

/**
 * Trim conversation history
 */
export const trimConversationHistory = (
  history: ConversationTurn[],
  maxLength: number = SVG_LIMITS.MAX_CONVERSATION_TURNS
): ConversationTurn[] => {
  if (history.length <= maxLength) {
    return history;
  }

  return history.slice(-maxLength);
};

/**
 * Truncate long SVG code
 */
export const truncateSvgCode = (
  svgCode: string,
  maxLength: number = SVG_LIMITS.MAX_SVG_LENGTH
): string => {
  if (svgCode.length <= maxLength) {
    return svgCode;
  }

  // Keep first 60% and last 40%
  const frontLength = Math.floor(maxLength * 0.6);
  const backLength = Math.floor(maxLength * 0.4);

  const front = svgCode.substring(0, frontLength);
  const back = svgCode.substring(svgCode.length - backLength);

  return `${front}\n<!-- ... content truncated ... -->\n${back}`;
};
```

---

### 3.7 Diff Comparer

```typescript
// utils/ai-svg/differ.ts

import { SvgDiff, DiffElement, DiffModification } from './types';

/**
 * Parse SVG elements
 */
const parseSvgElements = (svgCode: string): DiffElement[] => {
  const elements: DiffElement[] = [];
  const tagRegex = /<(\w+)([^>]*?)(\/?)>/g;
  let match;
  let index = 0;

  while ((match = tagRegex.exec(svgCode)) !== null) {
    const tagName = match[1];
    const attributes = match[2];
    const isSelfClosing = match[3] === '/';

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
      properties: props,
    });

    index++;
  }

  return elements;
};

/**
 * Compare two SVG codes
 */
export const compareSvg = (oldCode: string, newCode: string): SvgDiff => {
  const diff: SvgDiff = {
    added: [],
    removed: [],
    modified: [],
  };

  const oldElements = parseSvgElements(oldCode);
  const newElements = parseSvgElements(newCode);

  const maxLen = Math.max(oldElements.length, newElements.length);

  for (let i = 0; i < maxLen; i++) {
    const oldEl = oldElements[i];
    const newEl = newElements[i];

    if (!oldEl && newEl) {
      diff.added.push(newEl);
    } else if (oldEl && !newEl) {
      diff.removed.push(oldEl);
    } else if (oldEl && newEl) {
      const allKeys = new Set([
        ...Object.keys(oldEl.properties),
        ...Object.keys(newEl.properties),
      ]);

      for (const key of allKeys) {
        const oldVal = oldEl.properties[key];
        const newVal = newEl.properties[key];

        if (oldVal !== newVal) {
          diff.modified.push({
            element: newEl.type,
            index: newEl.index,
            property: key,
            oldValue: oldVal || '(none)',
            newValue: newVal || '(none)',
          });
        }
      }
    }
  }

  return diff;
};

/**
 * Generate human-readable diff descriptions
 */
export const generateDiffDescription = (diff: SvgDiff): string[] => {
  const descriptions: string[] = [];

  if (diff.added.length > 0) {
    descriptions.push(`✅ Added ${diff.added.length} element(s)`);
    diff.added.slice(0, 3).forEach((el) => {
      descriptions.push(`   + ${el.type}`);
    });
    if (diff.added.length > 3) {
      descriptions.push(`   ... ${diff.added.length - 3} more`);
    }
  }

  if (diff.removed.length > 0) {
    descriptions.push(`❌ Removed ${diff.removed.length} element(s)`);
    diff.removed.slice(0, 3).forEach((el) => {
      descriptions.push(`   - ${el.type}`);
    });
    if (diff.removed.length > 3) {
      descriptions.push(`   ... ${diff.removed.length - 3} more`);
    }
  }

  if (diff.modified.length > 0) {
    descriptions.push(`✏️  Modified ${diff.modified.length} property(ies)`);
    diff.modified.slice(0, 5).forEach((mod) => {
      const oldVal = String(mod.oldValue).substring(0, 20);
      const newVal = String(mod.newValue).substring(0, 20);
      descriptions.push(
        `   • ${mod.element}.${mod.property}: ${oldVal} → ${newVal}`
      );
    });
    if (diff.modified.length > 5) {
      descriptions.push(`   ... ${diff.modified.length - 5} more`);
    }
  }

  if (descriptions.length === 0) {
    descriptions.push('No changes');
  }

  return descriptions;
};
```

---

### 3.8 Version Manager

```typescript
// utils/ai-svg/version-manager.ts

import { SvgVersion } from './types';
import { VERSION_CONFIG } from './constants';

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
    isAiModified,
  };
};

export const addVersion = (
  versions: SvgVersion[],
  newVersion: SvgVersion
): SvgVersion[] => {
  const updated = versions.map((v) => ({ ...v, isCurrent: false }));
  const withNew = [...updated, newVersion];

  if (withNew.length > VERSION_CONFIG.MAX_VERSIONS) {
    return withNew.slice(-VERSION_CONFIG.MAX_VERSIONS);
  }

  return withNew;
};

export const rollbackToVersion = (
  versions: SvgVersion[],
  versionId: string
): { versions: SvgVersion[]; code: string } | null => {
  const targetVersion = versions.find((v) => v.id === versionId);

  if (!targetVersion) {
    return null;
  }

  const updated = versions.map((v) => ({
    ...v,
    isCurrent: v.id === versionId,
  }));

  return {
    versions: updated,
    code: targetVersion.code,
  };
};

export const getCurrentVersion = (
  versions: SvgVersion[]
): SvgVersion | null => {
  return versions.find((v) => v.isCurrent) || null;
};
```

---

## Data Structures

```typescript
// utils/ai-svg/types.ts

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  svgSnapshot?: string;
}

export interface SvgVersion {
  id: string;
  code: string;
  timestamp: number;
  description: string;
  isCurrent: boolean;
  isAiModified: boolean;
}

export interface SvgDiff {
  added: DiffElement[];
  removed: DiffElement[];
  modified: DiffModification[];
}

export interface DiffElement {
  type: string;
  index: number;
  raw: string;
  properties: Record<string, any>;
}

export interface DiffModification {
  element: string;
  index: number;
  property: string;
  oldValue: any;
  newValue: any;
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  rawResponse?: string;
}

export interface QuickPrompt {
  label: string;
  icon?: string;
  prompt: string;
  category: string;
}
```

---

## API Design

### 5.1 API Route

```typescript
// app/api/ai/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { buildUserPrompt, SYSTEM_PROMPT } from '@/utils/ai-svg/prompts';
import { extractSvgCode } from '@/utils/ai-svg/extractor';
import { validateSvg } from '@/utils/ai-svg/validator';
import { trimConversationHistory, truncateSvgCode, isWithinTokenLimit } from '@/utils/ai-svg/token-control';
import { ConversationTurn } from '@/utils/ai-svg/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationHistory = [], currentSvgCode, userIntent } = body;

    // 1. Validate parameters
    if (!currentSvgCode || !userIntent) {
      return NextResponse.json(
        { error: 'Missing required parameters', code: 'MISSING_PARAMS' },
        { status: 400 }
      );
    }

    // 2. Token limit check
    const trimmedHistory = trimConversationHistory(conversationHistory);
    const tokenCheck = isWithinTokenLimit(currentSvgCode, trimmedHistory);

    if (!tokenCheck.within) {
      return NextResponse.json({
        error: `SVG too long (estimated ${tokenCheck.estimated} tokens, limit ${tokenCheck.limit})`,
        code: 'SVG_TOO_LONG',
        suggestion: 'Please simplify SVG or clear conversation history',
      }, { status: 400 });
    }

    // 3. Truncate long SVG (precaution)
    const processedSvgCode = truncateSvgCode(currentSvgCode);

    // 4. Build prompts
    const systemPrompt = SYSTEM_PROMPT;
    const userPrompt = buildUserPrompt(trimmedHistory, processedSvgCode, userIntent);

    // 5. Call AI
    const aiResponse = await callAI(systemPrompt, userPrompt);

    // 6. Extract SVG code
    const svgCode = extractSvgCode(aiResponse);

    if (!svgCode) {
      return NextResponse.json({
        error: 'Could not extract SVG from AI response',
        code: 'EXTRACTION_FAILED',
        rawResponse: aiResponse,
      }, { status: 422 });
    }

    // 7. Validate SVG
    const validation = await validateSvg(svgCode);

    if (!validation.isValid) {
      return NextResponse.json({
        error: 'SVG validation failed',
        code: 'SVG_SYNTAX_ERROR',
        issues: validation.issues,
        svgCode: currentSvgCode, // Return original code
      }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      svgCode,
      rawResponse: aiResponse,
    });

  } catch (error) {
    console.error('AI API Error:', error);

    // Error type detection
    if (error.message.includes('timeout')) {
      return NextResponse.json({
        error: 'Request timed out',
        code: 'TIMEOUT',
        suggestion: 'Please try again later',
      }, { status: 504 });
    }

    if (error.message.includes('rate limit')) {
      return NextResponse.json({
        error: 'Too many requests',
        code: 'RATE_LIMIT',
        suggestion: 'Please try again later',
      }, { status: 429 });
    }

    return NextResponse.json({
      error: 'AI service error',
      code: 'AI_ERROR',
      suggestion: 'Please try again later',
    }, { status: 500 });
  }
}

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch(process.env.AI_API_ENDPOINT!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
```

### 5.2 Environment Variables

```bash
# .env.local
AI_API_ENDPOINT=https://api.openai.com/v1/chat/completions
AI_API_KEY=your-api-key-here
AI_MODEL=gpt-4
```

---

## UI/UX Design

### 6.1 Layout Design

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Header                                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  SVG Code Editor (Monaco Editor)                                 │  │
│  │  [Code area - occupies majority of space]                        │  │
│  └─────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  📜 Version History (horizontal scroll, collapsible)               │  │
│  │  [v10] ← [v9] ← [v8] ← [v7] ← [v6] ← ...                        │  │
│  └─────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  💡 Quick Prompts (categorized, collapsible)                       │  │
│  │  [Optimize Code] [Blue Gradient] [Red Theme] [+ More]             │  │
│  └─────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  🤖 AI Input Area                                                 │  │
│  │  [Input box...............................] [Send]                │  │
│  │  [AI Response area - loading/results/diff viewer]               │  │
│  └─────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│  Preview + Export buttons (PNG | JPG | GIF | WebP | PDF)                │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Interaction Flow

```
1. User pastes SVG code → Auto-update preview
2. User clicks quick prompt OR types request
3. Click Send → Show loading state
4. AI returns → Parse/extract → Validate
5. Show result: [✅ Apply] [❌ Cancel] [📝 View Diff]
6. User confirms → Update code → Add version
7. User continues conversation OR exports
```

### 6.3 Visual Feedback

| State | Visual Feedback |
|-------|------------------|
| AI Thinking | 🤖 icon + pulse animation + "Thinking..." |
| Applied Success | ✅ Green toast + "Code updated" |
| Version Switch | Slide animation + "Rolled back to v3" |
| Diff Viewer | Color highlights: Added(green), Removed(red), Modified(yellow) |

### 6.4 Responsive Design

- **Desktop**: Full layout, horizontal timeline
- **Tablet**: Quick prompts collapsed, timeline hidden
- **Mobile**: Single column, fixed bottom input

---

## Capabilities

### 7.1 Supported Actions

- ✅ Modify colors (fill, stroke, stop-color)
- ✅ Adjust dimensions (width, height, viewBox)
- ✅ Add/modify animations (animate, animateTransform)
- ✅ Add filter effects (filter, feDropShadow)
- ✅ Modify text content
- ✅ Adjust positioning (transform)
- ✅ Add/remove elements
- ✅ Optimize code structure

### 7.2 Unsupported Actions

- ❌ Generate entirely new SVG from scratch
- ❌ Handle external image references (img, use href)
- ❌ Load external fonts
- ❌ Create complex 3D effects
- ❌ Handle foreignObject

### 7.3 Technical Limits

- Max SVG code: 8000 characters
- Max conversation turns: 6
- Max undo steps: 10
- Max tokens per request: 2000

---

## Implementation Roadmap

### Phase 1: Core Features (P0)

- [ ] Complete `constants.ts` - Configuration
- [ ] Complete `prompts.ts` - Prompt design
- [ ] Complete `validator.ts` - Validation
- [ ] Complete `error-handler.ts` - Error handling
- [ ] Complete `token-control.ts` - Token control
- [ ] Complete `extractor.ts` - SVG extraction
- [ ] Complete `differ.ts` - Diff comparison
- [ ] Complete `version-manager.ts` - Version management
- [ ] Implement `/api/ai` route

### Phase 2: UI Components (P0)

- [ ] Implement `AiVersionTimeline.tsx`
- [ ] Implement `AiPromptButtons.tsx`
- [ ] Implement `AiInputBar.tsx`
- [ ] Implement `AiDiffViewer.tsx`
- [ ] Implement `AiAssistant.tsx`
- [ ] Implement `useAiSvgAssistant.ts`

### Phase 3: Integration & Testing (P1)

- [ ] Integrate into home page
- [ ] Integrate into Code-to-Png page
- [ ] Test all scenarios
- [ ] Performance optimization
- [ ] Error handling refinement

---

## Mock Testing

See: `/demo/ai-svg-assistant-demo.html`

Includes 4 test scenarios:
1. Perfect case (pure SVG)
2. With explanation text
3. Markdown format
4. Incomplete code

---

## Documents

1. `docs/ai-svg-technical-design.md` - Original tech design
2. `docs/ai-svg-mock-examples.md` - Mock examples
3. `demo/ai-svg-assistant-demo.html` - Interactive demo
4. `utils/ai-svg/` - Core implementation

