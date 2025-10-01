import type { DataAnalysis, ImprovementSuggestion, Prediction, IncomeExpenseRecord, ActionRecord, Plan } from '../types';
import { actionHistoryManager } from './actionHistoryManager';
import { futurePlanningManager } from './futurePlanningManager';

class DataAnalysisManager {
  private static instance: DataAnalysisManager;
  private analyses: DataAnalysis[] = [];
  private suggestions: ImprovementSuggestion[] = [];
  private predictions: Prediction[] = [];

  private constructor() {
    this.loadFromLocalStorage();
  }

  public static getInstance(): DataAnalysisManager {
    if (!DataAnalysisManager.instance) {
      DataAnalysisManager.instance = new DataAnalysisManager();
    }
    return DataAnalysisManager.instance;
  }

  private loadFromLocalStorage(): void {
    try {
      const storedAnalyses = localStorage.getItem('data-analyses');
      if (storedAnalyses) {
        this.analyses = JSON.parse(storedAnalyses);
      }
      const storedSuggestions = localStorage.getItem('improvement-suggestions');
      if (storedSuggestions) {
        this.suggestions = JSON.parse(storedSuggestions);
      }
      const storedPredictions = localStorage.getItem('predictions');
      if (storedPredictions) {
        this.predictions = JSON.parse(storedPredictions);
      }
    } catch (error) {
      console.error('Failed to load data analysis from localStorage:', error);
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('data-analyses', JSON.stringify(this.analyses));
      localStorage.setItem('improvement-suggestions', JSON.stringify(this.suggestions));
      localStorage.setItem('predictions', JSON.stringify(this.predictions));
    } catch (error) {
      console.error('Failed to save data analysis to localStorage:', error);
    }
  }

