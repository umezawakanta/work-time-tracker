import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAccessibility } from '@/hooks/useAccessibility';

interface AccessibilityContextType {
  // 表示設定
  isHighContrast: boolean;
  isReducedMotion: boolean;
  fontSize: number;

  // フォーカス管理
  focusVisible: boolean;
  setFocusVisible: (visible: boolean) => void;

  // 操作性
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;

  // スクリーンリーダー
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;

  // キーボードナビゲーション
  skipToContent: () => void;
  focusNextTabbable: () => void;
  focusPreviousTabbable: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibilityContext = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityContext must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const {
    isHighContrast: baseHighContrast,
    isReducedMotion: baseReducedMotion,
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    announceToScreenReader: baseAnnounce,
  } = useAccessibility();

  const [isHighContrast, setIsHighContrast] = useState(baseHighContrast);
  const [isReducedMotion, setIsReducedMotion] = useState(baseReducedMotion);
  const [focusVisible, setFocusVisible] = useState(false);

  // 高コントラストモードの切り替え
  const toggleHighContrast = useCallback(() => {
    const newValue = !isHighContrast;
    setIsHighContrast(newValue);
    document.documentElement.classList.toggle('high-contrast', newValue);

    // ローカルストレージに保存
    localStorage.setItem('accessibility-high-contrast', newValue.toString());

    baseAnnounce(
      newValue ? '高コントラストモードが有効になりました' : '高コントラストモードが無効になりました'
    );
  }, [isHighContrast, baseAnnounce]);

  // モーション削減の切り替え
  const toggleReducedMotion = useCallback(() => {
    const newValue = !isReducedMotion;
    setIsReducedMotion(newValue);
    document.documentElement.classList.toggle('reduce-motion', newValue);

    localStorage.setItem('accessibility-reduced-motion', newValue.toString());

    baseAnnounce(
      newValue
        ? 'アニメーション削減モードが有効になりました'
        : 'アニメーション削減モードが無効になりました'
    );
  }, [isReducedMotion, baseAnnounce]);

  // 拡張スクリーンリーダー通知
  const announceToScreenReader = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', priority);
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;

      document.body.appendChild(announcement);
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    },
    []
  );

  // メインコンテンツにスキップ
  const skipToContent = useCallback(() => {
    const mainContent = document.querySelector('main') || document.querySelector('#main-content');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      announceToScreenReader('メインコンテンツに移動しました');
    }
  }, [announceToScreenReader]);

  // 次のタブ可能要素にフォーカス
  const focusNextTabbable = useCallback(() => {
    const tabbableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const currentIndex = Array.from(tabbableElements).indexOf(document.activeElement as Element);
    const nextElement = tabbableElements[currentIndex + 1] as HTMLElement;

    if (nextElement) {
      nextElement.focus();
    } else if (tabbableElements.length > 0) {
      (tabbableElements[0] as HTMLElement).focus();
    }
  }, []);

  // 前のタブ可能要素にフォーカス
  const focusPreviousTabbable = useCallback(() => {
    const tabbableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const currentIndex = Array.from(tabbableElements).indexOf(document.activeElement as Element);
    const previousElement = tabbableElements[currentIndex - 1] as HTMLElement;

    if (previousElement) {
      previousElement.focus();
    } else if (tabbableElements.length > 0) {
      (tabbableElements[tabbableElements.length - 1] as HTMLElement).focus();
    }
  }, []);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + S: メインコンテンツにスキップ
      if (event.altKey && event.key === 's') {
        event.preventDefault();
        skipToContent();
      }

      // Alt + H: 高コントラストモード切り替え
      if (event.altKey && event.key === 'h') {
        event.preventDefault();
        toggleHighContrast();
      }

      // Alt + M: アニメーション削減切り替え
      if (event.altKey && event.key === 'm') {
        event.preventDefault();
        toggleReducedMotion();
      }

      // Alt + ↑: フォントサイズ拡大
      if (event.altKey && event.key === 'ArrowUp') {
        event.preventDefault();
        increaseFontSize();
        announceToScreenReader(`フォントサイズを拡大しました: ${fontSize + 2}px`);
      }

      // Alt + ↓: フォントサイズ縮小
      if (event.altKey && event.key === 'ArrowDown') {
        event.preventDefault();
        decreaseFontSize();
        announceToScreenReader(`フォントサイズを縮小しました: ${fontSize - 2}px`);
      }

      // Alt + 0: フォントサイズリセット
      if (event.altKey && event.key === '0') {
        event.preventDefault();
        resetFontSize();
        announceToScreenReader('フォントサイズをリセットしました: 16px');
      }

      // フォーカス表示制御
      if (event.key === 'Tab') {
        setFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setFocusVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [
    skipToContent,
    toggleHighContrast,
    toggleReducedMotion,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    fontSize,
    announceToScreenReader,
  ]);

  // 初期設定の読み込み
  useEffect(() => {
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast') === 'true';
    const savedReducedMotion = localStorage.getItem('accessibility-reduced-motion') === 'true';

    setIsHighContrast(savedHighContrast);
    setIsReducedMotion(savedReducedMotion);

    document.documentElement.classList.toggle('high-contrast', savedHighContrast);
    document.documentElement.classList.toggle('reduce-motion', savedReducedMotion);
  }, []);

  const value: AccessibilityContextType = {
    isHighContrast,
    isReducedMotion,
    fontSize,
    focusVisible,
    setFocusVisible,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    announceToScreenReader,
    skipToContent,
    focusNextTabbable,
    focusPreviousTabbable,
  };

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
};
