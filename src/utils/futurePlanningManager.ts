import type { Plan, Schedule, BudgetPlan } from '../types';

class FuturePlanningManager {
  private static instance: FuturePlanningManager;
  private plans: Plan[] = [];
  private schedules: Schedule[] = [];
  private budgetPlans: BudgetPlan[] = [];

  private constructor() {
    this.loadFromLocalStorage();
  }

  public static getInstance(): FuturePlanningManager {
    if (!FuturePlanningManager.instance) {
      FuturePlanningManager.instance = new FuturePlanningManager();
    }
    return FuturePlanningManager.instance;
  }

  public loadFromLocalStorage(): void {
    try {
      const storedPlans = localStorage.getItem('plans');
      if (storedPlans) {
        this.plans = JSON.parse(storedPlans);
      }
      const storedSchedules = localStorage.getItem('schedules');
      if (storedSchedules) {
        this.schedules = JSON.parse(storedSchedules);
      }
      const storedBudgetPlans = localStorage.getItem('budget-plans');
      if (storedBudgetPlans) {
        this.budgetPlans = JSON.parse(storedBudgetPlans);
      }
    } catch (error) {
      console.error('Failed to load future planning data from localStorage:', error);
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('plans', JSON.stringify(this.plans));
      localStorage.setItem('schedules', JSON.stringify(this.schedules));
      localStorage.setItem('budget-plans', JSON.stringify(this.budgetPlans));
    } catch (error) {
      console.error('Failed to save future planning data to localStorage:', error);
    }
  }

