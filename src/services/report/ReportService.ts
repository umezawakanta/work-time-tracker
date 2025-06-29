// src/services/report/ReportService.ts
import { Todo, TodoStats } from '@/types/todo';
import TodoService from '@/services/data/TodoService';

export interface ProductivityReport {
  period: {
    start: string;
    end: string;
  };
  overview: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    averageTasksPerDay: number;
    mostProductiveDay: string;
    mostProductiveHour: number;
  };
  efficiency: {
    averageCompletionTime: number;
    fastestTask: Todo | null;
    slowestTask: Todo | null;
    timePerCategory: Record<string, number>;
  };
  patterns: {
    dailyPattern: Array<{ hour: number; count: number }>;
    weeklyPattern: Array<{ day: string; count: number }>;
    monthlyPattern: Array<{ week: number; count: number }>;
  };
  insights: string[];
  recommendations: string[];
}

export interface TeamReport {
  teamId: string;
  period: {
    start: string;
    end: string;
  };
  members: Array<{
    userId: string;
    name: string;
    stats: TodoStats;
    contribution: number;
  }>;
  teamStats: {
    totalTasks: number;
    completedTasks: number;
    averageCompletionRate: number;
    topPerformer: string;
  };
}

class ReportService {
  async generateProductivityReport(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ProductivityReport> {
    const todos = await TodoService.getTodos(userId);
    const filteredTodos = this.filterTodosByDateRange(todos, startDate, endDate);
    const completedTodos = filteredTodos.filter((t) => t.completed);

    const overview = this.calculateOverview(filteredTodos, startDate, endDate);
    const efficiency = this.calculateEfficiency(completedTodos);
    const patterns = this.analyzePatterns(completedTodos);
    const insights = this.generateInsights(filteredTodos, patterns);
    const recommendations = this.generateRecommendations(insights, patterns);

    return {
      period: { start: startDate, end: endDate },
      overview,
      efficiency,
      patterns,
      insights,
      recommendations,
    };
  }

  async generateWeeklyReport(userId: string): Promise<ProductivityReport> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    return this.generateProductivityReport(userId, startDate.toISOString(), endDate.toISOString());
  }

