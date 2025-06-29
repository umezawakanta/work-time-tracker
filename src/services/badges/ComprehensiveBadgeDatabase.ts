import { DevelopmentBadge } from '@/types/development-badges';

export interface ComprehensiveBadgeCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  badges: DevelopmentBadge[];
}

// 基本的なバッジ作成ヘルパー関数
export const createBadge = (
  id: string,
  name: string,
  description: string,
  category: any,
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary',
  icon: string,
  estimatedHours: number,
  progress: number = 0,
  prerequisites: string[] = [],
  tags: string[] = []
): DevelopmentBadge => ({
  id,
  name,
  description,
  category,
  difficulty,
  icon,
  requirements: [
    {
      type: 'feature_complete',
      target: 100,
      current: progress,
      description: `${name}の習得`,
      progress,
      isCompleted: progress >= 100,
    },
  ],
  isUnlocked: true,
  progress,
  prerequisites,
  isCompleted: progress >= 100,
  points:
    difficulty === 'bronze'
      ? 10
      : difficulty === 'silver'
        ? 25
        : difficulty === 'gold'
          ? 50
          : difficulty === 'platinum'
            ? 100
            : 200,
  tags,
});
