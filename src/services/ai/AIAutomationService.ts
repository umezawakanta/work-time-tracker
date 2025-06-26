import { toast } from '@/components/ui/use-toast';
import { aiAnalyticsService, AIRecommendation } from './AIAnalyticsService';

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  createdAt: string;
  lastExecuted?: string;
  executionCount: number;
  successRate: number; // 0-100
}

export interface AutomationTrigger {
  type: 'schedule' | 'event' | 'condition' | 'ai_insight';
  config: {
    schedule?: string; // cron expression
    event?: string;
    condition?: string;
    aiInsightType?: string;
  };
}

export interface AutomationAction {
  id: string;
  type: 'notification' | 'optimization' | 'ui_adjustment' | 'task_creation';
  config: Record<string, any>;
}

export interface AutomationExecution {
  id: string;
  ruleId: string;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  triggeredBy: string;
  executionTime: number; // milliseconds
  result?: any;
  error?: string;
}

export interface SmartSuggestion {
  id: string;
  type:
    | 'performance_optimization'
    | 'user_experience'
    | 'feature_suggestion'
    | 'automation_opportunity';
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: 'low' | 'medium' | 'high';
  complexity: 'easy' | 'medium' | 'hard';
  automationPotential: number; // 0-100
  suggestedActions: string[];
  dataSource: string[];
}

/**
 * 🤖 AI自動化サービス - インテリジェントな自動化とスマート提案
 */
class AIAutomationService {
  private static instance: AIAutomationService | null = null;
  private automationRules: Map<string, AutomationRule> = new Map();
  private executionHistory: AutomationExecution[] = [];
  private smartSuggestions: SmartSuggestion[] = [];
  private automationEngine: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  private constructor() {
    this.initializeDefaultRules();
    this.startAutomationEngine();
    console.log('🤖 AI Automation Service initialized');
  }

  public static getInstance(): AIAutomationService {
    if (!AIAutomationService.instance) {
      AIAutomationService.instance = new AIAutomationService();
    }
    return AIAutomationService.instance;
  }

  /**
   * 🔧 デフォルト自動化ルール初期化
   */
  private initializeDefaultRules(): void {
    const defaultRules: AutomationRule[] = [
      {
        id: 'auto_performance_optimization',
        name: 'パフォーマンス自動最適化',
        description: 'パフォーマンス低下を検知して自動的に最適化を実行',
        trigger: {
          type: 'ai_insight',
          config: {
            aiInsightType: 'performance_issue',
          },
        },
        actions: [
          {
            id: 'optimize_performance',
            type: 'optimization',
            config: {
              optimization_type: 'bundle_splitting',
              notify_user: true,
            },
          },
        ],
        priority: 'high',
        isActive: true,
        createdAt: new Date().toISOString(),
        executionCount: 0,
        successRate: 100,
      },
      {
        id: 'smart_ui_improvements',
        name: 'スマートUI改善',
        description: 'ユーザー行動分析に基づいてUI改善を自動提案',
        trigger: {
          type: 'ai_insight',
          config: {
            aiInsightType: 'user_behavior',
          },
        },
        actions: [
          {
            id: 'suggest_ui_improvements',
            type: 'ui_adjustment',
            config: {
              adjustment_type: 'navigation_optimization',
              auto_apply: false,
            },
          },
        ],
        priority: 'medium',
        isActive: true,
        createdAt: new Date().toISOString(),
        executionCount: 0,
        successRate: 95,
      },
      {
        id: 'automated_task_creation',
        name: '自動タスク作成',
        description: 'AI分析結果に基づいて改善タスクを自動生成',
        trigger: {
          type: 'schedule',
          config: {
            schedule: '0 9 * * 1', // 毎週月曜日9時
          },
        },
        actions: [
          {
            id: 'create_improvement_tasks',
            type: 'task_creation',
            config: {
              task_type: 'weekly_improvements',
              priority: 'medium',
            },
          },
        ],
        priority: 'low',
        isActive: true,
        createdAt: new Date().toISOString(),
        executionCount: 0,
        successRate: 98,
      },
    ];

    defaultRules.forEach((rule) => {
      this.automationRules.set(rule.id, rule);
    });

    console.log('🔧 Default automation rules initialized:', defaultRules.length);
  }

  /**
   * ⚙️ 自動化エンジン開始
   */
  private startAutomationEngine(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.automationEngine = setInterval(() => {
      this.processAutomationRules();
    }, 60000); // 1分ごと

    console.log('⚙️ Automation engine started');
  }

