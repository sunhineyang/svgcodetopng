import { QuickPrompt } from './types';

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

export const SVG_LIMITS = {
  MAX_SVG_LENGTH: 160000,
  MAX_FILE_SIZE: '200KB',
  MAX_CONVERSATION_TURNS: 100,
  MAX_TOTAL_TOKENS: 100000,
  MAX_UNDO_STEPS: 10,
};

export const AI_CONFIG = {
  MODEL: 'deepseek-v4-flash',
  BASE_URL: 'https://api.deepseek.com',
  TIMEOUT_MS: 90000,
  MAX_OUTPUT_TOKENS: 4096,
  TEMPERATURE: 0.3,
};

export const SUPPORTED_ELEMENTS = [
  'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path', 'text',
  'g', 'svg', 'defs', 'symbol', 'use',
  'linearGradient', 'radialGradient', 'stop',
  'filter', 'feGaussianBlur', 'feDropShadow', 'feColorMatrix',
  'clipPath', 'mask',
  'animate', 'animateTransform', 'animateMotion',
  'title', 'desc', 'style',
];

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

export const QUICK_PROMPTS: QuickPrompt[] = [
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

export const VERSION_CONFIG = {
  MAX_VERSIONS: 10,
  SHOW_COUNT: 5,
  COLLAPSE_THRESHOLD: 3,
};
