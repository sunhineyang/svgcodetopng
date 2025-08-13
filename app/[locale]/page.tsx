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
  Upload,
  CheckCircle,
  Star,
  Users,
  Clock,
  Palette,
  Monitor,
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

export default function HomePage() {
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
</svg>`)
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
      title: 'Lightning Fast',
      description: 'Convert SVG to PNG instantly with our optimized conversion engine'
    },
    {
      icon: Shield,
      title: '100% Secure',
      description: 'All conversions happen in your browser. Your files never leave your device'
    },
    {
      icon: Globe,
      title: 'No Registration',
      description: 'Start converting immediately without creating an account'
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Works perfectly on desktop, tablet, and mobile devices'
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
        
        if (exportSettings.backgroundColor !== 'transparent') {
          ctx.fillStyle = exportSettings.backgroundColor;
          ctx.fillRect(0, 0, finalWidth, finalHeight);
        }
        
        ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
        
        const dataUrl = canvas.toDataURL(`image/${exportSettings.format}`, exportSettings.quality / 100);
        setPreviewUrl(dataUrl);
        
        URL.revokeObjectURL(url);
        setIsConverting(false);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setIsConverting(false);
        alert('Error: Invalid SVG code or unable to render');
      };
      
      img.src = url;
    } catch (error) {
      console.error('Conversion error:', error);
      setIsConverting(false);
      alert('Error: Failed to convert SVG');
    }
  }, [svgCode, exportSettings]);

  const downloadImage = () => {
    if (!previewUrl) return;
    
    const link = document.createElement('a');
    link.download = `converted-image.${exportSettings.format}`;
    link.href = previewUrl;
    link.click();
  };

  // 真正的GIF导出功能
  const downloadGIF = useCallback(async () => {
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
      
      // 检查SVG是否包含动画
      const hasAnimation = svgCode.includes('<animate') || svgCode.includes('<animateTransform') || svgCode.includes('<animateMotion');
      
      if (hasAnimation) {
        // 创建动画GIF
        const gif = new GIF({
          workers: 2,
          quality: 10,
          width: finalWidth,
          height: finalHeight,
          workerScript: '/gif.worker.js'
        });
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Unable to get canvas context');
        }
        canvas.width = finalWidth;
        canvas.height = finalHeight;
        
        // 创建多帧动画（简化版本，捕获30帧，每帧100ms）
        const frameCount = 30;
        const frameDuration = 100;
        
        for (let i = 0; i < frameCount; i++) {
          // 清除画布
          ctx.clearRect(0, 0, finalWidth, finalHeight);
          
          if (exportSettings.backgroundColor !== 'transparent') {
            ctx.fillStyle = exportSettings.backgroundColor;
            ctx.fillRect(0, 0, finalWidth, finalHeight);
          }
          
          // 创建SVG图像
          const svgBlob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);
          
          await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
              gif.addFrame(canvas, { delay: frameDuration });
              URL.revokeObjectURL(url);
              resolve(null);
            };
            img.src = url;
          });
          
          // 等待一小段时间让动画进行
          await new Promise(resolve => setTimeout(resolve, frameDuration));
        }
        
        gif.on('finished', function(blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = 'converted-animation.gif';
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          setIsConverting(false);
        });
        
        gif.render();
      } else {
        // 创建静态GIF（单帧）
        const gif = new GIF({
          workers: 2,
          quality: 10,
          width: finalWidth,
          height: finalHeight,
          workerScript: '/gif.worker.js'
        });
        
        const svgBlob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setIsConverting(false);
            alert('Error: Unable to get canvas context');
            return;
          }
          canvas.width = finalWidth;
          canvas.height = finalHeight;
          
          if (exportSettings.backgroundColor !== 'transparent') {
            ctx.fillStyle = exportSettings.backgroundColor;
            ctx.fillRect(0, 0, finalWidth, finalHeight);
          }
          
          ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
          
          gif.addFrame(canvas, { delay: 1000 });
          
          gif.on('finished', function(blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'converted-image.gif';
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            setIsConverting(false);
          });
          
          gif.render();
          URL.revokeObjectURL(url);
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(url);
          setIsConverting(false);
          alert('Error: Invalid SVG code or unable to render');
        };
        
        img.src = url;
      }
    } catch (error) {
      console.error('GIF conversion error:', error);
      setIsConverting(false);
      alert('Error: Failed to convert SVG to GIF');
    }
  }, [svgCode, exportSettings]);

  const loadTemplate = (template: string) => {
    const templates = {
      circle: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
    <filter id="circleShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.15"/>
    </filter>
    <filter id="circleGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#667eea" flood-opacity="0.4"/>
    </filter>
  </defs>
  <rect width="200" height="200" fill="#f8fafc" rx="16"/>
  <circle cx="100" cy="100" r="70" fill="url(#circleGrad)" filter="url(#circleShadow)"/>
  <circle cx="100" cy="100" r="70" fill="none" stroke="url(#circleGrad)" stroke-width="2" filter="url(#circleGlow)" opacity="0.6"/>
  <text x="100" y="108" text-anchor="middle" font-family="'Inter', system-ui, sans-serif" font-size="18" font-weight="600" fill="white">Circle</text>
</svg>`,
      rectangle: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" />
    </linearGradient>
    <filter id="cardShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#000000" flood-opacity="0.1"/>
    </filter>
  </defs>
  <rect width="200" height="200" fill="#f1f5f9" rx="16"/>
  <rect x="20" y="30" width="160" height="120" rx="16" fill="url(#cardGrad)" filter="url(#cardShadow)"/>
  <rect x="30" y="40" width="140" height="4" rx="2" fill="white" opacity="0.3"/>
  <rect x="30" y="50" width="100" height="3" rx="1.5" fill="white" opacity="0.2"/>
  <text x="100" y="100" text-anchor="middle" font-family="'Inter', system-ui, sans-serif" font-size="18" font-weight="600" fill="white">Card</text>
  <circle cx="150" cy="60" r="8" fill="white" opacity="0.2"/>
</svg>`,
      star: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffecd2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fcb69f;stop-opacity:1" />
    </linearGradient>
    <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="15" flood-color="#fcb69f" flood-opacity="0.6"/>
    </filter>
    <filter id="starShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="200" height="200" fill="#1e293b" rx="16"/>
  <polygon points="100,25 115,65 155,65 125,95 140,135 100,115 60,135 75,95 45,65 85,65" fill="url(#starGrad)" filter="url(#starShadow)"/>
  <polygon points="100,25 115,65 155,65 125,95 140,135 100,115 60,135 75,95 45,65 85,65" fill="none" stroke="url(#starGrad)" stroke-width="2" filter="url(#starGlow)" opacity="0.8"/>
  <text x="100" y="175" text-anchor="middle" font-family="'Inter', system-ui, sans-serif" font-size="16" font-weight="600" fill="#94a3b8">Star</text>
</svg>`,
      gradient: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="modernGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="25%" style="stop-color:#764ba2;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#f093fb;stop-opacity:1" />
      <stop offset="75%" style="stop-color:#f5576c;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4facfe;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="modernGrad2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#ff9a9e;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#fecfef;stop-opacity:0.4" />
    </radialGradient>
    <filter id="gradShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="12" stdDeviation="24" flood-color="#000000" flood-opacity="0.15"/>
    </filter>
  </defs>
  <rect width="200" height="200" fill="url(#modernGrad1)" rx="20" filter="url(#gradShadow)"/>
  <rect width="200" height="200" fill="url(#modernGrad2)" rx="20"/>
  <text x="100" y="110" text-anchor="middle" font-family="'Inter', system-ui, sans-serif" font-size="20" font-weight="700" fill="white" opacity="0.9">Gradient</text>
  <circle cx="50" cy="50" r="20" fill="white" opacity="0.1"/>
  <circle cx="150" cy="150" r="30" fill="white" opacity="0.08"/>
</svg>`,
      logo: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="logoAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" />
    </linearGradient>
    <filter id="logoShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.2"/>
    </filter>
  </defs>
  <rect width="200" height="200" fill="#0f172a" rx="24"/>
  <rect x="20" y="20" width="160" height="160" fill="url(#logoGrad)" rx="20" filter="url(#logoShadow)"/>
  <circle cx="100" cy="80" r="25" fill="white" opacity="0.95"/>
  <rect x="75" y="110" width="50" height="30" fill="url(#logoAccent)" rx="8"/>
  <text x="100" y="165" text-anchor="middle" font-family="'Inter', system-ui, sans-serif" font-size="14" font-weight="700" fill="white" opacity="0.9">BRAND</text>
  <circle cx="60" cy="60" r="4" fill="white" opacity="0.3"/>
  <circle cx="140" cy="140" r="6" fill="white" opacity="0.2"/>
</svg>`,
      icon: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ee5a24;stop-opacity:1" />
    </linearGradient>
    <filter id="iconShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000000" flood-opacity="0.15"/>
    </filter>
  </defs>
  <rect width="200" height="200" fill="#f8fafc" rx="32"/>
  <rect x="40" y="40" width="120" height="120" fill="url(#iconGrad)" rx="24" filter="url(#iconShadow)"/>
  <path d="M80 100 L100 80 L120 100 L100 120 Z" fill="white" opacity="0.9"/>
  <circle cx="100" cy="100" r="8" fill="white"/>
  <rect x="70" y="130" width="60" height="3" rx="1.5" fill="white" opacity="0.6"/>
  <rect x="80" y="140" width="40" height="2" rx="1" fill="white" opacity="0.4"/>
</svg>`
    };
    setSvgCode(templates[template as keyof typeof templates] || templates.circle);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
      
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                {t('hero.title')}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  {t('hero.subtitle')}
                </span>
              </h1>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">{t('hero.features.free')}</span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">{t('hero.features.instant')}</span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">{t('hero.features.highQuality')}</span>
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium">{t('hero.features.noRegistration')}</span>
              </div>
              
              {/* AI Era Introduction */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8 max-w-4xl mx-auto">
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  <strong>🤖 {t('hero.welcome.title')}</strong> {t('hero.welcome.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Converter Section */}
        <section id="converter" className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


            {/* Quick Start Templates */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                {t('converter.quickTemplates.title')}
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {['circle', 'rectangle', 'star', 'gradient', 'logo', 'icon'].map((template) => (
                  <button
                    key={template}
                    onClick={() => loadTemplate(template)}
                    className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200 capitalize"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>

            {/* Converter Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* SVG Code Editor */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <Code className="w-5 h-5 mr-2" />
                    {t('converter.editor.title')}
                  </h3>
                  <button
                    onClick={() => setSvgCode(`<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
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
</svg>`)}
                    className="p-2 text-gray-500 hover:text-blue-500 transition-colors duration-200"
                    title="Reset to default"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t('converter.editor.description')}
                </p>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <Editor
                    height="400px"
                    defaultLanguage="xml"
                    value={svgCode}
                    onChange={(value) => setSvgCode(value || '')}
                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 14,
                      lineNumbers: 'on',
                      wordWrap: 'on'
                    }}
                  />
                </div>

                {/* Export Settings */}
                <div className="mt-6">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {t('converter.exportSettings.title')}
                    {showSettings ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                  </button>
                  
                  {showSettings && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('converter.exportSettings.format')}
                          </label>
                          <select
                            value={exportSettings.format}
                            onChange={(e) => setExportSettings(prev => ({ ...prev, format: e.target.value as 'png' | 'jpg' | 'gif' }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="png">PNG</option>
                            <option value="jpg">JPG</option>
                            <option value="gif">GIF</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('converter.exportSettings.quality')} ({exportSettings.quality}%)
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={exportSettings.quality}
                            onChange={(e) => setExportSettings(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('converter.exportSettings.scale')} ({exportSettings.scale}x)
                          </label>
                          <input
                            type="range"
                            min="0.5"
                            max="5"
                            step="0.5"
                            value={exportSettings.scale}
                            onChange={(e) => setExportSettings(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('converter.exportSettings.width')}
                          </label>
                          <input
                            type="number"
                            value={exportSettings.width || ''}
                            onChange={(e) => setExportSettings(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                            placeholder="Auto"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('converter.exportSettings.height')}
                          </label>
                          <input
                            type="number"
                            value={exportSettings.height || ''}
                            onChange={(e) => setExportSettings(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                            placeholder="Auto"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('converter.exportSettings.backgroundColor')}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={exportSettings.backgroundColor === 'transparent' ? '#ffffff' : exportSettings.backgroundColor}
                            onChange={(e) => setExportSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                            className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                          />
                          <button
                            onClick={() => setExportSettings(prev => ({ ...prev, backgroundColor: 'transparent' }))}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                              exportSettings.backgroundColor === 'transparent'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                            }`}
                          >
                            {t('converter.exportSettings.transparent')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Preview Panel */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Monitor className="w-5 h-5 mr-2" />
                  {t('converter.preview.title')}
                </h3>
                
                {/* SVG Preview */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4 min-h-[200px] flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                  {svgCode ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: svgCode }}
                      className="max-w-full max-h-full"
                    />
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{t('converter.preview.placeholder')}</p>
                    </div>
                  )}
                </div>

                {/* Convert Button */}
                <button
                  onClick={convertToImage}
                  disabled={!svgCode.trim() || isConverting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
                >
                  {isConverting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t('converter.converting')}
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      {t('converter.convertButton')} {exportSettings.format.toUpperCase()}
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
                        <span className="hidden sm:inline">Download </span>JPG
                      </button>
                      <button
                        onClick={downloadGIF}
                        disabled={isConverting}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm sm:text-base flex-1"
                      >
                        <Download className="w-4 h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">{isConverting ? 'Converting...' : 'Download '}</span>GIF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>



        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose Our SVG Code to PNG Converter?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Experience the fastest and most reliable svg code to png conversion with advanced features and professional quality output
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
                {t('howTo.description')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full mb-6">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('howTo.steps.step1.title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('howTo.steps.step1.description')}
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full mb-6">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('howTo.steps.step2.title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('howTo.steps.step2.description')}
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full mb-6">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('howTo.steps.step3.title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('howTo.steps.step3.description')}
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
                {t('gallery.description')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { type: t('gallery.items.icons.title'), description: t('gallery.items.icons.description'), icon: Sparkles },
                { type: t('gallery.items.logos.title'), description: t('gallery.items.logos.description'), icon: Star },
                { type: t('gallery.items.graphics.title'), description: t('gallery.items.graphics.description'), icon: Palette },
                { type: t('gallery.items.illustrations.title'), description: t('gallery.items.illustrations.description'), icon: ImageIcon }
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
                  name: t('testimonials.items.sarah.name'),
                  role: t('testimonials.items.sarah.role'),
                  content: t('testimonials.items.sarah.content')
                },
                {
                  name: t('testimonials.items.mike.name'),
                  role: t('testimonials.items.mike.role'),
                  content: t('testimonials.items.mike.content')
                },
                {
                  name: t('testimonials.items.emily.name'),
                  role: t('testimonials.items.emily.role'),
                  content: t('testimonials.items.emily.content')
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
                  question: t('faq.items.free.question'),
                  answer: t('faq.items.free.answer')
                },
                {
                  question: t('faq.items.secure.question'),
                  answer: t('faq.items.secure.answer')
                },
                {
                  question: t('faq.items.formats.question'),
                  answer: t('faq.items.formats.answer')
                },
                {
                  question: t('faq.items.large.question'),
                  answer: t('faq.items.large.answer')
                },
                {
                  question: t('faq.items.install.question'),
                  answer: t('faq.items.install.answer')
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
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#converter" 
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <Zap className="w-5 h-5 mr-2" />
                {t('cta.startButton')}
              </a>
              <a 
                href="#how-to" 
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                <Code className="w-5 h-5 mr-2" />
                {t('cta.learnButton')}
              </a>
            </div>
          </div>
        </section>

        {/* Hidden Canvas for Conversion */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        <Footer />
      </div>
    </>
  );
}