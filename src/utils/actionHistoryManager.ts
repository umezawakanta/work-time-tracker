import type { ActionRecord, ActionPattern } from '../types';

class ActionHistoryManager {
  private static instance: ActionHistoryManager;
  private actionRecords: ActionRecord[] = [];
  private actionPatterns: ActionPattern[] = [];

  private constructor() {
    this.loadFromLocalStorage();
  }

  public static getInstance(): ActionHistoryManager {
    if (!ActionHistoryManager.instance) {
      ActionHistoryManager.instance = new ActionHistoryManager();
    }
    return ActionHistoryManager.instance;
  }

  public loadFromLocalStorage(): void {
    try {
      const storedRecords = localStorage.getItem('action-records');
      if (storedRecords) {
        this.actionRecords = JSON.parse(storedRecords);
      }
      const storedPatterns = localStorage.getItem('action-patterns');
      if (storedPatterns) {
        this.actionPatterns = JSON.parse(storedPatterns);
      }
    } catch (error) {
      console.error('Failed to load action history from localStorage:', error);
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('action-records', JSON.stringify(this.actionRecords));
      localStorage.setItem('action-patterns', JSON.stringify(this.actionPatterns));
    } catch (error) {
      console.error('Failed to save action history to localStorage:', error);
    }
  }

  public addActionRecord(record: Omit<ActionRecord, '_id' | 'createdAt' | 'updatedAt'>): ActionRecord {
    const newRecord: ActionRecord = {
      ...record,
      _id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.actionRecords.push(newRecord);
    this.saveToLocalStorage();
    return newRecord;
  }

  public updateActionRecord(id: string, updates: Partial<ActionRecord>): ActionRecord | null {
    const index = this.actionRecords.findIndex(record => record._id === id);
    if (index === -1) return null;

    this.actionRecords[index] = {
      ...this.actionRecords[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToLocalStorage();
    return this.actionRecords[index];
  }

  public deleteActionRecord(id: string): boolean {
    const index = this.actionRecords.findIndex(record => record._id === id);
    if (index === -1) return false;

    this.actionRecords.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  public getActionRecords(): ActionRecord[] {
    return [...this.actionRecords];
  }

  public getActionRecordsByPeriod(startDate: Date, endDate: Date): ActionRecord[] {
    return this.actionRecords.filter(record => {
      const recordDate = new Date(record.startTime);
      return recordDate >= startDate && recordDate <= endDate;
    });
  }

  public getActionRecordsByCategory(category: string): ActionRecord[] {
    return this.actionRecords.filter(record => record.category === category);
  }

  public generateActionAnalysis(userId: string, period: 'week' | 'month' | 'year'): ActionAnalysis {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    const userRecords = this.actionRecords.filter(record => record.userId === userId);
    const periodRecords = userRecords.filter(record => {
      const recordDate = new Date(record.startTime);
      return recordDate >= startDate && recordDate <= endDate;
    });

    const totalActions = periodRecords.length;
    const categoryStats: { [category: string]: { count: number; totalDuration: number; averageDuration: number } } = {};
    const timeStats: { [hour: number]: number } = {};
    const tagStats: { [tag: string]: number } = {};

    periodRecords.forEach(record => {
      // カテゴリ統計
      if (!categoryStats[record.category]) {
        categoryStats[record.category] = { count: 0, totalDuration: 0, averageDuration: 0 };
      }
      categoryStats[record.category].count++;
      categoryStats[record.category].totalDuration += record.duration || 0;

      // 時間統計
      const hour = new Date(record.startTime).getHours();
      timeStats[hour] = (timeStats[hour] || 0) + 1;

      // タグ統計
      record.tags.forEach(tag => {
        tagStats[tag] = (tagStats[tag] || 0) + 1;
      });
    });

    // 平均時間を計算
    Object.keys(categoryStats).forEach(category => {
      const stats = categoryStats[category];
      stats.averageDuration = stats.count > 0 ? stats.totalDuration / stats.count : 0;
    });

    // 生産性スコアを計算（簡易版）
    const productivityScore = Math.min(100, Math.max(0, (totalActions * 10) + (Object.keys(categoryStats).length * 5)));

    return {
      period: { start: startDate, end: endDate },
      totalActions,
      categoryStats,
      timeStats,
      tagStats,
      patterns: this.actionPatterns,
      productivityScore,
      insights: [],
      lastUpdated: new Date()
    };
  }

  public getActionTrends(userId: string, period: 'week' | 'month' | 'year'): ActionTrend[] {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    const userRecords = this.actionRecords.filter(record => record.userId === userId);
    const trends: ActionTrend[] = [];
    
    // 日別のトレンドを生成（簡易版）
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayRecords = userRecords.filter(record => {
        const recordDate = new Date(record.startTime);
        return recordDate.toDateString() === d.toDateString();
      });

      const categories: { [category: string]: number } = {};
      let totalDuration = 0;

      dayRecords.forEach(record => {
        categories[record.category] = (categories[record.category] || 0) + 1;
        totalDuration += record.duration || 0;
      });

      trends.push({
        date: new Date(d),
        totalActions: dayRecords.length,
        totalDuration,
        categories,
        productivityScore: Math.min(100, Math.max(0, (dayRecords.length * 10) + (Object.keys(categories).length * 5)))
      });
    }

    return trends;
  }

  public clearData(): void {
    this.actionRecords = [];
    this.actionPatterns = [];
    this.saveToLocalStorage();
  }
}

export { ActionHistoryManager };
export const actionHistoryManager = ActionHistoryManager.getInstance();