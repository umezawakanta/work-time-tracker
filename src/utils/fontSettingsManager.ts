// フォント設定のエクスポート/インポート管理

import { FontSettings } from '../constants/fonts';

export interface FontSettingsExport {
  version: string;
  timestamp: string;
  settings: FontSettings;
  customFonts?: CustomFontData[];
}

export interface CustomFontData {
  name: string;
  fontFamily: string;
  fontUrl: string;
  category: 'japanese' | 'english' | 'child-friendly';
  description?: string;
  tags?: string[];
}

class FontSettingsManager {
  private readonly EXPORT_VERSION = '1.0';
  private readonly STORAGE_KEY = 'fontSettingsExport';

  // フォント設定をエクスポート
  exportSettings(settings: FontSettings, customFonts: CustomFontData[] = []): FontSettingsExport {
    const exportData: FontSettingsExport = {
      version: this.EXPORT_VERSION,
      timestamp: new Date().toISOString(),
      settings: { ...settings },
      customFonts: customFonts.length > 0 ? [...customFonts] : undefined
    };

    return exportData;
  }

  // フォント設定をJSONファイルとしてダウンロード
  downloadSettings(settings: FontSettings, customFonts: CustomFontData[] = []): void {
    const exportData = this.exportSettings(settings, customFonts);
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `font-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // フォント設定をインポート
  async importSettings(file: File): Promise<{ settings: FontSettings; customFonts: CustomFontData[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const jsonString = event.target?.result as string;
          const importData: FontSettingsExport = JSON.parse(jsonString);
          
          // バージョンチェック
          if (!this.isCompatibleVersion(importData.version)) {
            throw new Error(`サポートされていないバージョンです: ${importData.version}`);
          }
          
          // 設定の妥当性チェック
          if (!importData.settings) {
            throw new Error('無効な設定ファイルです');
          }
          
          const settings = this.validateSettings(importData.settings);
          const customFonts = importData.customFonts || [];
          
          resolve({ settings, customFonts });
        } catch (error) {
          reject(new Error(`設定ファイルの読み込みに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('ファイルの読み込みに失敗しました'));
      };
      
      reader.readAsText(file);
    });
  }

  // バージョンの互換性チェック
  private isCompatibleVersion(version: string): boolean {
    const [major, minor] = version.split('.').map(Number);
    const [currentMajor, currentMinor] = this.EXPORT_VERSION.split('.').map(Number);
    
    // メジャーバージョンが同じで、マイナーバージョンが現在以下なら互換性あり
    return major === currentMajor && minor <= currentMinor;
  }

  // 設定の妥当性チェック
  private validateSettings(settings: any): FontSettings {
    const defaultSettings = {
      japanese: 'system',
      english: 'system',
      childMode: false,
      fontSize: 16,
      lineHeight: 1.5,
      favorites: []
    };

    return {
      japanese: typeof settings.japanese === 'string' ? settings.japanese : defaultSettings.japanese,
      english: typeof settings.english === 'string' ? settings.english : defaultSettings.english,
      childMode: typeof settings.childMode === 'boolean' ? settings.childMode : defaultSettings.childMode,
      fontSize: typeof settings.fontSize === 'number' && settings.fontSize > 0 ? settings.fontSize : defaultSettings.fontSize,
      lineHeight: typeof settings.lineHeight === 'number' && settings.lineHeight > 0 ? settings.lineHeight : defaultSettings.lineHeight,
      favorites: Array.isArray(settings.favorites) ? settings.favorites : defaultSettings.favorites
    };
  }

  // 設定をローカルストレージに保存
  saveToLocalStorage(settings: FontSettings, customFonts: CustomFontData[] = []): void {
    const exportData = this.exportSettings(settings, customFonts);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(exportData));
  }

  // ローカルストレージから設定を読み込み
  loadFromLocalStorage(): { settings: FontSettings; customFonts: CustomFontData[] } | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;
      
      const importData: FontSettingsExport = JSON.parse(stored);
      const settings = this.validateSettings(importData.settings);
      const customFonts = importData.customFonts || [];
      
      return { settings, customFonts };
    } catch (error) {
      console.warn('ローカルストレージからの設定読み込みに失敗:', error);
      return null;
    }
  }

  // 設定のバックアップを作成
  createBackup(settings: FontSettings, customFonts: CustomFontData[] = []): string {
    const exportData = this.exportSettings(settings, customFonts);
    return JSON.stringify(exportData, null, 2);
  }

  // バックアップから復元
  restoreFromBackup(backupJson: string): { settings: FontSettings; customFonts: CustomFontData[] } {
    try {
      const importData: FontSettingsExport = JSON.parse(backupJson);
      const settings = this.validateSettings(importData.settings);
      const customFonts = importData.customFonts || [];
      
      return { settings, customFonts };
    } catch (error) {
      throw new Error(`バックアップの復元に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  }

  // 設定の比較
  compareSettings(settings1: FontSettings, settings2: FontSettings): string[] {
    const differences: string[] = [];
    
    if (settings1.japanese !== settings2.japanese) {
      differences.push(`日本語フォント: ${settings1.japanese} → ${settings2.japanese}`);
    }
    
    if (settings1.english !== settings2.english) {
      differences.push(`英語フォント: ${settings1.english} → ${settings2.english}`);
    }
    
    if (settings1.childMode !== settings2.childMode) {
      differences.push(`こどもモード: ${settings1.childMode} → ${settings2.childMode}`);
    }
    
    if (settings1.fontSize !== settings2.fontSize) {
      differences.push(`フォントサイズ: ${settings1.fontSize} → ${settings2.fontSize}`);
    }
    
    if (settings1.lineHeight !== settings2.lineHeight) {
      differences.push(`行間: ${settings1.lineHeight} → ${settings2.lineHeight}`);
    }
    
    return differences;
  }
}

// シングルトンインスタンス
export const fontSettingsManager = new FontSettingsManager();
