'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import GIF from 'gif.js';
import { 
  ArrowDown, 
  Download, 
  ImageIcon,
  Settings,
  Sparkles,
  Copy,
  Trash2,
  RotateCcw,
  Zap,
  Shield,
  Globe,
  Smartphone,
  Code,
  CheckCircle,
  Star,
  Palette,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';

interface ExportSettings {
  format: 'png' | 'jpg' | 'gif';
  quality: number;
  width: number;
  height: number;
  backgroundColor: string;
  scale: number;
}

export default function KoreanHomePage() {
  const t = useTranslations();
  const { theme } = useTheme();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [svgCode, setSvgCode] = useState(`<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1">
        <animate attributeName="stop-color" values="#f8fafc;#e0f2fe;#f8fafc" dur="4s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1">
        <animate attributeName="stop-color" values="#e2e8f0;#bae6fd;#e2e8f0" dur="4s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1">
        <animate attributeName="stop-color" values="#3b82f6;#8b5cf6;#06b6d4;#3b82f6" dur="3s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1">
        <animate attributeName="stop-color" values="#8b5cf6;#06b6d4;#3b82f6;#8b5cf6" dur="3s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#475569;stop-opacity:1"/>
    </linearGradient>
    <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.1">
        <animate attributeName="stdDeviation" values="4;8;4" dur="2s" repeatCount="indefinite"/>
      </feDropShadow>
    </filter>
    <filter id="glowShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#3b82f6" flood-opacity="0.3">
        <animate attributeName="flood-opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite"/>
      </feDropShadow>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="200" height="200" fill="url(#bgGrad)" rx="16"/>
  
  <!-- Main Title: SVG -->
  <text x="100" y="60" text-anchor="middle" font-family="'Inter', 'SF Pro Display', system-ui, sans-serif" font-size="28" font-weight="700" fill="url(#primaryGrad)" filter="url(#glowShadow)">
    <animateTransform attributeName="transform" type="translate" values="0,-2;0,2;0,-2" dur="3s" repeatCount="indefinite"/>
    SVG
  </text>
  
  <!-- Subtitle: Code -->
  <text x="100" y="90" text-anchor="middle" font-family="'Inter', 'SF Pro Display', system-ui, sans-serif" font-size="16" font-weight="500" fill="url(#accentGrad)" opacity="0.8">
    <animateTransform attributeName="transform" type="translate" values="0,1;0,-1;0,1" dur="2.5s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
    Code
  </text>
  
  <!-- Arrow/Connector -->
  <g>
    <animateTransform attributeName="transform" type="translate" values="-5,0;5,0;-5,0" dur="2s" repeatCount="indefinite"/>
    <path d="M85 105 L115 105 M110 100 L115 105 L110 110" stroke="url(#accentGrad)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.6">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite"/>
    </path>
  </g>
  
  <!-- Target: PNG -->
  <text x="100" y="140" text-anchor="middle" font-family="'Inter', 'SF Pro Display', system-ui, sans-serif" font-size="28" font-weight="700" fill="url(#primaryGrad)" filter="url(#glowShadow)">
    <animateTransform attributeName="transform" type="translate" values="0,2;0,-2;0,2" dur="3.2s" repeatCount="indefinite"/>
    PNG
  </text>
  
  <!-- Bottom accent -->
  <rect x="60" y="165" width="80" height="2" fill="url(#primaryGrad)" rx="1" opacity="0.3">
    <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/>
    <animateTransform attributeName="transform" type="scale" values="1,1;1.1,1;1,1" dur="3s" repeatCount="indefinite"/>
  </rect>
  
  <!-- Floating particles -->
  <circle cx="50" cy="50" r="2" fill="url(#primaryGrad)" opacity="0.4">
    <animateTransform attributeName="transform" type="translate" values="0,0;10,-10;0,0" dur="4s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="150" cy="170" r="1.5" fill="url(#primaryGrad)" opacity="0.3">
    <animateTransform attributeName="transform" type="translate" values="0,0;-8,8;0,0" dur="3.5s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.5s" repeatCount="indefinite"/>
  </circle>
</svg>`);
  const [isConverting, setIsConverting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'png',
    quality: 100,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    scale: 1
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showSettings, setShowSettings] = useState(false);

  const features = [
    {
      icon: Zap,
      title: t('features.aiAssistant.title'),
      description: t('features.aiAssistant.description')
    },
    {
      icon: Shield,
      title: t('features.templateLibrary.title'),
      description: t('features.templateLibrary.description')
    },
    {
      icon: Globe,
      title: t('features.exportOptions.title'),
      description: t('features.exportOptions.description')
    },
    {
      icon: Smartphone,
      title: t('features.responsiveDesign.title'),
      description: t('features.responsiveDesign.description')
    }
  ];

  // Convert SVG to image
  const convertToImage = useCallback(async () => {
    if (!svgCode.trim()) return;
    
    setIsConverting(true);
    
    try {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgCode, 'image/svg+xml');
      const svgElement = svgDoc.querySelector('svg');
      
      if (!svgElement) {
        throw new Error('Invalid SVG code');
      }

      const originalWidth = parseInt(svgElement.getAttribute('width') || '200');
      const originalHeight = parseInt(svgElement.getAttribute('height') || '200');
      
      const finalWidth = exportSettings.width || originalWidth * exportSettings.scale;
      const finalHeight = exportSettings.height || originalHeight * exportSettings.scale;
      
      const svgBlob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = finalWidth;
        canvas.height = finalHeight;
        
        // Set background
        if (exportSettings.backgroundColor !== 'transparent') {
          ctx.fillStyle = exportSettings.backgroundColor;
          ctx.fillRect(0, 0, finalWidth, finalHeight);
        }
        
        ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
        
        if (exportSettings.format === 'gif') {
          // For GIF, we'll create a simple static image
          // In a real implementation, you'd handle animation frames
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setPreviewUrl(url);
            }
            setIsConverting(false);
          }, 'image/png', exportSettings.quality / 100);
        } else {
          const mimeType = exportSettings.format === 'jpg' ? 'image/jpeg' : 'image/png';
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setPreviewUrl(url);
            }
            setIsConverting(false);
          }, mimeType, exportSettings.quality / 100);
        }
        
        URL.revokeObjectURL(url);
      };
      
      img.onerror = () => {
        setIsConverting(false);
        alert('Error loading SVG');
      };
      
      img.src = url;
    } catch (error) {
      setIsConverting(false);
      alert('Error converting SVG: ' + (error as Error).message);
    }
  }, [svgCode, exportSettings]);

  const downloadImage = () => {
    if (!previewUrl) return;
    
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `converted-image.${exportSettings.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(svgCode);
  };

  const clearCode = () => {
    setSvgCode('');
    setPreviewUrl(null);
  };

  const resetCode = () => {
    setSvgCode(`<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="80" fill="#3b82f6" />
  <text x="100" y="110" text-anchor="middle" fill="white" font-size="20" font-family="Arial">SVG</text>
</svg>`);
    setPreviewUrl(null);
  };

  const downloadGIF = async () => {
    if (!previewUrl) return;
    
    try {
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: exportSettings.width || 200,
        height: exportSettings.height || 200
      });
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Add frame to GIF
      gif.addFrame(canvas, { delay: 200 });
      
      gif.on('finished', function(blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'converted-image.gif';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
      
      gif.render();
    } catch (error) {
      console.error('Error creating GIF:', error);
      alert('Error creating GIF');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              {t('hero.title')}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              {t('hero.subtitle')}
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              {t('hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => document.getElementById('converter')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center gap-2 justify-center"
              >
                <Code className="w-5 h-5" />
                {t('hero.primaryCta')}
              </button>
              <button className="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-8 py-4 rounded-lg font-semibold transition-colors flex items-center gap-2 justify-center">
                <Layers className="w-5 h-5" />
                {t('hero.secondaryCta')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Converter Section */}
      <section id="converter" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Code Editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    {t('converter.codeEditor')}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={copyCode}
                      className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                      title="Copy code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={clearCode}
                      className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                      title="Clear code"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={resetCode}
                      className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                      title="Reset to example"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <Editor
                    height="400px"
                    defaultLanguage="xml"
                    value={svgCode}
                    onChange={(value) => setSvgCode(value || '')}
                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      wordWrap: 'on',
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>

              {/* Preview and Export */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    {t('converter.preview')}
                  </h3>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    {t('converter.settings')}
                  </button>
                </div>

                {/* Export Settings */}
                {showSettings && (
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          {t('converter.format')}
                        </label>
                        <select
                          value={exportSettings.format}
                          onChange={(e) => setExportSettings(prev => ({ ...prev, format: e.target.value as 'png' | 'jpg' | 'gif' }))}
                          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          <option value="png">PNG</option>
                          <option value="jpg">JPG</option>
                          <option value="gif">GIF</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          {t('converter.quality')} (%)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={exportSettings.quality}
                          onChange={(e) => setExportSettings(prev => ({ ...prev, quality: parseInt(e.target.value) || 100 }))}
                          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          {t('converter.width')} (px)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={exportSettings.width}
                          onChange={(e) => setExportSettings(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                          placeholder="Auto"
                          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          {t('converter.height')} (px)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={exportSettings.height}
                          onChange={(e) => setExportSettings(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                          placeholder="Auto"
                          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SVG Preview */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-900 min-h-[300px] flex items-center justify-center">
                  {svgCode ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: svgCode }}
                      className="max-w-full max-h-full"
                    />
                  ) : (
                    <div className="text-center text-slate-500 dark:text-slate-400">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>SVG preview will appear here</p>
                    </div>
                  )}
                </div>

                {/* Convert Button */}
                <button
                  onClick={convertToImage}
                  disabled={!svgCode.trim() || isConverting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {isConverting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <ArrowDown className="w-4 h-4" />
                      {t('converter.export')}
                    </>
                  )}
                </button>

                {/* Download Section */}
                {previewUrl && (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {t('converter.conversionComplete')}
                      </h4>
                    </div>
                    <div className="mb-3">
                      <img 
                        src={previewUrl} 
                        alt="Converted image" 
                        className="max-w-full h-auto rounded border border-gray-300 dark:border-gray-600"
                        style={{ maxHeight: '200px' }}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        onClick={downloadImage}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm sm:text-base flex-1"
                      >
                        <Download className="w-4 h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">{t('converter.download')} </span>PNG
                      </button>
                      <button
                        onClick={() => {
                          const originalFormat = exportSettings.format;
                          setExportSettings(prev => ({ ...prev, format: 'jpg' }));
                          setTimeout(() => {
                            convertToImage().then(() => {
                              setTimeout(() => {
                                const link = document.createElement('a');
                                link.download = 'converted-image.jpg';
                                if (previewUrl) {
                                  const canvas = document.createElement('canvas');
                                  const ctx = canvas.getContext('2d');
                                  if (!ctx) {
                                    console.error('Unable to get canvas context');
                                    return;
                                  }
                                  const img = new Image();
                                  img.onload = () => {
                                    canvas.width = img.width;
                                    canvas.height = img.height;
                                    ctx.fillStyle = '#ffffff';
                                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                                    ctx.drawImage(img, 0, 0);
                                    link.href = canvas.toDataURL('image/jpeg', 0.9);
                                    link.click();
                                  };
                                  img.src = previewUrl;
                                }
                                setExportSettings(prev => ({ ...prev, format: originalFormat }));
                              }, 100);
                            });
                          }, 50);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm sm:text-base flex-1"
                      >
                        <Download className="w-4 h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">{t('converter.download')} </span>JPG
                      </button>
                      <button
                        onClick={downloadGIF}
                        disabled={isConverting}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm sm:text-base flex-1"
                      >
                        <Download className="w-4 h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">{isConverting ? t('converter.converting') : t('converter.download')} </span>GIF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-700 hover:shadow-lg transition-shadow duration-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section id="how-to" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('howTo.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('howTo.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full mb-6">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('howTo.step1.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('howTo.step1.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full mb-6">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('howTo.step2.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('howTo.step2.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full mb-6">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('howTo.step3.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('howTo.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('gallery.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('gallery.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { type: t('gallery.icons.title'), description: t('gallery.icons.description'), icon: Sparkles },
              { type: t('gallery.logos.title'), description: t('gallery.logos.description'), icon: Star },
              { type: t('gallery.graphics.title'), description: t('gallery.graphics.description'), icon: Palette },
              { type: t('gallery.illustrations.title'), description: t('gallery.illustrations.description'), icon: ImageIcon }
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                  <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg mb-4 flex items-center justify-center">
                    <IconComponent className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {item.type}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('testimonials.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('testimonials.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: t('testimonials.testimonial1.name'),
                role: t('testimonials.testimonial1.role'),
                content: t('testimonials.testimonial1.content')
              },
              {
                name: t('testimonials.testimonial2.name'),
                role: t('testimonials.testimonial2.role'),
                content: t('testimonials.testimonial2.content')
              },
              {
                name: t('testimonials.testimonial3.name'),
                role: t('testimonials.testimonial3.role'),
                content: t('testimonials.testimonial3.content')
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('faq.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('faq.subtitle')}
            </p>
          </div>
          <div className="space-y-4">
            {[
              {
                question: t('faq.question1.question'),
                answer: t('faq.question1.answer')
              },
              {
                question: t('faq.question2.question'),
                answer: t('faq.question2.answer')
              },
              {
                question: t('faq.question3.question'),
                answer: t('faq.question3.answer')
              },
              {
                question: t('faq.question4.question'),
                answer: t('faq.question4.answer')
              },
              {
                question: t('faq.question5.question'),
                answer: t('faq.question5.answer')
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {faq.question}
                  </h3>
                  {expandedFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 dark:text-gray-300">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#converter" 
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <Zap className="w-5 h-5 mr-2" />
              {t('cta.primaryButton')}
            </a>
            <a 
              href="#how-to" 
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              <Code className="w-5 h-5 mr-2" />
              {t('cta.secondaryButton')}
            </a>
          </div>
        </div>
      </section>

      {/* Hidden Canvas for Conversion */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <Footer />
    </div>
  );
}