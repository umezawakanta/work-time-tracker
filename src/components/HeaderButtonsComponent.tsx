import React from 'react';
import './HeaderButtonsComponent.css';

interface HeaderButtonsComponentProps {
  onCharacterHomeToggle: () => void;
  showThemeSettings: boolean;
  onThemeSettingsToggle: () => void;
  showFontSettings: boolean;
  onFontSettingsToggle: () => void;
  onFeatureSettingsToggle: () => void;
}

const HeaderButtonsComponent: React.FC<HeaderButtonsComponentProps> = ({
  onCharacterHomeToggle,
  showThemeSettings,
  onThemeSettingsToggle,
  showFontSettings,
  onFontSettingsToggle,
  onFeatureSettingsToggle,
}) => {
  return (
    <div className="header-buttons">
      <button
        onClick={onCharacterHomeToggle}
        className="character-home-button"
        title="キャラクター達のお家"
      >
        🏠
      </button>
      <button
        onClick={onThemeSettingsToggle}
        className="design-settings-button"
        title="テーマ設定"
      >
        🎨
      </button>
      <button
        onClick={onFontSettingsToggle}
        className="font-settings-button"
        title="フォント設定"
      >
        🔤
      </button>
      <button
        onClick={onFeatureSettingsToggle}
        className="feature-settings-button"
        title="機能設定"
      >
        ⚙️
      </button>
    </div>
  );
};

export default HeaderButtonsComponent;
