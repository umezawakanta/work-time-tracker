// 開発タスク管理サービス - サイト完成に向けたタスクとアドバイス管理
import { comprehensiveBadgeService } from '@/services/development/ComprehensiveBadgeService';
import { DevelopmentBadge, BadgeCategory } from '@/types/development-badges';

interface DevelopmentTask {
  id: string;
  title: string;
  description: string;
  category:
    | 'frontend'
    | 'backend'
    | 'design'
    | 'testing'
    | 'optimization'
    | 'deployment'
    | 'documentation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedHours: number;
  status: 'todo' | 'in-progress' | 'completed' | 'blocked';
  dependencies?: string[];
  tags: string[];
  completionPercentage: number;
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  linkedBadges?: string[]; // 関連するバッジID
  badgeCategory?: BadgeCategory; // 対応するバッジカテゴリ
}

interface SiteCompletionMetrics {
  overallCompletion: number;
  categoryBreakdown: Record<string, number>;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  criticalTasksRemaining: number;
  estimatedHoursRemaining: number;
  nextMilestone: {
    name: string;
    progress: number;
    deadline: string;
  };
}

interface DevelopmentAdvice {
  id: string;
  type:
    | 'task-suggestion'
    | 'priority-alert'
    | 'milestone-update'
    | 'technical-tip'
    | 'process-improvement';
  title: string;
  message: string;
  urgency: 'low' | 'medium' | 'high';
  actionable: boolean;
  relatedTasks?: string[];
  timeEstimate?: string;
  character: 'architect' | 'tester' | 'designer' | 'devops' | 'manager';
}

class DevelopmentTaskService {
  private tasks: DevelopmentTask[] = [];
  private completedFeatures: string[] = [];
  private badgeIntegrationEnabled: boolean = true;

  constructor() {
    this.initializeTasks();
    this.loadProgress();
  }

