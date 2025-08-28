/**
 * 🎯 適応的UIシステム
 * 認知負荷に応じた動的UI調整・ADHD/ASD特化最適化・リアルタイム適応
 */

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import {
  realtimeCognitiveLoadMonitor,
  CognitiveLoadMetrics,
  CognitiveLoadLevel,
  UIAdaptationConfig,
} from '@/services/cognitive/RealtimeCognitiveLoadMonitor';

// 適応状態
export interface AdaptationState {
  isActive: boolean;
  currentLevel: CognitiveLoadLevel;
  adaptations: {
    simplifiedLayout: boolean;
    reducedAnimations: boolean;
    increasedContrast: boolean;
    largerTargets: boolean;
    focusMode: boolean;
    calmColors: boolean;
    reducedOptions: boolean;
    visualCues: boolean;
  };
  customStyles: React.CSSProperties;
}

// 適応テーマ
export interface AdaptiveTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  spacing: {
    unit: number;
    padding: number;
    margin: number;
  };
  typography: {
    scale: number;
    lineHeight: number;
    letterSpacing: number;
  };
  animations: {
    duration: number;
    easing: string;
    enabled: boolean;
  };
  layout: {
    maxWidth: string;
    gridGap: number;
    borderRadius: number;
  };
}

// コンテキスト
interface AdaptiveUIContextType {
  adaptationState: AdaptationState;
  currentTheme: AdaptiveTheme;
  metrics: CognitiveLoadMetrics | null;
  setCustomAdaptation: (adaptations: Partial<AdaptationState['adaptations']>) => void;
  resetAdaptations: () => void;
}

const AdaptiveUIContext = createContext<AdaptiveUIContextType | null>(null);

// カスタムフック
export const useAdaptiveUI = () => {
  const context = useContext(AdaptiveUIContext);
  if (!context) {
    throw new Error('useAdaptiveUI must be used within AdaptiveUIProvider');
  }
  return context;
};

// デフォルトテーマ定義
const createTheme = (
  level: CognitiveLoadLevel,
  adaptations: AdaptationState['adaptations']
): AdaptiveTheme => {
  const baseTheme: AdaptiveTheme = {
    colors: {
      primary: '#3B82F6',
      secondary: '#64748B',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: '#1E293B',
      accent: '#10B981',
    },
    spacing: {
      unit: 8,
      padding: 16,
      margin: 16,
    },
    typography: {
      scale: 1,
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    animations: {
      duration: 200,
      easing: 'ease-in-out',
      enabled: true,
    },
    layout: {
      maxWidth: '1200px',
      gridGap: 16,
      borderRadius: 8,
    },
  };

  // 認知負荷レベルに応じた調整
  switch (level) {
    case 'critical':
      return {
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          primary: adaptations.calmColors ? '#6366F1' : baseTheme.colors.primary,
          background: adaptations.calmColors ? '#F1F5F9' : baseTheme.colors.background,
          surface: adaptations.increasedContrast ? '#FFFFFF' : baseTheme.colors.surface,
          text: adaptations.increasedContrast ? '#000000' : baseTheme.colors.text,
        },
        spacing: {
          unit: adaptations.simplifiedLayout ? 12 : baseTheme.spacing.unit,
          padding: adaptations.simplifiedLayout ? 24 : baseTheme.spacing.padding,
          margin: adaptations.simplifiedLayout ? 24 : baseTheme.spacing.margin,
        },
        typography: {
          scale: adaptations.largerTargets ? 1.2 : baseTheme.typography.scale,
          lineHeight: 1.7,
          letterSpacing: 0.5,
        },
        animations: {
          ...baseTheme.animations,
          duration: adaptations.reducedAnimations ? 0 : 100,
          enabled: !adaptations.reducedAnimations,
        },
        layout: {
          ...baseTheme.layout,
          gridGap: adaptations.simplifiedLayout ? 24 : baseTheme.layout.gridGap,
          borderRadius: adaptations.simplifiedLayout ? 4 : baseTheme.layout.borderRadius,
        },
      };

    case 'high':
      return {
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          primary: adaptations.calmColors ? '#8B5CF6' : baseTheme.colors.primary,
          surface: adaptations.increasedContrast ? '#FFFFFF' : '#FAFAFA',
        },
        spacing: {
          unit: adaptations.simplifiedLayout ? 10 : baseTheme.spacing.unit,
          padding: adaptations.simplifiedLayout ? 20 : baseTheme.spacing.padding,
          margin: adaptations.simplifiedLayout ? 20 : baseTheme.spacing.margin,
        },
        typography: {
          scale: adaptations.largerTargets ? 1.1 : baseTheme.typography.scale,
          lineHeight: 1.6,
          letterSpacing: 0.25,
        },
        animations: {
          ...baseTheme.animations,
          duration: adaptations.reducedAnimations ? 50 : 150,
        },
        layout: {
          ...baseTheme.layout,
          gridGap: adaptations.simplifiedLayout ? 20 : baseTheme.layout.gridGap,
        },
      };

    case 'moderate':
      return {
        ...baseTheme,
        typography: {
          scale: adaptations.largerTargets ? 1.05 : baseTheme.typography.scale,
          lineHeight: 1.55,
          letterSpacing: 0.1,
        },
        animations: {
          ...baseTheme.animations,
          duration: adaptations.reducedAnimations ? 100 : baseTheme.animations.duration,
        },
      };

    default:
      return baseTheme;
  }
};

