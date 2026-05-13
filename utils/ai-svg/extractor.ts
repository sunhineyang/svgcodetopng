export const extractSvgCode = (response: string): string | null => {
  const trimmed = response.trim();

  if (trimmed.startsWith('<svg')) {
    return extractCompleteSvg(trimmed);
  }

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

    if ((char === '"' || char === "'") && (i === 0 || extracted[i - 1] !== '\\')) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
    }

    if (!inString) {
      if (char === '<') {
        if (extracted.substring(i, i + 4) === '<!--') {
          const commentEnd = extracted.indexOf('-->', i);
          if (commentEnd !== -1) {
            i = commentEnd + 2;
            continue;
          }
        }

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

export const cleanSvgCode = (svgCode: string): string => {
  let cleaned = svgCode.replace(/^\uFEFF/, '');
  cleaned = cleaned.replace(/<\?xml[^?]*\?>/gi, '');
  cleaned = cleaned.replace(/<!DOCTYPE[^>]*>/gi, '');
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  return cleaned.trim();
};