  /**
   * 🏗️ 開発タスクの初期化
   */
  private initializeTasks(): void {
    this.tasks = [
      // フロントエンド
      {
        id: 'fe-001',
        title: 'レスポンシブデザインの完全対応',
        description: '全ページでタブレット・スマートフォン表示の最適化',
        category: 'frontend',
        priority: 'high',
        estimatedHours: 16,
        status: 'in-progress',
        tags: ['responsive', 'css', 'mobile'],
        completionPercentage: 70,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15',
        badgeCategory: 'mobile',
        linkedBadges: ['responsive-design-master', 'mobile-first-developer'],
      },
      {
        id: 'fe-002',
        title: 'アクセシビリティ対応の強化',
        description: 'WCAG 2.1 AA準拠、キーボードナビゲーション、スクリーンリーダー対応',
        category: 'frontend',
        priority: 'high',
        estimatedHours: 20,
        status: 'todo',
        tags: ['accessibility', 'a11y', 'keyboard', 'screen-reader'],
        completionPercentage: 30,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-10',
        badgeCategory: 'accessibility',
        linkedBadges: ['accessibility-champion', 'inclusive-design-advocate'],
      },
      {
        id: 'fe-003',
        title: 'PWA機能の完全実装',
        description: 'オフライン対応、プッシュ通知、アプリインストール',
        category: 'frontend',
        priority: 'medium',
        estimatedHours: 24,
        status: 'in-progress',
        tags: ['pwa', 'offline', 'push-notifications', 'service-worker'],
        completionPercentage: 40,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-12',
        badgeCategory: 'pwa',
        linkedBadges: ['pwa-architect', 'offline-first-developer'],
      },

      // バックエンド
      {
        id: 'be-001',
        title: 'API認証システムの強化',
        description: 'JWT更新機能、OAuth2.0統合、セキュリティ強化',
        category: 'backend',
        priority: 'critical',
        estimatedHours: 32,
        status: 'in-progress',
        tags: ['auth', 'jwt', 'oauth', 'security'],
        completionPercentage: 60,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-14',
        badgeCategory: 'cybersecurity',
        linkedBadges: ['security-architect', 'authentication-expert'],
      },
      {
        id: 'be-002',
        title: 'リアルタイム通知システム',
        description: 'WebSocket実装、プッシュ通知API、通知管理',
        category: 'backend',
        priority: 'high',
        estimatedHours: 28,
        status: 'todo',
        tags: ['websocket', 'notifications', 'realtime'],
        completionPercentage: 0,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        badgeCategory: 'architecture',
        linkedBadges: ['real-time-architect', 'websocket-specialist'],
      },

      // テスト
      {
        id: 'test-001',
        title: '自動テストカバレッジ80%達成',
        description: 'ユニットテスト、統合テスト、E2Eテストの充実',
        category: 'testing',
        priority: 'high',
        estimatedHours: 40,
        status: 'in-progress',
        tags: ['unit-test', 'integration-test', 'e2e', 'coverage'],
        completionPercentage: 45,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-13',
        badgeCategory: 'testing',
        linkedBadges: ['quality-assurance-champion', 'test-automation-expert'],
      },

      // 最適化
      {
        id: 'opt-001',
        title: 'パフォーマンス最適化',
        description: 'バンドルサイズ削減、画像最適化、レンダリング高速化',
        category: 'optimization',
        priority: 'medium',
        estimatedHours: 16,
        status: 'todo',
        tags: ['performance', 'optimization', 'bundle-size', 'images'],
        completionPercentage: 20,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-08',
        badgeCategory: 'performance',
        linkedBadges: ['performance-optimizer', 'web-speed-specialist'],
      },

      // デプロイメント
      {
        id: 'deploy-001',
        title: 'CI/CDパイプライン完成',
        description: '自動デプロイ、テスト実行、品質チェック自動化',
        category: 'deployment',
        priority: 'high',
        estimatedHours: 24,
        status: 'in-progress',
        tags: ['ci-cd', 'automation', 'deployment'],
        completionPercentage: 80,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-16',
        badgeCategory: 'cicd',
        linkedBadges: ['devops-engineer', 'automation-architect'],
      },

      // ドキュメント
      {
        id: 'doc-001',
        title: 'API仕様書の完成',
        description: 'OpenAPI仕様、使用例、エラーハンドリング',
        category: 'documentation',
        priority: 'medium',
        estimatedHours: 12,
        status: 'todo',
        tags: ['api', 'documentation', 'openapi'],
        completionPercentage: 25,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-05',
        badgeCategory: 'documentation',
        linkedBadges: ['documentation-master', 'api-designer'],
      },

      // デザイン
      {
        id: 'design-001',
        title: 'ダークモード対応',
        description: '全コンポーネントのダークテーマ実装',
        category: 'design',
        priority: 'medium',
        estimatedHours: 20,
        status: 'todo',
        tags: ['dark-mode', 'theme', 'design-system'],
        completionPercentage: 10,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-03',
        badgeCategory: 'design',
        linkedBadges: ['ui-ux-designer', 'design-system-architect'],
      },
    ];
  }

  /**
   * 📊 サイト完成度メトリクス計算
   */
  getSiteCompletionMetrics(): SiteCompletionMetrics {
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter((task) => task.status === 'completed').length;
    const inProgressTasks = this.tasks.filter((task) => task.status === 'in-progress').length;
    const blockedTasks = this.tasks.filter((task) => task.status === 'blocked').length;
    const criticalTasks = this.tasks.filter(
      (task) => task.priority === 'critical' && task.status !== 'completed'
    ).length;

    const overallCompletion =
      this.tasks.reduce((sum, task) => sum + task.completionPercentage, 0) / totalTasks;

    const estimatedHoursRemaining = this.tasks
      .filter((task) => task.status !== 'completed')
      .reduce(
        (sum, task) => sum + (task.estimatedHours * (100 - task.completionPercentage)) / 100,
        0
      );

    return {
      overallCompletion: Math.round(overallCompletion),
      categoryBreakdown: {},
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      criticalTasksRemaining: criticalTasks,
      estimatedHoursRemaining: Math.round(estimatedHoursRemaining),
      nextMilestone: {
        name: 'ベータ版リリース',
        progress: 75,
        deadline: '2024-02-28',
      },
    };
  }

  /**
   * 🎯 優先タスク取得
   */
  getPriorityTasks(limit: number = 5): DevelopmentTask[] {
    return this.tasks
      .filter((task) => task.status !== 'completed')
      .sort((a, b) => {
        const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      })
      .slice(0, limit);
  }

