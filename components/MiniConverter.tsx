'use client';

import { useState, useRef } from 'react';
import { ArrowDown, Download, Image as ImageIcon } from 'lucide-react';

const MiniConverter = () => {
  const [svgCode, setSvgCode] = useState(`<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" stroke="#3B82F6" stroke-width="3" fill="#EFF6FF" />
  <text x="50" y="55" text-anchor="middle" font-family="Arial" font-size="14" fill="#1E40AF">SVG</text>
</svg>`);
  const [isConverting, setIsConverting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const convertToPNG = async () => {
    if (!svgCode.trim()) return;
    
    setIsConverting(true);
    
    try {
      // Create a blob from SVG code
      const svgBlob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      // Create an image element
      const img = new Image();
      
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Set canvas size
        canvas.width = img.width || 200;
        canvas.height = img.height || 200;
        
        // Clear canvas and draw image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        URL.revokeObjectURL(url);
        setIsConverting(false);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setIsConverting(false);
      };
      
      img.src = url;
    } catch (error) {
      console.error('Conversion error:', error);
      setIsConverting(false);
    }
  };

  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'converted-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* SVG Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          SVG Code
        </label>
        <textarea
          value={svgCode}
          onChange={(e) => setSvgCode(e.target.value)}
          className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono resize-none"
          placeholder="Paste your SVG code here..."
        />
      </div>

      {/* Convert Button */}
      <button
        onClick={convertToPNG}
        disabled={!svgCode.trim() || isConverting}
        className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
      >
        {isConverting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Converting...
          </>
        ) : (
          <>
            <ArrowDown className="w-4 h-4 mr-2" />
            Convert to PNG
          </>
        )}
      </button>

      {/* Preview and Download */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Preview
          </span>
          <button
            onClick={downloadPNG}
            className="inline-flex items-center px-3 py-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-md hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
          >
            <Download className="w-3 h-3 mr-1" />
            Download PNG
          </button>
        </div>
        
        <div className="relative bg-gray-50 dark:bg-gray-900 rounded-lg p-4 min-h-[120px] flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-32 border border-gray-200 dark:border-gray-700 rounded"
            style={{ display: 'block' }}
          />
          
          {!canvasRef.current?.width && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-400 dark:text-gray-500">
                <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Preview will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-500 dark:text-gray-400">
        <div>
          <div className="font-semibold text-blue-600 dark:text-blue-400">Instant</div>
          <div>Conversion</div>
        </div>
        <div>
          <div className="font-semibold text-emerald-600 dark:text-emerald-400">High Quality</div>
          <div>Output</div>
        </div>
        <div>
          <div className="font-semibold text-amber-600 dark:text-amber-400">Free</div>
          <div>Forever</div>
        </div>
      </div>
    </div>
  );
};

export default MiniConverter;