import React from 'react';
import './UserInfoComponent.css';
import HeaderButtonsComponent from './HeaderButtonsComponent';
import type { User, Character } from '../types';

interface UserInfoComponentProps {
  user: User | null;
  currentCharacter: Character | null;
  onCharacterHomeToggle: () => void;
  showThemeSettings: boolean;
  onThemeSettingsToggle: () => void;
  showFontSettings: boolean;
  onFontSettingsToggle: () => void;
  onFeatureSettingsToggle: () => void;
  closeOtherFeatures: (feature: string) => void;
  setShowThemeSettings: (show: boolean) => void;
  setShowFontSettings: (show: boolean) => void;
  setShowFeatureSettings: (show: boolean) => void;
  loadUserSettings: () => void;
}

const UserInfoComponent: React.FC<UserInfoComponentProps> = ({
  user,
  currentCharacter,
  onCharacterHomeToggle,
  showThemeSettings,
  onThemeSettingsToggle,
  showFontSettings,
  onFontSettingsToggle,
  onFeatureSettingsToggle,
  closeOtherFeatures,
  setShowThemeSettings,
  setShowFontSettings,
  setShowFeatureSettings,
  loadUserSettings,
}) => {
  return (
    <div className="user-info">
      <HeaderButtonsComponent
        onCharacterHomeToggle={onCharacterHomeToggle}
        showThemeSettings={showThemeSettings}
        onThemeSettingsToggle={onThemeSettingsToggle}
        showFontSettings={showFontSettings}
        onFontSettingsToggle={onFontSettingsToggle}
        onFeatureSettingsToggle={onFeatureSettingsToggle}
      />
    </div>
  );
};

export default UserInfoComponent;
