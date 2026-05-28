'use client';

import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import {
  submitFeedback,
  shouldShowFeedback,
  markDismissed,
  markDontShowAgain,
  resetConversionCount,
  incrementConversionCount,
} from '../../utils/feedback-client';
import {
  trackEvent,
  AnalyticsEvents,
} from '../../utils/analytics';

type FeedbackContextValue = {
  showCard: boolean;
  setShowCard: (v: boolean) => void;
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  showToast: boolean;
  setShowToast: (v: boolean) => void;
  toastMessage: string;
  setToastMessage: (v: string) => void;
  conversionContext: ConversionContext | null;
  setConversionContext: (v: ConversionContext | null) => void;
  svgCode: string | null;
  setSvgCode: (v: string | null) => void;
};

type ConversionContext = {
  mode: 'svg' | 'html';
  format: string;
  quality: number;
  width: number;
  height: number;
  background: string;
  scale: number;
  locale: string;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function useFeedbackContext() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedbackContext must be used inside FeedbackProvider');
  return ctx;
}

export function useFeedback() {
  const ctx = useFeedbackContext();

  const maybeShowFeedback = useCallback(
    (params: { context: ConversionContext; svgCode?: string | null }) => {
      ctx.setConversionContext(params.context);
      ctx.setSvgCode(params.svgCode || null);

      if (shouldShowFeedback()) {
        ctx.setShowCard(true);
        resetConversionCount();
        trackEvent(AnalyticsEvents.FEEDBACK_CARD_SHOWN);
      }
    },
    [ctx],
  );

  return {
    maybeShowFeedback,
    incrementConversionCount,
  };
}

export default function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [showCard, setShowCard] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [conversionContext, setConversionContext] = useState<ConversionContext | null>(null);
  const [svgCode, setSvgCode] = useState<string | null>(null);

  const ctxValue: FeedbackContextValue = {
    showCard,
    setShowCard,
    showModal,
    setShowModal,
    showToast,
    setShowToast,
    toastMessage,
    setToastMessage,
    conversionContext,
    setConversionContext,
    svgCode,
    setSvgCode,
  };

  return (
    <FeedbackContext.Provider value={ctxValue}>
      {children}
      <FeedbackCard />
      <FeedbackModal />
      <FeedbackToast />
    </FeedbackContext.Provider>
  );
}

