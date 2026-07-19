'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Editor } from '@monaco-editor/react';
import html2canvas from 'html2canvas';
import GIF from 'gif.js';
import { jsPDF } from 'jspdf';
import { HexColorPicker } from 'react-colorful';
import {
  ArrowDown, Download, ImageIcon, Settings, Code,
  Copy, Trash2, RotateCcw, ChevronDown, ChevronUp, CheckCircle, Palette,
  FolderOpen, ArrowUpRight
} from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';
import BrowserWarningModal, { BrowserWarningHandle } from './BrowserWarningModal';
import {
  trackEvent,
  trackSettingsOpen,
  trackSettingsTabSwitch,
  trackSettingsFormatChange,
  trackSettingsQualityChange,
  trackSettingsDimensionChange,
  trackColorTabOpen,
  trackColorReplaceSingle,
  trackColorPresetUsed,
  trackColorResetAll,
  trackColorWheelOpen,
  trackColorWheelClose,
  trackCodePaste,
  trackCodeRenderSuccess,
  trackCodeRenderError,
  trackCodeDownloadClick,
  trackCodeDownloadFailed,
  trackExportSettingChange,
  trackTemplateUse,
  trackExampleCopy,
  trackSuccessfulConversion,
  trackToolRepeatIntent,
  trackExportSizeBlocked,
} from '../utils/analytics';
import { checkExportSize, getMaxSupportedSize } from '../utils/canvas-limit';
import { useFeedback } from './feedback/FeedbackProvider';
import {
  extractColors,
  replaceColor,
  isValidHex,
  colorEquals,
} from '../utils/svg-color';
import { PRESET_PALETTES } from '../utils/color-palettes';

type ExportFormat = 'png' | 'jpg' | 'gif' | 'webp' | 'pdf';

interface ExportSettings {
  format: ExportFormat;
  quality: number;
  width: number;
  height: number;
  backgroundColor: string;
  scale: number;
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

const DEFAULT_HTML = `<div style="
  width: 300px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  font-family: system-ui, sans-serif;
  text-align: center;
">
  <h2 style="margin: 0 0 8px 0; font-size: 24px;">Hello World</h2>
  <p style="margin: 0; font-size: 14px; opacity: 0.9;">
    Your HTML/CSS code rendered as an image
  </p>
</div>`;

function sanitizeHtml(html: string): string {
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  return cleaned;
}

export default function CodeToPngConverter() {
  const _t = useTranslations();
  const t = (key: string, values?: Record<string, any>): string => _t(`codeToPng.${key}` as any, values);
  const { theme } = useTheme();
  const { maybeShowFeedback, incrementConversionCount } = useFeedback();
  const [activeTab, setActiveTab] = useState<'svg' | 'html'>('svg');
  const [svgCode, setSvgCode] = useState(DEFAULT_SVG);
  const [htmlCode, setHtmlCode] = useState(DEFAULT_HTML);
  const [isConverting, setIsConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'format' | 'color'>('format');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const htmlPreviewRef = useRef<HTMLDivElement>(null);
  const hasPastedRef = useRef(false);
  // A1 浏览器弹窗的触发句柄：用户首次点转换/下载时调用 trigger()
  const browserWarningRef = useRef<BrowserWarningHandle>(null);
  
  // 颜色编辑相关状态
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [colorMappings, setColorMappings] = useState<Record<string, string>>({});
  const [renderedSvg, setRenderedSvg] = useState<string>(svgCode);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'png',
    quality: 100,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    scale: 1,
  });

  // A2 导出尺寸超限拦截的提示状态：不为 null 时显示拦截提示框
  const [sizeBlock, setSizeBlock] = useState<{
    targetWidth: number;
    targetHeight: number;
    maxWidth: number;
    maxHeight: number;
    maxArea: number;
    format: ExportFormat;
  } | null>(null);

  // C1 宽高比例锁：默认锁定，改宽自动算高（基准比例取 SVG 实际原始宽高比）
  const [aspectLocked, setAspectLocked] = useState(true);

  const currentCode = activeTab === 'svg' ? svgCode : htmlCode;
  
  // 自动提取 SVG 颜色
  useEffect(() => {
    if (activeTab === 'svg' && svgCode) {
      const colors = extractColors(svgCode);
      setExtractedColors(colors);
      // 智能合并颜色映射：保留已有映射，只更新新增的颜色
      setColorMappings(prev => {
        const newMappings: Record<string, string> = {};
        for (const c of colors) {
          // 保留已有映射，新颜色默认映射到自身
          newMappings[c] = prev[c] || c;
        }
        return newMappings;
      });
      // 更新渲染副本
      setRenderedSvg(svgCode);
      setSelectedColor(prev => (prev && colors.includes(prev)) ? prev : null);
    }
  }, [svgCode, activeTab]);

