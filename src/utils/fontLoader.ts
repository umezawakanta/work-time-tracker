// フォント読み込みユーティリティ

interface FontLoadOptions {
  family: string;
  weights?: number[];
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  text?: string;
}

class FontLoader {
  private loadedFonts: Set<string> = new Set();
  private loadingFonts: Map<string, Promise<void>> = new Map();

  // Google Fontsからフォントを読み込む
  async loadGoogleFont(fontFamily: string, options: FontLoadOptions = {}): Promise<void> {
    const fontKey = `${fontFamily}-${JSON.stringify(options)}`;
    
    if (this.loadedFonts.has(fontKey)) {
      return;
    }

    if (this.loadingFonts.has(fontKey)) {
      return this.loadingFonts.get(fontKey);
    }

    const loadPromise = this.loadFont(fontFamily, options);
    this.loadingFonts.set(fontKey, loadPromise);

    try {
      await loadPromise;
      this.loadedFonts.add(fontKey);
    } finally {
      this.loadingFonts.delete(fontKey);
    }
  }

  private async loadFont(fontFamily: string, options: FontLoadOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      // フォントが既に読み込まれているかチェック
      if (document.fonts.check(`16px "${fontFamily}"`)) {
        resolve();
        return;
      }

      // Google Fonts URLを構築
      const weights = options.weights || [400];
      const display = options.display || 'swap';
      const text = options.text ? `&text=${encodeURIComponent(options.text)}` : '';
      
      const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@${weights.join(';')}&display=${display}${text}`;

      // CSSを動的に読み込む
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontUrl;
      link.onload = () => {
        // フォントが実際に読み込まれるまで待機
        this.waitForFontLoad(fontFamily).then(resolve).catch(reject);
      };
      link.onerror = () => {
        console.warn(`Failed to load font: ${fontFamily}`);
        resolve(); // フォント読み込み失敗でも続行
      };

      document.head.appendChild(link);
    });
  }

  private async waitForFontLoad(fontFamily: string, timeout: number = 3000): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkFont = () => {
        if (document.fonts.check(`16px "${fontFamily}"`)) {
          resolve();
          return;
        }

        if (Date.now() - startTime > timeout) {
          console.warn(`Font load timeout: ${fontFamily}`);
          resolve(); // タイムアウトでも続行
          return;
        }

        requestAnimationFrame(checkFont);
      };

      checkFont();
    });
  }

  // 複数のフォントを並列で読み込む
  async loadMultipleFonts(fonts: Array<{ family: string; options?: FontLoadOptions }>): Promise<void> {
    const loadPromises = fonts.map(({ family, options }) => 
      this.loadGoogleFont(family, options)
    );
    
    await Promise.allSettled(loadPromises);
  }

  // フォントが読み込まれているかチェック
  isFontLoaded(fontFamily: string): boolean {
    return document.fonts.check(`16px "${fontFamily}"`);
  }

  // 読み込まれたフォントの一覧を取得
  getLoadedFonts(): string[] {
    return Array.from(this.loadedFonts);
  }

  // フォント読み込み状態をリセット
  reset(): void {
    this.loadedFonts.clear();
    this.loadingFonts.clear();
  }
}

// シングルトンインスタンス
export const fontLoader = new FontLoader();

// よく使われるフォントのプリロード
export const preloadCommonFonts = async (): Promise<void> => {
  const commonFonts = [
    { family: 'Kosugi Maru', options: { weights: [400] } },
    { family: 'M PLUS Rounded 1c', options: { weights: [400, 700] } },
    { family: 'Hachi Maru Pop', options: { weights: [400] } },
    { family: 'Yomogi', options: { weights: [400] } },
    { family: 'Nico Moji', options: { weights: [400] } },
    { family: 'Comic Sans MS', options: { weights: [400] } },
    { family: 'Chalkduster', options: { weights: [400] } },
    { family: 'Marker Felt', options: { weights: [400] } },
  ];

  await fontLoader.loadMultipleFonts(commonFonts);
};

// フォント読み込みの進捗を監視
export const createFontLoadProgress = (fontFamilies: string[]) => {
  let loadedCount = 0;
  const totalCount = fontFamilies.length;

  const checkProgress = () => {
    loadedCount = fontFamilies.filter(family => 
      fontLoader.isFontLoaded(family)
    ).length;

    return {
      loaded: loadedCount,
      total: totalCount,
      progress: totalCount > 0 ? (loadedCount / totalCount) * 100 : 0,
      isComplete: loadedCount === totalCount
    };
  };

  return checkProgress;
};
