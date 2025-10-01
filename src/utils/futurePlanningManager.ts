// 将来計画管理マネージャー

import { 
  FuturePlan, 
  PlanCategory, 
  PlanStatus, 
  PlanPriority, 
  PlanProgress, 
  PlanMilestone,
  PlanAlert,
  PlanAnalysis,
  PlanRecommendation
} from '../types/futurePlanning';

export class FuturePlanningManager {
  private static instance: FuturePlanningManager;
  private plans: FuturePlan[] = [];
  private alerts: PlanAlert[] = [];

  public static getInstance(): FuturePlanningManager {
    if (!FuturePlanningManager.instance) {
      FuturePlanningManager.instance = new FuturePlanningManager();
    }
    return FuturePlanningManager.instance;
  }

  // ローカルストレージからデータを読み込み
  public loadFromLocalStorage(): void {
    try {
      const plansData = localStorage.getItem('futurePlanning_plans');
      if (plansData) {
        this.plans = JSON.parse(plansData).map((plan: any) => ({
          ...plan,
          createdAt: new Date(plan.createdAt),
          updatedAt: new Date(plan.updatedAt),
          startDate: new Date(plan.startDate),
          targetDate: new Date(plan.targetDate),
          milestones: plan.milestones.map((milestone: any) => ({
            ...milestone,
            targetDate: new Date(milestone.targetDate),
            completedAt: milestone.completedAt ? new Date(milestone.completedAt) : undefined
          }))
        }));
      }

      const alertsData = localStorage.getItem('futurePlanning_alerts');
      if (alertsData) {
        this.alerts = JSON.parse(alertsData).map((alert: any) => ({
          ...alert,
          createdAt: new Date(alert.createdAt)
        }));
      }
    } catch (error) {
      console.error('将来計画データの読み込みエラー:', error);
    }
  }

  // ローカルストレージにデータを保存
  public saveToLocalStorage(): void {
    try {
      localStorage.setItem('futurePlanning_plans', JSON.stringify(this.plans));
      localStorage.setItem('futurePlanning_alerts', JSON.stringify(this.alerts));
    } catch (error) {
      console.error('将来計画データの保存エラー:', error);
    }
  }

  // 計画を追加
  public addPlan(plan: Omit<FuturePlan, 'id' | 'createdAt' | 'updatedAt' | 'progress'>): FuturePlan {
    const newPlan: FuturePlan = {
      ...plan,
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      progress: this.calculateInitialProgress(plan)
    };

    this.plans.push(newPlan);
    this.saveToLocalStorage();
    this.generateAlerts(plan.userId);
    return newPlan;
  }

  // 計画を更新
  public updatePlan(id: string, updates: Partial<FuturePlan>): FuturePlan | null {
    const index = this.plans.findIndex(plan => plan.id === id);
    if (index === -1) return null;

    this.plans[index] = {
      ...this.plans[index],
      ...updates,
      updatedAt: new Date(),
      progress: this.calculateProgress(this.plans[index])
    };

    this.saveToLocalStorage();
    this.generateAlerts(this.plans[index].userId);
    return this.plans[index];
  }

