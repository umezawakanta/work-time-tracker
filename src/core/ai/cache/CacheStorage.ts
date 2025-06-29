/**
 * キャッシュストレージ
 * 永続化ストレージとの連携を管理
 */
import { ApiLogger } from '../logger/ApiLogger';
import { CacheEntry, CacheStats } from './types/CacheTypes';

/**
 * キャッシュストレージクラス
 */
export class CacheStorage {
  private logger: ApiLogger;
  private storageKey = 'ai-cache-data';
  private compressionEnabled = false;

  /**
   * コンストラクタ
   */
  constructor(logger: ApiLogger) {
    this.logger = logger;
    this.logger.setContext('CacheStorage');

    // 環境変数で圧縮を有効にできるようにする
    if (typeof process !== 'undefined' && process.env) {
      this.compressionEnabled = process.env.NEXT_PUBLIC_CACHE_COMPRESSION === 'true';
    }
  }

  /**
   * キャッシュデータを保存
   */
  public saveData(cache: Map<string, CacheEntry>, stats: CacheStats): void {
    try {
      if (typeof localStorage === 'undefined') {
        return;
      }

      // キャッシュサイズが大きすぎる場合は保存しない
      if (cache.size > 1000) {
        this.logger.warn('キャッシュサイズが大きすぎるため、永続化をスキップします');
        return;
      }

      // 統計情報を更新
      const updatedStats = {
        ...stats,
        updated: Date.now(),
      };

      // 保存するデータ
      const saveData = {
        entries: Array.from(cache.entries()),
        stats: updatedStats,
      };

      // データを文字列化
      let dataStr = JSON.stringify(saveData);

      // データサイズが大きい場合は圧縮を試みる
      if (this.compressionEnabled && dataStr.length > 100000) {
        try {
          localStorage.setItem(`${this.storageKey}_compressed`, 'true');
          dataStr = this.compressData(dataStr);
        } catch (compressionError) {
          this.logger.error('データの圧縮に失敗しました', compressionError);
        }
      } else {
        localStorage.removeItem(`${this.storageKey}_compressed`);
      }

      // データを保存
      localStorage.setItem(this.storageKey, dataStr);
    } catch (error) {
      this.logger.error('キャッシュデータの保存に失敗しました', error);
    }
  }

  /**
   * キャッシュデータを読み込む
   */
  public loadData(): {
    cache: Map<string, CacheEntry>;
    stats: CacheStats;
  } {
    const defaultStats: CacheStats = {
      hitCount: 0,
      missCount: 0,
      lastCleanup: Date.now(),
      created: Date.now(),
    };

    try {
      if (typeof localStorage === 'undefined') {
        return {
          cache: new Map<string, CacheEntry>(),
          stats: defaultStats,
        };
      }

      // 圧縮されたデータかチェック
      const isCompressed = localStorage.getItem(`${this.storageKey}_compressed`) === 'true';

      // データを読み込み
      let dataStr = localStorage.getItem(this.storageKey);
      if (!dataStr) {
        return {
          cache: new Map<string, CacheEntry>(),
          stats: defaultStats,
        };
      }

      // 圧縮されている場合は解凍
      if (isCompressed) {
        try {
          dataStr = this.decompressData(dataStr);
        } catch (decompressionError) {
          this.logger.error('データの解凍に失敗しました', decompressionError);
          return {
            cache: new Map<string, CacheEntry>(),
            stats: defaultStats,
          };
        }
      }

      // データをパース
      const parsedData = JSON.parse(dataStr) as {
        entries: Array<[string, CacheEntry]>;
        stats: CacheStats;
      };

      return {
        cache: new Map(parsedData.entries),
        stats: parsedData.stats,
      };
    } catch (error) {
      this.logger.error('キャッシュデータの読み込みに失敗しました', error);
      return {
        cache: new Map<string, CacheEntry>(),
        stats: defaultStats,
      };
    }
  }

  /**
   * データを圧縮
   */
  private compressData(data: string): string {
    // 簡易圧縮（実際の実装ではBetter-SQLite3やLZStringなどのライブラリを使用）
    if (typeof window !== 'undefined' && 'btoa' in window) {
      return btoa(data);
    }
    return data;
  }

  /**
   * データを解凍
   */
  private decompressData(data: string): string {
    // 簡易解凍
    if (typeof window !== 'undefined' && 'atob' in window) {
      return atob(data);
    }
    return data;
  }

  /**
   * キャッシュデータを削除
   */
  public clearData(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(`${this.storageKey}_compressed`);
      }
    } catch (error) {
      this.logger.error('キャッシュデータの削除に失敗しました', error);
    }
  }

  /**
   * 分散キャッシュを同期（複数タブ間の同期用）
   */
  public syncCacheAcrossTabs(): void {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
      return;
    }

    // 現在のタブが既に同期済みかチェック
    const isInitialized = sessionStorage.getItem('cache-sync-initialized');
    if (isInitialized) {
      return;
    }

    // ストレージイベントリスナーを設定（他タブからの更新を取得）
    window.addEventListener('storage', (event) => {
      if (event.key === this.storageKey && event.newValue) {
        // 他のタブでキャッシュが更新された場合の処理
        this.logger.debug('他のタブからキャッシュの更新を検出しました');
        // イベントハンドラーで処理するためのカスタムイベントを発火
        window.dispatchEvent(
          new CustomEvent('ai-cache-updated', {
            detail: { source: 'external' },
          })
        );
      }
    });

    // 初期化フラグを設定
    sessionStorage.setItem('cache-sync-initialized', 'true');
  }
}
