// 無駄遣い分析を管理するマネージャー

import { 
  WasteRecord, 
  WasteAnalysis, 
  WasteTrend, 
  WasteSource, 
  ImprovementSuggestion, 
  WasteAlert, 
  WasteGoal,
  WASTE_CATEGORIES 
} from '../types/wasteAnalysis';

export class WasteAnalysisManager {
  private static instance: WasteAnalysisManager;
  private wasteRecords: WasteRecord[] = [];
  private wasteGoals: WasteGoal[] = [];
  private wasteAlerts: WasteAlert[] = [];

  public static getInstance(): WasteAnalysisManager {
    if (!WasteAnalysisManager.instance) {
      WasteAnalysisManager.instance = new WasteAnalysisManager();
    }
    return WasteAnalysisManager.instance;
  }

  // 無駄遣い記録を追加
  public addWasteRecord(record: Omit<WasteRecord, 'id' | 'createdAt' | 'updatedAt'>): WasteRecord {
    const newRecord: WasteRecord = {
      ...record,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.wasteRecords.push(newRecord);
    this.saveToLocalStorage();
    this.checkForAlerts(newRecord);
    
    return newRecord;
  }

  // 無駄遣い記録を更新
  public updateWasteRecord(id: string, updates: Partial<WasteRecord>): WasteRecord | null {
    const index = this.wasteRecords.findIndex(record => record.id === id);
    if (index === -1) return null;

    this.wasteRecords[index] = {
      ...this.wasteRecords[index],
      ...updates,
      updatedAt: new Date()
    };

    this.saveToLocalStorage();
    return this.wasteRecords[index];
  }

  // 無駄遣い記録を削除
  public deleteWasteRecord(id: string): boolean {
    const index = this.wasteRecords.findIndex(record => record.id === id);
    if (index === -1) return false;

    this.wasteRecords.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  // 無駄遣い分析を生成
  public generateWasteAnalysis(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): WasteAnalysis {
    const userRecords = this.wasteRecords.filter(
      record => record.userId === userId && 
      record.date >= startDate && 
      record.date <= endDate
    );

    const totalWaste = this.calculateTotalWaste(userRecords);
    const wasteByCategory = this.calculateWasteByCategory(userRecords);
    const wasteTrends = this.calculateWasteTrends(userRecords, startDate, endDate);
    const topWasteSources = this.identifyTopWasteSources(wasteByCategory);
    const improvementSuggestions = this.generateImprovementSuggestions(userRecords, wasteByCategory);
    const wasteScore = this.calculateWasteScore(totalWaste, userRecords.length);

    return {
      period: { start: startDate, end: endDate },
      totalWaste,
      wasteByCategory,
      wasteTrends: {
        daily: wasteTrends.daily,
        weekly: wasteTrends.weekly,
        monthly: wasteTrends.monthly
      },
      topWasteSources,
      improvementSuggestions,
      wasteScore
    };
  }

  // 総無駄遣いを計算
  private calculateTotalWaste(records: WasteRecord[]): { money: number; time: number; effort: number } {
    return records.reduce(
      (total, record) => {
        if (record.isWasteful) {
          total[record.type] += record.amount;
        }
        return total;
      },
      { money: 0, time: 0, effort: 0 }
    );
  }

  // カテゴリ別無駄遣いを計算
  private calculateWasteByCategory(records: WasteRecord[]): { [categoryId: string]: any } {
    const wasteByCategory: { [categoryId: string]: any } = {};

    records.forEach(record => {
      if (!record.isWasteful) return;

      if (!wasteByCategory[record.categoryId]) {
        wasteByCategory[record.categoryId] = {
          money: 0,
          time: 0,
          effort: 0,
          count: 0
        };
      }

      wasteByCategory[record.categoryId][record.type] += record.amount;
      wasteByCategory[record.categoryId].count += 1;
    });

    return wasteByCategory;
  }

  // 無駄遣いトレンドを計算
  private calculateWasteTrends(
    records: WasteRecord[], 
    startDate: Date, 
    endDate: Date
  ): { daily: WasteTrend[]; weekly: WasteTrend[]; monthly: WasteTrend[] } {
    const daily = this.calculateDailyTrends(records, startDate, endDate);
    const weekly = this.calculateWeeklyTrends(records, startDate, endDate);
    const monthly = this.calculateMonthlyTrends(records, startDate, endDate);

    return { daily, weekly, monthly };
  }

  // 日次トレンドを計算
  private calculateDailyTrends(records: WasteRecord[], startDate: Date, endDate: Date): WasteTrend[] {
    const trends: WasteTrend[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayRecords = records.filter(record => 
        record.date.toDateString() === currentDate.toDateString()
      );

      const dayWaste = this.calculateTotalWaste(dayRecords);
      const wasteScore = this.calculateWasteScore(dayWaste, dayRecords.length);

      trends.push({
        date: new Date(currentDate),
        ...dayWaste,
        wasteScore
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return trends;
  }

  // 週次トレンドを計算
  private calculateWeeklyTrends(records: WasteRecord[], startDate: Date, endDate: Date): WasteTrend[] {
    const trends: WasteTrend[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekRecords = records.filter(record => 
        record.date >= currentDate && record.date <= weekEnd
      );

      const weekWaste = this.calculateTotalWaste(weekRecords);
      const wasteScore = this.calculateWasteScore(weekWaste, weekRecords.length);

      trends.push({
        date: new Date(currentDate),
        ...weekWaste,
        wasteScore
      });

      currentDate.setDate(currentDate.getDate() + 7);
    }

    return trends;
  }

  // 月次トレンドを計算
  private calculateMonthlyTrends(records: WasteRecord[], startDate: Date, endDate: Date): WasteTrend[] {
    const trends: WasteTrend[] = [];
    const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    while (currentDate <= endDate) {
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const monthRecords = records.filter(record => 
        record.date >= currentDate && record.date <= monthEnd
      );

      const monthWaste = this.calculateTotalWaste(monthRecords);
      const wasteScore = this.calculateWasteScore(monthWaste, monthRecords.length);

      trends.push({
        date: new Date(currentDate),
        ...monthWaste,
        wasteScore
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return trends;
  }

  // 上位無駄遣い源を特定
  private identifyTopWasteSources(wasteByCategory: { [categoryId: string]: any }): WasteSource[] {
    return Object.entries(wasteByCategory)
      .map(([categoryId, data]) => {
        const category = WASTE_CATEGORIES.find(cat => cat.id === categoryId);
        const totalAmount = data.money + data.time + data.effort;
        const totalWaste = Object.values(wasteByCategory).reduce(
          (sum, catData) => sum + catData.money + catData.time + catData.effort, 
          0
        );

        return {
          categoryId,
          categoryName: category?.name || 'Unknown',
          totalAmount,
          count: data.count,
          averageAmount: totalAmount / data.count,
          wastePercentage: totalWaste > 0 ? (totalAmount / totalWaste) * 100 : 0
        };
      })
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);
  }

  // 改善提案を生成
  private generateImprovementSuggestions(
    records: WasteRecord[], 
    wasteByCategory: { [categoryId: string]: any }
  ): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];

    // 上位3つの無駄遣いカテゴリに対して改善提案を生成
    const topCategories = Object.entries(wasteByCategory)
      .sort(([, a], [, b]) => (b.money + b.time + b.effort) - (a.money + a.time + a.effort))
      .slice(0, 3);

    topCategories.forEach(([categoryId, data]) => {
      const category = WASTE_CATEGORIES.find(cat => cat.id === categoryId);
      if (!category) return;

      const suggestion = this.generateSuggestionForCategory(categoryId, data, records);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    });

    return suggestions;
  }

  // カテゴリ別改善提案を生成
  private generateSuggestionForCategory(
    categoryId: string, 
    data: any, 
    records: WasteRecord[]
  ): ImprovementSuggestion | null {
    const category = WASTE_CATEGORIES.find(cat => cat.id === categoryId);
    if (!category) return null;

    const categoryRecords = records.filter(record => record.categoryId === categoryId);
    const totalAmount = data.money + data.time + data.effort;

    // カテゴリ別の改善提案ロジック
    switch (categoryId) {
      case 'impulse_purchases':
        return {
          id: this.generateId(),
          title: '衝動買いを減らす',
          description: '買い物前に24時間待つルールを設ける',
          categoryId,
          type: 'money',
          priority: 'high',
          potentialSavings: { money: totalAmount * 0.3 },
          implementationDifficulty: 'easy',
          estimatedImpact: 8,
          actionSteps: [
            '欲しいものリストを作成する',
            '買い物前に24時間待つ',
            '予算を設定する',
            '不要なものを定期的に整理する'
          ],
          relatedWasteRecords: categoryRecords.map(r => r.id)
        };

      case 'social_media':
        return {
          id: this.generateId(),
          title: 'SNS使用時間を制限する',
          description: 'アプリの使用時間制限を設定し、生産的な活動に時間を使う',
          categoryId,
          type: 'time',
          priority: 'high',
          potentialSavings: { time: totalAmount * 0.5 },
          implementationDifficulty: 'medium',
          estimatedImpact: 7,
          actionSteps: [
            'SNSアプリの使用時間制限を設定',
            '通知を無効化する',
            '代替の生産的活動を見つける',
            'SNS断食を定期的に行う'
          ],
          relatedWasteRecords: categoryRecords.map(r => r.id)
        };

      case 'procrastination':
        return {
          id: this.generateId(),
          title: '先延ばしを防ぐシステム構築',
          description: 'タスクを小さく分割し、時間制限を設ける',
          categoryId,
          type: 'time',
          priority: 'high',
          potentialSavings: { time: totalAmount * 0.4 },
          implementationDifficulty: 'medium',
          estimatedImpact: 9,
          actionSteps: [
            'タスクを15分単位に分割',
            'ポモドーロテクニックを活用',
            '締切を前倒しに設定',
            '報酬システムを導入'
          ],
          relatedWasteRecords: categoryRecords.map(r => r.id)
        };

      default:
        return {
          id: this.generateId(),
          title: `${category.name}の改善`,
          description: `${category.name}の無駄を減らすための改善策を検討する`,
          categoryId,
          type: category.type,
          priority: 'medium',
          potentialSavings: { [category.type]: totalAmount * 0.2 },
          implementationDifficulty: 'medium',
          estimatedImpact: 5,
          actionSteps: [
            '現状を分析する',
            '改善案を検討する',
            '小さな改善から始める',
            '効果を測定する'
          ],
          relatedWasteRecords: categoryRecords.map(r => r.id)
        };
    }
  }

  // 無駄遣いスコアを計算（0-100、低いほど良い）
  private calculateWasteScore(totalWaste: { money: number; time: number; effort: number }, recordCount: number): number {
    // 簡易的なスコア計算（実際の実装ではより複雑な計算が必要）
    const moneyScore = Math.min(totalWaste.money / 10000 * 100, 100); // 1万円で100点
    const timeScore = Math.min(totalWaste.time / 480 * 100, 100); // 8時間で100点
    const effortScore = Math.min(totalWaste.effort / 100 * 100, 100); // 100ポイントで100点
    
    return Math.round((moneyScore + timeScore + effortScore) / 3);
  }

  // アラートをチェック
  private checkForAlerts(record: WasteRecord): void {
    // 閾値超過アラート
    if (record.isWasteful) {
      const dailyWaste = this.getDailyWaste(record.userId, record.date);
      const dailyLimit = this.getDailyLimit(record.type);
      
      if (dailyWaste[record.type] > dailyLimit) {
        this.addAlert({
          type: 'threshold_exceeded',
          severity: 'high',
          title: `${record.type}の無駄遣いが上限を超過`,
          message: `今日の${record.type}の無駄遣いが${dailyLimit}を超えました`,
          categoryId: record.categoryId,
          suggestedAction: '今日の支出を控えめにしてください'
        });
      }
    }

    // パターン検出アラート
    this.checkPatternAlerts(record);
  }

  // パターンアラートをチェック
  private checkPatternAlerts(record: WasteRecord): void {
    if (!record.isWasteful) return;

    const recentRecords = this.wasteRecords.filter(r => 
      r.userId === record.userId && 
      r.categoryId === record.categoryId &&
      r.date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 過去7日
    );

    if (recentRecords.length >= 5) {
      this.addAlert({
        type: 'pattern_detected',
        severity: 'medium',
        title: '無駄遣いパターンを検出',
        message: `${WASTE_CATEGORIES.find(c => c.id === record.categoryId)?.name}の無駄遣いが頻繁に発生しています`,
        categoryId: record.categoryId,
        suggestedAction: '改善提案を確認してください'
      });
    }
  }

  // アラートを追加
  private addAlert(alert: Omit<WasteAlert, 'id' | 'createdAt' | 'isRead'>): void {
    const newAlert: WasteAlert = {
      ...alert,
      id: this.generateId(),
      createdAt: new Date(),
      isRead: false
    };

    this.wasteAlerts.push(newAlert);
    this.saveToLocalStorage();
  }

  // 日次無駄遣いを取得
  private getDailyWaste(userId: string, date: Date): { money: number; time: number; effort: number } {
    const dayRecords = this.wasteRecords.filter(record => 
      record.userId === userId && 
      record.date.toDateString() === date.toDateString() &&
      record.isWasteful
    );

    return this.calculateTotalWaste(dayRecords);
  }

  // 日次上限を取得
  private getDailyLimit(type: 'money' | 'time' | 'effort'): number {
    const limits = {
      money: 5000, // 5,000円
      time: 120,   // 2時間
      effort: 50   // 50ポイント
    };
    return limits[type];
  }

  // 無駄遣い目標を設定
  public setWasteGoal(goal: Omit<WasteGoal, 'id' | 'progress'>): WasteGoal {
    const newGoal: WasteGoal = {
      ...goal,
      id: this.generateId(),
      progress: 0
    };

    this.wasteGoals.push(newGoal);
    this.saveToLocalStorage();
    return newGoal;
  }

  // 目標の進捗を更新
  public updateGoalProgress(goalId: string): void {
    const goal = this.wasteGoals.find(g => g.id === goalId);
    if (!goal) return;

    const currentWaste = this.getCurrentWasteForGoal(goal);
    goal.progress = Math.min((currentWaste / goal.targetAmount) * 100, 100);
    this.saveToLocalStorage();
  }

  // 目標の現在の無駄遣いを取得
  private getCurrentWasteForGoal(goal: WasteGoal): number {
    const startDate = goal.startDate;
    const endDate = goal.endDate;
    
    const relevantRecords = this.wasteRecords.filter(record => 
      record.userId === goal.userId &&
      record.type === goal.type &&
      record.date >= startDate &&
      record.date <= endDate &&
      record.isWasteful
    );

    return relevantRecords.reduce((sum, record) => sum + record.amount, 0);
  }

  // データをlocalStorageに保存
  private saveToLocalStorage(): void {
    localStorage.setItem('wasteRecords', JSON.stringify(this.wasteRecords));
    localStorage.setItem('wasteGoals', JSON.stringify(this.wasteGoals));
    localStorage.setItem('wasteAlerts', JSON.stringify(this.wasteAlerts));
  }

  // データをlocalStorageから読み込み
  public loadFromLocalStorage(): void {
    const records = localStorage.getItem('wasteRecords');
    const goals = localStorage.getItem('wasteGoals');
    const alerts = localStorage.getItem('wasteAlerts');

    if (records) {
      this.wasteRecords = JSON.parse(records).map((record: any) => ({
        ...record,
        date: new Date(record.date),
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt)
      }));
    }

    if (goals) {
      this.wasteGoals = JSON.parse(goals).map((goal: any) => ({
        ...goal,
        startDate: new Date(goal.startDate),
        endDate: new Date(goal.endDate)
      }));
    }

    if (alerts) {
      this.wasteAlerts = JSON.parse(alerts).map((alert: any) => ({
        ...alert,
        createdAt: new Date(alert.createdAt)
      }));
    }
  }

  // IDを生成
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // ゲッターメソッド
  public getWasteRecords(userId: string): WasteRecord[] {
    return this.wasteRecords.filter(record => record.userId === userId);
  }

  public getWasteGoals(userId: string): WasteGoal[] {
    return this.wasteGoals.filter(goal => goal.userId === userId);
  }

  public getWasteAlerts(userId: string): WasteAlert[] {
    return this.wasteAlerts.filter(alert => 
      this.wasteRecords.some(record => record.userId === userId)
    );
  }

  public getUnreadAlertsCount(userId: string): number {
    return this.getWasteAlerts(userId).filter(alert => !alert.isRead).length;
  }
}
