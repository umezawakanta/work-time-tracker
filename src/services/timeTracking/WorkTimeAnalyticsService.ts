/**
 * 📊 勤務時間分析サービス
 * 日次・週次・月次の勤務時間データ分析と可視化
 */

import { BrowserEventEmitter as EventEmitter } from '@/lib/BrowserEventEmitter';

// 勤務記録の型定義
interface WorkRecord {
  id: string;
  userId: string;
  date: Date;
  clockIn?: Date;
  clockOut?: Date;
  breaks: {
    start: Date;
    end?: Date;
    duration?: number; // 分
  }[];
  totalWorkTime: number; // 分
  totalBreakTime: number; // 分
  overtimeMinutes: number;
  status: 'working' | 'break' | 'completed' | 'absent';
  notes?: string;
}

// 日次勤務統計
interface DailyWorkStats {
  date: Date;
  scheduledWorkTime: number; // 予定勤務時間（分）
  actualWorkTime: number; // 実際の勤務時間（分）
  breakTime: number; // 休憩時間（分）
  overtimeMinutes: number; // 残業時間（分）
  efficiency: number; // 勤務効率（0-100%）
  lateArrival: number; // 遅刻時間（分）
  earlyDeparture: number; // 早退時間（分）
  workPattern: 'normal' | 'overtime' | 'short' | 'irregular';
}

// 週次勤務統計
interface WeeklyWorkStats {
  weekStart: Date;
  weekEnd: Date;
  totalWorkTime: number;
  totalOvertimeMinutes: number;
  averageWorkTime: number;
  workDays: number;
  absentDays: number;
  efficiency: number;
  dailyStats: DailyWorkStats[];
}

// 勤務パターン分析
interface WorkPatternAnalysis {
  mostProductiveHours: number[]; // 最も生産性の高い時間帯
  averageArrivalTime: string;
  averageDepartureTime: string;
  preferredBreakTimes: string[];
  overtimeFrequency: number; // 残業頻度（0-1）
  workConsistency: number; // 勤務の一貫性（0-1）
  recommendations: string[];
}

export class WorkTimeAnalyticsService extends EventEmitter {
  private workRecords: Map<string, WorkRecord[]> = new Map();
  private standardWorkHours = 8; // 標準勤務時間
  private standardStartTime = '09:00';
  private standardEndTime = '18:00';
  private lunchBreakDuration = 60; // 昼休憩時間（分）

  constructor() {
    super();
    // Disabled demo data seeding for production behavior
    // this.initializeDemoData();
  }

  /**
   * デモデータの初期化
   */
  private initializeDemoData(): void {
    const demoUserId = 'demo-user';
    const demoRecords: WorkRecord[] = [];

    // 過去30日分のデモデータを生成
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // 週末をスキップ
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const clockIn = new Date(date);
      clockIn.setHours(9 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));