// プロバイダーコンポーネント
interface AdaptiveUIProviderProps {
  children: React.ReactNode;
  userId?: string;
  autoStart?: boolean;
}

export const AdaptiveUIProvider: React.FC<AdaptiveUIProviderProps> = ({
  children,
  userId,
  autoStart = true,
}) => {
  const [adaptationState, setAdaptationState] = useState<AdaptationState>({
    isActive: false,
    currentLevel: 'low',
    adaptations: {
      simplifiedLayout: false,
      reducedAnimations: false,
      increasedContrast: false,
      largerTargets: false,
      focusMode: false,
      calmColors: false,
      reducedOptions: false,
      visualCues: false,
    },
    customStyles: {},
  });

  const [metrics, setMetrics] = useState<CognitiveLoadMetrics | null>(null);
  const [currentTheme, setCurrentTheme] = useState<AdaptiveTheme>(
    createTheme('low', adaptationState.adaptations)
  );

  // 認知負荷監視の初期化
  useEffect(() => {
    if (autoStart && userId) {
      realtimeCognitiveLoadMonitor.startMonitoring(userId);
    }

    // イベントリスナーの設定
    const handleCognitiveLoadCalculated = (newMetrics: CognitiveLoadMetrics) => {
      setMetrics(newMetrics);
      updateAdaptations(newMetrics);
    };

    const handleUIAdaptationRequired = (data: any) => {
      applyUIAdaptations(data.level, data.adaptations);
    };

    realtimeCognitiveLoadMonitor.on('cognitiveLoadCalculated', handleCognitiveLoadCalculated);
    realtimeCognitiveLoadMonitor.on('uiAdaptationRequired', handleUIAdaptationRequired);

    return () => {
      realtimeCognitiveLoadMonitor.off('cognitiveLoadCalculated', handleCognitiveLoadCalculated);
      realtimeCognitiveLoadMonitor.off('uiAdaptationRequired', handleUIAdaptationRequired);

      if (autoStart) {
        realtimeCognitiveLoadMonitor.stopMonitoring();
      }
    };
  }, [userId, autoStart]);

  // テーマの更新
  useEffect(() => {
    const newTheme = createTheme(adaptationState.currentLevel, adaptationState.adaptations);
    setCurrentTheme(newTheme);
    applyGlobalStyles(newTheme, adaptationState);
  }, [adaptationState]);

  /**
   * 適応の更新
   */
  const updateAdaptations = useCallback((newMetrics: CognitiveLoadMetrics) => {
    const newAdaptations: AdaptationState['adaptations'] = {
      simplifiedLayout: newMetrics.level === 'critical' || newMetrics.level === 'high',
      reducedAnimations:
        newMetrics.level === 'critical' ||
        (newMetrics.level === 'high' && newMetrics.adhdFactors.sensoryOverload > 0.7),
      increasedContrast: newMetrics.level === 'critical' || newMetrics.processing.accuracy < 0.5,
      largerTargets: newMetrics.level === 'critical' || newMetrics.level === 'high',
      focusMode:
        newMetrics.level === 'critical' ||
        (newMetrics.attention.focusStability < 0.5 && newMetrics.adhdFactors.inattention > 0.6),
      calmColors: newMetrics.adhdFactors.sensoryOverload > 0.7 || newMetrics.level === 'critical',
      reducedOptions:
        newMetrics.level === 'critical' ||
        (newMetrics.executive.planning < 0.5 && newMetrics.workingMemory.capacity < 0.5),
      visualCues: newMetrics.processing.accuracy < 0.6 || newMetrics.adhdFactors.inattention > 0.6,
    };

    setAdaptationState((prev) => ({
      ...prev,
      isActive: true,
      currentLevel: newMetrics.level,
      adaptations: newAdaptations,
    }));
  }, []);

  /**
   * UI適応の適用
   */
  const applyUIAdaptations = useCallback((level: CognitiveLoadLevel, adaptationConfig: any) => {
    setAdaptationState((prev) => ({
      ...prev,
      currentLevel: level,
      isActive: true,
    }));

    // 動的スタイル調整
    if (level === 'critical') {
      // 最高優先度の適応
      hideNonEssentialElements();
      enableFocusMode();
      reduceVisualComplexity();
    } else if (level === 'high') {
      // 高優先度の適応
      simplifyInterface();
      increaseTargetSizes();
    }
  }, []);

  /**
   * グローバルスタイルの適用
   */
  const applyGlobalStyles = useCallback((theme: AdaptiveTheme, state: AdaptationState) => {
    const root = document.documentElement;

    // CSS変数の設定
    root.style.setProperty('--adaptive-primary', theme.colors.primary);
    root.style.setProperty('--adaptive-background', theme.colors.background);
    root.style.setProperty('--adaptive-text', theme.colors.text);
    root.style.setProperty('--adaptive-surface', theme.colors.surface);

    root.style.setProperty('--adaptive-spacing-unit', `${theme.spacing.unit}px`);
    root.style.setProperty('--adaptive-spacing-padding', `${theme.spacing.padding}px`);
    root.style.setProperty('--adaptive-spacing-margin', `${theme.spacing.margin}px`);

    root.style.setProperty('--adaptive-font-scale', theme.typography.scale.toString());
    root.style.setProperty('--adaptive-line-height', theme.typography.lineHeight.toString());
    root.style.setProperty('--adaptive-letter-spacing', `${theme.typography.letterSpacing}px`);

    root.style.setProperty('--adaptive-animation-duration', `${theme.animations.duration}ms`);
    root.style.setProperty('--adaptive-animation-easing', theme.animations.easing);

    root.style.setProperty('--adaptive-border-radius', `${theme.layout.borderRadius}px`);
    root.style.setProperty('--adaptive-grid-gap', `${theme.layout.gridGap}px`);

    // クラスの追加/削除
    root.classList.toggle('adaptive-simplified-layout', state.adaptations.simplifiedLayout);
    root.classList.toggle('adaptive-reduced-animations', state.adaptations.reducedAnimations);
    root.classList.toggle('adaptive-increased-contrast', state.adaptations.increasedContrast);
    root.classList.toggle('adaptive-larger-targets', state.adaptations.largerTargets);
    root.classList.toggle('adaptive-focus-mode', state.adaptations.focusMode);
    root.classList.toggle('adaptive-calm-colors', state.adaptations.calmColors);
    root.classList.toggle('adaptive-visual-cues', state.adaptations.visualCues);
  }, []);

  /**
   * 特殊適応メソッド
   */
  const hideNonEssentialElements = useCallback(() => {
    const nonEssential = document.querySelectorAll(
      '.non-essential, .decorative, .sidebar-secondary'
    );
    nonEssential.forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });
  }, []);

  const enableFocusMode = useCallback(() => {
    const main = document.querySelector('main');
    if (main) {
      main.classList.add('focus-mode');
    }
  }, []);

  const reduceVisualComplexity = useCallback(() => {
    const gradients = document.querySelectorAll('.gradient-bg, .pattern-bg');
    gradients.forEach((el) => {
      (el as HTMLElement).style.background = 'var(--adaptive-surface)';
    });
  }, []);

  const simplifyInterface = useCallback(() => {
    const complex = document.querySelectorAll('.complex-card, .detailed-stats');
    complex.forEach((el) => {
      el.classList.add('simplified');
    });
  }, []);

  const increaseTargetSizes = useCallback(() => {
    const interactive = document.querySelectorAll('button, input, select, a');
    interactive.forEach((el) => {
      (el as HTMLElement).style.minHeight = '44px';
      (el as HTMLElement).style.padding = '12px 16px';
    });
  }, []);

  /**
   * 手動適応設定
   */
  const setCustomAdaptation = useCallback(
    (adaptations: Partial<AdaptationState['adaptations']>) => {
      setAdaptationState((prev) => ({
        ...prev,
        adaptations: { ...prev.adaptations, ...adaptations },
      }));
    },
    []
  );

  /**
   * 適応リセット
   */
  const resetAdaptations = useCallback(() => {
    setAdaptationState({
      isActive: false,
      currentLevel: 'low',
      adaptations: {
        simplifiedLayout: false,
        reducedAnimations: false,
        increasedContrast: false,
        largerTargets: false,
        focusMode: false,
        calmColors: false,
        reducedOptions: false,
        visualCues: false,
      },
      customStyles: {},
    });

    // クラスのリセット
    const root = document.documentElement;
    root.classList.remove(
      'adaptive-simplified-layout',
      'adaptive-reduced-animations',
      'adaptive-increased-contrast',
      'adaptive-larger-targets',
      'adaptive-focus-mode',
      'adaptive-calm-colors',
      'adaptive-visual-cues'
    );

    // 非表示要素の復元
    const hidden = document.querySelectorAll('[style*="display: none"]');
    hidden.forEach((el) => {
      (el as HTMLElement).style.display = '';
    });
  }, []);

  const contextValue: AdaptiveUIContextType = {
    adaptationState,
    currentTheme,
    metrics,
    setCustomAdaptation,
    resetAdaptations,
  };

  return (
    <AdaptiveUIContext.Provider value={contextValue}>
      {/* 適応的スタイルの注入 */}
      <style>{generateAdaptiveCSS(currentTheme, adaptationState)}</style>
      {children}
    </AdaptiveUIContext.Provider>
  );
};