  // 計画を削除
  public deletePlan(id: string): boolean {
    const index = this.plans.findIndex(plan => plan.id === id);
    if (index === -1) return false;

    this.plans.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  // ユーザーの計画を取得
  public getPlans(userId: string, filters?: {
    category?: PlanCategory;
    status?: PlanStatus;
    priority?: PlanPriority;
    startDate?: Date;
    endDate?: Date;
  }): FuturePlan[] {
    let plans = this.plans.filter(plan => plan.userId === userId);

    if (filters) {
      if (filters.category) {
        plans = plans.filter(plan => plan.category === filters.category);
      }
      if (filters.status) {
        plans = plans.filter(plan => plan.status === filters.status);
      }
      if (filters.priority) {
        plans = plans.filter(plan => plan.priority === filters.priority);
      }
      if (filters.startDate) {
        plans = plans.filter(plan => plan.startDate >= filters.startDate!);
      }
      if (filters.endDate) {
        plans = plans.filter(plan => plan.targetDate <= filters.endDate!);
      }
    }

    return plans.sort((a, b) => a.priority - b.priority || a.targetDate.getTime() - b.targetDate.getTime());
  }

  // 計画の進捗を更新
  public updatePlanProgress(planId: string, progress: number): FuturePlan | null {
    const plan = this.plans.find(p => p.id === planId);
    if (!plan) return null;

    plan.progress = Math.min(Math.max(progress, 0), 100);
    plan.updatedAt = new Date();

    // 進捗に基づいてステータスを更新
    if (plan.progress === 100) {
      plan.status = 'completed';
    } else if (plan.progress > 0) {
      plan.status = 'in_progress';
    }

    this.saveToLocalStorage();
    this.generateAlerts(plan.userId);
    return plan;
  }

  // マイルストーンを完了
  public completeMilestone(planId: string, milestoneId: string): FuturePlan | null {
    const plan = this.plans.find(p => p.id === planId);
    if (!plan) return null;

    const milestone = plan.milestones.find(m => m.id === milestoneId);
    if (!milestone) return null;

    milestone.isCompleted = true;
    milestone.completedAt = new Date();
    plan.updatedAt = new Date();
    plan.progress = this.calculateProgress(plan);

    this.saveToLocalStorage();
    this.generateAlerts(plan.userId);
    return plan;
  }

  // 計画分析を生成
  public generatePlanAnalysis(userId: string): PlanAnalysis {
    const userPlans = this.getPlans(userId);
    const now = new Date();

    // カテゴリ別の統計
    const categoryStats = this.calculateCategoryStats(userPlans);
    
    // ステータス別の統計
    const statusStats = this.calculateStatusStats(userPlans);
    
    // 優先度別の統計
    const priorityStats = this.calculatePriorityStats(userPlans);
    
    // 進捗率の統計
    const progressStats = this.calculateProgressStats(userPlans);
    
    // 期限切れの計画
    const overduePlans = userPlans.filter(plan => 
      plan.status !== 'completed' && plan.targetDate < now
    );
    
    // 今月の計画
    const thisMonthPlans = userPlans.filter(plan => {
      const planDate = new Date(plan.targetDate);
      return planDate.getMonth() === now.getMonth() && 
             planDate.getFullYear() === now.getFullYear();
    });
    
    // 完了率の計算
    const completionRate = userPlans.length > 0 
      ? (userPlans.filter(p => p.status === 'completed').length / userPlans.length) * 100 
      : 0;
    
    // 平均進捗率の計算
    const averageProgress = userPlans.length > 0
      ? userPlans.reduce((sum, plan) => sum + plan.progress, 0) / userPlans.length
      : 0;

    return {
      totalPlans: userPlans.length,
      completedPlans: userPlans.filter(p => p.status === 'completed').length,
      inProgressPlans: userPlans.filter(p => p.status === 'in_progress').length,
      overduePlans: overduePlans.length,
      thisMonthPlans: thisMonthPlans.length,
      categoryStats,
      statusStats,
      priorityStats,
      progressStats,
      completionRate,
      averageProgress,
      lastUpdated: new Date()
    };
  }

  // カテゴリ別統計を計算
  private calculateCategoryStats(plans: FuturePlan[]): { [category: string]: { count: number; completed: number; averageProgress: number } } {
    const stats: { [category: string]: { count: number; completed: number; averageProgress: number } } = {};

    plans.forEach(plan => {
      if (!stats[plan.category]) {
        stats[plan.category] = { count: 0, completed: 0, averageProgress: 0 };
      }
      stats[plan.category].count++;
      if (plan.status === 'completed') {
        stats[plan.category].completed++;
      }
    });

    // 平均進捗率を計算
    Object.keys(stats).forEach(category => {
      const categoryPlans = plans.filter(p => p.category === category);
      if (categoryPlans.length > 0) {
        stats[category].averageProgress = categoryPlans.reduce((sum, p) => sum + p.progress, 0) / categoryPlans.length;
      }
    });

    return stats;
  }

  // ステータス別統計を計算
  private calculateStatusStats(plans: FuturePlan[]): { [status: string]: number } {
    const stats: { [status: string]: number } = {};

    plans.forEach(plan => {
      stats[plan.status] = (stats[plan.status] || 0) + 1;
    });

    return stats;
  }

  // 優先度別統計を計算
  private calculatePriorityStats(plans: FuturePlan[]): { [priority: string]: number } {
    const stats: { [priority: string]: number } = {};

    plans.forEach(plan => {
      stats[plan.priority.toString()] = (stats[plan.priority.toString()] || 0) + 1;
    });

    return stats;
  }

  // 進捗率統計を計算
  private calculateProgressStats(plans: FuturePlan[]): {
    notStarted: number;
    inProgress: number;
    almostComplete: number;
    completed: number;
  } {
    return {
      notStarted: plans.filter(p => p.progress === 0).length,
      inProgress: plans.filter(p => p.progress > 0 && p.progress < 90).length,
      almostComplete: plans.filter(p => p.progress >= 90 && p.progress < 100).length,
      completed: plans.filter(p => p.progress === 100).length
    };
  }

  // 初期進捗を計算
  private calculateInitialProgress(plan: Omit<FuturePlan, 'id' | 'createdAt' | 'updatedAt' | 'progress'>): number {
    if (plan.milestones.length === 0) return 0;
    
    const completedMilestones = plan.milestones.filter(m => m.isCompleted).length;
    return (completedMilestones / plan.milestones.length) * 100;
  }

  // 進捗を計算
  private calculateProgress(plan: FuturePlan): number {
    if (plan.milestones.length === 0) return 0;
    
    const completedMilestones = plan.milestones.filter(m => m.isCompleted).length;
    return (completedMilestones / plan.milestones.length) * 100;
  }

  // 推奨事項を生成
  public generateRecommendations(userId: string): PlanRecommendation[] {
    const analysis = this.generatePlanAnalysis(userId);
    const recommendations: PlanRecommendation[] = [];

    // 完了率が低い場合の推奨
    if (analysis.completionRate < 50) {
      recommendations.push({
        type: 'completion_rate',
        title: '計画の完了率を向上させましょう',
        description: `現在の完了率は${analysis.completionRate.toFixed(1)}%です。`,
        priority: 'high',
        suggestions: [
          '計画をより小さなタスクに分割してください',
          '現実的な期限を設定してください',
          '優先度の高い計画に集中してください'
        ]
      });
    }

    // 期限切れの計画がある場合の推奨
    if (analysis.overduePlans > 0) {
      recommendations.push({
        type: 'overdue_plans',
        title: '期限切れの計画があります',
        description: `${analysis.overduePlans}件の計画が期限を過ぎています。`,
        priority: 'high',
        suggestions: [
          '期限切れの計画を確認し、更新または削除してください',
          '今後の計画でより現実的な期限を設定してください'
        ]
      });
    }

    // 平均進捗率が低い場合の推奨
    if (analysis.averageProgress < 30) {
      recommendations.push({
        type: 'low_progress',
        title: '計画の進捗が遅れています',
        description: `平均進捗率は${analysis.averageProgress.toFixed(1)}%です。`,
        priority: 'medium',
        suggestions: [
          '計画をより具体的なマイルストーンに分割してください',
          '定期的に進捗を確認し、必要に応じて計画を調整してください'
        ]
      });
    }

    // 今月の計画が多い場合の推奨
    if (analysis.thisMonthPlans > 5) {
      recommendations.push({
        type: 'too_many_plans',
        title: '今月の計画が多すぎます',
        description: `今月は${analysis.thisMonthPlans}件の計画があります。`,
        priority: 'medium',
        suggestions: [
          '計画の優先度を見直してください',
          '一部の計画を来月以降に延期することを検討してください'
        ]
      });
    }

    return recommendations;
  }

  // アラートを生成
  private generateAlerts(userId: string): void {
    const userPlans = this.getPlans(userId);
    const now = new Date();
    
    // 既存のアラートをクリア
    this.alerts = this.alerts.filter(alert => alert.userId !== userId);

    // 期限切れの計画のアラート
    const overduePlans = userPlans.filter(plan => 
      plan.status !== 'completed' && plan.targetDate < now
    );

    overduePlans.forEach(plan => {
      this.alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'overdue',
        severity: 'high',
        title: '計画の期限が過ぎています',
        message: `「${plan.title}」の期限が過ぎています。`,
        planId: plan.id,
        userId,
        createdAt: new Date(),
        isRead: false
      });
    });

