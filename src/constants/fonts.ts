// フォント設定の定数定義

export interface FontOption {
  value: string;
  label: string;
  category: 'japanese' | 'english' | 'system' | 'child-friendly';
  subcategory?: 'rounded' | 'handwriting' | 'cute' | 'school' | 'modern' | 'classic';
  ageGroup?: 'all' | 'child' | 'teen' | 'adult';
  readability?: 'high' | 'medium' | 'low';
  description?: string;
  previewText?: string;
  tags?: string[];
}

// 日本語フォント一覧
export const japaneseFonts: FontOption[] = [
  { 
    value: "system", 
    label: "🌟 システムデフォルト", 
    category: 'system',
    ageGroup: 'all',
    readability: 'high',
    description: 'デバイスに最適化されたフォント',
    previewText: 'システムデフォルトフォント'
  },
  { 
    value: "Kosugi Maru, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", 
    label: "🍡 Kosugi Maru (丸文字) - おすすめ！", 
    category: 'japanese',
    subcategory: 'rounded',
    ageGroup: 'child',
    readability: 'high',
    description: '可愛い丸文字でこどもに人気',
    previewText: '可愛いキャラクターと一緒に作業時間を管理しよう！',
    tags: ['丸文字', '可愛い', 'こども向け']
  },
  { 
    value: "M PLUS Rounded 1c, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", 
    label: "🎀 M PLUS Rounded (丸文字) - かわいい！", 
    category: 'japanese',
    subcategory: 'rounded',
    ageGroup: 'child',
    readability: 'high',
    description: 'モダンな丸文字でカラフル',
    previewText: '楽しく作業時間を管理しよう！',
    tags: ['丸文字', 'モダン', 'カラフル']
  },
  { 
    value: "Hiragino Maru Gothic ProN, ヒラギノ丸ゴ ProN W4, Meiryo, メイリオ, Osaka, MS PGothic, sans-serif", 
    label: "💕 ヒラギノ丸ゴ (丸文字) - やわらかい", 
    category: 'japanese',
    subcategory: 'rounded',
    ageGroup: 'child',
    readability: 'high',
    description: 'やわらかく親しみやすい丸文字',
    previewText: 'やわらかい文字で読みやすい',
    tags: ['丸文字', 'やわらかい', '親しみやすい']
  },
  { 
    value: "Nico Moji, Kosugi Maru, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", 
    label: "✨ Nico Moji (手書き風) - かわいい！", 
    category: 'japanese',
    subcategory: 'handwriting',
    ageGroup: 'child',
    readability: 'medium',
    description: '手で書いたような自然な文字',
    previewText: '手書きみたいで親しみやすい',
    tags: ['手書き風', '自然', '親しみやすい']
  },
  { 
    value: "Hachi Maru Pop, Kosugi Maru, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", 
    label: "🌸 Hachi Maru Pop (丸文字) - ポップ！", 
    category: 'japanese',
    subcategory: 'rounded',
    ageGroup: 'child',
    readability: 'high',
    description: 'ポップで楽しいデザイン',
    previewText: 'ポップで楽しい文字だよ！',
    tags: ['丸文字', 'ポップ', '楽しい']
  },
  { 
    value: "Yomogi, Kosugi Maru, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", 
    label: "🌺 Yomogi (手書き風) - やさしい", 
    category: 'japanese',
    subcategory: 'handwriting',
    ageGroup: 'child',
    readability: 'medium',
    description: 'やさしく親しみやすい手書き風',
    previewText: 'やさしい文字で読みやすい',
    tags: ['手書き風', 'やさしい', '親しみやすい']
  },
  { 
    value: "Shippori Mincho, ヒラギノ明朝 ProN W3, Hiragino Mincho ProN, 游明朝, Yu Mincho, serif", 
    label: "🎨 Shippori Mincho (手書き風) - アート", 
    category: 'japanese',
    subcategory: 'handwriting',
    ageGroup: 'teen',
    readability: 'medium',
    description: 'アートな手書き風文字',
    previewText: 'アートな文字で美しい',
    tags: ['手書き風', 'アート', '美しい']
  },
  { 
    value: "Noto Sans JP, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", 
    label: "🌈 Noto Sans JP (丸文字風) - カラフル", 
    category: 'japanese',
    subcategory: 'modern',
    ageGroup: 'all',
    readability: 'high',
    description: 'カラフルで読みやすい',
    previewText: 'カラフルで読みやすい文字',
    tags: ['カラフル', '読みやすい', 'モダン']
  },
  { 
    value: "Sawarabi Mincho, ヒラギノ明朝 ProN W3, Hiragino Mincho ProN, 游明朝, Yu Mincho, serif", 
    label: "🌿 Sawarabi Mincho (手書き風) - 自然", 
    category: 'japanese',
    subcategory: 'handwriting',
    ageGroup: 'all',
    readability: 'medium',
    description: '自然で落ち着いた手書き風',
    previewText: '自然で落ち着いた文字',
    tags: ['手書き風', '自然', '落ち着いた']
  },
  { 
    value: "Sawarabi Gothic, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", 
    label: "🌱 Sawarabi Gothic (手書き風) - やさしい", 
    category: 'japanese',
    subcategory: 'handwriting',
    ageGroup: 'all',
    readability: 'high',
    description: 'やさしく読みやすい手書き風',
    previewText: 'やさしく読みやすい文字',
    tags: ['手書き風', 'やさしい', '読みやすい']
  },
  { 
    value: "serif", 
    label: "📚 Serif (明朝体) - 本みたい", 
    category: 'system',
    ageGroup: 'adult',
    readability: 'high',
    description: '本のような伝統的な文字',
    previewText: '本のような伝統的な文字',
    tags: ['伝統的', '本', '読みやすい']
  },
  { 
    value: "sans-serif", 
    label: "📖 Sans-serif (ゴシック体) - 読みやすい", 
    category: 'system',
    ageGroup: 'all',
    readability: 'high',
    description: '読みやすいゴシック体',
    previewText: '読みやすいゴシック体',
    tags: ['読みやすい', 'ゴシック', 'シンプル']
  },
  { 
    value: "monospace", 
    label: "💻 Monospace (等幅) - プログラマー", 
    category: 'system',
    ageGroup: 'adult',
    readability: 'high',
    description: 'プログラマー向けの等幅文字',
    previewText: 'プログラマー向けの等幅文字',
    tags: ['等幅', 'プログラマー', '技術']
  }
];

