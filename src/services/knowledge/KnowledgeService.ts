import { KnowledgeEntry } from '@/types/knowledge';

class KnowledgeService {
  private baseUrl = '/api/knowledge';

  /**
   * すべての知識エントリーを取得
   */
  async getAll(): Promise<KnowledgeEntry[]> {
    try {
      const res = await fetch(this.baseUrl, { method: 'GET' });
      if (!res.ok) throw new Error('Failed to fetch knowledge entries');
      return (await res.json()) as KnowledgeEntry[];
    } catch (error) {
      console.error('知識エントリーの取得エラー:', error);
      return [];
    }
  }

  /**
   * 知識エントリーを保存（新規 or 更新）
   */
  async save(entries: KnowledgeEntry[]): Promise<void> {
    try {
      const res = await fetch(this.baseUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entries),
      });
      if (!res.ok) throw new Error('Failed to save knowledge entries');
    } catch (error) {
      console.error('知識エントリーの保存エラー:', error);
      throw error;
    }
  }

  /**
   * IDで知識エントリーを取得
   */
  async getById(id: string): Promise<KnowledgeEntry | null> {
    try {
      const res = await fetch(`${this.baseUrl}/${id}`, { method: 'GET' });
      if (!res.ok) return null;
      return (await res.json()) as KnowledgeEntry;
    } catch (error) {
      console.error('知識エントリーの取得エラー:', error);
      return null;
    }
  }

  /**
   * タスクに関連する知識エントリーを取得
   */
  async getByTaskId(taskId: string): Promise<KnowledgeEntry[]> {
    try {
      const res = await fetch(`${this.baseUrl}?taskId=${encodeURIComponent(taskId)}`, {
        method: 'GET',
      });
      if (!res.ok) throw new Error('Failed to fetch by taskId');
      return (await res.json()) as KnowledgeEntry[];
    } catch (error) {
      console.error('知識エントリーの取得エラー:', error);
      return [];
    }
  }

  /**
   * ナレッジエントリーのURLを生成
   */
  generateKnowledgeUrl(entryId: string): string {
    return `/knowledge-base?entry=${entryId}`;
  }
}

export default new KnowledgeService();
