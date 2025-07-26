/**
 * 🧠 認知統合サービス - ADHD/ASD特化型統合最適化システム
 * 認知評価結果に基づいてタスク管理・資産管理・UI表示を最適化
 */

import { EventEmitter } from 'events';

// 認知プロファイル型定義
interface CognitiveProfile {
  id: string;
  userId: string;
  date: Date;

  // 認知スコア
  verbalComprehension: number;
  perceptualReasoning: number;
  workingMemory: number;
  processingSpeed: number;
  executiveFunction: number;
  attentionalControl: number;
  sensoryProcessing: number;
  socialCognition: number;

  // パーソナライズ設定
  personalizedSettings: {
    optimalTaskDuration: number; // 最適タスク時間（分）
    preferredBreakFrequency: number; // 休憩頻度（分）
    visualComplexityLevel: 'low' | 'medium' | 'high';
    auditoryProcessingPreference: 'minimal' | 'moderate' | 'enhanced';
    multitaskingCapacity: 'single' | 'dual' | 'multiple';
    timeStructureNeed: 'rigid' | 'flexible' | 'adaptive';
    cognitiveLoadThreshold: number; // 認知負荷閾値
    distractionSensitivity: 'low' | 'medium' | 'high';
  };

  // 強み・課題
  strengths: string[];
  challenges: string[];
  recommendations: string[];
}

// タスク最適化設定
interface OptimizedTaskSettings {
  maxConcurrentTasks: number;
  taskBreakdownLevel: 'minimal' | 'moderate' | 'detailed';
  reminderFrequency: number; // 分
  priorityVisualization: 'color' | 'size' | 'position' | 'combined';
  deadlineWarningDays: number;
  autoSchedulingEnabled: boolean;
  focusTimeBlocks: Array<{ start: string; end: string }>;
}

// 資産管理最適化設定
interface OptimizedFinanceSettings {
  dataVisualizationStyle: 'simple' | 'detailed' | 'interactive';
  updateFrequency: 'daily' | 'weekly' | 'monthly';
  alertThresholds: {
    expenseAlert: number;
    savingsGoalAlert: number;
    budgetOverrun: number;
  };
  categoryGranularity: 'basic' | 'moderate' | 'detailed';
  automationLevel: 'manual' | 'assisted' | 'automatic';
  cognitiveLoadReduction: boolean;
}

// UI適応設定
interface AdaptiveUISettings {
  colorScheme: 'high-contrast' | 'low-contrast' | 'custom';
  fontSizeMultiplier: number;
  animationLevel: 'none' | 'minimal' | 'moderate' | 'full';
  layoutDensity: 'compact' | 'comfortable' | 'spacious';
  navigationStyle: 'minimal' | 'standard' | 'detailed';
  focusIndicators: 'subtle' | 'prominent' | 'custom';
}

export class CognitiveIntegrationService extends EventEmitter {
  private cognitiveProfiles: Map<string, CognitiveProfile> = new Map();
  private optimizedSettings: Map<
    string,
    {
      task: OptimizedTaskSettings;
      finance: OptimizedFinanceSettings;
      ui: AdaptiveUISettings;
    }
  > = new Map();

  /**
   * 認知プロファイルを登録・更新
   */
  async updateCognitiveProfile(profile: CognitiveProfile): Promise<void> {
    this.cognitiveProfiles.set(profile.userId, profile);

    // 最適化設定を生成
    const optimizedSettings = this.generateOptimizedSettings(profile);
    this.optimizedSettings.set(profile.userId, optimizedSettings);

    // 設定変更イベントを発火
    this.emit('cognitiveProfileUpdated', {
      userId: profile.userId,
      profile,
      optimizedSettings,
    });

    console.log(`🧠 認知プロファイル更新完了: ${profile.userId}`);
  }

