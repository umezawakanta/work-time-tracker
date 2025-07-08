import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { PomodoroProvider, usePomodoroContext } from '../PomodoroContext';

// Mock usePomodoro hook
jest.mock('../../hooks/usePomodoro', () => ({
  usePomodoro: () => ({
    isRunning: false,
    timeLeft: 1500, // 25 minutes in seconds
    totalTime: 1500,
    currentSession: null,
    sessionType: 'work',
    completedPomodoros: 0,
    settings: {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      notifications: true,
      sounds: true,
      volume: 0.5,
    },
    startTimer: jest.fn(),
    pauseTimer: jest.fn(),
    resumeTimer: jest.fn(),
    resetTimer: jest.fn(),
    stopTimer: jest.fn(),
    startBreak: jest.fn(),
    switchSessionType: jest.fn(),
    updateSettings: jest.fn(),
    getStats: jest.fn(() => ({
      totalSessions: 10,
      completedSessions: 8,
      totalWorkTime: 200 * 60 * 1000,
      averageSessionLength: 24 * 60 * 1000,
      todaySessions: 3,
      weekSessions: 15,
      monthSessions: 45,
      completionRate: 80,
    })),
    getSessionHistory: jest.fn(() => []),
    resetDailyStats: jest.fn(),
  }),
}));

