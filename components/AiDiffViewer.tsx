'use client';

import { X, Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AiDiffViewerProps {
  diffDescription: string[];
  isVisible: boolean;
  onClose: () => void;
}

export default function AiDiffViewer({
  diffDescription,
  isVisible,
  onClose,
}: AiDiffViewerProps) {
  const t = useTranslations('aiAssistant');

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-blue-800 text-sm">
            {t('changesMade')}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-1">
        {diffDescription.map((line, index) => (
          <div key={index} className="text-xs text-gray-700 font-mono">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
