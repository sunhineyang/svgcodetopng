'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  ConversationTurn,
  SvgVersion,
  SvgDiff,
  AiApiResponse,
  AiApiRequest,
  ErrorType,
} from '../utils/ai-svg/types';
import {
  createVersion,
  addVersion,
  rollbackToVersion,
  getCurrentVersion,
} from '../utils/ai-svg/version-manager';
import {
  validateSvgLength,
  validateSvgSyntax,
} from '../utils/ai-svg/validator';
import { cleanSvgCode } from '../utils/ai-svg/extractor';
import { compareSvg, generateDiffDescription } from '../utils/ai-svg/differ';
import { trimConversationHistory } from '../utils/ai-svg/token-control';
import { QUICK_PROMPTS } from '../utils/ai-svg/constants';

const ERROR_KEY_MAP: Record<string, string> = {
  SVG_TOO_LONG: 'svgTooLong',
  SVG_SYNTAX_ERROR: 'svgSyntaxError',
  EXTRACTION_FAILED: 'extractionFailed',
  TIMEOUT: 'timeout',
  RATE_LIMIT: 'rateLimit',
  NETWORK_ERROR: 'networkError',
  AI_ERROR: 'aiError',
};

const MAX_RETRIES = 3;

async function fetchWithRetry(
  url: string,
  body: AiApiRequest,
  attempt = 0
): Promise<AiApiResponse> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    return await response.json();
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      const delayMs = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return fetchWithRetry(url, body, attempt + 1);
    }
    throw err;
  }
}

export const useAiSvgAssistant = (initialSvgCode: string) => {
  const t = useTranslations('aiAssistant.errors');
  const [svgCode, setSvgCode] = useState(initialSvgCode);
  const [conversationHistory, setConversationHistory] = useState<
    ConversationTurn[]
  >([]);
  const [versions, setVersions] = useState<SvgVersion[]>([
    createVersion(initialSvgCode, 'Initial version', false),
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastDiff, setLastDiff] = useState<SvgDiff | null>(null);
  const [lastDiffDescription, setLastDiffDescription] = useState<string[]>([]);
  const [showDiffViewer, setShowDiffViewer] = useState(false);
  const [error, setError] = useState<{
    type: string;
    message: string;
    suggestion: string;
  } | null>(null);

  const setTranslatedError = useCallback(
    (errorType: string, fallbackMessage?: string, fallbackSuggestion?: string) => {
      const key = ERROR_KEY_MAP[errorType] || 'aiError';
      setError({
        type: t(`${key}.title`),
        message: fallbackMessage || t(`${key}.message`),
        suggestion: fallbackSuggestion || t(`${key}.suggestion`),
      });
    },
    [t]
  );

  const sendToAi = useCallback(
    async (userIntent: string) => {
      setIsProcessing(true);
      setError(null);

      try {
        const lengthValidation = validateSvgLength(svgCode);
        if (!lengthValidation.isValid) {
          setTranslatedError('SVG_TOO_LONG');
          return;
        }

        const trimmedHistory = trimConversationHistory(conversationHistory);
        const processedSvgCode = svgCode;

        const userTurn: ConversationTurn = {
          role: 'user',
          content: userIntent,
          timestamp: Date.now(),
        };

        setConversationHistory((prev) => [...prev, userTurn]);

        const requestBody: AiApiRequest = {
          conversationHistory: trimmedHistory,
          currentSvgCode: processedSvgCode,
          userIntent,
        };

        const result = await fetchWithRetry('/api/ai/', requestBody);

        if (!result.success || !result.svgCode) {
          const errorType = result.code || 'AI_ERROR';
          setTranslatedError(errorType, result.error, result.suggestion);
          return;
        }

        const newSvgCode = cleanSvgCode(result.svgCode);

        const syntaxValidation = validateSvgSyntax(newSvgCode);
        if (!syntaxValidation.isValid) {
          setTranslatedError(
            'SVG_SYNTAX_ERROR',
            syntaxValidation.issues[0] || t('svgSyntaxError.message')
          );
          return;
        }

        const diff = compareSvg(svgCode, newSvgCode);
        const diffDescription = generateDiffDescription(diff);
        setLastDiff(diff);
        setLastDiffDescription(diffDescription);
        setShowDiffViewer(true);

        const aiTurn: ConversationTurn = {
          role: 'assistant',
          content: result.rawResponse || newSvgCode,
          timestamp: Date.now(),
          svgSnapshot: newSvgCode,
        };

        setConversationHistory((prev) => [...prev, aiTurn]);

        const newVersion = createVersion(newSvgCode, userIntent, true);
        const newVersions = addVersion(versions, newVersion);
        setVersions(newVersions);
        setSvgCode(newSvgCode);

      } catch (err) {
        const errObj = err as Error;
        if (errObj.message.includes('timeout') || errObj.name === 'AbortError') {
          setTranslatedError('TIMEOUT');
        } else if (errObj.message.includes('fetch') || errObj.message.includes('network')) {
          setTranslatedError('NETWORK_ERROR');
        } else {
          setTranslatedError('AI_ERROR');
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [svgCode, conversationHistory, versions, t, setTranslatedError]
  );

  const handleRollback = useCallback((versionId: string) => {
    const result = rollbackToVersion(versions, versionId);
    if (result) {
      setVersions(result.versions);
      setSvgCode(result.code);
    }
  }, [versions]);

  const handleApplyQuickPrompt = useCallback((index: number) => {
    const prompt = QUICK_PROMPTS[index];
    sendToAi(prompt.prompt);
  }, [sendToAi]);

  const handleClearHistory = useCallback(() => {
    setConversationHistory([]);
    setLastDiff(null);
    setLastDiffDescription([]);
  }, []);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  const updateSvgManually = useCallback((newCode: string) => {
    setSvgCode(newCode);
    const current = getCurrentVersion(versions);
    if (current && current.code !== newCode) {
      const newVersion = createVersion(newCode, 'Manual edit', false);
      const newVersions = addVersion(versions, newVersion);
      setVersions(newVersions);
    }
  }, [versions]);

  return {
    svgCode,
    setSvgCode: updateSvgManually,
    conversationHistory,
    versions,
    isProcessing,
    lastDiff,
    lastDiffDescription,
    showDiffViewer,
    setShowDiffViewer,
    error,
    sendToAi,
    handleRollback,
    handleApplyQuickPrompt,
    handleClearHistory,
    dismissError,
    updateSvgManually,
  };
};
