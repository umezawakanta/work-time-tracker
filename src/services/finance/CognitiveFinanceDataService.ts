/**
 * 💾 認知特性財務データサービス
 * ADHD/ASD特性に基づく財務データの永続化と学習システム
 */

import { BrowserEventEmitter as EventEmitter } from '@/lib/BrowserEventEmitter';

// データ型定義
interface CognitiveFinanceData {
  userId: string;
  timestamp: Date;
  financialMetrics: {
    netWorth: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    emergencyFund: number;
    investments: number;
    debt: number;
    savingsRate: number;
    debtToIncomeRatio: number;
  };
  cognitiveProfile: {
    attentionLevel: number;
    energyLevel: number;
    stressLevel: number;
    cognitiveLoad: number;
    impulsivityScore: number;
    executiveFunction: number;
  };
  behavioralPatterns: {
    spendingTriggers: string[];
    preferredCategories: string[];
    timePatterns: Record<string, number>;
    emotionalSpending: boolean;
    impulsePurchases: number;
    budgetAdherence: number;
  };
  automationHistory: {
    rulesExecuted: number;
    successfulInterventions: number;
    userOverrides: number;
    stressPrevention: number;
  };
}

interface LearningPattern {
  pattern: string;
  frequency: number;
  success_rate: number;
  cognitive_context: {
    typical_energy: number;
    typical_stress: number;
    typical_attention: number;
  };
  recommendations: string[];
  last_updated: Date;
}

interface PersonalizedInsight {
  id: string;
  type: 'spending_pattern' | 'saving_opportunity' | 'stress_trigger' | 'automation_suggestion';
  title: string;
  description: string;
  confidence: number; // 0-1
  impact_score: number; // 1-10
  cognitive_adaptation: {
    energy_required: number;
    attention_required: number;
    stress_tolerance: number;
  };
  data_source: string[];
  generated_at: Date;
  valid_until: Date;
}

export class CognitiveFinanceDataService extends EventEmitter {
  private localStorageKey = 'cognitive_finance_data';
  private userData: Map<string, CognitiveFinanceData[]> = new Map();
  private learningPatterns: Map<string, LearningPattern[]> = new Map();
  private personalizedInsights: Map<string, PersonalizedInsight[]> = new Map();
  private isInitialized = false;

  constructor() {
    super();
    this.initializeDataService();
  }

  /**
   * データサービスの初期化
   */
  private async initializeDataService(): Promise<void> {
    try {
      await this.loadFromStorage();
      this.startDataAnalysis();
      this.isInitialized = true;
      console.log('💾 認知特性財務データサービスを初期化しました');
    } catch (error) {
      console.error('データサービス初期化エラー:', error);
    }
  }