  /**
   * 認知特性に基づく最適化設定を生成
   */
  private generateOptimizedSettings(profile: CognitiveProfile): {
    task: OptimizedTaskSettings;
    finance: OptimizedFinanceSettings;
    ui: AdaptiveUISettings;
  } {
    const { personalizedSettings } = profile;

    // タスク管理最適化
    const taskSettings: OptimizedTaskSettings = {
      maxConcurrentTasks:
        personalizedSettings.multitaskingCapacity === 'single'
          ? 1
          : personalizedSettings.multitaskingCapacity === 'dual'
            ? 2
            : 3,
      taskBreakdownLevel:
        profile.executiveFunction < 85
          ? 'detailed'
          : profile.executiveFunction < 100
            ? 'moderate'
            : 'minimal',
      reminderFrequency: personalizedSettings.optimalTaskDuration / 4,
      priorityVisualization:
        personalizedSettings.visualComplexityLevel === 'low'
          ? 'color'
          : personalizedSettings.visualComplexityLevel === 'medium'
            ? 'combined'
            : 'size',
      deadlineWarningDays: profile.attentionalControl < 85 ? 7 : 3,
      autoSchedulingEnabled: personalizedSettings.timeStructureNeed === 'rigid',
      focusTimeBlocks: this.generateFocusTimeBlocks(profile),
    };

    // 資産管理最適化
    const financeSettings: OptimizedFinanceSettings = {
      dataVisualizationStyle:
        personalizedSettings.visualComplexityLevel === 'low'
          ? 'simple'
          : personalizedSettings.visualComplexityLevel === 'medium'
            ? 'detailed'
            : 'interactive',
      updateFrequency: profile.processingSpeed < 85 ? 'weekly' : 'daily',
      alertThresholds: {
        expenseAlert: profile.executiveFunction < 85 ? 0.8 : 0.9,
        savingsGoalAlert: 0.1,
        budgetOverrun: profile.attentionalControl < 85 ? 0.05 : 0.1,
      },
      categoryGranularity: profile.workingMemory < 85 ? 'basic' : 'moderate',
      automationLevel: profile.executiveFunction < 85 ? 'automatic' : 'assisted',
      cognitiveLoadReduction: profile.workingMemory < 90,
    };

    // UI適応設定
    const uiSettings: AdaptiveUISettings = {
      colorScheme: profile.sensoryProcessing < 85 ? 'high-contrast' : 'low-contrast',
      fontSizeMultiplier: profile.processingSpeed < 85 ? 1.2 : 1.0,
      animationLevel: personalizedSettings.distractionSensitivity === 'high' ? 'none' : 'minimal',
      layoutDensity:
        personalizedSettings.visualComplexityLevel === 'low' ? 'spacious' : 'comfortable',
      navigationStyle: profile.workingMemory < 85 ? 'minimal' : 'standard',
      focusIndicators: profile.attentionalControl < 85 ? 'prominent' : 'subtle',
    };

    return { task: taskSettings, finance: financeSettings, ui: uiSettings };
  }

  /**
   * 認知特性に基づく集中時間ブロックを生成
   */
  private generateFocusTimeBlocks(
    profile: CognitiveProfile
  ): Array<{ start: string; end: string }> {
    const { optimalTaskDuration, preferredBreakFrequency } = profile.personalizedSettings;

    // 朝の集中時間（最も認知機能が高い）
    const morningBlock = {
      start: '09:00',
      end: this.addMinutes('09:00', optimalTaskDuration),
    };

    // 午後の集中時間
    const afternoonBlock = {
      start: '14:00',
      end: this.addMinutes('14:00', Math.floor(optimalTaskDuration * 0.8)),
    };

    return [morningBlock, afternoonBlock];
  }

  /**
   * 時間に分を追加するヘルパー
   */
  private addMinutes(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }

  /**
   * ユーザーの最適化設定を取得
   */
  getOptimizedSettings(userId: string) {
    return this.optimizedSettings.get(userId);
  }