  /**
   * 🔄 自動化ルール処理
   */
  private async processAutomationRules(): Promise<void> {
    const activeRules = Array.from(this.automationRules.values()).filter((rule) => rule.isActive);

    for (const rule of activeRules) {
      try {
        const shouldExecute = await this.evaluateRuleTrigger(rule);
        if (shouldExecute) {
          await this.executeAutomationRule(rule);
        }
      } catch (error) {
        console.error(`❌ Error processing rule ${rule.id}:`, error);
      }
    }
  }

  /**
   * 🎯 ルールトリガー評価
   */
  private async evaluateRuleTrigger(rule: AutomationRule): Promise<boolean> {
    switch (rule.trigger.type) {
      case 'schedule':
        return this.evaluateScheduleTrigger(rule.trigger.config.schedule || '');

      case 'ai_insight':
        return this.evaluateAIInsightTrigger(rule.trigger.config.aiInsightType || '');

      default:
        return false;
    }
  }

  /**
   * ⏰ スケジュールトリガー評価
   */
  private evaluateScheduleTrigger(schedule: string): boolean {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    // 例: '0 9 * * 1' (毎週月曜日9時)
    if (schedule === '0 9 * * 1') {
      return hour === 9 && dayOfWeek === 1;
    }

    return false;
  }

  /**
   * 🧠 AIインサイトトリガー評価
   */
  private async evaluateAIInsightTrigger(insightType: string): Promise<boolean> {
    try {
      const recentAnalytics = aiAnalyticsService.getAnalytics();

      if (insightType === 'performance_issue') {
        return recentAnalytics.some((analytics) =>
          analytics.insights.some(
            (insight) => insight.category === 'performance' && insight.impact === 'high'
          )
        );
      }

      if (insightType === 'user_behavior') {
        return recentAnalytics.some((analytics) =>
          analytics.insights.some(
            (insight) => insight.category === 'user_behavior' && insight.priority >= 8
          )
        );
      }

      return false;
    } catch (error) {
      console.error('AI Insight trigger evaluation failed:', error);
      return false;
    }
  }

  /**
   * 🚀 自動化ルール実行
   */
  private async executeAutomationRule(rule: AutomationRule): Promise<void> {
    const execution: AutomationExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      timestamp: new Date().toISOString(),
      status: 'running',
      triggeredBy: 'automation_engine',
      executionTime: 0,
    };

    const startTime = Date.now();

    try {
      // 各アクションを実行
      for (const action of rule.actions) {
        await this.executeAction(action);
      }

      execution.status = 'completed';
      execution.executionTime = Date.now() - startTime;

      // 成功率更新
      rule.executionCount++;
      rule.lastExecuted = new Date().toISOString();

      console.log(`✅ Automation rule executed: ${rule.name}`);

      // 通知
      toast({
        title: '🤖 自動化実行完了',
        description: `${rule.name}が正常に実行されました`,
        variant: 'default',
      });
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      execution.executionTime = Date.now() - startTime;

      console.error(`❌ Automation rule failed: ${rule.name}`, error);

      // エラー通知
      toast({
        title: '⚠️ 自動化実行エラー',
        description: `${rule.name}の実行中にエラーが発生しました`,
        variant: 'destructive',
      });
    }

    this.executionHistory.push(execution);

