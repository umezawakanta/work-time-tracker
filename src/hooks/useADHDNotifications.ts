import { useState, useEffect, useCallback } from 'react';

interface ADHDNotification {
  id: string;
  type: 'reality-check' | 'focus-break' | 'mindfulness' | 'task-reminder';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
}

interface ADHDNotificationSettings {
  realityCheckInterval: number; // 分
  focusBreakInterval: number; // 分
  mindfulnessReminders: boolean;
  taskReminders: boolean;
  soundEnabled: boolean;
}

export const useADHDNotifications = () => {
  const [notifications, setNotifications] = useState<ADHDNotification[]>([]);
  const [settings, setSettings] = useState<ADHDNotificationSettings>({
    realityCheckInterval: 10,
    focusBreakInterval: 25,
    mindfulnessReminders: true,
    taskReminders: true,
    soundEnabled: true,
  });

  // 現実チェック通知
  const createRealityCheckNotification = useCallback((): ADHDNotification => {
    const messages = [
      '今、現実に集中していますか？周りを見回してみましょう。',
      '深呼吸をして、今この瞬間に意識を向けてください。',
      '想像と現実を区別する時間です。今何をしていますか？',
      '5つのものを見つけて名前を言ってみましょう。',
      '今の感情と思考をチェックしてみましょう。',
    ];

    return {
      id: Date.now().toString(),
      type: 'reality-check',
      title: '🧠 現実チェックの時間',
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date(),
      priority: 'high',
    };
  }, []);

  // 集中休憩通知
  const createFocusBreakNotification = useCallback((): ADHDNotification => {
    const messages = [
      '25分経過しました。5分間の休憩を取りましょう。',
      '集中時間終了！立ち上がって軽くストレッチしてください。',
      'お疲れ様です。水を飲んで目を休めましょう。',
      '休憩時間です。スマホは見ずにリラックスしてください。',
    ];

    return {
      id: Date.now().toString(),
      type: 'focus-break',
      title: '⏰ 休憩時間',
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date(),
      priority: 'medium',
    };
  }, []);

  // マインドフルネス通知
  const createMindfulnessNotification = useCallback((): ADHDNotification => {
    const messages = [
      '1分間の深呼吸タイムです。ゆっくり息を吸って吐いてください。',
      '今の感覚に注意を向けてみましょう。足の裏の感覚はどうですか？',
      '3つの音を聞き取ってみましょう。何が聞こえますか？',
      '今の気持ちを受け入れて、優しく自分に話しかけてください。',
    ];

    return {
      id: Date.now().toString(),
      type: 'mindfulness',
      title: '🧘 マインドフルネス',
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date(),
      priority: 'low',
    };
  }, []);

  // 通知の追加
  const addNotification = useCallback(
    (notification: ADHDNotification) => {
      setNotifications((prev) => [notification, ...prev.slice(0, 9)]); // 最新10件を保持

      // ブラウザ通知
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.type,
        });
      }

      // 音声通知
      if (settings.soundEnabled) {
        playNotificationSound(notification.priority);
      }
    },
    [settings.soundEnabled]
  );

  // 音声再生
  const playNotificationSound = (priority: ADHDNotification['priority']) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 優先度に応じた音の設定
    switch (priority) {
      case 'high':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        break;
      case 'medium':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        break;
      case 'low':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        break;
    }

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  // 通知の削除
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // 全通知の削除
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // 通知権限の要求
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  // 定期通知の設定
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    // 現実チェック通知
    if (settings.realityCheckInterval > 0) {
      const realityCheckInterval = setInterval(
        () => {
          addNotification(createRealityCheckNotification());
        },
        settings.realityCheckInterval * 60 * 1000
      );
      intervals.push(realityCheckInterval);
    }

    // 集中休憩通知
    if (settings.focusBreakInterval > 0) {
      const focusBreakInterval = setInterval(
        () => {
          addNotification(createFocusBreakNotification());
        },
        settings.focusBreakInterval * 60 * 1000
      );
      intervals.push(focusBreakInterval);
    }

    // マインドフルネス通知（ランダムな間隔）
    if (settings.mindfulnessReminders) {
      const mindfulnessInterval = setInterval(
        () => {
          if (Math.random() < 0.3) {
            // 30%の確率
            addNotification(createMindfulnessNotification());
          }
        },
        15 * 60 * 1000
      ); // 15分ごとにチェック
      intervals.push(mindfulnessInterval);
    }

    return () => {
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [
    settings,
    addNotification,
    createRealityCheckNotification,
    createFocusBreakNotification,
    createMindfulnessNotification,
  ]);

  // 緊急現実チェック
  const triggerEmergencyRealityCheck = useCallback(() => {
    const emergencyNotification: ADHDNotification = {
      id: Date.now().toString(),
      type: 'reality-check',
      title: '🚨 緊急現実チェック',
      message:
        'STOP! 深呼吸をして、今いる場所を確認してください。5つのものを見つけて名前を言いましょう。',
      timestamp: new Date(),
      priority: 'high',
    };
    addNotification(emergencyNotification);
  }, [addNotification]);

  return {
    notifications,
    settings,
    setSettings,
    addNotification,
    removeNotification,
    clearAllNotifications,
    requestNotificationPermission,
    triggerEmergencyRealityCheck,
    createRealityCheckNotification,
    createFocusBreakNotification,
    createMindfulnessNotification,
  };
};
