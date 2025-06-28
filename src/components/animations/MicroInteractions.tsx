import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Heart, Star, Check, X, Sparkles } from 'lucide-react';

interface MicroInteractionProps {
  children: React.ReactNode;
  type?: 'hover' | 'click' | 'focus' | 'success' | 'error' | 'loading';
  intensity?: 'subtle' | 'medium' | 'strong';
  disabled?: boolean;
  className?: string;
}

/**
 * 🎬 アニメーションアーティスト: マイクロインタラクション コンポーネント
 * CSS Transitionsを使用した軽量アニメーション実装
 */
export const MicroInteraction: React.FC<MicroInteractionProps> = ({
  children,
  type = 'hover',
  intensity = 'medium',
  disabled = false,
  className,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleInteraction = () => {
    if (disabled || !elementRef.current) {
      return;
    }
    setIsAnimating(true);

    // アニメーション終了後にリセット
    setTimeout(() => setIsAnimating(false), 200);
  };

  const getAnimationClass = () => {
    if (!isAnimating) return '';

    const animations = {
      hover: {
        subtle: 'transform scale-[1.02] -translate-y-0.5',
        medium: 'transform scale-105 -translate-y-1',
        strong: 'transform scale-110 -translate-y-2',
      },
      click: {
        subtle: 'transform scale-95',
        medium: 'transform scale-90',
        strong: 'transform scale-85',
      },
      success: {
        subtle: 'bg-green-500 transform scale-[1.02]',
        medium: 'bg-green-500 transform scale-105',
        strong: 'bg-green-500 transform scale-110',
      },
      error: {
        subtle: 'animate-pulse',
        medium: 'animate-bounce',
        strong: 'animate-ping',
      },
      loading: {
        subtle: 'animate-spin',
        medium: 'animate-spin',
        strong: 'animate-spin',
      },
      focus: {
        subtle: 'ring-2 ring-blue-500 ring-opacity-50',
        medium: 'ring-4 ring-blue-500 ring-opacity-50',
        strong: 'ring-8 ring-blue-500 ring-opacity-50',
      },
    };

    return animations[type]?.[intensity] || '';
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-all duration-200 ease-in-out cursor-pointer',
        disabled && 'cursor-not-allowed opacity-50',
        getAnimationClass(),
        className
      )}
      onMouseEnter={type === 'hover' ? handleInteraction : undefined}
      onMouseDown={type === 'click' ? handleInteraction : undefined}
      onFocus={type === 'focus' ? handleInteraction : undefined}
    >
      {children}
    </div>
  );
};

// 🌟 スパークル効果（CSS実装）
export const SparkleEffectCSS: React.FC<{ trigger: boolean; children: React.ReactNode }> = ({
  trigger,
  children,
}) => {
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 1000);
    }
  }, [trigger]);

  return (
    <div className="relative overflow-hidden">
      {children}
      {showSparkles && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <Sparkles
              key={i}
              className={cn(
                'absolute h-3 w-3 text-yellow-400 animate-ping',
                `top-${Math.floor(Math.random() * 100)}% left-${Math.floor(Math.random() * 100)}%`
              )}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 💖 いいねボタン（CSS実装）
export const AnimatedLikeButtonCSS: React.FC<{
  initialLiked?: boolean;
  onToggle?: (liked: boolean) => void;
}> = ({ initialLiked = false, onToggle }) => {
  const [liked, setLiked] = useState(initialLiked);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setIsAnimating(true);
    onToggle?.(newLiked);

    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300',
        'transform hover:scale-105 active:scale-95',
        liked ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
        isAnimating && 'animate-pulse'
      )}
      onClick={handleClick}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-all duration-200',
          liked && 'fill-current scale-110',
          isAnimating && 'animate-bounce'
        )}
      />
      <span className="text-sm font-medium">{liked ? 'いいね済み' : 'いいね'}</span>
    </button>
  );
};

// ⭐ 星評価（CSS実装）
export const AnimatedStarRatingCSS: React.FC<{
  rating: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
}> = ({ rating, onRate, readonly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          className={cn(
            'p-1 transition-transform duration-200',
            !readonly && 'cursor-pointer hover:scale-125 active:scale-90',
            readonly && 'cursor-default'
          )}
          onClick={() => !readonly && onRate?.(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          disabled={readonly}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            className={cn(
              'h-5 w-5 transition-all duration-200',
              (hoverRating || rating) >= star
                ? 'text-yellow-400 fill-current scale-110'
                : 'text-gray-300',
              !readonly && 'hover:text-yellow-300'
            )}
          />
        </button>
      ))}
    </div>
  );
};

// 🔄 ローディングスピナー（CSS実装）
export const AnimatedLoaderCSS: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  type?: 'spin' | 'pulse' | 'bounce';
}> = ({ size = 'md', type = 'spin' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const animationClasses = {
    spin: 'animate-spin',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
  };

  return (
    <div
      className={cn(
        'rounded-full border-2 border-blue-500 border-t-transparent',
        sizeClasses[size],
        animationClasses[type]
      )}
    />
  );
};

// 🎯 成功/エラー フィードバック（CSS実装）
export const AnimatedFeedbackCSS: React.FC<{
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  visible: boolean;
  onClose?: () => void;
}> = ({ type, message, visible, onClose }) => {
  const icons = {
    success: <Check className="h-5 w-5" />,
    error: <X className="h-5 w-5" />,
    warning: <span className="text-yellow-600">⚠️</span>,
    info: <span className="text-blue-600">ℹ️</span>,
  };

  const colors = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white',
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg',
        'transform transition-all duration-300 ease-in-out',
        'animate-in slide-in-from-top-2',
        colors[type]
      )}
    >
      <div className="animate-in spin-in-90">{icons[type]}</div>
      <span className="font-medium">{message}</span>
      {onClose && (
        <button
          className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
          onClick={onClose}
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default MicroInteraction;