/**
 * 適応的CSSの生成
 */
const generateAdaptiveCSS = (theme: AdaptiveTheme, state: AdaptationState): string => {
  return `
    /* 適応的基本スタイル */
    .adaptive-card {
      background: ${theme.colors.surface};
      border-radius: ${theme.layout.borderRadius}px;
      padding: ${theme.spacing.padding}px;
      margin: ${theme.spacing.margin}px 0;
      transition: all ${theme.animations.enabled ? theme.animations.duration + 'ms' : '0ms'} ${theme.animations.easing};
    }

    .adaptive-text {
      color: ${theme.colors.text};
      font-size: calc(1rem * ${theme.typography.scale});
      line-height: ${theme.typography.lineHeight};
      letter-spacing: ${theme.typography.letterSpacing}px;
    }

    .adaptive-button {
      background: ${theme.colors.primary};
      color: white;
      border: none;
      border-radius: ${theme.layout.borderRadius}px;
      padding: ${theme.spacing.padding}px;
      min-height: ${state.adaptations.largerTargets ? '48px' : '40px'};
      font-size: calc(1rem * ${theme.typography.scale});
      cursor: pointer;
      transition: all ${theme.animations.enabled ? theme.animations.duration + 'ms' : '0ms'} ${theme.animations.easing};
    }

    .adaptive-button:hover {
      opacity: ${theme.animations.enabled ? '0.9' : '1'};
      transform: ${theme.animations.enabled ? 'translateY(-1px)' : 'none'};
    }

    /* 適応状態別スタイル */
    .adaptive-simplified-layout .complex-layout {
      display: none;
    }

    .adaptive-simplified-layout .grid {
      grid-template-columns: 1fr;
      gap: ${theme.layout.gridGap * 1.5}px;
    }

    .adaptive-reduced-animations * {
      animation-duration: 0ms !important;
      transition-duration: 0ms !important;
    }

    .adaptive-increased-contrast {
      filter: contrast(1.2);
    }

    .adaptive-increased-contrast .adaptive-text {
      color: #000000;
      font-weight: 500;
    }

    .adaptive-larger-targets button,
    .adaptive-larger-targets input,
    .adaptive-larger-targets select,
    .adaptive-larger-targets a {
      min-height: 48px;
      padding: 12px 16px;
      font-size: calc(1rem * ${theme.typography.scale * 1.1});
    }

    .adaptive-focus-mode {
      filter: blur(0);
    }

    .adaptive-focus-mode > *:not(.main-content) {
      opacity: 0.6;
    }

    .adaptive-calm-colors {
      --adaptive-primary: #6366F1;
      --adaptive-accent: #10B981;
    }

    .adaptive-visual-cues .important {
      border-left: 4px solid ${theme.colors.accent};
      background: linear-gradient(90deg, ${theme.colors.accent}10 0%, transparent 100%);
    }

    .adaptive-visual-cues .step-indicator::before {
      content: "👉 ";
      margin-right: 8px;
    }

    /* ADHD特化スタイル */
    .adhd-friendly {
      border: 2px solid ${theme.colors.primary};
      box-shadow: 0 0 0 2px ${theme.colors.primary}20;
    }

    .cognitive-load-critical {
      --adaptive-background: #F8F9FA;
      --adaptive-surface: #FFFFFF;
      --adaptive-text: #000000;
    }

    .cognitive-load-critical .animated {
      animation: none !important;
    }

    .cognitive-load-critical .non-essential {
      display: none !important;
    }

    /* レスポンシブ適応 */
    @media (max-width: 768px) {
      .adaptive-card {
        margin: ${theme.spacing.margin / 2}px 0;
        padding: ${theme.spacing.padding * 0.75}px;
      }

      .adaptive-larger-targets button,
      .adaptive-larger-targets input,
      .adaptive-larger-targets select {
        min-height: 52px;
        font-size: calc(1rem * ${theme.typography.scale * 1.2});
      }
    }
  `;
};

// コンポーネントユーティリティ
export const AdaptiveCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  importance?: 'low' | 'medium' | 'high';
}> = ({ children, className = '', importance = 'medium' }) => {
  const { adaptationState } = useAdaptiveUI();

  const cardClasses = [
    'adaptive-card',
    importance === 'high' && adaptationState.adaptations.visualCues && 'important',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={cardClasses}>{children}</div>;
};

export const AdaptiveButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ children, onClick, variant = 'primary', size = 'md', className = '' }) => {
  const { adaptationState } = useAdaptiveUI();

  const buttonClasses = [
    'adaptive-button',
    `adaptive-button-${variant}`,
    `adaptive-button-${size}`,
    adaptationState.adaptations.largerTargets && 'large-target',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={buttonClasses} onClick={onClick}>
      {children}
    </button>
  );
};

export const AdaptiveText: React.FC<{
  children: React.ReactNode;
  level?: 'body' | 'heading' | 'caption';
  className?: string;
}> = ({ children, level = 'body', className = '' }) => {
  const textClasses = ['adaptive-text', `adaptive-text-${level}`, className]
    .filter(Boolean)
    .join(' ');

  return <span className={textClasses}>{children}</span>;
};

export default AdaptiveUIProvider;
