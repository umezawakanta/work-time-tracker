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
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<AudioContext | null>(null);

  // 強化された完了音を再生する関数
  const playCompletionSound = useCallback(
    (volume: number) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      soundRef.current = audioContext;

      // メロディックな通知音（3回のbeep）
      const frequencies = [800, 1000, 1200]; // 上昇音階
      const beepDuration = 0.4; // 各beepの長さ
      const pauseDuration = 0.2; // beep間の間隔

      frequencies.forEach((frequency, index) => {
        const startTime = audioContext.currentTime + index * (beepDuration + pauseDuration);

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = 'sine';

        // エンベロープ（フェードイン/アウト）
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + beepDuration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, startTime + beepDuration);

        oscillator.start(startTime);
        oscillator.stop(startTime + beepDuration);
      });

      // 3秒後に繰り返し（最大3回）
      setTimeout(() => {
        if (showCompletionModal) {
          playCompletionSound(volume * 0.8); // 音量を少し下げて繰り返し
        }
      }, 3000);
    },
    [showCompletionModal]
  );

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
      setShowCompletionModal(true);

      // 通知表示
      const messages = {
        work: '作業時間が終了しました！休憩しましょう。',
        shortBreak: '短い休憩が終了しました！次のタスクに取り組みましょう。',
        longBreak: '長い休憩が終了しました！リフレッシュして作業を再開しましょう。',
      };

      if (Notification.permission === 'granted') {
        new Notification('ポモドーロタイマー', {
          body: messages[currentMode],
          icon: '/favicon.ico',
        });
      }

      // 音声通知（強化版）
      if (settings.notificationSound) {
        try {
          playCompletionSound(settings.volume);
        } catch (error) {
          console.warn('Audio notification failed:', error);
        }
      }

      // 次のモードに切り替え（モーダルが閉じられるまで待機）
      // モーダルが表示されている間は自動切り替えしない
      // ユーザーがモーダルで「次を開始」を選択するか、モーダルを閉じるまで待つ
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
          // 休憩から作業に切り替わる時、セッション番号を増加
          if (currentMode === 'shortBreak' || currentMode === 'longBreak') {
            setCurrentSession((prev) => prev + 1);
          }
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
    [settings, currentMode]
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

  // 完了モーダルを閉じる
  const closeCompletionModal = useCallback(() => {
    setShowCompletionModal(false);
    // 音を停止
    if (soundRef.current) {
      soundRef.current.close();
      soundRef.current = null;
    }
  }, []);

  // 音を停止
  const stopSound = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.close();
      soundRef.current = null;
    }
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
    showCompletionModal,

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
    closeCompletionModal,
    stopSound,
    formatTime,
  };
};
