/**
 * 📊 月次勤怠集計サービス
 * 月単位での勤怠データ集計、有給・欠勤管理、レポート出力
 */

import { BrowserEventEmitter as EventEmitter } from '@/lib/BrowserEventEmitter';
import WorkTimeAnalyticsService from './WorkTimeAnalyticsService';

// 月次勤怠データ型定義
interface MonthlyTimesheet {
  userId: string;
  year: number;
  month: number;
  totalWorkDays: number; // 総出勤予定日数
  actualWorkDays: number; // 実際の出勤日数
  absentDays: number; // 欠勤日数
  lateCount: number; // 遅刻回数
  earlyLeaveCount: number; // 早退回数
  totalWorkMinutes: number; // 総実働時間（分）
  totalOvertimeMinutes: number; // 総残業時間（分）
  totalBreakMinutes: number; // 総休憩時間（分）
  averageWorkMinutes: number; // 平均実働時間（分）
  averageArrivalTime: string; // 平均到着時刻
  averageDepartureTime: string; // 平均退社時刻
  attendanceRate: number; // 出勤率（%）
  overtimeRate: number; // 残業率（%）
  efficiency: number; // 月次勤務効率（%）
  paidLeaveUsed: number; // 使用有給日数
  paidLeaveRemaining: number; // 残有給日数
  specialLeaveUsed: number; // 特別休暇使用日数
  weeklyStats: WeeklyTimesheetData[];
  monthlyTrend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
}

// 週次データ
interface WeeklyTimesheetData {
  weekNumber: number;
  weekStart: Date;
  weekEnd: Date;
  workDays: number;
  totalMinutes: number;
  overtimeMinutes: number;
  efficiency: number;
}

// 有給休暇管理
interface PaidLeaveRecord {
  id: string;
  userId: string;
  date: Date;
  type: 'full_day' | 'half_day_am' | 'half_day_pm' | 'hourly';
  hours?: number; // 時間単位有給の場合
  reason?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
}

// エクスポート設定
interface ExportOptions {
  format: 'csv' | 'pdf';
  includeCharts: boolean;
  includeRecommendations: boolean;
  period: 'current_month' | 'last_month' | 'custom';
  customStartDate?: Date;
  customEndDate?: Date;
  language: 'ja' | 'en';
}

export class MonthlyTimesheetService extends EventEmitter {
  private analyticsService: WorkTimeAnalyticsService;
  private monthlyData: Map<string, MonthlyTimesheet[]> = new Map();
  private paidLeaveRecords: Map<string, PaidLeaveRecord[]> = new Map();
  private annualPaidLeaveEntitlement = 20; // 年次有給休暇付与日数

  constructor() {
    super();
    this.analyticsService = new WorkTimeAnalyticsService();
    this.initializeDemoData();
  }

