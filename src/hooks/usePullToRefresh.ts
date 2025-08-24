import { useEffect, useRef, useState, useCallback } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
  refreshText?: string;
  releaseText?: string;
  loadingText?: string;
  disabled?: boolean;
}

interface PullToRefreshState {
  isPulling: boolean;
  canRelease: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  refreshText: string;
}

/**
 * 📱 モバイルファースト: プルツーリフレッシュ機能
 * スワイプダウンでコンテンツを更新できるモバイル最適化フック
 */
export const usePullToRefresh = (options: PullToRefreshOptions) => {
  const {
    onRefresh,
    threshold = 80,
    resistance = 2.5,
    refreshText = 'プルして更新',
    releaseText = '離して更新',
    loadingText = '更新中...',
    disabled = false,
  } = options;

  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    canRelease: false,
    isRefreshing: false,
    pullDistance: 0,
    refreshText,
  });

  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);
  const containerRef = useRef<HTMLElement | null>(null);

  // ハプティックフィードバック（対応デバイスのみ）
  const triggerHapticFeedback = useCallback((type: 'impact' | 'selection' = 'impact') => {
    if ('vibrate' in navigator) {
      // 軽い振動でフィードバック
      navigator.vibrate(type === 'impact' ? [10] : [5]);
    }
  }, []);

  // プルツーリフレッシュの開始
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || state.isRefreshing) return;

      const scrollTop = containerRef.current?.scrollTop || window.scrollY;
      if (scrollTop > 0) return; // スクロール位置が上端でない場合は無効

      touchStartY.current = e.touches[0].clientY;
      touchCurrentY.current = touchStartY.current;
    },
    [disabled, state.isRefreshing]
  );

  // プルの処理
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || state.isRefreshing || touchStartY.current === 0) return;

      const scrollTop = containerRef.current?.scrollTop || window.scrollY;
      if (scrollTop > 0) return;

      touchCurrentY.current = e.touches[0].clientY;
      const touchDiff = touchCurrentY.current - touchStartY.current;

      if (touchDiff > 0) {
        // 抵抗を適用した距離を計算
        const pullDistance = Math.pow(touchDiff, 0.8) / resistance;
        const canRelease = pullDistance >= threshold;

        // ハプティックフィードバック（閾値到達時）
        if (canRelease && !state.canRelease) {
          triggerHapticFeedback('selection');
        }

        setState((prev) => ({
          ...prev,
          isPulling: true,
          canRelease,
          pullDistance,
          refreshText: canRelease ? releaseText : refreshText,
        }));

        // スクロールを無効化
        if (pullDistance > 10) {
          e.preventDefault();
        }
      }
    },
    [
      disabled,
      state.isRefreshing,
      state.canRelease,
      threshold,
      resistance,
      refreshText,
      releaseText,
      triggerHapticFeedback,
    ]
  );

  // プルの終了
  const handleTouchEnd = useCallback(async () => {
    if (disabled || state.isRefreshing || !state.isPulling) return;

    if (state.canRelease && onRefresh) {
      // リフレッシュ実行
      setState((prev) => ({
        ...prev,
        isRefreshing: true,
        refreshText: loadingText,
      }));

      triggerHapticFeedback('impact');

      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull to refresh failed:', error);
      } finally {
        // アニメーション用の遅延
        setTimeout(() => {
          setState({
            isPulling: false,
            canRelease: false,
            isRefreshing: false,
            pullDistance: 0,
            refreshText,
          });
        }, 300);
      }
    } else {
      // リフレッシュしない場合はリセット
      setState({
        isPulling: false,
        canRelease: false,
        isRefreshing: false,
        pullDistance: 0,
        refreshText,
      });
    }

    touchStartY.current = 0;
    touchCurrentY.current = 0;
  }, [
    disabled,
    state.isRefreshing,
    state.isPulling,
    state.canRelease,
    onRefresh,
    loadingText,
    refreshText,
    triggerHapticFeedback,
  ]);

  // イベントリスナーの設定
  useEffect(() => {
    const container = containerRef.current || document.body;

    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    state,
    // インジケーター用のスタイル
    indicatorStyle: {
      transform: `translateY(${state.pullDistance}px)`,
      opacity: state.isPulling ? Math.min(state.pullDistance / threshold, 1) : 0,
      transition: state.isPulling ? 'none' : 'all 0.3s ease-out',
    },
    // コンテナ用のスタイル
    containerStyle: {
      transform: `translateY(${state.pullDistance}px)`,
      transition: state.isPulling ? 'none' : 'transform 0.3s ease-out',
    },
  };
};
