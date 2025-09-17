'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  // 获取当前语言
  const getCurrentLanguage = () => {
    const path = pathname;
    if (path.startsWith('/ko')) {
      return 'ko';
    } else if (path.startsWith('/en')) {
      return 'en';
    }
    return 'en'; // 默认英语
  };
  
  const currentLocale = getCurrentLanguage();
  // Show the target language (the one user can switch to)
  const targetLanguage = languages.find(lang => lang.code !== currentLocale) || languages[0];

  // 切换语言
  const switchLanguage = (newLang: string) => {
    try {
      // 现在所有语言都使用前缀
      const targetUrl = `/${newLang}`;
      
      // 使用 window.location.href 强制页面刷新
      window.location.href = targetUrl;
    } catch (error) {
      console.error('Language switch failed:', error);
      // Fallback: 使用 router.push
      router.push(`/${newLang}`);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => switchLanguage(targetLanguage.code)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Switch language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{targetLanguage.flag}</span>
        <span className="hidden md:inline">{targetLanguage.name}</span>
      </button>


    </div>
  );
}