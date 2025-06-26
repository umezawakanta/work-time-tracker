import React from 'react';
import { Loader2, RefreshCw, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  threshold?: number;
  disabled?: boolean;
  refreshText?: string;
  releaseText?: string;
  loadingText?: string;
}

/**
 * 📱 モバイルファースト: プルツーリフレッシュコンポーネント
 * iOS/AndroidライクなプルツーリフレッシュUIを提供
 */
export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  className,
  threshold = 80,
  disabled = false,
  refreshText = 'プルして更新',
  releaseText = '離して更新',
  loadingText = '更新中...',
}) => {
  const { containerRef, state, indicatorStyle, containerStyle } = usePullToRefresh({
    onRefresh,
    threshold,
    disabled,
    refreshText,
    releaseText,
    loadingText,
  });

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className={cn('relative overflow-hidden', className)}
    >
      {/* プルツーリフレッシュインジケーター */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-background/80 backdrop-blur-sm border-b z-50"
        style={indicatorStyle}
      >
        <div className="flex items-center gap-2 py-4 text-muted-foreground">
          {state.isRefreshing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">{state.refreshText}</span>
            </>
          ) : state.canRelease ? (
            <>
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm font-medium">{state.refreshText}</span>
            </>
          ) : (
            <>
              <ArrowDown
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  state.isPulling && 'animate-bounce'
                )}
              />
              <span className="text-sm font-medium">{state.refreshText}</span>
            </>
          )}
        </div>

        {/* プルプログレス表示 */}
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-200"
          style={{
            width: `${Math.min((state.pullDistance / threshold) * 100, 100)}%`,
          }}
        />
      </div>

      {/* メインコンテンツ */}
      <div style={containerStyle}>{children}</div>
    </div>
  );
};

// 📱 軽量版：シンプルなプルツーリフレッシュインジケーター
export const SimplePullToRefresh: React.FC<{
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}> = ({ isRefreshing, onRefresh, children }) => {
  const handleRefreshClick = async () => {
    if (!isRefreshing) {
      await onRefresh();
    }
  };

  return (
    <div className="relative">
      {/* 手動リフレッシュボタン（フォールバック） */}
      <button
        onClick={handleRefreshClick}
        disabled={isRefreshing}
        className={cn(
          'fixed bottom-4 right-4 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform',
          'hover:scale-110 active:scale-95',
          'sm:hidden', // デスクトップでは非表示
          isRefreshing && 'animate-pulse'
        )}
        aria-label="更新"
      >
        {isRefreshing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <RefreshCw className="h-5 w-5" />
        )}
      </button>

      {children}
    </div>
  );
};
