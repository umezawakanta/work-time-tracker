/**
 * 🚀 統一ダッシュボードサービス
 * ホーム、統合ダッシュボード、タスク管理、ゲーミフィケーションの完全統合
 */

import {
  integratedGamificationService,
  IntegratedDashboardData,
} from '../gamification/IntegratedGamificationService';
import { aiGamificationService } from '../gamification/AIGamificationService';
import { todoApi } from '../api/todoApi';
import { Todo } from '@/types/todo';

export interface UnifiedDashboardData {
  // システム全体の統計
  systemOverview: {
    totalUsers: number;
    activeFeatures: number;
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
    uptime: number;
    lastUpdated: string;
  };

  // タスク管理統合データ
  taskMetrics: {
    totalTasks: number;
    completedToday: number;
    pendingTasks: number;
    overdueTasks: number;
    weeklyCompletion: number;
    productivityScore: number;
    averageCompletionTime: number;
    taskCategories: TaskCategoryMetric[];
  };

  // ゲーミフィケーション統合データ
  gamificationMetrics: {
    playerLevel: number;
    totalXP: number;
    todayXP: number;
    streakDays: number;
    badges: number;
    achievements: number;
    rank: string;
    nextLevelProgress: number;
  };

  // AI統合データ
  aiMetrics: {
    analysisCount: number;
    recommendationsGenerated: number;
    tasksGenerated: number;
    accuracyScore: number;
    lastAnalysis: string;
    aiUsageToday: number;
  };

  // パフォーマンス統合データ
  performanceMetrics: {
    pageLoadTime: number;
    apiResponseTime: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
    activeConnections: number;
  };

  // リアルタイム活動データ
  realtimeActivity: {
    activeUsers: number;
    currentSessions: number;
    recentActions: RecentAction[];
    liveNotifications: LiveNotification[];
    systemEvents: SystemEvent[];
  };

  // 予測・分析データ
  analytics: {
    trendAnalysis: TrendData[];
    predictions: PredictionData[];
    insights: InsightData[];
    recommendations: RecommendationData[];
  };

  // ナビゲーション・UI統合
  navigation: {
    quickActions: QuickAction[];
    recentPages: RecentPage[];
    shortcuts: Shortcut[];
    contextualActions: ContextualAction[];
  };
}

export interface TaskCategoryMetric {
  category: string;
  count: number;
  completed: number;
  completionRate: number;
  avgPriority: number;
}

export interface RecentAction {
  id: string;
  type: 'task_complete' | 'xp_gained' | 'badge_earned' | 'ai_analysis' | 'page_visit';
  description: string;
  timestamp: string;
  userId: string;
  data?: any;
}

export interface LiveNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable: boolean;
  action?: {
    label: string;
    url: string;
  };
}

export interface SystemEvent {
  id: string;
  type: 'system' | 'user' | 'integration' | 'ai';
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  source: string;
}

export interface TrendData {
  metric: string;
  period: 'hour' | 'day' | 'week' | 'month';
  data: { timestamp: string; value: number }[];
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
}

export interface PredictionData {
  type: 'task_completion' | 'xp_gain' | 'productivity' | 'burnout_risk';
  prediction: number;
  confidence: number;
  timeframe: string;
  factors: string[];
}

export interface InsightData {
  id: string;
  category: 'productivity' | 'gamification' | 'ai' | 'system';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  generatedAt: string;
}

export interface RecommendationData {
  id: string;
  type: 'feature' | 'optimization' | 'task' | 'learning';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: number;
  implementationDifficulty: 'easy' | 'medium' | 'hard';
}

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  path: string;
  description: string;
  category: string;
  badge?: string;
}

export interface RecentPage {
  path: string;
  title: string;
  lastVisited: string;
  visitCount: number;
  avgTimeSpent: number;
}

export interface Shortcut {
  key: string;
  action: string;
  description: string;
  enabled: boolean;
}

export interface ContextualAction {
  id: string;
  title: string;
  description: string;
  action: () => void;
  condition: () => boolean;
  priority: number;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'list' | 'progress' | 'activity' | 'ai_insight';
  title: string;
  data: any;
  size: 'sm' | 'md' | 'lg' | 'xl';
  position: { x: number; y: number };
  visible: boolean;
  refreshRate: number; // seconds
}

export interface UnifiedDashboardSettings {
  theme: 'light' | 'dark' | 'auto';
  layout: 'grid' | 'masonry' | 'list';
  refreshInterval: number;
  enableNotifications: boolean;
  enableRealtimeUpdates: boolean;
  maxRecentActions: number;
  defaultWidgets: string[];
  customWidgets: DashboardWidget[];
}

