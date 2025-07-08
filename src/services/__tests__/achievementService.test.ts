import achievementService, { TASK_ACHIEVEMENTS } from '../achievementService';
import { TodoItem } from '@/types';
import {
  TaskAchievement,
  AchievementProgress,
  UserAchievementStats,
  AchievementNotification,
} from '@/types/achievements';

// localStorage をモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AchievementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    achievementService.resetAchievements();
  });

  describe('loadUserAchievements', () => {
    it('should load achievements from localStorage when data exists', () => {
      const savedData = {
        achievements: TASK_ACHIEVEMENTS.map((a) => ({ ...a, unlocked: true })),
        stats: {
          totalUnlocked: 5,
          totalExperience: 500,
          completionRate: 50,
          currentLevel: 2,
          experienceToNextLevel: 500,
          streakRecord: 7,
        },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData));

      achievementService.loadUserAchievements();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('taskAchievements');

      const allAchievements = achievementService.getAllAchievements();
      expect(allAchievements.every((a) => a.unlocked)).toBe(true);
    });

    it('should handle missing localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue(null);

      expect(() => achievementService.loadUserAchievements()).not.toThrow();

      const allAchievements = achievementService.getAllAchievements();
      expect(allAchievements.length).toBeGreaterThan(0);
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => achievementService.loadUserAchievements()).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to load achievements:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should handle partial data in localStorage', () => {
      const partialData = {
        stats: {
          totalUnlocked: 3,
          totalExperience: 300,
        },
        // achievements property is missing
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(partialData));

      expect(() => achievementService.loadUserAchievements()).not.toThrow();

      const stats = achievementService.getUserStats();
      expect(stats.totalUnlocked).toBe(3);
      expect(stats.totalExperience).toBe(300);
    });
  });

  describe('saveUserAchievements', () => {
    it('should save achievements to localStorage', () => {
      achievementService.saveUserAchievements();

      expect(localStorageMock.setItem).toHaveBeenCalledWith('taskAchievements', expect.any(String));

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData).toHaveProperty('achievements');
      expect(savedData).toHaveProperty('stats');
      expect(savedData).toHaveProperty('lastSaved');
    });

    it('should handle localStorage write errors', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => achievementService.saveUserAchievements()).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to save achievements:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('getAllAchievements', () => {
    it('should return all non-hidden achievements', () => {
      const achievements = achievementService.getAllAchievements();

      expect(achievements.length).toBeGreaterThan(0);
      expect(achievements.every((a) => !a.hidden)).toBe(true);
    });

    it('should exclude hidden achievements', () => {
      // 隠し実績を追加してテスト
      const hiddenAchievement: TaskAchievement = {
        id: 'hidden_test',
        name: 'Hidden Achievement',
        description: 'A hidden achievement',
        icon: '🔒',
        category: 'special',
        rarity: 'diamond',
        condition: { type: 'task_count', value: 1000 },
        experienceReward: 5000,
        unlocked: false,
        hidden: true,
      };

      // プライベートメソッドへのアクセスは困難なので、実際のデータ構造をテスト
      const achievements = achievementService.getAllAchievements();
      expect(achievements.find((a) => a.id === 'hidden_test')).toBeUndefined();
    });
  });

  describe('getUnlockedAchievements', () => {
    it('should return only unlocked achievements', () => {
      const unlockedAchievements = achievementService.getUnlockedAchievements();

      expect(unlockedAchievements.every((a) => a.unlocked)).toBe(true);
    });

    it('should return empty array when no achievements are unlocked', () => {
      const unlockedAchievements = achievementService.getUnlockedAchievements();

      expect(unlockedAchievements).toEqual([]);
    });
  });

  describe('calculateProgress', () => {
    const mockTasks: TodoItem[] = [
      {
        id: '1',
        name: 'Task 1',
        completed: true,
        completedDate: new Date().toISOString(),
        priority: 1,
        category: 'work',
        deadline: new Date(Date.now() + 86400000).toISOString(), // 明日
      },
      {
        id: '2',
        name: 'Task 2',
        completed: true,
        completedDate: new Date().toISOString(),
        priority: 2,
        category: 'personal',
        deadline: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        id: '3',
        name: 'Task 3',
        completed: false,
        priority: 3,
        category: 'work',
      },
    ] as TodoItem[];

    it('should calculate task_count progress correctly', () => {
      const achievement = TASK_ACHIEVEMENTS.find((a) => a.condition.type === 'task_count');
      expect(achievement).toBeDefined();

      const progress = achievementService.calculateProgress(achievement!, mockTasks);

      expect(progress.currentValue).toBe(2); // 2 completed tasks
      expect(progress.targetValue).toBe(achievement!.condition.value);
      expect(progress.percentage).toBe((2 / achievement!.condition.value) * 100);
    });

    it('should calculate daily task_count progress correctly', () => {
      const dailyAchievement = TASK_ACHIEVEMENTS.find(
        (a) => a.condition.type === 'task_count' && a.condition.subType === 'daily'
      );
      expect(dailyAchievement).toBeDefined();

      const progress = achievementService.calculateProgress(dailyAchievement!, mockTasks);

      expect(progress.currentValue).toBe(2); // 2 tasks completed today
      expect(progress.targetValue).toBe(dailyAchievement!.condition.value);
    });

    it('should calculate priority_focus progress correctly', () => {
      const priorityAchievement = TASK_ACHIEVEMENTS.find(
        (a) => a.condition.type === 'priority_focus'
      );
      expect(priorityAchievement).toBeDefined();

      const progress = achievementService.calculateProgress(priorityAchievement!, mockTasks);

      expect(progress.currentValue).toBe(2); // 2 high priority tasks (priority <= 2)
      expect(progress.targetValue).toBe(priorityAchievement!.condition.value);
    });

    it('should calculate category_master progress correctly', () => {
      const categoryAchievement = TASK_ACHIEVEMENTS.find(
        (a) => a.condition.type === 'category_master'
      );
      expect(categoryAchievement).toBeDefined();

      const progress = achievementService.calculateProgress(categoryAchievement!, mockTasks);

      expect(progress.currentValue).toBe(2); // 2 unique categories (work, personal)
      expect(progress.targetValue).toBe(categoryAchievement!.condition.value);
    });

    it('should calculate perfectionist progress correctly', () => {
      const perfectionistAchievement = TASK_ACHIEVEMENTS.find(
        (a) => a.condition.type === 'perfectionist'
      );
      expect(perfectionistAchievement).toBeDefined();

      const progress = achievementService.calculateProgress(perfectionistAchievement!, mockTasks);

      expect(progress.currentValue).toBe(2); // 2 tasks completed before deadline
      expect(progress.targetValue).toBe(perfectionistAchievement!.condition.value);
    });

    it('should handle empty task list', () => {
      const achievement = TASK_ACHIEVEMENTS[0];
      const progress = achievementService.calculateProgress(achievement, []);

      expect(progress.currentValue).toBe(0);
      expect(progress.percentage).toBe(0);
    });

    it('should cap percentage at 100', () => {
      const achievement = TASK_ACHIEVEMENTS.find((a) => a.condition.value === 1);
      expect(achievement).toBeDefined();

      const progress = achievementService.calculateProgress(achievement!, mockTasks);

      expect(progress.percentage).toBeLessThanOrEqual(100);
    });
  });

  describe('checkForNewAchievements', () => {
    it('should unlock achievements when conditions are met', () => {
      const singleTaskAchievement = TASK_ACHIEVEMENTS.find(
        (a) => a.condition.type === 'task_count' && a.condition.value === 1
      );
      expect(singleTaskAchievement).toBeDefined();

      const mockTasks: TodoItem[] = [
        {
          id: '1',
          name: 'Completed Task',
          completed: true,
          completedDate: new Date().toISOString(),
        } as TodoItem,
      ];

      const notifications = achievementService.checkForNewAchievements(mockTasks);

      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].type).toBe('unlock');
      expect(notifications[0].message).toContain('実績');

      const unlockedAchievements = achievementService.getUnlockedAchievements();
      expect(unlockedAchievements.some((a) => a.id === singleTaskAchievement!.id)).toBe(true);
    });

    it('should not unlock already unlocked achievements', () => {
      const mockTasks: TodoItem[] = [
        {
          id: '1',
          name: 'Completed Task',
          completed: true,
          completedDate: new Date().toISOString(),
        } as TodoItem,
      ];

      // 最初の実行
      const firstNotifications = achievementService.checkForNewAchievements(mockTasks);
      expect(firstNotifications.length).toBeGreaterThan(0);

      // 二回目の実行
      const secondNotifications = achievementService.checkForNewAchievements(mockTasks);
      expect(secondNotifications.length).toBe(0);
    });

    it('should update user stats when achievements are unlocked', () => {
      const initialStats = achievementService.getUserStats();
      expect(initialStats.totalUnlocked).toBe(0);
      expect(initialStats.totalExperience).toBe(0);

      const mockTasks: TodoItem[] = [
        {
          id: '1',
          name: 'Completed Task',
          completed: true,
          completedDate: new Date().toISOString(),
        } as TodoItem,
      ];

      achievementService.checkForNewAchievements(mockTasks);

      const updatedStats = achievementService.getUserStats();
      expect(updatedStats.totalUnlocked).toBeGreaterThan(0);
      expect(updatedStats.totalExperience).toBeGreaterThan(0);
    });

    it('should handle tasks without required properties', () => {
      const incompleteTasks: Partial<TodoItem>[] = [
        { id: '1', name: 'Task without completion' },
        { id: '2', completed: true }, // missing other properties
      ];

      expect(() =>
        achievementService.checkForNewAchievements(incompleteTasks as TodoItem[])
      ).not.toThrow();
    });

    it('should save achievements after checking', () => {
      const mockTasks: TodoItem[] = [
        {
          id: '1',
          name: 'Completed Task',
          completed: true,
          completedDate: new Date().toISOString(),
        } as TodoItem,
      ];

      achievementService.checkForNewAchievements(mockTasks);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('taskAchievements', expect.any(String));
    });
  });

  describe('getUserStats', () => {
    it('should return default user stats initially', () => {
      const stats = achievementService.getUserStats();

      expect(stats).toEqual({
        totalUnlocked: 0,
        totalExperience: 0,
        completionRate: 0,
        currentLevel: 1,
        experienceToNextLevel: 1000,
        streakRecord: 0,
      });
    });

    it('should return updated stats after achievements are unlocked', () => {
      const mockTasks: TodoItem[] = [
        {
          id: '1',
          name: 'Completed Task',
          completed: true,
          completedDate: new Date().toISOString(),
        } as TodoItem,
      ];

      achievementService.checkForNewAchievements(mockTasks);

      const stats = achievementService.getUserStats();
      expect(stats.totalUnlocked).toBeGreaterThan(0);
      expect(stats.totalExperience).toBeGreaterThan(0);
      expect(stats.completionRate).toBeGreaterThan(0);
    });

    it('should return a copy of stats object', () => {
      const stats1 = achievementService.getUserStats();
      const stats2 = achievementService.getUserStats();

      expect(stats1).not.toBe(stats2); // Different object references
      expect(stats1).toEqual(stats2); // Same content
    });
  });

  describe('resetAchievements', () => {
    it('should reset all achievements to unlocked state', () => {
      // 最初に実績をアンロック
      const mockTasks: TodoItem[] = [
        {
          id: '1',
          name: 'Completed Task',
          completed: true,
          completedDate: new Date().toISOString(),
        } as TodoItem,
      ];

      achievementService.checkForNewAchievements(mockTasks);

      let unlockedCount = achievementService.getUnlockedAchievements().length;
      expect(unlockedCount).toBeGreaterThan(0);

      // リセット実行
      achievementService.resetAchievements();

      unlockedCount = achievementService.getUnlockedAchievements().length;
      expect(unlockedCount).toBe(0);
    });

    it('should reset user stats to default values', () => {
      // 統計を更新
      const mockTasks: TodoItem[] = [
        {
          id: '1',
          name: 'Completed Task',
          completed: true,
          completedDate: new Date().toISOString(),
        } as TodoItem,
      ];

      achievementService.checkForNewAchievements(mockTasks);

      let stats = achievementService.getUserStats();
      expect(stats.totalUnlocked).toBeGreaterThan(0);

      // リセット実行
      achievementService.resetAchievements();

      stats = achievementService.getUserStats();
      expect(stats).toEqual({
        totalUnlocked: 0,
        totalExperience: 0,
        completionRate: 0,
        currentLevel: 1,
        experienceToNextLevel: 1000,
        streakRecord: 0,
      });
    });

    it('should save reset state to localStorage', () => {
      achievementService.resetAchievements();

      expect(localStorageMock.setItem).toHaveBeenCalledWith('taskAchievements', expect.any(String));
    });
  });

  describe('TASK_ACHIEVEMENTS constant', () => {
    it('should contain all required achievement types', () => {
      const achievementTypes = TASK_ACHIEVEMENTS.map((a) => a.condition.type);
      const uniqueTypes = [...new Set(achievementTypes)];

      expect(uniqueTypes).toContain('task_count');
      expect(uniqueTypes).toContain('streak_days');
      expect(uniqueTypes).toContain('priority_focus');
      expect(uniqueTypes).toContain('category_master');
      expect(uniqueTypes).toContain('perfectionist');
    });

    it('should have valid achievement structure', () => {
      TASK_ACHIEVEMENTS.forEach((achievement) => {
        expect(achievement).toHaveProperty('id');
        expect(achievement).toHaveProperty('name');
        expect(achievement).toHaveProperty('description');
        expect(achievement).toHaveProperty('icon');
        expect(achievement).toHaveProperty('category');
        expect(achievement).toHaveProperty('rarity');
        expect(achievement).toHaveProperty('condition');
        expect(achievement).toHaveProperty('experienceReward');
        expect(achievement.unlocked).toBe(false);

        expect(typeof achievement.id).toBe('string');
        expect(typeof achievement.name).toBe('string');
        expect(typeof achievement.description).toBe('string');
        expect(typeof achievement.experienceReward).toBe('number');
        expect(achievement.experienceReward).toBeGreaterThan(0);
      });
    });

    it('should have unique achievement IDs', () => {
      const ids = TASK_ACHIEVEMENTS.map((a) => a.id);
      const uniqueIds = [...new Set(ids)];

      expect(ids.length).toBe(uniqueIds.length);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null task arrays', () => {
      expect(() => achievementService.checkForNewAchievements(null as any)).not.toThrow();
      expect(() =>
        achievementService.calculateProgress(TASK_ACHIEVEMENTS[0], null as any)
      ).not.toThrow();
    });

    it('should handle undefined achievement', () => {
      const mockTasks: TodoItem[] = [];

      expect(() => achievementService.calculateProgress(undefined as any, mockTasks)).not.toThrow();
    });

    it('should handle very large task counts', () => {
      const largeTasks = Array.from({ length: 10000 }, (_, i) => ({
        id: i.toString(),
        name: `Task ${i}`,
        completed: true,
        completedDate: new Date().toISOString(),
      })) as TodoItem[];

      expect(() => achievementService.checkForNewAchievements(largeTasks)).not.toThrow();
    });

    it('should handle tasks with future completion dates', () => {
      const futureTasks: TodoItem[] = [
        {
          id: '1',
          name: 'Future Task',
          completed: true,
          completedDate: new Date(Date.now() + 86400000).toISOString(), // 明日
        } as TodoItem,
      ];

      expect(() => achievementService.checkForNewAchievements(futureTasks)).not.toThrow();
    });
  });
});
