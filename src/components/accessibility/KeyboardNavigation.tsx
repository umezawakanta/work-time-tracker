import React, { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface KeyboardNavigationProps {
  children: React.ReactNode;
  className?: string;
  skipToMainId?: string;
}

interface FocusableElement {
  element: HTMLElement;
  tabIndex: number;
  description?: string;
}

/**
 * ♿ アクセシビリティチャンピオン: キーボードナビゲーション機能
 * すべての機能をキーボードのみで操作可能にする
 */
export const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({
  children,
  className,
  skipToMainId = 'main-content',
}) => {
  const [focusableElements, setFocusableElements] = useState<FocusableElement[]>([]);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(-1);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const [announcements, setAnnouncements] = useState<string[]>([]);

  // 🔍 フォーカス可能な要素を取得
  const updateFocusableElements = useCallback(() => {
    const focusableSelectors = [
      'a[href]',
      'button',
      'input',
      'textarea',
      'select',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="tab"]',
      '[role="option"]',
    ].join(', ');

    const elements = Array.from(document.querySelectorAll(focusableSelectors)) as HTMLElement[];

    const validElements = elements
      .filter((el) => {
        // 非表示要素や無効要素を除外
        const isDisabled = (el as any).disabled || el.getAttribute('disabled') !== null;
        return (
          !el.hidden && !isDisabled && el.offsetParent !== null && !el.getAttribute('aria-hidden')
        );
      })
      .map((el, index) => ({
        element: el,
        tabIndex: el.tabIndex || 0,
        description:
          el.getAttribute('aria-label') ||
          el.getAttribute('title') ||
          el.textContent?.trim() ||
          `Element ${index + 1}`,
      }));

    setFocusableElements(validElements);
  }, []);

  // 📢 スクリーンリーダー向けアナウンス
  const announce = useCallback((message: string) => {
    setAnnouncements((prev) => [...prev.slice(-4), message]);

    // ARIA live regionに通知
    const liveRegion = document.getElementById('keyboard-nav-announcements');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }, []);

  // ⌨️ キーボードイベントハンドラー
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { key, altKey, ctrlKey, shiftKey, metaKey } = event;

      // キーボードモード検出
      if (key === 'Tab') {
        setIsKeyboardMode(true);
      }

      // ショートカットキー
      if (altKey && key === 'j') {
        // Alt+J: メインコンテンツにスキップ
        event.preventDefault();
        const mainContent = document.getElementById(skipToMainId);
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
          announce('メインコンテンツにジャンプしました');
        }
        return;
      }

      if (altKey && key === 'h') {
        // Alt+H: ヘルプ情報を表示
        event.preventDefault();
        announce(
          'キーボードショートカット: Alt+J=メインコンテンツ, Alt+N=ナビゲーション, Alt+S=検索, F6=セクション移動'
        );
        return;
      }

      if (altKey && key === 'n') {
        // Alt+N: ナビゲーションにフォーカス
        event.preventDefault();
        const nav = document.querySelector('nav') || document.querySelector('[role="navigation"]');
        if (nav) {
          (nav as HTMLElement).focus();
          announce('ナビゲーションエリアにフォーカス');
        }
        return;
      }

      if (altKey && key === 's') {
        // Alt+S: 検索フィールドにフォーカス
        event.preventDefault();
        const searchInput =
          document.querySelector('input[type="search"]') ||
          document.querySelector('[role="searchbox"]');
        if (searchInput) {
          (searchInput as HTMLElement).focus();
          announce('検索フィールドにフォーカス');
        }
        return;
      }

      if (key === 'F6') {
        // F6: セクション間移動
        event.preventDefault();
        const sections = Array.from(document.querySelectorAll('main, nav, aside, [role="region"]'));
        const currentSection = document.activeElement?.closest('main, nav, aside, [role="region"]');
        const currentIndex = sections.indexOf(currentSection as Element);
        const nextIndex = (currentIndex + 1) % sections.length;

        if (sections[nextIndex]) {
          (sections[nextIndex] as HTMLElement).focus();
          const sectionName =
            sections[nextIndex].getAttribute('aria-label') ||
            sections[nextIndex].tagName.toLowerCase();
          announce(`${sectionName}セクションに移動`);
        }
        return;
      }

      // ESCキー: フォーカストラップから脱出
      if (key === 'Escape') {
        const modal = document.querySelector('[role="dialog"]');
        if (modal && modal.contains(document.activeElement)) {
          event.preventDefault();
          const closeButton =
            modal.querySelector('[aria-label*="閉じる"], [aria-label*="close"]') ||
            modal.querySelector('button[type="button"]');
          if (closeButton) {
            (closeButton as HTMLElement).click();
            announce('モーダルを閉じました');
          }
        }
      }
    },
    [announce, skipToMainId]
  );

  // 🖱️ マウス使用検出
  const handleMouseDown = useCallback(() => {
    setIsKeyboardMode(false);
  }, []);

  // 🎯 フォーカス管理
  const handleFocusIn = useCallback(
    (event: FocusEvent) => {
      if (!isKeyboardMode) return;

      const target = event.target as HTMLElement;
      const index = focusableElements.findIndex((item) => item.element === target);

      if (index !== -1) {
        setCurrentFocusIndex(index);

        // フォーカス状況をアナウンス
        const element = focusableElements[index];
        const position = `${index + 1} / ${focusableElements.length}`;
        announce(`${element.description} (${position})`);

        // フォーカスリングを表示
        target.style.outline = '3px solid #4F46E5';
        target.style.outlineOffset = '2px';
      }
    },
    [focusableElements, isKeyboardMode, announce]
  );

  const handleFocusOut = useCallback((event: FocusEvent) => {
    const target = event.target as HTMLElement;
    target.style.outline = '';
    target.style.outlineOffset = '';
  }, []);

  // 🔄 初期化とクリーンアップ
  useEffect(() => {
    updateFocusableElements();

    // MutationObserver でDOM変更を監視
    const observer = new MutationObserver(updateFocusableElements);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'hidden', 'aria-hidden', 'tabindex'],
    });

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [handleKeyDown, handleMouseDown, handleFocusIn, handleFocusOut, updateFocusableElements]);

  return (
    <div className={cn('relative', className)}>
      {/* スキップリンク */}
      <a
        href={`#${skipToMainId}`}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                   bg-blue-600 text-white px-4 py-2 rounded-md z-50 
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => announce('メインコンテンツにスキップ')}
      >
        メインコンテンツにスキップ
      </a>

      {/* キーボードナビゲーション情報パネル */}
      {isKeyboardMode && (
        <div
          className="fixed top-4 right-4 bg-gray-900 text-white p-3 rounded-md shadow-lg z-40 
                     max-w-sm text-sm"
          role="status"
          aria-live="polite"
        >
          <div className="font-semibold mb-2">⌨️ キーボードモード</div>
          <div className="space-y-1 text-xs">
            <div>Alt+J: メインコンテンツ</div>
            <div>Alt+N: ナビゲーション</div>
            <div>Alt+S: 検索</div>
            <div>F6: セクション移動</div>
            <div>Alt+H: ヘルプ</div>
          </div>
          {currentFocusIndex !== -1 && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="text-xs text-gray-300">
                現在: {currentFocusIndex + 1} / {focusableElements.length}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ARIA Live Region (スクリーンリーダー用) */}
      <div
        id="keyboard-nav-announcements"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* メインコンテンツ */}
      <main id={skipToMainId} tabIndex={-1}>
        {children}
      </main>

      {/* フォーカス可能要素の数をアナウンス */}
      <div role="status" aria-live="polite" className="sr-only">
        {focusableElements.length > 0 &&
          `ページに${focusableElements.length}個の操作可能な要素があります`}
      </div>
    </div>
  );
};

export default KeyboardNavigation;
