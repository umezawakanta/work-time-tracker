/**
 * 🤖 認知特性財務自動化サービス
 * ADHD/ASD特性に基づく財務管理の自動化と最適化
 */

import { EventEmitter } from 'events';

// 自動化ルール型定義
interface AutomationRule {
  id: string;
  name: string;
  type: 'saving' | 'budgeting' | 'investment' | 'bill_payment' | 'notification';
  trigger: {
    type: 'schedule' | 'amount_threshold' | 'cognitive_state' | 'date' | 'balance';
    condition: any;
  };
  action: {
    type: 'transfer' | 'alert' | 'categorize' | 'block' | 'recommend';
    parameters: any;
  };
  cognitiveAdaptation: {
    enabled: boolean;
    energyThreshold: number; // 実行に必要な最低エネルギーレベル
    stressLimit: number; // ストレスレベル上限
    attentionRequired: number; // 必要な注意力レベル
    executionComplexity: 'low' | 'medium' | 'high';
  };
  isActive: boolean;
  lastExecuted?: Date;
  successRate: number;
  userFeedback: 'positive' | 'neutral' | 'negative' | null;
}

interface FinancialTransaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  type: 'income' | 'expense';
  isAutomated: boolean;
  cognitiveState?: {
    energy: number;
    attention: number;
    stress: number;
  };
  adhdTags: string[];
  impulsivityScore?: number; // 衝動性スコア (1-10)
}

interface BudgetAlert {
  id: string;
  category: string;
  threshold: number;
  currentAmount: number;
  severity: 'info' | 'warning' | 'critical';
  cognitiveAdaptation: {
    simplified: boolean;
    urgencyLevel: number;
    displayDuration: number;
    reminderFrequency: number;
  };
  timestamp: Date;
}

interface CognitiveFinanceProfile {
  userId: string;
  adhdCharacteristics: {
    impulsivityLevel: number; // 1-10
    executiveFunctionLevel: number; // 1-10
    attentionStability: number; // 1-10
    timePerceptionAccuracy: number; // 1-10
  };
  automationPreferences: {
    maxAutomationLevel: 'low' | 'medium' | 'high';
    requireConfirmation: boolean;
    emergencyOverride: boolean;
    learningMode: boolean;
  };
  triggerPatterns: {
    stressSpending: boolean;
    impulsePurchases: boolean;
    forgottenPayments: boolean;
    budgetOverruns: boolean;
  };
  successMetrics: {
    automationSuccessRate: number;
    stressReduction: number;
    timesSaved: number;
    financialStability: number;
  };
}

export class CognitiveFinanceAutomationService extends EventEmitter {
  private automationRules: Map<string, AutomationRule> = new Map();
  private userProfiles: Map<string, CognitiveFinanceProfile> = new Map();
  private transactions: FinancialTransaction[] = [];
  private alerts: BudgetAlert[] = [];
  private isRunning: boolean = false;

  constructor() {
    super();
    this.initializeDefaultRules();
    this.startAutomationEngine();
  }