  /**
   * 🚫 ブロックされたタスク取得
   */
  getBlockedTasks(): DevelopmentTask[] {
    return this.tasks.filter((task) => task.status === 'blocked');
  }

  /**
   * ⏰ 期限が近いタスク取得
   */
  getUpcomingDeadlines(): DevelopmentTask[] {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return this.tasks
      .filter((task) => {
        if (!task.dueDate || task.status === 'completed') return false;
        const dueDate = new Date(task.dueDate);
        return dueDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  }

  /**
   * 💡 開発者向けアドバイス生成
   */
  generateDevelopmentAdvice(): DevelopmentAdvice[] {
    const advice: DevelopmentAdvice[] = [];
    const metrics = this.getSiteCompletionMetrics();
    const priorityTasks = this.getPriorityTasks(3);
    const blockedTasks = this.getBlockedTasks();

    // 優先タスクのアドバイス
    if (priorityTasks.length > 0) {
      const topTask = priorityTasks[0];
      advice.push({
        id: 'advice-priority',
        type: 'task-suggestion',
        title: '優先度の高いタスクがあります',
        message: `「${topTask.title}」の完成を優先してください。${topTask.category}カテゴリで${topTask.priority}優先度です。`,
        urgency: topTask.priority === 'critical' ? 'high' : 'medium',
        actionable: true,
        relatedTasks: [topTask.id],
        timeEstimate: `${topTask.estimatedHours}時間`,
        character: 'manager',
      });
    }

    // ブロックされたタスクの警告
    if (blockedTasks.length > 0) {
      advice.push({
        id: 'advice-blocked',
        type: 'priority-alert',
        title: 'ブロックされたタスクがあります',
        message: `${blockedTasks.length}個のタスクがブロック状態です。依存関係を確認して解決してください。`,
        urgency: 'high',
        actionable: true,
        relatedTasks: blockedTasks.map((t) => t.id),
        character: 'manager',
      });
    }

    // 完成度に基づくアドバイス
    if (metrics.overallCompletion < 60) {
      advice.push({
        id: 'advice-completion',
        type: 'milestone-update',
        title: 'プロジェクト進捗確認',
        message: `現在の完成度は${metrics.overallCompletion}%です。ベータ版リリースに向けて開発を加速しましょう。`,
        urgency: 'medium',
        actionable: false,
        character: 'architect',
      });
    }

    // テストカバレッジのアドバイス
    const testingCompletion = metrics.categoryBreakdown.testing;
    if (testingCompletion < 70) {
      advice.push({
        id: 'advice-testing',
        type: 'technical-tip',
        title: 'テストカバレッジ向上',
        message: `テストの完成度が${testingCompletion}%です。品質向上のためテストを充実させることをお勧めします。`,
        urgency: 'medium',
        actionable: true,
        timeEstimate: '2-3時間',
        character: 'tester',
      });
    }

    // パフォーマンス最適化のアドバイス
    const optimizationCompletion = metrics.categoryBreakdown.optimization;
    if (optimizationCompletion < 50) {
      advice.push({
        id: 'advice-performance',
        type: 'technical-tip',
        title: 'パフォーマンス最適化',
        message:
          'サイトの読み込み速度向上のため、画像最適化とバンドルサイズ削減を検討してください。',
        urgency: 'low',
        actionable: true,
        timeEstimate: '4-6時間',
        character: 'architect',
      });
    }

    return advice;
  }

  /**
   * 📝 タスク更新（バッジ連携対応）
   */
  updateTaskProgress(
    taskId: string,
    completionPercentage: number,
    status?: DevelopmentTask['status']
  ): void {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      const oldProgress = task.completionPercentage;
      task.completionPercentage = Math.max(0, Math.min(100, completionPercentage));
      if (status) task.status = status;
      if (completionPercentage === 100) task.status = 'completed';
      task.updatedAt = new Date().toISOString();

      // バッジシステムとの連携
      if (this.badgeIntegrationEnabled) {
        this.syncTaskProgressWithBadges(task, oldProgress);
      }

      this.saveProgress();
    }
  }

  /**
   * ➕ 新しいタスク追加
   */
  addTask(task: Omit<DevelopmentTask, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newTask: DevelopmentTask = {
      ...task,
      id: `custom-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.push(newTask);
    this.saveProgress();
  }

  /**
   * 💾 進捗保存
   */
  private saveProgress(): void {
    localStorage.setItem(
      'dev-tasks-progress',
      JSON.stringify({
        tasks: this.tasks,
        completedFeatures: this.completedFeatures,
        lastUpdated: new Date().toISOString(),
      })
    );
  }

  /**
   * 📥 進捗読み込み
   */
  private loadProgress(): void {
    const saved = localStorage.getItem('dev-tasks-progress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.tasks) {
          // 既存タスクの進捗を更新
          data.tasks.forEach((savedTask: DevelopmentTask) => {
            const existingTask = this.tasks.find((t) => t.id === savedTask.id);
            if (existingTask) {
              existingTask.completionPercentage = savedTask.completionPercentage;
              existingTask.status = savedTask.status;
              existingTask.updatedAt = savedTask.updatedAt;
            }
          });
        }
        if (data.completedFeatures) {
          this.completedFeatures = data.completedFeatures;
        }
      } catch (error) {
        console.warn('開発タスク進捗の読み込みに失敗:', error);
      }
    }
  }

  /**
   * 📊 開発者ダッシュボードデータ取得
   */
  getDeveloperDashboardData() {
    const metrics = this.getSiteCompletionMetrics();
    const priorityTasks = this.getPriorityTasks();
    const advice = this.generateDevelopmentAdvice();
    const upcomingDeadlines = this.getUpcomingDeadlines();
    const badgeProgress = this.getBadgeIntegrationStatus();

    return {
      metrics,
      priorityTasks,
      advice,
      upcomingDeadlines,
      badgeProgress,
      recentlyCompleted: this.tasks
        .filter((task) => task.status === 'completed')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    };
  }

  // 🏆 バッジシステム統合メソッド

  /**
   * 🔗 タスク進捗とバッジシステムの同期
   */
  private async syncTaskProgressWithBadges(
    task: DevelopmentTask,
    oldProgress: number
  ): Promise<void> {
    if (!task.badgeCategory || !task.linkedBadges) return;

    try {
      // タスクの進捗増加分を計算
      const progressDelta = task.completionPercentage - oldProgress;

      // 完了時の特別処理
      if (task.status === 'completed' && oldProgress < 100) {
        // タスク完了をバッジシステムに記録
        await comprehensiveBadgeService.recordActivity(
          `タスク完了: ${task.title}`,
          task.badgeCategory,
          2.0, // 完了時は高い影響度
          {
            taskId: task.id,
            category: task.category,
            estimatedHours: task.estimatedHours,
            tags: task.tags,
            completionType: 'full',
          }
        );

        console.log(`🏆 バッジ進捗更新: ${task.title} 完了 (${task.badgeCategory})`);
      } else if (progressDelta > 0) {
        // 進捗更新をバッジシステムに記録
        const impactFactor = progressDelta / 100; // 進捗率に応じた影響度
        await comprehensiveBadgeService.recordActivity(
          `タスク進捗: ${task.title} (${progressDelta.toFixed(1)}%増加)`,
          task.badgeCategory,
          impactFactor,
          {
            taskId: task.id,
            progressDelta,
            currentProgress: task.completionPercentage,
            completionType: 'partial',
          }
        );
      }

      // 関連バッジの進捗確認
      this.checkBadgeCompletions(task);
    } catch (error) {
      console.error('バッジシステム連携エラー:', error);
    }
  }

  /**
   * 🎯 バッジ完成確認
   */
  private checkBadgeCompletions(task: DevelopmentTask): void {
    if (!task.linkedBadges) return;

    task.linkedBadges.forEach((badgeId) => {
      const badge = comprehensiveBadgeService.getBadge(badgeId);
      if (badge && !badge.isCompleted) {
        const progress = comprehensiveBadgeService.getBadgeProgress(badgeId);
        if (progress && progress.progressPercentage >= 100) {
          console.log(`🎉 バッジ完成: ${badge.name}`);
          // 完成通知やサウンドなどの処理をここに追加可能
        }
      }
    });
  }

  /**
   * 📈 バッジ統合状況取得
   */
  getBadgeIntegrationStatus() {
    if (!this.badgeIntegrationEnabled) {
      return {
        enabled: false,
        relatedBadges: [],
        overallBadgeProgress: 0,
      };
    }

    try {
      const allLinkedBadges = new Set<string>();
      let totalBadgeProgress = 0;
      let badgeCount = 0;

      // 全タスクから関連バッジを収集
      this.tasks.forEach((task) => {
        if (task.linkedBadges) {
          task.linkedBadges.forEach((badgeId) => allLinkedBadges.add(badgeId));
        }
      });

      // バッジ進捗を集計
      const badgeProgressData: Array<{
        badgeId: string;
        badgeName: string;
        progress: number;
        category: string;
        relatedTasks: string[];
      }> = [];

      allLinkedBadges.forEach((badgeId) => {
        const badge = comprehensiveBadgeService.getBadge(badgeId);
        const progress = comprehensiveBadgeService.getBadgeProgress(badgeId);

        if (badge && progress) {
          const relatedTasks = this.tasks
            .filter((task) => task.linkedBadges?.includes(badgeId))
            .map((task) => task.title);

          badgeProgressData.push({
            badgeId,
            badgeName: badge.name,
            progress: progress.progressPercentage,
            category: badge.category,
            relatedTasks,
          });

          totalBadgeProgress += progress.progressPercentage;
          badgeCount++;
        }
      });

      const overallBadgeProgress = badgeCount > 0 ? totalBadgeProgress / badgeCount : 0;

      return {
        enabled: true,
        relatedBadges: badgeProgressData,
        overallBadgeProgress: Math.round(overallBadgeProgress),
        totalBadges: badgeCount,
        completedBadges: badgeProgressData.filter((b) => b.progress >= 100).length,
      };
    } catch (error) {
      console.error('バッジ統合状況取得エラー:', error);
      return {
        enabled: false,
        error: 'バッジシステムとの通信に失敗しました',
        relatedBadges: [],
        overallBadgeProgress: 0,
      };
    }
  }

  /**
   * ⚙️ バッジ統合有効/無効切り替え
   */
  toggleBadgeIntegration(): boolean {
    this.badgeIntegrationEnabled = !this.badgeIntegrationEnabled;
    this.saveProgress();
    console.log(`🏆 バッジ統合: ${this.badgeIntegrationEnabled ? '有効' : '無効'}`);
    return this.badgeIntegrationEnabled;
  }

  /**
   * 🔍 バッジ関連タスク検索
   */
  getTasksByBadge(badgeId: string): DevelopmentTask[] {
    return this.tasks.filter((task) => task.linkedBadges?.includes(badgeId));
  }

  /**
   * 📊 カテゴリ別バッジ進捗
   */
  getBadgeProgressByCategory(): Record<
    string,
    {
      totalBadges: number;
      completedBadges: number;
      averageProgress: number;
      relatedTasks: number;
    }
  > {
    const categoryStats: Record<string, any> = {};

    this.tasks.forEach((task) => {
      if (task.badgeCategory && task.linkedBadges) {
        const category = task.badgeCategory;
        if (!categoryStats[category]) {
          categoryStats[category] = {
            totalBadges: 0,
            completedBadges: 0,
            totalProgress: 0,
            relatedTasks: 0,
          };
        }

        categoryStats[category].relatedTasks++;

        task.linkedBadges.forEach((badgeId) => {
          const progress = comprehensiveBadgeService.getBadgeProgress(badgeId);
          if (progress) {
            categoryStats[category].totalBadges++;
            categoryStats[category].totalProgress += progress.progressPercentage;
            if (progress.progressPercentage >= 100) {
              categoryStats[category].completedBadges++;
            }
          }
        });
      }
    });

    // 平均進捗率を計算
    Object.keys(categoryStats).forEach((category) => {
      const stats = categoryStats[category];
      stats.averageProgress =
        stats.totalBadges > 0 ? Math.round(stats.totalProgress / stats.totalBadges) : 0;
      delete stats.totalProgress; // 内部計算用フィールドを削除
    });

    return categoryStats;
  }
}

export const developmentTaskService = new DevelopmentTaskService();
