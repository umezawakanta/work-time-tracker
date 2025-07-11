import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { LocaleProvider, useLocale } from '../LocaleContext';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('LocaleContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <LocaleProvider>{children}</LocaleProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {});
  });

  describe('初期化', () => {
    it('デフォルトのロケールで初期化される', () => {
      // Mock browser language to ensure consistent default
      const originalNavigator = global.navigator;
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'ja-JP',
          languages: ['ja-JP', 'ja'],
        },
        writable: true,
      });

      const { result } = renderHook(() => useLocale(), { wrapper });

      expect(result.current.locale).toBe('ja');
      expect(result.current.direction).toBe('ltr');

      // Restore navigator
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
      });
    });

    it('LocalStorageからロケールを復元する', () => {
      // Clear previous mock and setup new one
      jest.clearAllMocks();
      mockLocalStorage.getItem.mockReturnValue('en');

      // Mock navigator to avoid browser language detection override
      const originalNavigator = global.navigator;
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'en-US',
          languages: ['en-US', 'en'],
        },
        writable: true,
      });

      // Create new wrapper instance to trigger re-initialization
      const customWrapper = ({ children }: { children: ReactNode }) => (
        <LocaleProvider>{children}</LocaleProvider>
      );

      const { result } = renderHook(() => useLocale(), { wrapper: customWrapper });

      expect(result.current.locale).toBe('en');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('locale');

      // Restore navigator
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
      });
    });

    it('無効なロケールの場合はデフォルトを使用する', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-locale');

      const { result } = renderHook(() => useLocale(), { wrapper });

      expect(result.current.locale).toBe('ja');
    });

    it('LocalStorageエラー時はデフォルトロケールを使用する', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useLocale(), { wrapper });

      expect(result.current.locale).toBe('ja');
    });
  });

  describe('ロケール変更', () => {
    it('日本語に変更できる', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });

      act(() => {
        result.current.setLocale('ja');
      });

      expect(result.current.locale).toBe('ja');
      expect(result.current.direction).toBe('ltr');
      // setLocale shouldn't be called if locale is already 'ja'
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it('英語に変更できる', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });

      act(() => {
        result.current.setLocale('en');
      });

      expect(result.current.locale).toBe('en');
      expect(result.current.direction).toBe('ltr');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('locale', 'en');
    });

    it('中国語に変更できる', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });

      act(() => {
        result.current.setLocale('zh');
      });

      expect(result.current.locale).toBe('zh');
      expect(result.current.direction).toBe('ltr');
    });

    it('韓国語に変更できる', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });

      act(() => {
        result.current.setLocale('ko');
      });

      expect(result.current.locale).toBe('ko');
      expect(result.current.direction).toBe('ltr');
    });

    it('アラビア語（RTL）に変更できる', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });

      act(() => {
        result.current.setLocale('ar');
      });

      expect(result.current.locale).toBe('ar');
      expect(result.current.direction).toBe('rtl');
    });

    it('ヘブライ語（RTL）に変更できる', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });

      act(() => {
        result.current.setLocale('he');
      });

      expect(result.current.locale).toBe('he');
      expect(result.current.direction).toBe('rtl');
    });

    it('無効なロケールは無視される', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });

      const initialLocale = result.current.locale;

      act(() => {
        result.current.setLocale('invalid-locale' as any);
      });

      expect(result.current.locale).toBe(initialLocale);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith('locale', 'invalid-locale');
    });

    it('同じロケールを設定しても再保存しない', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });

      act(() => {
        result.current.setLocale('ja');
      });

      jest.clearAllMocks();

      act(() => {
        result.current.setLocale('ja');
      });

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('テキスト方向の判定', () => {
    const testCases = [
      { locale: 'ja', direction: 'ltr', description: '日本語はLTR' },
      { locale: 'en', direction: 'ltr', description: '英語はLTR' },
      { locale: 'zh', direction: 'ltr', description: '中国語はLTR' },
      { locale: 'ko', direction: 'ltr', description: '韓国語はLTR' },
      { locale: 'ar', direction: 'rtl', description: 'アラビア語はRTL' },
      { locale: 'he', direction: 'rtl', description: 'ヘブライ語はRTL' },
      { locale: 'fa', direction: 'rtl', description: 'ペルシア語はRTL' },
      { locale: 'ur', direction: 'rtl', description: 'ウルドゥー語はRTL' },
    ] as const;

    testCases.forEach(({ locale, direction, description }) => {
      it(description, () => {
        const { result } = renderHook(() => useLocale(), { wrapper });

        act(() => {
          result.current.setLocale(locale);
        });

        expect(result.current.direction).toBe(direction);
      });
    });
  });

  describe('言語名取得', () => {
    it('各ロケールの表示名を取得できる', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });

      const testCases = [
        { locale: 'ja', name: '日本語' },
        { locale: 'en', name: 'English' },
        { locale: 'zh', name: '中文' },
        { locale: 'ko', name: '한국어' },
        { locale: 'ar', name: 'العربية' },
        { locale: 'he', name: 'עברית' },
      ] as const;

      testCases.forEach(({ locale, name }) => {
        act(() => {
          result.current.setLocale(locale);
        });

        expect(result.current.getLanguageName()).toBe(name);
      });
    });

    it('特定のロケールの表示名を取得できる', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });

      expect(result.current.getLanguageName('ja')).toBe('日本語');
      expect(result.current.getLanguageName('en')).toBe('English');
      expect(result.current.getLanguageName('zh')).toBe('中文');
      expect(result.current.getLanguageName('ko')).toBe('한국어');
      expect(result.current.getLanguageName('ar')).toBe('العربية');
      expect(result.current.getLanguageName('he')).toBe('עברית');
    });

    it('無効なロケールは空文字を返す', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });

      expect(result.current.getLanguageName('invalid' as any)).toBe('');
    });
  });

  describe('利用可能言語リスト', () => {
    it('サポートされている全言語を取得できる', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });

      const languages = result.current.getAvailableLanguages();

      expect(languages).toHaveLength(8);
      expect(languages).toContainEqual({ code: 'ja', name: '日本語', direction: 'ltr' });
      expect(languages).toContainEqual({ code: 'en', name: 'English', direction: 'ltr' });
      expect(languages).toContainEqual({ code: 'zh', name: '中文', direction: 'ltr' });
      expect(languages).toContainEqual({ code: 'ko', name: '한국어', direction: 'ltr' });
      expect(languages).toContainEqual({ code: 'ar', name: 'العربية', direction: 'rtl' });
      expect(languages).toContainEqual({ code: 'he', name: 'עברית', direction: 'rtl' });
      expect(languages).toContainEqual({ code: 'fa', name: 'فارسی', direction: 'rtl' });
      expect(languages).toContainEqual({ code: 'ur', name: 'اردو', direction: 'rtl' });
    });

    it('言語リストは安定している', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });

      const languages1 = result.current.getAvailableLanguages();
      const languages2 = result.current.getAvailableLanguages();

      expect(languages1).toEqual(languages2);
    });
  });

  describe('ロケール検証', () => {
    it('有効なロケールを正しく検証する', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });

      const validLocales = ['ja', 'en', 'zh', 'ko', 'ar', 'he'];

      validLocales.forEach((locale) => {
        expect(result.current.isValidLocale(locale as any)).toBe(true);
      });
    });

    it('無効なロケールを正しく検証する', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });

      const invalidLocales = ['invalid', 'xx', '', null, undefined];

      invalidLocales.forEach((locale) => {
        expect(result.current.isValidLocale(locale as any)).toBe(false);
      });
    });
  });

  describe('日付・時間フォーマット', () => {
    it('ロケールに応じた日付フォーマットを取得できる', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });
      const testDate = new Date('2024-01-15T10:30:00Z');

      act(() => {
        result.current.setLocale('ja');
      });

      const jaFormat = result.current.formatDate(testDate);
      expect(jaFormat).toContain('2024');
      expect(jaFormat).toContain('1');
      expect(jaFormat).toContain('15');

      act(() => {
        result.current.setLocale('en');
      });

      const enFormat = result.current.formatDate(testDate);
      expect(enFormat).toContain('2024');
      expect(enFormat).toContain('1');
      expect(enFormat).toContain('15');
    });

    it('ロケールに応じた時間フォーマットを取得できる', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });
      const testDate = new Date('2024-01-15T10:30:00Z');

      act(() => {
        result.current.setLocale('ja');
      });

      const jaFormat = result.current.formatTime(testDate);
      expect(jaFormat).toContain('30'); // minutes should be consistent regardless of timezone

      act(() => {
        result.current.setLocale('en');
      });

      const enFormat = result.current.formatTime(testDate);
      expect(enFormat).toContain('30'); // minutes should be consistent regardless of timezone
    });
  });

  describe('数値フォーマット', () => {
    it('ロケールに応じた数値フォーマットを取得できる', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });

      act(() => {
        result.current.setLocale('ja');
      });

      expect(result.current.formatNumber(1234.56)).toBe('1,234.56');

      act(() => {
        result.current.setLocale('en');
      });

      expect(result.current.formatNumber(1234.56)).toBe('1,234.56');
    });

    it('通貨フォーマットを取得できる', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });

      act(() => {
        result.current.setLocale('ja');
      });

      const jpyCurrency = result.current.formatCurrency(1234, 'JPY');
      expect(jpyCurrency).toContain('1,234');
      expect(jpyCurrency).toMatch(/[¥￥]/); // Allow both yen symbols

      act(() => {
        result.current.setLocale('en');
      });

      const usdCurrency = result.current.formatCurrency(1234.56, 'USD');
      expect(usdCurrency).toContain('1,234.56');
      expect(usdCurrency).toContain('$');
    });
  });

  describe('Context外使用エラー', () => {
    it('Provider外でhookを使用するとエラーになる', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useLocale());
      }).toThrow('useLocale must be used within a LocaleProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('パフォーマンス最適化', () => {
    it('同じロケールでは再レンダリングされない', () => {
      let renderCount = 0;

      const TestComponent = () => {
        renderCount++;
        useLocale();
        return null;
      };

      const { rerender } = renderHook(() => <TestComponent />, { wrapper });

      const initialCount = renderCount;
      rerender();

      expect(renderCount).toBe(initialCount);
    });

    it('関数インスタンスが安定している', () => {
      const { result, rerender } = renderHook(() => useLocale(), { wrapper });

      const initialSetLocale = result.current.setLocale;
      const initialGetLanguageName = result.current.getLanguageName;
      const initialFormatDate = result.current.formatDate;

      rerender();

      expect(result.current.setLocale).toBe(initialSetLocale);
      expect(result.current.getLanguageName).toBe(initialGetLanguageName);
      expect(result.current.formatDate).toBe(initialFormatDate);
    });
  });

  describe('LocalStorageエラーハンドリング', () => {
    it('LocalStorage書き込みエラー時もアプリケーションが続行する', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useLocale(), { wrapper });

      expect(() => {
        act(() => {
          result.current.setLocale('en');
        });
      }).not.toThrow();

      expect(result.current.locale).toBe('en');
    });

    it('LocalStorage読み込みエラー時はデフォルト値を使用する', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useLocale(), { wrapper });

      expect(result.current.locale).toBe('ja');
    });
  });

  describe('ブラウザ言語設定の検出', () => {
    const originalNavigator = global.navigator;

    afterEach(() => {
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
      });
    });

    it('ブラウザの言語設定を検出する', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'en-US',
          languages: ['en-US', 'en'],
        },
        writable: true,
      });

      const { result } = renderHook(() => useLocale(), { wrapper });

      expect(result.current.getBrowserLocale()).toBe('en');
    });

    it('サポートされていないブラウザ言語の場合はデフォルトを返す', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'fr-FR',
          languages: ['fr-FR', 'fr'],
        },
        writable: true,
      });

      const { result } = renderHook(() => useLocale(), { wrapper });

      expect(result.current.getBrowserLocale()).toBe('ja');
    });

    it('ブラウザ言語設定に基づいて初期ロケールを設定する', () => {
      // Clear all previous mocks
      jest.clearAllMocks();

      // Mock navigator before creating the wrapper to affect initialization
      const originalNavigator = global.navigator;
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'en-US',
          languages: ['en-US', 'en'],
        },
        writable: true,
      });

      // LocalStorageに保存された設定がない場合
      mockLocalStorage.getItem.mockReturnValue(null);

      // Need to create a new wrapper to trigger initialization with the new navigator
      const customWrapper = ({ children }: { children: ReactNode }) => (
        <LocaleProvider>{children}</LocaleProvider>
      );

      const { result } = renderHook(() => useLocale(), { wrapper: customWrapper });

      expect(result.current.locale).toBe('en');

      // Restore original navigator
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
      });
    });
  });
});
