'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Globe, ChevronDown } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const getCurrentLanguage = () => {
    const langCode = pathname.split('/')[1];
    const validLanguages = ['en', 'ko', 'ja', 'ru', 'es', 'fr', 'de', 'zh', 'pt', 'it', 'id', 'ar'];
    return validLanguages.includes(langCode) ? langCode : 'en';
  };

  const currentLanguage = getCurrentLanguage();

  const switchLanguage = (newLang: string) => {
    setIsOpen(false);
    trackEvent('switch_language', { to_lang: newLang });
    try {
      const targetUrl = `/${newLang}`;
      window.location.href = targetUrl;
    } catch (error) {
      console.error('Language switch failed:', error);
      router.push(`/${newLang}`);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Switch language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{languages.find(lang => lang.code === currentLanguage)?.flag}</span>
        <span className="hidden md:inline">{languages.find(lang => lang.code === currentLanguage)?.name}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                lang.code === currentLanguage
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-2 text-lg">{lang.flag}</span>
              <span className="flex-1 text-left">{lang.name}</span>
              {lang.code === currentLanguage && (
                <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}