class UnifiedDashboardService {
  private dashboardData: UnifiedDashboardData | null = null;
  private settings: UnifiedDashboardSettings;
  private updateInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();
  private readonly STORAGE_KEY = 'unified_dashboard';

  constructor() {
    this.settings = this.loadSettings();
    this.setupEventListeners();
  }

  /**
   * 🚀 統一ダッシュボードの初期化
   */
  async initialize(userId: string): Promise<UnifiedDashboardData> {
    try {
      console.log('🚀 Unified Dashboard initialization started for user:', userId);

      // 全システムからデータを収集
      const [taskData, gamificationData, aiData, performanceData] = await Promise.all([
        this.collectTaskData(),
        this.collectGamificationData(userId),
        this.collectAIData(),
        this.collectPerformanceData(),
      ]);

      // リアルタイムデータを収集
      const realtimeData = await this.collectRealtimeData();

      // 分析・予測データを生成
      const analyticsData = await this.generateAnalytics(taskData, gamificationData);

      // ナビゲーションデータを生成
      const navigationData = this.generateNavigationData();

      // 統一ダッシュボードデータを構築
      this.dashboardData = {
        systemOverview: {
          totalUsers: 1, // Single user for now
          activeFeatures: 12,
          systemHealth: 'excellent',
          uptime: 99.9,
          lastUpdated: new Date().toISOString(),
        },
        taskMetrics: taskData,
        gamificationMetrics: gamificationData,
        aiMetrics: aiData,
        performanceMetrics: performanceData,
        realtimeActivity: realtimeData,
        analytics: analyticsData,
        navigation: navigationData,
      };

      // リアルタイム更新を開始
      this.startRealtimeUpdates();

      // イベント発火
      this.emit('dashboard_initialized', this.dashboardData);

      console.log('✅ Unified Dashboard initialized successfully:', {
        totalTasks: taskData.totalTasks,
        playerLevel: gamificationData.playerLevel,
        aiAnalyses: aiData.analysisCount,
      });

      return this.dashboardData;
    } catch (error) {
      console.error('❌ Unified Dashboard initialization failed:', error);
      throw error;
    }
  }

  /**
   * 📊 タスクデータの収集
   */
  private async collectTaskData(): Promise<any> {
    try {
      // TodoAPIからデータを取得（実際の実装では適切なAPI呼び出し）
      const today = new Date().toDateString();

      // モックデータ（実際の実装では実データを使用）
      return {
        totalTasks: 45,
        completedToday: 8,
        pendingTasks: 12,
        overdueTasks: 3,
        weeklyCompletion: 85,
        productivityScore: 78,
        averageCompletionTime: 25, // minutes
        taskCategories: [
          { category: 'Development', count: 15, completed: 12, completionRate: 80, avgPriority: 4 },
          { category: 'Planning', count: 8, completed: 6, completionRate: 75, avgPriority: 3 },
          { category: 'Learning', count: 10, completed: 8, completionRate: 80, avgPriority: 3 },
          { category: 'Admin', count: 12, completed: 10, completionRate: 83, avgPriority: 2 },
        ],
      };
    } catch (error) {
      console.error('Task data collection failed:', error);
      return this.getDefaultTaskData();
    }
  }

  /**
   * 🎮 ゲーミフィケーションデータの収集
   */
  private async collectGamificationData(userId: string): Promise<any> {
    try {
      // 統合ゲーミフィケーションサービスからデータを取得
      await integratedGamificationService.initializePlayer(userId);
      const gamificationData = await integratedGamificationService.getDashboardData();

      return {
        playerLevel: gamificationData.player.level,
        totalXP: gamificationData.player.totalXP,
        todayXP: gamificationData.todayStats.xpEarned,
        streakDays: gamificationData.player.streakDays,
        badges: gamificationData.player.badges.length,
        achievements: gamificationData.player.achievements.filter((a) => a.isCompleted).length,
        rank: this.calculateRank(gamificationData.player.level),
        nextLevelProgress:
          (gamificationData.player.currentXP / gamificationData.player.xpToNextLevel) * 100,
      };
    } catch (error) {
      console.error('Gamification data collection failed:', error);
      return this.getDefaultGamificationData();
    }
  }

  /**
   * 🤖 AIデータの収集
   */
  private async collectAIData(): Promise<any> {
    try {
      // AI関連の統計を収集
      return {
        analysisCount: 127,
        recommendationsGenerated: 45,
        tasksGenerated: 23,
        accuracyScore: 94.5,
        lastAnalysis: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
        aiUsageToday: 18,
      };
    } catch (error) {
      console.error('AI data collection failed:', error);
      return this.getDefaultAIData();
    }
  }

