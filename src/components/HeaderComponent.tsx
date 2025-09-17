import React from 'react';
import './HeaderComponent.css';
import VersionInfoComponent from './VersionInfo';
import type { User, Character } from '../types';

interface HeaderComponentProps {
  user: User | null;
  currentCharacter: Character | null;
  showThemeSettings: boolean;
  showFontSettings: boolean;
  showFeatureSettings: boolean;
  handleCharacterHomeToggle: () => void;
  handleLogout: () => void;
  closeOtherFeatures: (activeFeature: string) => void;
  setShowThemeSettings: (show: boolean) => void;
  setShowFontSettings: (show: boolean) => void;
  setShowFeatureSettings: (show: boolean) => void;
  loadUserSettings: () => void;
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({
  user,
  currentCharacter,
  showThemeSettings,
  showFontSettings,
  showFeatureSettings,
  handleCharacterHomeToggle,
  handleLogout,
  closeOtherFeatures,
  setShowThemeSettings,
  setShowFontSettings,
  setShowFeatureSettings,
  loadUserSettings,
}) => {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <div className="character-container">
          <div className="character">
            <div className="character-halo"></div>
            <div className="character-wings">
              <div className="wing left-wing"></div>
              <div className="wing right-wing"></div>
            </div>
            <div className="character-face">
              <div className="character-eyes">
                <div className="eye left-eye"></div>
                <div className="eye right-eye"></div>
              </div>
              <div className="character-mouth"></div>
            </div>
            <div className="character-body"></div>
            <div className="character-arms">
              <div className="arm left-arm"></div>
              <div className="arm right-arm"></div>
            </div>
            <div className="sparkles">
              <div className="sparkle sparkle-1"></div>
              <div className="sparkle sparkle-2"></div>
              <div className="sparkle sparkle-3"></div>
              <div className="sparkle sparkle-4"></div>
              <div className="sparkle sparkle-5"></div>
              <div className="sparkle sparkle-6"></div>
            </div>
          </div>
        </div>
        <h1>Work Time</h1>
      </div>
      <div className="user-info">
        <div className="user-greeting">
          <div className="header-character">
            {currentCharacter ? (
              <div 
                className="current-character-svg"
                dangerouslySetInnerHTML={{ __html: currentCharacter.svg }}
              />
            ) : (
              <div className="default-character">👋</div>
            )}
          </div>
          <span>こんにちは、{user?.displayName || user?.email || 'User'}さん！</span>
        </div>
        <VersionInfoComponent />
        <div className="header-buttons">
          <button 
            onClick={handleCharacterHomeToggle}
            className="character-home-button"
            title="キャラクター達のお家"
          >
            🏠
          </button>
          <button 
            onClick={() => {
              if (!showThemeSettings) {
                closeOtherFeatures('theme-settings');
              }
              setShowThemeSettings(!showThemeSettings);
            }} 
            className="theme-settings-button"
            title="テーマ設定"
          >
            🎨
          </button>
          <button 
            onClick={() => {
              if (!showFontSettings) {
                closeOtherFeatures('font-settings');
              }
              setShowFontSettings(!showFontSettings);
            }} 
            className="font-settings-button"
            title="フォント設定"
          >
            🔤
          </button>
        </div>
        <button 
          onClick={() => {
            closeOtherFeatures('feature-settings');
            setShowFeatureSettings(true);
            loadUserSettings();
          }} 
          className="feature-settings-button"
          title="機能設定"
        >
          ⚙️
        </button>
      </div>
      
      {/* 右上のログアウトボタン */}
      <div className="logout-container">
        <button onClick={handleLogout} className="logout-button">
          🚪
        </button>
      </div>
      
      {/* 右下のヘタウマキャラクター */}
      <div className="bottom-right-character">
        <div className="hetama-character">
          <div className="hetama-halo"></div>
          <div className="hetama-wings">
            <div className="hetama-wing left-hetama-wing"></div>
            <div className="hetama-wing right-hetama-wing"></div>
          </div>
          <div className="hetama-face">
            <div className="hetama-eyes">
              <div className="hetama-eye left-hetama-eye"></div>
              <div className="hetama-eye right-hetama-eye"></div>
            </div>
            <div className="hetama-mouth"></div>
          </div>
          <div className="hetama-body"></div>
          <div className="hetama-arms">
            <div className="hetama-arm left-hetama-arm"></div>
            <div className="hetama-arm right-hetama-arm"></div>
          </div>
          <div className="hetama-legs">
            <div className="hetama-leg left-hetama-leg"></div>
            <div className="hetama-leg right-hetama-leg"></div>
          </div>
          <div className="hetama-sparkles">
            <div className="hetama-sparkle sparkle-1">✨</div>
            <div className="hetama-sparkle sparkle-2">⭐</div>
            <div className="hetama-sparkle sparkle-3">💫</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderComponent;
