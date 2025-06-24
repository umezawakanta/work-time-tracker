import React from 'react';
import { useAccessibilityContext } from './AccessibilityProvider';
import { cn } from '@/lib/utils';

interface SkipLinksProps {
  className?: string;
}

export const SkipLinks: React.FC<SkipLinksProps> = ({ className }) => {
  const { skipToContent, announceToScreenReader } = useAccessibilityContext();

  const handleSkipToMain = () => {
    skipToContent();
  };

  const handleSkipToNav = () => {
    const nav = document.querySelector('nav') || document.querySelector('[role="navigation"]');
    if (nav) {
      (nav as HTMLElement).focus();
      announceToScreenReader('ナビゲーションに移動しました');
    }
  };

  const handleSkipToSearch = () => {
    const search =
      document.querySelector('input[type="search"]') || document.querySelector('[role="search"]');
    if (search) {
      (search as HTMLElement).focus();
      announceToScreenReader('検索フィールドに移動しました');
    }
  };

  const handleSkipToFooter = () => {
    const footer =
      document.querySelector('footer') || document.querySelector('[role="contentinfo"]');
    if (footer) {
      (footer as HTMLElement).focus();
      announceToScreenReader('フッターに移動しました');
    }
  };

  return (
    <div
      className={cn(
        'sr-only focus-within:not-sr-only fixed top-4 left-4 z-[9999] flex flex-col gap-2',
        className
      )}
      role="banner"
      aria-label="スキップリンク"
    >
      <button
        onClick={handleSkipToMain}
        className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-blue-700 transition-colors font-medium"
        onFocus={() => announceToScreenReader('スキップリンクが有効になりました')}
      >
        メインコンテンツへスキップ
      </button>

      <button
        onClick={handleSkipToNav}
        className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-blue-700 transition-colors font-medium"
      >
        ナビゲーションへスキップ
      </button>

      <button
        onClick={handleSkipToSearch}
        className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-blue-700 transition-colors font-medium"
      >
        検索へスキップ
      </button>

      <button
        onClick={handleSkipToFooter}
        className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-blue-700 transition-colors font-medium"
      >
        フッターへスキップ
      </button>
    </div>
  );
};
