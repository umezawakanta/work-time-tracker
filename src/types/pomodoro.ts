export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

export type PomodoroStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface PomodoroSettings {
  workDuration: number; // 分
  shortBreakDuration: number; // 分
  longBreakDuration: number; // 分
  longBreakInterval: number; // 何サイクル後に長い休憩
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  notificationSound: boolean;
  volume: number; // 0-1
  autoRecordWorkTime: boolean; // 作業時間の自動記録
}

export interface PomodoroSession {
  id: string;
  mode: PomodoroMode;
  duration: number; // 秒
  completedAt: Date;
  taskName?: string;
}

export interface PomodoroState {
  // タイマー状態
  currentMode: PomodoroMode;
  status: PomodoroStatus;
  remainingTime: number; // 秒
  totalTime: number; // 秒

  // セッション管理
  currentSession: number; // 現在のサイクル数
  completedSessions: PomodoroSession[];

  // UI状態
  isMinimized: boolean;
  isVisible: boolean;
  position: { x: number; y: number };

  // 設定
  settings: PomodoroSettings;

  // 統計
  dailyStats: {
    date: string;
    completedPomodoros: number;
    totalFocusTime: number; // 分
    totalBreakTime: number; // 分
  };
}

export interface PomodoroActions {
  // タイマー制御
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;

  // モード変更
  switchMode: (mode: PomodoroMode) => void;

  // UI制御
  toggleMinimized: () => void;
  toggleVisibility: () => void;
  updatePosition: (position: { x: number; y: number }) => void;

  // 設定
  updateSettings: (settings: Partial<PomodoroSettings>) => void;

  // セッション管理
  completeSession: (taskName?: string) => void;

  // 統計
  updateDailyStats: () => void;
  resetDailyStats: () => void;
}

export type PomodoroStore = PomodoroState & PomodoroActions;
