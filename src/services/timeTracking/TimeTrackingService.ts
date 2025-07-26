/**
 * ⏰ 勤怠管理サービス
 * リアルタイム打刻・勤務時間管理・状態追跡システム
 */

import { BrowserEventEmitter as EventEmitter } from '@/lib/BrowserEventEmitter';

// 勤怠記録の型定義
interface TimeRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  clockIn?: Date;
  clockOut?: Date;
  breakStartTimes: Date[];
  breakEndTimes: Date[];
  totalBreakMinutes: number;
  totalWorkMinutes: number;
  overtimeMinutes: number;
  status: 'not_started' | 'working' | 'on_break' | 'finished';
  location?: {
    type: 'office' | 'home' | 'client' | 'other';
    address?: string;
    coordinates?: { lat: number; lng: number };
  };
  notes?: string;
  isEdited: boolean;
  editHistory: TimeEditRecord[];
  createdAt: Date;
  updatedAt: Date;
}

interface TimeEditRecord {
  id: string;
  editedBy: string;
  editedAt: Date;
  fieldChanged: string;
  oldValue: any;
  newValue: any;
  reason: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

// 勤務パターン設定
interface WorkPattern {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  schedule: {
    monday: WorkDaySchedule;
    tuesday: WorkDaySchedule;
    wednesday: WorkDaySchedule;
    thursday: WorkDaySchedule;
    friday: WorkDaySchedule;
    saturday: WorkDaySchedule;
    sunday: WorkDaySchedule;
  };
  standardWorkHours: number; // 1日の標準労働時間（分）
  breakDuration: number; // 標準休憩時間（分）
  overtimeThreshold: number; // 残業開始時間（分）
  flexTimeAllowed: boolean;
  flexTimeRange: { start: string; end: string };
  createdAt: Date;
  updatedAt: Date;
}

interface WorkDaySchedule {
  isWorkDay: boolean;
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  breakStartTime?: string;
  breakEndTime?: string;
  minimumWorkHours?: number; // 分
  maximumWorkHours?: number; // 分
}

// 勤怠統計
interface TimeStatistics {
  userId: string;
  period: {
    start: Date;
    end: Date;
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  };
  totalWorkDays: number;
  totalWorkHours: number; // 分
  totalOvertimeHours: number; // 分
  totalBreakHours: number; // 分
  averageWorkHours: number; // 分/日
  attendanceRate: number; // %
  punctualityRate: number; // %
  longestWorkDay: number; // 分
  shortestWorkDay: number; // 分
  workPatternCompliance: number; // %
  lateArrivals: number;
  earlyDepartures: number;
  missedDays: number;
  workFromHomeDays: number;
  calculatedAt: Date;
}

// アラート設定
interface AlertSettings {
  userId: string;
  clockInReminder: {
    enabled: boolean;
    time: string; // HH:MM
    message: string;
  };
  clockOutReminder: {
    enabled: boolean;
    afterHours: number; // 時間
    message: string;
  };
  breakReminder: {
    enabled: boolean;
    afterMinutes: number;
    message: string;
  };
  overtimeWarning: {
    enabled: boolean;
    thresholdMinutes: number;
    message: string;
  };
  weeklyLimitWarning: {
    enabled: boolean;
    limitHours: number;
    message: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

// 承認ワークフロー
interface ApprovalRequest {
  id: string;
  requesterId: string;
  approverId?: string;
  type: 'time_edit' | 'overtime_request' | 'time_off_request' | 'manual_entry';
  timeRecordId: string;
  requestedChanges: any;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewNote?: string;
}

export class TimeTrackingService extends EventEmitter {
  private timeRecords: Map<string, TimeRecord> = new Map();
  private workPatterns: Map<string, WorkPattern> = new Map();
  private alertSettings: Map<string, AlertSettings> = new Map();
  private approvalRequests: Map<string, ApprovalRequest> = new Map();
  private activeSessionIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    super();
    this.initializeTimeTracking();
  }

  /**
   * 勤怠管理システムの初期化
   */
  private async initializeTimeTracking(): Promise<void> {
    console.log('⏰ 勤怠管理システムを初期化中...');

    this.initializeDefaultWorkPatterns();
    this.initializeDefaultAlertSettings();
    this.startAutomaticProcessing();

    console.log('✅ 勤怠管理システムが準備完了');
    this.emit('systemReady');
  }

  /**
   * デフォルト勤務パターンの初期化
   */
  private initializeDefaultWorkPatterns(): void {
    const standardPattern: WorkPattern = {
      id: 'standard_pattern',
      userId: 'demo-user',
      name: '標準勤務パターン（9:00-18:00）',
      isDefault: true,
      schedule: {
        monday: {
          isWorkDay: true,
          startTime: '09:00',
          endTime: '18:00',
          breakStartTime: '12:00',
          breakEndTime: '13:00',
          minimumWorkHours: 480, // 8時間
          maximumWorkHours: 600, // 10時間
        },
        tuesday: {
          isWorkDay: true,
          startTime: '09:00',
          endTime: '18:00',
          breakStartTime: '12:00',
          breakEndTime: '13:00',
          minimumWorkHours: 480,
          maximumWorkHours: 600,
        },
        wednesday: {
          isWorkDay: true,
          startTime: '09:00',
          endTime: '18:00',
          breakStartTime: '12:00',
          breakEndTime: '13:00',
          minimumWorkHours: 480,
          maximumWorkHours: 600,
        },
        thursday: {
          isWorkDay: true,
          startTime: '09:00',
          endTime: '18:00',
          breakStartTime: '12:00',
          breakEndTime: '13:00',
          minimumWorkHours: 480,
          maximumWorkHours: 600,
        },
        friday: {
          isWorkDay: true,
          startTime: '09:00',
          endTime: '18:00',
          breakStartTime: '12:00',
          breakEndTime: '13:00',
          minimumWorkHours: 480,
          maximumWorkHours: 600,
        },
        saturday: {
          isWorkDay: false,
        },
        sunday: {
          isWorkDay: false,
        },
      },
      standardWorkHours: 480, // 8時間
      breakDuration: 60, // 1時間
      overtimeThreshold: 480, // 8時間後
      flexTimeAllowed: true,
      flexTimeRange: { start: '08:00', end: '10:00' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.workPatterns.set('demo-user', standardPattern);
  }

  /**
   * デフォルトアラート設定の初期化
   */
  private initializeDefaultAlertSettings(): void {
    const defaultAlerts: AlertSettings = {
      userId: 'demo-user',
      clockInReminder: {
        enabled: true,
        time: '09:00',
        message: '出勤時間です。打刻をお忘れなく！',
      },
      clockOutReminder: {
        enabled: true,
        afterHours: 8,
        message: '標準勤務時間を超過しています。退勤をご検討ください。',
      },
      breakReminder: {
        enabled: true,
        afterMinutes: 240, // 4時間後
        message: '休憩時間を取りましょう。',
      },
      overtimeWarning: {
        enabled: true,
        thresholdMinutes: 480, // 8時間
        message: '残業時間に入りました。',
      },
      weeklyLimitWarning: {
        enabled: true,
        limitHours: 40, // 週40時間
        message: '週の労働時間上限に近づいています。',
      },
      notifications: {
        email: false,
        push: true,
        inApp: true,
      },
    };

    this.alertSettings.set('demo-user', defaultAlerts);
  }

  /**
   * 自動処理の開始
   */
  private startAutomaticProcessing(): void {
    // 1分間隔で状態チェック
    setInterval(() => {
      this.checkAlerts();
      this.updateActiveRecords();
    }, 60000);

    // 日次処理（午前0時）
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        this.processDailyTasks();
      }
    }, 60000);
  }

