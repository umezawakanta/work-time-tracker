import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  PomodoroStore,
  PomodoroMode,
  PomodoroSettings,
  PomodoroSession,
  PomodoroState,
} from '@/types/pomodoro';

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  notificationSound: true,
  volume: 0.7,
  autoRecordWorkTime: false,
};

const DEFAULT_POSITION = { x: 20, y: 20 };

export const usePomodoroStore = create<PomodoroStore>(
  // @ts-expect-error - persist型の不整合を回避
  persist(
    (set, get) => ({
      // 初期状態
      currentMode: 'work' as PomodoroMode,
      status: 'idle' as const,
      remainingTime: DEFAULT_SETTINGS.workDuration * 60,
      totalTime: DEFAULT_SETTINGS.workDuration * 60,
      currentSession: 1,
      completedSessions: [],
      isMinimized: false,
      isVisible: false,
      position: DEFAULT_POSITION,
      settings: DEFAULT_SETTINGS,
      dailyStats: {
        date: new Date().toDateString(),
        completedPomodoros: 0,
        totalFocusTime: 0,
        totalBreakTime: 0,
      },

      // タイマー制御
      startTimer: () => {
        const state = get();
        if (state.status === 'idle' || state.status === 'paused') {
          set({ status: 'running' });

          // Web Notification permission request
          if (Notification.permission === 'default') {
            Notification.requestPermission();
          }
        }
      },

      pauseTimer: () => {
        const state = get();
        if (state.status === 'running') {
          set({ status: 'paused' });
        }
      },

      resetTimer: () => {
        const state = get();
        const duration =
          state.currentMode === 'work'
            ? state.settings.workDuration
            : state.currentMode === 'shortBreak'
              ? state.settings.shortBreakDuration
              : state.settings.longBreakDuration;

        set({
          status: 'idle',
          remainingTime: duration * 60,
          totalTime: duration * 60,
        });
      },

      skipSession: () => {
        const state = get();

        // Complete current session
        const session: PomodoroSession = {
          id: Date.now().toString(),
          mode: state.currentMode,
          duration: state.totalTime,
          completedAt: new Date(),
        };

        set({
          completedSessions: [...state.completedSessions, session],
          status: 'completed',
        });

        // Update stats and switch to next mode
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (get() as any).updateDailyStats();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (get() as any).switchToNextMode();
      },

      // モード変更
      switchMode: (mode: PomodoroMode) => {
        const state = get();
        let duration: number;

        switch (mode) {
          case 'work':
            duration = state.settings.workDuration;
            break;
          case 'shortBreak':
            duration = state.settings.shortBreakDuration;
            break;
          case 'longBreak':
            duration = state.settings.longBreakDuration;
            break;
        }

        set({
          currentMode: mode,
          status: 'idle',
          remainingTime: duration * 60,
          totalTime: duration * 60,
        });
      },

      // 次のモードに自動切り替え
      switchToNextMode: () => {
        const state = get();
        let nextMode: PomodoroMode;

        if (state.currentMode === 'work') {
          // 長い休憩のタイミングかチェック
          const shouldTakeLongBreak = state.currentSession % state.settings.longBreakInterval === 0;
          nextMode = shouldTakeLongBreak ? 'longBreak' : 'shortBreak';
        } else {
          nextMode = 'work';
          if (state.currentMode === 'shortBreak' || state.currentMode === 'longBreak') {
            set({ currentSession: state.currentSession + 1 });
          }
        }

        (get() as PomodoroStore).switchMode(nextMode);

        // 自動開始設定のチェック
        const shouldAutoStart =
          (nextMode === 'work' && state.settings.autoStartPomodoros) ||
          (nextMode !== 'work' && state.settings.autoStartBreaks);

        if (shouldAutoStart) {
          setTimeout(() => (get() as PomodoroStore).startTimer(), 1000);
        }
      },

      // UI制御
      toggleMinimized: () => {
        set((state: PomodoroState) => ({ isMinimized: !state.isMinimized }));
      },

      toggleVisibility: () => {
        set((state: PomodoroState) => ({ isVisible: !state.isVisible }));
      },

      updatePosition: (position: { x: number; y: number }) => {
        set({ position });
      },

      // 設定更新
      updateSettings: (newSettings: Partial<PomodoroSettings>) => {
        const state = get();
        const updatedSettings = { ...state.settings, ...newSettings };

        set({ settings: updatedSettings });

        // 現在のタイマーが idle の場合、新しい設定で時間をリセット
        if (state.status === 'idle') {
          (get() as PomodoroStore).resetTimer();
        }
      },

      // セッション完了
      completeSession: (taskName?: string) => {
        const state = get();
        const session: PomodoroSession = {
          id: Date.now().toString(),
          mode: state.currentMode,
          duration: state.totalTime,
          completedAt: new Date(),
          taskName,
        };

        set({
          completedSessions: [...state.completedSessions, session],
          status: 'completed',
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (get() as any).updateDailyStats();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (get() as any).showNotification();
      },

      // 通知表示
      showNotification: () => {
        const state = get();

        if (!state.settings.notificationSound || Notification.permission !== 'granted') {
          return;
        }

        const messages = {
          work: '作業時間が終了しました！休憩しましょう。',
          shortBreak: '短い休憩が終了しました！次のタスクに取り組みましょう。',
          longBreak: '長い休憩が終了しました！リフレッシュして作業を再開しましょう。',
        };

        new Notification('ポモドーロタイマー', {
          body: messages[state.currentMode],
          icon: '/favicon.ico',
        });

        // 音声通知
        if (state.settings.notificationSound) {
          // デフォルトの通知音（実際の音声ファイルがない場合は短いbeep音を生成）
          try {
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(state.settings.volume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
          } catch (error) {
            console.warn('Audio notification failed:', error);
          }
        }
      },

      // 統計更新
      updateDailyStats: () => {
        const state = get();
        const today = new Date().toDateString();

        if (state.dailyStats.date !== today) {
          // 新しい日の場合、統計をリセット
          set({
            dailyStats: {
              date: today,
              completedPomodoros: 0,
              totalFocusTime: 0,
              totalBreakTime: 0,
            },
          });
        }

        // 完了したセッションに基づいて統計を更新
        const todaySessions = state.completedSessions.filter(
          (session: PomodoroSession) => session.completedAt.toDateString() === today
        );

        const completedPomodoros = todaySessions.filter(
          (s: PomodoroSession) => s.mode === 'work'
        ).length;
        const totalFocusTime = todaySessions
          .filter((s: PomodoroSession) => s.mode === 'work')
          .reduce((sum: number, s: PomodoroSession) => sum + s.duration / 60, 0);
        const totalBreakTime = todaySessions
          .filter((s: PomodoroSession) => s.mode !== 'work')
          .reduce((sum: number, s: PomodoroSession) => sum + s.duration / 60, 0);

        set({
          dailyStats: {
            date: today,
            completedPomodoros,
            totalFocusTime,
            totalBreakTime,
          },
        });
      },

      resetDailyStats: () => {
        set({
          dailyStats: {
            date: new Date().toDateString(),
            completedPomodoros: 0,
            totalFocusTime: 0,
            totalBreakTime: 0,
          },
        });
      },
    }),
    {
      name: 'pomodoro-storage',
      // 永続化しないフィールド（ランタイム状態）
      partialize: (state: PomodoroState) => ({
        settings: state.settings,
        position: state.position,
        isVisible: state.isVisible,
        currentSession: state.currentSession,
        completedSessions: state.completedSessions,
        dailyStats: state.dailyStats,
      }),
    }
  )
);

// タイマーのティック処理用カスタムフック
export const usePomodoroTimer = () => {
  const store = usePomodoroStore();

  React.useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (store.status === 'running') {
      intervalId = setInterval(() => {
        const newRemainingTime = store.remainingTime - 1;

        if (newRemainingTime <= 0) {
          // タイマー完了
          store.completeSession();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (store as any).switchToNextMode();
        } else {
          usePomodoroStore.setState({ remainingTime: newRemainingTime });
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [store]);

  return store;
};
