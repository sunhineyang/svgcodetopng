'use client';

import { QUICK_PROMPTS } from '../utils/ai-svg/constants';
import { useTranslations } from 'next-intl';
import { trackAiAssistantQuickPrompt } from '../utils/analytics';

interface AiPromptButtonsProps {
  onApplyPrompt: (index: number) => void;
  disabled?: boolean;
}

const PROMPT_KEYS = [
  'optimizeCode',
  'blueGradient',
  'redTheme',
  '2xLarger',
  '50pctSmaller',
  'breathingAnimation',
  'softShadow',
  'centerContent',
] as const;

export default function AiPromptButtons({
  onApplyPrompt,
  disabled = false,
}: AiPromptButtonsProps) {
  const t = useTranslations('aiAssistant.prompts');

  const handleClick = (index: number) => {
    const prompt = QUICK_PROMPTS[index];
    trackAiAssistantQuickPrompt(prompt.label);
    onApplyPrompt(index);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_PROMPTS.map((prompt, index) => (
        <button
          key={index}
          onClick={() => handleClick(index)}
          disabled={disabled}
          className={`
            px-3 py-1.5 rounded-lg text-sm font-medium
            transition-all duration-200
            ${
              disabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer'
            }
          `}
        >
          <span className="mr-1">{prompt.icon}</span>
          {t(PROMPT_KEYS[index])}
        </button>
      ))}
    </div>
  );
}
