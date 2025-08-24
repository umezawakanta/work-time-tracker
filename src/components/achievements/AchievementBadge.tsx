import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TaskAchievement } from '@/types/achievements';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  achievement: TaskAchievement;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
}

const rarityColors = {
  bronze: 'bg-amber-600 text-white',
  silver: 'bg-gray-400 text-gray-900',
  gold: 'bg-yellow-500 text-yellow-900',
  platinum: 'bg-purple-500 text-white',
  diamond: 'bg-blue-600 text-white',
};

const rarityGlow = {
  bronze: 'shadow-amber-200',
  silver: 'shadow-gray-300',
  gold: 'shadow-yellow-300',
  platinum: 'shadow-purple-300',
  diamond: 'shadow-blue-300',
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'md',
  showProgress = false,
  className,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <Badge
        className={cn(
          rarityColors[achievement.rarity],
          sizeClasses[size],
          'font-medium shadow-lg',
          achievement.unlocked && rarityGlow[achievement.rarity],
          !achievement.unlocked && 'opacity-50 grayscale'
        )}
      >
        <span className="mr-1">{achievement.icon}</span>
        {achievement.name}
      </Badge>

      {showProgress && !achievement.unlocked && achievement.progress !== undefined && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <div className="w-16 h-1 bg-gray-200 rounded">
            <div
              className="h-full bg-blue-500 rounded transition-all duration-300"
              style={{ width: `${achievement.progress}%` }}
            />
          </div>
          <span>{Math.round(achievement.progress || 0)}%</span>
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;