  /**
   * デモデータの初期化
   */
  private initializeDemoData(): void {
    const demoUserId = 'demo-user';

    // 過去6ヶ月分の月次データを生成
    const monthlyRecords: MonthlyTimesheet[] = [];
    const paidLeaveRecords: PaidLeaveRecord[] = [];

    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      // 月の営業日数計算
      const totalWorkDays = this.calculateWorkDaysInMonth(year, month);
      const actualWorkDays = Math.floor(totalWorkDays * (0.85 + Math.random() * 0.15)); // 85-100%出勤
      const absentDays = totalWorkDays - actualWorkDays;

      const totalWorkMinutes = actualWorkDays * (8 * 60 + Math.floor(Math.random() * 120)); // 8-10時間
      const totalOvertimeMinutes = Math.floor(totalWorkMinutes * (0.1 + Math.random() * 0.2)); // 10-30%残業
      const totalBreakMinutes = actualWorkDays * (60 + Math.floor(Math.random() * 30)); // 60-90分休憩

      const attendanceRate = (actualWorkDays / totalWorkDays) * 100;
      const overtimeRate = (totalOvertimeMinutes / totalWorkMinutes) * 100;
      const efficiency = 75 + Math.random() * 20; // 75-95%効率

      // 週次データ生成
      const weeklyStats = this.generateWeeklyStats(year, month, actualWorkDays);

      monthlyRecords.push({
        userId: demoUserId,
        year,
        month,
        totalWorkDays,
        actualWorkDays,
        absentDays,
        lateCount: Math.floor(Math.random() * 5),
        earlyLeaveCount: Math.floor(Math.random() * 3),
        totalWorkMinutes,
        totalOvertimeMinutes,
        totalBreakMinutes,
        averageWorkMinutes: Math.floor(totalWorkMinutes / actualWorkDays),
        averageArrivalTime:
          '09:' + (15 + Math.floor(Math.random() * 30)).toString().padStart(2, '0'),
        averageDepartureTime:
          '18:' + (0 + Math.floor(Math.random() * 60)).toString().padStart(2, '0'),
        attendanceRate,
        overtimeRate,
        efficiency,
        paidLeaveUsed: Math.floor(Math.random() * 3),
        paidLeaveRemaining: this.annualPaidLeaveEntitlement - Math.floor(Math.random() * 8),
        specialLeaveUsed: Math.floor(Math.random() * 2),
        weeklyStats,
        monthlyTrend: this.calculateTrend(efficiency, i),
        recommendations: this.generateRecommendations(attendanceRate, overtimeRate, efficiency),
      });

      // 有給休暇記録生成
      for (let j = 0; j < Math.floor(Math.random() * 3); j++) {
        const leaveDate = new Date(year, month - 1, Math.floor(Math.random() * 28) + 1);
        paidLeaveRecords.push({
          id: `leave-${year}-${month}-${j}`,
          userId: demoUserId,
          date: leaveDate,
          type: Math.random() > 0.7 ? 'full_day' : 'half_day_am',
          reason: ['体調不良', '私用', '家族対応', '定期健診'][Math.floor(Math.random() * 4)],
          approvalStatus: 'approved',
          approvedBy: 'manager',
          approvedAt: new Date(leaveDate.getTime() - 7 * 24 * 60 * 60 * 1000),
        });
      }
    }

