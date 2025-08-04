'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { 
  Menu, 
  X, 
  Sun, 
  Moon,
  Monitor,
  ChevronDown,
  Globe
} from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  // Prevent hydration mismatch by only rendering theme-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Language options
  const languageOptions = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  const themeOptions = [
    { name: 'Light', value: 'light', icon: Sun },
    { name: 'Dark', value: 'dark', icon: Moon },
    { name: 'System', value: 'system', icon: Monitor },
  ];

  const getCurrentThemeIcon = () => {
    if (!mounted) return Monitor; // Default icon during SSR
    switch (theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      default: return Monitor;
    }
  };

  const ThemeIcon = getCurrentThemeIcon();

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/logo.svg" 
                  alt="SVGCodeToPNG Logo" 
                  className="w-8 h-8"
                />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                SVGCodeToPNG
              </span>
            </Link>
          </div>

          {/* No desktop navigation needed */}

          {/* Language and Theme Switchers */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center"
              >
                <Globe className="w-5 h-5" />
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>
              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  {languageOptions.map((option) => (
                    <button
                      key={option.code}
                      onClick={() => {
                        setCurrentLanguage(option.code);
                        setShowLanguageMenu(false);
                      }}
                      className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        currentLanguage === option.code
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="mr-3">{option.flag}</span>
                      {option.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Theme Switcher */}
            {mounted && (
              <div className="relative">
                <button
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center"
                >
                  <ThemeIcon className="w-5 h-5" />
                  <ChevronDown className="w-3 h-3 ml-1" />
                </button>
                {showThemeMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    {themeOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            setTheme(option.value);
                            setShowThemeMenu(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <IconComponent className="w-4 h-4 mr-3" />
                          {option.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">

            
            {/* Mobile Language Controls */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="px-3 py-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Language</span>
                <div className="mt-2 space-y-1">
                  {languageOptions.map((option) => (
                    <button
                      key={option.code}
                      onClick={() => {
                        setCurrentLanguage(option.code);
                        setIsOpen(false);
                      }}
                      className={`flex items-center w-full px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${
                        currentLanguage === option.code
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="mr-2">{option.flag}</span>
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Mobile Theme Controls */}
            {mounted && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="px-3 py-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Theme</span>
                  <div className="mt-2 space-y-1">
                    {themeOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            setTheme(option.value);
                            setIsOpen(false);
                          }}
                          className="flex items-center w-full px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        >
                          <IconComponent className="w-4 h-4 mr-2" />
                          {option.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;