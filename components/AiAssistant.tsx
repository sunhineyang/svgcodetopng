'use client';

import { useEffect } from 'react';
import { useAiSvgAssistant } from '../hooks/useAiSvgAssistant';
import AiVersionTimeline from './AiVersionTimeline';
import AiPromptButtons from './AiPromptButtons';
import AiInputBar from './AiInputBar';
import AiDiffViewer from './AiDiffViewer';
import { Bot, X, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  trackAiAssistantEnter,
  trackAiAssistantSend,
  trackAiAssistantRollback,
  trackAiAssistantError,
  trackAiAssistantDiffView,
  trackAiAssistantOpen,
  trackAiPromptSubmit,
} from '../utils/analytics';

interface AiAssistantProps {
  svgCode: string;
  onSvgCodeChange: (code: string) => void;
}

const DEFAULT_SVG = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#007AFF"/>
      <stop offset="100%" stop-color="#5856D6"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="#f5f5f7" rx="24"/>
  <circle cx="100" cy="90" r="30" fill="url(#g)"/>
  <text x="100" y="150" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="600" fill="#1d1d1f">
    Hello SVG
  </text>
</svg>`;

export default function AiAssistant({
  svgCode,
  onSvgCodeChange,
}: AiAssistantProps) {
  const t = useTranslations('aiAssistant');
  const initialCode = svgCode || DEFAULT_SVG;

  const {
    svgCode: aiSvgCode,
    updateSvgManually,
    conversationHistory,
    versions,
    isProcessing,
    lastDiffDescription,
    showDiffViewer,
    setShowDiffViewer,
    error,
    sendToAi,
    handleRollback,
    handleApplyQuickPrompt,
    dismissError,
  } = useAiSvgAssistant(initialCode, onSvgCodeChange);

  useEffect(() => {
    trackAiAssistantEnter();
    trackAiAssistantOpen();
  }, []);

  useEffect(() => {
    if (error) {
      trackAiAssistantError(error.type);
    }
  }, [error]);

  useEffect(() => {
    if (showDiffViewer) {
      trackAiAssistantDiffView();
    }
  }, [showDiffViewer]);

  const handleSvgChange = (newCode: string) => {
    updateSvgManually(newCode);
    onSvgCodeChange(newCode);
  };

  const handleAiSend = (message: string) => {
    trackAiAssistantSend('manual', message.length, message);
    trackAiPromptSubmit();
    sendToAi(message);
  };

  const handleRollbackWithUpdate = (versionId: string) => {
    const versionIndex = versions.findIndex((v) => v.id === versionId);
    if (versionIndex !== -1) {
      trackAiAssistantRollback(versionIndex + 1);
    }
    handleRollback(versionId);
    const targetVersion = versions.find((v) => v.id === versionId);
    if (targetVersion) {
      onSvgCodeChange(targetVersion.code);
    }
  };

  return (
    <div className="w-full bg-gray-50 rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-blue-100 rounded-full p-2">
          <Bot className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{t('title')}</h3>
          <p className="text-xs text-gray-500">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-red-800 text-sm">
                {error.type}
              </div>
              <div className="text-xs text-red-700 mt-1">
                {error.message}
              </div>
              {error.suggestion && (
                <div className="text-xs text-red-600 mt-1">
                  {error.suggestion}
                </div>
              )}
            </div>
            <button
              onClick={dismissError}
              className="text-red-400 hover:text-red-600 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <AiVersionTimeline
        versions={versions}
        onRollback={handleRollbackWithUpdate}
      />

      <div className="mt-3 mb-4">
        <div className="text-xs font-medium text-gray-500 mb-2">
          {t('quickActions')}
        </div>
        <AiPromptButtons
          onApplyPrompt={handleApplyQuickPrompt}
          disabled={isProcessing}
        />
      </div>

      <AiDiffViewer
        diffDescription={lastDiffDescription}
        isVisible={showDiffViewer}
        onClose={() => setShowDiffViewer(false)}
      />

      <AiInputBar
        onSend={handleAiSend}
        disabled={isProcessing}
      />
    </div>
  );
}