function FeedbackCard() {
  const t = useTranslations('feedback');
  const ctx = useFeedbackContext();
  const isMobile = useIsMobile();
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (ctx.showCard) {
      setVisible(true);
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, 8000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [ctx.showCard]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => {
      ctx.setShowCard(false);
    }, 300);
    markDismissed();
    trackEvent(AnalyticsEvents.FEEDBACK_CARD_DISMISSED);
  };

  const handlePositive = async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    ctx.setShowCard(false);

    if (ctx.conversionContext) {
      const result = await submitFeedback({
        sentiment: 'positive',
        context: ctx.conversionContext,
      });

      if (result.ok) {
        ctx.setToastMessage(t('toast.thanksPositive'));
        ctx.setShowToast(true);
        trackEvent(AnalyticsEvents.FEEDBACK_POSITIVE);
      } else {
        ctx.setToastMessage(t('toast.submitFailed'));
        ctx.setShowToast(true);
        trackEvent(AnalyticsEvents.FEEDBACK_SUBMIT_FAILED);
      }
    }
  };

  const handleNegative = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    ctx.setShowCard(false);
    ctx.setShowModal(true);
    trackEvent(AnalyticsEvents.FEEDBACK_NEGATIVE_OPEN);
  };

  if (!ctx.showCard) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      className={`fixed z-50 max-w-xs w-full transition-all duration-300 ${
        isMobile
          ? 'bottom-4 left-4 right-4 max-w-none'
          : 'bottom-4 right-4'
      } ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          aria-label={t('card.close')}
        >
          <X className="w-4 h-4" />
        </button>
        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
          {t('card.title')}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          {t('card.subtitle')}
        </p>
        <div className="flex gap-2">
          <button
            onClick={handlePositive}
            className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
          >
            👍 {t('card.positive')}
          </button>
          <button
            onClick={handleNegative}
            className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors"
          >
            👎 {t('card.negative')}
          </button>
        </div>
      </div>
    </div>
  );
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
}

function FeedbackModal() {
  const t = useTranslations('feedback');
  const ctx = useFeedbackContext();
  const isMobile = useIsMobile();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [uploadSvg, setUploadSvg] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);

  const ISSUE_TAGS = [
    'missing_elements',
    'blurry',
    'color_issue',
    'transparency_failed',
    'text_error',
    'other',
  ] as const;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const resetForm = () => {
    setSelectedTags([]);
    setDescription('');
    setUploadSvg(true);
    setDontShowAgain(false);
  };

  const handleSubmit = async () => {
    if (selectedTags.length === 0 || !ctx.conversionContext) return;
    setSubmitting(true);

    const minDelay = new Promise((resolve) => setTimeout(resolve, 1200));

    const result = await submitFeedback({
      sentiment: 'negative',
      issueTags: selectedTags,
      description: description || undefined,
      svgCode: uploadSvg ? ctx.svgCode || undefined : undefined,
      context: ctx.conversionContext,
    });

    await minDelay;
    setSubmitting(false);
    ctx.setShowModal(false);

    if (result.ok) {
      ctx.setToastMessage(t('toast.thanksNegative'));
      ctx.setShowToast(true);
      trackEvent(AnalyticsEvents.FEEDBACK_SUBMITTED, {
        with_svg: uploadSvg,
        tags_count: selectedTags.length,
      });
    } else {
      ctx.setToastMessage(t('toast.submitFailed'));
      ctx.setShowToast(true);
      trackEvent(AnalyticsEvents.FEEDBACK_SUBMIT_FAILED);
    }

    if (dontShowAgain) {
      markDontShowAgain();
      trackEvent(AnalyticsEvents.FEEDBACK_DONT_SHOW_AGAIN);
    }

    resetForm();
  };

  const handleCancel = () => {
    ctx.setShowModal(false);
    markDismissed();
    resetForm();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const diff = e.touches[0].clientY - dragStartY.current;
    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const diff = e.changedTouches[0].clientY - dragStartY.current;
    if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }
    if (diff > 80) {
      handleCancel();
    }
    dragStartY.current = null;
  };

  if (!ctx.showModal) return null;

  const modalContent = (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t('modal.title')}
        </h2>
        <button
          onClick={handleCancel}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
        {t('modal.questionLabel')}
      </p>

      <div className="space-y-2 mb-4">
        {ISSUE_TAGS.map((tag) => (
          <label
            key={tag}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm ${
              selectedTags.includes(tag)
                ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                : 'bg-slate-50 dark:bg-slate-900 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedTags.includes(tag)}
              onChange={() => toggleTag(tag)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-700 dark:text-slate-300">
              {t(`modal.tags.${tag}`)}
            </span>
          </label>
        ))}
      </div>

      <div className="mb-4">
        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
          {t('modal.descriptionLabel')}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
          placeholder={t('modal.descriptionPlaceholder')}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mb-4">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={uploadSvg}
            onChange={(e) => setUploadSvg(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5"
          />
          <div>
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {t('modal.uploadLabel')}
            </span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {t('modal.privacyNote')}
            </p>
          </div>
        </label>
      </div>

      <label className="flex items-center gap-2 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={dontShowAgain}
          onChange={(e) => setDontShowAgain(e.target.checked)}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {t('settings.dontShowAgain')}
        </span>
      </label>

      <div className="flex gap-3">
        <button
          onClick={handleCancel}
          className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          {t('modal.cancel')}
        </button>
        <button
          onClick={handleSubmit}
          disabled={selectedTags.length === 0 || submitting}
          className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t('modal.submitting')}
            </>
          ) : (
            t('modal.submit')
          )}
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/50" onClick={handleCancel} />
        <div
          ref={sheetRef}
          className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-800 rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto transition-transform"
        >
          <div
            className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          </div>
          <div className="px-5 pb-6 pt-1">
            {modalContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleCancel} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {modalContent}
        </div>
      </div>
    </div>
  );
}

function FeedbackToast() {
  const t = useTranslations('feedback');
  const ctx = useFeedbackContext();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (ctx.showToast) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => ctx.setShowToast(false), 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [ctx.showToast]);

  if (!ctx.showToast) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
        {ctx.toastMessage}
      </div>
    </div>
  );
}
