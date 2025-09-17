// フォント設定の定数定義

export interface FontOption {
  value: string;
  label: string;
}

// 利用可能なフォント一覧（小学生向けかわいいフォント中心）
export const availableFonts: FontOption[] = [
  { value: "system", label: "🌟 システムデフォルト" },
  // かわいい日本語フォント
  { value: "Kosugi Maru, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🍡 Kosugi Maru (丸文字) - おすすめ！" },
  { value: "M PLUS Rounded 1c, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🎀 M PLUS Rounded (丸文字) - かわいい！" },
  { value: "Hiragino Maru Gothic ProN, ヒラギノ丸ゴ ProN W4, Meiryo, メイリオ, Osaka, MS PGothic, sans-serif", label: "💕 ヒラギノ丸ゴ (丸文字) - やわらかい" },
  { value: "Nico Moji, Kosugi Maru, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "✨ Nico Moji (手書き風) - かわいい！" },
  { value: "Hachi Maru Pop, Kosugi Maru, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🌸 Hachi Maru Pop (丸文字) - ポップ！" },
  { value: "Yomogi, Kosugi Maru, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🌺 Yomogi (手書き風) - やさしい" },
  { value: "Shippori Mincho, ヒラギノ明朝 ProN W3, Hiragino Mincho ProN, 游明朝, Yu Mincho, serif", label: "🎨 Shippori Mincho (手書き風) - アート" },
  { value: "Noto Sans CJK JP, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🌈 Noto Sans (丸文字風) - カラフル" },
  { value: "Sawarabi Mincho, ヒラギノ明朝 ProN W3, Hiragino Mincho ProN, 游明朝, Yu Mincho, serif", label: "🌿 Sawarabi Mincho (手書き風) - 自然" },
  { value: "Sawarabi Gothic, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🌱 Sawarabi Gothic (やわらか) - やさしい" },
  // かわいい英語フォント
  { value: "Comic Sans MS, cursive", label: "🎪 Comic Sans MS (かわいい) - 楽しい！" },
  { value: "Chalkduster, cursive", label: "🖍️ Chalkduster (チョーク風) - 学校みたい！" },
  { value: "Marker Felt, fantasy", label: "🖊️ Marker Felt (マーカー風) - カラフル！" },
  { value: "Bradley Hand, cursive", label: "✏️ Bradley Hand (手書き風) - やさしい" },
  { value: "Snell Roundhand, cursive", label: "💌 Snell Roundhand (手書き風) - エレガント" },
  { value: "Brush Script MT, cursive", label: "🖌️ Brush Script MT (ブラシ風) - アート" },
  { value: "Lucida Handwriting, cursive", label: "📝 Lucida Handwriting (手書き風) - きれい" },
  { value: "Papyrus, fantasy", label: "📜 Papyrus (古代風) - おもしろい！" },
  { value: "Chalkboard, fantasy", label: "🖼️ Chalkboard (黒板風) - 学校！" },
  { value: "Herculanum, fantasy", label: "🏛️ Herculanum (古代風) - かっこいい！" },
  // その他のフォント
  { value: "serif", label: "📚 Serif (明朝体) - 本みたい" },
  { value: "sans-serif", label: "📖 Sans-serif (ゴシック体) - 読みやすい" },
  { value: "monospace", label: "💻 Monospace (等幅) - プログラマー" },
  { value: "cursive", label: "✍️ Cursive (筆記体) - 手書き風" },
  { value: "fantasy", label: "🎭 Fantasy (装飾体) - おもしろい" }
];

// フォントのデフォルト値
export const DEFAULT_FONT = "system";

// フォントの検証用関数
export const isValidFont = (font: string): boolean => {
  return availableFonts.some(f => f.value === font);
};

// フォントの取得用関数
export const getFontByValue = (value: string): FontOption | undefined => {
  return availableFonts.find(font => font.value === value);
};

// フォントカテゴリ別の取得関数
export const getFontsByCategory = (category: 'japanese' | 'english' | 'system' | 'all' = 'all'): FontOption[] => {
  switch (category) {
    case 'japanese':
      return availableFonts.filter(font => 
        font.value.includes('Kosugi') || 
        font.value.includes('M PLUS') || 
        font.value.includes('ヒラギノ') || 
        font.value.includes('Nico') || 
        font.value.includes('Hachi') || 
        font.value.includes('Yomogi') || 
        font.value.includes('Shippori') || 
        font.value.includes('Noto') || 
        font.value.includes('Sawarabi')
      );
    case 'english':
      return availableFonts.filter(font => 
        font.value.includes('Comic') || 
        font.value.includes('Chalkduster') || 
        font.value.includes('Marker') || 
        font.value.includes('Bradley') || 
        font.value.includes('Snell') || 
        font.value.includes('Brush') || 
        font.value.includes('Lucida') || 
        font.value.includes('Papyrus') || 
        font.value.includes('Chalkboard') || 
        font.value.includes('Herculanum')
      );
    case 'system':
      return availableFonts.filter(font => 
        font.value === 'system' || 
        font.value === 'serif' || 
        font.value === 'sans-serif' || 
        font.value === 'monospace' || 
        font.value === 'cursive' || 
        font.value === 'fantasy'
      );
    default:
      return availableFonts;
  }
};
