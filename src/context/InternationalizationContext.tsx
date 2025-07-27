import React, { createContext, useContext, ReactNode } from 'react';

type SupportedLocale = 'ja' | 'en' | 'zh' | 'ko';

interface LocaleConfig {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  timeFormat: string;
  currency: string;
  numberFormat: {
    decimal: string;
    thousands: string;
  };
}

interface InternationalizationContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string) => string;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
  formatNumber: (number: number) => string;
  formatCurrency: (amount: number) => string;
  getLocaleConfig: () => LocaleConfig;
  isRTL: boolean;
}

const InternationalizationContext = createContext<InternationalizationContextType | undefined>(
  undefined
);

export const InternationalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 基本的な日本語設定をデフォルトとして提供
  const defaultLocaleConfig: LocaleConfig = {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    direction: 'ltr',
    dateFormat: 'YYYY年MM月DD日',
    timeFormat: 'HH:mm',
    currency: 'JPY',
    numberFormat: {
      decimal: '.',
      thousands: ',',
    },
  };

  const value: InternationalizationContextType = {
    locale: 'ja',
    setLocale: (locale: SupportedLocale) => {
      console.log('setLocale called with:', locale);
      // TODO: 実装予定
    },
    t: (key: string) => {
      // 簡易翻訳（キーをそのまま返す）
      return key;
    },
    formatDate: (date: Date) => {
      return date.toLocaleDateString('ja-JP');
    },
    formatTime: (date: Date) => {
      return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    },
    formatNumber: (number: number) => {
      return number.toLocaleString('ja-JP');
    },
    formatCurrency: (amount: number) => {
      return `¥${amount.toLocaleString('ja-JP')}`;
    },
    getLocaleConfig: () => defaultLocaleConfig,
    isRTL: false,
  };

  return (
    <InternationalizationContext.Provider value={value}>
      {children}
    </InternationalizationContext.Provider>
  );
};

export const useInternationalization = () => {
  const context = useContext(InternationalizationContext);
  if (context === undefined) {
    throw new Error('useInternationalization must be used within an InternationalizationProvider');
  }
  return context;
};
