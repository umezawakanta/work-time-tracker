import React, { useState } from "react";
import "./HeaderComponent.css";
import HeaderLeftComponent from "./HeaderLeftComponent";
import HetamaCharacterComponent from "./HetamaCharacterComponent";
import DogCharacterComponent from "./DogCharacterComponent";
import HeaderTitleComponent from "./HeaderTitleComponent";
import LogoutButtonComponent from "./LogoutButtonComponent";
import UserInfoComponent from "./UserInfoComponent";
import UserGreetingComponent from "./UserGreetingComponent";
import ShareButtonComponent from "./ShareButtonComponent";
import UpdateRequestModal from "./UpdateRequestModal";
import BugReportModal from "./BugReportModal";
import type { User } from "../types";
import type { Character } from "../types/character";
import VersionInfoComponent from "./VersionInfo";

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
  handleUpdateRequest: (updateRequest: any) => Promise<void>;
  handleBugReport: (bugReport: any) => Promise<void>;
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
  handleUpdateRequest,
  handleBugReport,
}) => {
  // 更新要望モーダルの状態をHeaderComponent内で管理
  const [showUpdateRequestModal, setShowUpdateRequestModal] = useState(false);
  // 不具合報告モーダルの状態をHeaderComponent内で管理
  const [showBugReportModal, setShowBugReportModal] = useState(false);
  return (
    <header className="dashboard-header">
      {/* 左側：キャラクター（絶対保持） */}
      <HeaderLeftComponent 
        isTimeTrackingActive={isTimeTrackingActive}
        currentCharacter={currentCharacter}
        showCharacterInfo={true}
      />
      
      {/* 中央：タイトルと挨拶 */}
      <div className="header-center">
        <HeaderTitleComponent />
        <UserGreetingComponent
          user={user}
          currentCharacter={currentCharacter}
        />
        <VersionInfoComponent />
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
        </div>
      </div>

      {/* 右上固定：シェアボタン、不具合報告ボタン、更新要望ボタン、ログアウトボタン */}
      <div className="header-top-right">
        <ShareButtonComponent />
        <button
          onClick={() => setShowBugReportModal(true)}
          className="bug-report-button"
          title="不具合を報告"
        >
          <i className="bi bi-bug"></i>
          <span>不具合報告</span>
        </button>
        <button
          onClick={() => setShowUpdateRequestModal(true)}
          className="update-request-button"
          title="更新要望を送信"
        >
          <i className="bi bi-lightbulb"></i>
          <span>更新要望</span>
        </button>
        <LogoutButtonComponent onLogout={handleLogout} />
      </div>

      {/* 背景キャラクター（絶対保持） */}
      <HetamaCharacterComponent />
      <DogCharacterComponent />

      {/* 更新要望モーダル */}
      <UpdateRequestModal
        isOpen={showUpdateRequestModal}
        onClose={() => setShowUpdateRequestModal(false)}
        onSubmit={async (updateRequest) => {
          await handleUpdateRequest(updateRequest);
          setShowUpdateRequestModal(false);
        }}
      />

      {/* 不具合報告モーダル */}
      <BugReportModal
        isOpen={showBugReportModal}
        onClose={() => setShowBugReportModal(false)}
        onSubmit={async (bugReport) => {
          await handleBugReport(bugReport);
          setShowBugReportModal(false);
        }}
      />
    </header>
  );
};

export default HeaderComponent;
