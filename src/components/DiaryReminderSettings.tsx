import React, { useState, useEffect } from 'react';
import './DiaryReminderSettings.css';

interface DiaryReminderSettingsProps {
  onClose: () => void;
}

interface ReminderSettings {
  enabled: boolean;
  intervalHours: number;
  reminderDuration: number;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const DiaryReminderSettings: React.FC<DiaryReminderSettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<ReminderSettings>({
    enabled: true,
    intervalHours: 24,
    reminderDuration: 300,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });

  useEffect(() => {
    // 保存された設定を読み込み
    const savedSettings = localStorage.getItem('diaryReminderSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('diaryReminderSettings', JSON.stringify(settings));
    onClose();
  };

  const handleReset = () => {
    setSettings({
      enabled: true,
      intervalHours: 24,
      reminderDuration: 300,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
    });
  };

  const updateSettings = (updates: Partial<ReminderSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const updateQuietHours = (updates: Partial<ReminderSettings['quietHours']>) => {
    setSettings(prev => ({
      ...prev,
      quietHours: { ...prev.quietHours, ...updates }
    }));
  };

  return (
    <div className="diary-reminder-settings-overlay">
      <div className="diary-reminder-settings-modal">
        <div className="diary-reminder-settings-header">
          <h2>📝 日記リマインダー設定</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="diary-reminder-settings-content">
          {/* 基本設定 */}
          <div className="settings-section">
            <h3>基本設定</h3>
            
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => updateSettings({ enabled: e.target.checked })}
                />
                <span className="checkmark"></span>
                リマインダーを有効にする
              </label>
            </div>
            
            <div className="setting-item">
              <label className="setting-label">
                リマインダー間隔
                <select
                  value={settings.intervalHours}
                  onChange={(e) => updateSettings({ intervalHours: parseInt(e.target.value) })}
                  disabled={!settings.enabled}
                >
                  <option value={6}>6時間</option>
                  <option value={12}>12時間</option>
                  <option value={24}>24時間</option>
                  <option value={48}>48時間</option>
                  <option value={72}>72時間</option>
                </select>
              </label>
            </div>
            
            <div className="setting-item">
              <label className="setting-label">
                リマインダー表示時間
                <select
                  value={settings.reminderDuration}
                  onChange={(e) => updateSettings({ reminderDuration: parseInt(e.target.value) })}
                  disabled={!settings.enabled}
                >
                  <option value={180}>3分</option>
                  <option value={300}>5分</option>
                  <option value={600}>10分</option>
                  <option value={900}>15分</option>
                  <option value={1800}>30分</option>
                </select>
              </label>
            </div>
          </div>
          
          {/* 静寂時間設定 */}
          <div className="settings-section">
            <h3>静寂時間設定</h3>
            
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.quietHours.enabled}
                  onChange={(e) => updateQuietHours({ enabled: e.target.checked })}
                />
                <span className="checkmark"></span>
                静寂時間を設定する
              </label>
            </div>
            
            {settings.quietHours.enabled && (
              <div className="quiet-hours-settings">
                <div className="setting-item">
                  <label className="setting-label">
                    開始時間
                    <input
                      type="time"
                      value={settings.quietHours.start}
                      onChange={(e) => updateQuietHours({ start: e.target.value })}
                    />
                  </label>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">
                    終了時間
                    <input
                      type="time"
                      value={settings.quietHours.end}
                      onChange={(e) => updateQuietHours({ end: e.target.value })}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="diary-reminder-settings-actions">
          <button className="btn btn-secondary" onClick={handleReset}>
            リセット
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiaryReminderSettings;
