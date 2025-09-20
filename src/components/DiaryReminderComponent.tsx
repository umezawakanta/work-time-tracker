import React, { useState, useEffect } from 'react';
import './DiaryReminderComponent.css';

interface DiaryReminderComponentProps {
  onReminderDismiss: () => void;
  onReminderSnooze: (minutes: number) => void;
  onReminderDisable: () => void;
}

const DiaryReminderComponent: React.FC<DiaryReminderComponentProps> = ({
  onReminderDismiss,
  onReminderSnooze,
  onReminderDisable,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // リマインダーの表示状態をチェック
    const checkReminderStatus = () => {
      const lastDiaryEntry = localStorage.getItem('lastDiaryEntry');
      const reminderSettings = JSON.parse(localStorage.getItem('diaryReminderSettings') || '{}');
      
      if (!reminderSettings.enabled) {
        return;
      }

      const now = new Date();
      const lastEntry = lastDiaryEntry ? new Date(lastDiaryEntry) : null;
      
      // 最後の日記エントリから指定時間経過しているかチェック
      if (!lastEntry || (now.getTime() - lastEntry.getTime()) > (reminderSettings.intervalHours * 60 * 60 * 1000)) {
        setIsVisible(true);
        
        // カウントダウンタイマーを開始
        const interval = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 0) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        setTimeLeft(reminderSettings.reminderDuration || 300); // デフォルト5分
        
        return () => clearInterval(interval);
      }
    };

    checkReminderStatus();
    
    // 定期的にチェック（5分ごと）
    const interval = setInterval(checkReminderStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSnooze = (minutes: number) => {
    onReminderSnooze(minutes);
    setIsVisible(false);
  };

  const handleDisable = () => {
    onReminderDisable();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    onReminderDismiss();
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="diary-reminder-overlay">
      <div className="diary-reminder-modal">
        <div className="diary-reminder-header">
          <div className="diary-reminder-icon">📝</div>
          <h3>日記を書く時間です！</h3>
        </div>
        
        <div className="diary-reminder-content">
          <p>今日の出来事や気持ちを記録してみませんか？</p>
          <p className="diary-reminder-timer">
            リマインダーは {formatTime(timeLeft)} 後に再表示されます
          </p>
        </div>
        
        <div className="diary-reminder-actions">
          <button 
            className="diary-reminder-btn diary-reminder-btn-primary"
            onClick={handleDismiss}
          >
            日記を書く
          </button>
          
          <div className="diary-reminder-snooze">
            <button 
              className="diary-reminder-btn diary-reminder-btn-secondary"
              onClick={() => handleSnooze(15)}
            >
              15分後
            </button>
            <button 
              className="diary-reminder-btn diary-reminder-btn-secondary"
              onClick={() => handleSnooze(30)}
            >
              30分後
            </button>
            <button 
              className="diary-reminder-btn diary-reminder-btn-secondary"
              onClick={() => handleSnooze(60)}
            >
              1時間後
            </button>
          </div>
          
          <button 
            className="diary-reminder-btn diary-reminder-btn-disabled"
            onClick={handleDisable}
          >
            今日は無効にする
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiaryReminderComponent;
