'use client';

import Link from 'next/link';
import { 
  Heart,
  Globe,
  Mail,
  MessageCircle
} from 'lucide-react';

const Footer = () => {
  // 安全的外部链接处理函数
  const handleExternalLink = (url: string) => {
    try {
      // 检查URL是否有效
      new URL(url);
      // 安全地打开外部链接
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.warn('Invalid URL:', url);
      // 可以显示用户友好的错误消息
      alert('链接暂时无法访问，请稍后再试');
    }
  };

  // 安全的邮件链接处理函数
  const handleMailto = (email: string) => {
    try {
      const mailtoUrl = `mailto:${email}`;
      window.location.href = mailtoUrl;
    } catch (error) {
      console.warn('Failed to open email client:', error);
      // 复制邮箱地址到剪贴板作为备选方案
      if (navigator.clipboard) {
        navigator.clipboard.writeText(email).then(() => {
          alert('邮箱地址已复制到剪贴板');
        }).catch(() => {
          alert('请手动复制邮箱地址: ' + email);
        });
      } else {
        alert('请手动复制邮箱地址: ' + email);
      }
    }
  };

  const footerLinks = {
    product: [
      { name: 'Home', href: '/' },
    ],
    relatedProducts: [
      { name: 'SVGtoPNG.app', href: 'https://svgtopng.app', external: true },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#', disabled: true },
      { name: 'Terms of Service', href: '#', disabled: true },
    ]
  };



  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">SVGCodeToPNG</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-sm">
                Convert SVG code to high-quality PNG images with our free online tool. Fast, reliable, and easy to use.
              </p>
              
              {/* Contact Us */}
              <div className="mb-6">
                <button
                  onClick={() => handleMailto('0992sunshine@gmail.com')}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-medium"
                >
                  <Mail className="w-5 h-5" />
                  <span>Contact Us</span>
                </button>
              </div>
            </div>
            
            {/* Navigation Links */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Navigation
              </h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Legal Links */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <span className="text-gray-500 cursor-not-allowed">
                      {link.name}
                    </span>
                  </li>
                ))}
                {footerLinks.relatedProducts.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => handleExternalLink(link.href)}
                      className="text-gray-400 hover:text-white transition-colors flex items-center cursor-pointer"
                    >
                      {link.name}
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>© 2025 SVGCodeToPNG. All rights reserved.</span>
              <span className="hidden md:inline">•</span>
              <div className="flex items-center space-x-1">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span>for developers</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 text-gray-400">
                <Globe className="w-4 h-4" />
                <span>Available worldwide</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-400">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;