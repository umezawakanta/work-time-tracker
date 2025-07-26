/**
 * 🎨 適応的カードコンポーネント
 * 認知特性に応じて自動調整されるカード
 */

import React, { forwardRef, useEffect, useState } from 'react';
import { useAdaptiveUI, useAdaptiveStyles } from './AdaptiveUIProvider';
import { cn } from '@/lib/utils';

interface AdaptiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cognitiveLoad?: 'low' | 'medium' | 'high';
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  energyRequirement?: 'low' | 'medium' | 'high';
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  adaptiveFeatures?: {
    autoHide?: boolean;
    progressIndicator?: boolean;
    completionCelebration?: boolean;
    contextualHelp?: boolean;
  };
  onInteraction?: () => void;
  isCompleted?: boolean;
  progress?: number; // 0-100
}

export const AdaptiveCard = forwardRef<HTMLDivElement, AdaptiveCardProps>(
  (
    {
      children,
      className,
      cognitiveLoad = 'medium',
      urgency = 'medium',
      energyRequirement = 'medium',
      variant = 'default',
      adaptiveFeatures = {},
      onInteraction,
      isCompleted = false,
      progress,
      style,
      ...props
    },
    ref
  ) => {
    const { settings, cognitiveState, applyAdaptation } = useAdaptiveUI();
    const { getAdaptiveClassName, getAdaptiveStyles, getCognitiveLoadStyle } = useAdaptiveStyles();
    const [showCelebration, setShowCelebration] = useState(false);

    // 完了時の祝福アニメーション
    useEffect(() => {
      if (isCompleted && settings.completionCelebration && adaptiveFeatures.completionCelebration) {
        setShowCelebration(true);
        const timer = setTimeout(() => setShowCelebration(false), 600);
        return () => clearTimeout(timer);
      }
    }, [isCompleted, settings.completionCelebration, adaptiveFeatures.completionCelebration]);

    // エネルギー適合性チェック
    const isEnergyMismatch = () => {
      if (!settings.energyModeAdaptation) return false;

      const energyLevels = { low: 3, medium: 6, high: 9 };
      const requiredEnergy = energyLevels[energyRequirement];
      const currentEnergy = cognitiveState.currentEnergyLevel;

      return currentEnergy < requiredEnergy - 2;
    };

    // 認知負荷適応
    const getCognitiveLoadClass = () => {
      if (cognitiveState.cognitiveLoad >= 8 && cognitiveLoad === 'high') {
        return 'cognitive-load-high';
      } else if (cognitiveLoad === 'medium') {
        return 'cognitive-load-medium';
      } else {
        return 'cognitive-load-low';
      }
    };

    // 緊急度クラス
    const getUrgencyClass = () => {
      if (settings.urgencyIndicators) {
        return `urgency-${urgency}`;
      }
      return '';
    };

    // バリアント別スタイル
    const getVariantStyles = () => {
      const baseStyles = getAdaptiveStyles();

      switch (variant) {
        case 'elevated':
          return {
            ...baseStyles,
            boxShadow: settings.distractionReduction
              ? '0 2px 4px rgba(0, 0, 0, 0.1)'
              : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          };
        case 'outlined':
          return {
            ...baseStyles,
            border: `2px solid ${settings.primaryColor}`,
            backgroundColor: 'transparent',
          };
        case 'filled':
          return {
            ...baseStyles,
            backgroundColor: settings.primaryColor,
            color: settings.backgroundColor,
          };
        default:
          return baseStyles;
      }
    };

    // インタラクション処理
    const handleInteraction = () => {
      onInteraction?.();

      // 高認知負荷時の適応
      if (cognitiveLoad === 'high' && cognitiveState.cognitiveLoad < 7) {
        applyAdaptation('focus-session');
      }
    };

    // プログレス表示
    const progressStyles =
      progress !== undefined
        ? {
            '--progress-width': `${progress}%`,
          }
        : {};

    const combinedClassName = cn(
      // ベースクラス
      'adaptive-card rounded-lg border transition-all duration-200',

      // レイアウト適応
      settings.layoutDensity === 'spacious' && 'p-6',
      settings.layoutDensity === 'comfortable' && 'p-4',
      settings.layoutDensity === 'compact' && 'p-3',

      // 適応的クラス
      getAdaptiveClassName('card'),
      getCognitiveLoadClass(),
      getUrgencyClass(),

      // 状態別クラス
      settings.simplifiedInterface && 'simplified-card',
      settings.distractionReduction && 'distraction-reduced',
      isEnergyMismatch() && 'energy-mismatch opacity-60',

      // 機能別クラス
      adaptiveFeatures.autoHide && settings.autoHideElements && 'auto-hide',
      adaptiveFeatures.progressIndicator && progress !== undefined && 'progress-indicator',
      showCelebration && 'completion-celebration',

      // バリアント
      variant === 'elevated' && 'shadow-lg',
      variant === 'outlined' && 'border-2',
      variant === 'filled' && 'text-white',

      // ユーザー定義クラス
      className
    );

    return (
      <div
        ref={ref}
        className={combinedClassName}
        style={{
          ...getVariantStyles(),
          ...getCognitiveLoadStyle(
            cognitiveLoad === 'high' ? 8 : cognitiveLoad === 'medium' ? 5 : 2
          ),
          ...progressStyles,
          ...style,
        }}
        onClick={handleInteraction}
        role={onInteraction ? 'button' : undefined}
        tabIndex={onInteraction ? 0 : undefined}
        aria-label={`認知負荷: ${cognitiveLoad}, 緊急度: ${urgency}${isCompleted ? ', 完了済み' : ''}`}
        {...props}
      >
        {children}

        {/* エネルギー不適合警告 */}
        {isEnergyMismatch() && settings.energyModeAdaptation && (
          <div
            className="absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"
            title="現在のエネルギーレベルに対して負荷が高い可能性があります"
          />
        )}

        {/* コンテキストヘルプ */}
        {adaptiveFeatures.contextualHelp && settings.contextualHelp && cognitiveLoad === 'high' && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
            💡 このタスクは認知負荷が高めです。集中できる時間に取り組むことをお勧めします。
          </div>
        )}

        {/* 完了祝福メッセージ */}
        {showCelebration && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-100 bg-opacity-90 rounded-lg">
            <div className="text-2xl animate-bounce">🎉</div>
          </div>
        )}
      </div>
    );
  }
);

