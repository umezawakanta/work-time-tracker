import { TodoItem } from '@/types';

export interface DashboardMetrics {
  productivity: {
    completionRate: number;
    averageTasksPerDay: number;
    streak: number;
    trend: 'up' | 'down' | 'stable';
  };
  timeManagement: {
    totalHoursWorked: number;
    averageTaskDuration: number;
    overTimeRate: number;
    efficientHours: number[];
  };
  taskAnalysis: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    highPriorityTasks: number;
    categoryDistribution: Record<string, number>;
  };
  teamMetrics?: {
    totalMembers: number;
    activeMembers: number;
    collaborationScore: number;
    avgResponseTime: number;
  };
}

export interface BurndownData {
  date: string;
  remaining: number;
  ideal: number;
  actual: number;
}

export interface ProductivityTrend {
  date: string;
  completedTasks: number;
  hoursWorked: number;
  efficiency: number;
}

class DashboardService {
  async getMetrics(userId: string, dateRange: { from: Date; to: Date }): Promise<DashboardMetrics> {
    try {
      // 実際の環境ではAPIから取得
      if (process.env.NODE_ENV === 'development') {
        return this.getMockMetrics();
      }

      const response = await fetch(
        `/api/dashboard/metrics?userId=${userId}&from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      return await response.json();
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
      return this.getMockMetrics();
    }
  }

  async getBurndownData(projectId: string): Promise<BurndownData[]> {
    try {
      // 実際の環境ではAPIから取得
      if (process.env.NODE_ENV === 'development') {
        return this.getMockBurndownData();
      }

      const response = await fetch(`/api/projects/${projectId}/burndown`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to load burndown data:', error);
      return this.getMockBurndownData();
    }
  }

  async getProductivityTrend(userId: string, days: number = 30): Promise<ProductivityTrend[]> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return this.getMockProductivityTrend(days);
      }

      const response = await fetch(
        `/api/dashboard/productivity-trend?userId=${userId}&days=${days}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      return await response.json();
    } catch (error) {
      console.error('Failed to load productivity trend:', error);
      return this.getMockProductivityTrend(days);
    }
  }

  private getMockMetrics(): DashboardMetrics {
    return {
      productivity: {
        completionRate: 78,
        averageTasksPerDay: 5.2,
        streak: 7,
        trend: 'up',
      },
      timeManagement: {
        totalHoursWorked: 42.5,
        averageTaskDuration: 65,
        overTimeRate: 0.15,
        efficientHours: [9, 10, 11, 14, 15, 16],
      },
      taskAnalysis: {
        totalTasks: 125,
        completedTasks: 98,
        overdueTasks: 8,
        highPriorityTasks: 15,
        categoryDistribution: {
          開発: 45,
          会議: 20,
          調査: 25,
          その他: 10,
        },
      },
      teamMetrics: {
        totalMembers: 8,
        activeMembers: 6,
        collaborationScore: 85,
        avgResponseTime: 2.5,
      },
    };
  }

  private getMockBurndownData(): BurndownData[] {
    const data: BurndownData[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 14);

    for (let i = 0; i < 15; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      data.push({
        date: date.toISOString().split('T')[0],
        remaining: Math.max(0, 50 - i * 3 - Math.random() * 5),
        ideal: 50 - (i * 50) / 14,
        actual: Math.max(0, 50 - i * 3.2),
      });
    }

    return data;
  }

  private getMockProductivityTrend(days: number): ProductivityTrend[] {
    const data: ProductivityTrend[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const completedTasks = Math.floor(Math.random() * 8) + 2;
      const hoursWorked = Math.random() * 4 + 6;

      data.push({
        date: date.toISOString().split('T')[0],
        completedTasks,
        hoursWorked,
        efficiency: Math.round((completedTasks / hoursWorked) * 100) / 100,
      });
    }

    return data;
  }
}

export const dashboardService = new DashboardService();
