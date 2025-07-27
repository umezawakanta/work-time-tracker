import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  useCallback,
  useMemo,
  useEffect,
} from 'react';

export type Locale = 'ja' | 'en' | 'zh' | 'ko' | 'ar' | 'he' | 'fa' | 'ur';

export type Direction = 'ltr' | 'rtl';

interface LocaleContextType {
  locale: Locale;
  direction: Direction;
  setLocale: (locale: Locale) => void;
  getLanguageName: (locale?: Locale) => string;
  getAvailableLanguages: () => Array<{ code: Locale; name: string; direction: Direction }>;
  isValidLocale: (locale: any) => locale is Locale;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number, currency: string) => string;
  getBrowserLocale: () => Locale;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Export the context for direct usage in hooks
export { LocaleContext };

// Define supported locales and their properties
const SUPPORTED_LOCALES: Record<Locale, { name: string; direction: Direction }> = {
  ja: { name: '日本語', direction: 'ltr' },
  en: { name: 'English', direction: 'ltr' },
  zh: { name: '中文', direction: 'ltr' },
  ko: { name: '한국어', direction: 'ltr' },
  ar: { name: 'العربية', direction: 'rtl' },
  he: { name: 'עברית', direction: 'rtl' },
  fa: { name: 'فارسی', direction: 'rtl' },
  ur: { name: 'اردو', direction: 'rtl' },
};

const RTL_LOCALES: Set<Locale> = new Set(['ar', 'he', 'fa', 'ur']);

const DEFAULT_LOCALE: Locale = 'ja';

function isValidLocale(value: any): value is Locale {
  return typeof value === 'string' && value in SUPPORTED_LOCALES;
}

function getBrowserLocaleStandalone(): Locale {
  try {
    const language = navigator.language || navigator.languages?.[0] || '';
    const baseLanguage = language.split('-')[0].toLowerCase();

    const languageMap: Record<string, Locale> = {
      ja: 'ja',
      en: 'en',
      zh: 'zh',
      ko: 'ko',
      ar: 'ar',
      he: 'he',
      fa: 'fa',
      ur: 'ur',
    };

    return languageMap[baseLanguage] || DEFAULT_LOCALE;
  } catch (error) {
    return DEFAULT_LOCALE;
  }
}

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize locale from localStorage or browser preference
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem('locale');
      if (saved && isValidLocale(saved)) {
        return saved;
      }

      // Try to detect from browser using the standalone function
      const browserLocale = getBrowserLocaleStandalone();
      return browserLocale;
    } catch (error) {
      console.warn('Failed to load locale from storage:', error);
      return DEFAULT_LOCALE;
    }
  });

  // Calculate direction based on locale
  const direction = useMemo((): Direction => {
    return RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
  }, [locale]);

  // Set locale and persist to localStorage
  const setLocale = useCallback(
    (newLocale: Locale) => {
      if (!isValidLocale(newLocale)) {
        console.warn('Invalid locale:', newLocale);
        return;
      }

      if (newLocale === locale) {
        return; // No change
      }

      setLocaleState(newLocale);

      try {
        localStorage.setItem('locale', newLocale);
      } catch (error) {
        console.warn('Failed to save locale to storage:', error);
      }
    },
    [locale]
  );

  // Get language name for current or specified locale
  const getLanguageName = useCallback(
    (targetLocale?: Locale): string => {
      const localeToUse = targetLocale || locale;
      return SUPPORTED_LOCALES[localeToUse]?.name || '';
    },
    [locale]
  );

  // Get all available languages
  const getAvailableLanguages = useCallback(() => {
    return Object.entries(SUPPORTED_LOCALES).map(([code, { name, direction }]) => ({
      code: code as Locale,
      name,
      direction,
    }));
  }, []);

  // Check if a value is a valid locale
  const isValidLocale = useCallback((value: any): value is Locale => {
    return typeof value === 'string' && value in SUPPORTED_LOCALES;
  }, []);

  // Format date according to locale
  const formatDate = useCallback(
    (date: Date): string => {
      try {
        const localeMap: Record<Locale, string> = {
          ja: 'ja-JP',
          en: 'en-US',
          zh: 'zh-CN',
          ko: 'ko-KR',
          ar: 'ar-SA',
          he: 'he-IL',
          fa: 'fa-IR',
          ur: 'ur-PK',
        };

        return new Intl.DateTimeFormat(localeMap[locale], {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(date);
      } catch (error) {
        // Fallback to simple format
        return date.toLocaleDateString();
      }
    },
    [locale]
  );

  // Format time according to locale
  const formatTime = useCallback(
    (date: Date): string => {
      try {
        const localeMap: Record<Locale, string> = {
          ja: 'ja-JP',
          en: 'en-US',
          zh: 'zh-CN',
          ko: 'ko-KR',
          ar: 'ar-SA',
          he: 'he-IL',
          fa: 'fa-IR',
          ur: 'ur-PK',
        };

        return new Intl.DateTimeFormat(localeMap[locale], {
          hour: '2-digit',
          minute: '2-digit',
        }).format(date);
      } catch (error) {
        // Fallback to simple format
        return date.toLocaleTimeString();
      }
    },
    [locale]
  );

  // Format number according to locale
  const formatNumber = useCallback(
    (num: number): string => {
      try {
        const localeMap: Record<Locale, string> = {
          ja: 'ja-JP',
          en: 'en-US',
          zh: 'zh-CN',
          ko: 'ko-KR',
          ar: 'ar-SA',
          he: 'he-IL',
          fa: 'fa-IR',
          ur: 'ur-PK',
        };

        return new Intl.NumberFormat(localeMap[locale]).format(num);
      } catch (error) {
        // Fallback to simple format
        return num.toLocaleString();
      }
    },
    [locale]
  );

  // Format currency according to locale
  const formatCurrency = useCallback(
    (amount: number, currency: string): string => {
      try {
        const localeMap: Record<Locale, string> = {
          ja: 'ja-JP',
          en: 'en-US',
          zh: 'zh-CN',
          ko: 'ko-KR',
          ar: 'ar-SA',
          he: 'he-IL',
          fa: 'fa-IR',
          ur: 'ur-PK',
        };

        return new Intl.NumberFormat(localeMap[locale], {
          style: 'currency',
          currency: currency,
        }).format(amount);
      } catch (error) {
        // Fallback to simple format
        return `${currency} ${amount.toFixed(2)}`;
      }
    },
    [locale]
  );

  // Get browser's preferred locale
  const getBrowserLocale = useCallback((): Locale => {
    try {
      const language = navigator.language || navigator.languages?.[0] || '';
      const baseLanguage = language.split('-')[0].toLowerCase();

      // Map browser language codes to our supported locales
      const languageMap: Record<string, Locale> = {
        ja: 'ja',
        en: 'en',
        zh: 'zh',
        ko: 'ko',
        ar: 'ar',
        he: 'he',
        fa: 'fa',
        ur: 'ur',
      };

      return languageMap[baseLanguage] || DEFAULT_LOCALE;
    } catch (error) {
      return DEFAULT_LOCALE;
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      locale,
      direction,
      setLocale,
      getLanguageName,
      getAvailableLanguages,
      isValidLocale,
      formatDate,
      formatTime,
      formatNumber,
      formatCurrency,
      getBrowserLocale,
    }),
    [
      locale,
      direction,
      setLocale,
      getLanguageName,
      getAvailableLanguages,
      isValidLocale,
      formatDate,
      formatTime,
      formatNumber,
      formatCurrency,
      getBrowserLocale,
    ]
  );

  return <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>;
};

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
