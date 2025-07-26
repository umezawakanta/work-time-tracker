/**
 * 🎨 適応的UIプロバイダー
 * ADHD/ASD認知特性に基づくUI自動調整システム
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import CognitiveIntegrationService from '@/services/cognitive/CognitiveIntegrationService';

// 適応的UI設定型定義
interface AdaptiveUISettings {
  // 色彩設定
  colorScheme: 'high-contrast' | 'low-contrast' | 'custom';
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;

  // フォント設定
  fontSizeMultiplier: number; // 0.8-2.0
  fontFamily: 'system' | 'dyslexia-friendly' | 'monospace';
  lineHeight: number; // 1.2-2.0
  letterSpacing: number; // -0.05-0.1em

  // レイアウト設定
  layoutDensity: 'compact' | 'comfortable' | 'spacious';
  borderRadius: number; // 0-16px
  spacing: number; // 0.5-2.0 multiplier
  componentPadding: number; // 0.5-2.0 multiplier

  // アニメーション設定
  animationLevel: 'none' | 'minimal' | 'moderate' | 'full';
  transitionDuration: number; // 0-500ms
  reducedMotion: boolean;

  // ナビゲーション設定
  navigationStyle: 'minimal' | 'standard' | 'detailed';
  breadcrumbsEnabled: boolean;
  contextualHelp: boolean;

  // フォーカス・注意力設定
  focusIndicators: 'subtle' | 'prominent' | 'custom';
  distractionReduction: boolean;
  highlightInteractive: boolean;

  // 認知負荷軽減
  simplifiedInterface: boolean;
  autoHideElements: boolean;
  progressIndicators: boolean;
  confirmationDialogs: boolean;

  // ADHD特化機能
  timeAwareness: boolean;
  urgencyIndicators: boolean;
  completionCelebration: boolean;
  energyModeAdaptation: boolean;
}

interface CognitiveState {
  currentEnergyLevel: number; // 1-10
  currentFocusLevel: number; // 1-10
  currentStressLevel: number; // 1-10
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  cognitiveLoad: number; // 1-10
}

interface AdaptiveUIContextType {
  settings: AdaptiveUISettings;
  cognitiveState: CognitiveState;
  updateSettings: (newSettings: Partial<AdaptiveUISettings>) => void;
  updateCognitiveState: (newState: Partial<CognitiveState>) => void;
  applyAdaptation: (context: string) => void;
  resetToDefaults: () => void;
  isAdaptationEnabled: boolean;
  toggleAdaptation: () => void;
}

const AdaptiveUIContext = createContext<AdaptiveUIContextType | undefined>(undefined);

// デフォルト設定
const defaultSettings: AdaptiveUISettings = {
  colorScheme: 'low-contrast',
  primaryColor: '#3b82f6',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  accentColor: '#10b981',
  fontSizeMultiplier: 1.0,
  fontFamily: 'system',
  lineHeight: 1.5,
  letterSpacing: 0,
  layoutDensity: 'comfortable',
  borderRadius: 8,
  spacing: 1.0,
  componentPadding: 1.0,
  animationLevel: 'minimal',
  transitionDuration: 200,
  reducedMotion: false,
  navigationStyle: 'standard',
  breadcrumbsEnabled: true,
  contextualHelp: true,
  focusIndicators: 'prominent',
  distractionReduction: true,
  highlightInteractive: true,
  simplifiedInterface: false,
  autoHideElements: false,
  progressIndicators: true,
  confirmationDialogs: true,
  timeAwareness: true,
  urgencyIndicators: true,
  completionCelebration: true,
  energyModeAdaptation: true,
};

const defaultCognitiveState: CognitiveState = {
  currentEnergyLevel: 7,
  currentFocusLevel: 7,
  currentStressLevel: 3,
  timeOfDay: 'morning',
  cognitiveLoad: 5,
};

export const AdaptiveUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AdaptiveUISettings>(defaultSettings);
  const [cognitiveState, setCognitiveState] = useState<CognitiveState>(defaultCognitiveState);
  const [isAdaptationEnabled, setIsAdaptationEnabled] = useState(true);
  const [cognitiveService] = useState(() => new CognitiveIntegrationService());

  // 時間帯検出
  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      let timeOfDay: CognitiveState['timeOfDay'];

      if (hour >= 6 && hour < 12) timeOfDay = 'morning';
      else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
      else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
      else timeOfDay = 'night';

      setCognitiveState((prev) => ({ ...prev, timeOfDay }));
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000); // 1分ごと更新

    return () => clearInterval(interval);
  }, []);

  // 認知状態に基づくUI自動調整
  useEffect(() => {
    if (!isAdaptationEnabled) return;

    const adaptUI = () => {
      const newSettings = { ...settings };

      // エネルギーレベルによる調整
      if (cognitiveState.currentEnergyLevel <= 3) {
        // 低エネルギー時：簡素化
        newSettings.simplifiedInterface = true;
        newSettings.animationLevel = 'none';
        newSettings.layoutDensity = 'spacious';
        newSettings.fontSizeMultiplier = Math.max(1.1, newSettings.fontSizeMultiplier);
      } else if (cognitiveState.currentEnergyLevel >= 8) {
        // 高エネルギー時：通常表示
        newSettings.simplifiedInterface = false;
        newSettings.animationLevel = 'moderate';
        newSettings.layoutDensity = 'comfortable';
      }

      // フォーカスレベルによる調整
      if (cognitiveState.currentFocusLevel <= 4) {
        // 集中力低下時：気を散らす要素を削減
        newSettings.distractionReduction = true;
        newSettings.autoHideElements = true;
        newSettings.focusIndicators = 'prominent';
        newSettings.colorScheme = 'high-contrast';
      }

      // ストレスレベルによる調整
      if (cognitiveState.currentStressLevel >= 7) {
        // 高ストレス時：落ち着く色調
        newSettings.primaryColor = '#6366f1'; // より落ち着いた青
        newSettings.animationLevel = 'minimal';
        newSettings.reducedMotion = true;
      }

      // 時間帯による調整
      if (cognitiveState.timeOfDay === 'evening' || cognitiveState.timeOfDay === 'night') {
        // 夜間：目に優しい設定
        newSettings.backgroundColor = '#1f2937';
        newSettings.textColor = '#f9fafb';
        newSettings.colorScheme = 'high-contrast';
      } else {
        // 日中：標準設定
        newSettings.backgroundColor = '#ffffff';
        newSettings.textColor = '#1f2937';
      }

      // 認知負荷による調整
      if (cognitiveState.cognitiveLoad >= 8) {
        // 高認知負荷時：最大限簡素化
        newSettings.simplifiedInterface = true;
        newSettings.autoHideElements = true;
        newSettings.progressIndicators = true;
        newSettings.contextualHelp = true;
      }

      setSettings(newSettings);
    };

    adaptUI();
  }, [cognitiveState, isAdaptationEnabled]);

  // CSS変数更新
  useEffect(() => {
    const root = document.documentElement;

    // 色彩設定
    root.style.setProperty('--adaptive-primary', settings.primaryColor);
    root.style.setProperty('--adaptive-background', settings.backgroundColor);
    root.style.setProperty('--adaptive-text', settings.textColor);
    root.style.setProperty('--adaptive-accent', settings.accentColor);

    // フォント設定
    root.style.setProperty(
      '--adaptive-font-size-multiplier',
      settings.fontSizeMultiplier.toString()
    );
    root.style.setProperty('--adaptive-line-height', settings.lineHeight.toString());
    root.style.setProperty('--adaptive-letter-spacing', `${settings.letterSpacing}em`);

    // レイアウト設定
    root.style.setProperty('--adaptive-border-radius', `${settings.borderRadius}px`);
    root.style.setProperty('--adaptive-spacing-multiplier', settings.spacing.toString());
    root.style.setProperty('--adaptive-padding-multiplier', settings.componentPadding.toString());

    // アニメーション設定
    root.style.setProperty('--adaptive-transition-duration', `${settings.transitionDuration}ms`);

    // レイアウト密度による調整
    const densityClasses = ['adaptive-compact', 'adaptive-comfortable', 'adaptive-spacious'];
    densityClasses.forEach((cls) => document.body.classList.remove(cls));
    document.body.classList.add(`adaptive-${settings.layoutDensity}`);

    // アニメーションレベル調整
    const animationClasses = [
      'adaptive-no-animations',
      'adaptive-minimal-animations',
      'adaptive-moderate-animations',
      'adaptive-full-animations',
    ];
    animationClasses.forEach((cls) => document.body.classList.remove(cls));
    document.body.classList.add(`adaptive-${settings.animationLevel}-animations`);

    // 簡素化インターface
    if (settings.simplifiedInterface) {
      document.body.classList.add('adaptive-simplified');
    } else {
      document.body.classList.remove('adaptive-simplified');
    }

    // 気を散らす要素の削減
    if (settings.distractionReduction) {
      document.body.classList.add('adaptive-distraction-reduced');
    } else {
      document.body.classList.remove('adaptive-distraction-reduced');
    }

    // プリファーズカラースキーム対応
    if (settings.backgroundColor === '#1f2937') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [settings]);

  // 設定更新
  const updateSettings = useCallback((newSettings: Partial<AdaptiveUISettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // 認知状態更新
  const updateCognitiveState = useCallback((newState: Partial<CognitiveState>) => {
    setCognitiveState((prev) => ({ ...prev, ...newState }));
  }, []);

  // コンテキスト特化の適応
  const applyAdaptation = useCallback(
    (context: string) => {
      if (!isAdaptationEnabled) return;

      const adaptations: Record<string, Partial<AdaptiveUISettings>> = {
        'focus-session': {
          distractionReduction: true,
          autoHideElements: true,
          simplifiedInterface: true,
          animationLevel: 'none',
          focusIndicators: 'prominent',
        },
        'low-energy': {
          fontSizeMultiplier: 1.2,
          layoutDensity: 'spacious',
          simplifiedInterface: true,
          animationLevel: 'none',
          colorScheme: 'high-contrast',
        },
        'high-stress': {
          primaryColor: '#6366f1',
          animationLevel: 'minimal',
          reducedMotion: true,
          confirmationDialogs: true,
          contextualHelp: true,
        },
        'finance-mode': {
          confirmationDialogs: true,
          progressIndicators: true,
          contextualHelp: true,
          simplifiedInterface: true,
        },
        'task-planning': {
          progressIndicators: true,
          breadcrumbsEnabled: true,
          contextualHelp: true,
          layoutDensity: 'comfortable',
        },
      };

      if (adaptations[context]) {
        updateSettings(adaptations[context]);
      }
    },
    [isAdaptationEnabled, updateSettings]
  );

  // デフォルト設定にリセット
  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings);
    setCognitiveState(defaultCognitiveState);
  }, []);

  // 適応機能のON/OFF
  const toggleAdaptation = useCallback(() => {
    setIsAdaptationEnabled((prev) => !prev);
    if (!isAdaptationEnabled) {
      // 適応機能を有効にした時、即座に適応
      setCognitiveState((prev) => ({ ...prev }));
    } else {
      // 適応機能を無効にした時、デフォルト設定に戻す
      setSettings(defaultSettings);
    }
  }, [isAdaptationEnabled]);

  const contextValue: AdaptiveUIContextType = {
    settings,
    cognitiveState,
    updateSettings,
    updateCognitiveState,
    applyAdaptation,
    resetToDefaults,
    isAdaptationEnabled,
    toggleAdaptation,
  };

  return <AdaptiveUIContext.Provider value={contextValue}>{children}</AdaptiveUIContext.Provider>;
};

// カスタムフック
export const useAdaptiveUI = () => {
  const context = useContext(AdaptiveUIContext);
  if (context === undefined) {
    throw new Error('useAdaptiveUI must be used within an AdaptiveUIProvider');
  }
  return context;
};

// 高次コンポーネント：認知負荷感知
export const withCognitiveLoad = <P extends object>(
  Component: React.ComponentType<P>,
  baseCognitiveLoad: number = 5
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const { updateCognitiveState } = useAdaptiveUI();

    useEffect(() => {
      updateCognitiveState({ cognitiveLoad: baseCognitiveLoad });

      return () => {
        updateCognitiveState({ cognitiveLoad: 5 }); // デフォルトに戻す
      };
    }, [updateCognitiveState]);

    return <Component {...(props as P)} ref={ref} />;
  });

  WrappedComponent.displayName = `withCognitiveLoad(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// ユーティリティフック：適応的スタイル
export const useAdaptiveStyles = () => {
  const { settings } = useAdaptiveUI();

  return {
    getAdaptiveClassName: (baseClass: string) => {
      let className = baseClass;

      if (settings.simplifiedInterface) className += ' simplified';
      if (settings.distractionReduction) className += ' distraction-reduced';
      if (settings.highlightInteractive) className += ' highlight-interactive';

      return className;
    },

    getAdaptiveStyles: (baseStyles: React.CSSProperties = {}) => ({
      ...baseStyles,
      fontSize: `calc(1rem * ${settings.fontSizeMultiplier})`,
      lineHeight: settings.lineHeight,
      letterSpacing: `${settings.letterSpacing}em`,
      borderRadius: `${settings.borderRadius}px`,
      transition:
        settings.animationLevel === 'none'
          ? 'none'
          : `all ${settings.transitionDuration}ms ease-in-out`,
    }),

    getCognitiveLoadStyle: (cognitiveLoad: number) => {
      if (cognitiveLoad >= 8) {
        return {
          border: '2px solid var(--adaptive-accent)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          padding: `calc(1rem * ${settings.componentPadding * 1.2})`,
        };
      }
      return {};
    },
  };
};

export default AdaptiveUIProvider;