  // 支出パターン分析
  public analyzeSpendingPattern(records: IncomeExpenseRecord[], period: { start: string; end: string }): DataAnalysis {
    const expenses = records.filter(record => record.type === 'expense');
    const totalExpenses = expenses.reduce((sum, record) => sum + Math.abs(record.amount), 0);
    
    // カテゴリ別支出
    const categorySpending: { [key: string]: number } = {};
    expenses.forEach(record => {
      const category = record.category || 'その他';
      categorySpending[category] = (categorySpending[category] || 0) + Math.abs(record.amount);
    });

    // 最も支出が多いカテゴリ
    const topCategory = Object.keys(categorySpending).reduce((a, b) => 
      categorySpending[a] > categorySpending[b] ? a : b
    );

    // 月別支出傾向
    const monthlySpending: { [key: string]: number } = {};
    expenses.forEach(record => {
      const month = record.date.substring(0, 7);
      monthlySpending[month] = (monthlySpending[month] || 0) + Math.abs(record.amount);
    });

    const insights = [
      `総支出: ¥${totalExpenses.toLocaleString()}`,
      `最も支出が多いカテゴリ: ${topCategory} (¥${categorySpending[topCategory].toLocaleString()})`,
      `平均月間支出: ¥${Math.round(totalExpenses / Object.keys(monthlySpending).length).toLocaleString()}`
    ];

    const recommendations = [
      `${topCategory}の支出を見直してみましょう`,
      '月間予算を設定して支出をコントロールしましょう',
      '定期的な支出の見直しを行いましょう'
    ];

    const analysis: DataAnalysis = {
      _id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: expenses[0]?.userId || '',
      analysisType: 'spending_pattern',
      title: '支出パターン分析',
      description: '支出の傾向とカテゴリ別分析',
      insights,
      recommendations,
      data: {
        totalExpenses,
        categorySpending,
        monthlySpending,
        recordCount: expenses.length
      },
      period,
      confidence: 85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.analyses.push(analysis);
    this.saveToLocalStorage();
    return analysis;
  }

  // 生産性分析
  public analyzeProductivity(records: ActionRecord[], period: { start: string; end: string }): DataAnalysis {
    const completedActions = records.filter(record => record.isCompleted);
    const totalDuration = records.reduce((sum, record) => sum + (record.duration || 0), 0);
    
    // カテゴリ別生産性
    const categoryProductivity: { [key: string]: { count: number; duration: number; avgMood: number; avgProductivity: number } } = {};
    records.forEach(record => {
      const category = record.category;
      if (!categoryProductivity[category]) {
        categoryProductivity[category] = { count: 0, duration: 0, avgMood: 0, avgProductivity: 0 };
      }
      categoryProductivity[category].count++;
      categoryProductivity[category].duration += record.duration || 0;
      categoryProductivity[category].avgMood += record.mood || 0;
      categoryProductivity[category].avgProductivity += record.productivity || 0;
    });

    // 平均値を計算
    Object.keys(categoryProductivity).forEach(category => {
      const data = categoryProductivity[category];
      data.avgMood = data.avgMood / data.count;
      data.avgProductivity = data.avgProductivity / data.count;
    });

    const completionRate = records.length > 0 ? (completedActions.length / records.length) * 100 : 0;
    const avgProductivity = records.length > 0 ? 
      records.reduce((sum, record) => sum + (record.productivity || 0), 0) / records.length : 0;

    const insights = [
      `完了率: ${completionRate.toFixed(1)}%`,
      `総活動時間: ${Math.round(totalDuration / 60)}時間`,
      `平均生産性スコア: ${avgProductivity.toFixed(1)}/5`
    ];

    const recommendations = [
      '完了率を向上させるために小さなタスクに分割しましょう',
      '生産性の高い時間帯を特定して重要なタスクを配置しましょう',
      '定期的な休憩を取って集中力を維持しましょう'
    ];

    const analysis: DataAnalysis = {
      _id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: records[0]?.userId || '',
      analysisType: 'productivity_analysis',
      title: '生産性分析',
      description: '活動の完了率と生産性の分析',
      insights,
      recommendations,
      data: {
        completionRate,
        totalDuration,
        avgProductivity,
        categoryProductivity,
        recordCount: records.length
      },
      period,
      confidence: 80,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.analyses.push(analysis);
    this.saveToLocalStorage();
    return analysis;
  }

  // 目標進捗分析
  public analyzeGoalProgress(plans: Plan[], period: { start: string; end: string }): DataAnalysis {
    const completedPlans = plans.filter(plan => plan.status === 'completed');
    const inProgressPlans = plans.filter(plan => plan.status === 'in_progress');
    const avgProgress = plans.length > 0 ? 
      plans.reduce((sum, plan) => sum + plan.progress, 0) / plans.length : 0;

    // カテゴリ別進捗
    const categoryProgress: { [key: string]: { count: number; avgProgress: number } } = {};
    plans.forEach(plan => {
      const category = plan.category;
      if (!categoryProgress[category]) {
        categoryProgress[category] = { count: 0, avgProgress: 0 };
      }
      categoryProgress[category].count++;
      categoryProgress[category].avgProgress += plan.progress;
    });

    Object.keys(categoryProgress).forEach(category => {
      const data = categoryProgress[category];
      data.avgProgress = data.avgProgress / data.count;
    });

    const insights = [
      `完了した計画: ${completedPlans.length}件`,
      `進行中の計画: ${inProgressPlans.length}件`,
      `平均進捗率: ${avgProgress.toFixed(1)}%`
    ];

    const recommendations = [
      '進捗の遅れている計画を見直しましょう',
      '小さなマイルストーンを設定して進捗を可視化しましょう',
      '定期的な計画の見直しを行いましょう'
    ];

    const analysis: DataAnalysis = {
      _id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: plans[0]?.userId || '',
      analysisType: 'goal_progress',
      title: '目標進捗分析',
      description: '計画の進捗状況と完了率の分析',
      insights,
      recommendations,
      data: {
        completedPlans: completedPlans.length,
        inProgressPlans: inProgressPlans.length,
        avgProgress,
        categoryProgress,
        totalPlans: plans.length
      },
      period,
      confidence: 90,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.analyses.push(analysis);
    this.saveToLocalStorage();
    return analysis;
  }

  // 改善提案を生成
  public generateSuggestions(userId: string): ImprovementSuggestion[] {
    const newSuggestions: ImprovementSuggestion[] = [];

    // 支出に関する提案
    newSuggestions.push({
      _id: `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      category: 'financial',
      title: '支出の可視化',
      description: '支出をカテゴリ別に記録して、どこにお金を使っているかを把握しましょう',
      priority: 'high',
      impact: 'high',
      effort: 'low',
      estimatedBenefit: '支出の無駄を削減し、予算管理が改善されます',
      actionSteps: [
        'すべての支出を記録する',
        'カテゴリ別に分類する',
        '月次で支出を振り返る'
      ],
      isImplemented: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 生産性に関する提案
    newSuggestions.push({
      _id: `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      category: 'productivity',
      title: '時間管理の改善',
      description: '活動の記録を通じて時間の使い方を分析し、効率的なスケジュールを作成しましょう',
      priority: 'medium',
      impact: 'high',
      effort: 'medium',
      estimatedBenefit: '作業効率が向上し、より多くの成果を上げられます',
      actionSteps: [
        '活動を記録する',
        '生産性の高い時間帯を特定する',
        '重要度の高いタスクを優先する'
      ],
      isImplemented: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.suggestions.push(...newSuggestions);
    this.saveToLocalStorage();
    return newSuggestions;
  }

  // 予測を生成
  public generatePredictions(userId: string): Prediction[] {
    const newPredictions: Prediction[] = [];

    // 支出予測
    newPredictions.push({
      _id: `prediction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      predictionType: 'spending',
      title: '来月の支出予測',
      description: '過去の支出データに基づく来月の支出予測',
      currentValue: 0,
      predictedValue: 50000,
      confidence: 75,
      timeframe: '1ヶ月',
      factors: ['過去の支出パターン', '季節要因', '生活スタイル'],
      recommendations: [
        '予算を設定して支出をコントロールしましょう',
        '不要な支出を見直しましょう'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.predictions.push(...newPredictions);
    this.saveToLocalStorage();
    return newPredictions;
  }

  // データを取得
  public getAnalyses(): DataAnalysis[] {
    return [...this.analyses];
  }

  public getSuggestions(): ImprovementSuggestion[] {
    return [...this.suggestions];
  }

  public getPredictions(): Prediction[] {
    return [...this.predictions];
  }

  // 提案を実装済みにマーク
  public markSuggestionImplemented(id: string): boolean {
    const index = this.suggestions.findIndex(suggestion => suggestion._id === id);
    if (index === -1) return false;

    this.suggestions[index] = {
      ...this.suggestions[index],
      isImplemented: true,
      implementedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.saveToLocalStorage();
    return true;
  }

  public clearData(): void {
    this.analyses = [];
    this.suggestions = [];
    this.predictions = [];
    this.saveToLocalStorage();
  }
}

export { DataAnalysisManager };
export const dataAnalysisManager = DataAnalysisManager.getInstance();
