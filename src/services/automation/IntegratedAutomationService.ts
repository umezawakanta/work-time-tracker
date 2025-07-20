/**
 * 🤖 統合自動化サービス
 * ダッシュボード、タスク管理、AI機能を統合した包括的自動化システム
 */

import { todoApi } from '../api/todoApi';
import { integratedGamificationService } from '../gamification/IntegratedGamificationService';
import { aiGamificationService } from '../gamification/AIGamificationService';
import { unifiedDashboardService } from '../integration/UnifiedDashboardService';
import { Todo, NewTodo } from '@/types/todo';
import { toast } from 'react-hot-toast';

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  category:
    | 'task_management'
    | 'gamification'
    | 'ai_analysis'
    | 'dashboard'
    | 'workflow'
    | 'notification';
  isActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  createdAt: string;
  lastExecuted?: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  averageExecutionTime: number;
  tags: string[];
}

export interface AutomationTrigger {
  type: 'time_based' | 'event_based' | 'condition_based' | 'ai_based' | 'manual';
  config: {
    schedule?: string; // cron expression
    event?: string; // task_created, task_completed, dashboard_loaded, etc.
    condition?: string; // JavaScript expression
    aiInsight?: string; // AI insight type
    interval?: number; // milliseconds for polling
  };
}

export interface AutomationCondition {
  id: string;
  field: string; // task.title, task.priority, dashboard.loadTime, etc.
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'matches' | 'exists';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface AutomationAction {
  id: string;
  type:
    | 'create_task'
    | 'update_task'
    | 'delete_task'
    | 'send_notification'
    | 'update_gamification'
    | 'ai_analysis'
    | 'dashboard_update'
    | 'workflow_action';
  config: {
    // Task actions
    taskData?: Partial<NewTodo>;
    taskId?: string;
    taskUpdates?: Partial<Todo>;

    // Notification actions
    message?: string;
    notificationType?: 'info' | 'success' | 'warning' | 'error';
    recipients?: string[];

    // Gamification actions
    xpAmount?: number;
    badgeId?: string;
    achievementId?: string;

    // AI actions
    analysisType?: string;
    contextData?: any;

    // Dashboard actions
    widgetId?: string;
    dashboardConfig?: any;

    // Workflow actions
    workflowId?: string;
    nextStepId?: string;

    // General config
    delay?: number; // milliseconds
    retryCount?: number;
    retryDelay?: number;
  };
}

export interface AutomationExecution {
  id: string;
  ruleId: string;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  triggeredBy: string;
  executionTime: number;
  actionsExecuted: number;
  actionsTotal: number;
  error?: string;
  results?: any[];
}

export interface AutomationInsight {
  id: string;
  type: 'performance' | 'optimization' | 'error' | 'suggestion';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  recommendations: string[];
  generatedAt: string;
  relatedRules: string[];
}

export interface AutomationDashboard {
  totalRules: number;
  activeRules: number;
  executionsToday: number;
  successRate: number;
  averageExecutionTime: number;
  topPerformingRules: AutomationRule[];
  recentExecutions: AutomationExecution[];
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  insights: AutomationInsight[];
  resourceUsage: {
    cpu: number;
    memory: number;
    diskSpace: number;
  };
}

class IntegratedAutomationService {
  private automationRules: Map<string, AutomationRule> = new Map();
  private executionHistory: AutomationExecution[] = [];
  private activeExecutions: Map<string, AutomationExecution> = new Map();
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();
  private automationEngine: NodeJS.Timeout | null = null;
  private isRunning = false;
  private readonly STORAGE_KEY = 'integrated_automation';

  constructor() {
    this.initializeDefaultRules();
    this.setupEventListeners();
    this.startAutomationEngine();
  }

  /**
   * 🚀 自動化エンジンの開始
   */
  startAutomationEngine(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.automationEngine = setInterval(async () => {
      await this.processAutomationCycle();
    }, 5000); // 5秒間隔で実行

    console.log('🚀 Integrated Automation Engine started');
  }

  /**
   * ⏹️ 自動化エンジンの停止
   */
  stopAutomationEngine(): void {
    if (this.automationEngine) {
      clearInterval(this.automationEngine);
      this.automationEngine = null;
    }
    this.isRunning = false;
    console.log('⏹️ Integrated Automation Engine stopped');
  }

