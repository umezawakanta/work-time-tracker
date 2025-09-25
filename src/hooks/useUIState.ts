import { useState, useEffect } from 'react';
import { UserSettings, Feature } from '../types';
import { AUTH_CONSTANTS } from '../constants/auth';
import { availableThemes } from '../constants/themes';
import { availableFonts, FontSettings, DEFAULT_FONT_SETTINGS } from '../constants/fonts';

// 機能ID定数
export const FEATURE_IDS = {
  CHARACTER_HOME: 'character-home',
  PROJECTS: 'projects',
  COOKING_TIMER: 'cooking-timer',
  SELF_ANALYSIS: 'self-analysis',
  BOOKSHELF: 'bookshelf',
  MEMOS: 'memos',
  REPORTS: 'reports',
  ADMIN_PANEL: 'admin-panel',
  TIME_TRACKING: 'time-tracking',
  TIMERS: 'timers',
  PUBLIC_MEMOS: 'public-memos',
  WORK_RECORDS: 'work-records',
  SOUND_APP: 'sound-app',
  NOTIFICATIONS: 'notifications',
  VERSION_INFO: 'version-info',
  THEME_SETTINGS: 'theme-settings',
  FONT_SETTINGS: 'font-settings',
  FEATURE_SETTINGS: 'feature-settings',
} as const;

