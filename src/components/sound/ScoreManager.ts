// 楽曲保存・共有機能
export interface SavedScore {
  id: string;
  title: string;
  composer: string;
  scoreData: any;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  isPublic: boolean;
  shareId?: string;
}

export interface ScoreShareData {
  shareId: string;
  title: string;
  composer: string;
  scoreData: any;
  createdAt: Date;
  tags: string[];
  viewCount: number;
  likeCount: number;
}

export class ScoreManager {
  private static readonly STORAGE_KEY = 'saved_scores';
  private static readonly SHARE_KEY = 'shared_scores';

  // 楽曲を保存
  static saveScore(scoreData: any, title: string, composer: string = 'Generated'): SavedScore {
    const savedScore: SavedScore = {
      id: this.generateId(),
      title: title,
      composer: composer,
      scoreData: scoreData,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: this.extractTags(scoreData),
      isPublic: false
    };

    const savedScores = this.getSavedScores();
    savedScores.push(savedScore);
    this.setSavedScores(savedScores);

    return savedScore;
  }

  // 保存された楽曲一覧を取得
  static getSavedScores(): SavedScore[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      
      const scores = JSON.parse(data);
      return scores.map((score: any) => ({
        ...score,
        createdAt: new Date(score.createdAt),
        updatedAt: new Date(score.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to load saved scores:', error);
      return [];
    }
  }

  // 楽曲を更新
  static updateScore(id: string, updates: Partial<SavedScore>): boolean {
    const savedScores = this.getSavedScores();
    const index = savedScores.findIndex(score => score.id === id);
    
    if (index === -1) return false;

    savedScores[index] = {
      ...savedScores[index],
      ...updates,
      updatedAt: new Date()
    };

    this.setSavedScores(savedScores);
    return true;
  }

  // 楽曲を削除
  static deleteScore(id: string): boolean {
    const savedScores = this.getSavedScores();
    const filteredScores = savedScores.filter(score => score.id !== id);
    
    if (filteredScores.length === savedScores.length) return false;

    this.setSavedScores(filteredScores);
    return true;
  }

  // 楽曲を共有
  static shareScore(id: string): string | null {
    const savedScores = this.getSavedScores();
    const score = savedScores.find(s => s.id === id);
    
    if (!score) return null;

    const shareId = this.generateShareId();
    const shareData: ScoreShareData = {
      shareId: shareId,
      title: score.title,
      composer: score.composer,
      scoreData: score.scoreData,
      createdAt: score.createdAt,
      tags: score.tags,
      viewCount: 0,
      likeCount: 0
    };

    // 共有データを保存
    const sharedScores = this.getSharedScores();
    sharedScores.push(shareData);
    this.setSharedScores(sharedScores);

    // 元の楽曲に共有IDを設定
    this.updateScore(id, { shareId: shareId, isPublic: true });

    return shareId;
  }

  // 共有された楽曲を取得
  static getSharedScore(shareId: string): ScoreShareData | null {
    const sharedScores = this.getSharedScores();
    return sharedScores.find(score => score.shareId === shareId) || null;
  }

  // 共有された楽曲一覧を取得
  static getSharedScores(): ScoreShareData[] {
    try {
      const data = localStorage.getItem(this.SHARE_KEY);
      if (!data) return [];
      
      const scores = JSON.parse(data);
      return scores.map((score: any) => ({
        ...score,
        createdAt: new Date(score.createdAt)
      }));
    } catch (error) {
      console.error('Failed to load shared scores:', error);
      return [];
    }
  }

  // 楽曲を検索
  static searchScores(query: string, tags?: string[]): SavedScore[] {
    const savedScores = this.getSavedScores();
    const lowerQuery = query.toLowerCase();

    return savedScores.filter(score => {
      const matchesTitle = score.title.toLowerCase().includes(lowerQuery);
      const matchesComposer = score.composer.toLowerCase().includes(lowerQuery);
      const matchesTags = tags ? tags.some(tag => score.tags.includes(tag)) : true;
      
      return (matchesTitle || matchesComposer) && matchesTags;
    });
  }

  // 楽曲をエクスポート（JSON形式）
  static exportScore(score: SavedScore): string {
    return JSON.stringify({
      title: score.title,
      composer: score.composer,
      scoreData: score.scoreData,
      createdAt: score.createdAt.toISOString(),
      tags: score.tags
    }, null, 2);
  }

  // 楽曲をインポート
  static importScore(jsonData: string): SavedScore | null {
    try {
      const data = JSON.parse(jsonData);
      const score: SavedScore = {
        id: this.generateId(),
        title: data.title || 'Imported Score',
        composer: data.composer || 'Unknown',
        scoreData: data.scoreData,
        createdAt: new Date(data.createdAt || Date.now()),
        updatedAt: new Date(),
        tags: data.tags || [],
        isPublic: false
      };

      const savedScores = this.getSavedScores();
      savedScores.push(score);
      this.setSavedScores(savedScores);

      return score;
    } catch (error) {
      console.error('Failed to import score:', error);
      return null;
    }
  }

  // タグを抽出
  private static extractTags(scoreData: any): string[] {
    const tags: string[] = [];
    
    if (scoreData.genre) {
      tags.push(scoreData.genre);
    }
    
    if (scoreData.tempo) {
      if (scoreData.tempo < 80) tags.push('slow');
      else if (scoreData.tempo > 140) tags.push('fast');
      else tags.push('medium-tempo');
    }
    
    if (scoreData.key) {
      tags.push(scoreData.key);
    }
    
    if (scoreData.notes && scoreData.notes.length > 0) {
      const instruments = [...new Set(scoreData.notes.map((note: any) => note.instrument))];
      tags.push(...instruments);
    }
    
    return tags;
  }

  // IDを生成
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 共有IDを生成
  private static generateShareId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // 保存された楽曲を設定
  private static setSavedScores(scores: SavedScore[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scores));
  }

  // 共有された楽曲を設定
  private static setSharedScores(scores: ScoreShareData[]): void {
    localStorage.setItem(this.SHARE_KEY, JSON.stringify(scores));
  }
}