AdaptiveCard.displayName = 'AdaptiveCard';

// AdaptiveCardHeader
export const AdaptiveCardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    showTimeAwareness?: boolean;
  }
>(({ className, priority, showTimeAwareness, children, ...props }, ref) => {
  const { settings, cognitiveState } = useAdaptiveUI();
  const { getAdaptiveStyles } = useAdaptiveStyles();

  const getPriorityIndicator = () => {
    if (!priority || !settings.urgencyIndicators) return null;

    const indicators = {
      urgent: '🔴',
      high: '🟡',
      medium: '🟢',
      low: '⚪',
    };

    return <span className="mr-2">{indicators[priority]}</span>;
  };

  const getTimeAwareness = () => {
    if (!showTimeAwareness || !settings.timeAwareness) return null;

    const now = new Date();
    const hour = now.getHours();
    let timeIndicator = '';

    if (hour >= 6 && hour < 12) timeIndicator = '🌅';
    else if (hour >= 12 && hour < 18) timeIndicator = '☀️';
    else if (hour >= 18 && hour < 22) timeIndicator = '🌅';
    else timeIndicator = '🌙';

    return <span className="ml-2 opacity-60">{timeIndicator}</span>;
  };

  return (
    <div
      ref={ref}
      className={cn(
        'adaptive-card-header',
        settings.layoutDensity === 'spacious' && 'pb-4',
        settings.layoutDensity === 'comfortable' && 'pb-3',
        settings.layoutDensity === 'compact' && 'pb-2',
        className
      )}
      style={getAdaptiveStyles()}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getPriorityIndicator()}
          {children}
        </div>
        {getTimeAwareness()}
      </div>
    </div>
  );
});

AdaptiveCardHeader.displayName = 'AdaptiveCardHeader';

// AdaptiveCardContent
export const AdaptiveCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    cognitiveSimplification?: boolean;
  }
>(({ className, cognitiveSimplification, children, ...props }, ref) => {
  const { settings } = useAdaptiveUI();
  const { getAdaptiveStyles } = useAdaptiveStyles();

  return (
    <div
      ref={ref}
      className={cn(
        'adaptive-card-content',
        settings.simplifiedInterface && cognitiveSimplification && 'simplified-content',
        className
      )}
      style={getAdaptiveStyles()}
      {...props}
    >
      {children}
    </div>
  );
});

AdaptiveCardContent.displayName = 'AdaptiveCardContent';

// AdaptiveCardActions
export const AdaptiveCardActions = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    primaryAction?: React.ReactNode;
    secondaryActions?: React.ReactNode[];
  }
>(({ className, primaryAction, secondaryActions, children, ...props }, ref) => {
  const { settings } = useAdaptiveUI();
  const { getAdaptiveStyles } = useAdaptiveStyles();

  return (
    <div
      ref={ref}
      className={cn(
        'adaptive-card-actions flex items-center gap-2',
        settings.layoutDensity === 'spacious' && 'pt-4',
        settings.layoutDensity === 'comfortable' && 'pt-3',
        settings.layoutDensity === 'compact' && 'pt-2',
        className
      )}
      style={getAdaptiveStyles()}
      {...props}
    >
      {primaryAction && <div className="primary-action">{primaryAction}</div>}

      {secondaryActions && secondaryActions.length > 0 && (
        <div
          className={cn('secondary-actions flex gap-2', settings.simplifiedInterface && 'hidden')}
        >
          {secondaryActions.map((action, index) => (
            <div key={index}>{action}</div>
          ))}
        </div>
      )}

      {children}
    </div>
  );
});

AdaptiveCardActions.displayName = 'AdaptiveCardActions';

export default AdaptiveCard;