// 英語フォント一覧
export const englishFonts: FontOption[] = [
  { 
    value: "system", 
    label: "🌟 システムデフォルト", 
    category: 'system',
    ageGroup: 'all',
    readability: 'high',
    description: 'デバイスに最適化されたフォント',
    previewText: 'System Default Font'
  },
  { 
    value: "Comic Sans MS, cursive", 
    label: "🎪 Comic Sans MS (かわいい) - 楽しい！", 
    category: 'english',
    subcategory: 'cute',
    ageGroup: 'child',
    readability: 'high',
    description: '最も人気のこども向けフォント',
    previewText: 'Fun and friendly font for kids!',
    tags: ['かわいい', '楽しい', 'こども向け']
  },
  { 
    value: "Chalkduster, cursive", 
    label: "🖍️ Chalkduster (チョーク風) - 学校みたい！", 
    category: 'english',
    subcategory: 'school',
    ageGroup: 'child',
    readability: 'medium',
    description: '黒板にチョークで書いたような文字',
    previewText: 'Like writing on a chalkboard!',
    tags: ['チョーク風', '学校', '学習']
  },
  { 
    value: "Marker Felt, fantasy", 
    label: "🖊️ Marker Felt (マーカー風) - カラフル！", 
    category: 'english',
    subcategory: 'cute',
    ageGroup: 'child',
    readability: 'medium',
    description: 'マーカーで書いたようなカラフルな文字',
    previewText: 'Colorful marker-style text!',
    tags: ['マーカー風', 'カラフル', '楽しい']
  },
  { 
    value: "Bradley Hand, cursive", 
    label: "✏️ Bradley Hand (手書き風) - やさしい", 
    category: 'english',
    subcategory: 'handwriting',
    ageGroup: 'child',
    readability: 'medium',
    description: '手で書いたようなやさしい文字',
    previewText: 'Gentle handwritten style',
    tags: ['手書き風', 'やさしい', '親しみやすい']
  },
  { 
    value: "Snell Roundhand, cursive", 
    label: "💌 Snell Roundhand (手書き風) - エレガント", 
    category: 'english',
    subcategory: 'handwriting',
    ageGroup: 'teen',
    readability: 'low',
    description: 'エレガントな手書き風文字',
    previewText: 'Elegant handwritten style',
    tags: ['手書き風', 'エレガント', '美しい']
  },
  { 
    value: "Brush Script MT, cursive", 
    label: "🖌️ Brush Script MT (ブラシ風) - アート", 
    category: 'english',
    subcategory: 'handwriting',
    ageGroup: 'teen',
    readability: 'low',
    description: 'ブラシで書いたようなアートな文字',
    previewText: 'Artistic brush-style text',
    tags: ['ブラシ風', 'アート', '創造的']
  },
  { 
    value: "Lucida Handwriting, cursive", 
    label: "📝 Lucida Handwriting (手書き風) - きれい", 
    category: 'english',
    subcategory: 'handwriting',
    ageGroup: 'all',
    readability: 'medium',
    description: 'きれいな手書き風文字',
    previewText: 'Beautiful handwritten style',
    tags: ['手書き風', 'きれい', '読みやすい']
  },
  { 
    value: "Papyrus, fantasy", 
    label: "📜 Papyrus (古代風) - おもしろい！", 
    category: 'english',
    subcategory: 'classic',
    ageGroup: 'child',
    readability: 'low',
    description: '古代のパピルス風の文字',
    previewText: 'Ancient papyrus style!',
    tags: ['古代風', 'おもしろい', '歴史']
  },
  { 
    value: "Chalkboard, fantasy", 
    label: "🖼️ Chalkboard (黒板風) - 学校！", 
    category: 'english',
    subcategory: 'school',
    ageGroup: 'child',
    readability: 'medium',
    description: '学校の黒板風の文字',
    previewText: 'School chalkboard style!',
    tags: ['黒板風', '学校', '学習']
  },
  { 
    value: "Herculanum, fantasy", 
    label: "🏛️ Herculanum (古代風) - かっこいい！", 
    category: 'english',
    subcategory: 'classic',
    ageGroup: 'teen',
    readability: 'low',
    description: '古代ローマ風のかっこいい文字',
    previewText: 'Cool ancient Roman style!',
    tags: ['古代風', 'かっこいい', '歴史']
  },
  { 
    value: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", 
    label: "🔤 Inter (モダン) - きれい", 
    category: 'english',
    subcategory: 'modern',
    ageGroup: 'all',
    readability: 'high',
    description: 'モダンで読みやすい文字',
    previewText: 'Modern and clean font',
    tags: ['モダン', 'きれい', '読みやすい']
  },
  { 
    value: "Roboto, -apple-system, BlinkMacSystemFont, sans-serif", 
    label: "🤖 Roboto (モダン) - 読みやすい", 
    category: 'english',
    subcategory: 'modern',
    ageGroup: 'all',
    readability: 'high',
    description: 'Googleが開発した読みやすい文字',
    previewText: 'Easy to read modern font',
    tags: ['モダン', '読みやすい', 'Google']
  },
  { 
    value: "serif", 
    label: "📚 Serif (明朝体) - 本みたい", 
    category: 'system',
    ageGroup: 'adult',
    readability: 'high',
    description: '本のような伝統的な文字',
    previewText: 'Traditional book-like font',
    tags: ['伝統的', '本', '読みやすい']
  },
  { 
    value: "sans-serif", 
    label: "📖 Sans-serif (ゴシック体) - 読みやすい", 
    category: 'system',
    ageGroup: 'all',
    readability: 'high',
    description: '読みやすいゴシック体',
    previewText: 'Easy to read sans-serif font',
    tags: ['読みやすい', 'ゴシック', 'シンプル']
  },
  { 
    value: "monospace", 
    label: "💻 Monospace (等幅) - プログラマー", 
    category: 'system',
    ageGroup: 'adult',
    readability: 'high',
    description: 'プログラマー向けの等幅文字',
    previewText: 'Monospace font for programmers',
    tags: ['等幅', 'プログラマー', '技術']
  }
];

