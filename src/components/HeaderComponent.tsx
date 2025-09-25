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
import VersionInfoComponent from "./VersionInfo";

interface HeaderComponentProps {
  user: User | null;
  isLoggedIn: boolean;
  onShowCharacterHome: () => void;
  onShowProjects: () => void;
  onShowCookingTimer: () => void;
  onShowSelfAnalysis: () => void;
  onShowBookshelf: () => void;
  onShowMemos: () => void;
  onShowReports: () => void;
  onShowAdminPanel: () => void;
  onShowTimeTracking: () => void;
  onShowTimers: () => void;
  onShowPublicMemos: () => void;
  onShowWorkRecords: () => void;
  onShowSoundApp: () => void;
  onShowNotifications: () => void;
  onShowVersionInfo: () => void;
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
  onUpdateRequestClick: () => void;
  onBugReportClick: () => void;
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({
  user,
  isLoggedIn,
  onShowCharacterHome,
  onShowProjects,
  onShowCookingTimer,
  onShowSelfAnalysis,
  onShowBookshelf,
  onShowMemos,
  onShowReports,
  onShowAdminPanel,
  onShowTimeTracking,
  onShowTimers,
  onShowPublicMemos,
  onShowWorkRecords,
  onShowSoundApp,
  onShowNotifications,
  onShowVersionInfo,
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
  onUpdateRequestClick,
  onBugReportClick,
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
              if (closeOtherFeatures) {
                closeOtherFeatures("theme-settings");
              }
            }}
            showFontSettings={showFontSettings}
            onFontSettingsToggle={() => {
              if (closeOtherFeatures) {
                closeOtherFeatures("font-settings");
              }
            }}
            onFeatureSettingsToggle={() => {
              if (closeOtherFeatures) {
                closeOtherFeatures("feature-settings");
              }
              if (loadUserSettings) {
                loadUserSettings();
              }
            }}
            closeOtherFeatures={closeOtherFeatures}
            setShowThemeSettings={setShowThemeSettings}
            setShowFontSettings={setShowFontSettings}
            setShowFeatureSettings={setShowFeatureSettings}
            loadUserSettings={loadUserSettings}
          />
          
          {/* メインナビゲーションボタン */}
          <div className="main-navigation">
            <button onClick={onShowProjects} className="nav-button" title="プロジェクト">
              📁
            </button>
            <button onClick={onShowMemos} className="nav-button" title="メモ">
              📝
            </button>
            <button onClick={onShowReports} className="nav-button" title="レポート">
              📊
            </button>
            <button onClick={onShowSelfAnalysis} className="nav-button" title="自己分析">
              🔍
            </button>
            <button onClick={onShowBookshelf} className="nav-button" title="本棚">
              📚
            </button>
            <button onClick={onShowCookingTimer} className="nav-button" title="料理タイマー">
              ⏰
            </button>
            <button onClick={onShowTimeTracking} className="nav-button" title="時間追跡">
              ⏱️
            </button>
            <button onClick={onShowTimers} className="nav-button" title="タイマー">
              ⏲️
            </button>
            <button onClick={onShowPublicMemos} className="nav-button" title="公開メモ">
              🌐
            </button>
            <button onClick={onShowWorkRecords} className="nav-button" title="仕事記録">
              💼
            </button>
            <button onClick={onShowSoundApp} className="nav-button" title="音アプリ">
              🎵
            </button>
            <button onClick={onShowAdminPanel} className="nav-button" title="管理パネル">
              ⚙️
            </button>
            <button onClick={onShowNotifications} className="nav-button" title="通知">
              🔔
            </button>
            <button onClick={onShowVersionInfo} className="nav-button" title="バージョン情報">
              ℹ️
            </button>
          </div>
        </div>
      </div>

      {/* 右上固定：シェアボタン、不具合報告ボタン、更新要望ボタン、ログアウトボタン */}
      <div className="header-top-right">
        <ShareButtonComponent />
        <button
          onClick={onBugReportClick}
          className="bug-report-button"
          title="不具合を報告"
        >
          <i className="bi bi-bug"></i>
          <span>不具合報告</span>
        </button>
        <button
          onClick={onUpdateRequestClick}
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
    </header>
  );
};

export default HeaderComponent;
