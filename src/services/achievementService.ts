import { TodoItem } from '@/types';
import {
  TaskAchievement,
  AchievementProgress,
  UserAchievementStats,
  AchievementNotification,
} from '@/types/achievements';

// 定義済み実績データ
export const TASK_ACHIEVEMENTS: TaskAchievement[] = [
  // 完了数系実績
  {
    id: 'first_task',
    name: '第一歩',
    description: '初めてのタスクを完了しました',
    icon: '🎯',
    category: 'completion',
    rarity: 'bronze',
    condition: { type: 'task_count', value: 1 },
    experienceReward: 50,
    unlocked: false,
  },
  {
    id: 'task_warrior',
    name: 'タスクウォーリア',
    description: '10個のタスクを完了しました',
    icon: '⚔️',
    category: 'completion',
    rarity: 'bronze',
    condition: { type: 'task_count', value: 10 },
    experienceReward: 100,
    unlocked: false,
  },
  {
    id: 'task_master',
    name: 'タスクマスター',
    description: '100個のタスクを完了しました',
    icon: '🏆',
    category: 'completion',
    rarity: 'gold',
    condition: { type: 'task_count', value: 100 },
    experienceReward: 1000,
    unlocked: false,
  },
  {
    id: 'task_legend',
    name: 'タスクレジェンド',
    description: '1000個のタスクを完了しました',
    icon: '👑',
    category: 'completion',
    rarity: 'diamond',
    condition: { type: 'task_count', value: 1000 },
    experienceReward: 10000,
    unlocked: false,
  },

  // 連続達成系実績
  {
    id: 'streak_starter',
    name: '継続の始まり',
    description: '3日連続でタスクを完了しました',
    icon: '🔥',
    category: 'streak',
    rarity: 'bronze',
    condition: { type: 'streak_days', value: 3 },
    experienceReward: 150,
    unlocked: false,
  },
  {
    id: 'streak_keeper',
    name: '継続の力',
    description: '7日連続でタスクを完了しました',
    icon: '💪',
    category: 'streak',
    rarity: 'silver',
    condition: { type: 'streak_days', value: 7 },
    experienceReward: 300,
    unlocked: false,
  },
  {
    id: 'streak_master',
    name: '不屈の意志',
    description: '30日連続でタスクを完了しました',
    icon: '🌟',
    category: 'streak',
    rarity: 'gold',
    condition: { type: 'streak_days', value: 30 },
    experienceReward: 1500,
    unlocked: false,
  },

  // 生産性系実績
  {
    id: 'speed_runner',
    name: 'スピードランナー',
    description: '1日で10個のタスクを完了しました',
    icon: '⚡',
    category: 'productivity',
    rarity: 'silver',
    condition: { type: 'task_count', value: 10, subType: 'daily' },
    experienceReward: 200,
    unlocked: false,
  },
  {
    id: 'priority_master',
    name: '優先度マスター',
    description: '高優先度タスクを50個完了しました',
    icon: '🎖️',
    category: 'productivity',
    rarity: 'gold',
    condition: { type: 'priority_focus', value: 50, subType: 'high' },
    experienceReward: 500,
    unlocked: false,
  },

  // 整理整頓系実績
  {
    id: 'category_organizer',
    name: 'カテゴリーオーガナイザー',
    description: '5つの異なるカテゴリでタスクを完了しました',
    icon: '📚',
    category: 'organization',
    rarity: 'silver',
    condition: { type: 'category_master', value: 5 },
    experienceReward: 300,
    unlocked: false,
  },
  {
    id: 'perfectionist',
    name: '完璧主義者',
    description: '期限内に100個のタスクを完了しました',
    icon: '💎',
    category: 'time_management',
    rarity: 'platinum',
    condition: { type: 'perfectionist', value: 100 },
    experienceReward: 2000,
    unlocked: false,
  },

  // 特別な実績
  {
    id: 'early_bird',
    name: '早起きの鳥',
    description: '午前6時前にタスクを完了しました',
    icon: '🐦',
    category: 'special',
    rarity: 'silver',
    condition: { type: 'special_date', value: 1, subType: 'early_morning' },
    experienceReward: 250,
    unlocked: false,
  },
  {
    id: 'night_owl',
    name: '夜更かし',
    description: '午後11時以降にタスクを完了しました',
    icon: '🦉',
    category: 'special',
    rarity: 'silver',
    condition: { type: 'special_date', value: 1, subType: 'late_night' },
    experienceReward: 250,
    unlocked: false,
  },
];

class AchievementService {
  private achievements: TaskAchievement[] = [...TASK_ACHIEVEMENTS];
  private userStats: UserAchievementStats = {
    totalUnlocked: 0,
    totalExperience: 0,
    completionRate: 0,
    currentLevel: 1,
    experienceToNextLevel: 1000,
    streakRecord: 0,
  };