// こども向けフォント一覧（日本語・英語のこども向けフォントを統合）
export const childFriendlyFonts: FontOption[] = [
  // 日本語のこども向けフォント
  ...japaneseFonts.filter(font => font.ageGroup === 'child'),
  // 英語のこども向けフォント
  ...englishFonts.filter(font => font.ageGroup === 'child')
];

// 全フォント一覧（後方互換性のため）
export const availableFonts: FontOption[] = [...japaneseFonts, ...englishFonts.filter(font => font.value !== 'system')];

// フォントのデフォルト値
export const DEFAULT_FONT = "system";

// フォント設定の型定義
export interface FontSettings {
  japanese: string;
  english: string;
  childMode?: boolean;
  fontSize?: 'small' | 'medium' | 'large';
  lineHeight?: 'tight' | 'normal' | 'loose';
  favorites?: string[];
}

// デフォルトフォント設定
export const DEFAULT_FONT_SETTINGS: FontSettings = {
  japanese: "system",
  english: "system",
  childMode: false,
  fontSize: 'medium',
  lineHeight: 'normal',
  favorites: []
};

// フォント値からフォントオプションを取得
export const getFontByValue = (value: string, category: 'japanese' | 'english' | 'child-friendly'): FontOption | undefined => {
  const fonts = category === 'japanese' ? japaneseFonts : 
                category === 'english' ? englishFonts : 
                childFriendlyFonts;
  return fonts.find(font => font.value === value);
};

