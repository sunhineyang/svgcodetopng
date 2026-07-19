declare global {
  interface Window {
    gtag?: (command: 'event' | 'config' | 'js', action: string, params?: any) => void;
    dataLayer?: any[];
  }
}

const isDev = () => process.env.NODE_ENV !== 'production';

const getPagePath = () => {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
};

const getDeviceCategory = () => {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
};

const getTrafficSource = () => {
  if (typeof window === 'undefined') return 'direct';
  const referrer = document.referrer;
  if (!referrer) return 'direct';
  try {
    const url = new URL(referrer);
    if (url.hostname.includes('google')) return 'google';
    if (url.hostname.includes('bing')) return 'bing';
    if (url.hostname.includes('yahoo')) return 'yahoo';
    if (url.hostname.includes('duckduckgo')) return 'duckduckgo';
    if (url.hostname.includes('twitter') || url.hostname.includes('x.com')) return 'twitter';
    if (url.hostname.includes('facebook')) return 'facebook';
    if (url.hostname.includes('linkedin')) return 'linkedin';
    if (url.hostname.includes('reddit')) return 'reddit';
    if (url.hostname.includes('github')) return 'github';
    if (url.hostname.includes('producthunt')) return 'producthunt';
    return url.hostname;
  } catch {
    return 'unknown';
  }
};

const baseParams = () => ({
  page_path: getPagePath(),
  device_category: getDeviceCategory(),
  traffic_source: getTrafficSource(),
});

export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  try {
    const params = { ...baseParams(), ...eventParams };
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
    if (isDev()) {
      console.log('[Analytics]', eventName, params);
    }
  } catch (error) {
    if (isDev()) {
      console.warn('Analytics error:', error);
    }
  }
};

