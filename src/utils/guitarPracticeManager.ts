import { GuitarPracticeRecord, GuitarPracticeSummary, GuitarPracticeAnalysis, GUITAR_TECHNIQUES, GUITAR_DIFFICULTIES } from '../types/guitarPractice';
import { apiFetch } from './apiClient';

export class GuitarPracticeManager {
  private static instance: GuitarPracticeManager;
  private practiceRecords: GuitarPracticeRecord[] = [];

  private constructor() {}

  public static getInstance(): GuitarPracticeManager {
    if (!GuitarPracticeManager.instance) {
      GuitarPracticeManager.instance = new GuitarPracticeManager();
    }
    return GuitarPracticeManager.instance;
  }

  // サーバーから練習記録を読み込み
  public async loadFromServer(userId: string): Promise<void> {
    try {
      const response = await apiFetch(`/api/guitar-practice?userId=${userId}`, {
        method: 'GET'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.records) {
          this.practiceRecords = data.records.map((record: any) => ({
            ...record,
            practiceDate: new Date(record.practiceDate),
            createdAt: new Date(record.createdAt),
            updatedAt: new Date(record.updatedAt)
          }));
        }
      }
    } catch (error) {
      console.error('ギター練習記録の読み込みエラー:', error);
    }
  }

  // サーバーに練習記録を保存
  public async saveToServer(userId: string, record: Omit<GuitarPracticeRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
    try {
      const response = await apiFetch('/api/guitar-practice', {
        method: 'POST',
        body: JSON.stringify({
          ...record,
          userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.record) {
          this.practiceRecords.push({
            ...data.record,
            practiceDate: new Date(data.record.practiceDate),
            createdAt: new Date(data.record.createdAt),
            updatedAt: new Date(data.record.updatedAt)
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('ギター練習記録の保存エラー:', error);
      return false;
    }
  }

  // 練習記録を更新
  public async updateRecord(recordId: string, updates: Partial<Omit<GuitarPracticeRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    try {
      const response = await apiFetch(`/api/guitar-practice/${recordId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.record) {
          const index = this.practiceRecords.findIndex(r => r.id === recordId);
          if (index !== -1) {
            this.practiceRecords[index] = {
              ...this.practiceRecords[index],
              ...data.record,
              practiceDate: new Date(data.record.practiceDate),
              updatedAt: new Date(data.record.updatedAt)
            };
          }
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('ギター練習記録の更新エラー:', error);
      return false;
    }
  }

  // 練習記録を削除
  public async deleteRecord(recordId: string): Promise<boolean> {
    try {
      const response = await apiFetch(`/api/guitar-practice/${recordId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        this.practiceRecords = this.practiceRecords.filter(r => r.id !== recordId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('ギター練習記録の削除エラー:', error);
      return false;
    }
  }

  // 練習記録を取得
  public getPracticeRecords(userId: string): GuitarPracticeRecord[] {
    return this.practiceRecords.filter(record => record.userId === userId);
  }

  // 練習記録のサマリーを取得
  public getPracticeSummary(userId: string): GuitarPracticeSummary {
    const userRecords = this.getPracticeRecords(userId);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisWeekRecords = userRecords.filter(record => record.practiceDate >= weekStart);
    const thisMonthRecords = userRecords.filter(record => record.practiceDate >= monthStart);

    const totalPracticeTime = userRecords.reduce((sum, record) => sum + record.duration, 0);
    const totalSessions = userRecords.length;
    const averageSessionTime = totalSessions > 0 ? Math.round(totalPracticeTime / totalSessions) : 0;
    const thisWeekTime = thisWeekRecords.reduce((sum, record) => sum + record.duration, 0);
    const thisMonthTime = thisMonthRecords.reduce((sum, record) => sum + record.duration, 0);
    const lastPracticeDate = userRecords.length > 0 ? userRecords[userRecords.length - 1].practiceDate : undefined;

    // 最も練習したテクニック
    const techniqueCount: { [key: string]: number } = {};
    userRecords.forEach(record => {
      techniqueCount[record.technique] = (techniqueCount[record.technique] || 0) + 1;
    });
    const mostPracticedTechnique = Object.keys(techniqueCount).reduce((a, b) => 
      techniqueCount[a] > techniqueCount[b] ? a : b, 'コード練習'
    );

    const averageRating = totalSessions > 0 ? 
      userRecords.reduce((sum, record) => sum + record.rating, 0) / totalSessions : 0;

    return {
      totalPracticeTime,
      totalSessions,
      averageSessionTime,
      thisWeekTime,
      thisMonthTime,
      lastPracticeDate,
      mostPracticedTechnique,
      averageRating: Math.round(averageRating * 10) / 10
    };
  }

  // 練習記録の分析を取得
  public getPracticeAnalysis(userId: string): GuitarPracticeAnalysis {
    const userRecords = this.getPracticeRecords(userId);
    const now = new Date();

    // 週別の進捗
    const weeklyProgress: Array<{ week: string; totalTime: number; sessions: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (now.getDay() + i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekRecords = userRecords.filter(record => 
        record.practiceDate >= weekStart && record.practiceDate <= weekEnd
      );

      weeklyProgress.push({
        week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        totalTime: weekRecords.reduce((sum, record) => sum + record.duration, 0),
        sessions: weekRecords.length
      });
    }

    // テクニック別の分析
    const techniqueBreakdown: Array<{ technique: string; totalTime: number; sessions: number; averageRating: number }> = [];
    const techniqueData: { [key: string]: { totalTime: number; sessions: number; ratings: number[] } } = {};

    userRecords.forEach(record => {
      if (!techniqueData[record.technique]) {
        techniqueData[record.technique] = { totalTime: 0, sessions: 0, ratings: [] };
      }
      techniqueData[record.technique].totalTime += record.duration;
      techniqueData[record.technique].sessions += 1;
      techniqueData[record.technique].ratings.push(record.rating);
    });

    Object.keys(techniqueData).forEach(technique => {
      const data = techniqueData[technique];
      techniqueBreakdown.push({
        technique,
        totalTime: data.totalTime,
        sessions: data.sessions,
        averageRating: data.ratings.reduce((sum, rating) => sum + rating, 0) / data.ratings.length
      });
    });

    // 難易度別の分布
    const difficultyDistribution: Array<{ difficulty: string; count: number; percentage: number }> = [];
    const difficultyCount: { [key: string]: number } = {};
    userRecords.forEach(record => {
      difficultyCount[record.difficulty] = (difficultyCount[record.difficulty] || 0) + 1;
    });

    Object.keys(difficultyCount).forEach(difficulty => {
      const count = difficultyCount[difficulty];
      difficultyDistribution.push({
        difficulty: difficulty === 'beginner' ? '初級' : difficulty === 'intermediate' ? '中級' : '上級',
        count,
        percentage: Math.round((count / userRecords.length) * 100)
      });
    });

    // 改善傾向の判定
    const recentWeeks = weeklyProgress.slice(-4);
    const olderWeeks = weeklyProgress.slice(-8, -4);
    const recentAvg = recentWeeks.reduce((sum, week) => sum + week.totalTime, 0) / recentWeeks.length;
    const olderAvg = olderWeeks.reduce((sum, week) => sum + week.totalTime, 0) / olderWeeks.length;
    
    let improvementTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentAvg > olderAvg * 1.1) {
      improvementTrend = 'improving';
    } else if (recentAvg < olderAvg * 0.9) {
      improvementTrend = 'declining';
    }

    return {
      weeklyProgress,
      techniqueBreakdown,
      difficultyDistribution,
      improvementTrend
    };
  }
}
