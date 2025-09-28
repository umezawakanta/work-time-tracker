import React, { useState, useEffect } from 'react';
import './AccessibilitySettings.css';

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: AccessibilitySettings) => void;
  currentSettings: AccessibilitySettings;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  focusIndicator: boolean;
  screenReader: boolean;
  colorBlindSupport: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  lineHeight: 'tight' | 'normal' | 'relaxed' | 'loose';
  letterSpacing: 'tight' | 'normal' | 'wide';
  wordSpacing: 'tight' | 'normal' | 'wide';
}

const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  focusIndicator: true,
  screenReader: false,
  colorBlindSupport: 'none',
  fontSize: 'medium',
  lineHeight: 'normal',
  letterSpacing: 'normal',
  wordSpacing: 'normal'
};

const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  isOpen,
  onClose,
  onSettingsChange,
  currentSettings
}) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(currentSettings);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  useEffect(() => {
    if (isOpen) {
      applyAccessibilitySettings(settings);
    }
  }, [isOpen, settings]);

  const applyAccessibilitySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // 高コントラスト
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // 大きな文字
    if (newSettings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // 動きの削減
    if (newSettings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // フォーカスインジケーター
    if (newSettings.focusIndicator) {
      root.classList.add('focus-indicator');
    } else {
      root.classList.remove('focus-indicator');
    }

    // スクリーンリーダー
    if (newSettings.screenReader) {
      root.classList.add('screen-reader');
    } else {
      root.classList.remove('screen-reader');
    }

    // 色覚異常サポート
    root.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    if (newSettings.colorBlindSupport !== 'none') {
      root.classList.add(newSettings.colorBlindSupport);
    }

    // フォントサイズ
    const fontSizeMap = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '20px'
    };
    root.style.setProperty('--accessibility-font-size', fontSizeMap[newSettings.fontSize]);

    // 行間
    const lineHeightMap = {
      'tight': '1.2',
      'normal': '1.5',
      'relaxed': '1.8',
      'loose': '2.0'
    };
    root.style.setProperty('--accessibility-line-height', lineHeightMap[newSettings.lineHeight]);

    // 文字間隔
    const letterSpacingMap = {
      'tight': '-0.025em',
      'normal': '0',
      'wide': '0.025em'
    };
    root.style.setProperty('--accessibility-letter-spacing', letterSpacingMap[newSettings.letterSpacing]);

    // 単語間隔
    const wordSpacingMap = {
      'tight': '-0.05em',
      'normal': '0',
      'wide': '0.05em'
    };
    root.style.setProperty('--accessibility-word-spacing', wordSpacingMap[newSettings.wordSpacing]);
  };

  const handleSettingChange = (key: keyof AccessibilitySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleReset = () => {
    setSettings(DEFAULT_ACCESSIBILITY_SETTINGS);
    onSettingsChange(DEFAULT_ACCESSIBILITY_SETTINGS);
  };

  const handleSave = () => {
    onSettingsChange(settings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="accessibility-settings-overlay">
      <div className="accessibility-settings-modal">
        <div className="accessibility-settings-header">
          <h3>♿ アクセシビリティ設定</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="accessibility-settings-body">
          <div className="settings-section">
            <h4>視覚的設定</h4>
            
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
                  className="setting-checkbox"
                />
                <span className="setting-text">高コントラスト</span>
              </label>
              <p className="setting-description">背景と文字のコントラストを高くして視認性を向上させます</p>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.largeText}
                  onChange={(e) => handleSettingChange('largeText', e.target.checked)}
                  className="setting-checkbox"
                />
                <span className="setting-text">大きな文字</span>
              </label>
              <p className="setting-description">文字サイズを大きくして読みやすくします</p>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <span className="setting-text">フォントサイズ</span>
                <select
                  value={settings.fontSize}
                  onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                  className="setting-select"
                >
                  <option value="small">小 (14px)</option>
                  <option value="medium">中 (16px)</option>
                  <option value="large">大 (18px)</option>
                  <option value="extra-large">特大 (20px)</option>
                </select>
              </label>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <span className="setting-text">行間</span>
                <select
                  value={settings.lineHeight}
                  onChange={(e) => handleSettingChange('lineHeight', e.target.value)}
                  className="setting-select"
                >
                  <option value="tight">詰める (1.2)</option>
                  <option value="normal">標準 (1.5)</option>
                  <option value="relaxed">広め (1.8)</option>
                  <option value="loose">広い (2.0)</option>
                </select>
              </label>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <span className="setting-text">文字間隔</span>
                <select
                  value={settings.letterSpacing}
                  onChange={(e) => handleSettingChange('letterSpacing', e.target.value)}
                  className="setting-select"
                >
                  <option value="tight">詰める</option>
                  <option value="normal">標準</option>
                  <option value="wide">広める</option>
                </select>
              </label>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <span className="setting-text">単語間隔</span>
                <select
                  value={settings.wordSpacing}
                  onChange={(e) => handleSettingChange('wordSpacing', e.target.value)}
                  className="setting-select"
                >
                  <option value="tight">詰める</option>
                  <option value="normal">標準</option>
                  <option value="wide">広める</option>
                </select>
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h4>色覚サポート</h4>
            
            <div className="setting-item">
              <label className="setting-label">
                <span className="setting-text">色覚異常サポート</span>
                <select
                  value={settings.colorBlindSupport}
                  onChange={(e) => handleSettingChange('colorBlindSupport', e.target.value)}
                  className="setting-select"
                >
                  <option value="none">なし</option>
                  <option value="protanopia">第一色覚異常（赤緑）</option>
                  <option value="deuteranopia">第二色覚異常（緑赤）</option>
                  <option value="tritanopia">第三色覚異常（青黄）</option>
                </select>
              </label>
              <p className="setting-description">色覚異常の方でも見やすい色合いに調整します</p>
            </div>
          </div>

          <div className="settings-section">
            <h4>操作設定</h4>
            
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
                  className="setting-checkbox"
                />
                <span className="setting-text">動きを減らす</span>
              </label>
              <p className="setting-description">アニメーションやトランジションを最小限にします</p>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.focusIndicator}
                  onChange={(e) => handleSettingChange('focusIndicator', e.target.checked)}
                  className="setting-checkbox"
                />
                <span className="setting-text">フォーカス表示</span>
              </label>
              <p className="setting-description">キーボードナビゲーション時のフォーカスを強調表示します</p>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.screenReader}
                  onChange={(e) => handleSettingChange('screenReader', e.target.checked)}
                  className="setting-checkbox"
                />
                <span className="setting-text">スクリーンリーダー対応</span>
              </label>
              <p className="setting-description">スクリーンリーダーでの読み上げを最適化します</p>
            </div>
          </div>

          <div className="preview-section">
            <h4>プレビュー</h4>
            <div className="accessibility-preview">
              <p>これはアクセシビリティ設定のプレビューです。</p>
              <p>文字の大きさ、行間、間隔が設定に応じて変更されます。</p>
              <button className="preview-button">ボタンの例</button>
            </div>
          </div>
        </div>

        <div className="accessibility-settings-footer">
          <button className="reset-button" onClick={handleReset}>
            リセット
          </button>
          <button className="save-button" onClick={handleSave}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilitySettings;
