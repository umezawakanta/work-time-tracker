/**
 * キャッシュ優先度キュー
 * 優先度ベースのキャッシュエントリ管理
 */
import { CacheEntry, CachePriority } from './types/CacheTypes';

/**
 * キャッシュ優先度キュークラス
 */
export class CachePriorityQueue {
  private entries: Array<{ key: string; entry: CacheEntry }> = [];

  /**
   * エントリを追加
   */
  public add(key: string, entry: CacheEntry): void {
    // 優先度が設定されていない場合はデフォルト値を使用
    const priority = entry.priority ?? CachePriority.NORMAL;

    // エントリに優先度を設定
    const entryCopy = { ...entry, priority };

    // キューに追加
    this.entries.push({ key, entry: entryCopy });

    // 優先度に基づいてソート（高い順）
    this.sort();
  }

  /**
   * 優先度に基づいてソート
   */
  private sort(): void {
    this.entries.sort((a, b) => {
      // 1. 優先度で比較（降順）
      const priorityDiff = (b.entry.priority ?? 0) - (a.entry.priority ?? 0);
      if (priorityDiff !== 0) return priorityDiff;

      // 2. 最終アクセス時間で比較（新しい順）
      const lastAccessedA = a.entry.lastAccessed ?? a.entry.timestamp;
      const lastAccessedB = b.entry.lastAccessed ?? b.entry.timestamp;
      const accessDiff = lastAccessedB - lastAccessedA;
      if (accessDiff !== 0) return accessDiff;

      // 3. アクセス回数で比較（多い順）
      return (b.entry.accessCount ?? 0) - (a.entry.accessCount ?? 0);
    });
  }

  /**
   * 最も優先度の低いエントリを取得して削除
   */
  public popLeast(): { key: string; entry: CacheEntry } | null {
    if (this.entries.length === 0) {
      return null;
    }

    // 配列の最後（最も優先度が低い）のエントリを取得
    return this.entries.pop() ?? null;
  }

  /**
   * エントリを更新
   */
  public update(key: string, updater: (entry: CacheEntry) => CacheEntry): boolean {
    const index = this.entries.findIndex((item) => item.key === key);

    if (index === -1) {
      return false;
    }

    // エントリを更新
    this.entries[index].entry = updater(this.entries[index].entry);

    // 再ソート
    this.sort();

    return true;
  }

  /**
   * キューをクリア
   */
  public clear(): void {
    this.entries = [];
  }

  /**
   * キューのサイズを取得
   */
  public size(): number {
    return this.entries.length;
  }

  /**
   * すべてのエントリを取得
   */
  public getAll(): Array<{ key: string; entry: CacheEntry }> {
    return [...this.entries];
  }
}
