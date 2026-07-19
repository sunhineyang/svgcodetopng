'use client';

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, X, AlertTriangle } from 'lucide-react';
import { trackBrowserWarningShown, trackBrowserWarningAction } from '../utils/analytics';

// 浏览器变体：mac_safari / ios / firefox_banner / none
type BrowserVariant = 'mac_safari' | 'ios' | 'firefox_banner' | 'none';

const DISMISS_KEY = 'bw_dismissed_until';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// 检测当前浏览器属于哪种变体
// 关键坑：iPadOS 13+ 的 iPad UA 和 Mac 完全一样，必须用 maxTouchPoints>1 区分
function detectBrowserVariant(): BrowserVariant {
  if (typeof navigator === 'undefined') return 'none';
  const ua = navigator.userAgent;

  // iPhone / iPod 直接看 UA
  const isIPhoneOrIPod = /iphone|ipod/i.test(ua);
  // iPadOS 13+：UA 是 Mac，但有触屏
  const isIPadOSDesktopUA = /macintosh/i.test(ua) && (navigator.maxTouchPoints || 0) > 1;
  // 老版 iPad：UA 里直接有 ipad
  const isLegacyIPad = /ipad/i.test(ua);

  if (isIPhoneOrIPod || isIPadOSDesktopUA || isLegacyIPad) return 'ios';

  // Mac Safari：UA 含 Safari 但不含 Chrome/Chromium/Edg，且是 Mac
  const isMacSafari =
    /macintosh/i.test(ua) &&
    /safari/i.test(ua) &&
    !/chrome|chromium|edg/i.test(ua);
  if (isMacSafari) return 'mac_safari';

  // Firefox：只显示顶部提示条，不弹窗
  if (/firefox/i.test(ua)) return 'firefox_banner';

  return 'none';
}

// 是否仍在 7 天静默期内
function isDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const until = localStorage.getItem(DISMISS_KEY);
    if (!until) return false;
    return Date.now() < parseInt(until, 10);
  } catch {
    return false;
  }
}

export interface BrowserWarningHandle {
  // 父组件在用户首次点转换/下载时调用：满足条件才弹
  trigger: () => void;
}

interface BrowserWarningModalProps {
  // i18n 命名空间前缀：首页传 'converter.browserWarning'，子页不传（默认 'codeToPng.browserWarning'）
  // 这样首页和子页可以各自维护独立文案
  i18nPrefix?: string;
}

// A1 浏览器兼容提醒：
// - Mac Safari / iOS：首次点转换/下载时弹窗（不挡背景内容）
// - Firefox：页面顶部显示可关闭的浅色提示条
// - Chrome/Edge：完全不提示
const BrowserWarningModal = forwardRef<BrowserWarningHandle, BrowserWarningModalProps>(function BrowserWarningModal({ i18nPrefix = 'codeToPng.browserWarning' }, ref) {
  const _t = useTranslations();
  const t = (key: string): string => _t(`${i18nPrefix}.${key}` as any);

  const [variant, setVariant] = useState<BrowserVariant>('none');
  const [modalOpen, setModalOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // 挂载时判定浏览器类型；Firefox 顶部条进页就显示（可关闭），弹窗类则等 trigger
  useEffect(() => {
    const v = detectBrowserVariant();
    setVariant(v);
    if (v === 'firefox_banner') {
      setBannerVisible(true);
      trackBrowserWarningShown('firefox_banner');
    }
  }, []);

  // 触发弹窗：仅 mac_safari / ios，且不在 7 天静默期内
  const trigger = useCallback(() => {
    if (variant !== 'mac_safari' && variant !== 'ios') return;
    if (modalOpen || isDismissed()) return;
    setModalOpen(true);
    trackBrowserWarningShown(variant);
  }, [variant, modalOpen]);

  useImperativeHandle(ref, () => ({ trigger }), [trigger]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      trackBrowserWarningAction('copy');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 剪贴板不可用时静默失败，不影响主流程
    }
  };

  const handleGetChrome = () => {
    trackBrowserWarningAction('get_chrome');
    window.open('https://www.google.com/chrome/', '_blank', 'noopener');
  };

  // 仍然继续：写 7 天静默期，关闭弹窗
  const handleContinue = () => {
    trackBrowserWarningAction('continue');
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + SEVEN_DAYS_MS));
    } catch {
      // localStorage 不可用（如隐私模式）时忽略，下次还会弹
    }
    setModalOpen(false);
  };

  // Firefox 顶部提示条
  if (variant === 'firefox_banner' && bannerVisible) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <p className="text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {t('firefoxBanner')}
          </p>
          <button
            onClick={() => setBannerVisible(false)}
            className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Mac Safari / iOS 弹窗：不挡背景内容（无全屏遮罩，固定在右下/底部居中，背景可交互）
  if (modalOpen && (variant === 'mac_safari' || variant === 'ios')) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md pointer-events-none">
        <div className="pointer-events-auto bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-start gap-3">
            <div className="inline-flex items-center justify-center w-9 h-9 bg-amber-100 dark:bg-amber-900/40 rounded-lg shrink-0">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {variant === 'ios' ? t('ios.title') : t('mac.title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                {variant === 'ios' ? t('ios.body') : t('mac.body')}
              </p>
            </div>
            <button
              onClick={() => setModalOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? t('copied') : t('copyLink')}
            </button>
            {variant === 'mac_safari' && (
              <button
                onClick={handleGetChrome}
                className="px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                {t('getChrome')}
              </button>
            )}
            <button
              onClick={handleContinue}
              className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              {t('continueAnyway')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
});

export default BrowserWarningModal;