    this.monthlyData.set(demoUserId, monthlyRecords);
    this.paidLeaveRecords.set(demoUserId, paidLeaveRecords);
  }

  /**
   * 月の営業日数を計算
   */
  private calculateWorkDaysInMonth(year: number, month: number): number {
    const daysInMonth = new Date(year, month, 0).getDate();
    let workDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // 土日以外
        workDays++;
      }
    }

    return workDays;
  }

  /**
   * 週次統計データ生成
   */
  private generateWeeklyStats(
    year: number,
    month: number,
    actualWorkDays: number
  ): WeeklyTimesheetData[] {
    const weeks: WeeklyTimesheetData[] = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    let weekNumber = 1;
    let currentDate = new Date(firstDay);

    while (currentDate <= lastDay) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      if (weekEnd > lastDay) {
        weekEnd.setTime(lastDay.getTime());
      }

      const workDaysInWeek = Math.floor(Math.random() * 5) + 1; // 1-5日
      const totalMinutes = workDaysInWeek * (8 * 60 + Math.floor(Math.random() * 120));
      const overtimeMinutes = Math.floor(totalMinutes * Math.random() * 0.3);
      const efficiency = 70 + Math.random() * 25;

      weeks.push({
        weekNumber,
        weekStart,
        weekEnd,
        workDays: workDaysInWeek,
        totalMinutes,
        overtimeMinutes,
        efficiency,
      });

      currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      weekNumber++;
    }

    return weeks;
  }

  /**
   * トレンド計算
   */
  private calculateTrend(
    efficiency: number,
    monthsAgo: number
  ): 'improving' | 'stable' | 'declining' {
    if (monthsAgo === 0) return 'stable';
    const baseEfficiency = 80;
    if (efficiency > baseEfficiency + 5) return 'improving';
    if (efficiency < baseEfficiency - 5) return 'declining';
    return 'stable';
  }

  /**
   * 推奨事項生成
   */
  private generateRecommendations(
    attendanceRate: number,
    overtimeRate: number,
    efficiency: number
  ): string[] {
    const recommendations: string[] = [];

    if (attendanceRate < 90) {
      recommendations.push('出勤率が低下しています。健康管理と勤務環境の改善を検討してください');
    }

    if (overtimeRate > 25) {
      recommendations.push('残業が多い傾向があります。業務効率化と適切な休息を心がけてください');
    }

    if (efficiency < 75) {
      recommendations.push(
        '勤務効率の向上に取り組みましょう。集中時間の確保と休憩の取り方を見直してください'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('良好な勤務状況です。現在のペースを維持してください');
    }

    return recommendations;
  }

  /**
   * 指定月の勤怠集計を取得
   */
  getMonthlyTimesheet(userId: string, year: number, month: number): MonthlyTimesheet | null {
    const userRecords = this.monthlyData.get(userId) || [];
    return userRecords.find((record) => record.year === year && record.month === month) || null;
  }

  /**
   * 最新の月次勤怠集計を取得
   */
  getCurrentMonthTimesheet(userId: string): MonthlyTimesheet | null {
    const now = new Date();
    return this.getMonthlyTimesheet(userId, now.getFullYear(), now.getMonth() + 1);
  }

  /**
   * 指定期間の勤怠集計を取得
   */
  getTimesheetByDateRange(userId: string, startDate: Date, endDate: Date): MonthlyTimesheet[] {
    const userRecords = this.monthlyData.get(userId) || [];

    return userRecords.filter((record) => {
      const recordDate = new Date(record.year, record.month - 1, 1);
      return recordDate >= startDate && recordDate <= endDate;
    });
  }

  /**
   * 有給休暇記録を取得
   */
  getPaidLeaveRecords(userId: string, year?: number, month?: number): PaidLeaveRecord[] {
    const userRecords = this.paidLeaveRecords.get(userId) || [];

    if (year && month) {
      return userRecords.filter(
        (record) => record.date.getFullYear() === year && record.date.getMonth() + 1 === month
      );
    }

    return userRecords;
  }

  /**
   * 有給休暇申請
   */
  submitPaidLeaveRequest(
    request: Omit<PaidLeaveRecord, 'id' | 'approvalStatus' | 'approvedBy' | 'approvedAt'>
  ): string {
    const id = `leave-${Date.now()}`;
    const newRecord: PaidLeaveRecord = {
      ...request,
      id,
      approvalStatus: 'pending',
    };

    const userRecords = this.paidLeaveRecords.get(request.userId) || [];
    userRecords.unshift(newRecord);
    this.paidLeaveRecords.set(request.userId, userRecords);

    this.emit('paidLeaveRequested', { userId: request.userId, record: newRecord });
    return id;
  }

  /**
   * 有給休暇承認・否認
   */
  approvePaidLeave(
    userId: string,
    leaveId: string,
    approved: boolean,
    approvedBy: string
  ): boolean {
    const userRecords = this.paidLeaveRecords.get(userId) || [];
    const recordIndex = userRecords.findIndex((r) => r.id === leaveId);

    if (recordIndex === -1) return false;

    userRecords[recordIndex] = {
      ...userRecords[recordIndex],
      approvalStatus: approved ? 'approved' : 'rejected',
      approvedBy,
      approvedAt: new Date(),
    };

    this.paidLeaveRecords.set(userId, userRecords);
    this.emit('paidLeaveProcessed', { userId, leaveId, approved });
    return true;
  }

  /**
   * CSV形式でエクスポート
   */
  exportToCSV(userId: string, options: ExportOptions): string {
    const timesheet =
      options.period === 'current_month'
        ? this.getCurrentMonthTimesheet(userId)
        : this.getMonthlyTimesheet(
            userId,
            options.customStartDate?.getFullYear() || new Date().getFullYear(),
            (options.customStartDate?.getMonth() || new Date().getMonth()) + 1
          );

    if (!timesheet) return '';

    const headers = [
      '年月',
      '総出勤予定日数',
      '実出勤日数',
      '欠勤日数',
      '遅刻回数',
      '早退回数',
      '総実働時間(時間)',
      '総残業時間(時間)',
      '平均到着時刻',
      '平均退社時刻',
      '出勤率(%)',
      '残業率(%)',
      '勤務効率(%)',
      '有給使用日数',
      '有給残日数',
    ];

    const data = [
      `${timesheet.year}年${timesheet.month}月`,
      timesheet.totalWorkDays.toString(),
      timesheet.actualWorkDays.toString(),
      timesheet.absentDays.toString(),
      timesheet.lateCount.toString(),
      timesheet.earlyLeaveCount.toString(),
      (timesheet.totalWorkMinutes / 60).toFixed(1),
      (timesheet.totalOvertimeMinutes / 60).toFixed(1),
      timesheet.averageArrivalTime,
      timesheet.averageDepartureTime,
      timesheet.attendanceRate.toFixed(1),
      timesheet.overtimeRate.toFixed(1),
      timesheet.efficiency.toFixed(1),
      timesheet.paidLeaveUsed.toString(),
      timesheet.paidLeaveRemaining.toString(),
    ];

    return [headers.join(','), data.join(',')].join('\n');
  }

  /**
   * PDF形式でエクスポート
   */
  async exportToPDF(userId: string, options: ExportOptions): Promise<Blob> {
    // 実際の実装では、jsPDFやPDFMakeを使用してPDFを生成
    // ここでは簡易的な実装
    const csvData = this.exportToCSV(userId, options);
    const blob = new Blob([csvData], { type: 'application/pdf' });
    return blob;
  }

  /**
   * 月次比較データを生成
   */
  generateMonthlyComparison(
    userId: string,
    months: number = 6
  ): Array<{
    month: string;
    workDays: number;
    totalHours: number;
    overtimeHours: number;
    efficiency: number;
    attendanceRate: number;
  }> {
    const userRecords = this.monthlyData.get(userId) || [];
    const recentRecords = userRecords.slice(0, months).reverse();

    return recentRecords.map((record) => ({
      month: `${record.month}月`,
      workDays: record.actualWorkDays,
      totalHours: Math.round(record.totalWorkMinutes / 60),
      overtimeHours: Math.round(record.totalOvertimeMinutes / 60),
      efficiency: Math.round(record.efficiency),
      attendanceRate: Math.round(record.attendanceRate),
    }));
  }

  /**
   * 年次有給休暇残日数計算
   */
  calculateAnnualLeaveBalance(userId: string): {
    totalEntitled: number;
    used: number;
    remaining: number;
    carryover: number;
  } {
    const currentYear = new Date().getFullYear();
    const yearRecords = this.paidLeaveRecords.get(userId) || [];
    const thisYearRecords = yearRecords.filter((r) => r.date.getFullYear() === currentYear);

    const used = thisYearRecords.reduce((sum, record) => {
      switch (record.type) {
        case 'full_day':
          return sum + 1;
        case 'half_day_am':
        case 'half_day_pm':
          return sum + 0.5;
        case 'hourly':
          return sum + (record.hours || 0) / 8;
        default:
          return sum;
      }
    }, 0);

    const remaining = this.annualPaidLeaveEntitlement - used;
    const carryover = Math.min(remaining, 20); // 最大20日繰越可能

    return {
      totalEntitled: this.annualPaidLeaveEntitlement,
      used,
      remaining,
      carryover,
    };
  }

  /**
   * 勤怠データの更新
   */
  updateMonthlyData(
    userId: string,
    year: number,
    month: number,
    updates: Partial<MonthlyTimesheet>
  ): void {
    const userRecords = this.monthlyData.get(userId) || [];
    const recordIndex = userRecords.findIndex((r) => r.year === year && r.month === month);

    if (recordIndex !== -1) {
      userRecords[recordIndex] = { ...userRecords[recordIndex], ...updates };
      this.monthlyData.set(userId, userRecords);
      this.emit('monthlyDataUpdated', { userId, year, month, updates });
    }
  }
}

export default MonthlyTimesheetService;