  /**
   * デフォルトの自動化ルールを初期化
   */
  private initializeDefaultRules(): void {
    const defaultRules: AutomationRule[] = [
      {
        id: 'emergency-fund-auto-save',
        name: '緊急資金自動積立',
        type: 'saving',
        trigger: {
          type: 'schedule',
          condition: { frequency: 'monthly', day: 25 },
        },
        action: {
          type: 'transfer',
          parameters: {
            from: 'checking',
            to: 'emergency_fund',
            percentage: 5,
            description: '緊急資金への自動積立',
          },
        },
        cognitiveAdaptation: {
          enabled: true,
          energyThreshold: 30, // 低エネルギーでも実行
          stressLimit: 80,
          attentionRequired: 20, // 最小限の注意力
          executionComplexity: 'low',
        },
        isActive: true,
        successRate: 0.95,
        userFeedback: null,
      },
      {
        id: 'impulse-purchase-blocker',
        name: '衝動購入ブロッカー',
        type: 'budgeting',
        trigger: {
          type: 'amount_threshold',
          condition: {
            amount: 10000,
            timeWindow: 300, // 5分以内
            category: 'entertainment|shopping',
          },
        },
        action: {
          type: 'block',
          parameters: {
            delayMinutes: 30,
            requireReason: true,
            showAlternatives: true,
          },
        },
        cognitiveAdaptation: {
          enabled: true,
          energyThreshold: 50,
          stressLimit: 70,
          attentionRequired: 60,
          executionComplexity: 'medium',
        },
        isActive: true,
        successRate: 0.75,
        userFeedback: null,
      },
      {
        id: 'stress-spending-alert',
        name: 'ストレス支出アラート',
        type: 'notification',
        trigger: {
          type: 'cognitive_state',
          condition: {
            stressLevel: 80,
            consecutiveTransactions: 3,
            timeWindow: 1800, // 30分
          },
        },
        action: {
          type: 'alert',
          parameters: {
            message: 'ストレスレベルが高い状態での支出が続いています',
            suggestions: ['深呼吸', '散歩', '友人に連絡'],
            blockHighRisk: true,
          },
        },
        cognitiveAdaptation: {
          enabled: true,
          energyThreshold: 20,
          stressLimit: 90,
          attentionRequired: 40,
          executionComplexity: 'low',
        },
        isActive: true,
        successRate: 0.88,
        userFeedback: null,
      },
      {
        id: 'bill-payment-reminder',
        name: '請求書支払いリマインダー',
        type: 'bill_payment',
        trigger: {
          type: 'date',
          condition: {
            daysBefore: 3,
            recurring: true,
            adaptToAttention: true,
          },
        },
        action: {
          type: 'recommend',
          parameters: {
            priority: 'high',
            autoPayOption: true,
            energyOptimized: true,
          },
        },
        cognitiveAdaptation: {
          enabled: true,
          energyThreshold: 40,
          stressLimit: 75,
          attentionRequired: 50,
          executionComplexity: 'medium',
        },
        isActive: true,
        successRate: 0.92,
        userFeedback: null,
      },
    ];

    defaultRules.forEach((rule) => {
      this.automationRules.set(rule.id, rule);
    });
  }

  /**
   * 自動化エンジンの開始
   */
  private startAutomationEngine(): void {
    if (this.isRunning) return;

    this.isRunning = true;

    // メインループ: 5分間隔で実行
    setInterval(
      () => {
        this.processAutomationRules();
      },
      5 * 60 * 1000
    );

    // 高頻度監視: 30秒間隔（緊急性の高いルール用）
    setInterval(() => {
      this.processHighPriorityRules();
    }, 30 * 1000);

    console.log('🤖 認知特性財務自動化エンジンを開始しました');
  }

  /**
   * 自動化ルールの処理
   */
  private async processAutomationRules(): Promise<void> {
    for (const [ruleId, rule] of this.automationRules) {
      if (!rule.isActive) continue;

      try {
        const shouldExecute = await this.evaluateRule(rule);
        if (shouldExecute) {
          await this.executeRule(rule);
        }
      } catch (error) {
        console.error(`自動化ルール実行エラー (${ruleId}):`, error);
        this.emit('automationError', { ruleId, error });
      }
    }
  }

  /**
   * 高優先度ルールの処理
   */
  private async processHighPriorityRules(): Promise<void> {
    const highPriorityTypes = ['notification', 'budgeting'];

    for (const [ruleId, rule] of this.automationRules) {
      if (!rule.isActive || !highPriorityTypes.includes(rule.type)) continue;

      try {
        const shouldExecute = await this.evaluateRule(rule);
        if (shouldExecute) {
          await this.executeRule(rule);
        }
      } catch (error) {
        console.error(`高優先度ルール実行エラー (${ruleId}):`, error);
      }
    }
  }

  /**
   * ルールの評価
   */
  private async evaluateRule(rule: AutomationRule): Promise<boolean> {
    // 認知適応チェック
    if (rule.cognitiveAdaptation.enabled) {
      const cognitiveState = await this.getCurrentCognitiveState();

      if (cognitiveState.energy < rule.cognitiveAdaptation.energyThreshold) {
        console.log(`ルール ${rule.id}: エネルギー不足のため延期`);
        return false;
      }

      if (cognitiveState.stress > rule.cognitiveAdaptation.stressLimit) {
        console.log(`ルール ${rule.id}: ストレスレベル高のため延期`);
        return false;
      }

      if (cognitiveState.attention < rule.cognitiveAdaptation.attentionRequired) {
        console.log(`ルール ${rule.id}: 注意力不足のため延期`);
        return false;
      }
    }

    // トリガー条件の評価
    switch (rule.trigger.type) {
      case 'schedule':
        return this.evaluateScheduleTrigger(rule.trigger.condition);
      case 'amount_threshold':
        return this.evaluateAmountTrigger(rule.trigger.condition);
      case 'cognitive_state':
        return this.evaluateCognitiveTrigger(rule.trigger.condition);
      case 'date':
        return this.evaluateDateTrigger(rule.trigger.condition);
      case 'balance':
        return this.evaluateBalanceTrigger(rule.trigger.condition);
      default:
        return false;
    }
  }