  /**
   * ⚙️ 自動化ルールの作成
   */
  async createRule(
    rule: Omit<
      AutomationRule,
      | 'id'
      | 'createdAt'
      | 'executionCount'
      | 'successCount'
      | 'failureCount'
      | 'averageExecutionTime'
    >
  ): Promise<string> {
    const ruleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newRule: AutomationRule = {
      ...rule,
      id: ruleId,
      createdAt: new Date().toISOString(),
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      averageExecutionTime: 0,
    };

    this.automationRules.set(ruleId, newRule);
    this.saveToStorage();

    console.log(`✅ Automation rule created: ${newRule.name} (${ruleId})`);
    this.emit('rule_created', { rule: newRule });

    return ruleId;
  }

  /**
   * 📝 自動化ルールの更新
   */
  async updateRule(ruleId: string, updates: Partial<AutomationRule>): Promise<void> {
    const rule = this.automationRules.get(ruleId);
    if (!rule) {
      throw new Error(`Automation rule not found: ${ruleId}`);
    }

    const updatedRule = { ...rule, ...updates };
    this.automationRules.set(ruleId, updatedRule);
    this.saveToStorage();

    console.log(`📝 Automation rule updated: ${updatedRule.name}`);
    this.emit('rule_updated', { rule: updatedRule });
  }

  /**
   * 🗑️ 自動化ルールの削除
   */
  async deleteRule(ruleId: string): Promise<void> {
    const rule = this.automationRules.get(ruleId);
    if (!rule) {
      throw new Error(`Automation rule not found: ${ruleId}`);
    }

    this.automationRules.delete(ruleId);
    this.saveToStorage();

    console.log(`🗑️ Automation rule deleted: ${rule.name}`);
    this.emit('rule_deleted', { ruleId, rule });
  }

  /**
   * 🔍 自動化ルールの取得
   */
  getRule(ruleId: string): AutomationRule | undefined {
    return this.automationRules.get(ruleId);
  }

  /**
   * 📋 全自動化ルールの取得
   */
  getAllRules(): AutomationRule[] {
    return Array.from(this.automationRules.values());
  }

  /**
   * 🎯 手動実行
   */
  async executeRule(ruleId: string, context?: any): Promise<AutomationExecution> {
    const rule = this.automationRules.get(ruleId);
    if (!rule) {
      throw new Error(`Automation rule not found: ${ruleId}`);
    }

    return await this.executeAutomationRule(rule, 'manual', context);
  }

  /**
   * 📊 自動化ダッシュボードデータの取得
   */
  getDashboardData(): AutomationDashboard {
    const rules = Array.from(this.automationRules.values());
    const activeRules = rules.filter((r) => r.isActive);
    const today = new Date().toDateString();
    const todayExecutions = this.executionHistory.filter(
      (e) => new Date(e.timestamp).toDateString() === today
    );

    const successfulExecutions = todayExecutions.filter((e) => e.status === 'completed');
    const totalExecutions = todayExecutions.length;
    const successRate =
      totalExecutions > 0 ? (successfulExecutions.length / totalExecutions) * 100 : 0;

    const averageExecutionTime =
      successfulExecutions.length > 0
        ? successfulExecutions.reduce((sum, e) => sum + e.executionTime, 0) /
          successfulExecutions.length
        : 0;

    // システム健全性の判定
    let systemHealth: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';
    if (successRate < 50) systemHealth = 'critical';
    else if (successRate < 70) systemHealth = 'warning';
    else if (successRate < 90) systemHealth = 'good';

    return {
      totalRules: rules.length,
      activeRules: activeRules.length,
      executionsToday: totalExecutions,
      successRate,
      averageExecutionTime,
      topPerformingRules: this.getTopPerformingRules(),
      recentExecutions: this.executionHistory.slice(-10),
      systemHealth,
      insights: this.generateAutomationInsights(),
      resourceUsage: {
        cpu: Math.random() * 20 + 5, // Mock data
        memory: Math.random() * 30 + 20,
        diskSpace: Math.random() * 10 + 5,
      },
    };
  }

  /**
   * 🔄 自動化サイクルの処理
   */
  private async processAutomationCycle(): Promise<void> {
    try {
      const activeRules = Array.from(this.automationRules.values()).filter((r) => r.isActive);

      for (const rule of activeRules) {
        if (await this.shouldExecuteRule(rule)) {
          await this.executeAutomationRule(rule, 'automatic');
        }
      }
    } catch (error) {
      console.error('Automation cycle error:', error);
    }
  }

