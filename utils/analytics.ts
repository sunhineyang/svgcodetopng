declare global {
  interface Window {
    gtag?: (command: 'event' | 'config' | 'js', action: string, params?: any) => void;
    dataLayer?: any[];
  }
}

export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, eventParams);
    }
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Analytics]', eventName, eventParams);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Analytics error:', error);
    }
  }
};

export const trackPageView = (pageTitle: string, pagePath?: string) => {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_title: pageTitle,
        page_path: pagePath || window.location.pathname,
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Page view tracking error:', error);
    }
  }
};

export const AnalyticsEvents = {
  AI_ASSISTANT_ENTER: 'ai_assistant_enter',
  AI_ASSISTANT_SEND: 'ai_assistant_send',
  AI_ASSISTANT_QUICK_PROMPT: 'ai_assistant_quick_prompt',
  AI_ASSISTANT_ROLLBACK: 'ai_assistant_rollback',
  AI_ASSISTANT_ERROR: 'ai_assistant_error',
  AI_ASSISTANT_DIFF_VIEW: 'ai_assistant_diff_view',
  AI_ASSISTANT_CLEAR_HISTORY: 'ai_assistant_clear_history',

  CONVERT_IMAGE: 'convert_image',
  DOWNLOAD_IMAGE: 'download_image',
  EDITOR_ACTION: 'editor_action',
  COPY_SVG_CODE: 'copy_svg_code',

  SWITCH_THEME: 'switch_theme',
  SWITCH_LANGUAGE: 'switch_language',

  PAGE_VIEW: 'page_view',

  // Color Editor Events (New)
  COLOR_TAB_OPEN: 'color_tab_open',
  COLOR_REPLACE_SINGLE: 'color_replace_single',
  COLOR_PRESET_USED: 'color_preset_used',
  COLOR_RESET_ALL: 'color_reset_all',
  COLOR_WHEEL_OPEN: 'color_wheel_open',
  COLOR_WHEEL_CLOSE: 'color_wheel_close',

  // Settings Panel Events
  SETTINGS_OPEN: 'settings_open',
  SETTINGS_TAB_SWITCH: 'settings_tab_switch',
  SETTINGS_FORMAT_CHANGE: 'settings_format_change',
  SETTINGS_QUALITY_CHANGE: 'settings_quality_change',
  SETTINGS_DIMENSION_CHANGE: 'settings_dimension_change',

  // Feedback Events
  FEEDBACK_CARD_SHOWN: 'feedback_card_shown',
  FEEDBACK_CARD_DISMISSED: 'feedback_card_dismissed',
  FEEDBACK_POSITIVE: 'feedback_positive',
  FEEDBACK_NEGATIVE_OPEN: 'feedback_negative_open',
  FEEDBACK_SUBMITTED: 'feedback_submitted',
  FEEDBACK_SUBMIT_FAILED: 'feedback_submit_failed',
  FEEDBACK_DONT_SHOW_AGAIN: 'feedback_dont_show_again',
};

export const trackAiAssistantEnter = () => {
  trackEvent(AnalyticsEvents.AI_ASSISTANT_ENTER);
};

export const trackAiAssistantSend = (
  promptType: 'manual' | 'quick',
  promptLength: number,
  promptContent?: string
) => {
  trackEvent(AnalyticsEvents.AI_ASSISTANT_SEND, {
    prompt_type: promptType,
    prompt_length: promptLength,
    prompt_content: promptContent || undefined,
  });
};

export const trackAiAssistantQuickPrompt = (promptLabel: string) => {
  trackEvent(AnalyticsEvents.AI_ASSISTANT_QUICK_PROMPT, {
    prompt_label: promptLabel,
  });
};

export const trackAiAssistantRollback = (versionNumber: number) => {
  trackEvent(AnalyticsEvents.AI_ASSISTANT_ROLLBACK, {
    version_number: versionNumber,
  });
};

export const trackAiAssistantError = (errorType: string) => {
  trackEvent(AnalyticsEvents.AI_ASSISTANT_ERROR, {
    error_type: errorType,
  });
};

export const trackAiAssistantDiffView = () => {
  trackEvent(AnalyticsEvents.AI_ASSISTANT_DIFF_VIEW);
};

export const trackAiAssistantClearHistory = () => {
  trackEvent(AnalyticsEvents.AI_ASSISTANT_CLEAR_HISTORY);
};

// ====== Color Editor Tracking ======
export const trackColorTabOpen = (colorCount: number) => {
  trackEvent(AnalyticsEvents.COLOR_TAB_OPEN, { color_count: colorCount });
};

export const trackColorReplaceSingle = (
  oldColor: string,
  newColor: string,
  method: 'wheel' | 'input' | 'preset'
) => {
  trackEvent(AnalyticsEvents.COLOR_REPLACE_SINGLE, {
    old_color: oldColor,
    new_color: newColor,
    method,
  });
};

export const trackColorPresetUsed = (
  paletteId: string,
  paletteName: string,
  colorIndex: number
) => {
  trackEvent(AnalyticsEvents.COLOR_PRESET_USED, {
    palette_id: paletteId,
    palette_name: paletteName,
    color_index: colorIndex,
  });
};

export const trackColorResetAll = () => {
  trackEvent(AnalyticsEvents.COLOR_RESET_ALL);
};

export const trackColorWheelOpen = (color: string) => {
  trackEvent(AnalyticsEvents.COLOR_WHEEL_OPEN, { color });
};

export const trackColorWheelClose = () => {
  trackEvent(AnalyticsEvents.COLOR_WHEEL_CLOSE);
};

// ====== Settings Panel Tracking ======
export const trackSettingsOpen = () => {
  trackEvent(AnalyticsEvents.SETTINGS_OPEN);
};

export const trackSettingsTabSwitch = (tab: 'format' | 'color') => {
  trackEvent(AnalyticsEvents.SETTINGS_TAB_SWITCH, { tab });
};

export const trackSettingsFormatChange = (format: string) => {
  trackEvent(AnalyticsEvents.SETTINGS_FORMAT_CHANGE, { format });
};

export const trackSettingsQualityChange = (quality: number) => {
  trackEvent(AnalyticsEvents.SETTINGS_QUALITY_CHANGE, { quality });
};

export const trackSettingsDimensionChange = (width: number, height: number) => {
  trackEvent(AnalyticsEvents.SETTINGS_DIMENSION_CHANGE, { width, height });
};
