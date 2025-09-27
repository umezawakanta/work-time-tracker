/**
 * モバイル最適化レイアウトコンポーネント
 * Phase 5: モバイル対応 - スマートフォンでの最適化
 */

import React, { useState, useEffect, useCallback } from 'react';
import './MobileOptimizedLayout.css';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  isPlaying: boolean;
  onToggleFullscreen: () => void;
  onToggleOrientation: () => void;
  currentView: 'input' | 'score' | 'visualizer' | 'settings';
  onViewChange: (view: 'input' | 'score' | 'visualizer' | 'settings') => void;
}

const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  children,
  isPlaying,
  onToggleFullscreen,
  onToggleOrientation,
  currentView,
  onViewChange
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'up' | 'down' | null>(null);

  // デバイス検出
  useEffect(() => {
    const checkDevice = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // 画面向き検出
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // フルスクリーン検出
  useEffect(() => {
    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', checkFullscreen);
    return () => document.removeEventListener('fullscreenchange', checkFullscreen);
  }, []);

  // タッチジェスチャー処理
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setSwipeDirection(null);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartY) return;

    const currentY = e.touches[0].clientY;
    const diffY = touchStartY - currentY;

    if (Math.abs(diffY) > 50) {
      setSwipeDirection(diffY > 0 ? 'up' : 'down');
    }
  }, [touchStartY]);

  const handleTouchEnd = useCallback(() => {
    if (swipeDirection === 'up' && currentView !== 'visualizer') {
      onViewChange('visualizer');
    } else if (swipeDirection === 'down' && currentView !== 'input') {
      onViewChange('input');
    }
    
    setTouchStartY(0);
    setSwipeDirection(null);
  }, [swipeDirection, currentView, onViewChange]);

  // フルスクリーン切り替え
  const handleFullscreenToggle = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
      onToggleFullscreen();
    } catch (error) {
      console.warn('Fullscreen toggle failed:', error);
    }
  }, [onToggleFullscreen]);

  // 画面向き切り替え（モバイルデバイスの場合）
  const handleOrientationToggle = useCallback(() => {
    if (screen.orientation && screen.orientation.lock) {
      const newOrientation = isLandscape ? 'portrait' : 'landscape';
      screen.orientation.lock(newOrientation).catch(console.warn);
    }
    onToggleOrientation();
  }, [isLandscape, onToggleOrientation]);

  // ビュー切り替え
  const handleViewChange = useCallback((view: 'input' | 'score' | 'visualizer' | 'settings') => {
    onViewChange(view);
  }, [onViewChange]);

  if (!isMobile) {
    return <div className="desktop-layout">{children}</div>;
  }

  return (
    <div 
      className={`mobile-optimized-layout ${isLandscape ? 'landscape' : 'portrait'} ${isFullscreen ? 'fullscreen' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ヘッダー */}
      <header className="mobile-header">
        <div className="header-left">
          <button 
            className="orientation-toggle"
            onClick={handleOrientationToggle}
            title="画面向き切り替え"
          >
            {isLandscape ? '📱' : '📱'}
          </button>
        </div>
        
        <div className="header-center">
          <h1>🎵 音アプリ</h1>
        </div>
        
        <div className="header-right">
          <button 
            className="fullscreen-toggle"
            onClick={handleFullscreenToggle}
            title="フルスクリーン切り替え"
          >
            {isFullscreen ? '⤓' : '⤢'}
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mobile-main">
        <div className="content-container">
          {children}
        </div>
      </main>

      {/* ナビゲーション */}
      <nav className="mobile-navigation">
        <button 
          className={`nav-item ${currentView === 'input' ? 'active' : ''}`}
          onClick={() => handleViewChange('input')}
        >
          <span className="nav-icon">🍽️</span>
          <span className="nav-label">食事記録</span>
        </button>
        
        <button 
          className={`nav-item ${currentView === 'score' ? 'active' : ''}`}
          onClick={() => handleViewChange('score')}
        >
          <span className="nav-icon">🎼</span>
          <span className="nav-label">楽譜</span>
        </button>
        
        <button 
          className={`nav-item ${currentView === 'visualizer' ? 'active' : ''}`}
          onClick={() => handleViewChange('visualizer')}
        >
          <span className="nav-icon">🎨</span>
          <span className="nav-label">可視化</span>
        </button>
        
        <button 
          className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
          onClick={() => handleViewChange('settings')}
        >
          <span className="nav-icon">⚙️</span>
          <span className="nav-label">設定</span>
        </button>
      </nav>

      {/* スワイプインジケーター */}
      {swipeDirection && (
        <div className={`swipe-indicator ${swipeDirection}`}>
          {swipeDirection === 'up' ? '↑ 可視化表示' : '↓ 食事記録'}
        </div>
      )}

      {/* 再生状態インジケーター */}
      {isPlaying && (
        <div className="playing-indicator">
          <div className="pulse-dot"></div>
          <span>再生中</span>
        </div>
      )}
    </div>
  );
};

export default MobileOptimizedLayout;