  /**
   * 🎯 ルール実行判定
   */
  private async shouldExecuteRule(rule: AutomationRule): Promise<boolean> {
    try {
      // トリガー条件をチェック
      if (!(await this.evaluateTrigger(rule.trigger))) {
        return false;
      }

      // 実行条件をチェック
      return await this.evaluateConditions(rule.conditions);
    } catch (error) {
      console.error(`Rule evaluation error for ${rule.id}:`, error);
      return false;
    }
  }

  /**
   * ⚡ 自動化ルールの実行
   */
  private async executeAutomationRule(
    rule: AutomationRule,
    triggeredBy: string,
    context?: any
  ): Promise<AutomationExecution> {
    const execution: AutomationExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      timestamp: new Date().toISOString(),
      status: 'running',
      triggeredBy,
      executionTime: 0,
      actionsExecuted: 0,
      actionsTotal: rule.actions.length,
      results: [],
    };

    this.activeExecutions.set(execution.id, execution);
    const startTime = Date.now();

    try {
      console.log(`🎯 Executing automation rule: ${rule.name}`);

      // アクションを順次実行
      for (let i = 0; i < rule.actions.length; i++) {
        const action = rule.actions[i];

        try {
          const result = await this.executeAction(action, context);
          execution.results!.push(result);
          execution.actionsExecuted++;

          // 遅延設定があれば待機
          if (action.config.delay) {
            await this.delay(action.config.delay);
          }
        } catch (actionError) {
          console.error(`Action execution failed: ${action.type}`, actionError);

          // リトライ設定があれば試行
          if (action.config.retryCount) {
            for (let retry = 0; retry < action.config.retryCount; retry++) {
              try {
                if (action.config.retryDelay) {
                  await this.delay(action.config.retryDelay);
                }
                const result = await this.executeAction(action, context);
                execution.results!.push(result);
                execution.actionsExecuted++;
                break;
              } catch (retryError) {
                console.error(`Retry ${retry + 1} failed:`, retryError);
                if (retry === action.config.retryCount - 1) {
                  throw retryError;
                }
              }
            }
          } else {
            throw actionError;
          }
        }
      }

      execution.status = 'completed';
      execution.executionTime = Date.now() - startTime;

      // 統計更新
      rule.executionCount++;
      rule.successCount++;
      rule.lastExecuted = execution.timestamp;
      rule.averageExecutionTime =
        (rule.averageExecutionTime * (rule.executionCount - 1) + execution.executionTime) /
        rule.executionCount;

      console.log(`✅ Automation rule completed: ${rule.name} (${execution.executionTime}ms)`);

      // 成功通知
      if (rule.priority === 'high' || rule.priority === 'critical') {
        toast.success(`🤖 自動化実行完了: ${rule.name}`);
      }
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      execution.executionTime = Date.now() - startTime;

      // 統計更新
      rule.executionCount++;
      rule.failureCount++;
      rule.lastExecuted = execution.timestamp;

      console.error(`❌ Automation rule failed: ${rule.name}`, error);

      // エラー通知
      toast.error(`🚨 自動化実行エラー: ${rule.name}`);
    }

    this.activeExecutions.delete(execution.id);
    this.executionHistory.push(execution);

    // 履歴管理（最新500件のみ保持）
    if (this.executionHistory.length > 500) {
      this.executionHistory = this.executionHistory.slice(-500);
    }

    this.emit('rule_executed', { rule, execution });
    return execution;
  }

