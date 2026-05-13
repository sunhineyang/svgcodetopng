import { ValidationResult } from './types';
import { SVG_LIMITS } from './constants';

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

export const validateOutput = (output: string): ValidationResult => {
  const issues: string[] = [];
  const trimmed = output.trim();

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

  if (trimmed.includes('```')) {
    issues.push('Contains markdown code block markers');
  }

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

const isServer = typeof window === 'undefined';

const validateSvgSyntaxServer = (svgCode: string): ValidationResult => {
  const issues: string[] = [];

  if (!svgCode.includes('<svg')) {
    issues.push('No <svg> element found in document');
  }

  if (!svgCode.includes('</svg>')) {
    issues.push('No </svg> closing tag found');
  }

  const openTags = (svgCode.match(/<svg[^>]*>/g) || []).length;
  const closeTags = (svgCode.match(/<\/svg>/g) || []).length;
  if (openTags !== closeTags) {
    issues.push(`Mismatched <svg> tags: ${openTags} open, ${closeTags} close`);
  }

  if (/<script[\s>]/i.test(svgCode)) {
    issues.push('SVG contains script tags (will be auto-removed)');
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};

const validateSvgSyntaxBrowser = (svgCode: string): ValidationResult => {
  const issues: string[] = [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgCode, 'image/svg+xml');

    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      const errorText = parseError.textContent || 'XML Parse Error';
      issues.push(`XML syntax error: ${errorText.substring(0, 100)}`);
    }

    const svg = doc.querySelector('svg');
    if (!svg) {
      issues.push('No <svg> element found in document');
    }

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

export const validateSvgSyntax = (svgCode: string): ValidationResult => {
  return isServer ? validateSvgSyntaxServer(svgCode) : validateSvgSyntaxBrowser(svgCode);
};

export const validateSvgRender = (svgCode: string): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    const issues: string[] = [];

    try {
      const svgBlob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();

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

export const validateSvg = async (svgCode: string): Promise<ValidationResult> => {
  const lengthResult = validateSvgLength(svgCode);
  if (!lengthResult.isValid) {
    return lengthResult;
  }

  const formatResult = validateOutput(svgCode);
  if (!formatResult.isValid) {
    return formatResult;
  }

  const syntaxResult = validateSvgSyntax(svgCode);
  if (!syntaxResult.isValid) {
    return syntaxResult;
  }

  const renderResult = await validateSvgRender(svgCode);
  if (!renderResult.isValid) {
    return renderResult;
  }

  return { isValid: true, issues: [] };
};