      const clockOut = new Date(date);
      clockOut.setHours(18 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60));

      const workMinutes = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60);
      const breakMinutes = 60 + Math.floor(Math.random() * 30); // 60-90分の休憩
      const actualWorkMinutes = workMinutes - breakMinutes;
      const overtimeMinutes = Math.max(0, actualWorkMinutes - this.standardWorkHours * 60);

      demoRecords.push({
        id: `record-${i}`,
        userId: demoUserId,
        date,
        clockIn,
        clockOut,
        breaks: [
          {
            start: new Date(date.getTime() + 4 * 60 * 60 * 1000), // 4時間後に休憩
            end: new Date(date.getTime() + 4 * 60 * 60 * 1000 + breakMinutes * 60 * 1000),
            duration: breakMinutes,
          },
        ],
        totalWorkTime: actualWorkMinutes,
        totalBreakTime: breakMinutes,
        overtimeMinutes,
        status: 'completed',
      });
    }

    this.workRecords.set(demoUserId, demoRecords);
  }

  /**
   * 指定日の勤務統計を取得
   */
  getDailyWorkStats(userId: string, date: Date): DailyWorkStats | null {
    const records = this.workRecords.get(userId) || [];
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const record = records.find((r) => {
      const recordDate = new Date(r.date);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === targetDate.getTime();
    });

    if (!record || !record.clockIn || !record.clockOut) {
      return null;
    }

    const scheduledWorkTime = this.standardWorkHours * 60;
    const efficiency = Math.min(100, (record.totalWorkTime / scheduledWorkTime) * 100);

    // 遅刻・早退の計算
    const standardStart = this.parseTimeString(this.standardStartTime);
    const standardEnd = this.parseTimeString(this.standardEndTime);
    const actualStart = record.clockIn.getHours() * 60 + record.clockIn.getMinutes();
    const actualEnd = record.clockOut.getHours() * 60 + record.clockOut.getMinutes();

    const lateArrival = Math.max(0, actualStart - standardStart);
    const earlyDeparture = Math.max(0, standardEnd - actualEnd);

    // 勤務パターンの判定
    let workPattern: DailyWorkStats['workPattern'] = 'normal';
    if (record.overtimeMinutes > 60) workPattern = 'overtime';
    else if (record.totalWorkTime < scheduledWorkTime * 0.8) workPattern = 'short';
    else if (lateArrival > 30 || earlyDeparture > 30) workPattern = 'irregular';

    return {
      date: record.date,
      scheduledWorkTime,
      actualWorkTime: record.totalWorkTime,
      breakTime: record.totalBreakTime,
      overtimeMinutes: record.overtimeMinutes,
      efficiency,
      lateArrival,
      earlyDeparture,
      workPattern,
    };
  }

  /**
   * 指定週の勤務統計を取得
   */
  getWeeklyWorkStats(userId: string, weekStart: Date): WeeklyWorkStats {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const dailyStats: DailyWorkStats[] = [];
    let totalWorkTime = 0;
    let totalOvertimeMinutes = 0;
    let workDays = 0;
    let absentDays = 0;

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);

      // 平日のみ処理
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        const dailyStat = this.getDailyWorkStats(userId, currentDate);
        if (dailyStat) {
          dailyStats.push(dailyStat);
          totalWorkTime += dailyStat.actualWorkTime;
          totalOvertimeMinutes += dailyStat.overtimeMinutes;
          workDays++;
        } else {
          absentDays++;
        }
      }
    }

    const averageWorkTime = workDays > 0 ? totalWorkTime / workDays : 0;
    const efficiency =
      workDays > 0 ? dailyStats.reduce((sum, stat) => sum + stat.efficiency, 0) / workDays : 0;

    return {
      weekStart,
      weekEnd,
      totalWorkTime,
      totalOvertimeMinutes,
      averageWorkTime,
      workDays,
      absentDays,
      efficiency,
      dailyStats,
    };
  }

  /**
   * 勤務パターン分析
   */
  analyzeWorkPattern(userId: string, days: number = 30): WorkPatternAnalysis | null {
    const records = this.workRecords.get(userId) || [];
    const recentRecords = records.filter((r) => r.clockIn && r.clockOut).slice(0, days);

    if (recentRecords.length === 0) {
      return null;
    }

    // 最も生産性の高い時間帯（勤務開始から4時間以内）
    const mostProductiveHours = [9, 10, 11, 14, 15];

    // 平均到着・退社時間
    const arrivalTimes = recentRecords.map(
      (r) => r.clockIn!.getHours() * 60 + r.clockIn!.getMinutes()
    );
    const departureTimes = recentRecords.map(
      (r) => r.clockOut!.getHours() * 60 + r.clockOut!.getMinutes()
    );

    const avgArrival = arrivalTimes.reduce((sum, time) => sum + time, 0) / arrivalTimes.length;
    const avgDeparture =
      departureTimes.reduce((sum, time) => sum + time, 0) / departureTimes.length;

    const averageArrivalTime = this.minutesToTimeString(avgArrival);
    const averageDepartureTime = this.minutesToTimeString(avgDeparture);

    // 残業頻度
    const overtimeCount = recentRecords.filter((r) => r.overtimeMinutes > 0).length;
    const overtimeFrequency = overtimeCount / recentRecords.length;

    // 勤務の一貫性（到着時間の標準偏差）
    const arrivalVariance =
      arrivalTimes.reduce((sum, time) => sum + Math.pow(time - avgArrival, 2), 0) /
      arrivalTimes.length;
    const arrivalStdDev = Math.sqrt(arrivalVariance);
    const workConsistency = Math.max(0, 1 - arrivalStdDev / 60); // 1時間の標準偏差で一貫性0

    // 推奨事項
    const recommendations: string[] = [];
    if (overtimeFrequency > 0.3) {
      recommendations.push('残業が多い傾向があります。業務効率化を検討してください');
    }
    if (workConsistency < 0.7) {
      recommendations.push('勤務開始時間を一定にすることで生産性が向上します');
    }
    if (avgArrival > this.parseTimeString(this.standardStartTime) + 30) {
      recommendations.push('早めの出社で1日を効率的にスタートしましょう');
    }

    return {
      mostProductiveHours,
      averageArrivalTime,
      averageDepartureTime,
      preferredBreakTimes: ['12:00', '15:00'],
      overtimeFrequency,
      workConsistency,
      recommendations,
    };
  }

  /**
   * 今日の勤務状況を取得
   */
  getTodayWorkStatus(userId: string): DailyWorkStats | null {
    return this.getDailyWorkStats(userId, new Date());
  }

  /**
   * 勤務時間のチャートデータを生成
   */
  generateWorkTimeChartData(
    userId: string,
    days: number = 7
  ): Array<{
    date: string;
    scheduledTime: number;
    actualTime: number;
    overtime: number;
    efficiency: number;
  }> {
    const chartData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const stats = this.getDailyWorkStats(userId, date);

      chartData.push({
        date: date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
        scheduledTime: stats?.scheduledWorkTime || 0,
        actualTime: stats?.actualWorkTime || 0,
        overtime: stats?.overtimeMinutes || 0,
        efficiency: stats?.efficiency || 0,
      });
    }

    return chartData;
  }

  /**
   * 時間文字列を分に変換
   */
  private parseTimeString(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * 分を時間文字列に変換
   */
  private minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * 勤務記録を追加
   */
  addWorkRecord(record: WorkRecord): void {
    const userRecords = this.workRecords.get(record.userId) || [];
    userRecords.unshift(record);
    this.workRecords.set(record.userId, userRecords);

    this.emit('workRecordAdded', { userId: record.userId, record });
  }

  /**
   * 勤務記録を更新
   */
  updateWorkRecord(userId: string, recordId: string, updates: Partial<WorkRecord>): void {
    const userRecords = this.workRecords.get(userId) || [];
    const recordIndex = userRecords.findIndex((r) => r.id === recordId);

    if (recordIndex !== -1) {
      userRecords[recordIndex] = { ...userRecords[recordIndex], ...updates };
      this.workRecords.set(userId, userRecords);

      this.emit('workRecordUpdated', { userId, recordId, updates });
    }
  }
}

export default WorkTimeAnalyticsService;
