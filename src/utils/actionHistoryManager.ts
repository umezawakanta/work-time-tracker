// 行動記録管理マネージャー

import { 
  ActionRecord, 
  ActionCategory, 
  ActionAnalysis, 
  ActionPattern, 
  ActionGoal,
  ActionAlert,
  ActionTrend,
  ActionInsight
} from '../types/actionHistory';

export class ActionHistoryManager {
  private static instance: ActionHistoryManager;
  private actionRecords: ActionRecord[] = [];
  private goals: ActionGoal[] = [];
  private alerts: ActionAlert[] = [];

  public static getInstance(): ActionHistoryManager {
    if (!ActionHistoryManager.instance) {
      ActionHistoryManager.instance = new ActionHistoryManager();
    }
    return ActionHistoryManager.instance;
  }

  // ローカルストレージからデータを読み込み
  public loadFromLocalStorage(): void {
    try {
      const recordsData = localStorage.getItem('actionHistory_records');
      if (recordsData) {
        this.actionRecords = JSON.parse(recordsData).map((record: any) => ({
          ...record,
          timestamp: new Date(record.timestamp),
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt)
        }));
      }

      const goalsData = localStorage.getItem('actionHistory_goals');
      if (goalsData) {
        this.goals = JSON.parse(goalsData).map((goal: any) => ({
          ...goal,
          createdAt: new Date(goal.createdAt),
          targetDate: new Date(goal.targetDate)
        }));
      }

      const alertsData = localStorage.getItem('actionHistory_alerts');
      if (alertsData) {
        this.alerts = JSON.parse(alertsData).map((alert: any) => ({
          ...alert,
          createdAt: new Date(alert.createdAt)
        }));
      }
    } catch (error) {
      console.error('行動記録データの読み込みエラー:', error);
    }
  }

  // ローカルストレージにデータを保存
  public saveToLocalStorage(): void {
    try {
      localStorage.setItem('actionHistory_records', JSON.stringify(this.actionRecords));
      localStorage.setItem('actionHistory_goals', JSON.stringify(this.goals));
      localStorage.setItem('actionHistory_alerts', JSON.stringify(this.alerts));
    } catch (error) {
      console.error('行動記録データの保存エラー:', error);
    }
  }

  // 行動記録を追加
  public addActionRecord(record: Omit<ActionRecord, 'id' | 'createdAt' | 'updatedAt'>): ActionRecord {
    const newRecord: ActionRecord = {
      ...record,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.actionRecords.push(newRecord);
    this.saveToLocalStorage();
    this.generateAlerts(record.userId);
    return newRecord;
  }

  // 行動記録を更新
  public updateActionRecord(id: string, updates: Partial<ActionRecord>): ActionRecord | null {
    const index = this.actionRecords.findIndex(record => record.id === id);
    if (index === -1) return null;

    this.actionRecords[index] = {
      ...this.actionRecords[index],
      ...updates,
      updatedAt: new Date()
    };

    this.saveToLocalStorage();
    this.generateAlerts(this.actionRecords[index].userId);
    return this.actionRecords[index];
  }

  // 行動記録を削除
  public deleteActionRecord(id: string): boolean {
    const index = this.actionRecords.findIndex(record => record.id === id);
    if (index === -1) return false;

    this.actionRecords.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  // ユーザーの行動記録を取得
  public getActionRecords(userId: string, filters?: {
    category?: ActionCategory;
    startDate?: Date;
    endDate?: Date;
    tags?: string[];
  }): ActionRecord[] {
    let records = this.actionRecords.filter(record => record.userId === userId);

    if (filters) {
      if (filters.category) {
        records = records.filter(record => record.category === filters.category);
      }
      if (filters.startDate) {
        records = records.filter(record => record.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        records = records.filter(record => record.timestamp <= filters.endDate!);
      }
      if (filters.tags && filters.tags.length > 0) {
        records = records.filter(record => 
          filters.tags!.some(tag => record.tags.includes(tag))
        );
      }
    }

    return records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // 行動分析を生成
  public generateActionAnalysis(userId: string, period: 'week' | 'month' | 'year' = 'month'): ActionAnalysis {
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

    const records = this.getActionRecords(userId, { startDate, endDate });
    
    // カテゴリ別の統計
    const categoryStats = this.calculateCategoryStats(records);
    
    // 時間帯別の統計
    const timeStats = this.calculateTimeStats(records);
    
    // タグ別の統計
    const tagStats = this.calculateTagStats(records);
    
    // 行動パターンの検出
    const patterns = this.detectActionPatterns(records);
    
    // 生産性スコアの計算
    const productivityScore = this.calculateProductivityScore(records);
    
    // 改善提案の生成
    const insights = this.generateInsights(records, patterns, productivityScore);

    return {
      period: { start: startDate, end: endDate },
      totalActions: records.length,
      categoryStats,
      timeStats,
      tagStats,
      patterns,
      productivityScore,
      insights,
      lastUpdated: new Date()
    };
  }

  // カテゴリ別統計を計算
  private calculateCategoryStats(records: ActionRecord[]): { [category: string]: { count: number; totalDuration: number; averageDuration: number } } {
    const stats: { [category: string]: { count: number; totalDuration: number; averageDuration: number } } = {};

    records.forEach(record => {
      if (!stats[record.category]) {
        stats[record.category] = { count: 0, totalDuration: 0, averageDuration: 0 };
      }
      stats[record.category].count++;
      stats[record.category].totalDuration += record.duration || 0;
    });

    // 平均時間を計算
    Object.keys(stats).forEach(category => {
      if (stats[category].count > 0) {
        stats[category].averageDuration = stats[category].totalDuration / stats[category].count;
      }
    });

    return stats;
  }

  // 時間帯別統計を計算
  private calculateTimeStats(records: ActionRecord[]): { [hour: number]: number } {
    const stats: { [hour: number]: number } = {};

    records.forEach(record => {
      const hour = record.timestamp.getHours();
      stats[hour] = (stats[hour] || 0) + 1;
    });

    return stats;
  }

  // タグ別統計を計算
  private calculateTagStats(records: ActionRecord[]): { [tag: string]: number } {
    const stats: { [tag: string]: number } = {};

    records.forEach(record => {
      record.tags.forEach(tag => {
        stats[tag] = (stats[tag] || 0) + 1;
      });
    });

    return stats;
  }

  // 行動パターンを検出
  private detectActionPatterns(records: ActionRecord[]): ActionPattern[] {
    const patterns: ActionPattern[] = [];

    // 時間帯パターンの検出
    const timePatterns = this.detectTimePatterns(records);
    patterns.push(...timePatterns);

    // カテゴリパターンの検出
    const categoryPatterns = this.detectCategoryPatterns(records);
    patterns.push(...categoryPatterns);

    // 継続性パターンの検出
    const continuityPatterns = this.detectContinuityPatterns(records);
    patterns.push(...continuityPatterns);

    return patterns;
  }

  // 時間帯パターンを検出
  private detectTimePatterns(records: ActionRecord[]): ActionPattern[] {
    const patterns: ActionPattern[] = [];
    const timeStats = this.calculateTimeStats(records);

    // 最も活動的な時間帯を検出
    const mostActiveHour = Object.keys(timeStats).reduce((a, b) => 
      timeStats[parseInt(a)] > timeStats[parseInt(b)] ? a : b
    );

    if (timeStats[parseInt(mostActiveHour)] > records.length * 0.2) {
      patterns.push({
        type: 'time_pattern',
        title: '活動時間帯',
        description: `${mostActiveHour}時台に最も活動的です`,
        frequency: timeStats[parseInt(mostActiveHour)],
        confidence: Math.min(timeStats[parseInt(mostActiveHour)] / records.length, 1),
        suggestions: ['この時間帯を有効活用してください', '他の時間帯の活動も検討してください']
      });
    }

    return patterns;
  }

  // カテゴリパターンを検出
  private detectCategoryPatterns(records: ActionRecord[]): ActionPattern[] {
    const patterns: ActionPattern[] = [];
    const categoryStats = this.calculateCategoryStats(records);

    // 最も多いカテゴリを検出
    const mostFrequentCategory = Object.keys(categoryStats).reduce((a, b) => 
      categoryStats[a].count > categoryStats[b].count ? a : b
    );

    if (categoryStats[mostFrequentCategory].count > records.length * 0.3) {
      patterns.push({
        type: 'category_pattern',
        title: '主要活動カテゴリ',
        description: `${mostFrequentCategory}が最も多い活動です`,
        frequency: categoryStats[mostFrequentCategory].count,
        confidence: Math.min(categoryStats[mostFrequentCategory].count / records.length, 1),
        suggestions: ['バランスの取れた活動を心がけてください', '他のカテゴリの活動も増やしてください']
      });
    }

    return patterns;
  }

  // 継続性パターンを検出
  private detectContinuityPatterns(records: ActionRecord[]): ActionPattern[] {
    const patterns: ActionPattern[] = [];

    // 連続した日数の活動を検出
    const dailyActivity = this.calculateDailyActivity(records);
    const consecutiveDays = this.calculateConsecutiveDays(dailyActivity);

    if (consecutiveDays > 7) {
      patterns.push({
        type: 'continuity_pattern',
        title: '継続性',
        description: `${consecutiveDays}日連続で活動しています`,
        frequency: consecutiveDays,
        confidence: Math.min(consecutiveDays / 30, 1),
        suggestions: ['素晴らしい継続力です！', 'この調子で続けてください']
      });
    }

    return patterns;
  }

  // 日別活動を計算
  private calculateDailyActivity(records: ActionRecord[]): { [date: string]: number } {
    const dailyActivity: { [date: string]: number } = {};

    records.forEach(record => {
      const date = record.timestamp.toISOString().split('T')[0];
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });

    return dailyActivity;
  }

  // 連続日数を計算
  private calculateConsecutiveDays(dailyActivity: { [date: string]: number }): number {
    const dates = Object.keys(dailyActivity).sort();
    let consecutiveDays = 0;
    let maxConsecutiveDays = 0;

    for (let i = 0; i < dates.length; i++) {
      if (i === 0 || this.isConsecutiveDay(dates[i-1], dates[i])) {
        consecutiveDays++;
        maxConsecutiveDays = Math.max(maxConsecutiveDays, consecutiveDays);
      } else {
        consecutiveDays = 1;
      }
    }

    return maxConsecutiveDays;
  }

  // 連続した日かどうかを判定
  private isConsecutiveDay(prevDate: string, currentDate: string): boolean {
    const prev = new Date(prevDate);
    const current = new Date(currentDate);
    const diffTime = current.getTime() - prev.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays === 1;
  }

  // 生産性スコアを計算
  private calculateProductivityScore(records: ActionRecord[]): number {
    if (records.length === 0) return 0;

    let score = 0;

    // 活動の多様性（30点）
    const uniqueCategories = new Set(records.map(r => r.category)).size;
    const categoryDiversity = Math.min(uniqueCategories / 5, 1) * 30;
    score += categoryDiversity;

    // 活動の頻度（25点）
    const activityFrequency = Math.min(records.length / 30, 1) * 25;
    score += activityFrequency;

    // 活動の継続性（25点）
    const dailyActivity = this.calculateDailyActivity(records);
    const consecutiveDays = this.calculateConsecutiveDays(dailyActivity);
    const continuity = Math.min(consecutiveDays / 30, 1) * 25;
    score += continuity;

    // 活動の質（20点）
    const qualityScore = records.reduce((sum, record) => {
      let quality = 0;
      if (record.duration && record.duration > 30) quality += 0.5; // 30分以上の活動
      if (record.tags.length > 0) quality += 0.3; // タグが付いている
      if (record.description && record.description.length > 10) quality += 0.2; // 詳細な説明
      return sum + quality;
    }, 0) / records.length * 20;
    score += qualityScore;

    return Math.min(Math.max(score, 0), 100);
  }

  // 洞察を生成
  private generateInsights(records: ActionRecord[], patterns: ActionPattern[], productivityScore: number): ActionInsight[] {
    const insights: ActionInsight[] = [];

    // 生産性スコアに基づく洞察
    if (productivityScore < 30) {
      insights.push({
        type: 'productivity',
        title: '生産性の向上が必要です',
        description: '活動の多様性と継続性を高めることをお勧めします',
        priority: 'high',
        suggestions: [
          '毎日少しずつでも活動を記録してください',
          '異なるカテゴリの活動に挑戦してください',
          '活動に詳細な説明を追加してください'
        ]
      });
    } else if (productivityScore > 70) {
      insights.push({
        type: 'productivity',
        title: '素晴らしい生産性です',
        description: '継続的な活動ができています',
        priority: 'low',
        suggestions: [
          'この調子で続けてください',
          '新しい挑戦も検討してください'
        ]
      });
    }

    // パターンに基づく洞察
    patterns.forEach(pattern => {
      if (pattern.confidence > 0.7) {
        insights.push({
          type: 'pattern',
          title: pattern.title,
          description: pattern.description,
          priority: pattern.type === 'continuity_pattern' ? 'low' : 'medium',
          suggestions: pattern.suggestions
        });
      }
    });

    return insights;
  }

  // アラートを生成
  private generateAlerts(userId: string): void {
    const analysis = this.generateActionAnalysis(userId, 'week');
    
    // 既存のアラートをクリア
    this.alerts = this.alerts.filter(alert => alert.userId !== userId);

    // 活動が少ない場合のアラート
    if (analysis.totalActions < 5) {
      this.alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'low_activity',
        severity: 'medium',
        title: '活動が少ないです',
        message: '今週の活動記録が少ないです。積極的に活動を記録してください。',
        userId,
        createdAt: new Date(),
        isRead: false
      });
    }

    // 生産性が低い場合のアラート
    if (analysis.productivityScore < 30) {
      this.alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'low_productivity',
        severity: 'high',
        title: '生産性の改善が必要です',
        message: '活動の多様性と継続性を高めることをお勧めします。',
        userId,
        createdAt: new Date(),
        isRead: false
      });
    }
  }

  // ユーザーのアラートを取得
  public getAlerts(userId: string): ActionAlert[] {
    return this.alerts.filter(alert => alert.userId === userId);
  }

  // アラートを既読にする
  public markAlertAsRead(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
      this.saveToLocalStorage();
    }
  }

  // 目標を追加
  public addGoal(goal: Omit<ActionGoal, 'id' | 'createdAt'>): ActionGoal {
    const newGoal: ActionGoal = {
      ...goal,
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    this.goals.push(newGoal);
    this.saveToLocalStorage();
    return newGoal;
  }

  // ユーザーの目標を取得
  public getGoals(userId: string): ActionGoal[] {
    return this.goals.filter(goal => goal.userId === userId);
  }

  // 目標を更新
  public updateGoal(id: string, updates: Partial<ActionGoal>): ActionGoal | null {
    const index = this.goals.findIndex(goal => goal.id === id);
    if (index === -1) return null;

    this.goals[index] = { ...this.goals[index], ...updates };
    this.saveToLocalStorage();
    return this.goals[index];
  }

  // 目標を削除
  public deleteGoal(id: string): boolean {
    const index = this.goals.findIndex(goal => goal.id === id);
    if (index === -1) return false;

    this.goals.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  // 行動トレンドを取得
  public getActionTrends(userId: string, period: 'week' | 'month' | 'year' = 'month'): ActionTrend[] {
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

    const records = this.getActionRecords(userId, { startDate, endDate });
    const trends: ActionTrend[] = [];

    // 日別の統計を計算
    const dailyStats = this.calculateDailyStats(records);
    
    Object.keys(dailyStats).forEach(date => {
      trends.push({
        date: new Date(date),
        totalActions: dailyStats[date].totalActions,
        totalDuration: dailyStats[date].totalDuration,
        categories: dailyStats[date].categories,
        productivityScore: dailyStats[date].productivityScore
      });
    });

    return trends.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  // 日別統計を計算
  private calculateDailyStats(records: ActionRecord[]): { [date: string]: any } {
    const dailyStats: { [date: string]: any } = {};

    records.forEach(record => {
      const date = record.timestamp.toISOString().split('T')[0];
      
      if (!dailyStats[date]) {
        dailyStats[date] = {
          totalActions: 0,
          totalDuration: 0,
          categories: {},
          productivityScore: 0
        };
      }

      dailyStats[date].totalActions++;
      dailyStats[date].totalDuration += record.duration || 0;
      dailyStats[date].categories[record.category] = (dailyStats[date].categories[record.category] || 0) + 1;
    });

    // 日別の生産性スコアを計算
    Object.keys(dailyStats).forEach(date => {
      const dayRecords = records.filter(r => r.timestamp.toISOString().split('T')[0] === date);
      dailyStats[date].productivityScore = this.calculateProductivityScore(dayRecords);
    });

    return dailyStats;
  }
}