  /**
   * ⚡ パフォーマンスデータの収集
   */
  private async collectPerformanceData(): Promise<any> {
    try {
      // パフォーマンス指標を収集
      return {
        pageLoadTime: 1250, // ms
        apiResponseTime: 180, // ms
        errorRate: 0.2, // %
        memoryUsage: 65, // %
        cpuUsage: 12, // %
        activeConnections: 1,
      };
    } catch (error) {
      console.error('Performance data collection failed:', error);
      return this.getDefaultPerformanceData();
    }
  }

  /**
   * 📡 リアルタイムデータの収集
   */
  private async collectRealtimeData(): Promise<any> {
    try {
      return {
        activeUsers: 1,
        currentSessions: 1,
        recentActions: this.generateRecentActions(),
        liveNotifications: this.generateLiveNotifications(),
        systemEvents: this.generateSystemEvents(),
      };
    } catch (error) {
      console.error('Realtime data collection failed:', error);
      return this.getDefaultRealtimeData();
    }
  }

  /**
   * 📈 分析・予測データの生成
   */
  private async generateAnalytics(taskData: any, gamificationData: any): Promise<any> {
    try {
      return {
        trendAnalysis: this.generateTrendData(),
        predictions: this.generatePredictions(taskData, gamificationData),
        insights: this.generateInsights(taskData, gamificationData),
        recommendations: this.generateRecommendations(),
      };
    } catch (error) {
      console.error('Analytics generation failed:', error);
      return this.getDefaultAnalytics();
    }
  }

  /**
   * 🧭 ナビゲーションデータの生成
   */
  private generateNavigationData(): any {
    return {
      quickActions: [
        {
          id: 'add-task',
          title: '新規タスク',
          icon: '➕',
          path: '/todos',
          description: 'タスクを追加',
          category: 'task',
          badge: 'HOT',
        },
        {
          id: 'ai-analysis',
          title: 'AI分析',
          icon: '🤖',
          path: '/ai-gamification',
          description: 'AI分析実行',
          category: 'ai',
        },
        {
          id: 'dashboard',
          title: 'ダッシュボード',
          icon: '📊',
          path: '/integrated-dashboard',
          description: '統合ビュー',
          category: 'navigation',
        },
        {
          id: 'gamification',
          title: 'ゲーミフィケーション',
          icon: '🎮',
          path: '/integrated-gamification',
          description: 'ゲーム要素',
          category: 'game',
        },
      ],
      recentPages: [
        {
          path: '/todos',
          title: 'タスク管理',
          lastVisited: new Date().toISOString(),
          visitCount: 15,
          avgTimeSpent: 180,
        },
        {
          path: '/integrated-gamification',
          title: '統合ゲーミフィケーション',
          lastVisited: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          visitCount: 8,
          avgTimeSpent: 240,
        },
      ],
      shortcuts: [
        { key: 'Ctrl+N', action: 'new_task', description: '新規タスク作成', enabled: true },
        { key: 'Ctrl+D', action: 'dashboard', description: 'ダッシュボード表示', enabled: true },
      ],
      contextualActions: [],
    };
  }