    // 期限が近い計画のアラート（3日以内）
    const upcomingPlans = userPlans.filter(plan => {
      const daysUntilDeadline = Math.ceil((plan.targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return plan.status !== 'completed' && daysUntilDeadline <= 3 && daysUntilDeadline > 0;
    });

    upcomingPlans.forEach(plan => {
      this.alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'deadline_approaching',
        severity: 'medium',
        title: '計画の期限が近づいています',
        message: `「${plan.title}」の期限が近づいています。`,
        planId: plan.id,
        userId,
        createdAt: new Date(),
        isRead: false
      });
    });

    // 完了した計画のアラート
    const completedPlans = userPlans.filter(plan => 
      plan.status === 'completed' && 
      plan.updatedAt.getTime() > (now.getTime() - 24 * 60 * 60 * 1000) // 24時間以内に完了
    );

    completedPlans.forEach(plan => {
      this.alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'plan_completed',
        severity: 'low',
        title: '計画が完了しました',
        message: `「${plan.title}」が完了しました。おめでとうございます！`,
        planId: plan.id,
        userId,
        createdAt: new Date(),
        isRead: false
      });
    });

    this.saveToLocalStorage();
  }

  // ユーザーのアラートを取得
  public getAlerts(userId: string): PlanAlert[] {
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

  // 計画の検索
  public searchPlans(userId: string, query: string): FuturePlan[] {
    const userPlans = this.getPlans(userId);
    const lowercaseQuery = query.toLowerCase();

    return userPlans.filter(plan => 
      plan.title.toLowerCase().includes(lowercaseQuery) ||
      plan.description?.toLowerCase().includes(lowercaseQuery) ||
      plan.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  // 計画の統計情報を取得
  public getPlanStatistics(userId: string): {
    totalPlans: number;
    completedPlans: number;
    inProgressPlans: number;
    overduePlans: number;
    averageProgress: number;
    completionRate: number;
  } {
    const analysis = this.generatePlanAnalysis(userId);
    
    return {
      totalPlans: analysis.totalPlans,
      completedPlans: analysis.completedPlans,
      inProgressPlans: analysis.inProgressPlans,
      overduePlans: analysis.overduePlans,
      averageProgress: analysis.averageProgress,
      completionRate: analysis.completionRate
    };
  }
}