// フォント検索機能
export const searchFonts = (query: string, category: 'japanese' | 'english' | 'child-friendly'): FontOption[] => {
  const fonts = category === 'japanese' ? japaneseFonts : 
                category === 'english' ? englishFonts : 
                childFriendlyFonts;
  
  if (!query.trim()) {
    return fonts;
  }
  
  const lowercaseQuery = query.toLowerCase();
  return fonts.filter(font => 
    font.label.toLowerCase().includes(lowercaseQuery) ||
    font.description?.toLowerCase().includes(lowercaseQuery) ||
    font.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

// フォントフィルタ機能
export const filterFonts = (
  fonts: FontOption[], 
  filters: {
    subcategory?: string;
    ageGroup?: string;
    readability?: string;
  }
): FontOption[] => {
  return fonts.filter(font => {
    if (filters.subcategory && font.subcategory !== filters.subcategory) {
      return false;
    }
    if (filters.ageGroup && font.ageGroup !== filters.ageGroup) {
      return false;
    }
    if (filters.readability && font.readability !== filters.readability) {
      return false;
    }
    return true;
  });
};

// お気に入りフォントの管理
export const toggleFavorite = (fontValue: string, favorites: string[]): string[] => {
  if (favorites.includes(fontValue)) {
    return favorites.filter(fav => fav !== fontValue);
  } else {
    return [...favorites, fontValue];
  }
};

// お気に入りフォントの取得
export const getFavoriteFonts = (favorites: string[]): FontOption[] => {
  const allFonts = [...japaneseFonts, ...englishFonts, ...childFriendlyFonts];
  return allFonts.filter(font => favorites.includes(font.value));
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