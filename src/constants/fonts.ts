// フォント設定の定数定義

export interface FontOption {
  value: string;
  label: string;
  category: 'japanese' | 'english' | 'system';
}

// 日本語フォント一覧
export const japaneseFonts: FontOption[] = [
  { value: "system", label: "🌟 システムデフォルト", category: 'system' },
  { value: "Kosugi Maru, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🍡 Kosugi Maru (丸文字) - おすすめ！", category: 'japanese' },
  { value: "M PLUS Rounded 1c, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🎀 M PLUS Rounded (丸文字) - かわいい！", category: 'japanese' },
  { value: "Hiragino Maru Gothic ProN, ヒラギノ丸ゴ ProN W4, Meiryo, メイリオ, Osaka, MS PGothic, sans-serif", label: "💕 ヒラギノ丸ゴ (丸文字) - やわらかい", category: 'japanese' },
  { value: "Nico Moji, Kosugi Maru, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "✨ Nico Moji (手書き風) - かわいい！", category: 'japanese' },
  { value: "Hachi Maru Pop, Kosugi Maru, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🌸 Hachi Maru Pop (丸文字) - ポップ！", category: 'japanese' },
  { value: "Yomogi, Kosugi Maru, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🌺 Yomogi (手書き風) - やさしい", category: 'japanese' },
  { value: "Shippori Mincho, ヒラギノ明朝 ProN W3, Hiragino Mincho ProN, 游明朝, Yu Mincho, serif", label: "🎨 Shippori Mincho (手書き風) - アート", category: 'japanese' },
  { value: "Noto Sans JP, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🌈 Noto Sans JP (丸文字風) - カラフル", category: 'japanese' },
  { value: "Sawarabi Mincho, ヒラギノ明朝 ProN W3, Hiragino Mincho ProN, 游明朝, Yu Mincho, serif", label: "🌿 Sawarabi Mincho (手書き風) - 自然", category: 'japanese' },
  { value: "Sawarabi Gothic, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🌱 Sawarabi Gothic (手書き風) - やさしい", category: 'japanese' },
  { value: "serif", label: "📚 Serif (明朝体) - 本みたい", category: 'system' },
  { value: "sans-serif", label: "📖 Sans-serif (ゴシック体) - 読みやすい", category: 'system' },
  { value: "monospace", label: "💻 Monospace (等幅) - プログラマー", category: 'system' }
];

// 英語フォント一覧
export const englishFonts: FontOption[] = [
  { value: "system", label: "🌟 システムデフォルト", category: 'system' },
  { value: "Comic Sans MS, cursive", label: "🎪 Comic Sans MS (かわいい) - 楽しい！", category: 'english' },
  { value: "Chalkduster, cursive", label: "🖍️ Chalkduster (チョーク風) - 学校みたい！", category: 'english' },
  { value: "Marker Felt, fantasy", label: "🖊️ Marker Felt (マーカー風) - カラフル！", category: 'english' },
  { value: "Bradley Hand, cursive", label: "✏️ Bradley Hand (手書き風) - やさしい", category: 'english' },
  { value: "Snell Roundhand, cursive", label: "💌 Snell Roundhand (手書き風) - エレガント", category: 'english' },
  { value: "Brush Script MT, cursive", label: "🖌️ Brush Script MT (ブラシ風) - アート", category: 'english' },
  { value: "Lucida Handwriting, cursive", label: "📝 Lucida Handwriting (手書き風) - きれい", category: 'english' },
  { value: "Papyrus, fantasy", label: "📜 Papyrus (古代風) - おもしろい！", category: 'english' },
  { value: "Chalkboard, fantasy", label: "🖼️ Chalkboard (黒板風) - 学校！", category: 'english' },
  { value: "Herculanum, fantasy", label: "🏛️ Herculanum (古代風) - かっこいい！", category: 'english' },
  { value: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", label: "🔤 Inter (モダン) - きれい", category: 'english' },
  { value: "Roboto, -apple-system, BlinkMacSystemFont, sans-serif", label: "🤖 Roboto (モダン) - 読みやすい", category: 'english' },
  { value: "serif", label: "📚 Serif (明朝体) - 本みたい", category: 'system' },
  { value: "sans-serif", label: "📖 Sans-serif (ゴシック体) - 読みやすい", category: 'system' },
  { value: "monospace", label: "💻 Monospace (等幅) - プログラマー", category: 'system' }
];

// 全フォント一覧（後方互換性のため）
export const availableFonts: FontOption[] = [...japaneseFonts, ...englishFonts.filter(font => font.value !== 'system')];

// フォントのデフォルト値
export const DEFAULT_FONT = "system";

// フォント設定の型定義
export interface FontSettings {
  japanese: string;
  english: string;
}

// デフォルトフォント設定
export const DEFAULT_FONT_SETTINGS: FontSettings = {
  japanese: "system",
  english: "system"
};

// フォント値からフォントオプションを取得
export const getFontByValue = (value: string, category: 'japanese' | 'english'): FontOption | undefined => {
  const fonts = category === 'japanese' ? japaneseFonts : englishFonts;
  return fonts.find(font => font.value === value);
};

// 言語別フォント設定を適用するCSS変数を生成
export const generateFontCSS = (settings: FontSettings): string => {
  const japaneseFont = settings.japanese === 'system' 
    ? "'Noto Sans JP', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', 'MS Gothic', sans-serif"
    : settings.japanese;
    
  const englishFont = settings.english === 'system'
    ? "'Inter', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    : settings.english;

  return `
    :root {
      --japanese-font: ${japaneseFont};
      --english-font: ${englishFont};
    }
  `;
};