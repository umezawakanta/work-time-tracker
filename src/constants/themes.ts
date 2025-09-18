// テーマ設定の定数定義

export interface ThemeOption {
  value: string;
  label: string;
  preview: string;
}

// 利用可能なテーマ一覧
export const availableThemes: ThemeOption[] = [
  { value: "default", label: "🌟 デフォルト (ピンク)", preview: "💕" },
  { value: "simple", label: "📄 シンプル", preview: "📝" },
  { value: "dark", label: "🌙 ダークテーマ", preview: "🌚" },
  { value: "ocean", label: "🌊 オーシャン", preview: "🐠" },
  { value: "forest", label: "🌲 フォレスト", preview: "🦋" },
  { value: "sunset", label: "🌅 サンセット", preview: "🌇" },
  { value: "rainbow", label: "🌈 レインボー", preview: "🦄" },
  { value: "space", label: "🚀 スペース", preview: "🛸" },
  { value: "candy", label: "🍭 キャンディ", preview: "🍬" },
  { value: "pastel", label: "🌸 パステル", preview: "🦄" },
  { value: "neon", label: "💫 ネオン", preview: "⚡" }
];

// テーマのデフォルト値
export const DEFAULT_THEME = "default";

// テーマの検証用関数
export const isValidTheme = (theme: string): boolean => {
  return availableThemes.some(t => t.value === theme);
};

// テーマの取得用関数
export const getThemeByValue = (value: string): ThemeOption | undefined => {
  return availableThemes.find(theme => theme.value === value);
};
