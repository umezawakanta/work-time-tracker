import {
  calculateBadgeConfidence,
  calculateUserProgress,
  estimateCompletionTime,
  calculateTrendScore,
  calculateDifficultyScore,
  calculatePriorityScore,
  calculateCategoryProgress,
} from '../badgeConfidenceCalculator';

describe('badgeConfidenceCalculator', () => {
  const mockUser = {
    id: 'test-user',
    level: 5,
    experience: 1000,
    completedBadges: 10,
    streak: 7,
    skillLevels: {
      coding: 4,
      design: 3,
      management: 2,
    },
  };

  const mockBadge = {
    id: 'test-badge',
    title: 'Test Badge',
    description: 'A test badge',
    difficulty: 3,
    estimatedHours: 10,
    category: 'coding',
    requirements: {
      level: 3,
      experience: 500,
      prerequisites: ['basic-badge'],
    },
  };

  describe('calculateBadgeConfidence', () => {
    it('適切な条件でバッジ信頼度を計算する', () => {
      const result = calculateBadgeConfidence(mockUser, mockBadge);

      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it('レベルが不足している場合の信頼度計算', () => {
      const lowLevelUser = { ...mockUser, level: 1 };
      const result = calculateBadgeConfidence(lowLevelUser, mockBadge);

      expect(result).toBeLessThan(50);
    });

    it('経験値が不足している場合の信頼度計算', () => {
      const lowExpUser = { ...mockUser, experience: 100 };
      const result = calculateBadgeConfidence(lowExpUser, mockBadge);

      expect(result).toBeLessThan(70);
    });

    it('高レベルユーザーの高信頼度計算', () => {
      const highLevelUser = {
        ...mockUser,
        level: 10,
        experience: 5000,
        skillLevels: { ...mockUser.skillLevels, coding: 8 },
      };
      const result = calculateBadgeConfidence(highLevelUser, mockBadge);

      expect(result).toBeGreaterThan(80);
    });

    it('null/undefinedパラメータのハンドリング', () => {
      expect(() => calculateBadgeConfidence(null as any, mockBadge)).not.toThrow();
      expect(() => calculateBadgeConfidence(mockUser, null as any)).not.toThrow();
    });
  });

  describe('calculateUserProgress', () => {
    it('ユーザー進捗を正しく計算する', () => {
      const result = calculateUserProgress(mockUser, [mockBadge]);

      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('overall');
      expect(result).toHaveProperty('byCategory');
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(100);
    });

    it('空のバッジリストでの進捗計算', () => {
      const result = calculateUserProgress(mockUser, []);

      expect(result.overall).toBe(0);
      expect(Object.keys(result.byCategory)).toHaveLength(0);
    });

    it('複数のバッジカテゴリでの進捗計算', () => {
      const badges = [
        { ...mockBadge, category: 'coding' },
        { ...mockBadge, category: 'design', id: 'design-badge' },
        { ...mockBadge, category: 'management', id: 'mgmt-badge' },
      ];

      const result = calculateUserProgress(mockUser, badges);

      expect(result.byCategory).toHaveProperty('coding');
      expect(result.byCategory).toHaveProperty('design');
      expect(result.byCategory).toHaveProperty('management');
    });

    it('nullユーザーでの安全な処理', () => {
      expect(() => calculateUserProgress(null as any, [mockBadge])).not.toThrow();
    });
  });

  describe('estimateCompletionTime', () => {
    it('完了時間を正しく推定する', () => {
      const result = estimateCompletionTime(mockUser, mockBadge);

      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });

    it('高スキルユーザーの短い完了時間', () => {
      const skilledUser = {
        ...mockUser,
        skillLevels: { ...mockUser.skillLevels, coding: 8 },
      };

      const normalTime = estimateCompletionTime(mockUser, mockBadge);
      const skilledTime = estimateCompletionTime(skilledUser, mockBadge);

      expect(skilledTime).toBeLessThan(normalTime);
    });

    it('低スキルユーザーの長い完了時間', () => {
      const beginnerUser = {
        ...mockUser,
        level: 1,
        skillLevels: { ...mockUser.skillLevels, coding: 1 },
      };

      const normalTime = estimateCompletionTime(mockUser, mockBadge);
      const beginnerTime = estimateCompletionTime(beginnerUser, mockBadge);

      expect(beginnerTime).toBeGreaterThan(normalTime);
    });

    it('推定時間のないバッジでのデフォルト計算', () => {
      const badgeWithoutTime = { ...mockBadge, estimatedHours: undefined };
      const result = estimateCompletionTime(mockUser, badgeWithoutTime);

      expect(result).toBeGreaterThan(0);
    });
  });

  describe('calculateTrendScore', () => {
    it('アクティビティトレンドスコアを計算する', () => {
      const activities = [
        { date: '2024-01-01', type: 'badge_earned', value: 1 },
        { date: '2024-01-02', type: 'task_completed', value: 3 },
        { date: '2024-01-03', type: 'badge_earned', value: 1 },
      ];

      const result = calculateTrendScore(activities);

      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it('空のアクティビティでのトレンドスコア', () => {
      const result = calculateTrendScore([]);

      expect(result).toBe(0);
    });

    it('単一アクティビティでのトレンドスコア', () => {
      const activities = [{ date: '2024-01-01', type: 'badge_earned', value: 1 }];

      const result = calculateTrendScore(activities);

      expect(result).toBeGreaterThan(0);
    });

    it('負のトレンドでの低スコア', () => {
      const activities = [
        { date: '2024-01-01', type: 'badge_earned', value: 5 },
        { date: '2024-01-02', type: 'badge_earned', value: 3 },
        { date: '2024-01-03', type: 'badge_earned', value: 1 },
      ];

      const result = calculateTrendScore(activities);

      expect(result).toBeLessThan(50);
    });
  });

  describe('calculateDifficultyScore', () => {
    it('難易度スコアを正しく計算する', () => {
      const result = calculateDifficultyScore(mockBadge, mockUser);

      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it('低難易度バッジでの高スコア', () => {
      const easyBadge = { ...mockBadge, difficulty: 1 };
      const result = calculateDifficultyScore(easyBadge, mockUser);

      expect(result).toBeGreaterThan(70);
    });

    it('高難易度バッジでの低スコア', () => {
      const hardBadge = { ...mockBadge, difficulty: 5 };
      const beginnerUser = { ...mockUser, level: 1 };
      const result = calculateDifficultyScore(hardBadge, beginnerUser);

      expect(result).toBeLessThan(50);
    });

    it('スキルレベルがマッチする場合', () => {
      const codingBadge = { ...mockBadge, category: 'coding' };
      const skilledUser = {
        ...mockUser,
        skillLevels: { ...mockUser.skillLevels, coding: 5 },
      };

      const result = calculateDifficultyScore(codingBadge, skilledUser);

      expect(result).toBeGreaterThan(60);
    });
  });

  describe('calculatePriorityScore', () => {
    it('優先度スコアを計算する', () => {
      const result = calculatePriorityScore(mockBadge, mockUser);

      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it('緊急度の高いバッジでの高スコア', () => {
      const urgentBadge = {
        ...mockBadge,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1日後
      };
      const result = calculatePriorityScore(urgentBadge, mockUser);

      expect(result).toBeGreaterThan(70);
    });

    it('デッドラインのないバッジでの標準スコア', () => {
      const result = calculatePriorityScore(mockBadge, mockUser);

      expect(result).toBeGreaterThanOrEqual(30);
      expect(result).toBeLessThanOrEqual(70);
    });

    it('依存関係を満たしていない場合の低スコア', () => {
      const dependentBadge = {
        ...mockBadge,
        requirements: {
          ...mockBadge.requirements,
          prerequisites: ['missing-prerequisite'],
        },
      };

      const result = calculatePriorityScore(dependentBadge, mockUser);

      expect(result).toBeLessThan(40);
    });
  });

  describe('calculateCategoryProgress', () => {
    it('カテゴリ別進捗を計算する', () => {
      const badges = [
        { ...mockBadge, category: 'coding' },
        { ...mockBadge, category: 'design', id: 'design-badge' },
      ];

      const result = calculateCategoryProgress(mockUser, badges, 'coding');

      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('completed');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('percentage');
      expect(result.percentage).toBeGreaterThanOrEqual(0);
      expect(result.percentage).toBeLessThanOrEqual(100);
    });

    it('該当カテゴリのバッジがない場合', () => {
      const badges = [{ ...mockBadge, category: 'other' }];

      const result = calculateCategoryProgress(mockUser, badges, 'coding');

      expect(result.completed).toBe(0);
      expect(result.total).toBe(0);
      expect(result.percentage).toBe(0);
    });

    it('全てのバッジが完了済みの場合', () => {
      const completedUser = {
        ...mockUser,
        completedBadges: [mockBadge.id],
      };

      const result = calculateCategoryProgress(completedUser, [mockBadge], 'coding');

      expect(result.percentage).toBe(100);
    });

    it('存在しないカテゴリでの処理', () => {
      const result = calculateCategoryProgress(mockUser, [mockBadge], 'nonexistent');

      expect(result.completed).toBe(0);
      expect(result.total).toBe(0);
      expect(result.percentage).toBe(0);
    });
  });

  describe('エラーハンドリング', () => {
    it('不正なデータでも例外を投げない', () => {
      expect(() => calculateBadgeConfidence({} as any, {} as any)).not.toThrow();
      expect(() => calculateUserProgress({} as any, [])).not.toThrow();
      expect(() => estimateCompletionTime({} as any, {} as any)).not.toThrow();
      expect(() => calculateTrendScore(null as any)).not.toThrow();
      expect(() => calculateDifficultyScore({} as any, {} as any)).not.toThrow();
      expect(() => calculatePriorityScore({} as any, {} as any)).not.toThrow();
      expect(() => calculateCategoryProgress({} as any, [], 'test')).not.toThrow();
    });
  });
});