  // 計画管理
  public addPlan(plan: Omit<Plan, '_id' | 'createdAt' | 'updatedAt'>): Plan {
    const newPlan: Plan = {
      ...plan,
      _id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.plans.push(newPlan);
    this.saveToLocalStorage();
    return newPlan;
  }

  public updatePlan(id: string, updates: Partial<Plan>): Plan | null {
    const index = this.plans.findIndex(plan => plan._id === id);
    if (index === -1) return null;

    this.plans[index] = {
      ...this.plans[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToLocalStorage();
    return this.plans[index];
  }

  public completePlan(id: string): Plan | null {
    const plan = this.plans.find(plan => plan._id === id);
    if (!plan) return null;

    return this.updatePlan(id, {
      status: 'completed',
      completedDate: new Date().toISOString(),
      progress: 100
    });
  }

  public deletePlan(id: string): boolean {
    const index = this.plans.findIndex(plan => plan._id === id);
    if (index === -1) return false;

    this.plans.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  public getPlans(userId?: string): Plan[] {
    if (userId) {
      return this.plans.filter(plan => plan.userId === userId);
    }
    return [...this.plans];
  }

  public getPlansByStatus(status: string): Plan[] {
    return this.plans.filter(plan => plan.status === status);
  }

  public getPlansByCategory(category: string): Plan[] {
    return this.plans.filter(plan => plan.category === category);
  }

  public getSchedules(userId?: string): Schedule[] {
    if (userId) {
      return this.schedules.filter(schedule => schedule.userId === userId);
    }
    return [...this.schedules];
  }

  // スケジュール管理
  public addSchedule(schedule: Omit<Schedule, '_id' | 'createdAt' | 'updatedAt'>): Schedule {
    const newSchedule: Schedule = {
      ...schedule,
      _id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.schedules.push(newSchedule);
    this.saveToLocalStorage();
    return newSchedule;
  }

  public updateSchedule(id: string, updates: Partial<Schedule>): Schedule | null {
    const index = this.schedules.findIndex(schedule => schedule._id === id);
    if (index === -1) return null;

    this.schedules[index] = {
      ...this.schedules[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToLocalStorage();
    return this.schedules[index];
  }

  public deleteSchedule(id: string): boolean {
    const index = this.schedules.findIndex(schedule => schedule._id === id);
    if (index === -1) return false;

    this.schedules.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  public getSchedulesByDate(date: Date): Schedule[] {
    const targetDate = date.toISOString().split('T')[0];
    return this.schedules.filter(schedule => 
      schedule.startTime.startsWith(targetDate)
    );
  }

  public getUpcomingSchedules(days: number = 7): Schedule[] {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return this.schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.startTime);
      return scheduleDate >= now && scheduleDate <= futureDate;
    });
  }

  // 予算計画管理
  public addBudgetPlan(budgetPlan: Omit<BudgetPlan, '_id' | 'createdAt' | 'updatedAt'>): BudgetPlan {
    const newBudgetPlan: BudgetPlan = {
      ...budgetPlan,
      _id: `budget_plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.budgetPlans.push(newBudgetPlan);
    this.saveToLocalStorage();
    return newBudgetPlan;
  }

  public updateBudgetPlan(id: string, updates: Partial<BudgetPlan>): BudgetPlan | null {
    const index = this.budgetPlans.findIndex(budgetPlan => budgetPlan._id === id);
    if (index === -1) return null;

    this.budgetPlans[index] = {
      ...this.budgetPlans[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToLocalStorage();
    return this.budgetPlans[index];
  }

  public deleteBudgetPlan(id: string): boolean {
    const index = this.budgetPlans.findIndex(budgetPlan => budgetPlan._id === id);
    if (index === -1) return false;

    this.budgetPlans.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  public getBudgetPlans(userId?: string): BudgetPlan[] {
    if (userId) {
      return this.budgetPlans.filter(plan => plan.userId === userId);
    }
    return [...this.budgetPlans];
  }

  public getActiveBudgetPlans(): BudgetPlan[] {
    return this.budgetPlans.filter(plan => plan.isActive);
  }

  // 統計情報
  public generatePlanAnalysis(userId?: string): PlanAnalysis {
    const userPlans = userId ? this.plans.filter(plan => plan.userId === userId) : this.plans;
    const totalPlans = userPlans.length;
    const completedPlans = userPlans.filter(plan => plan.status === 'completed').length;
    const inProgressPlans = userPlans.filter(plan => plan.status === 'in_progress').length;
    const overduePlans = userPlans.filter(plan => 
      plan.status === 'in_progress' && new Date(plan.targetDate) < new Date()
    ).length;
    const thisMonthPlans = userPlans.filter(plan => {
      const planDate = new Date(plan.startDate);
      const now = new Date();
      return planDate.getMonth() === now.getMonth() && planDate.getFullYear() === now.getFullYear();
    }).length;

    const categoryStats: { [category: string]: { count: number; completed: number; averageProgress: number } } = {};
    userPlans.forEach(plan => {
      if (!categoryStats[plan.category]) {
        categoryStats[plan.category] = { count: 0, completed: 0, averageProgress: 0 };
      }
      categoryStats[plan.category].count++;
      if (plan.status === 'completed') {
        categoryStats[plan.category].completed++;
      }
      categoryStats[plan.category].averageProgress += plan.progress;
    });

    Object.keys(categoryStats).forEach(category => {
      const stats = categoryStats[category];
      stats.averageProgress = stats.count > 0 ? stats.averageProgress / stats.count : 0;
    });

    const statusStats: { [status: string]: number } = {};
    userPlans.forEach(plan => {
      statusStats[plan.status] = (statusStats[plan.status] || 0) + 1;
    });

    const priorityStats: { [priority: string]: number } = {};
    userPlans.forEach(plan => {
      priorityStats[plan.priority] = (priorityStats[plan.priority] || 0) + 1;
    });

    return {
      totalPlans,
      completedPlans,
      inProgressPlans,
      overduePlans,
      thisMonthPlans,
      categoryStats,
      statusStats,
      priorityStats,
      progressStats: {
        notStarted: statusStats['not-started'] || 0,
        inProgress: statusStats['in_progress'] || 0,
        completed: statusStats['completed'] || 0,
        paused: statusStats['paused'] || 0
      },
      completionRate: totalPlans > 0 ? (completedPlans / totalPlans) * 100 : 0,
      averageProgress: totalPlans > 0 ? userPlans.reduce((sum, plan) => sum + plan.progress, 0) / totalPlans : 0,
      lastUpdated: new Date()
    };
  }

  public generateRecommendations(userId?: string): PlanRecommendation[] {
    const userPlans = userId ? this.plans.filter(plan => plan.userId === userId) : this.plans;
    const recommendations: PlanRecommendation[] = [];

    const completedPlans = userPlans.filter(plan => plan.status === 'completed').length;
    const totalPlans = userPlans.length;
    const completionRate = totalPlans > 0 ? (completedPlans / totalPlans) * 100 : 0;

    if (completionRate < 50) {
      recommendations.push({
        type: 'completion_rate',
        title: '完了率が低いです',
        description: `現在の完了率は${completionRate.toFixed(1)}%です。計画の見直しを検討してください。`,
        priority: 'high',
        suggestions: [
          '計画をより小さなタスクに分割する',
          '現実的な期限を設定する',
          '優先度の低い計画を一時停止する'
        ]
      });
    }

    const overduePlans = userPlans.filter(plan => 
      plan.status === 'in_progress' && new Date(plan.targetDate) < new Date()
    );
    if (overduePlans.length > 0) {
      recommendations.push({
        type: 'overdue_plans',
        title: '期限切れの計画があります',
        description: `${overduePlans.length}個の計画が期限を過ぎています。`,
        priority: 'high',
        suggestions: [
          '期限を延長する',
          '計画を完了させる',
          '計画をキャンセルする'
        ]
      });
    }

    const lowProgressPlans = userPlans.filter(plan => 
      plan.status === 'in_progress' && plan.progress < 25
    );
    if (lowProgressPlans.length > 0) {
      recommendations.push({
        type: 'low_progress',
        title: '進捗が低い計画があります',
        description: `${lowProgressPlans.length}個の計画の進捗が25%未満です。`,
        priority: 'medium',
        suggestions: [
          '計画を再評価する',
          'より具体的なアクションプランを作成する',
          'サポートを求める'
        ]
      });
    }

    if (totalPlans > 10) {
      recommendations.push({
        type: 'too_many_plans',
        title: '計画が多すぎます',
        description: `現在${totalPlans}個の計画があります。集中力を高めるため、計画数を減らすことを検討してください。`,
        priority: 'medium',
        suggestions: [
          '優先度の低い計画を一時停止する',
          '計画を統合する',
          '完了した計画を整理する'
        ]
      });
    }

    return recommendations;
  }

  public getStatistics(): {
    totalPlans: number;
    completedPlans: number;
    inProgressPlans: number;
    upcomingSchedules: number;
    activeBudgetPlans: number;
    completionRate: number;
  } {
    const totalPlans = this.plans.length;
    const completedPlans = this.plans.filter(plan => plan.status === 'completed').length;
    const inProgressPlans = this.plans.filter(plan => plan.status === 'in_progress').length;
    const upcomingSchedules = this.getUpcomingSchedules().length;
    const activeBudgetPlans = this.getActiveBudgetPlans().length;
    const completionRate = totalPlans > 0 ? (completedPlans / totalPlans) * 100 : 0;

    return {
      totalPlans,
      completedPlans,
      inProgressPlans,
      upcomingSchedules,
      activeBudgetPlans,
      completionRate,
    };
  }

  public clearData(): void {
    this.plans = [];
    this.schedules = [];
    this.budgetPlans = [];
    this.saveToLocalStorage();
  }
}

export { FuturePlanningManager };
export const futurePlanningManager = FuturePlanningManager.getInstance();