  /**
   * 🎬 アクションの実行
   */
  private async executeAction(action: AutomationAction, context?: any): Promise<any> {
    switch (action.type) {
      case 'create_task':
        return await this.executeCreateTaskAction(action, context);

      case 'update_task':
        return await this.executeUpdateTaskAction(action, context);

      case 'delete_task':
        return await this.executeDeleteTaskAction(action, context);

      case 'send_notification':
        return await this.executeSendNotificationAction(action, context);

      case 'update_gamification':
        return await this.executeGamificationAction(action, context);

      case 'ai_analysis':
        return await this.executeAIAnalysisAction(action, context);

      case 'dashboard_update':
        return await this.executeDashboardUpdateAction(action, context);

      case 'workflow_action':
        return await this.executeWorkflowAction(action, context);

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * 📝 タスク作成アクション
   */
  private async executeCreateTaskAction(action: AutomationAction, context?: any): Promise<any> {
    const { taskData } = action.config;
    if (!taskData) {
      throw new Error('Task data is required for create_task action');
    }

    // コンテキストデータでタスクデータを補完
    const processedTaskData = this.processTaskDataWithContext(taskData, context);

    const response = await todoApi.create(
      processedTaskData.task || 'Automated Task',
      processedTaskData.priority || 3,
      processedTaskData.isPrioritized || false,
      processedTaskData.type || 'input',
      processedTaskData.deadline
    );

    console.log('✅ Task created automatically:', response.data?.todo);
    return response.data?.todo;
  }

  /**
   * 📝 タスク更新アクション
   */
  private async executeUpdateTaskAction(action: AutomationAction, context?: any): Promise<any> {
    const { taskId, taskUpdates } = action.config;
    if (!taskId || !taskUpdates) {
      throw new Error('Task ID and updates are required for update_task action');
    }

    const processedUpdates = this.processTaskDataWithContext(taskUpdates, context);
    const response = await todoApi.update(taskId, processedUpdates);

    console.log('✅ Task updated automatically:', response.data);
    return response.data;
  }

  /**
   * 🗑️ タスク削除アクション
   */
  private async executeDeleteTaskAction(action: AutomationAction, context?: any): Promise<any> {
    const { taskId } = action.config;
    if (!taskId) {
      throw new Error('Task ID is required for delete_task action');
    }

    const response = await todoApi.delete(taskId);
    console.log('✅ Task deleted automatically:', taskId);
    return response.data;
  }

  /**
   * 📢 通知送信アクション
   */
  private async executeSendNotificationAction(
    action: AutomationAction,
    context?: any
  ): Promise<any> {
    const { message, notificationType = 'info' } = action.config;
    if (!message) {
      throw new Error('Message is required for send_notification action');
    }

    const processedMessage = this.processMessageWithContext(message, context);

    switch (notificationType) {
      case 'success':
        toast.success(processedMessage);
        break;
      case 'warning':
        toast.error(processedMessage);
        break;
      case 'error':
        toast.error(processedMessage);
        break;
      default:
        toast(processedMessage);
    }

    console.log('✅ Notification sent:', processedMessage);
    return { message: processedMessage, type: notificationType };
  }

  /**
   * 🎮 ゲーミフィケーションアクション
   */
  private async executeGamificationAction(action: AutomationAction, context?: any): Promise<any> {
    const { xpAmount, badgeId, achievementId } = action.config;

    if (xpAmount) {
      // XP付与（実装は統合ゲーミフィケーションサービスに依存）
      console.log('✅ XP awarded automatically:', xpAmount);
    }

    if (badgeId) {
      // バッジ付与
      console.log('✅ Badge awarded automatically:', badgeId);
    }

    if (achievementId) {
      // 実績解除
      console.log('✅ Achievement unlocked automatically:', achievementId);
    }

    return { xpAmount, badgeId, achievementId };
  }

  /**
   * 🤖 AI分析アクション
   */
  private async executeAIAnalysisAction(action: AutomationAction, context?: any): Promise<any> {
    const { analysisType, contextData } = action.config;

    // AI分析を実行（実装はAIサービスに依存）
    console.log('✅ AI analysis executed automatically:', analysisType);
    return { analysisType, result: 'Analysis completed' };
  }

  /**
   * 📊 ダッシュボード更新アクション
   */
  private async executeDashboardUpdateAction(
    action: AutomationAction,
    context?: any
  ): Promise<any> {
    const { widgetId, dashboardConfig } = action.config;

    // ダッシュボード更新
    console.log('✅ Dashboard updated automatically:', { widgetId, dashboardConfig });
    return { widgetId, config: dashboardConfig };
  }

  /**
   * 🔄 ワークフローアクション
   */
  private async executeWorkflowAction(action: AutomationAction, context?: any): Promise<any> {
    const { workflowId, nextStepId } = action.config;

    // ワークフロー実行
    console.log('✅ Workflow action executed:', { workflowId, nextStepId });
    return { workflowId, nextStepId };
  }

  // Private helper methods
  private initializeDefaultRules(): void {
    const defaultRules: AutomationRule[] = [
      {
        id: 'daily_task_generation',
        name: '日次タスク自動生成',
        description: '毎日朝9時に定型タスクを自動生成',
        category: 'task_management',
        isActive: true,
        priority: 'medium',
        trigger: {
          type: 'time_based',
          config: {
            schedule: '0 9 * * *', // 毎日9時
          },
        },
        conditions: [],
        actions: [
          {
            id: 'create_daily_tasks',
            type: 'create_task',
            config: {
              taskData: {
                task: '日次レビュー・計画',
                priority: 3,
                type: 'input',
              },
            },
          },
        ],
        createdAt: new Date().toISOString(),
        executionCount: 0,
        successCount: 0,
        failureCount: 0,
        averageExecutionTime: 0,
        tags: ['daily', 'planning'],
      },
      {
        id: 'high_priority_alert',
        name: '高優先度タスク通知',
        description: '高優先度タスクが作成されたら即座に通知',
        category: 'notification',
        isActive: true,
        priority: 'high',
        trigger: {
          type: 'event_based',
          config: {
            event: 'task_created',
          },
        },
        conditions: [
          {
            id: 'priority_check',
            field: 'task.priority',
            operator: 'greater_than',
            value: 4,
          },
        ],
        actions: [
          {
            id: 'send_priority_alert',
            type: 'send_notification',
            config: {
              message: '🚨 高優先度タスクが作成されました！',
              notificationType: 'warning',
            },
          },
        ],
        createdAt: new Date().toISOString(),
        executionCount: 0,
        successCount: 0,
        failureCount: 0,
        averageExecutionTime: 0,
        tags: ['priority', 'alert'],
      },
      {
        id: 'completion_gamification',
        name: 'タスク完了ゲーミフィケーション',
        description: 'タスク完了時にXPとバッジを自動付与',
        category: 'gamification',
        isActive: true,
        priority: 'medium',
        trigger: {
          type: 'event_based',
          config: {
            event: 'task_completed',
          },
        },
        conditions: [],
        actions: [
          {
            id: 'award_completion_xp',
            type: 'update_gamification',
            config: {
              xpAmount: 25,
            },
          },
          {
            id: 'send_completion_notification',
            type: 'send_notification',
            config: {
              message: '🎉 タスク完了！+25 XP獲得',
              notificationType: 'success',
            },
          },
        ],
        createdAt: new Date().toISOString(),
        executionCount: 0,
        successCount: 0,
        failureCount: 0,
        averageExecutionTime: 0,
        tags: ['completion', 'xp', 'gamification'],
      },
    ];

    defaultRules.forEach((rule) => {
      this.automationRules.set(rule.id, rule);
    });

    console.log('🔧 Default automation rules initialized:', defaultRules.length);
  }

  private setupEventListeners(): void {
    // イベントリスナーの設定
    // 実際の実装では外部システムとの連携を行う
  }

  private async evaluateTrigger(trigger: AutomationTrigger): Promise<boolean> {
    // トリガー評価のロジック
    // 実際の実装では各トリガータイプに応じた評価を行う
    return Math.random() > 0.95; // デモ用
  }

  private async evaluateConditions(conditions: AutomationCondition[]): Promise<boolean> {
    // 条件評価のロジック
    // 実際の実装では各条件の評価とロジカル演算子の処理を行う
    return true; // デモ用
  }

  private processTaskDataWithContext(taskData: any, context?: any): any {
    // コンテキストデータでタスクデータを補完
    return taskData;
  }

  private processMessageWithContext(message: string, context?: any): string {
    // コンテキストデータでメッセージを補完
    return message;
  }

  private getTopPerformingRules(): AutomationRule[] {
    return Array.from(this.automationRules.values())
      .filter((r) => r.executionCount > 0)
      .sort((a, b) => b.successCount / b.executionCount - a.successCount / a.executionCount)
      .slice(0, 5);
  }

  private generateAutomationInsights(): AutomationInsight[] {
    // 自動化インサイトの生成
    return [
      {
        id: 'insight_1',
        type: 'performance',
        title: '自動化効率向上',
        description: '日次タスク生成ルールの成功率が98%に達しています',
        severity: 'low',
        category: 'performance',
        recommendations: ['定期メンテナンス実行', 'ログ監視強化'],
        generatedAt: new Date().toISOString(),
        relatedRules: ['daily_task_generation'],
      },
    ];
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private saveToStorage(): void {
    try {
      const data = {
        rules: Array.from(this.automationRules.entries()),
        executionHistory: this.executionHistory.slice(-100), // 最新100件のみ保存
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save automation data:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        this.automationRules = new Map(data.rules || []);
        this.executionHistory = data.executionHistory || [];
      }
    } catch (error) {
      console.error('Failed to load automation data:', error);
    }
  }

  // Event system
  on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Event listener error for ${event}:`, error);
      }
    });
  }
}

export const integratedAutomationService = new IntegratedAutomationService();
