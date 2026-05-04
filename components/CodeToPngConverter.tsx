'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Editor } from '@monaco-editor/react';
import html2canvas from 'html2canvas';
import {
  ArrowDown, Download, ImageIcon, Settings, Code,
  Copy, Trash2, RotateCcw, ChevronDown, ChevronUp, CheckCircle
} from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';
import { trackEvent } from '../utils/analytics';

interface ExportSettings {
  format: 'png' | 'jpg';
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
  const t = (key: string): string => _t(`codeToPng.${key}` as any);
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'svg' | 'html'>('svg');
  const [svgCode, setSvgCode] = useState(DEFAULT_SVG);
  const [htmlCode, setHtmlCode] = useState(DEFAULT_HTML);
  const [isConverting, setIsConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const htmlPreviewRef = useRef<HTMLDivElement>(null);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'png',
    quality: 100,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    scale: 1,
  });

  const currentCode = activeTab === 'svg' ? svgCode : htmlCode;

  useEffect(() => {
    if (activeTab === 'html' && htmlPreviewRef.current) {
      htmlPreviewRef.current.innerHTML = sanitizeHtml(htmlCode);
    }
  }, [htmlCode, activeTab]);

  useEffect(() => {
    if (exportSettings.format === 'jpg' && exportSettings.backgroundColor === 'transparent') {
      setExportSettings(prev => ({ ...prev, backgroundColor: '#ffffff' }));
    }
  }, [exportSettings.format]);

  const convertSvgToImage = useCallback(async () => {
    if (!svgCode.trim()) return null;

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgCode, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');

    if (!svgElement) throw new Error('Invalid SVG code');

    const originalWidth = parseInt(svgElement.getAttribute('width') || '200');
    const originalHeight = parseInt(svgElement.getAttribute('height') || '200');

    const finalWidth = exportSettings.width || originalWidth * exportSettings.scale;
    const finalHeight = exportSettings.height || originalHeight * exportSettings.scale;

    const svgBlob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
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

        const mimeType = exportSettings.format === 'jpg' ? 'image/jpeg' : 'image/png';
        canvas.toBlob((blob) => {
          resolve(blob);
        }, mimeType, exportSettings.quality / 100);

        URL.revokeObjectURL(url);
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

    return new Promise<Blob | null>((resolve) => {
      const mimeType = exportSettings.format === 'jpg' ? 'image/jpeg' : 'image/png';
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

  const downloadImage = (format: 'png' | 'jpg') => {
    if (!previewUrl) return;

    trackEvent('download_image', { format, mode: activeTab });

    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `code-to-png-${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    { q: t('faq.q1'), a: t('faq.a1') },
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
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-2">
            {t('hero.subtitle')}
          </p>
          <p className="text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {t('hero.description')}
          </p>
        </div>
      </section>

      <section className="py-8 px-4">
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
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    {t('editor.label')}
                  </h3>
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
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    {t('preview.title')}
                  </h3>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Settings
                  </button>
                </div>

                {showSettings && (
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('settings.format')}</label>
                        <select
                          value={exportSettings.format}
                          onChange={(e) => setExportSettings(prev => ({ ...prev, format: e.target.value as 'png' | 'jpg' }))}
                          className="w-full p-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          <option value="png">PNG</option>
                          <option value="jpg">JPG</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('settings.quality')} (%)</label>
                        <input
                          type="number" min="1" max="100"
                          value={exportSettings.quality}
                          onChange={(e) => setExportSettings(prev => ({ ...prev, quality: parseInt(e.target.value) || 100 }))}
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
                          onChange={(e) => setExportSettings(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                          placeholder="Auto"
                          className="w-full p-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('settings.height')} (px)</label>
                        <input
                          type="number" min="0"
                          value={exportSettings.height}
                          onChange={(e) => setExportSettings(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
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
                  </div>
                )}

                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-900 min-h-[250px] flex items-center justify-center overflow-auto">
                  {currentCode ? (
                    activeTab === 'svg' ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: svgCode }}
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
                      Convert &amp; Preview
                    </>
                  )}
                </button>

                {previewUrl && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">Ready to download</span>
                    </div>
                    <img
                      src={previewUrl}
                      alt="Converted"
                      className="max-w-full h-auto rounded border border-gray-200 dark:border-gray-600 mb-2"
                      style={{ maxHeight: '160px' }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadImage('png')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {t('actions.downloadPng')}
                      </button>
                      <button
                        onClick={() => downloadImage('jpg')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {t('actions.downloadJpg')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
            {t('faq.title')}
          </h2>
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors rounded-lg"
                >
                  <span className="font-medium text-slate-900 dark:text-white text-sm">
                    {item.q}
                  </span>
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

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <Footer />
    </div>
  );
}
