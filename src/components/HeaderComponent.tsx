import React from "react";
import "./HeaderComponent.css";
import HeaderLeftComponent from "./HeaderLeftComponent";
import HetamaCharacterComponent from "./HetamaCharacterComponent";
import DogCharacterComponent from "./DogCharacterComponent";
import HeaderTitleComponent from "./HeaderTitleComponent";
import LogoutButtonComponent from "./LogoutButtonComponent";
import UserInfoComponent from "./UserInfoComponent";
import UserGreetingComponent from "./UserGreetingComponent";
import ShareButtonComponent from "./ShareButtonComponent";
import type { User, Character } from "../types";

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
  isTimeTrackingActive: boolean;
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
  isTimeTrackingActive,
}) => {
  return (
    <header className="dashboard-header">
      {/* 左側：キャラクター（絶対保持） */}
      <HeaderLeftComponent isTimeTrackingActive={isTimeTrackingActive} />
      
      {/* 中央：タイトルと挨拶 */}
      <div className="header-center">
        <HeaderTitleComponent />
        <UserGreetingComponent
          user={user}
          currentCharacter={currentCharacter}
        />
      </div>
      
      {/* 右側：ナビゲーション要素 */}
      <div className="header-right">
        <div className="header-navigation">
          <UserInfoComponent
            user={user}
            currentCharacter={currentCharacter}
            onCharacterHomeToggle={handleCharacterHomeToggle}
            showThemeSettings={showThemeSettings}
            onThemeSettingsToggle={() => {
              if (!showThemeSettings) {
                closeOtherFeatures("theme-settings");
              }
              setShowThemeSettings(!showThemeSettings);
            }}
            showFontSettings={showFontSettings}
            onFontSettingsToggle={() => {
              if (!showFontSettings) {
                closeOtherFeatures("font-settings");
              }
              setShowFontSettings(!showFontSettings);
            }}
            onFeatureSettingsToggle={() => {
              closeOtherFeatures("feature-settings");
              setShowFeatureSettings(true);
              loadUserSettings();
            }}
            closeOtherFeatures={closeOtherFeatures}
            setShowThemeSettings={setShowThemeSettings}
            setShowFontSettings={setShowFontSettings}
            setShowFeatureSettings={setShowFeatureSettings}
            loadUserSettings={loadUserSettings}
          />
          <ShareButtonComponent />
        </div>
        {/* ログアウトボタンを右上に配置 */}
        <div className="header-logout">
          <LogoutButtonComponent onLogout={handleLogout} />
        </div>
      </div>

      {/* 背景キャラクター（絶対保持） */}
      <HetamaCharacterComponent />
      <DogCharacterComponent />
    </header>
  );
};

export default HeaderComponent;