  // 应用颜色替换到渲染副本
  useEffect(() => {
    if (activeTab === 'svg') {
      let result = svgCode;
      for (const [oldColor, newColor] of Object.entries(colorMappings)) {
        if (!colorEquals(oldColor, newColor)) {
          result = replaceColor(result, oldColor, newColor);
        }
      }
      setRenderedSvg(result);
    }
  }, [colorMappings, svgCode, activeTab]);



  useEffect(() => {
    if (activeTab === 'html' && htmlPreviewRef.current) {
      htmlPreviewRef.current.innerHTML = sanitizeHtml(htmlCode);
    }
  }, [htmlCode, activeTab]);

  useEffect(() => {
    if ((exportSettings.format === 'jpg' || exportSettings.format === 'gif') && exportSettings.backgroundColor === 'transparent') {
      setExportSettings(prev => ({ ...prev, backgroundColor: '#ffffff' }));
    }
  }, [exportSettings.format]);

  const getMimeType = (format: string): string => {
    switch (format) {
      case 'jpg': return 'image/jpeg';
      case 'webp': return 'image/webp';
      case 'gif': return 'image/png';
      default: return 'image/png';
    }
  };

  // 解析当前 SVG 的原始尺寸：优先 width/height 属性，缺失时回退 viewBox，再缺失回退 200
  // C1 的比例锁也复用这个结果作为基准比例
  const getSvgNaturalSize = useCallback((): { width: number; height: number } => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(renderedSvg, 'image/svg+xml');
      const el = doc.querySelector('svg');
      if (!el) return { width: 200, height: 200 };
      const w = parseInt(el.getAttribute('width') || '0');
      const h = parseInt(el.getAttribute('height') || '0');
      if (w > 0 && h > 0) return { width: w, height: h };
      const vb = (el.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
      if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) {
        return { width: Math.round(vb[2]), height: Math.round(vb[3]) };
      }
      return { width: 200, height: 200 };
    } catch {
      return { width: 200, height: 200 };
    }
  }, [renderedSvg]);

  // 计算本次导出实际的目标像素尺寸（SVG 模式用；HTML 模式由 html2canvas 决定，本期不拦）
  const getTargetExportSize = useCallback((): { width: number; height: number } => {
    const natural = getSvgNaturalSize();
    const width = exportSettings.width || natural.width * exportSettings.scale;
    const height = exportSettings.height || natural.height * exportSettings.scale;
    return { width: Math.round(width), height: Math.round(height) };
  }, [exportSettings, getSvgNaturalSize]);

  // A2 前置拦截：导出前检查目标尺寸是否超浏览器上限（本期只拦 PNG/JPG/WebP）
  // 返回 true 表示被拦截（调用方应中止后续渲染）
  const checkAndBlockOversize = async (format: ExportFormat): Promise<boolean> => {
    if (activeTab !== 'svg') return false; // HTML 模式走 html2canvas，上限机制不同，本期不拦
    if (format === 'gif' || format === 'pdf') return false; // GIF/PDF 有各自的库限制，本期不拦

    const { width, height } = getTargetExportSize();
    const result = await checkExportSize(width, height);
    if (result.ok || !result.limit) return false;

    trackExportSizeBlocked({
      target_width: width,
      target_height: height,
      browser_limit: result.limit.maxArea,
      export_format: format,
    });
    setSizeBlock({
      targetWidth: width,
      targetHeight: height,
      maxWidth: result.limit.maxWidth,
      maxHeight: result.limit.maxHeight,
      maxArea: result.limit.maxArea,
      format,
    });
    return true;
  };

  // 用户选择"按最大支持尺寸导出"：等比缩小到浏览器能承受的最大尺寸后重新走下载
  const handleExportAtMaxSize = async () => {
    if (!sizeBlock) return;
    const { width, height } = await getMaxSupportedSize(sizeBlock.targetWidth, sizeBlock.targetHeight);
    const format = sizeBlock.format;
    setSizeBlock(null);
    setExportSettings(prev => ({ ...prev, width, height, scale: 1 }));
    // 等 state 生效后再触发下载
    await new Promise(r => setTimeout(r, 60));
    downloadImage(format);
  };

  // ====== C1 导出面板交互逻辑 ======

  // 点倍率按钮：设置 scale，并清空精确宽高（两套定尺寸方式互斥，以最新操作为准）
  const handleScaleSelect = (scale: number) => {
    setExportSettings(prev => ({ ...prev, scale, width: 0, height: 0 }));
    trackExportSettingChange('scale', scale);
    trackToolRepeatIntent();
  };

  // 手动改宽度：进入自定义模式（scale 不再生效，由 width/height 决定）；
  // 比例锁定时按 SVG 原始宽高比自动算高
  const handleWidthChange = (rawValue: string) => {
    const newWidth = parseInt(rawValue) || 0;
    const natural = getSvgNaturalSize();
    const ratio = natural.height / natural.width;
    setExportSettings(prev => ({
      ...prev,
      width: newWidth,
      height: aspectLocked && newWidth > 0 ? Math.round(newWidth * ratio) : prev.height,
    }));
    trackSettingsDimensionChange(newWidth, exportSettings.height);
    trackExportSettingChange('width', newWidth);
    trackToolRepeatIntent();
  };

  // 手动改高度：同理，比例锁定时自动算宽
  const handleHeightChange = (rawValue: string) => {
    const newHeight = parseInt(rawValue) || 0;
    const natural = getSvgNaturalSize();
    const ratio = natural.width / natural.height;
    setExportSettings(prev => ({
      ...prev,
      height: newHeight,
      width: aspectLocked && newHeight > 0 ? Math.round(newHeight * ratio) : prev.width,
    }));
    trackSettingsDimensionChange(exportSettings.width, newHeight);
    trackExportSettingChange('height', newHeight);
    trackToolRepeatIntent();
  };

  // 当前生效的尺寸模式：custom（填了精确宽高）或 scale（用倍率）
  const sizeMode: 'custom' | 'scale' =
    exportSettings.width > 0 || exportSettings.height > 0 ? 'custom' : 'scale';

  // 参数摘要行：实时反映当前生效的导出参数
  const exportSummary = (() => {
    const natural = getSvgNaturalSize();
    const w = exportSettings.width || Math.round(natural.width * exportSettings.scale);
    const h = exportSettings.height || Math.round(natural.height * exportSettings.scale);
    const sizeText = sizeMode === 'custom' ? `${w}×${h} px · custom` : `${w}×${h} px · ${exportSettings.scale}x`;
    const bgText = exportSettings.backgroundColor === 'transparent' ? 'Transparent' : exportSettings.backgroundColor;
    return `${sizeText} · ${bgText}`;
  })();

  const convertSvgToImage = useCallback(async () => {
    if (!renderedSvg.trim()) return null;

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(renderedSvg, 'image/svg+xml');
    const parseError = svgDoc.querySelector('parsererror');

    if (parseError) {
      throw new Error(parseError.textContent?.trim() || 'Invalid SVG code');
    }

    const svgElement = svgDoc.querySelector('svg');

    if (!svgElement) throw new Error('Invalid SVG code');

    const originalWidth = parseInt(svgElement.getAttribute('width') || '200');
    const originalHeight = parseInt(svgElement.getAttribute('height') || '200');

    const finalWidth = exportSettings.width || originalWidth * exportSettings.scale;
    const finalHeight = exportSettings.height || originalHeight * exportSettings.scale;

    const svgBlob = new Blob([renderedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise<Blob | null>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) { resolve(null); return; }

        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }

        canvas.width = finalWidth;
        canvas.height = finalHeight;

        if (exportSettings.backgroundColor !== 'transparent') {
          ctx.fillStyle = exportSettings.backgroundColor;
          ctx.fillRect(0, 0, finalWidth, finalHeight);
        }

        ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

        if (exportSettings.format === 'gif') {
          const gif = new GIF({
            workers: 2,
            quality: 10,
            width: finalWidth,
            height: finalHeight,
            workerScript: '/gif.worker.js',
          });
          gif.addFrame(canvas, { delay: 500, copy: true });
          gif.on('finished', (blob: Blob) => {
            URL.revokeObjectURL(url);
            resolve(blob);
          });
          gif.on('error', (err: Error) => {
            URL.revokeObjectURL(url);
            reject(err);
          });
          gif.render();
        } else if (exportSettings.format === 'pdf') {
          const pdf = new jsPDF({
            orientation: finalWidth > finalHeight ? 'landscape' : 'portrait',
            unit: 'px',
            format: [finalWidth, finalHeight]
          });
          
          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', 0, 0, finalWidth, finalHeight);
          
          const pdfBlob = pdf.output('blob');
          URL.revokeObjectURL(url);
          resolve(pdfBlob);
        } else {
          const mimeType = getMimeType(exportSettings.format);
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(url);
            resolve(blob);
          }, mimeType, exportSettings.quality / 100);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Error loading SVG'));
      };

      img.src = url;
    });
  }, [svgCode, exportSettings]);

  const convertHtmlToImage = useCallback(async () => {
    if (!htmlCode.trim()) return null;

    const container = htmlPreviewRef.current;
    if (!container) return null;

    await new Promise(r => requestAnimationFrame(r));
    await new Promise(r => setTimeout(r, 150));

    const canvas = await html2canvas(container, {
      scale: exportSettings.scale || 2,
      backgroundColor: exportSettings.backgroundColor === 'transparent' ? null : exportSettings.backgroundColor,
      useCORS: true,
      logging: false,
      width: exportSettings.width || undefined,
      height: exportSettings.height || undefined,
    });

    if (exportSettings.format === 'gif') {
      return new Promise<Blob | null>((resolve, reject) => {
        const gif = new GIF({
          workers: 2,
          quality: 10,
          width: canvas.width,
          height: canvas.height,
          workerScript: '/gif.worker.js',
        });
        gif.addFrame(canvas, { delay: 500, copy: true });
        gif.on('finished', (blob: Blob) => resolve(blob));
        gif.on('error', (err: Error) => reject(err));
        gif.render();
      });
    }

    if (exportSettings.format === 'pdf') {
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      
      return pdf.output('blob');
    }

    return new Promise<Blob | null>((resolve) => {
      const mimeType = getMimeType(exportSettings.format);
      canvas.toBlob((blob) => {
        resolve(blob);
      }, mimeType, exportSettings.quality / 100);
    });
  }, [htmlCode, exportSettings]);

  const handleConvert = async () => {
    if (!currentCode.trim()) return;

    // A1：用户首次尝试导出操作时，触发浏览器兼容提醒（仅 Safari/iOS 且不在静默期才会真的弹）
    browserWarningRef.current?.trigger();

    // A2 前置拦截：目标尺寸超浏览器上限则不渲染，直接提示
    if (await checkAndBlockOversize(exportSettings.format)) return;

    setIsConverting(true);
    setConvertError(null);
    setPreviewUrl(null);

    try {
      const blob = activeTab === 'svg'
        ? await convertSvgToImage()
        : await convertHtmlToImage();

      if (blob) {
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        trackCodeRenderSuccess(activeTab);
        trackEvent('convert_image', {
          format: exportSettings.format,
          mode: activeTab,
          quality: exportSettings.quality,
        });
      } else {
        trackCodeRenderError('blob_generation_failed', activeTab);
      }
    } catch (error) {
      setConvertError((error as Error).message || 'Conversion failed');
      // 根据 tab 和错误信息分类错误类型
      const errMsg = (error as Error)?.message || '';
      let errorType = 'render_error';
      if (errMsg.toLowerCase().includes('invalid svg')) errorType = 'invalid_svg_code';
      else if (errMsg.toLowerCase().includes('parse')) errorType = 'parse_error';
      else if (errMsg.toLowerCase().includes('load')) errorType = 'image_load_error';
      trackCodeRenderError(errorType, activeTab);
    } finally {
      setIsConverting(false);
    }
  };

  const downloadImage = async (format: ExportFormat) => {
    if (!currentCode.trim()) return;

    // A1：用户首次尝试导出操作时，触发浏览器兼容提醒
    browserWarningRef.current?.trigger();

    // A2 前置拦截：目标尺寸超浏览器上限则不下载，直接提示
    if (await checkAndBlockOversize(format)) return;

    const backgroundType = exportSettings.backgroundColor === 'transparent' ? 'transparent' : 'solid';
    trackCodeDownloadClick({
      export_format: format,
      export_scale: exportSettings.scale,
      background_type: backgroundType,
      code_mode: activeTab,
    });

    let downloadSuccess = false;
    try {
      setIsConverting(true);
      const originalFormat = exportSettings.format;
      
      setExportSettings(prev => ({ ...prev, format }));
      
      await new Promise(r => setTimeout(r, 50));
      
      const blob = activeTab === 'svg'
        ? await convertSvgToImage()
        : await convertHtmlToImage();
      
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `code-to-png-${Date.now()}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        downloadSuccess = true;
      } else {
        trackCodeDownloadFailed('blob_generation_failed', activeTab);
      }
      
      setExportSettings(prev => ({ ...prev, format: originalFormat }));
    } catch (error) {
      console.error('Download error:', error);
      const errMsg = (error as Error)?.message || '';
      let errorType = 'download_error';
      if (errMsg.toLowerCase().includes('invalid svg')) errorType = 'invalid_svg_code';
      else if (errMsg.toLowerCase().includes('parse')) errorType = 'parse_error';
      else if (errMsg.toLowerCase().includes('load')) errorType = 'image_load_error';
      trackCodeDownloadFailed(errorType, activeTab);
    } finally {
      setIsConverting(false);
    }

    if (downloadSuccess) {
      trackSuccessfulConversion();
      incrementConversionCount();
      maybeShowFeedback({
        context: {
          mode: activeTab,
          format,
          quality: exportSettings.quality,
          width: exportSettings.width,
          height: exportSettings.height,
          background: exportSettings.backgroundColor,
          scale: exportSettings.scale,
          locale: typeof window !== 'undefined' ? document.documentElement.lang || 'en' : 'en',
        },
        svgCode: activeTab === 'svg' ? svgCode : null,
      });
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(currentCode);
    trackEvent('editor_action', { action: 'copy' });
    trackExampleCopy(activeTab === 'svg' ? 'code_to_png_svg' : 'code_to_png_html');
  };

  const clearCode = () => {
    if (activeTab === 'svg') setSvgCode('');
    else setHtmlCode('');
    setPreviewUrl(null);
    trackEvent('editor_action', { action: 'clear' });
  };

  const resetCode = () => {
    if (activeTab === 'svg') setSvgCode(DEFAULT_SVG);
    else setHtmlCode(DEFAULT_HTML);
    setPreviewUrl(null);
    trackEvent('editor_action', { action: 'reset' });
    trackTemplateUse(
      activeTab === 'svg' ? 'code_to_png_default_svg' : 'code_to_png_default_html',
      'built_in'
    );
  };

  const faqItems = [
    { q: t('faq.q4'), a: t('faq.a4') },
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q5'), a: t('faq.a5') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Navigation />

      <section className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            {t('hero.title')}
          </h1>
          <h2 className="text-xl text-slate-600 dark:text-slate-300 mb-2 font-semibold">
            {t('hero.subtitle')}
          </h2>
          <p className="text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {t('hero.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <button
              onClick={() => document.getElementById('converter')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 justify-center"
            >
              <Code className="w-4 h-4" />
              {t('hero.cta1')}
            </button>
            <button
              onClick={() => document.getElementById('how-to')?.scrollIntoView({ behavior: 'smooth' })}
              className="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 justify-center"
            >
              <ArrowDown className="w-4 h-4" />
              {t('hero.cta2')}
            </button>
          </div>
        </div>
      </section>

      <section id="converter" className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 lg:p-8">

            <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg w-fit">
              <button
                onClick={() => { setActiveTab('svg'); setConvertError(null); }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'svg'
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Code className="w-4 h-4 inline mr-1.5" />
                {t('tabs.svgCode')}
              </button>
              <button
                onClick={() => { setActiveTab('html'); setConvertError(null); }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'html'
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <ImageIcon className="w-4 h-4 inline mr-1.5" />
                {t('tabs.htmlCss')}
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    {t('editor.label')}
                  </h2>
                  <div className="flex gap-1">
                    <button onClick={copyCode} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title={t('actions.copy')}>
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={clearCode} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title={t('actions.clear')}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button onClick={resetCode} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title={t('actions.reset')}>
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <Editor
                    height="350px"
                    language={activeTab === 'svg' ? 'xml' : 'html'}
                    value={currentCode}
                    onChange={(value) => {
                      const nextValue = value || '';
                      // 只有用户真的改了内容（不同于默认值、不同于当前值）才算一次粘贴
                      if (!hasPastedRef.current && nextValue.trim() && nextValue !== currentCode) {
                        hasPastedRef.current = true;
                        trackCodePaste(activeTab);
                      }
                      if (activeTab === 'svg') setSvgCode(nextValue);
                      else setHtmlCode(nextValue);
                    }}
                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: 'on',
                      wordWrap: 'on',
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    {t('preview.title')}
                  </h2>
                  <button
                    onClick={() => {
                      setShowSettings(!showSettings);
                      if (!showSettings) {
                        trackSettingsOpen();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    {t('settings.color.settingsButton')}
                  </button>
                </div>

                {showSettings && (
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg space-y-3">
                    {/* Settings Tabs */}
                    <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">
                      <button
                        onClick={() => {
                          setSettingsTab('format');
                          trackSettingsTabSwitch('format');
                        }}
                        className={`px-3 py-1 text-xs font-medium rounded-t transition-colors ${
                          settingsTab === 'format'
                            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {t('settings.color.formatTab')}
                      </button>
                      {activeTab === 'svg' && (
                        <button
                          onClick={() => {
                            setSettingsTab('color');
                            trackSettingsTabSwitch('color');
                            if (settingsTab !== 'color') {
                              trackColorTabOpen(extractedColors.length);
                            }
                          }}
                          className={`px-3 py-1 text-xs font-medium rounded-t transition-colors ${
                            settingsTab === 'color'
                              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                          }`}
                        >
                          {t('settings.color.colorTab')}
                        </button>
                      )}
                    </div>

                    {/* Format Settings */}
                    {settingsTab === 'format' && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('settings.format')}</label>
                            <select
                              value={exportSettings.format}
                              onChange={(e) => {
                                const newFormat = e.target.value as ExportFormat;
                                setExportSettings(prev => ({ ...prev, format: newFormat }));
                                trackSettingsFormatChange(newFormat);
                                trackExportSettingChange('format', newFormat);
                                trackToolRepeatIntent();
                              }}
                              className="w-full p-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            >
                              <option value="png">PNG</option>
                              <option value="jpg">JPG</option>
                              <option value="gif">GIF</option>
                              <option value="webp">WebP</option>
                              <option value="pdf">PDF</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('settings.quality')} (%)</label>
                            <input
                              type="number" min="1" max="100"
                              value={exportSettings.quality}
                              onChange={(e) => {
                                const newQuality = parseInt(e.target.value) || 100;
                                setExportSettings(prev => ({ ...prev, quality: newQuality }));
                                trackSettingsQualityChange(newQuality);
                                trackExportSettingChange('quality', newQuality);
                                trackToolRepeatIntent();
                              }}
                              className="w-full p-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                        {/* C1 倍率按钮组：1x/2x/3x，与精确宽高互斥 */}
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('settings.scale')}</label>
                          <div className="flex gap-2">
                            {[1, 2, 3].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => handleScaleSelect(s)}
                                className={`flex-1 py-1.5 text-sm font-medium rounded border transition-colors ${
                                  sizeMode === 'scale' && exportSettings.scale === s
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                {s}x
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('settings.width')} (px)</label>
                            <input
                              type="number" min="0"
                              value={exportSettings.width || ''}
                              onChange={(e) => handleWidthChange(e.target.value)}
                              placeholder="Auto"
                              className="w-full p-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('settings.height')} (px)</label>
                            <input
                              type="number" min="0"
                              value={exportSettings.height || ''}
                              onChange={(e) => handleHeightChange(e.target.value)}
                              placeholder="Auto"
                              className="w-full p-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                        {/* C1 比例锁开关 */}
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={aspectLocked}
                            onChange={(e) => setAspectLocked(e.target.checked)}
                            className="w-3.5 h-3.5 accent-blue-600"
                          />
                          <span className="text-xs text-slate-600 dark:text-slate-400">{t('settings.lockAspect')}</span>
                        </label>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('settings.background')}</label>
                          <select
                            value={exportSettings.backgroundColor}
                            onChange={(e) => setExportSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                            className="w-full p-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          >
                            <option value="transparent">{t('settings.transparent')}</option>
                            <option value="#ffffff">{t('settings.white')}</option>
                            <option value="#000000">{t('settings.black')}</option>
                          </select>
                        </div>
                        {/* C1 参数摘要行：实时反映当前生效的导出参数 */}
                        <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            Export: {exportSummary}
                          </p>
                        </div>
                      </>
                    )}

                    {/* Color Settings */}
                    {settingsTab === 'color' && activeTab === 'svg' && (
                      <div className="space-y-3">
                        {extractedColors.length > 0 ? (
                          <>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                              {t('settings.color.detectedColors', { count: extractedColors.length })}
                            </p>
                            <div className="flex gap-3">
                              <div className="flex-1 space-y-1 max-h-72 overflow-y-auto">
                                {extractedColors.map((color, index) => {
                                  const mappedColor = colorMappings[color] || color;
                                  const isChanged = !colorEquals(color, mappedColor);
                                  return (
                                    <div
                                      key={index}
                                      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                                        selectedColor === color
                                          ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500'
                                          : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                      }`}
                                      onClick={() => {
                                        if (selectedColor === color) {
                                          setSelectedColor(null);
                                          trackColorWheelClose();
                                        } else {
                                          setSelectedColor(color);
                                          trackColorWheelOpen(color);
                                        }
                                      }}
                                    >
                                      <div
                                        className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600 shrink-0"
                                        style={{ backgroundColor: mappedColor }}
                                      />
                                      <span className="text-xs font-mono text-slate-500 shrink-0">{color}</span>
                                      {isChanged && (
                                        <div
                                          className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 shrink-0 ml-auto"
                                          style={{ backgroundColor: color }}
                                        />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="w-56 shrink-0">
                                {selectedColor ? (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-7 h-7 rounded border border-slate-300 dark:border-slate-600"
                                        style={{ backgroundColor: selectedColor }}
                                      />
                                      <span className="text-xs text-slate-400">→</span>
                                      <div
                                        className="w-7 h-7 rounded border border-slate-300 dark:border-slate-600"
                                        style={{ backgroundColor: colorMappings[selectedColor] || selectedColor }}
                                      />
                                      <input
                                        type="text"
                                        value={colorMappings[selectedColor] || selectedColor}
                                        onChange={(e) => {
                                          if (!selectedColor) return;
                                          if (isValidHex(e.target.value) || e.target.value === '') {
                                            setColorMappings(prev => ({ ...prev, [selectedColor]: e.target.value }));
                                            if (e.target.value !== selectedColor && isValidHex(e.target.value)) {
                                              trackColorReplaceSingle(selectedColor, e.target.value, 'input');
                                            }
                                          }
                                        }}
                                        className="flex-1 min-w-0 px-1.5 py-0.5 text-xs font-mono border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                      />
                                    </div>
                                    <HexColorPicker
                                      color={colorMappings[selectedColor] || selectedColor}
                                      onChange={(newColor) => {
                                        if (!selectedColor) return;
                                        setColorMappings(prev => ({ ...prev, [selectedColor]: newColor }));
                                        trackColorReplaceSingle(selectedColor, newColor, 'wheel');
                                      }}
                                    />
                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                      {PRESET_PALETTES.map((palette) => (
                                        <div key={palette.id}>
                                          <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mb-0.5 truncate">{palette.name}</p>
                                          <div className="grid grid-cols-8 gap-0.5">
                                            {palette.colors.map((c, i) => (
                                              <div
                                                key={`${palette.id}-${i}`}
                                                className="w-5 h-5 rounded-sm cursor-pointer hover:scale-110 transition-transform border border-slate-200 dark:border-slate-700"
                                                style={{ backgroundColor: c }}
                                                onClick={() => {
                                                  if (!selectedColor) return;
                                                  setColorMappings(prev => ({ ...prev, [selectedColor]: c }));
                                                  trackColorPresetUsed(palette.id, palette.name, i);
                                                  trackColorReplaceSingle(selectedColor, c, 'preset');
                                                }}
                                              />
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center h-48 text-xs text-slate-400 dark:text-slate-500 text-center px-4">
                                    {t('settings.color.selectColorToEdit')}
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const resetMappings: Record<string, string> = {};
                                for (const c of extractedColors) {
                                  resetMappings[c] = c;
                                }
                                setColorMappings(resetMappings);
                                setSelectedColor(null);
                                trackColorResetAll();
                              }}
                              className="w-full px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                            >
                              {t('settings.color.resetAllColors')}
                            </button>
                          </>
                        ) : (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {t('settings.color.noColorsDetected')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-900 min-h-[250px] flex items-center justify-center overflow-auto">
                  {currentCode ? (
                    activeTab === 'svg' ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: renderedSvg }}
                        className="max-w-full max-h-full"
                      />
                    ) : (
                      <div
                        ref={htmlPreviewRef}
                        className="max-w-full max-h-full"
                      />
                    )
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{t('preview.empty')}</p>
                    </div>
                  )}
                </div>

                {convertError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {convertError}
                    </p>
                  </div>
                )}

                {sizeBlock && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg space-y-3">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                      {t('sizeBlock.title', {
                        width: sizeBlock.targetWidth,
                        height: sizeBlock.targetHeight,
                      })}
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {t('sizeBlock.body', {
                        maxWidth: sizeBlock.maxWidth,
                        maxHeight: sizeBlock.maxHeight,
                      })}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={handleExportAtMaxSize}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                      >
                        {t('sizeBlock.exportMax')}
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          window.open('https://www.google.com/chrome/', '_blank', 'noopener');
                        }}
                        className="flex-1 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-sm font-medium py-2 px-3 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                      >
                        {t('sizeBlock.copyAndChrome')}
                      </button>
                      <button
                        onClick={() => setSizeBlock(null)}
                        className="sm:w-auto px-3 py-2 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
                      >
                        {t('sizeBlock.cancel')}
                      </button>
                    </div>
                    <p className="text-[11px] text-amber-500 dark:text-amber-400">
                      {t('sizeBlock.gifPdfNote')}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleConvert}
                  disabled={!currentCode.trim() || isConverting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2.5 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {isConverting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('actions.converting')}
                    </>
                  ) : (
                    <>
                      <ArrowDown className="w-4 h-4" />
                      {t('actions.convertPreview')}
                    </>
                  )}
                </button>

                {previewUrl && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">Ready to download</span>
                    </div>
                    {exportSettings.format !== 'gif' && (
                      <img
                        src={previewUrl}
                        alt="Converted"
                        className="max-w-full h-auto rounded border border-gray-200 dark:border-gray-600 mb-2"
                        style={{ maxHeight: '160px' }}
                      />
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => downloadImage('png')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PNG
                      </button>
                      <button
                        onClick={() => downloadImage('jpg')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        JPG
                      </button>
                      <button
                        onClick={() => downloadImage('gif')}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        GIF
                      </button>
                      <button
                        onClick={() => downloadImage('webp')}
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        WebP
                      </button>
                      <button
                        onClick={() => downloadImage('pdf')}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-to" className="py-16 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-4">
            {t('howTo.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            {[
              { step: t('howTo.step1.title'), desc: t('howTo.step1.desc'), num: '1', color: 'blue' },
              { step: t('howTo.step2.title'), desc: t('howTo.step2.desc'), num: '2', color: 'purple' },
              { step: t('howTo.step3.title'), desc: t('howTo.step3.desc'), num: '3', color: 'green' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-${item.color}-100 dark:bg-${item.color}-900 text-${item.color}-600 dark:text-${item.color}-400 rounded-full mb-5`}>
                  <span className="text-2xl font-bold">{item.num}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  {item.step}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-4">
            {t('features.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {[
              { title: t('features.f1.title'), desc: t('features.f1.desc'), icon: Code, bg: 'from-blue-600 to-cyan-500' },
              { title: t('features.f2.title'), desc: t('features.f2.desc'), icon: CheckCircle, bg: 'from-emerald-600 to-green-500' },
              { title: t('features.f3.title'), desc: t('features.f3.desc'), icon: ImageIcon, bg: 'from-violet-600 to-purple-500' },
              { title: t('features.f4.title'), desc: t('features.f4.desc'), icon: Download, bg: 'from-orange-600 to-amber-500' },
            ].map((feat, idx) => {
              const FeatIcon = feat.icon;
              return (
                <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                  <div className={`inline-flex items-center justify-center w-11 h-11 bg-gradient-to-r ${feat.bg} rounded-lg mb-4`}>
                    <FeatIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-10 px-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-3xl mx-auto">
          <a
            href="https://svgtopng.app/?utm_source=svgcodetopng&utm_medium=cross_promo&utm_campaign=batch_converter"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl px-6 py-4 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            onClick={() => trackEvent('cross_promo_click', { target: 'svgtopng_batch' })}
          >
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shrink-0">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {t('crossPromo.title')}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('crossPromo.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-medium shrink-0">
              <span className="group-hover:underline">{t('crossPromo.cta')}</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>
        </div>
      </section>

      <section className="py-16 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-8">
            {t('faq.title')}
          </h2>
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors rounded-lg"
                >
                  <h3 className="font-medium text-slate-900 dark:text-white text-sm pr-4">
                    {item.q}
                  </h3>
                  {expandedFAQ === index ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFAQ === index && (
                  <div className="px-5 pb-4">
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            {t('cta.desc')}
          </p>
          <button
            onClick={() => document.getElementById('converter')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <ArrowDown className="w-5 h-5 mr-2" />
            {t('cta.button')}
          </button>
        </div>
      </section>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <BrowserWarningModal ref={browserWarningRef} />
      <Footer />
    </div>
  );
}
