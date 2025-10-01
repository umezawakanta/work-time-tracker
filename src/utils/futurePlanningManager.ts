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

  private loadFromLocalStorage(): void {
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

  public deletePlan(id: string): boolean {
    const index = this.plans.findIndex(plan => plan._id === id);
    if (index === -1) return false;

    this.plans.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  public getPlans(): Plan[] {
    return [...this.plans];
  }

  public getPlansByStatus(status: string): Plan[] {
    return this.plans.filter(plan => plan.status === status);
  }

  public getPlansByCategory(category: string): Plan[] {
    return this.plans.filter(plan => plan.category === category);
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

  public getSchedules(): Schedule[] {
    return [...this.schedules];
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

  public getBudgetPlans(): BudgetPlan[] {
    return [...this.budgetPlans];
  }

  public getActiveBudgetPlans(): BudgetPlan[] {
    return this.budgetPlans.filter(plan => plan.isActive);
  }

  // 統計情報
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