export const trackPageView = (pageTitle: string, pagePath?: string) => {
  try {
    const params = {
      page_title: pageTitle,
      page_path: pagePath || getPagePath(),
      device_category: getDeviceCategory(),
      traffic_source: getTrafficSource(),
    };
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', params);
    }
    if (isDev()) {
      console.log('[Analytics]', 'page_view', params);
    }
  } catch (error) {
    if (isDev()) {
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
  SETTINGS_DIMENSION_CHANGE: "settings_dimension_change",
  SETTINGS_DIMENSION_PRESET: "settings_dimension_preset",

  // Feedback Events
  FEEDBACK_CARD_SHOWN: 'feedback_card_shown',
  FEEDBACK_CARD_DISMISSED: 'feedback_card_dismissed',
  FEEDBACK_CARD_AUTO_HIDDEN: 'feedback_card_auto_hidden',
  FEEDBACK_POSITIVE: 'feedback_positive',
  FEEDBACK_NEGATIVE_OPEN: 'feedback_negative_open',
  FEEDBACK_SUBMITTED: 'feedback_submitted',
  FEEDBACK_SUBMIT_FAILED: 'feedback_submit_failed',
  FEEDBACK_DONT_SHOW_AGAIN: 'feedback_dont_show_again',

  // Product Funnel Events
  SVG_PASTE: 'svg_paste',
  SVG_RENDER_SUCCESS: 'svg_render_success',
  SVG_RENDER_ERROR: 'svg_render_error',
  PNG_DOWNLOAD_CLICK: 'png_download_click',
  DOWNLOAD_FAILED: 'download_failed',
  EXPORT_SETTING_CHANGE: 'export_setting_change',
  TEMPLATE_USE: 'template_use',
  EXAMPLE_COPY: 'example_copy',
  AI_ASSISTANT_OPEN: 'ai_assistant_open',
  AI_PROMPT_SUBMIT: 'ai_prompt_submit',
  AI_QUICK_ACTION_CLICK: 'ai_quick_action_click',
  SECOND_CONVERSION_SAME_SESSION: 'second_conversion_same_session',
  TOOL_REPEAT_INTENT: 'tool_repeat_intent',

  // 浏览器兼容与导出拦截事件（第 1 期新增）
  BROWSER_WARNING_SHOWN: 'browser_warning_shown',
  BROWSER_WARNING_ACTION: 'browser_warning_action',
  EXPORT_SIZE_BLOCKED: 'export_size_blocked',
  // B2 渲染空白自检（第 2 期功能，本期先注册事件名，不触发）
  RENDER_BLANK_DETECTED: 'render_blank_detected',
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

// ====== Product Funnel Tracking ======

const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

const debounce = (key: string, fn: () => void, delay: number = 500) => {
  const existing = debounceTimers.get(key);
  if (existing) clearTimeout(existing);
  const timer = setTimeout(() => {
    fn();
    debounceTimers.delete(key);
  }, delay);
  debounceTimers.set(key, timer);
};

let hasPasted = false;
let hasRendered = false;

// Code-to-PNG 页面独立的去重 flag
// 必须与主页面的 flag 隔离，否则用户跨页访问时会互相影响漏埋
let hasCodePasted = false;
let hasCodeRendered = false;

const getConversionCount = () => {
  if (typeof window === 'undefined') return 0;
  const stored = sessionStorage.getItem('svg_conversion_count');
  return stored ? parseInt(stored, 10) : 0;
};

const setConversionCount = (count: number) => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('svg_conversion_count', count.toString());
};

export const trackSvgPaste = () => {
  if (hasPasted) return;
  hasPasted = true;
  debounce('svg_paste', () => {
    trackEvent(AnalyticsEvents.SVG_PASTE, {
      page_path: getPagePath(),
      device_category: getDeviceCategory(),
      traffic_source: getTrafficSource(),
    });
  }, 300);
};

export const trackSvgRenderSuccess = () => {
  if (hasRendered) return;
  hasRendered = true;
  trackEvent(AnalyticsEvents.SVG_RENDER_SUCCESS, {
    page_path: getPagePath(),
    device_category: getDeviceCategory(),
  });
};

export const trackSvgRenderError = (errorType: string) => {
  trackEvent(AnalyticsEvents.SVG_RENDER_ERROR, {
    error_type: errorType,
    page_path: getPagePath(),
    device_category: getDeviceCategory(),
  });
};

export const trackPngDownloadClick = (params: {
  export_format: string;
  export_scale?: number;
  background_type?: string;
}) => {
  trackEvent(AnalyticsEvents.PNG_DOWNLOAD_CLICK, {
    export_format: params.export_format,
    export_scale: params.export_scale || 1,
    background_type: params.background_type || 'transparent',
    page_path: getPagePath(),
    device_category: getDeviceCategory(),
  });
};

export const trackDownloadFailed = (errorType: string) => {
  trackEvent(AnalyticsEvents.DOWNLOAD_FAILED, {
    error_type: errorType,
    page_path: getPagePath(),
    device_category: getDeviceCategory(),
  });
};

export const trackExportSettingChange = (settingName: string, settingValue: string | number) => {
  debounce('export_setting_change', () => {
    trackEvent(AnalyticsEvents.EXPORT_SETTING_CHANGE, {
      setting_name: settingName,
      setting_value: String(settingValue),
      page_path: getPagePath(),
    });
  }, 400);
};

export const trackTemplateUse = (templateName: string, templateCategory: string) => {
  trackEvent(AnalyticsEvents.TEMPLATE_USE, {
    template_name: templateName,
    template_category: templateCategory,
    page_path: getPagePath(),
  });
};

export const trackExampleCopy = (exampleName: string) => {
  trackEvent(AnalyticsEvents.EXAMPLE_COPY, {
    example_name: exampleName,
    page_path: getPagePath(),
  });
};

export const trackAiAssistantOpen = () => {
  trackEvent(AnalyticsEvents.AI_ASSISTANT_OPEN, {
    page_path: getPagePath(),
  });
};

export const trackAiPromptSubmit = () => {
  trackEvent(AnalyticsEvents.AI_PROMPT_SUBMIT, {
    page_path: getPagePath(),
  });
};

export const trackAiQuickActionClick = (actionName: string) => {
  trackEvent(AnalyticsEvents.AI_QUICK_ACTION_CLICK, {
    action_name: actionName,
    page_path: getPagePath(),
  });
};

export const trackSecondConversionSameSession = () => {
  const count = getConversionCount();
  const newCount = count + 1;
  setConversionCount(newCount);
  if (newCount === 2) {
    trackEvent(AnalyticsEvents.SECOND_CONVERSION_SAME_SESSION, {
      page_path: getPagePath(),
      device_category: getDeviceCategory(),
    });
  }
};

export const trackSuccessfulConversion = () => {
  trackSecondConversionSameSession();
};

export const trackToolRepeatIntent = () => {
  const count = getConversionCount();
  if (count >= 1) {
    trackEvent(AnalyticsEvents.TOOL_REPEAT_INTENT, {
      page_path: getPagePath(),
      device_category: getDeviceCategory(),
    });
  }
};

// ====== Code-to-PNG 页面专属 Tracking ======
// 复用主页面事件名（保持漏斗统一），但用独立 flag 管理去重
// page_path 会自动区分来源：主页面是 '/'，code-to-png 是 '/code-to-png'

export const trackCodePaste = (mode: 'svg' | 'html') => {
  if (hasCodePasted) return;
  hasCodePasted = true;
  debounce('code_paste', () => {
    trackEvent(AnalyticsEvents.SVG_PASTE, {
      code_mode: mode,
      page_path: getPagePath(),
      device_category: getDeviceCategory(),
      traffic_source: getTrafficSource(),
    });
  }, 300);
};

export const trackCodeRenderSuccess = (mode: 'svg' | 'html', engine: 'native' | 'resvg' = 'native') => {
  if (hasCodeRendered) return;
  hasCodeRendered = true;
  trackEvent(AnalyticsEvents.SVG_RENDER_SUCCESS, {
    code_mode: mode,
    engine,
    page_path: getPagePath(),
    device_category: getDeviceCategory(),
  });
};

export const trackCodeRenderError = (errorType: string, mode: 'svg' | 'html') => {
  trackEvent(AnalyticsEvents.SVG_RENDER_ERROR, {
    error_type: errorType,
    code_mode: mode,
    page_path: getPagePath(),
    device_category: getDeviceCategory(),
  });
};

export const trackCodeDownloadClick = (params: {
  export_format: string;
  export_scale?: number;
  background_type?: string;
  code_mode: 'svg' | 'html';
}) => {
  trackEvent(AnalyticsEvents.PNG_DOWNLOAD_CLICK, {
    export_format: params.export_format,
    export_scale: params.export_scale || 1,
    background_type: params.background_type || 'transparent',
    code_mode: params.code_mode,
    page_path: getPagePath(),
    device_category: getDeviceCategory(),
  });
};

export const trackCodeDownloadFailed = (errorType: string, mode: 'svg' | 'html') => {
  trackEvent(AnalyticsEvents.DOWNLOAD_FAILED, {
    error_type: errorType,
    code_mode: mode,
    page_path: getPagePath(),
    device_category: getDeviceCategory(),
  });
};

// ====== 浏览器兼容与导出拦截（第 1 期）======

// A1 弹窗展示：variant 区分 mac 版 / ios 版 / firefox 顶部条
export const trackBrowserWarningShown = (variant: 'mac_safari' | 'ios' | 'firefox_banner') => {
  trackEvent(AnalyticsEvents.BROWSER_WARNING_SHOWN, {
    variant,
    browser: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    os: getDeviceCategory(),
    page_path: getPagePath(),
  });
};

// A1 弹窗按钮点击
export const trackBrowserWarningAction = (action: 'copy' | 'get_chrome' | 'continue') => {
  trackEvent(AnalyticsEvents.BROWSER_WARNING_ACTION, {
    action,
    page_path: getPagePath(),
    device_category: getDeviceCategory(),
  });
};

// A2 导出尺寸超限拦截
export const trackExportSizeBlocked = (params: {
  target_width: number;
  target_height: number;
  browser_limit: number;
  export_format: string;
}) => {
  trackEvent(AnalyticsEvents.EXPORT_SIZE_BLOCKED, {
    target_width: params.target_width,
    target_height: params.target_height,
    browser_limit: params.browser_limit,
    export_format: params.export_format,
    page_path: getPagePath(),
    device_category: getDeviceCategory(),
  });
};
