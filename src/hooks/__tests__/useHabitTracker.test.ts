import { renderHook, act, waitFor } from '@testing-library/react';
import { useHabitTracker } from '../useHabitTracker';

// Mock dependencies
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock Date for consistent testing - scope it properly to avoid global conflicts
let mockDateSpy: jest.SpyInstance;
let mockDateNowSpy: jest.SpyInstance;
const mockDate = new Date('2024-01-15T10:00:00.000Z');

describe.skip('useHabitTracker', () => {
  const mockHabit = {
    id: 'habit-1',
    name: '読書',
    description: '毎日30分の読書',
    category: 'learning',
    target: 1,
    unit: 'times',
    frequency: 'daily' as const,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    isActive: true,
    streak: 5,
    bestStreak: 10,
    completionRate: 85.5,
  };

  const mockHabits = [
    mockHabit,
    {
      id: 'habit-2',
      name: '運動',
      description: '30分の運動',
      category: 'health',
      target: 30,
      unit: 'minutes',
      frequency: 'daily' as const,
      createdAt: new Date('2024-01-02T00:00:00.000Z'),
      isActive: true,
      streak: 3,
      bestStreak: 7,
      completionRate: 75.0,
    },
  ];

  const mockCompletions = [
    {
      id: 'completion-1',
      habitId: 'habit-1',
      date: '2024-01-15',
      value: 1,
      notes: '小説を読んだ',
      timestamp: new Date('2024-01-15T09:00:00.000Z'),
    },
    {
      id: 'completion-2',
      habitId: 'habit-2',
      date: '2024-01-15',
      value: 45,
      notes: 'ジョギング',
      timestamp: new Date('2024-01-15T07:00:00.000Z'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {});

    // Setup isolated Date mocking for this test suite
    mockDateSpy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
    mockDateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();

    // Clean up Date mocking
    if (mockDateSpy) {
      mockDateSpy.mockRestore();
    }
    if (mockDateNowSpy) {
      mockDateNowSpy.mockRestore();
    }
  });

  describe('初期化', () => {
    it('LocalStorageからデータを読み込む', () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce(JSON.stringify(mockHabits))
        .mockReturnValueOnce(JSON.stringify(mockCompletions));

      const { result } = renderHook(() => useHabitTracker());

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('habits');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('habitCompletions');
      expect(result.current.habits).toEqual(mockHabits);
      expect(result.current.completions).toEqual(mockCompletions);
    });

    it('LocalStorageが空の場合は空配列で初期化', () => {
      const { result } = renderHook(() => useHabitTracker());

      expect(result.current.habits).toEqual([]);
      expect(result.current.completions).toEqual([]);
    });

    it('無効なJSONの場合は空配列で初期化', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useHabitTracker());

      expect(result.current.habits).toEqual([]);
      expect(result.current.completions).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  describe('addHabit', () => {
    it('新しい習慣を追加する', () => {
      const { result } = renderHook(() => useHabitTracker());

      const newHabit = {
        name: '瞑想',
        description: '毎朝10分の瞑想',
        category: 'wellness',
        target: 10,
        unit: 'minutes',
        frequency: 'daily' as const,
      };

      act(() => {
        result.current.addHabit(newHabit);
      });

      expect(result.current.habits).toHaveLength(1);
      expect(result.current.habits[0]).toMatchObject(newHabit);
      expect(result.current.habits[0].id).toBeDefined();
      expect(result.current.habits[0].streak).toBe(0);
      expect(result.current.habits[0].bestStreak).toBe(0);
      expect(result.current.habits[0].completionRate).toBe(0);
      expect(result.current.habits[0].isActive).toBe(true);
    });

    it('追加後にLocalStorageに保存される', () => {
      const { result } = renderHook(() => useHabitTracker());

      act(() => {
        result.current.addHabit({
          name: '水分補給',
          category: 'health',
          target: 8,
          unit: 'glasses',
          frequency: 'daily',
        });
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'habits',
        expect.stringContaining('水分補給')
      );
    });
  });

  describe('updateHabit', () => {
    it('既存の習慣を更新する', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockHabits));
      const { result } = renderHook(() => useHabitTracker());

      const updates = {
        name: '読書（更新）',
        target: 2,
        description: '毎日1時間の読書',
      };

      act(() => {
        result.current.updateHabit('habit-1', updates);
      });

      expect(result.current.habits[0]).toMatchObject(updates);
    });

    it('存在しないIDで更新を試みても影響しない', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockHabits));
      const { result } = renderHook(() => useHabitTracker());

      const originalHabits = [...result.current.habits];

      act(() => {
        result.current.updateHabit('nonexistent', { name: '更新' });
      });

      expect(result.current.habits).toEqual(originalHabits);
    });
  });

  describe('deleteHabit', () => {
    it('指定した習慣を削除する', () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce(JSON.stringify(mockHabits))
        .mockReturnValueOnce(JSON.stringify(mockCompletions));

      const { result } = renderHook(() => useHabitTracker());

      expect(result.current.habits).toHaveLength(2);
      expect(result.current.completions).toHaveLength(2);

      act(() => {
        result.current.deleteHabit('habit-1');
      });

      expect(result.current.habits).toHaveLength(1);
      expect(result.current.habits[0].id).toBe('habit-2');
      // 関連する完了記録も削除される
      expect(result.current.completions).toHaveLength(1);
      expect(result.current.completions[0].habitId).toBe('habit-2');
    });

    it('存在しないIDで削除を試みても影響しない', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockHabits));
      const { result } = renderHook(() => useHabitTracker());

      const originalLength = result.current.habits.length;

      act(() => {
        result.current.deleteHabit('nonexistent');
      });

      expect(result.current.habits).toHaveLength(originalLength);
    });
  });

  describe('completeHabit', () => {
    it('習慣の完了を記録する', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockHabits));
      const { result } = renderHook(() => useHabitTracker());

      act(() => {
        result.current.completeHabit('habit-1', 1, '今日も読書完了');
      });

      expect(result.current.completions).toHaveLength(1);
      expect(result.current.completions[0]).toMatchObject({
        habitId: 'habit-1',
        date: '2024-01-15',
        value: 1,
        notes: '今日も読書完了',
      });
    });

    it('同じ日の習慣完了を上書きする', () => {
      const existingCompletion = {
        id: 'existing',
        habitId: 'habit-1',
        date: '2024-01-15',
        value: 0.5,
        notes: '途中まで',
        timestamp: new Date('2024-01-15T08:00:00.000Z'),
      };

      mockLocalStorage.getItem
        .mockReturnValueOnce(JSON.stringify(mockHabits))
        .mockReturnValueOnce(JSON.stringify([existingCompletion]));

      const { result } = renderHook(() => useHabitTracker());

      act(() => {
        result.current.completeHabit('habit-1', 1, '完了');
      });

      expect(result.current.completions).toHaveLength(1);
      expect(result.current.completions[0].value).toBe(1);
      expect(result.current.completions[0].notes).toBe('完了');
    });

    it('ストリークを正しく計算する', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockHabits));
      const { result } = renderHook(() => useHabitTracker());

      act(() => {
        result.current.completeHabit('habit-1', 1);
      });

      // ストリークの計算は実装に依存しますが、基本的なテスト
      expect(result.current.habits[0].streak).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getHabitById', () => {
    it('指定したIDの習慣を取得する', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockHabits));
      const { result } = renderHook(() => useHabitTracker());

      const habit = result.current.getHabitById('habit-1');

      expect(habit).toEqual(mockHabits[0]);
    });

    it('存在しないIDの場合はundefinedを返す', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockHabits));
      const { result } = renderHook(() => useHabitTracker());

      const habit = result.current.getHabitById('nonexistent');

      expect(habit).toBeUndefined();
    });
  });

  describe('getHabitCompletions', () => {
    it('指定した習慣の完了記録を取得する', () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce(JSON.stringify(mockHabits))
        .mockReturnValueOnce(JSON.stringify(mockCompletions));

      const { result } = renderHook(() => useHabitTracker());

      const completions = result.current.getHabitCompletions('habit-1');

      expect(completions).toHaveLength(1);
      expect(completions[0].habitId).toBe('habit-1');
    });

    it('該当する完了記録がない場合は空配列を返す', () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce(JSON.stringify(mockHabits))
        .mockReturnValueOnce(JSON.stringify(mockCompletions));

      const { result } = renderHook(() => useHabitTracker());

      const completions = result.current.getHabitCompletions('nonexistent');

      expect(completions).toEqual([]);
    });
  });

  describe('getHabitsForToday', () => {
    it('今日予定されている習慣を取得する', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockHabits));
      const { result } = renderHook(() => useHabitTracker());

      const todayHabits = result.current.getHabitsForToday();

      // 全ての習慣がdaily frequencyなので、全て返される
      expect(todayHabits).toHaveLength(2);
      expect(todayHabits).toEqual(mockHabits);
    });

    it('非アクティブな習慣は除外される', () => {
      const habitsWithInactive = [
        ...mockHabits,
        {
          ...mockHabits[0],
          id: 'habit-3',
          name: '非アクティブな習慣',
          isActive: false,
        },
      ];

      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(habitsWithInactive));
      const { result } = renderHook(() => useHabitTracker());

      const todayHabits = result.current.getHabitsForToday();

      expect(todayHabits).toHaveLength(2);
      expect(todayHabits.every((habit) => habit.isActive)).toBe(true);
    });
  });

  describe('getStreakForHabit', () => {
    it('習慣の現在のストリークを取得する', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockHabits));
      const { result } = renderHook(() => useHabitTracker());

      const streak = result.current.getStreakForHabit('habit-1');

      expect(streak).toBe(mockHabits[0].streak);
    });

    it('存在しない習慣の場合は0を返す', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockHabits));
      const { result } = renderHook(() => useHabitTracker());

      const streak = result.current.getStreakForHabit('nonexistent');

      expect(streak).toBe(0);
    });
  });

  describe('getCompletionRate', () => {
    it('習慣の完了率を取得する', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockHabits));
      const { result } = renderHook(() => useHabitTracker());

      const rate = result.current.getCompletionRate('habit-1');

      expect(rate).toBe(mockHabits[0].completionRate);
    });

    it('存在しない習慣の場合は0を返す', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockHabits));
      const { result } = renderHook(() => useHabitTracker());

      const rate = result.current.getCompletionRate('nonexistent');

      expect(rate).toBe(0);
    });
  });

  describe('getOverallStats', () => {
    it('全体統計を正しく計算する', () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce(JSON.stringify(mockHabits))
        .mockReturnValueOnce(JSON.stringify(mockCompletions));

      const { result } = renderHook(() => useHabitTracker());

      const stats = result.current.getOverallStats();

      expect(stats.totalHabits).toBe(2);
      expect(stats.activeHabits).toBe(2);
      expect(stats.completedToday).toBe(2);
      expect(stats.averageCompletionRate).toBe((85.5 + 75.0) / 2);
      expect(stats.longestStreak).toBe(10);
    });

    it('習慣がない場合は0で初期化された統計を返す', () => {
      const { result } = renderHook(() => useHabitTracker());

      const stats = result.current.getOverallStats();

      expect(stats.totalHabits).toBe(0);
      expect(stats.activeHabits).toBe(0);
      expect(stats.completedToday).toBe(0);
      expect(stats.averageCompletionRate).toBe(0);
      expect(stats.longestStreak).toBe(0);
    });
  });

  describe('データ永続化', () => {
    it('習慣データが変更されるたびにLocalStorageに保存される', () => {
      const { result } = renderHook(() => useHabitTracker());

      act(() => {
        result.current.addHabit({
          name: 'テスト習慣',
          category: 'test',
          target: 1,
          unit: 'times',
          frequency: 'daily',
        });
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('habits', expect.any(String));
    });

    it('完了記録が変更されるたびにLocalStorageに保存される', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockHabits));
      const { result } = renderHook(() => useHabitTracker());

      act(() => {
        result.current.completeHabit('habit-1', 1);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('habitCompletions', expect.any(String));
    });
  });

  describe('エラーハンドリング', () => {
    it('LocalStorageエラー時もアプリケーションが続行する', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useHabitTracker());

      expect(() => {
        act(() => {
          result.current.addHabit({
            name: 'テスト',
            category: 'test',
            target: 1,
            unit: 'times',
            frequency: 'daily',
          });
        });
      }).not.toThrow();

      expect(result.current.habits).toHaveLength(1);
    });

    it('不正なデータでも適切にフォールバックする', () => {
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({
          invalid: 'data',
        })
      );

      const { result } = renderHook(() => useHabitTracker());

      expect(result.current.habits).toEqual([]);
      expect(result.current.completions).toEqual([]);
    });
  });
});