  /**
   * 🔄 リアルタイム更新の開始
   */
  private startRealtimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      await this.updateRealtimeData();
    }, this.settings.refreshInterval * 1000);

    console.log(`🔄 Realtime updates started (${this.settings.refreshInterval}s interval)`);
  }

  /**
   * 📡 リアルタイムデータの更新
   */
  private async updateRealtimeData(): Promise<void> {
    if (!this.dashboardData) return;

    try {
      // 重要な指標のみを更新（パフォーマンス最適化）
      const newRealtimeData = await this.collectRealtimeData();

      this.dashboardData.realtimeActivity = {
        ...this.dashboardData.realtimeActivity,
        ...newRealtimeData,
      };

      this.dashboardData.systemOverview.lastUpdated = new Date().toISOString();

      // イベント発火
      this.emit('realtime_updated', this.dashboardData.realtimeActivity);
    } catch (error) {
      console.error('Realtime update failed:', error);
    }
  }

  /**
   * 📊 現在のダッシュボードデータを取得
   */
  getDashboardData(): UnifiedDashboardData | null {
    return this.dashboardData;
  }

  /**
   * ⚙️ 設定の更新
   */
  updateSettings(newSettings: Partial<UnifiedDashboardSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.emit('settings_updated', this.settings);
  }

  /**
   * 🎧 イベントリスナーの管理
   */
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

  /**
   * 🧹 クリーンアップ
   */
  cleanup(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.eventListeners.clear();
  }

  // Private helper methods
  private setupEventListeners(): void {
    // 設定に応じてイベントリスナーを設定
  }

  private loadSettings(): UnifiedDashboardSettings {
    try {
      const saved = localStorage.getItem(`${this.STORAGE_KEY}_settings`);
      if (saved) {
        return { ...this.getDefaultSettings(), ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load dashboard settings:', error);
    }
    return this.getDefaultSettings();
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(`${this.STORAGE_KEY}_settings`, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save dashboard settings:', error);
    }
  }

  private getDefaultSettings(): UnifiedDashboardSettings {
    return {
      theme: 'auto',
      layout: 'grid',
      refreshInterval: 30,
      enableNotifications: true,
      enableRealtimeUpdates: true,
      maxRecentActions: 50,
      defaultWidgets: ['tasks', 'gamification', 'ai', 'performance'],
      customWidgets: [],
    };
  }

  // Mock data generators
  private getDefaultTaskData(): any {
    return {
      totalTasks: 0,
      completedToday: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      weeklyCompletion: 0,
      productivityScore: 0,
      averageCompletionTime: 0,
      taskCategories: [],
    };
  }

  private getDefaultGamificationData(): any {
    return {
      playerLevel: 1,
      totalXP: 0,
      todayXP: 0,
      streakDays: 0,
      badges: 0,
      achievements: 0,
      rank: 'Beginner',
      nextLevelProgress: 0,
    };
  }

  private getDefaultAIData(): any {
    return {
      analysisCount: 0,
      recommendationsGenerated: 0,
      tasksGenerated: 0,
      accuracyScore: 0,
      lastAnalysis: '',
      aiUsageToday: 0,
    };
  }

  private getDefaultPerformanceData(): any {
    return {
      pageLoadTime: 0,
      apiResponseTime: 0,
      errorRate: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      activeConnections: 0,
    };
  }

  private getDefaultRealtimeData(): any {
    return {
      activeUsers: 0,
      currentSessions: 0,
      recentActions: [],
      liveNotifications: [],
      systemEvents: [],
    };
  }

  private getDefaultAnalytics(): any {
    return {
      trendAnalysis: [],
      predictions: [],
      insights: [],
      recommendations: [],
    };
  }

  private calculateRank(level: number): string {
    if (level >= 50) return 'Master';
    if (level >= 30) return 'Expert';
    if (level >= 20) return 'Advanced';
    if (level >= 10) return 'Intermediate';
    return 'Beginner';
  }

  private generateRecentActions(): RecentAction[] {
    return [
      {
        id: '1',
        type: 'task_complete',
        description: 'タスク「AI統合機能開発」を完了',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        userId: 'current_user',
      },
      {
        id: '2',
        type: 'xp_gained',
        description: '+25 XP獲得',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        userId: 'current_user',
      },
    ];
  }

  private generateLiveNotifications(): LiveNotification[] {
    return [
      {
        id: '1',
        type: 'success',
        title: 'タスク完了',
        message: '今日のタスクを8個完了しました！',
        timestamp: new Date().toISOString(),
        read: false,
        actionable: false,
      },
    ];
  }

  private generateSystemEvents(): SystemEvent[] {
    return [
      {
        id: '1',
        type: 'system',
        level: 'info',
        message: 'Dashboard initialized successfully',
        timestamp: new Date().toISOString(),
        source: 'UnifiedDashboardService',
      },
    ];
  }

  private generateTrendData(): TrendData[] {
    return [
      {
        metric: 'task_completion',
        period: 'day',
        data: Array.from({ length: 7 }, (_, i) => ({
          timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          value: Math.floor(Math.random() * 10) + 5,
        })),
        trend: 'increasing',
        changePercent: 12.5,
      },
    ];
  }

  private generatePredictions(taskData: any, gamificationData: any): PredictionData[] {
    return [
      {
        type: 'task_completion',
        prediction: 85,
        confidence: 0.78,
        timeframe: '今週',
        factors: ['現在のペース', '過去の実績', '優先度分布'],
      },
    ];
  }

  private generateInsights(taskData: any, gamificationData: any): InsightData[] {
    return [
      {
        id: '1',
        category: 'productivity',
        title: '生産性向上の機会',
        description: '午前中のタスク完了率が高いため、重要なタスクを午前に配置することを推奨',
        impact: 'high',
        actionable: true,
        generatedAt: new Date().toISOString(),
      },
    ];
  }

  private generateRecommendations(): RecommendationData[] {
    return [
      {
        id: '1',
        type: 'optimization',
        title: 'タスク自動分類の導入',
        description: 'AIによるタスク自動分類で管理効率を向上',
        priority: 'medium',
        estimatedImpact: 15,
        implementationDifficulty: 'medium',
      },
    ];
  }
}

export const unifiedDashboardService = new UnifiedDashboardService();
