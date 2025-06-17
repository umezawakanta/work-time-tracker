import { useState, useEffect, useCallback, useRef } from 'react';
import { PomodoroMode, PomodoroStatus, PomodoroSettings, PomodoroSession } from '@/types/pomodoro';

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 1,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  notificationSound: true,
  volume: 0.7,
};

export const usePomodoro = () => {
  // Unique instance ID for debugging
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));
  console.log('🚀 usePomodoro: フック初期化開始');
  console.log('🆔 usePomodoro: インスタンスID', instanceId.current);

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
  const [currentTaskName, setCurrentTaskName] = useState<string>('');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<AudioContext | null>(null);
  const titleBlinkRef = useRef<NodeJS.Timeout | null>(null);
  const notificationRef = useRef<Notification | null>(null);
  const originalTitle = useRef<string>(document.title);
  const originalFavicon = useRef<string>('');
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

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

      // 5秒後に繰り返し（モーダルが開いている間継続）
      setTimeout(() => {
        if (showCompletionModal) {
          playCompletionSound(volume * 0.9); // 音量を少し下げて繰り返し
        }
      }, 5000);
    },
    [showCompletionModal]
  );

  // ブラウザタブのタイトルを点滅させる
  const startTitleBlink = useCallback((message: string) => {
    if (originalTitle.current === '') {
      originalTitle.current = document.title;
    }

    let isOriginal = true;
    titleBlinkRef.current = setInterval(() => {
      document.title = isOriginal ? `🔔 ${message}` : originalTitle.current;
      isOriginal = !isOriginal;
    }, 1000);
  }, []);

  // タイトル点滅を停止
  const stopTitleBlink = useCallback(() => {
    if (titleBlinkRef.current) {
      clearInterval(titleBlinkRef.current);
      titleBlinkRef.current = null;
    }
    if (originalTitle.current) {
      document.title = originalTitle.current;
    }
  }, []);

  // ファビコンを変更
  const changeFavicon = useCallback((emoji: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.font = '24px serif';
      ctx.fillText(emoji, 4, 24);

      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        if (originalFavicon.current === '') {
          originalFavicon.current = favicon.href;
        }
        favicon.href = canvas.toDataURL();
      }
    }
  }, []);

  // ファビコンを元に戻す
  const restoreFavicon = useCallback(() => {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon && originalFavicon.current) {
      favicon.href = originalFavicon.current;
    }
  }, []);

  // ブラウザウィンドウをフォーカス
  const focusWindow = useCallback(() => {
    try {
      window.focus();
      // タブがアクティブでない場合の処理
      if (document.hidden) {
        // ページの可視性が変わったときにフォーカスを試行
        const handleVisibilityChange = () => {
          if (!document.hidden) {
            window.focus();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
          }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
      }
    } catch (error) {
      console.warn('Window focus failed:', error);
    }
  }, []);

  // 強化されたデスクトップ通知
  const showEnhancedNotification = useCallback(
    (message: string, mode: PomodoroMode) => {
      // 既存の通知を閉じる
      if (notificationRef.current) {
        notificationRef.current.close();
      }

      if (Notification.permission === 'granted') {
        const emoji = mode === 'work' ? '✅' : '☕';
        const notificationOptions: NotificationOptions = {
          body: message,
          icon: '/favicon.ico',
          tag: 'pomodoro-timer', // 同じタグの通知は置き換わる
          requireInteraction: true, // ユーザーが閉じるまで表示し続ける
          silent: false,
        };

        // 対応している場合のみ追加のプロパティを設定
        try {
          (notificationOptions as any).badge = '/favicon.ico';
          (notificationOptions as any).vibrate = [200, 100, 200];
        } catch (e) {
          // プロパティがサポートされていない場合は無視
        }

        notificationRef.current = new Notification(
          `${emoji} ポモドーロタイマー`,
          notificationOptions
        );

        // 通知クリック時の処理
        notificationRef.current.onclick = () => {
          focusWindow();
          notificationRef.current?.close();
        };

        // 10秒後に再通知（通知が自動で消えた場合）
        setTimeout(() => {
          if (showCompletionModal && Notification.permission === 'granted') {
            showEnhancedNotification(message, mode);
          }
        }, 10000);
      }
    },
    [showCompletionModal, focusWindow]
  );

  // 音声読み上げ機能
  const speakMessage = useCallback(
    (message: string) => {
      try {
        console.log('🎤 音声読み上げ開始:', message);

        // 既存の音声を停止
        if (speechRef.current) {
          speechSynthesis.cancel();
        }

        // Web Speech APIがサポートされているかチェック
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(message);
          speechRef.current = utterance;

          // 日本語の音声を設定
          try {
            const voices = speechSynthesis.getVoices();
            console.log('🎤 利用可能な音声:', voices.length);

            const japaneseVoice = voices.find(
              (voice) => voice.lang.includes('ja') || voice.name.includes('Japanese')
            );

            if (japaneseVoice) {
              utterance.voice = japaneseVoice;
              console.log('🎤 日本語音声設定:', japaneseVoice.name);
            }
          } catch (voiceError) {
            console.warn('🎤 音声設定エラー:', voiceError);
          }

          // 音声設定
          utterance.rate = 1.0; // 話速
          utterance.pitch = 1.0; // ピッチ
          utterance.volume = Math.max(0, Math.min(1, settings.volume)); // 音量（0-1の範囲に制限）

          // エラーハンドリング
          utterance.onerror = (event) => {
            console.warn('🎤 Speech synthesis error:', event);
          };

          utterance.onstart = () => {
            console.log('🎤 音声読み上げ開始');
          };

          utterance.onend = () => {
            console.log('🎤 音声読み上げ完了');
          };

          // 音声再生
          speechSynthesis.speak(utterance);
        } else {
          console.warn('🎤 Speech synthesis not supported');
        }
      } catch (error) {
        console.error('🎤 音声読み上げエラー:', error);
      }
    },
    [settings.volume]
  );

  // 音声を停止
  const stopSpeaking = useCallback(() => {
    try {
      console.log('🎤 音声停止要求');
      if ('speechSynthesis' in window && speechSynthesis.speaking) {
        speechSynthesis.cancel();
        console.log('🎤 音声停止完了');
      }
      speechRef.current = null;
    } catch (error) {
      console.error('🎤 音声停止エラー:', error);
    }
  }, []);

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
    console.log('🔍 LocalStorage visibility読み込み:', savedVisibility);

    if (savedVisibility === 'true') {
      console.log('📱 タイマーを表示状態に設定');
      setIsVisible(true);
    } else if (savedVisibility === null) {
      // 初回利用時は表示する
      console.log('🆕 初回利用: タイマーを表示状態に設定');
      setIsVisible(true);
    } else {
      console.log('❌ タイマーを非表示状態に設定:', savedVisibility);
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
    console.log('💾 Saving visibility to localStorage:', {
      instanceId: instanceId.current,
      isVisible: isVisible,
      stringValue: isVisible.toString(),
    });
    localStorage.setItem('pomodoro-visibility', isVisible.toString());
  }, [isVisible]);

  // クリーンアップ用Effect
  useEffect(() => {
    return () => {
      // コンポーネントのアンマウント時にすべてのリソースをクリーンアップ
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (soundRef.current) {
        soundRef.current.close();
      }
      if (titleBlinkRef.current) {
        clearInterval(titleBlinkRef.current);
      }
      if (notificationRef.current) {
        notificationRef.current.close();
      }
      // タイトルとファビコンを元に戻す
      if (originalTitle.current) {
        document.title = originalTitle.current;
      }
      restoreFavicon();
    };
  }, [restoreFavicon]);

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
        taskName: currentTaskName || undefined,
      };

      setCompletedSessions((prev) => [...prev, session]);
      setStatus('completed');
      setShowCompletionModal(true);

      // カスタマイズされた通知メッセージ
      const getCustomMessage = () => {
        if (currentTaskName) {
          switch (currentMode) {
            case 'work':
              return {
                notification: `「${currentTaskName}」の作業時間が終了しました！休憩しましょう。`,
                speech: `${currentTaskName}の作業を終了してください。お疲れ様でした。休憩の時間です。`,
                title: `${currentTaskName} 完了！`,
              };
            case 'shortBreak':
              return {
                notification: '短い休憩が終了しました！次のタスクに取り組みましょう。',
                speech: '休憩時間が終了しました。次のタスクを開始してください。',
                title: '休憩完了！',
              };
            case 'longBreak':
              return {
                notification: '長い休憩が終了しました！リフレッシュして作業を再開しましょう。',
                speech: '長い休憩が終了しました。リフレッシュして作業を再開してください。',
                title: '長い休憩完了！',
              };
          }
        } else {
          return {
            notification:
              currentMode === 'work'
                ? '作業時間が終了しました！休憩しましょう。'
                : currentMode === 'shortBreak'
                  ? '短い休憩が終了しました！次のタスクに取り組みましょう。'
                  : '長い休憩が終了しました！リフレッシュして作業を再開しましょう。',
            speech:
              currentMode === 'work'
                ? '作業時間が終了しました。休憩してください。'
                : currentMode === 'shortBreak'
                  ? '休憩時間が終了しました。次のタスクを開始してください。'
                  : '長い休憩が終了しました。作業を再開してください。',
            title: currentMode === 'work' ? 'タイマー完了！' : '休憩完了！',
          };
        }
      };

      const customMessage = getCustomMessage();
      const message = customMessage.notification;

      // 🚨 強化された通知システム 🚨

      // 1. ブラウザタブのタイトルを点滅
      startTitleBlink(customMessage.title);

      // 2. ファビコンを変更
      changeFavicon(currentMode === 'work' ? '✅' : '☕');

      // 3. ブラウザウィンドウをフォーカス（可能であれば）
      focusWindow();

      // 4. 強化されたデスクトップ通知
      if (Notification.permission === 'granted') {
        showEnhancedNotification(message, currentMode);
      } else if (Notification.permission === 'default') {
        // 通知許可を要求
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            showEnhancedNotification(message, currentMode);
          }
        });
      }

      // 5. 音声通知（強化版）
      if (settings.notificationSound) {
        try {
          playCompletionSound(settings.volume);
        } catch (error) {
          console.warn('Audio notification failed:', error);
        }
      }

      // 6. 音声メッセージ読み上げ
      if (settings.notificationSound) {
        // 音楽の後に音声メッセージを再生（2秒遅延）
        setTimeout(() => {
          try {
            speakMessage(customMessage.speech);
          } catch (error) {
            console.error('音声読み上げでエラーが発生しました:', error);
          }
        }, 2000);
      }

      // 次のモードに切り替え（モーダルが閉じられるまで待機）
      // モーダルが表示されている間は自動切り替えしない
      // ユーザーがモーダルで「次を開始」を選択するか、モーダルを閉じるまで待つ
    }
  }, [remainingTime, status, currentMode, totalTime, currentSession, settings]);

  // タイマー制御
  const startTimer = useCallback(
    (taskName?: string) => {
      if (status === 'idle' || status === 'paused') {
        // タスク名を設定（新しいセッション開始時のみ）
        if (status === 'idle' && taskName !== undefined) {
          setCurrentTaskName(taskName);
        }

        setStatus('running');

        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      }
    },
    [status]
  );

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
    console.log('🔄 toggleVisibility called - Before:', {
      instanceId: instanceId.current,
      currentIsVisible: isVisible,
      willBecome: !isVisible,
    });

    setIsVisible((prev) => {
      const newValue = !prev;
      console.log('🔄 toggleVisibility - Setting visibility:', {
        instanceId: instanceId.current,
        from: prev,
        to: newValue,
      });
      return newValue;
    });
  }, [isVisible]);

  // Debug utility to clear localStorage
  const clearPomodoroStorage = useCallback(() => {
    console.log('🧹 Clearing Pomodoro localStorage...');
    localStorage.removeItem('pomodoro-visibility');
    localStorage.removeItem('pomodoro-settings');
    localStorage.removeItem('pomodoro-position');
    console.log('✅ Pomodoro localStorage cleared');
  }, []);

  const updatePosition = useCallback((newPosition: { x: number; y: number }) => {
    setPosition(newPosition);
  }, []);

  // 完了モーダルを閉じる
  const closeCompletionModal = useCallback(() => {
    setShowCompletionModal(false);

    // すべての通知効果をクリア
    // 1. 音を停止
    if (soundRef.current) {
      soundRef.current.close();
      soundRef.current = null;
    }

    // 2. 音声読み上げを停止
    stopSpeaking();

    // 3. タイトル点滅を停止
    stopTitleBlink();

    // 4. ファビコンを元に戻す
    restoreFavicon();

    // 5. デスクトップ通知を閉じる
    if (notificationRef.current) {
      notificationRef.current.close();
      notificationRef.current = null;
    }
  }, [stopTitleBlink, restoreFavicon, stopSpeaking]);

  // タスク名を設定
  const setTaskName = useCallback((taskName: string) => {
    setCurrentTaskName(taskName);
  }, []);

  // タスク名をクリア
  const clearTaskName = useCallback(() => {
    setCurrentTaskName('');
  }, []);

  // 音を停止
  const stopSound = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.close();
      soundRef.current = null;
    }
    // 音声読み上げも停止
    stopSpeaking();
  }, [stopSpeaking]);

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
    currentTaskName,

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
    setTaskName,
    clearTaskName,
    speakMessage,
    stopSpeaking,
    formatTime,

    // Debug utilities
    clearPomodoroStorage,
    instanceId: instanceId.current,
  };
};