  /**
   * タスクを認知特性に基づいて分析・最適化
   */
  optimizeTask(userId: string, task: any): any {
    const profile = this.cognitiveProfiles.get(userId);
    const settings = this.optimizedSettings.get(userId);

    if (!profile || !settings) {
      return task;
    }

    // タスクの認知負荷を計算
    const cognitiveLoad = this.calculateTaskCognitiveLoad(task);

    // 認知負荷が閾値を超える場合、タスクを分割
    if (cognitiveLoad > profile.personalizedSettings.cognitiveLoadThreshold) {
      return this.breakdownTask(task, settings.task);
    }

    // 最適なスケジューリング提案
    const optimizedSchedule = this.suggestOptimalSchedule(task, profile, settings.task);

    return {
      ...task,
      cognitiveLoad,
      optimizedSchedule,
      recommendations: this.generateTaskRecommendations(task, profile),
    };
  }

  /**
   * タスクの認知負荷を計算
   */
  private calculateTaskCognitiveLoad(task: any): number {
    let load = 0;

    // 基本負荷
    load += 30;

    // 複雑さに基づく負荷
    if (task.subtasks && task.subtasks.length > 3) load += 20;
    if (task.dependencies && task.dependencies.length > 2) load += 15;
    if (task.priority === 'urgent') load += 25;

    // 時間制約による負荷
    if (task.deadline) {
      const daysUntilDeadline = Math.ceil(
        (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilDeadline <= 1) load += 30;
      else if (daysUntilDeadline <= 3) load += 15;
    }

    return Math.min(load, 100);
  }

  /**
   * 高負荷タスクを分割
   */
  private breakdownTask(task: any, settings: OptimizedTaskSettings): any {
    const subtasks = [];
    const estimatedMinutes = task.estimatedDuration || 120;
    const optimalChunkSize = 60; // 60分チャンク

    const chunks = Math.ceil(estimatedMinutes / optimalChunkSize);

    for (let i = 0; i < chunks; i++) {
      subtasks.push({
        id: `${task.id}-chunk-${i + 1}`,
        title: `${task.title} - 段階 ${i + 1}`,
        estimatedDuration: Math.min(optimalChunkSize, estimatedMinutes - i * optimalChunkSize),
        priority: task.priority,
        cognitiveLoad: 40, // 分割により負荷軽減
      });
    }

    return {
      ...task,
      subtasks,
      isOptimized: true,
      originalCognitiveLoad: this.calculateTaskCognitiveLoad(task),
      optimizedCognitiveLoad: 40,
    };
  }

  /**
   * 最適なスケジュール提案
   */
  private suggestOptimalSchedule(
    task: any,
    profile: CognitiveProfile,
    settings: OptimizedTaskSettings
  ): any {
    const focusBlocks = settings.focusTimeBlocks;
    const taskDuration = task.estimatedDuration || 60;

    // 認知機能が高い時間帯を優先
    const preferredBlock = focusBlocks.find((block) => {
      const blockDuration = this.getBlockDuration(block.start, block.end);
      return blockDuration >= taskDuration;
    });

    if (preferredBlock) {
      return {
        recommendedStart: preferredBlock.start,
        recommendedEnd: this.addMinutes(preferredBlock.start, taskDuration),
        reason: '認知機能が最も高い時間帯です',
        confidence: 0.9,
      };
    }

    return {
      recommendedStart: '09:00',
      recommendedEnd: this.addMinutes('09:00', taskDuration),
      reason: 'デフォルトの集中時間',
      confidence: 0.6,
    };
  }

  /**
   * 時間ブロックの長さを計算
   */
  private getBlockDuration(start: string, end: string): number {
    const [startHours, startMins] = start.split(':').map(Number);
    const [endHours, endMins] = end.split(':').map(Number);

    const startMinutes = startHours * 60 + startMins;
    const endMinutes = endHours * 60 + endMins;

    return endMinutes - startMinutes;
  }

  /**
   * タスク推奨事項を生成
   */
  private generateTaskRecommendations(task: any, profile: CognitiveProfile): string[] {
    const recommendations = [];

    if (profile.attentionalControl < 85) {
      recommendations.push('📱 通知をオフにして集中環境を作りましょう');
    }

    if (profile.workingMemory < 85) {
      recommendations.push('📝 タスクを細かく分割して記録を取りながら進めましょう');
    }

    if (profile.executiveFunction < 85) {
      recommendations.push('⏰ タイマーを使って時間を区切って作業しましょう');
    }

    if (profile.sensoryProcessing < 85) {
      recommendations.push('🎧 静かな環境または適度な背景音楽を使いましょう');
    }

    return recommendations;
  }

  /**
   * 財務データを認知特性に基づいて最適化
   */
  optimizeFinanceView(userId: string, financeData: any): any {
    const profile = this.cognitiveProfiles.get(userId);
    const settings = this.optimizedSettings.get(userId);

    if (!profile || !settings) {
      return financeData;
    }

    // 認知負荷を軽減したデータ表示
    if (settings.finance.cognitiveLoadReduction) {
      return this.simplifiyFinanceData(financeData, profile);
    }

    return financeData;
  }

  /**
   * 財務データの簡素化
   */
  private simplifiyFinanceData(data: any, profile: CognitiveProfile): any {
    // 認知負荷軽減のため、重要な指標のみ表示
    return {
      ...data,
      simplified: true,
      keyMetrics: {
        netWorth: data.netWorth,
        monthlyChange: data.monthlyNetWorthChange,
        emergencyFund: data.emergencyFundRatio,
      },
      recommendations: this.generateFinanceRecommendations(data, profile),
    };
  }

  /**
   * 財務推奨事項を生成
   */
  private generateFinanceRecommendations(data: any, profile: CognitiveProfile): string[] {
    const recommendations = [];

    if (profile.executiveFunction < 85) {
      recommendations.push('💰 自動積立を設定して貯蓄を自動化しましょう');
    }

    if (profile.attentionalControl < 85) {
      recommendations.push('📊 月1回の簡単な資産確認で十分です');
    }

    if (data.emergencyFundRatio < 3) {
      recommendations.push('🛡️ 緊急資金を3ヶ月分まで増やすことを目標にしましょう');
    }

    return recommendations;
  }

  /**
   * 統合ダッシュボードデータを生成
   */
  generateUnifiedDashboard(userId: string): any {
    const profile = this.cognitiveProfiles.get(userId);
    const settings = this.optimizedSettings.get(userId);

    if (!profile || !settings) {
      return null;
    }

    return {
      personalizedGreeting: this.generatePersonalizedGreeting(profile),
      cognitiveStatus: this.assessCurrentCognitiveStatus(profile),
      optimizedWorkflow: this.generateOptimizedWorkflow(profile, settings),
      adaptiveRecommendations: this.generateAdaptiveRecommendations(profile),
      progressMetrics: this.calculateProgressMetrics(userId),
      nextActions: this.suggestNextActions(profile, settings),
    };
  }

  /**
   * パーソナライズされた挨拶を生成
   */
  private generatePersonalizedGreeting(profile: CognitiveProfile): string {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'おはようございます' : hour < 18 ? 'こんにちは' : 'こんばんは';

    const strengthsText = profile.strengths.slice(0, 2).join('と');

    return `${timeGreeting}！今日も${strengthsText}を活かして、一歩ずつ進んでいきましょう。`;
  }

  /**
   * 現在の認知状態を評価
   */
  private assessCurrentCognitiveStatus(profile: CognitiveProfile): any {
    const hour = new Date().getHours();

    // 時間帯による認知機能の変動を考慮
    let currentEfficiency = 1.0;
    if (hour >= 9 && hour <= 11)
      currentEfficiency = 1.0; // 朝の高効率
    else if (hour >= 14 && hour <= 16)
      currentEfficiency = 0.8; // 午後の中効率
    else if (hour >= 19 || hour <= 7)
      currentEfficiency = 0.6; // 夜間低効率
    else currentEfficiency = 0.7; // その他

    return {
      efficiency: currentEfficiency,
      recommendation:
        currentEfficiency > 0.8
          ? '集中力が高い時間です。重要なタスクに取り組みましょう'
          : '休憩や軽いタスクがおすすめです',
      optimalTaskType: currentEfficiency > 0.8 ? 'complex' : 'simple',
    };
  }

  /**
   * 最適化されたワークフローを生成
   */
  private generateOptimizedWorkflow(profile: CognitiveProfile, settings: any): any {
    return {
      currentFocus: '認知特性に最適化されたワークフロー',
      todaysPlan: this.generateDailyPlan(profile, settings),
      energyManagement: this.generateEnergyManagement(profile),
      breakSchedule: this.generateBreakSchedule(profile),
    };
  }

  /**
   * 1日の計画を生成
   */
  private generateDailyPlan(profile: CognitiveProfile, settings: any): any[] {
    const plan: any[] = [];
    const focusBlocks = settings.task.focusTimeBlocks;

    focusBlocks.forEach((block: any, index: number) => {
      plan.push({
        time: block.start,
        activity: index === 0 ? '重要タスク（高集中）' : '中程度タスク',
        duration: this.getBlockDuration(block.start, block.end),
        cognitiveLoad: index === 0 ? 'high' : 'medium',
      });
    });

    return plan;
  }

  /**
   * エネルギー管理提案を生成
   */
  private generateEnergyManagement(profile: CognitiveProfile): any {
    return {
      currentLevel: 'medium',
      suggestions: ['深呼吸を3回してリラックス', '軽いストレッチで血流促進', '水分補給を忘れずに'],
      warningThreshold: profile.personalizedSettings.cognitiveLoadThreshold,
    };
  }

  /**
   * 休憩スケジュールを生成
   */
  private generateBreakSchedule(profile: CognitiveProfile): any[] {
    const { preferredBreakFrequency } = profile.personalizedSettings;
    const schedule = [];

    for (let hour = 9; hour <= 17; hour += Math.ceil(preferredBreakFrequency / 60)) {
      schedule.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        type: '短い休憩',
        duration: 5,
        activity: '深呼吸・ストレッチ',
      });
    }