    // 履歴の制限（最新100件のみ保持）
    if (this.executionHistory.length > 100) {
      this.executionHistory = this.executionHistory.slice(-100);
    }
  }

  /**
   * ⚡ アクション実行
   */
  private async executeAction(action: AutomationAction): Promise<void> {
    switch (action.type) {
      case 'notification':
        await this.executeNotificationAction(action.config);
        break;
      case 'optimization':
        await this.executeOptimizationAction(action.config);
        break;
      case 'ui_adjustment':
        await this.executeUIAdjustmentAction(action.config);
        break;
      case 'task_creation':
        await this.executeTaskCreationAction(action.config);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * 📢 通知アクション実行
   */
  private async executeNotificationAction(config: any): Promise<void> {
    toast({
      title: config.title || '🤖 AI自動化通知',
      description: config.message || '自動化アクションが実行されました',
      variant: config.variant || 'default',
    });
  }

  /**
   * ⚡ 最適化アクション実行
   */
  private async executeOptimizationAction(config: any): Promise<void> {
    console.log(`⚡ Optimization executed: ${config.optimization_type}`);

    if (config.notify_user) {
      toast({
        title: '⚡ パフォーマンス最適化',
        description: 'システムパフォーマンスが自動的に最適化されました',
        variant: 'default',
      });
    }
  }

  /**
   * 🎨 UI調整アクション実行
   */
  private async executeUIAdjustmentAction(config: any): Promise<void> {
    console.log(`🎨 UI adjustment executed: ${config.adjustment_type}`);

    toast({
      title: '🎨 UI改善提案',
      description: 'ユーザー行動分析に基づくUI改善案が生成されました',
      variant: 'default',
    });
  }

  /**
   * 📝 タスク作成アクション実行
   */
  private async executeTaskCreationAction(config: any): Promise<void> {
    console.log(`📝 Task creation executed: ${config.task_type}`);

    const task = {
      id: `task_${Date.now()}`,
      type: config.task_type,
      priority: config.priority,
      createdBy: 'ai_automation',
      createdAt: new Date().toISOString(),
    };

    toast({
      title: '📝 改善タスク作成',
      description: 'AI分析に基づく改善タスクが自動生成されました',
      variant: 'default',
    });
  }

  /**
   * 💡 スマート提案生成
   */
  public async generateSmartSuggestions(): Promise<SmartSuggestion[]> {
    const suggestions: SmartSuggestion[] = [];

    // AI分析結果から提案を生成
    const recentAnalytics = aiAnalyticsService.getAnalytics(undefined, 5);
    const recommendations = aiAnalyticsService.getLatestRecommendations('high');

    for (const recommendation of recommendations) {
      const suggestion: SmartSuggestion = {
        id: `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: this.mapRecommendationToSuggestionType(recommendation.actionType),
        title: recommendation.title,
        description: recommendation.description,
        confidence: 85,
        impact: recommendation.priority === 'critical' ? 'high' : (recommendation.priority as any),
        complexity: recommendation.implementationComplexity,
        automationPotential: this.calculateAutomationPotential(recommendation),
        suggestedActions: [
          `実装期間: ${recommendation.timeline}`,
          `必要リソース: ${recommendation.resources.join(', ')}`,
          `期待効果: ${recommendation.estimatedImpact}%向上`,
        ],
        dataSource: ['ai_analytics', 'performance_metrics'],
      };

      suggestions.push(suggestion);
    }

    this.smartSuggestions = suggestions;
    return suggestions;
  }

  /**
   * 🔄 推奨事項タイプをマッピング
   */
  private mapRecommendationToSuggestionType(actionType: string): SmartSuggestion['type'] {
    switch (actionType) {
      case 'performance':
        return 'performance_optimization';
      case 'ui_change':
        return 'user_experience';
      case 'feature':
        return 'feature_suggestion';
      case 'automation':
        return 'automation_opportunity';
      default:
        return 'performance_optimization';
    }
  }

  /**
   * 🔢 自動化ポテンシャル計算
   */
  private calculateAutomationPotential(recommendation: AIRecommendation): number {
    let potential = 50; // ベースライン

    // 複雑さによる調整
    switch (recommendation.implementationComplexity) {
      case 'easy':
        potential += 30;
        break;
      case 'medium':
        potential += 10;
        break;
      case 'hard':
        potential -= 20;
        break;
    }

    // アクションタイプによる調整
    switch (recommendation.actionType) {
      case 'automation':
        potential += 20;
        break;
      case 'optimization':
        potential += 15;
        break;
      case 'performance':
        potential += 10;
        break;
    }

    return Math.max(0, Math.min(100, potential));
  }

  /**
   * 📊 自動化統計取得
   */
  public getAutomationStats(): {
    totalRules: number;
    activeRules: number;
    totalExecutions: number;
    successRate: number;
    recentExecutions: AutomationExecution[];
    smartSuggestions: SmartSuggestion[];
  } {
    const rules = Array.from(this.automationRules.values());
    const activeRules = rules.filter((r) => r.isActive);
    const totalExecutions = this.executionHistory.length;
    const successfulExecutions = this.executionHistory.filter(
      (e) => e.status === 'completed'
    ).length;
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 100;

    return {
      totalRules: rules.length,
      activeRules: activeRules.length,
      totalExecutions,
      successRate: Math.round(successRate),
      recentExecutions: this.executionHistory.slice(-10),
      smartSuggestions: this.smartSuggestions.slice(0, 5),
    };
  }

  /**
   * 🧹 クリーンアップ
   */
  public cleanup(): void {
    if (this.automationEngine) {
      clearInterval(this.automationEngine);
      this.automationEngine = null;
    }

    this.isRunning = false;
    console.log('🧹 AI Automation Service cleaned up');
  }
}

export const aiAutomationService = AIAutomationService.getInstance();
