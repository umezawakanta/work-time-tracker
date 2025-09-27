import React, { useState, useEffect, useCallback } from 'react';
import { InstrumentType } from './SimpleAudioEngine';
import './ThemeCustomizer.css';

interface ThemeSettings {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    surface: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  effects: {
    animations: boolean;
    shadows: boolean;
    gradients: boolean;
  };
}

interface ThemeCustomizerProps {
  onThemeChange: (theme: ThemeSettings) => void;
  currentTheme?: ThemeSettings;
  className?: string;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  onThemeChange,
  currentTheme,
  className = ''
}) => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeSettings | null>(currentTheme || null);
  const [customColors, setCustomColors] = useState({
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb',
    background: '#f5f7fa',
    text: '#333333',
    surface: '#ffffff'
  });
  const [customFonts, setCustomFonts] = useState({
    primary: 'Inter',
    secondary: 'Roboto'
  });
  const [customEffects, setCustomEffects] = useState({
    animations: true,
    shadows: true,
    gradients: true
  });
  const [isCustomizing, setIsCustomizing] = useState(false);

  // プリセットテーマ
  const presetThemes: ThemeSettings[] = [
    {
      id: 'default',
      name: 'デフォルト',
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#f093fb',
        background: '#f5f7fa',
        text: '#333333',
        surface: '#ffffff'
      },
      fonts: {
        primary: 'Inter',
        secondary: 'Roboto'
      },
      effects: {
        animations: true,
        shadows: true,
        gradients: true
      }
    },
    {
      id: 'dark',
      name: 'ダークモード',
      colors: {
        primary: '#4a90e2',
        secondary: '#7b68ee',
        accent: '#ff6b6b',
        background: '#1a1a1a',
        text: '#ffffff',
        surface: '#2d2d2d'
      },
      fonts: {
        primary: 'Inter',
        secondary: 'Roboto'
      },
      effects: {
        animations: true,
        shadows: true,
        gradients: true
      }
    },
    {
      id: 'meiwa',
      name: '明和電機風',
      colors: {
        primary: '#ff69b4',
        secondary: '#ff1493',
        accent: '#00ffff',
        background: '#000000',
        text: '#ffffff',
        surface: '#1a1a1a'
      },
      fonts: {
        primary: 'Courier New',
        secondary: 'monospace'
      },
      effects: {
        animations: true,
        shadows: false,
        gradients: false
      }
    },
    {
      id: 'classical',
      name: 'クラシック',
      colors: {
        primary: '#8b4513',
        secondary: '#daa520',
        accent: '#cd853f',
        background: '#f5f5dc',
        text: '#2f4f4f',
        surface: '#ffffff'
      },
      fonts: {
        primary: 'Times New Roman',
        secondary: 'serif'
      },
      effects: {
        animations: false,
        shadows: true,
        gradients: false
      }
    },
    {
      id: 'neon',
      name: 'ネオン',
      colors: {
        primary: '#00ffff',
        secondary: '#ff00ff',
        accent: '#ffff00',
        background: '#000000',
        text: '#ffffff',
        surface: '#1a0033'
      },
      fonts: {
        primary: 'Orbitron',
        secondary: 'Exo'
      },
      effects: {
        animations: true,
        shadows: true,
        gradients: true
      }
    }
  ];

  // テーマの適用
  const applyTheme = useCallback((theme: ThemeSettings) => {
    const root = document.documentElement;
    
    // CSS変数の設定
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-background', theme.colors.background);
    root.style.setProperty('--theme-text', theme.colors.text);
    root.style.setProperty('--theme-surface', theme.colors.surface);
    root.style.setProperty('--theme-font-primary', theme.fonts.primary);
    root.style.setProperty('--theme-font-secondary', theme.fonts.secondary);
    
    // エフェクトの設定
    root.style.setProperty('--theme-animations', theme.effects.animations ? '1' : '0');
    root.style.setProperty('--theme-shadows', theme.effects.shadows ? '1' : '0');
    root.style.setProperty('--theme-gradients', theme.effects.gradients ? '1' : '0');
    
    // ローカルストレージに保存
    localStorage.setItem('sound-app-theme', JSON.stringify(theme));
    
    setSelectedTheme(theme);
    onThemeChange(theme);
  }, [onThemeChange]);

  // カスタムテーマの作成
  const createCustomTheme = useCallback(() => {
    const customTheme: ThemeSettings = {
      id: 'custom',
      name: 'カスタム',
      colors: customColors,
      fonts: customFonts,
      effects: customEffects
    };
    
    applyTheme(customTheme);
    setIsCustomizing(false);
  }, [customColors, customFonts, customEffects, applyTheme]);

  // 初期化
  useEffect(() => {
    const savedTheme = localStorage.getItem('sound-app-theme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        applyTheme(theme);
      } catch (error) {
        console.error('Failed to load saved theme:', error);
        applyTheme(presetThemes[0]);
      }
    } else {
      applyTheme(presetThemes[0]);
    }
  }, [applyTheme]);

  // カラーピッカーの変更ハンドラー
  const handleColorChange = useCallback((colorKey: keyof typeof customColors, value: string) => {
    setCustomColors(prev => ({
      ...prev,
      [colorKey]: value
    }));
  }, []);

  // フォントの変更ハンドラー
  const handleFontChange = useCallback((fontKey: keyof typeof customFonts, value: string) => {
    setCustomFonts(prev => ({
      ...prev,
      [fontKey]: value
    }));
  }, []);

  // エフェクトの変更ハンドラー
  const handleEffectChange = useCallback((effectKey: keyof typeof customEffects, value: boolean) => {
    setCustomEffects(prev => ({
      ...prev,
      [effectKey]: value
    }));
  }, []);

  return (
    <div className={`theme-customizer ${className}`}>
      <div className="theme-customizer-header">
        <h3>🎨 テーマカスタマイザー</h3>
        <button
          onClick={() => setIsCustomizing(!isCustomizing)}
          className="customize-button"
        >
          {isCustomizing ? '完了' : 'カスタマイズ'}
        </button>
      </div>

      {/* プリセットテーマ選択 */}
      <div className="preset-themes">
        <h4>プリセットテーマ</h4>
        <div className="theme-grid">
          {presetThemes.map((theme) => (
            <div
              key={theme.id}
              className={`theme-card ${selectedTheme?.id === theme.id ? 'selected' : ''}`}
              onClick={() => applyTheme(theme)}
            >
              <div className="theme-preview">
                <div 
                  className="theme-color primary" 
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <div 
                  className="theme-color secondary" 
                  style={{ backgroundColor: theme.colors.secondary }}
                />
                <div 
                  className="theme-color accent" 
                  style={{ backgroundColor: theme.colors.accent }}
                />
              </div>
              <div className="theme-name">{theme.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* カスタムテーマ設定 */}
      {isCustomizing && (
        <div className="custom-theme-settings">
          <h4>カスタムテーマ設定</h4>
          
          {/* カラー設定 */}
          <div className="color-settings">
            <h5>カラー</h5>
            <div className="color-grid">
              {Object.entries(customColors).map(([key, value]) => (
                <div key={key} className="color-input-group">
                  <label htmlFor={`color-${key}`}>
                    {key === 'primary' ? 'プライマリ' :
                     key === 'secondary' ? 'セカンダリ' :
                     key === 'accent' ? 'アクセント' :
                     key === 'background' ? '背景' :
                     key === 'text' ? 'テキスト' :
                     key === 'surface' ? 'サーフェス' : key}
                  </label>
                  <input
                    id={`color-${key}`}
                    type="color"
                    value={value}
                    onChange={(e) => handleColorChange(key as keyof typeof customColors, e.target.value)}
                    className="color-input"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleColorChange(key as keyof typeof customColors, e.target.value)}
                    className="color-text"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* フォント設定 */}
          <div className="font-settings">
            <h5>フォント</h5>
            <div className="font-input-group">
              <label htmlFor="font-primary">プライマリフォント</label>
              <select
                id="font-primary"
                value={customFonts.primary}
                onChange={(e) => handleFontChange('primary', e.target.value)}
                className="font-select"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="monospace">monospace</option>
              </select>
            </div>
            <div className="font-input-group">
              <label htmlFor="font-secondary">セカンダリフォント</label>
              <select
                id="font-secondary"
                value={customFonts.secondary}
                onChange={(e) => handleFontChange('secondary', e.target.value)}
                className="font-select"
              >
                <option value="Roboto">Roboto</option>
                <option value="Inter">Inter</option>
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="serif">serif</option>
              </select>
            </div>
          </div>

          {/* エフェクト設定 */}
          <div className="effect-settings">
            <h5>エフェクト</h5>
            <div className="effect-checkboxes">
              <label className="effect-checkbox">
                <input
                  type="checkbox"
                  checked={customEffects.animations}
                  onChange={(e) => handleEffectChange('animations', e.target.checked)}
                />
                <span>アニメーション</span>
              </label>
              <label className="effect-checkbox">
                <input
                  type="checkbox"
                  checked={customEffects.shadows}
                  onChange={(e) => handleEffectChange('shadows', e.target.checked)}
                />
                <span>シャドウ</span>
              </label>
              <label className="effect-checkbox">
                <input
                  type="checkbox"
                  checked={customEffects.gradients}
                  onChange={(e) => handleEffectChange('gradients', e.target.checked)}
                />
                <span>グラデーション</span>
              </label>
            </div>
          </div>

          {/* カスタムテーマ適用ボタン */}
          <button
            onClick={createCustomTheme}
            className="apply-custom-button"
          >
            🎨 カスタムテーマを適用
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeCustomizer;