    return schedule;
  }

  /**
   * 適応的推奨事項を生成
   */
  private generateAdaptiveRecommendations(profile: CognitiveProfile): string[] {
    const recommendations = [];
    const currentHour = new Date().getHours();

    if (currentHour >= 9 && currentHour <= 11 && profile.attentionalControl >= 85) {
      recommendations.push('🎯 今が最も集中力の高い時間です。重要なタスクを優先しましょう');
    }

    if (profile.executiveFunction < 85) {
      recommendations.push('📋 タスクリストを見直して、今日の最重要項目を3つに絞りましょう');
    }

    if (profile.workingMemory < 85) {
      recommendations.push('📝 作業中のメモを活用して、忘れやすい情報を記録しましょう');
    }

    return recommendations;
  }

  /**
   * 進捗指標を計算
   */
  private calculateProgressMetrics(userId: string): any {
    // 実装: 実際のデータから進捗を計算
    return {
      cognitiveImprovement: 15, // %
      taskCompletionRate: 78, // %
      financialGoalProgress: 45, // %
      overallWellbeing: 82, // %
    };
  }

  /**
   * 次のアクション提案
   */
  private suggestNextActions(profile: CognitiveProfile, settings: any): any[] {
    const actions = [];

    actions.push({
      priority: 'high',
      action: '今日の最重要タスクを確認',
      reason: '認知機能が高い朝の時間を活用',
      estimatedTime: 5,
    });

    if (profile.executiveFunction < 85) {
      actions.push({
        priority: 'medium',
        action: '大きなタスクを小さく分割',
        reason: '実行機能の特性に合わせた最適化',
        estimatedTime: 10,
      });
    }

    actions.push({
      priority: 'low',
      action: '財務状況の簡単チェック',
      reason: '定期的な確認で安心感を維持',
      estimatedTime: 5,
    });

    return actions;
  }
}

export default CognitiveIntegrationService;
