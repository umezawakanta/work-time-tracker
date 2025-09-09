import { Link } from 'react-router-dom';
import { memo, ReactNode } from 'react';

/**
 * モバイル向けの汎用ヘッダー
 * - iOS安全領域対応
 * - 44pxのタップしやすい高さ
 * - 中央タイトルは1行省略
 * - 右側に最大3つまでのアクション
 * - sticky + 背景ブラー（CLS 0）
 */
type Props = {
  title: string;
  subtitle?: string;
  backTo?: string; // 指定時は←戻るを表示
  leftSlot?: ReactNode; // 戻るの代わりにアイコン等を置きたい場合
  rightActions?: ReactNode; // 右側アクション群（通知、プロフィール等）
  className?: string;
};

export const MobileHeader = memo(function MobileHeader({
  title,
  subtitle,
  backTo,
  leftSlot,
  rightActions,
  className = '',
}: Props) {
  return (
    <header
      className={
        'sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/70 ' +
        'bg-white/95 border-b border-gray-200/70 ' +
        'pt-[env(safe-area-inset-top)] ' +
        className
      }
      aria-label="ページヘッダー"
    >
      {/* メインバー */}
      <div className="h-11 flex items-center px-3 gap-2">
        {/* 左側：戻る or 任意スロット */}
        <div className="min-w-0">
          {leftSlot ? (
            leftSlot
          ) : backTo ? (
            <Link
              to={backTo}
              aria-label="戻る"
              className="inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 active:scale-[0.98] transition"
            >
              {/* 依存レスに矢印SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M15 18l-6-6 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          ) : (
            <span className="inline-block w-8" /> /* タイトル中央揃えのためのダミー */
          )}
        </div>

        {/* 中央：タイトル */}
        <div className="flex-1 min-w-0 text-center">
          <h1 className="text-[15px] font-semibold leading-none truncate">{title}</h1>
          {subtitle && (
            <p className="text-[11px] leading-none text-gray-500 mt-1 truncate">{subtitle}</p>
          )}
        </div>

        {/* 右側：アクション（最大3つ程度に） */}
        <div className="flex items-center gap-1">{rightActions}</div>
      </div>
    </header>
  );
});
