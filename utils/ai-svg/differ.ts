import { SvgDiff, DiffElement, DiffModification } from './types';

const parseSvgElements = (svgCode: string): DiffElement[] => {
  const elements: DiffElement[] = [];
  const tagRegex = /<(\w+)([^>]*?)(\/?)>/g;
  let match;
  let index = 0;

  while ((match = tagRegex.exec(svgCode)) !== null) {
    const tagName = match[1];
    const attributes = match[2];

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
