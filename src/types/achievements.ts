// タスク管理用実績システム
export interface TaskAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category:
    | 'completion'
    | 'streak'
    | 'productivity'
    | 'organization'
    | 'time_management'
    | 'special';
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  condition: AchievementCondition;
  experienceReward: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number; // 0-100
  hidden?: boolean; // 隠し実績
}

export interface AchievementCondition {
  type:
    | 'task_count'
    | 'streak_days'
    | 'category_master'
    | 'priority_focus'
    | 'speed_demon'
    | 'perfectionist'
    | 'time_saver'
    | 'special_date';
  value: number;
  subType?: string;
  metadata?: Record<string, any>;
}

export interface AchievementProgress {
  achievementId: string;
  currentValue: number;
  targetValue: number;
  percentage: number;
}

export interface UserAchievementStats {
  totalUnlocked: number;
  totalExperience: number;
  completionRate: number;
  lastUnlockedAt?: Date;
  currentLevel: number;
  experienceToNextLevel: number;
  favoriteCategory?: string;
  streakRecord: number;
}

export interface AchievementNotification {
  id: string;
  achievementId: string;
  type: 'unlock' | 'progress';
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface AchievementBadge {
  achievementId: string;
  displayName: string;
  icon: string;
  rarity: string;
  showInProfile: boolean;
}
