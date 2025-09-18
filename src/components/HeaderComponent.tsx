import React from "react";
import "./HeaderComponent.css";
import HeaderLeftComponent from "./HeaderLeftComponent";
import HetamaCharacterComponent from "./HetamaCharacterComponent";
import DogCharacterComponent from "./DogCharacterComponent";
import HeaderTitleComponent from "./HeaderTitleComponent";
import LogoutButtonComponent from "./LogoutButtonComponent";
import UserInfoComponent from "./UserInfoComponent";
import ShareButtonComponent from "./ShareButtonComponent";
import type { User, Character } from "../types";
import UserGreetingComponent from "./UserGreetingComponent";

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
      <div className="header-left">
        <HeaderLeftComponent isTimeTrackingActive={isTimeTrackingActive} />
      </div>
      
      {/* 中央：タイトルとグリーティング */}
      <div className="header-center">
        <HeaderTitleComponent />
        <UserGreetingComponent user={user} currentCharacter={currentCharacter} />
      </div>
      
      {/* 右側：アクションボタン */}
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
        <LogoutButtonComponent onLogout={handleLogout} />
      </div>

      {/* 背景キャラクター（絶対保持） */}
      <HetamaCharacterComponent />
      <DogCharacterComponent />
    </header>
  );
};

export default HeaderComponent;
