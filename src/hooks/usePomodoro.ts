import { useState, useEffect, useCallback, useRef } from 'react';
import { PomodoroMode, PomodoroStatus, PomodoroSettings, PomodoroSession } from '@/types/pomodoro';

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  notificationSound: true,
  volume: 0.7,
};

export const usePomodoro = () => {
  const [currentMode, setCurrentMode] = useState<PomodoroMode>('work');
  const [status, setStatus] = useState<PomodoroStatus>('idle');
  const [remainingTime, setRemainingTime] = useState(DEFAULT_SETTINGS.workDuration * 60);
  const [totalTime, setTotalTime] = useState(DEFAULT_SETTINGS.workDuration * 60);
  const [currentSession, setCurrentSession] = useState(1);
  const [completedSessions, setCompletedSessions] = useState<PomodoroSession[]>([]);
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // LocalStorage からの設定読み込み
  useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoro-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        if (status === 'idle') {
          const duration = parsed.workDuration * 60;
          setRemainingTime(duration);
          setTotalTime(duration);
        }
      } catch (error) {
        console.error('Failed to parse saved pomodoro settings:', error);
      }
    }

    const savedPosition = localStorage.getItem('pomodoro-position');
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch (error) {
        console.error('Failed to parse saved pomodoro position:', error);
      }
    }

    const savedVisibility = localStorage.getItem('pomodoro-visibility');
    if (savedVisibility === 'true') {
      setIsVisible(true);
    }
  }, [status]);

  // 設定の保存
  useEffect(() => {
    localStorage.setItem('pomodoro-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pomodoro-position', JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    localStorage.setItem('pomodoro-visibility', isVisible.toString());
  }, [isVisible]);

  // タイマーの実行
  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status]);

  // タイマー完了時の処理
  useEffect(() => {
    if (remainingTime === 0 && status === 'running') {
      // セッション完了処理
      const session: PomodoroSession = {
        id: Date.now().toString(),
        mode: currentMode,
        duration: totalTime,
        completedAt: new Date(),
      };

      setCompletedSessions((prev) => [...prev, session]);
      setStatus('completed');

      // 通知表示
      if (settings.notificationSound && Notification.permission === 'granted') {
        const messages = {
          work: '作業時間が終了しました！休憩しましょう。',
          shortBreak: '短い休憩が終了しました！次のタスクに取り組みましょう。',
          longBreak: '長い休憩が終了しました！リフレッシュして作業を再開しましょう。',
        };

        new Notification('ポモドーロタイマー', {
          body: messages[currentMode],
          icon: '/favicon.ico',
        });

        // 音声通知
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          gainNode.gain.setValueAtTime(settings.volume, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
          console.warn('Audio notification failed:', error);
        }
      }

      // 次のモードに切り替え
      setTimeout(() => {
        let nextMode: PomodoroMode;

        if (currentMode === 'work') {
          const shouldTakeLongBreak = currentSession % settings.longBreakInterval === 0;
          nextMode = shouldTakeLongBreak ? 'longBreak' : 'shortBreak';
        } else {
          nextMode = 'work';
          if (currentMode === 'shortBreak' || currentMode === 'longBreak') {
            setCurrentSession((prev) => prev + 1);
          }
        }

        // モード切り替え実行
        let duration: number;
        switch (nextMode) {
          case 'work':
            duration = settings.workDuration;
            break;
          case 'shortBreak':
            duration = settings.shortBreakDuration;
            break;
          case 'longBreak':
            duration = settings.longBreakDuration;
            break;
        }

        setCurrentMode(nextMode);
        setStatus('idle');
        setRemainingTime(duration * 60);
        setTotalTime(duration * 60);

        // 自動開始設定チェック
        const shouldAutoStart =
          (nextMode === 'work' && settings.autoStartPomodoros) ||
          (nextMode !== 'work' && settings.autoStartBreaks);

        if (shouldAutoStart) {
          setTimeout(() => {
            setStatus('running');
            if (Notification.permission === 'default') {
              Notification.requestPermission();
            }
          }, 1000);
        }
      }, 2000);
    }
  }, [remainingTime, status, currentMode, totalTime, currentSession, settings]);

  // タイマー制御
  const startTimer = useCallback(() => {
    if (status === 'idle' || status === 'paused') {
      setStatus('running');

      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [status]);

  const pauseTimer = useCallback(() => {
    if (status === 'running') {
      setStatus('paused');
    }
  }, [status]);

  const resetTimer = useCallback(() => {
    const duration =
      currentMode === 'work'
        ? settings.workDuration
        : currentMode === 'shortBreak'
          ? settings.shortBreakDuration
          : settings.longBreakDuration;

    console.log('resetTimer called:', {
      currentMode,
      settings,
      calculatedDuration: duration,
      durationInSeconds: duration * 60,
    });

    setStatus('idle');
    setRemainingTime(duration * 60);
    setTotalTime(duration * 60);
  }, [currentMode, settings]);

  // モード切り替え
  const switchMode = useCallback(
    (mode: PomodoroMode) => {
      let duration: number;

      switch (mode) {
        case 'work':
          duration = settings.workDuration;
          break;
        case 'shortBreak':
          duration = settings.shortBreakDuration;
          break;
        case 'longBreak':
          duration = settings.longBreakDuration;
          break;
      }

      setCurrentMode(mode);
      setStatus('idle');
      setRemainingTime(duration * 60);
      setTotalTime(duration * 60);
    },
    [settings]
  );

  const skipSession = useCallback(() => {
    // 現在のセッションを完了としてマーク
    const session: PomodoroSession = {
      id: Date.now().toString(),
      mode: currentMode,
      duration: totalTime - remainingTime,
      completedAt: new Date(),
    };

    setCompletedSessions((prev) => [...prev, session]);

    // 次のモードに切り替え
    let nextMode: PomodoroMode;

    if (currentMode === 'work') {
      const shouldTakeLongBreak = currentSession % settings.longBreakInterval === 0;
      nextMode = shouldTakeLongBreak ? 'longBreak' : 'shortBreak';
    } else {
      nextMode = 'work';
      if (currentMode === 'shortBreak' || currentMode === 'longBreak') {
        setCurrentSession((prev) => prev + 1);
      }
    }

    switchMode(nextMode);
  }, [currentMode, totalTime, remainingTime, currentSession, settings, switchMode]);

  // UI制御
  const toggleMinimized = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  const toggleVisibility = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  const updatePosition = useCallback((newPosition: { x: number; y: number }) => {
    setPosition(newPosition);
  }, []);

  // 設定更新
  const updateSettings = useCallback(
    (newSettings: Partial<PomodoroSettings>) => {
      console.log(
        'updateSettings called:',
        newSettings,
        'current status:',
        status,
        'current mode:',
        currentMode
      );

      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        console.log('Settings updated:', updated);

        // タイマーが動いていない時は即座に反映
        if (status === 'idle') {
          const duration =
            currentMode === 'work'
              ? updated.workDuration
              : currentMode === 'shortBreak'
                ? updated.shortBreakDuration
                : updated.longBreakDuration;

          console.log('Updating timer duration to:', duration, 'minutes');
          setRemainingTime(duration * 60);
          setTotalTime(duration * 60);
        } else {
          console.log('Timer is not idle, settings saved but not applied to current session');
        }

        return updated;
      });
    },
    [status, currentMode]
  );

  // 設定更新（即座反映）
  const updateSettingsImmediately = useCallback(
    (newSettings: Partial<PomodoroSettings>) => {
      console.log(
        'updateSettingsImmediately called:',
        newSettings,
        'current status:',
        status,
        'current mode:',
        currentMode
      );

      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        console.log('Settings updated (immediate):', updated);

        // 現在のモードに応じた新しい時間を計算
        const newDuration =
          currentMode === 'work'
            ? updated.workDuration
            : currentMode === 'shortBreak'
              ? updated.shortBreakDuration
              : updated.longBreakDuration;

        console.log('Immediately updating timer duration to:', newDuration, 'minutes');

        // タイマーが実行中の場合、進捗を維持しつつ新しい時間に調整
        if (status === 'running' || status === 'paused') {
          const progressRatio = totalTime > 0 ? (totalTime - remainingTime) / totalTime : 0;
          const newTotalSeconds = newDuration * 60;
          const newRemainingSeconds = Math.max(
            1,
            newTotalSeconds - newTotalSeconds * progressRatio
          );

          console.log('Preserving progress:', {
            oldTotal: totalTime,
            oldRemaining: remainingTime,
            progressRatio,
            newTotal: newTotalSeconds,
            newRemaining: Math.round(newRemainingSeconds),
          });

          setTotalTime(newTotalSeconds);
          setRemainingTime(Math.round(newRemainingSeconds));
        } else {
          // アイドル状態の場合は単純に新しい時間を設定
          setRemainingTime(newDuration * 60);
          setTotalTime(newDuration * 60);
        }

        return updated;
      });
    },
    [status, currentMode, totalTime, remainingTime]
  );

  // 時間のフォーマット
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // 進捗の計算
  const progress = totalTime > 0 ? ((totalTime - remainingTime) / totalTime) * 100 : 0;

  // 今日の統計
  const todayStats = {
    date: new Date().toDateString(),
    completedPomodoros: completedSessions.filter(
      (s) => s.mode === 'work' && s.completedAt.toDateString() === new Date().toDateString()
    ).length,
    totalFocusTime: completedSessions
      .filter(
        (s) => s.mode === 'work' && s.completedAt.toDateString() === new Date().toDateString()
      )
      .reduce((sum, s) => sum + s.duration / 60, 0),
    totalBreakTime: completedSessions
      .filter(
        (s) => s.mode !== 'work' && s.completedAt.toDateString() === new Date().toDateString()
      )
      .reduce((sum, s) => sum + s.duration / 60, 0),
  };

  return {
    // 状態
    currentMode,
    status,
    remainingTime,
    totalTime,
    currentSession,
    completedSessions,
    settings,
    isMinimized,
    isVisible,
    position,
    progress,
    todayStats,

    // アクション
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
    switchMode,
    toggleMinimized,
    toggleVisibility,
    updatePosition,
    updateSettings,
    updateSettingsImmediately,
    formatTime,
  };
};