  /**
   * 出勤打刻
   */
  public async clockIn(
    userId: string,
    location?: TimeRecord['location'],
    notes?: string
  ): Promise<TimeRecord> {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // 既存の今日のレコードを確認
    let record = this.getTodaysRecord(userId);

    if (record && record.clockIn) {
      throw new Error('今日は既に出勤打刻済みです');
    }

    if (!record) {
      // 新しいレコードを作成
      record = {
        id: `time_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        date: today,
        breakStartTimes: [],
        breakEndTimes: [],
        totalBreakMinutes: 0,
        totalWorkMinutes: 0,
        overtimeMinutes: 0,
        status: 'working',
        isEdited: false,
        editHistory: [],
        createdAt: now,
        updatedAt: now,
      };
    }

    record.clockIn = now;
    record.status = 'working';
    record.location = location;
    record.notes = notes;
    record.updatedAt = now;

    this.timeRecords.set(record.id, record);

    // 自動時間更新を開始
    this.startTimeTracking(record.id);

    this.emit('clockedIn', {
      userId,
      recordId: record.id,
      timestamp: now,
      location,
    });

    console.log(`✅ 出勤打刻完了: ${userId} at ${now.toLocaleTimeString('ja-JP')}`);
    return record;
  }

  /**
   * 退勤打刻
   */
  public async clockOut(userId: string, notes?: string): Promise<TimeRecord> {
    const record = this.getTodaysRecord(userId);

    if (!record || !record.clockIn) {
      throw new Error('出勤打刻がされていません');
    }

    if (record.clockOut) {
      throw new Error('今日は既に退勤打刻済みです');
    }

    if (record.status === 'on_break') {
      // 休憩中の場合、自動的に休憩終了
      await this.endBreak(userId);
    }

    const now = new Date();
    record.clockOut = now;
    record.status = 'finished';
    record.notes = notes || record.notes;
    record.updatedAt = now;

    // 勤務時間を計算
    this.calculateWorkTime(record);

    // 自動時間更新を停止
    this.stopTimeTracking(record.id);

    this.emit('clockedOut', {
      userId,
      recordId: record.id,
      timestamp: now,
      totalWorkMinutes: record.totalWorkMinutes,
      overtimeMinutes: record.overtimeMinutes,
    });

    console.log(`✅ 退勤打刻完了: ${userId} at ${now.toLocaleTimeString('ja-JP')}`);
    console.log(
      `📊 勤務時間: ${Math.floor(record.totalWorkMinutes / 60)}時間${record.totalWorkMinutes % 60}分`
    );

    return record;
  }

  /**
   * 休憩開始
   */
  public async startBreak(userId: string, notes?: string): Promise<TimeRecord> {
    const record = this.getTodaysRecord(userId);

    if (!record || !record.clockIn) {
      throw new Error('出勤打刻がされていません');
    }

    if (record.status === 'on_break') {
      throw new Error('既に休憩中です');
    }

    if (record.clockOut) {
      throw new Error('既に退勤済みです');
    }

    const now = new Date();
    record.breakStartTimes.push(now);
    record.status = 'on_break';
    record.notes = notes || record.notes;
    record.updatedAt = now;

    this.emit('breakStarted', {
      userId,
      recordId: record.id,
      timestamp: now,
    });

    console.log(`☕ 休憩開始: ${userId} at ${now.toLocaleTimeString('ja-JP')}`);
    return record;
  }

  /**
   * 休憩終了
   */
  public async endBreak(userId: string): Promise<TimeRecord> {
    const record = this.getTodaysRecord(userId);

    if (!record || record.status !== 'on_break') {
      throw new Error('休憩中ではありません');
    }

    const now = new Date();
    record.breakEndTimes.push(now);
    record.status = 'working';
    record.updatedAt = now;

    // 休憩時間を計算
    this.calculateBreakTime(record);

    this.emit('breakEnded', {
      userId,
      recordId: record.id,
      timestamp: now,
      totalBreakMinutes: record.totalBreakMinutes,
    });

    console.log(`🔙 休憩終了: ${userId} at ${now.toLocaleTimeString('ja-JP')}`);
    return record;
  }

  /**
   * 今日のレコード取得
   */
  public getTodaysRecord(userId: string): TimeRecord | null {
    const today = new Date().toISOString().split('T')[0];

    for (const record of this.timeRecords.values()) {
      if (record.userId === userId && record.date === today) {
        return record;
      }
    }

    return null;
  }

  /**
   * 現在の勤務状態取得
   */
  public getCurrentWorkStatus(userId: string): {
    status: TimeRecord['status'];
    workDuration: number; // 分
    breakDuration: number; // 分
    isOvertime: boolean;
    clockInTime?: Date;
    lastBreakStart?: Date;
    estimatedClockOut?: Date;
  } {
    const record = this.getTodaysRecord(userId);
    const workPattern = this.workPatterns.get(userId);

    if (!record || !record.clockIn) {
      return {
        status: 'not_started',
        workDuration: 0,
        breakDuration: 0,
        isOvertime: false,
      };
    }

    // リアルタイム計算
    const now = new Date();
    const clockInTime = record.clockIn;
    let workDuration = 0;
    let breakDuration = record.totalBreakMinutes;

    if (record.status === 'working') {
      // 現在作業中
      workDuration = Math.floor((now.getTime() - clockInTime.getTime()) / (1000 * 60));
      workDuration -= breakDuration;
    } else if (record.status === 'on_break') {
      // 現在休憩中
      const currentBreakStart = record.breakStartTimes[record.breakStartTimes.length - 1];
      const currentBreakDuration = Math.floor(
        (now.getTime() - currentBreakStart.getTime()) / (1000 * 60)
      );

      workDuration = Math.floor(
        (currentBreakStart.getTime() - clockInTime.getTime()) / (1000 * 60)
      );
      workDuration -= record.totalBreakMinutes; // 過去の休憩時間を除く
      breakDuration += currentBreakDuration;
    } else if (record.status === 'finished') {
      workDuration = record.totalWorkMinutes;
      breakDuration = record.totalBreakMinutes;
    }

    const standardWorkHours = workPattern?.standardWorkHours || 480;
    const isOvertime = workDuration > standardWorkHours;

    // 予想退勤時間計算
    let estimatedClockOut: Date | undefined;
    if (record.status !== 'finished' && workPattern) {
      const remainingWork = Math.max(0, standardWorkHours - workDuration);
      estimatedClockOut = new Date(now.getTime() + remainingWork * 60 * 1000);
    }

    return {
      status: record.status,
      workDuration: Math.max(0, workDuration),
      breakDuration: Math.max(0, breakDuration),
      isOvertime,
      clockInTime,
      lastBreakStart: record.breakStartTimes[record.breakStartTimes.length - 1],
      estimatedClockOut,
    };
  }

  /**
   * 勤務時間計算
   */
  private calculateWorkTime(record: TimeRecord): void {
    if (!record.clockIn || !record.clockOut) return;

    const totalMinutes = Math.floor(
      (record.clockOut.getTime() - record.clockIn.getTime()) / (1000 * 60)
    );

    record.totalWorkMinutes = Math.max(0, totalMinutes - record.totalBreakMinutes);

    const workPattern = this.workPatterns.get(record.userId);
    const standardWorkHours = workPattern?.standardWorkHours || 480;

    record.overtimeMinutes = Math.max(0, record.totalWorkMinutes - standardWorkHours);
  }

  /**
   * 休憩時間計算
   */
  private calculateBreakTime(record: TimeRecord): void {
    let totalBreakMinutes = 0;

    const breakCount = Math.min(record.breakStartTimes.length, record.breakEndTimes.length);

    for (let i = 0; i < breakCount; i++) {
      const breakDuration = Math.floor(
        (record.breakEndTimes[i].getTime() - record.breakStartTimes[i].getTime()) / (1000 * 60)
      );
      totalBreakMinutes += breakDuration;
    }

    record.totalBreakMinutes = totalBreakMinutes;
  }

  /**
   * 自動時間追跡開始
   */
  private startTimeTracking(recordId: string): void {
    // 既存のインターバルをクリア
    this.stopTimeTracking(recordId);

    // 1分間隔で時間を更新
    const interval = setInterval(() => {
      this.emit('timeUpdated', { recordId });
    }, 60000);

    this.activeSessionIntervals.set(recordId, interval);
  }

  /**
   * 自動時間追跡停止
   */
  private stopTimeTracking(recordId: string): void {
    const interval = this.activeSessionIntervals.get(recordId);
    if (interval) {
      clearInterval(interval);
      this.activeSessionIntervals.delete(recordId);
    }
  }

  /**
   * アラートチェック
   */
  private checkAlerts(): void {
    for (const [userId, alerts] of this.alertSettings) {
      const record = this.getTodaysRecord(userId);
      const status = this.getCurrentWorkStatus(userId);

      // 出勤時間アラート
      if (alerts.clockInReminder.enabled && !record?.clockIn) {
        const now = new Date();
        const reminderTime = this.parseTime(alerts.clockInReminder.time);

        if (now.getHours() === reminderTime.hours && now.getMinutes() === reminderTime.minutes) {
          this.emit('alert', {
            userId,
            type: 'clockInReminder',
            message: alerts.clockInReminder.message,
          });
        }
      }

      // 残業アラート
      if (
        alerts.overtimeWarning.enabled &&
        status.isOvertime &&
        !this.isAlertSent(userId, 'overtime')
      ) {
        this.emit('alert', {
          userId,
          type: 'overtimeWarning',
          message: alerts.overtimeWarning.message,
        });
      }

      // 休憩アラート
      if (alerts.breakReminder.enabled && status.status === 'working') {
        if (
          status.workDuration >= alerts.breakReminder.afterMinutes &&
          !this.isAlertSent(userId, 'break')
        ) {
          this.emit('alert', {
            userId,
            type: 'breakReminder',
            message: alerts.breakReminder.message,
          });
        }
      }

      // 退勤アラート
      if (alerts.clockOutReminder.enabled && status.status === 'working') {
        const workHours = status.workDuration / 60;
        if (
          workHours >= alerts.clockOutReminder.afterHours &&
          !this.isAlertSent(userId, 'clockOut')
        ) {
          this.emit('alert', {
            userId,
            type: 'clockOutReminder',
            message: alerts.clockOutReminder.message,
          });
        }
      }
    }
  }

  /**
   * 時間解析ヘルパー
   */
  private parseTime(timeString: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  }

  /**
   * アラート送信済みチェック
   */
  private isAlertSent(userId: string, alertType: string): boolean {
    // 簡略化：実際の実装ではアラート履歴を管理
    return false;
  }

  /**
   * アクティブレコード更新
   */
  private updateActiveRecords(): void {
    for (const record of this.timeRecords.values()) {
      if (record.status === 'working' || record.status === 'on_break') {
        this.calculateBreakTime(record);
        if (record.clockOut) {
          this.calculateWorkTime(record);
        }
      }
    }
  }

  /**
   * 日次処理
   */
  private processDailyTasks(): void {
    console.log('🌅 日次勤怠処理を実行中...');

    // 未打刻チェック
    for (const [userId] of this.alertSettings) {
      const record = this.getTodaysRecord(userId);
      if (record && record.clockIn && !record.clockOut) {
        // 自動退勤処理または警告
        this.emit('missingClockOut', { userId, recordId: record.id });
      }
    }
  }

  /**
   * 勤務パターンの更新
   */
  public async updateWorkPattern(userId: string, pattern: Partial<WorkPattern>): Promise<void> {
    const existingPattern = this.workPatterns.get(userId);
    if (existingPattern) {
      const updatedPattern = { ...existingPattern, ...pattern, updatedAt: new Date() };
      this.workPatterns.set(userId, updatedPattern);
    }

    this.emit('workPatternUpdated', { userId, pattern });
  }

  /**
   * アラート設定の更新
   */
  public async updateAlertSettings(
    userId: string,
    settings: Partial<AlertSettings>
  ): Promise<void> {
    const existingSettings = this.alertSettings.get(userId);
    if (existingSettings) {
      const updatedSettings = { ...existingSettings, ...settings };
      this.alertSettings.set(userId, updatedSettings);
    }

    this.emit('alertSettingsUpdated', { userId, settings });
  }

  /**
   * 勤怠統計の取得
   */
  public getTimeStatistics(userId: string, startDate: Date, endDate: Date): TimeStatistics {
    const records = Array.from(this.timeRecords.values()).filter(
      (record) =>
        record.userId === userId &&
        new Date(record.date) >= startDate &&
        new Date(record.date) <= endDate
    );

    const totalWorkDays = records.length;
    const totalWorkHours = records.reduce((sum, record) => sum + record.totalWorkMinutes, 0);
    const totalOvertimeHours = records.reduce((sum, record) => sum + record.overtimeMinutes, 0);
    const totalBreakHours = records.reduce((sum, record) => sum + record.totalBreakMinutes, 0);

    const workDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const attendanceRate = totalWorkDays > 0 ? (totalWorkDays / workDays) * 100 : 0;

    return {
      userId,
      period: {
        start: startDate,
        end: endDate,
        type:
          workDays <= 1
            ? 'daily'
            : workDays <= 7
              ? 'weekly'
              : workDays <= 31
                ? 'monthly'
                : 'yearly',
      },
      totalWorkDays,
      totalWorkHours,
      totalOvertimeHours,
      totalBreakHours,
      averageWorkHours: totalWorkDays > 0 ? totalWorkHours / totalWorkDays : 0,
      attendanceRate,
      punctualityRate: 95, // 簡略化
      longestWorkDay: records.length > 0 ? Math.max(...records.map((r) => r.totalWorkMinutes)) : 0,
      shortestWorkDay: records.length > 0 ? Math.min(...records.map((r) => r.totalWorkMinutes)) : 0,
      workPatternCompliance: 90, // 簡略化
      lateArrivals: 0, // 簡略化
      earlyDepartures: 0, // 簡略化
      missedDays: Math.max(0, workDays - totalWorkDays),
      workFromHomeDays: records.filter((r) => r.location?.type === 'home').length,
      calculatedAt: new Date(),
    };
  }

  /**
   * レコード一覧取得
   */
  public getTimeRecords(userId: string, startDate?: Date, endDate?: Date): TimeRecord[] {
    let records = Array.from(this.timeRecords.values()).filter(
      (record) => record.userId === userId
    );

    if (startDate) {
      records = records.filter((record) => new Date(record.date) >= startDate);
    }

    if (endDate) {
      records = records.filter((record) => new Date(record.date) <= endDate);
    }

    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * 勤務パターン取得
   */
  public getWorkPattern(userId: string): WorkPattern | undefined {
    return this.workPatterns.get(userId);
  }

  /**
   * アラート設定取得
   */
  public getAlertSettings(userId: string): AlertSettings | undefined {
    return this.alertSettings.get(userId);
  }

  /**
   * サービス停止
   */
  public stop(): void {
    // すべての自動追跡を停止
    for (const interval of this.activeSessionIntervals.values()) {
      clearInterval(interval);
    }
    this.activeSessionIntervals.clear();

    console.log('⏰ 勤怠管理サービスを停止しました');
  }
}

export default TimeTrackingService;
