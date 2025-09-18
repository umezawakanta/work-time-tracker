import React from "react";
import "./HeaderComponent.css";
import CharacterComponent from "./CharacterComponent";
import HetamaCharacterComponent from "./HetamaCharacterComponent";
import HeaderTitleComponent from "./HeaderTitleComponent";
import LogoutButtonComponent from "./LogoutButtonComponent";
import UserInfoComponent from "./UserInfoComponent";
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
        <CharacterComponent />
      </div>
      <HeaderTitleComponent />
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

      <LogoutButtonComponent onLogout={handleLogout} />

      <HetamaCharacterComponent />
    </header>
  );
};

export default HeaderComponent;