  /**
   * ローカルストレージからデータ読み込み
   */
  private async loadFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      if (stored) {
        const data = JSON.parse(stored);

        // データの復元
        if (data.userData) {
          this.userData = new Map(
            data.userData.map(([key, value]: [string, any[]]) => [
              key,
              value.map((item) => ({
                ...item,
                timestamp: new Date(item.timestamp),
              })),
            ])
          );
        }

        if (data.learningPatterns) {
          this.learningPatterns = new Map(
            data.learningPatterns.map(([key, value]: [string, any[]]) => [
              key,
              value.map((pattern) => ({
                ...pattern,
                last_updated: new Date(pattern.last_updated),
              })),
            ])
          );
        }

        if (data.personalizedInsights) {
          this.personalizedInsights = new Map(
            data.personalizedInsights.map(([key, value]: [string, any[]]) => [
              key,
              value.map((insight) => ({
                ...insight,
                generated_at: new Date(insight.generated_at),
                valid_until: new Date(insight.valid_until),
              })),
            ])
          );
        }

        console.log('✅ ローカルストレージからデータを読み込みました');
      }
    } catch (error) {
      console.error('ストレージ読み込みエラー:', error);
    }
  }

  /**
   * ローカルストレージにデータ保存
   */
  private async saveToStorage(): Promise<void> {
    try {
      const data = {
        userData: Array.from(this.userData.entries()),
        learningPatterns: Array.from(this.learningPatterns.entries()),
        personalizedInsights: Array.from(this.personalizedInsights.entries()),
        lastSaved: new Date().toISOString(),
      };

      localStorage.setItem(this.localStorageKey, JSON.stringify(data));
      console.log('💾 データをローカルストレージに保存しました');
    } catch (error) {
      console.error('ストレージ保存エラー:', error);
      this.emit('saveError', error);
    }
  }

  /**
   * 財務データの記録
   */
  public async recordFinanceData(
    userId: string,
    data: Omit<CognitiveFinanceData, 'userId' | 'timestamp'>
  ): Promise<void> {
    const financeData: CognitiveFinanceData = {
      userId,
      timestamp: new Date(),
      ...data,
    };

    // ユーザーデータの追加
    const userHistory = this.userData.get(userId) || [];
    userHistory.push(financeData);

    // 最新100件のみ保持
    if (userHistory.length > 100) {
      userHistory.splice(0, userHistory.length - 100);
    }

    this.userData.set(userId, userHistory);

    // 学習パターンの更新
    await this.updateLearningPatterns(userId, financeData);

    // パーソナライズドインサイトの生成
    await this.generatePersonalizedInsights(userId);

    // ストレージに保存
    await this.saveToStorage();

    this.emit('dataRecorded', { userId, data: financeData });
  }

  /**
   * 学習パターンの更新
   */
  private async updateLearningPatterns(userId: string, data: CognitiveFinanceData): Promise<void> {
    const patterns = this.learningPatterns.get(userId) || [];

    // 支出パターンの学習
    if (data.behavioralPatterns.emotionalSpending) {
      this.updatePattern(patterns, 'emotional_spending', {
        frequency: 1,
        cognitive_context: data.cognitiveProfile,
        success_rate: data.behavioralPatterns.budgetAdherence / 100,
      });
    }

    // 時間パターンの学習
    Object.entries(data.behavioralPatterns.timePatterns).forEach(([time, amount]) => {
      if (amount > 0) {
        this.updatePattern(patterns, `spending_time_${time}`, {
          frequency: amount,
          cognitive_context: data.cognitiveProfile,
          success_rate: 0.5, // 中性値
        });
      }
    });

    // 認知状態とパフォーマンスの関連学習
    const cognitiveScore =
      (data.cognitiveProfile.attentionLevel +
        data.cognitiveProfile.energyLevel +
        (100 - data.cognitiveProfile.stressLevel)) /
      3;

    this.updatePattern(patterns, 'cognitive_performance', {
      frequency: 1,
      cognitive_context: data.cognitiveProfile,
      success_rate: cognitiveScore / 100,
    });

    this.learningPatterns.set(userId, patterns);
  }

  /**
   * 学習パターンの更新ヘルパー
   */
  private updatePattern(patterns: LearningPattern[], patternName: string, newData: any): void {
    const existingPattern = patterns.find((p) => p.pattern === patternName);

    if (existingPattern) {
      // 既存パターンの更新（移動平均）
      existingPattern.frequency = existingPattern.frequency * 0.8 + newData.frequency * 0.2;
      existingPattern.success_rate =
        existingPattern.success_rate * 0.8 + newData.success_rate * 0.2;
      existingPattern.cognitive_context = {
        typical_energy:
          existingPattern.cognitive_context.typical_energy * 0.8 +
          newData.cognitive_context.energyLevel * 0.2,
        typical_stress:
          existingPattern.cognitive_context.typical_stress * 0.8 +
          newData.cognitive_context.stressLevel * 0.2,
        typical_attention:
          existingPattern.cognitive_context.typical_attention * 0.8 +
          newData.cognitive_context.attentionLevel * 0.2,
      };
      existingPattern.last_updated = new Date();
    } else {
      // 新しいパターンの作成
      patterns.push({
        pattern: patternName,
        frequency: newData.frequency,
        success_rate: newData.success_rate,
        cognitive_context: {
          typical_energy: newData.cognitive_context.energyLevel,
          typical_stress: newData.cognitive_context.stressLevel,
          typical_attention: newData.cognitive_context.attentionLevel,
        },
        recommendations: [],
        last_updated: new Date(),
      });
    }
  }

  /**
   * パーソナライズドインサイトの生成
   */
  private async generatePersonalizedInsights(userId: string): Promise<void> {
    const userHistory = this.userData.get(userId) || [];
    const patterns = this.learningPatterns.get(userId) || [];

    if (userHistory.length < 5) return; // 最低5回のデータが必要

    const insights: PersonalizedInsight[] = [];
    const recent = userHistory.slice(-10); // 最新10件

    // 支出パターンインサイト
    const spendingInsight = this.generateSpendingPatternInsight(recent, patterns);
    if (spendingInsight) insights.push(spendingInsight);

    // 貯蓄機会インサイト
    const savingInsight = this.generateSavingOpportunityInsight(recent, patterns);
    if (savingInsight) insights.push(savingInsight);

    // ストレストリガーインサイト
    const stressInsight = this.generateStressTriggerInsight(recent, patterns);
    if (stressInsight) insights.push(stressInsight);

    // 自動化提案インサイト
    const automationInsight = this.generateAutomationSuggestionInsight(recent, patterns);
    if (automationInsight) insights.push(automationInsight);

    // 古いインサイトをクリア（1週間以上前）
    const validInsights = insights.filter((insight) => insight.valid_until > new Date());

    this.personalizedInsights.set(userId, validInsights);
    this.emit('insightsGenerated', { userId, insights: validInsights });
  }

  /**
   * 支出パターンインサイト生成
   */
  private generateSpendingPatternInsight(
    recent: CognitiveFinanceData[],
    patterns: LearningPattern[]
  ): PersonalizedInsight | null {
    const emotionalSpendingPattern = patterns.find((p) => p.pattern === 'emotional_spending');

    if (emotionalSpendingPattern && emotionalSpendingPattern.frequency > 0.3) {
      return {
        id: `spending_pattern_${Date.now()}`,
        type: 'spending_pattern',
        title: 'ストレス支出パターンを検出',
        description: `ストレスレベルが${Math.round(emotionalSpendingPattern.cognitive_context.typical_stress)}を超えると支出が増える傾向があります。`,
        confidence: Math.min(emotionalSpendingPattern.frequency, 0.9),
        impact_score: 8,
        cognitive_adaptation: {
          energy_required: 30,
          attention_required: 40,
          stress_tolerance: 70,
        },
        data_source: ['spending_history', 'cognitive_patterns'],
        generated_at: new Date(),
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1週間有効
      };
    }

    return null;
  }

  /**
   * 貯蓄機会インサイト生成
   */
  private generateSavingOpportunityInsight(
    recent: CognitiveFinanceData[],
    patterns: LearningPattern[]
  ): PersonalizedInsight | null {
    const avgSavingsRate =
      recent.reduce((sum, data) => sum + data.financialMetrics.savingsRate, 0) / recent.length;

    if (avgSavingsRate < 15) {
      return {
        id: `saving_opportunity_${Date.now()}`,
        type: 'saving_opportunity',
        title: '貯蓄率向上の機会',
        description: `現在の貯蓄率${Math.round(avgSavingsRate)}%を20%まで向上させることで、年間約${Math.round(((20 - avgSavingsRate) * recent[recent.length - 1].financialMetrics.monthlyIncome * 12) / 100)}円の追加貯蓄が可能です。`,
        confidence: 0.8,
        impact_score: 9,
        cognitive_adaptation: {
          energy_required: 50,
          attention_required: 60,
          stress_tolerance: 60,
        },
        data_source: ['financial_metrics', 'income_analysis'],
        generated_at: new Date(),
        valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2週間有効
      };
    }

    return null;
  }

  /**
   * ストレストリガーインサイト生成
   */
  private generateStressTriggerInsight(
    recent: CognitiveFinanceData[],
    patterns: LearningPattern[]
  ): PersonalizedInsight | null {
    const highStressData = recent.filter((data) => data.cognitiveProfile.stressLevel > 70);

    if (highStressData.length > recent.length * 0.4) {
      const avgStressExpenses =
        highStressData.reduce((sum, data) => sum + data.financialMetrics.monthlyExpenses, 0) /
        highStressData.length;
      const normalExpenses =
        recent
          .filter((data) => data.cognitiveProfile.stressLevel <= 70)
          .reduce((sum, data) => sum + data.financialMetrics.monthlyExpenses, 0) /
        (recent.length - highStressData.length);

      if (avgStressExpenses > normalExpenses * 1.2) {
        return {
          id: `stress_trigger_${Date.now()}`,
          type: 'stress_trigger',
          title: 'ストレス時の支出増加パターン',
          description: `ストレスが高い時期の支出が平常時より${Math.round(((avgStressExpenses - normalExpenses) / normalExpenses) * 100)}%増加しています。`,
          confidence: 0.75,
          impact_score: 7,
          cognitive_adaptation: {
            energy_required: 20,
            attention_required: 30,
            stress_tolerance: 80,
          },
          data_source: ['cognitive_profile', 'spending_correlation'],
          generated_at: new Date(),
          valid_until: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10日間有効
        };
      }
    }

    return null;
  }

  /**
   * 自動化提案インサイト生成
   */
  private generateAutomationSuggestionInsight(
    recent: CognitiveFinanceData[],
    patterns: LearningPattern[]
  ): PersonalizedInsight | null {
    const avgAutomationSuccess =
      recent.reduce(
        (sum, data) =>
          sum +
          data.automationHistory.successfulInterventions /
            Math.max(data.automationHistory.rulesExecuted, 1),
        0
      ) / recent.length;

    if (avgAutomationSuccess > 0.7) {
      return {
        id: `automation_suggestion_${Date.now()}`,
        type: 'automation_suggestion',
        title: '自動化レベル向上の提案',
        description: `現在の自動化成功率${Math.round(avgAutomationSuccess * 100)}%です。より多くの財務タスクを自動化することで、認知負荷を軽減できます。`,
        confidence: avgAutomationSuccess,
        impact_score: 6,
        cognitive_adaptation: {
          energy_required: 40,
          attention_required: 50,
          stress_tolerance: 50,
        },
        data_source: ['automation_history', 'success_patterns'],
        generated_at: new Date(),
        valid_until: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3週間有効
      };
    }

    return null;
  }

  /**
   * データ分析の開始
   */
  private startDataAnalysis(): void {
    // 1時間ごとにインサイト更新
    setInterval(
      () => {
        this.userData.forEach((_, userId) => {
          this.generatePersonalizedInsights(userId);
        });
      },
      60 * 60 * 1000
    );

    // 24時間ごとにデータ保存
    setInterval(
      () => {
        this.saveToStorage();
      },
      24 * 60 * 60 * 1000
    );
  }

  /**
   * ユーザーの財務データ履歴取得
   */
  public getFinanceHistory(userId: string, days: number = 30): CognitiveFinanceData[] {
    const userHistory = this.userData.get(userId) || [];
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return userHistory.filter((data) => data.timestamp >= cutoff);
  }

  /**
   * 学習パターンの取得
   */
  public getLearningPatterns(userId: string): LearningPattern[] {
    return this.learningPatterns.get(userId) || [];
  }

  /**
   * パーソナライズドインサイトの取得
   */
  public getPersonalizedInsights(userId: string): PersonalizedInsight[] {
    return this.personalizedInsights.get(userId) || [];
  }

  /**
   * データの統計情報取得
   */
  public getDataStatistics(userId: string): any {
    const history = this.userData.get(userId) || [];
    const patterns = this.learningPatterns.get(userId) || [];
    const insights = this.personalizedInsights.get(userId) || [];

    if (history.length === 0) {
      return null;
    }

    const recent = history.slice(-30); // 最新30件

    return {
      dataPoints: history.length,
      firstRecord: history[0]?.timestamp,
      lastRecord: history[history.length - 1]?.timestamp,
      learningPatterns: patterns.length,
      activeInsights: insights.filter((i) => i.valid_until > new Date()).length,
      averageMetrics: {
        savingsRate:
          recent.reduce((sum, d) => sum + d.financialMetrics.savingsRate, 0) / recent.length,
        stressLevel:
          recent.reduce((sum, d) => sum + d.cognitiveProfile.stressLevel, 0) / recent.length,
        automationSuccess:
          recent.reduce(
            (sum, d) =>
              sum +
              d.automationHistory.successfulInterventions /
                Math.max(d.automationHistory.rulesExecuted, 1),
            0
          ) / recent.length,
      },
    };
  }

  /**
   * データエクスポート
   */
  public exportData(userId: string): string {
    const userData = this.userData.get(userId) || [];
    const patterns = this.learningPatterns.get(userId) || [];
    const insights = this.personalizedInsights.get(userId) || [];

    return JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        userId,
        financialHistory: userData,
        learningPatterns: patterns,
        personalizedInsights: insights,
        statistics: this.getDataStatistics(userId),
      },
      null,
      2
    );
  }

  /**
   * データクリア
   */
  public clearUserData(userId: string): void {
    this.userData.delete(userId);
    this.learningPatterns.delete(userId);
    this.personalizedInsights.delete(userId);
    this.saveToStorage();
    this.emit('dataCleared', { userId });
  }
}

export default CognitiveFinanceDataService;