  async generateMonthlyReport(userId: string): Promise<ProductivityReport> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    return this.generateProductivityReport(userId, startDate.toISOString(), endDate.toISOString());
  }

  async exportReportAsPDF(report: ProductivityReport): Promise<Blob> {
    // PDF生成の基本的な実装
    const content = this.generatePDFContent(report);
    return new Blob([content], { type: 'application/pdf' });
  }

  async exportReportAsCSV(report: ProductivityReport): Promise<Blob> {
    const csv = this.convertReportToCSV(report);
    return new Blob([csv], { type: 'text/csv' });
  }

  private generatePDFContent(report: ProductivityReport): string {
    // 簡易的なPDF内容生成（実際の実装では jsPDF などを使用）
    let content = `生産性レポート\n`;
    content += `期間: ${report.period.start} - ${report.period.end}\n\n`;
    content += `総タスク数: ${report.overview.totalTasks}\n`;
    content += `完了タスク数: ${report.overview.completedTasks}\n`;
    content += `完了率: ${report.overview.completionRate.toFixed(1)}%\n`;
    return content;
  }

  private filterTodosByDateRange(todos: Todo[], startDate: string, endDate: string): Todo[] {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return todos.filter((todo) => {
      const todoDate = new Date(todo.createdAt);
      return todoDate >= start && todoDate <= end;
    });
  }

  private calculateOverview(todos: Todo[], startDate: string, endDate: string) {
    const completed = todos.filter((t) => t.completed);
    const daysDiff = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    const dayStats = this.groupTodosByDay(completed);
    const mostProductiveDay = Object.entries(dayStats).sort(([, a], [, b]) => b - a)[0]?.[0] || '';

    const hourStats = this.groupTodosByHour(completed);
    const mostProductiveHour =
      Object.entries(hourStats).sort(([, a], [, b]) => b - a)[0]?.[0] || '0';

    return {
      totalTasks: todos.length,
      completedTasks: completed.length,
      completionRate: todos.length > 0 ? (completed.length / todos.length) * 100 : 0,
      averageTasksPerDay: completed.length / daysDiff,
      mostProductiveDay,
      mostProductiveHour: parseInt(mostProductiveHour),
    };
  }

  private calculateEfficiency(completedTodos: Todo[]) {
    const tasksWithTime = completedTodos.filter((t) => t.efficiency?.completionTime);

    const averageCompletionTime =
      tasksWithTime.length > 0
        ? tasksWithTime.reduce((sum, t) => sum + (t.efficiency?.completionTime || 0), 0) /
          tasksWithTime.length
        : 0;

    const fastestTask =
      tasksWithTime.length > 0
        ? tasksWithTime.reduce((fastest, current) =>
            (current.efficiency?.completionTime || 0) <
            (fastest.efficiency?.completionTime || Infinity)
              ? current
              : fastest
          )
        : null;

    const slowestTask =
      tasksWithTime.length > 0
        ? tasksWithTime.reduce((slowest, current) =>
            (current.efficiency?.completionTime || 0) > (slowest.efficiency?.completionTime || 0)
              ? current
              : slowest
          )
        : null;

    const timePerCategory: Record<string, number> = {};
    tasksWithTime.forEach((task) => {
      const category = task.tags?.[0] || 'その他';
      timePerCategory[category] =
        (timePerCategory[category] || 0) + (task.efficiency?.completionTime || 0);
    });

    return {
      averageCompletionTime,
      fastestTask,
      slowestTask,
      timePerCategory,
    };
  }

  private analyzePatterns(completedTodos: Todo[]) {
    const hourlyPattern = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
    const weeklyPattern = weekDays.map((day) => ({ day, count: 0 }));
    const monthlyPattern = Array.from({ length: 4 }, (_, i) => ({ week: i + 1, count: 0 }));

    completedTodos.forEach((todo) => {
      if (!todo.completedDate) return;

      const date = new Date(todo.completedDate);

      // 時間別パターン
      hourlyPattern[date.getHours()].count++;

      // 曜日別パターン
      weeklyPattern[date.getDay()].count++;

      // 週別パターン
      const weekOfMonth = Math.floor(date.getDate() / 7);
      if (weekOfMonth < 4) {
        monthlyPattern[weekOfMonth].count++;
      }
    });

    return {
      dailyPattern: hourlyPattern,
      weeklyPattern,
      monthlyPattern,
    };
  }

  private generateInsights(todos: Todo[], patterns: ProductivityReport['patterns']): string[] {
    const insights: string[] = [];
    const completed = todos.filter((t) => t.completed);

    // 完了率に基づくインサイト
    const completionRate = todos.length > 0 ? (completed.length / todos.length) * 100 : 0;

    if (completionRate >= 80) {
      insights.push('優れた完了率を維持しています！');
    } else if (completionRate < 50) {
      insights.push('タスクの完了率が低めです。タスクの優先順位を見直してみましょう。');
    }

    // 最も生産的な時間帯
    const mostProductiveHour = patterns.dailyPattern.reduce((max, current) =>
      current.count > max.count ? current : max
    );

    insights.push(`最も生産的な時間帯は${mostProductiveHour.hour}時台です。`);

    // インプット/アウトプット比率
    const inputTasks = todos.filter((t) => t.type === 'input');
    const outputTasks = todos.filter((t) => t.type === 'output');
    const ratio = outputTasks.length > 0 ? inputTasks.length / outputTasks.length : 0;

    if (ratio > 2) {
      insights.push('インプットタスクが多めです。アウトプットの機会を増やしてみましょう。');
    } else if (ratio < 0.5) {
      insights.push('アウトプットタスクが多めです。新しい知識の習得も忘れずに。');
    } else {
      insights.push('インプットとアウトプットのバランスが取れています。');
    }

    return insights;
  }

  private generateRecommendations(
    _insights: string[], // アンダースコアを追加して未使用を明示
    patterns: ProductivityReport['patterns']
  ): string[] {
    const recommendations: string[] = [];

    // 時間帯に基づく推奨事項
    const leastProductiveHour = patterns.dailyPattern
      .filter((p) => p.count > 0)
      .reduce((min, current) => (current.count < min.count ? current : min), {
        hour: 0,
        count: Infinity,
      });

    if (leastProductiveHour.count !== Infinity) {
      recommendations.push(
        `${leastProductiveHour.hour}時台は生産性が低い傾向があります。` +
          `この時間帯は休憩や軽いタスクに充てることを検討してください。`
      );
    }

    // 曜日パターンに基づく推奨事項
    const mostProductiveDay = patterns.weeklyPattern.reduce((max, current) =>
      current.count > max.count ? current : max
    );

    recommendations.push(
      `${mostProductiveDay.day}曜日が最も生産的です。` +
        `重要なタスクはこの曜日に計画すると良いでしょう。`
    );

    // 一般的な推奨事項
    recommendations.push(
      'タスクに予想時間を設定して、実際の所要時間と比較してみましょう。',
      '定期的に休憩を取ることで、長期的な生産性が向上します。',
      '優先度の高いタスクから取り組むことで、重要な成果を確実に達成できます。'
    );

    return recommendations;
  }

  private groupTodosByDay(todos: Todo[]): Record<string, number> {
    const groups: Record<string, number> = {};

    todos.forEach((todo) => {
      if (!todo.completedDate) return;
      const date = new Date(todo.completedDate).toISOString().split('T')[0];
      groups[date] = (groups[date] || 0) + 1;
    });

    return groups;
  }

  private groupTodosByHour(todos: Todo[]): Record<string, number> {
    const groups: Record<string, number> = {};

    todos.forEach((todo) => {
      if (!todo.completedDate) return;
      const hour = new Date(todo.completedDate).getHours().toString();
      groups[hour] = (groups[hour] || 0) + 1;
    });

    return groups;
  }

  private convertReportToCSV(report: ProductivityReport): string {
    const lines: string[] = [];

    // ヘッダー
    lines.push('Work Time Tracker - 生産性レポート');
    lines.push(`期間: ${report.period.start} - ${report.period.end}`);
    lines.push('');

    // 概要
    lines.push('概要');
    lines.push(`総タスク数,${report.overview.totalTasks}`);
    lines.push(`完了タスク数,${report.overview.completedTasks}`);
    lines.push(`完了率,${report.overview.completionRate.toFixed(1)}%`);
    lines.push(`1日平均タスク数,${report.overview.averageTasksPerDay.toFixed(1)}`);
    lines.push('');

    // インサイト
    lines.push('インサイト');
    report.insights.forEach((insight) => lines.push(insight));
    lines.push('');

    // 推奨事項
    lines.push('推奨事項');
    report.recommendations.forEach((rec) => lines.push(rec));

    return lines.join('\n');
  }
}

export default new ReportService();