export const useUIState = () => {
  // デバッグログの追加
  useEffect(() => {
    console.log('useUIState - Initialized');
  }, []);

  // 機能表示状態
  const [showCharacterHome, setShowCharacterHome] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showCookingTimer, setShowCookingTimer] = useState(false);
  const [showSelfAnalysis, setShowSelfAnalysis] = useState(false);
  const [showBookshelf, setShowBookshelf] = useState(false);
  const [showMemos, setShowMemos] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showTimeTracking, setShowTimeTracking] = useState(false);
  const [showTimers, setShowTimers] = useState(false);
  const [showPublicMemos, setShowPublicMemos] = useState(false);
  const [showWorkRecords, setShowWorkRecords] = useState(false);
  const [showSoundApp, setShowSoundApp] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showVersionInfo, setShowVersionInfo] = useState(false);
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [showFontSettings, setShowFontSettings] = useState(false);
  const [showFeatureSettings, setShowFeatureSettings] = useState(false);

  // ドラッグ&ドロップ状態
  const [draggedFeature, setDraggedFeature] = useState<string | null>(null);

  // ユーザー設定
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  // テーマとフォント設定
  const [currentTheme, setCurrentTheme] = useState('default');
  const [fontSettings, setFontSettings] = useState<FontSettings>(DEFAULT_FONT_SETTINGS);

  // 機能の並び順
  const [featureOrder, setFeatureOrder] = useState<string[]>([]);

  // デフォルトユーザー設定
  const getDefaultUserSettings = (): UserSettings => ({
    theme: 'default',
    language: 'ja',
    fontSize: 'medium',
    fontFamily: 'default',
    languageFonts: {
      japanese: 'default',
      english: 'default',
      chinese: 'default',
      korean: 'default',
    },
    featureOrder: [
      FEATURE_IDS.CHARACTER_HOME,
      FEATURE_IDS.PROJECTS,
      FEATURE_IDS.COOKING_TIMER,
      FEATURE_IDS.SELF_ANALYSIS,
      FEATURE_IDS.BOOKSHELF,
      FEATURE_IDS.MEMOS,
      FEATURE_IDS.REPORTS,
      FEATURE_IDS.ADMIN_PANEL,
      FEATURE_IDS.TIME_TRACKING,
      FEATURE_IDS.TIMERS,
      FEATURE_IDS.PUBLIC_MEMOS,
      FEATURE_IDS.WORK_RECORDS,
      FEATURE_IDS.SOUND_APP,
      FEATURE_IDS.NOTIFICATIONS,
      FEATURE_IDS.VERSION_INFO,
    ],
    enabledFeatures: [
      FEATURE_IDS.CHARACTER_HOME,
      FEATURE_IDS.PROJECTS,
      FEATURE_IDS.COOKING_TIMER,
      FEATURE_IDS.SELF_ANALYSIS,
      FEATURE_IDS.BOOKSHELF,
      FEATURE_IDS.MEMOS,
      FEATURE_IDS.REPORTS,
      FEATURE_IDS.TIME_TRACKING,
      FEATURE_IDS.TIMERS,
      FEATURE_IDS.PUBLIC_MEMOS,
      FEATURE_IDS.WORK_RECORDS,
      FEATURE_IDS.SOUND_APP,
      FEATURE_IDS.NOTIFICATIONS,
      FEATURE_IDS.VERSION_INFO,
    ],
  });

  // 機能の並び順変更
  const handleFeatureReorder = (newOrder: string[]) => {
    setFeatureOrder(newOrder);
    if (userSettings) {
      const updatedSettings = { ...userSettings, featureOrder: newOrder };
      setUserSettings(updatedSettings);
      // ここでサーバーに保存する処理を追加
    }
  };

  // 機能の表示切り替え
  const handleFeatureToggle = async (featureId: string) => {
    if (!userSettings) {
      return;
    }
    
    const updatedSettings = { ...userSettings };
    if (updatedSettings.enabledFeatures.includes(featureId)) {
      updatedSettings.enabledFeatures = updatedSettings.enabledFeatures.filter(id => id !== featureId);
    } else {
      updatedSettings.enabledFeatures = [...updatedSettings.enabledFeatures, featureId];
    }
    setUserSettings(updatedSettings);
    
    // サーバーに保存する処理
    try {
      const token = localStorage.getItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
      if (token) {
        await fetch('/api/user-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updatedSettings),
        });
      }
    } catch (error) {
      console.error('Failed to save user settings:', error);
    }
  };

  // 他の機能を閉じる
  const closeOtherFeatures = (activeFeature: string) => {
    console.log('useUIState - closeOtherFeatures called with:', activeFeature);
    setShowCharacterHome(activeFeature === FEATURE_IDS.CHARACTER_HOME);
    setShowProjects(activeFeature === FEATURE_IDS.PROJECTS);
    setShowCookingTimer(activeFeature === FEATURE_IDS.COOKING_TIMER);
    setShowSelfAnalysis(activeFeature === FEATURE_IDS.SELF_ANALYSIS);
    setShowBookshelf(activeFeature === FEATURE_IDS.BOOKSHELF);
    setShowMemos(activeFeature === FEATURE_IDS.MEMOS);
    setShowReports(activeFeature === FEATURE_IDS.REPORTS);
    setShowAdminPanel(activeFeature === FEATURE_IDS.ADMIN_PANEL);
    setShowTimeTracking(activeFeature === FEATURE_IDS.TIME_TRACKING);
    setShowTimers(activeFeature === FEATURE_IDS.TIMERS);
    setShowPublicMemos(activeFeature === FEATURE_IDS.PUBLIC_MEMOS);
    setShowWorkRecords(activeFeature === FEATURE_IDS.WORK_RECORDS);
    setShowSoundApp(activeFeature === FEATURE_IDS.SOUND_APP);
    setShowNotifications(activeFeature === FEATURE_IDS.NOTIFICATIONS);
    setShowVersionInfo(activeFeature === FEATURE_IDS.VERSION_INFO);
    setShowThemeSettings(activeFeature === FEATURE_IDS.THEME_SETTINGS);
    setShowFontSettings(activeFeature === FEATURE_IDS.FONT_SETTINGS);
    setShowFeatureSettings(activeFeature === FEATURE_IDS.FEATURE_SETTINGS);
    console.log('useUIState - Theme settings will be:', activeFeature === FEATURE_IDS.THEME_SETTINGS);
  };

  // テーマ適用
  const applyTheme = (themeValue: string) => {
    setCurrentTheme(themeValue);
    const theme = availableThemes.find(t => t.id === themeValue);
    if (theme) {
      document.documentElement.style.setProperty('--primary-color', theme.colors.primary);
      document.documentElement.style.setProperty('--secondary-color', theme.colors.secondary);
      document.documentElement.style.setProperty('--background-color', theme.colors.background);
      document.documentElement.style.setProperty('--text-color', theme.colors.text);
    }
  };

  // フォント適用
  const applyFont = (fontValue: string) => {
    const font = availableFonts.find(f => f.id === fontValue);
    if (font) {
      document.documentElement.style.setProperty('--font-family', font.family);
    }
  };

  // 言語フォント適用
  const applyLanguageFonts = (settings: FontSettings) => {
    Object.entries(settings.languageFonts).forEach(([language, fontId]) => {
      const font = availableFonts.find(f => f.id === fontId);
      if (font) {
        document.documentElement.style.setProperty(`--font-family-${language}`, font.family);
      }
    });
  };

  return {
    // 機能表示状態
    showCharacterHome,
    setShowCharacterHome,
    showProjects,
    setShowProjects,
    showCookingTimer,
    setShowCookingTimer,
    showSelfAnalysis,
    setShowSelfAnalysis,
    showBookshelf,
    setShowBookshelf,
    showMemos,
    setShowMemos,
    showReports,
    setShowReports,
    showAdminPanel,
    setShowAdminPanel,
    showTimeTracking,
    setShowTimeTracking,
    showTimers,
    setShowTimers,
    showPublicMemos,
    setShowPublicMemos,
    showWorkRecords,
    setShowWorkRecords,
    showSoundApp,
    setShowSoundApp,
    showNotifications,
    setShowNotifications,
    showVersionInfo,
    setShowVersionInfo,
    showThemeSettings,
    setShowThemeSettings,
    showFontSettings,
    setShowFontSettings,
    showFeatureSettings,
    setShowFeatureSettings,

    // ドラッグ&ドロップ
    draggedFeature,
    setDraggedFeature,

    // ユーザー設定
    userSettings,
    setUserSettings,

    // テーマとフォント
    currentTheme,
    setCurrentTheme,
    fontSettings,
    setFontSettings,

    // 機能の並び順
    featureOrder,
    setFeatureOrder,

    // 関数
    getDefaultUserSettings,
    handleFeatureReorder,
    handleFeatureToggle,
    closeOtherFeatures,
    applyTheme,
    applyFont,
    applyLanguageFonts,
  };
};
