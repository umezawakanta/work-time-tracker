import React, { useState, useEffect } from 'react';
import { japaneseFonts, englishFonts, FontSettings, DEFAULT_FONT_SETTINGS } from '../constants/fonts';
import './LanguageFontSettings.css';

interface LanguageFontSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: FontSettings) => void;
  currentSettings: FontSettings;
}

const LanguageFontSettings: React.FC<LanguageFontSettingsProps> = ({
  isOpen,
  onClose,
  onSave,
  currentSettings
}) => {
  const [settings, setSettings] = useState<FontSettings>(currentSettings);
  const [activeTab, setActiveTab] = useState<'japanese' | 'english'>('japanese');

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  const handleFontChange = (category: 'japanese' | 'english', value: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleReset = () => {
    setSettings(DEFAULT_FONT_SETTINGS);
  };

  if (!isOpen) return null;

  const currentFonts = activeTab === 'japanese' ? japaneseFonts : englishFonts;
  const currentFont = settings[activeTab];

  return (
    <div className="language-font-modal-overlay">
      <div className="language-font-modal">
        <div className="language-font-header">
          <h3>言語別フォント設定</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="language-font-tabs">
          <button
            className={`tab-button ${activeTab === 'japanese' ? 'active' : ''}`}
            onClick={() => setActiveTab('japanese')}
          >
            🇯🇵 日本語フォント
          </button>
          <button
            className={`tab-button ${activeTab === 'english' ? 'active' : ''}`}
            onClick={() => setActiveTab('english')}
          >
            🇺🇸 英語フォント
          </button>
        </div>

        <div className="language-font-body">
          <div className="font-preview">
            <h4>プレビュー</h4>
            <div className="preview-content">
              <p className="preview-japanese" style={{ fontFamily: settings.japanese === 'system' ? 'var(--japanese-font)' : settings.japanese }}>
                日本語のテキスト - 可愛いキャラクターと一緒に作業時間を管理しよう！
              </p>
              <p className="preview-english" style={{ fontFamily: settings.english === 'system' ? 'var(--english-font)' : settings.english }}>
                English Text - Work Time Tracker with Cute Characters!
              </p>
            </div>
          </div>

          <div className="font-options">
            {currentFonts.map((font) => (
              <label key={font.value} className="font-option">
                <input
                  type="radio"
                  name={`font-${activeTab}`}
                  value={font.value}
                  checked={currentFont === font.value}
                  onChange={(e) => handleFontChange(activeTab, e.target.value)}
                />
                <span
                  style={{
                    fontFamily: font.value === 'system' 
                      ? (activeTab === 'japanese' ? 'var(--japanese-font)' : 'var(--english-font)')
                      : font.value,
                  }}
                >
                  {font.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="language-font-footer">
          <button className="reset-button" onClick={handleReset}>
            リセット
          </button>
          <div className="footer-buttons">
            <button className="cancel-button" onClick={onClose}>
              キャンセル
            </button>
            <button className="save-button" onClick={handleSave}>
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageFontSettings;