  /**
   * スケジュールトリガーの評価
   */
  private evaluateScheduleTrigger(condition: any): boolean {
    const now = new Date();
    const { frequency, day } = condition;

    switch (frequency) {
      case 'daily':
        return true; // 毎日実行
      case 'weekly':
        return now.getDay() === (day || 1); // デフォルトは月曜日
      case 'monthly':
        return now.getDate() === (day || 1); // デフォルトは月初
      default:
        return false;
    }
  }

  /**
   * 金額トリガーの評価
   */
  private evaluateAmountTrigger(condition: any): boolean {
    const { amount, timeWindow, category } = condition;
    const cutoff = new Date(Date.now() - timeWindow * 1000);

    const recentTransactions = this.transactions.filter(
      (tx) =>
        tx.date >= cutoff &&
        tx.amount >= amount &&
        (!category || new RegExp(category).test(tx.category))
    );

    return recentTransactions.length > 0;
  }

  /**
   * 認知状態トリガーの評価
   */
  private async evaluateCognitiveTrigger(condition: any): Promise<boolean> {
    const cognitiveState = await this.getCurrentCognitiveState();
    const { stressLevel, consecutiveTransactions, timeWindow } = condition;

    if (cognitiveState.stress < stressLevel) return false;

    const cutoff = new Date(Date.now() - timeWindow * 1000);
    const recentTxCount = this.transactions.filter((tx) => tx.date >= cutoff).length;

    return recentTxCount >= consecutiveTransactions;
  }

  /**
   * 日付トリガーの評価
   */
  private evaluateDateTrigger(condition: any): boolean {
    const { daysBefore, recurring } = condition;
    // 簡略化された実装
    return recurring && new Date().getDate() % 7 === daysBefore;
  }

  /**
   * 残高トリガーの評価
   */
  private evaluateBalanceTrigger(condition: any): boolean {
    // 実装予定：口座残高チェック
    return false;
  }

  /**
   * ルールの実行
   */
  private async executeRule(rule: AutomationRule): Promise<void> {
    console.log(`🔄 自動化ルール実行: ${rule.name}`);

    switch (rule.action.type) {
      case 'transfer':
        await this.executeTransfer(rule.action.parameters, rule);
        break;
      case 'alert':
        await this.executeAlert(rule.action.parameters, rule);
        break;
      case 'block':
        await this.executeBlock(rule.action.parameters, rule);
        break;
      case 'recommend':
        await this.executeRecommendation(rule.action.parameters, rule);
        break;
      case 'categorize':
        await this.executeCategorization(rule.action.parameters, rule);
        break;
    }

    // 実行記録の更新
    rule.lastExecuted = new Date();
    this.emit('ruleExecuted', { rule, success: true });
  }

  /**
   * 振込実行
   */
  private async executeTransfer(parameters: any, rule: AutomationRule): Promise<void> {
    const { from, to, amount, percentage, description } = parameters;

    // 実際の実装では銀行APIを呼び出し
    console.log(`💸 自動振込: ${from} → ${to}, 金額: ${amount || percentage + '%'}`);

    this.emit('automatedTransfer', {
      from,
      to,
      amount: amount || 0,
      percentage: percentage || 0,
      description,
      ruleId: rule.id,
    });
  }

  /**
   * アラート実行
   */
  private async executeAlert(parameters: any, rule: AutomationRule): Promise<void> {
    const { message, suggestions, blockHighRisk } = parameters;

    const alert: BudgetAlert = {
      id: `alert-${Date.now()}`,
      category: 'cognitive_automation',
      threshold: 0,
      currentAmount: 0,
      severity: 'warning',
      cognitiveAdaptation: {
        simplified: true,
        urgencyLevel: 7,
        displayDuration: 10000, // 10秒
        reminderFrequency: 300000, // 5分
      },
      timestamp: new Date(),
    };

    this.alerts.push(alert);

    this.emit('cognitiveAlert', {
      message,
      suggestions,
      blockHighRisk,
      alert,
      ruleId: rule.id,
    });
  }

  /**
   * ブロック実行
   */
  private async executeBlock(parameters: any, rule: AutomationRule): Promise<void> {
    const { delayMinutes, requireReason, showAlternatives } = parameters;

    this.emit('transactionBlocked', {
      delayMinutes,
      requireReason,
      showAlternatives,
      ruleId: rule.id,
      message: `${delayMinutes}分後に再試行できます`,
    });
  }

