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
  Copy, Trash2, RotateCcw, ChevronDown, ChevronUp, CheckCircle, Palette
} from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';
import {
  trackEvent,
  trackSettingsOpen,
  trackSettingsTabSwitch,
  trackSettingsFormatChange,
  trackSettingsQualityChange,
  trackSettingsDimensionChange,
  trackColorTabOpen,
  trackColorReplaceSingle,
  trackColorReplaceAll,
  trackColorPresetUsed,
  trackColorResetAll,
  trackColorWheelOpen,
  trackColorWheelClose,
} from '../utils/analytics';
import {
  extractColors,
  replaceColor,
  replaceAllColors,
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
  
  // 颜色编辑相关状态
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [colorMappings, setColorMappings] = useState<Record<string, string>>({});
  const [renderedSvg, setRenderedSvg] = useState<string>(svgCode);
  const [targetColor, setTargetColor] = useState<string>('#3B82F6');
  const [pickerOpen, setPickerOpen] = useState<string | null>(null);
  
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'png',
    quality: 100,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    scale: 1,
  });

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
        trackEvent('convert_image', {
          format: exportSettings.format,
          mode: activeTab,
          quality: exportSettings.quality,
        });
      }
    } catch (error) {
      setConvertError((error as Error).message || 'Conversion failed');
    } finally {
      setIsConverting(false);
    }
  };

  const downloadImage = async (format: ExportFormat) => {
    if (!currentCode.trim()) return;

    trackEvent('download_image', { format, mode: activeTab });

    try {
      setIsConverting(true);
      const originalFormat = exportSettings.format;
      
      // 临时切换到目标格式
      setExportSettings(prev => ({ ...prev, format }));
      
      // 等待状态更新
      await new Promise(r => setTimeout(r, 50));
      
      // 执行转换
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
      }
      
      // 恢复原始格式
      setExportSettings(prev => ({ ...prev, format: originalFormat }));
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(currentCode);
    trackEvent('editor_action', { action: 'copy' });
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
                      if (activeTab === 'svg') setSvgCode(value || '');
                      else setHtmlCode(value || '');
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
                              }}
                              className="w-full p-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('settings.width')} (px)</label>
                            <input
                              type="number" min="0"
                              value={exportSettings.width}
                              onChange={(e) => {
                                const newWidth = parseInt(e.target.value) || 0;
                                setExportSettings(prev => ({ ...prev, width: newWidth }));
                                trackSettingsDimensionChange(newWidth, exportSettings.height);
                              }}
                              placeholder="Auto"
                              className="w-full p-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('settings.height')} (px)</label>
                            <input
                              type="number" min="0"
                              value={exportSettings.height}
                              onChange={(e) => {
                                const newHeight = parseInt(e.target.value) || 0;
                                setExportSettings(prev => ({ ...prev, height: newHeight }));
                                trackSettingsDimensionChange(exportSettings.width, newHeight);
                              }}
                              placeholder="Auto"
                              className="w-full p-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
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
                      </>
                    )}

                    {/* Color Settings */}
                    {settingsTab === 'color' && activeTab === 'svg' && (
                      <div className="space-y-4">
                        {/* Extracted Colors */}
                        {extractedColors.length > 0 ? (
                          <>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                              {t('settings.color.detectedColors', { count: extractedColors.length })}
                            </p>
                            <div className="space-y-2">
                              {extractedColors.map((color, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  {/* Color Swatch */}
                                  <div
                                    className="w-8 h-8 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
                                    style={{ backgroundColor: color }}
                                    onClick={() => {
                                      if (pickerOpen === color) {
                                        setPickerOpen(null);
                                        trackColorWheelClose();
                                      } else {
                                        setPickerOpen(color);
                                        trackColorWheelOpen(color);
                                      }
                                    }}
                                  />
                                  {/* Original Color */}
                                  <span className="text-xs font-mono text-slate-500 w-20">{color}</span>
                                  {/* New Color Picker */}
                                  <div className="relative">
                                    <input
                                      type="text"
                                      value={colorMappings[color] || color}
                                      onChange={(e) => {
                                        if (isValidHex(e.target.value) || e.target.value === '') {
                                          setColorMappings(prev => ({ ...prev, [color]: e.target.value }));
                                          if (e.target.value !== color && isValidHex(e.target.value)) {
                                            trackColorReplaceSingle(color, e.target.value, 'input');
                                          }
                                        }
                                      }}
                                      className="w-24 px-2 py-1 text-xs font-mono border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                    {pickerOpen === color && (
                                      <div className="absolute top-full left-0 mt-2 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-xl p-2">
                                        <HexColorPicker
                                          color={colorMappings[color] || color}
                                          onChange={(newColor) => {
                                            setColorMappings(prev => ({ ...prev, [color]: newColor }));
                                            trackColorReplaceSingle(color, newColor, 'wheel');
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Preset Palettes */}
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">{t('settings.color.presets')}</p>
                              <div className="max-h-48 overflow-y-auto space-y-3">
                                {PRESET_PALETTES.map((palette) => (
                                  <div key={palette.id}>
                                    <p className="text-xs font-medium text-slate-500 mb-1">{palette.name}</p>
                                    <div className="grid grid-cols-8 gap-1">
                                      {palette.colors.map((c, i) => (
                                        <div
                                          key={i}
                                          className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600 cursor-pointer hover:scale-110 transition-transform"
                                          style={{ backgroundColor: c }}
                                          onClick={() => {
                                            setTargetColor(c);
                                            trackColorPresetUsed(palette.id, palette.name, i);
                                          }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={targetColor}
                                  onChange={(e) => {
                                    if (isValidHex(e.target.value) || e.target.value === '') {
                                      setTargetColor(e.target.value);
                                    }
                                  }}
                                  className="w-24 px-2 py-1 text-xs font-mono border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                                <button
                                  onClick={() => {
                                    const newMappings: Record<string, string> = {};
                                    for (const c of extractedColors) {
                                      newMappings[c] = targetColor;
                                    }
                                    setColorMappings(newMappings);
                                    trackColorReplaceAll(targetColor);
                                  }}
                                  className="flex-1 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                >
                                  {t('settings.color.replaceAll')}
                                </button>
                              </div>
                              <button
                                onClick={() => {
                                  const resetMappings: Record<string, string> = {};
                                  for (const c of extractedColors) {
                                    resetMappings[c] = c;
                                  }
                                  setColorMappings(resetMappings);
                                  trackColorResetAll();
                                }}
                                className="w-full px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                              >
                                {t('settings.color.resetAllColors')}
                              </button>
                            </div>
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
      <Footer />
    </div>
  );
}
