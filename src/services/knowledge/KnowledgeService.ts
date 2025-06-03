import { KnowledgeEntry } from '@/types/knowledge';

class KnowledgeService {
  private storageKey = 'work-time-tracker-knowledge';

  /**
   * すべての知識エントリーを取得
   */
  async getAll(): Promise<KnowledgeEntry[]> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('知識エントリーの取得エラー:', error);
      return [];
    }
  }

  /**
   * 知識エントリーを保存
   */
  async save(entries: KnowledgeEntry[]): Promise<void> {
    try {
      const existingEntries = await this.getAll();
      const newEntries = [...existingEntries];

      for (const entry of entries) {
        const existingIndex = newEntries.findIndex((e) => e.id === entry.id);
        if (existingIndex >= 0) {
          newEntries[existingIndex] = { ...entry, updatedAt: new Date().toISOString() };
        } else {
          newEntries.push(entry);
        }
      }

      localStorage.setItem(this.storageKey, JSON.stringify(newEntries));
    } catch (error) {
      console.error('知識エントリーの保存エラー:', error);
      throw error;
    }
  }

  /**
   * IDで知識エントリーを取得
   */
  async getById(id: string): Promise<KnowledgeEntry | null> {
    const entries = await this.getAll();
    return entries.find((e) => e.id === id) || null;
  }

  /**
   * タスクに関連する知識エントリーを取得
   */
  async getByTaskId(taskId: string): Promise<KnowledgeEntry[]> {
    const entries = await this.getAll();
    return entries.filter((e) => e.relatedTasks?.includes(taskId));
  }

  /**
   * ナレッジエントリーのURLを生成
   */
  generateKnowledgeUrl(entryId: string): string {
    return `/knowledge-base?entry=${entryId}`;
  }
}

export default new KnowledgeService();