  // ローカルストレージからユーザーの実績データを読み込み
  loadUserAchievements(): void {
    try {
      const saved = localStorage.getItem('taskAchievements');
      if (saved) {
        const data = JSON.parse(saved);
        this.achievements = data.achievements || [...TASK_ACHIEVEMENTS];
        this.userStats = { ...this.userStats, ...data.stats };
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
  }

  // ユーザーの実績データを保存
  saveUserAchievements(): void {
    try {
      const data = {
        achievements: this.achievements,
        stats: this.userStats,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem('taskAchievements', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save achievements:', error);
    }
  }

  // 全実績を取得
  getAllAchievements(): TaskAchievement[] {
    return this.achievements.filter((a) => !a.hidden);
  }

  // アンロック済み実績を取得
  getUnlockedAchievements(): TaskAchievement[] {
    return this.achievements.filter((a) => a.unlocked);
  }

  // 実績進捗を計算
  calculateProgress(achievement: TaskAchievement, tasks: TodoItem[]): AchievementProgress {
    let currentValue = 0;
    const condition = achievement.condition;

    switch (condition.type) {
      case 'task_count':
        if (condition.subType === 'daily') {
          const today = new Date().toDateString();
          currentValue = tasks.filter(
            (task) =>
              task.completed &&
              task.completedDate &&
              new Date(task.completedDate).toDateString() === today
          ).length;
        } else {
          currentValue = tasks.filter((task) => task.completed).length;
        }
        break;

      case 'streak_days':
        currentValue = this.calculateCurrentStreak(tasks);
        break;

      case 'priority_focus':
        if (condition.subType === 'high') {
          currentValue = tasks.filter((task) => task.completed && task.priority <= 2).length;
        }
        break;

      case 'category_master': {
        const categories = new Set(
          tasks.filter((task) => task.completed && task.category).map((task) => task.category)
        );
        currentValue = categories.size;
        break;
      }

      case 'perfectionist':
        currentValue = tasks.filter(
          (task) =>
            task.completed &&
            task.deadline &&
            task.completedDate &&
            new Date(task.completedDate) <= new Date(task.deadline)
        ).length;
        break;
    }

    const percentage = Math.min((currentValue / condition.value) * 100, 100);

    return {
      achievementId: achievement.id,
      currentValue,
      targetValue: condition.value,
      percentage,
    };
  }

  // 連続達成日数を計算
  private calculateCurrentStreak(tasks: TodoItem[]): number {
    const completedTasks = tasks
      .filter((task) => task.completed && task.completedDate)
      .sort((a, b) => new Date(b.completedDate!).getTime() - new Date(a.completedDate!).getTime());

    if (completedTasks.length === 0) return 0;

    let streak = 0;
    // eslint-disable-next-line prefer-const
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      // 最大365日まで遡る
      const dateStr = currentDate.toDateString();
      const hasTaskOnDate = completedTasks.some(
        (task) => new Date(task.completedDate!).toDateString() === dateStr
      );

      if (hasTaskOnDate) {
        streak++;
      } else if (streak > 0) {
        break; // 連続が途切れたら終了
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }

  // 新しい実績をチェック・アンロック
  checkForNewAchievements(tasks: TodoItem[]): AchievementNotification[] {
    const notifications: AchievementNotification[] = [];

    for (const achievement of this.achievements) {
      if (achievement.unlocked) continue;

      const progress = this.calculateProgress(achievement, tasks);

      if (progress.percentage >= 100) {
        // 実績をアンロック
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();

        // 経験値を追加
        this.userStats.totalExperience += achievement.experienceReward;
        this.userStats.totalUnlocked++;

        // レベルアップチェック
        this.checkLevelUp();

        // 通知を作成
        notifications.push({
          id: `unlock_${achievement.id}_${Date.now()}`,
          achievementId: achievement.id,
          type: 'unlock',
          message: `実績「${achievement.name}」を獲得しました！`,
          timestamp: new Date(),
          read: false,
        });
      }
    }

    // 統計を更新
    this.updateStats(tasks);
    this.saveUserAchievements();

    return notifications;
  }

  // レベルアップチェック
  private checkLevelUp(): boolean {
    const newLevel = Math.floor(this.userStats.totalExperience / 1000) + 1;
    const leveledUp = newLevel > this.userStats.currentLevel;

    if (leveledUp) {
      this.userStats.currentLevel = newLevel;
    }

    this.userStats.experienceToNextLevel = newLevel * 1000 - this.userStats.totalExperience;

    return leveledUp;
  }

  // 統計を更新
  private updateStats(tasks: TodoItem[]): void {
    const completedTasks = tasks.filter((task) => task.completed);
    const unlockedCount = this.achievements.filter((a) => a.unlocked).length;

    this.userStats.completionRate = (unlockedCount / this.achievements.length) * 100;

    this.userStats.streakRecord = Math.max(
      this.userStats.streakRecord,
      this.calculateCurrentStreak(tasks)
    );

    // お気に入りカテゴリを計算
    const categoryCounts: Record<string, number> = {};
    completedTasks.forEach((task) => {
      if (task.category) {
        categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1;
      }
    });

    this.userStats.favoriteCategory = Object.entries(categoryCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0];
  }

  // ユーザー統計を取得
  getUserStats(): UserAchievementStats {
    return { ...this.userStats };
  }

  // 実績をリセット（開発/テスト用）
  resetAchievements(): void {
    this.achievements = TASK_ACHIEVEMENTS.map((a) => ({
      ...a,
      unlocked: false,
      unlockedAt: undefined,
    }));
    this.userStats = {
      totalUnlocked: 0,
      totalExperience: 0,
      completionRate: 0,
      currentLevel: 1,
      experienceToNextLevel: 1000,
      streakRecord: 0,
    };
    this.saveUserAchievements();
  }
}

export default new AchievementService();