  /**
   * 推奨実行
   */
  private async executeRecommendation(parameters: any, rule: AutomationRule): Promise<void> {
    const { priority, autoPayOption, energyOptimized } = parameters;

    this.emit('automationRecommendation', {
      priority,
      autoPayOption,
      energyOptimized,
      ruleId: rule.id,
      message: rule.name + 'の推奨事項があります',
    });
  }

  /**
   * カテゴリ分類実行
   */
  private async executeCategorization(parameters: any, rule: AutomationRule): Promise<void> {
    // 実装予定：AIによる自動カテゴリ分類
    this.emit('transactionCategorized', { parameters, ruleId: rule.id });
  }

  /**
   * 現在の認知状態を取得
   */
  private async getCurrentCognitiveState(): Promise<{
    energy: number;
    stress: number;
    attention: number;
  }> {
    // 実際の実装では外部サービスから取得
    return {
      energy: Math.random() * 100,
      stress: Math.random() * 100,
      attention: Math.random() * 100,
    };
  }

  /**
   * 取引記録の追加
   */
  public addTransaction(transaction: FinancialTransaction): void {
    this.transactions.push(transaction);

    // 新しい取引に対して即座にルール評価
    this.processTransactionRules(transaction);

    // 古い取引データのクリーンアップ（30日以上前）
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.transactions = this.transactions.filter((tx) => tx.date >= cutoff);
  }

  /**
   * 取引固有のルール処理
   */
  private async processTransactionRules(transaction: FinancialTransaction): Promise<void> {
    for (const [ruleId, rule] of this.automationRules) {
      if (rule.type === 'budgeting' || rule.type === 'notification') {
        try {
          const shouldExecute = await this.evaluateRule(rule);
          if (shouldExecute) {
            await this.executeRule(rule);
          }
        } catch (error) {
          console.error(`取引ルール実行エラー (${ruleId}):`, error);
        }
      }
    }
  }

  /**
   * ユーザープロファイルの設定
   */
  public setUserProfile(userId: string, profile: CognitiveFinanceProfile): void {
    this.userProfiles.set(userId, profile);
    this.adaptRulesForUser(userId, profile);
  }

  /**
   * ユーザー特性に基づくルール適応
   */
  private adaptRulesForUser(userId: string, profile: CognitiveFinanceProfile): void {
    for (const [ruleId, rule] of this.automationRules) {
      // 衝動性レベルに基づく調整
      if (profile.adhdCharacteristics.impulsivityLevel > 7) {
        if (rule.id === 'impulse-purchase-blocker') {
          rule.cognitiveAdaptation.attentionRequired = 40; // より低い閾値
          rule.action.parameters.delayMinutes = 60; // より長い遅延
        }
      }

      // 実行機能レベルに基づく調整
      if (profile.adhdCharacteristics.executiveFunctionLevel < 5) {
        rule.cognitiveAdaptation.executionComplexity = 'low';
        rule.cognitiveAdaptation.energyThreshold = Math.max(
          20,
          rule.cognitiveAdaptation.energyThreshold - 20
        );
      }

      // 自動化レベル設定に基づく調整
      if (profile.automationPreferences.maxAutomationLevel === 'low') {
        if (rule.type === 'saving' || rule.type === 'bill_payment') {
          rule.isActive = false;
        }
      }
    }

    console.log(`✅ ユーザー ${userId} の認知特性に基づいてルールを適応しました`);
  }

  /**
   * 自動化統計の取得
   */
  public getAutomationStats(): any {
    const activeRules = Array.from(this.automationRules.values()).filter((r) => r.isActive);
    const totalExecutions = activeRules.filter((r) => r.lastExecuted).length;
    const avgSuccessRate =
      activeRules.reduce((sum, r) => sum + r.successRate, 0) / activeRules.length;

    return {
      totalRules: this.automationRules.size,
      activeRules: activeRules.length,
      totalExecutions,
      averageSuccessRate: avgSuccessRate,
      recentTransactions: this.transactions.length,
      activeAlerts: this.alerts.length,
    };
  }

  /**
   * ルールの追加/更新
   */
  public updateRule(rule: AutomationRule): void {
    this.automationRules.set(rule.id, rule);
    this.emit('ruleUpdated', rule);
  }

  /**
   * ルールの削除
   */
  public deleteRule(ruleId: string): void {
    this.automationRules.delete(ruleId);
    this.emit('ruleDeleted', ruleId);
  }

  /**
   * サービス停止
   */
  public stop(): void {
    this.isRunning = false;
    console.log('⏹️ 認知特性財務自動化エンジンを停止しました');
  }
}

export default CognitiveFinanceAutomationService;
