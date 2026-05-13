'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AiInputBarProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function AiInputBar({
  onSend,
  disabled = false,
}: AiInputBarProps) {
  const t = useTranslations('aiAssistant');
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={t('inputPlaceholder')}
          className={`
            w-full px-4 py-3 rounded-xl border resize-none
            text-sm
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${
              disabled
                ? 'bg-gray-50 border-gray-200 text-gray-400'
                : 'bg-white border-gray-200 text-gray-800'
            }
          `}
          rows={1}
        />
      </div>
      <button
        onClick={handleSend}
        disabled={disabled || !inputValue.trim()}
        className={`
          px-4 py-3 rounded-xl font-medium
          flex items-center gap-2
          transition-all duration-200
          ${
            disabled || !inputValue.trim()
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
        `}
      >
        {disabled ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">{disabled ? t('processing') : t('send')}</span>
      </button>
    </div>
  );
}