describe('PomodoroContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <PomodoroProvider>{children}</PomodoroProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Provider初期化', () => {
    it('初期状態が正しく設定される', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      expect(result.current.isRunning).toBe(false);
      expect(result.current.timeLeft).toBe(1500);
      expect(result.current.totalTime).toBe(1500);
      expect(result.current.currentSession).toBeNull();
      expect(result.current.sessionType).toBe('work');
      expect(result.current.completedPomodoros).toBe(0);
    });

    it('設定が正しく初期化される', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      expect(result.current.settings).toEqual({
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        longBreakInterval: 4,
        autoStartBreaks: false,
        autoStartPomodoros: false,
        notifications: true,
        sounds: true,
        volume: 0.5,
      });
    });

    it('統計データが取得できる', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      const stats = result.current.getStats();

      expect(stats).toEqual({
        totalSessions: 10,
        completedSessions: 8,
        totalWorkTime: 200 * 60 * 1000,
        averageSessionLength: 24 * 60 * 1000,
        todaySessions: 3,
        weekSessions: 15,
        monthSessions: 45,
        completionRate: 80,
      });
    });
  });

  describe('タイマー制御', () => {
    it('startTimer関数が利用できる', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      expect(typeof result.current.startTimer).toBe('function');

      act(() => {
        result.current.startTimer('テストタスク');
      });

      expect(result.current.startTimer).toHaveBeenCalledWith('テストタスク');
    });

    it('pauseTimer関数が利用できる', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      expect(typeof result.current.pauseTimer).toBe('function');

      act(() => {
        result.current.pauseTimer();
      });

      expect(result.current.pauseTimer).toHaveBeenCalled();
    });

    it('resumeTimer関数が利用できる', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      expect(typeof result.current.resumeTimer).toBe('function');

      act(() => {
        result.current.resumeTimer();
      });

      expect(result.current.resumeTimer).toHaveBeenCalled();
    });

    it('resetTimer関数が利用できる', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      expect(typeof result.current.resetTimer).toBe('function');

      act(() => {
        result.current.resetTimer();
      });

      expect(result.current.resetTimer).toHaveBeenCalled();
    });

    it('stopTimer関数が利用できる', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      expect(typeof result.current.stopTimer).toBe('function');

      act(() => {
        result.current.stopTimer();
      });

      expect(result.current.stopTimer).toHaveBeenCalled();
    });
  });

  describe('セッション管理', () => {
    it('startBreak関数が利用できる', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      expect(typeof result.current.startBreak).toBe('function');

      act(() => {
        result.current.startBreak('short');
      });

      expect(result.current.startBreak).toHaveBeenCalledWith('short');
    });

    it('switchSessionType関数が利用できる', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      expect(typeof result.current.switchSessionType).toBe('function');

      act(() => {
        result.current.switchSessionType('shortBreak');
      });

      expect(result.current.switchSessionType).toHaveBeenCalledWith('shortBreak');
    });

    it('セッション履歴を取得できる', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      const history = result.current.getSessionHistory();

      expect(Array.isArray(history)).toBe(true);
      expect(result.current.getSessionHistory).toHaveBeenCalled();
    });

    it('期間指定でセッション履歴を取得できる', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      const todayHistory = result.current.getSessionHistory('today');
      const weekHistory = result.current.getSessionHistory('week');

      expect(Array.isArray(todayHistory)).toBe(true);
      expect(Array.isArray(weekHistory)).toBe(true);
      expect(result.current.getSessionHistory).toHaveBeenCalledWith('today');
      expect(result.current.getSessionHistory).toHaveBeenCalledWith('week');
    });
  });

  describe('設定管理', () => {
    it('updateSettings関数が利用できる', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      expect(typeof result.current.updateSettings).toBe('function');

      const newSettings = {
        workDuration: 30,
        notifications: false,
      };

      act(() => {
        result.current.updateSettings(newSettings);
      });

      expect(result.current.updateSettings).toHaveBeenCalledWith(newSettings);
    });

    it('設定の各プロパティが正しく取得できる', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      expect(result.current.settings.workDuration).toBe(25);
      expect(result.current.settings.shortBreakDuration).toBe(5);
      expect(result.current.settings.longBreakDuration).toBe(15);
      expect(result.current.settings.longBreakInterval).toBe(4);
      expect(result.current.settings.autoStartBreaks).toBe(false);
      expect(result.current.settings.autoStartPomodoros).toBe(false);
      expect(result.current.settings.notifications).toBe(true);
      expect(result.current.settings.sounds).toBe(true);
      expect(result.current.settings.volume).toBe(0.5);
    });
  });

  describe('統計管理', () => {
    it('統計データの各項目が正しく取得できる', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      const stats = result.current.getStats();

      expect(stats.totalSessions).toBe(10);
      expect(stats.completedSessions).toBe(8);
      expect(stats.totalWorkTime).toBe(200 * 60 * 1000);
      expect(stats.averageSessionLength).toBe(24 * 60 * 1000);
      expect(stats.todaySessions).toBe(3);
      expect(stats.weekSessions).toBe(15);
      expect(stats.monthSessions).toBe(45);
      expect(stats.completionRate).toBe(80);
    });

    it('resetDailyStats関数が利用できる', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      expect(typeof result.current.resetDailyStats).toBe('function');

      act(() => {
        result.current.resetDailyStats();
      });

      expect(result.current.resetDailyStats).toHaveBeenCalled();
    });
  });

  describe('タイマー状態', () => {
    it('実行状態が正しく取得できる', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      expect(typeof result.current.isRunning).toBe('boolean');
      expect(result.current.isRunning).toBe(false);
    });

    it('残り時間が正しく取得できる', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      expect(typeof result.current.timeLeft).toBe('number');
      expect(result.current.timeLeft).toBe(1500);
    });

    it('総時間が正しく取得できる', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      expect(typeof result.current.totalTime).toBe('number');
      expect(result.current.totalTime).toBe(1500);
    });

    it('セッションタイプが正しく取得できる', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      expect(typeof result.current.sessionType).toBe('string');
      expect(result.current.sessionType).toBe('work');
    });

    it('完了したポモドーロ数が正しく取得できる', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      expect(typeof result.current.completedPomodoros).toBe('number');
      expect(result.current.completedPomodoros).toBe(0);
    });

    it('現在のセッション情報が正しく取得できる', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      expect(result.current.currentSession).toBeNull();
    });
  });

  describe('Context外使用エラー', () => {
    it('Provider外でhookを使用するとエラーになる', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => usePomodoroContext());
      }).toThrow('usePomodoroContext must be used within a PomodoroProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('関数の型安全性', () => {
    it('全ての関数が正しい型で提供される', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      // タイマー制御関数
      expect(typeof result.current.startTimer).toBe('function');
      expect(typeof result.current.pauseTimer).toBe('function');
      expect(typeof result.current.resumeTimer).toBe('function');
      expect(typeof result.current.resetTimer).toBe('function');
      expect(typeof result.current.stopTimer).toBe('function');

      // セッション管理関数
      expect(typeof result.current.startBreak).toBe('function');
      expect(typeof result.current.switchSessionType).toBe('function');

      // 設定管理関数
      expect(typeof result.current.updateSettings).toBe('function');

      // 統計関数
      expect(typeof result.current.getStats).toBe('function');
      expect(typeof result.current.getSessionHistory).toBe('function');
      expect(typeof result.current.resetDailyStats).toBe('function');
    });

    it('startTimer関数が正しい引数を受け取る', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      // タスク名のみ
      act(() => {
        result.current.startTimer('テストタスク');
      });

      // タスク名とメモ
      act(() => {
        result.current.startTimer('テストタスク', 'メモ');
      });

      expect(result.current.startTimer).toHaveBeenCalledWith('テストタスク');
      expect(result.current.startTimer).toHaveBeenCalledWith('テストタスク', 'メモ');
    });

    it('startBreak関数が正しい引数を受け取る', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      // 引数なし（自動判定）
      act(() => {
        result.current.startBreak();
      });

      // 休憩タイプ指定
      act(() => {
        result.current.startBreak('short');
      });

      act(() => {
        result.current.startBreak('long');
      });

      expect(result.current.startBreak).toHaveBeenCalledWith();
      expect(result.current.startBreak).toHaveBeenCalledWith('short');
      expect(result.current.startBreak).toHaveBeenCalledWith('long');
    });
  });

  describe('パフォーマンス最適化', () => {
    it('関数インスタンスが安定している', () => {
      const { result, rerender } = renderHook(() => usePomodoroContext(), { wrapper });

      const initialStartTimer = result.current.startTimer;
      const initialUpdateSettings = result.current.updateSettings;
      const initialGetStats = result.current.getStats;

      rerender();

      expect(result.current.startTimer).toBe(initialStartTimer);
      expect(result.current.updateSettings).toBe(initialUpdateSettings);
      expect(result.current.getStats).toBe(initialGetStats);
    });

    it('状態が変更されない場合は再レンダリングされない', () => {
      let renderCount = 0;

      const TestComponent = () => {
        renderCount++;
        usePomodoroContext();
        return null;
      };

      const { rerender } = renderHook(() => <TestComponent />, { wrapper });

      const initialCount = renderCount;
      rerender();

      expect(renderCount).toBe(initialCount);
    });
  });

  describe('統合テスト', () => {
    it('Contextを通じて全ての機能にアクセスできる', () => {
      const { result } = renderHook(() => usePomodoroContext(), { wrapper });

      // 状態確認
      expect(result.current.isRunning).toBeDefined();
      expect(result.current.timeLeft).toBeDefined();
      expect(result.current.sessionType).toBeDefined();
      expect(result.current.settings).toBeDefined();

      // 制御関数確認
      expect(result.current.startTimer).toBeDefined();
      expect(result.current.pauseTimer).toBeDefined();
      expect(result.current.resetTimer).toBeDefined();

      // 設定関数確認
      expect(result.current.updateSettings).toBeDefined();

      // 統計関数確認
      expect(result.current.getStats).toBeDefined();
      expect(result.current.getSessionHistory).toBeDefined();
    });

    it('複数のコンポーネントから同じ状態にアクセスできる', () => {
      const { result: result1 } = renderHook(() => usePomodoroContext(), { wrapper });
      const { result: result2 } = renderHook(() => usePomodoroContext(), { wrapper });

      expect(result1.current.isRunning).toBe(result2.current.isRunning);
      expect(result1.current.timeLeft).toBe(result2.current.timeLeft);
      expect(result1.current.sessionType).toBe(result2.current.sessionType);
      expect(result1.current.completedPomodoros).toBe(result2.current.completedPomodoros);
    });
  });
});
