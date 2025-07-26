/**
 * ⚙️ 勤務パターン設定サービス
 * 標準勤務時間・休憩時間・残業計算基準・労働時間上限設定
 * ADHD/ASD特性に応じた個人最適化機能
 */

import { BrowserEventEmitter as EventEmitter } from '@/lib/BrowserEventEmitter';

// 勤務パターン設定型定義
interface WorkPatternSettings {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;

  // 基本勤務時間設定
  standardWorkHours: number; // 標準労働時間（時間）
  startTime: string; // 標準開始時刻 (HH:mm)
  endTime: string; // 標準終了時刻 (HH:mm)

  // 休憩時間設定
  lunchBreakDuration: number; // 昼休憩時間（分）
  lunchBreakStart: string; // 昼休憩開始時刻 (HH:mm)
  shortBreakDuration: number; // 短い休憩時間（分）
  shortBreakFrequency: number; // 短い休憩の頻度（分おき）

  // フレックス設定
  flexTimeEnabled: boolean;
  coreTimeStart?: string; // コアタイム開始 (HH:mm)
  coreTimeEnd?: string; // コアタイム終了 (HH:mm)
  earliestStartTime?: string; // 最早出勤時刻 (HH:mm)
  latestEndTime?: string; // 最遅退勤時刻 (HH:mm)

  // 残業設定
  overtimeThreshold: number; // 残業開始時間（標準勤務時間からの分）
  maxOvertimePerDay: number; // 1日最大残業時間（分）
  maxOvertimePerWeek: number; // 週最大残業時間（分）
  maxOvertimePerMonth: number; // 月最大残業時間（分）

  // 労働時間制限
  maxWorkHoursPerDay: number; // 1日最大労働時間
  maxWorkHoursPerWeek: number; // 週最大労働時間
  requiredRestBetweenDays: number; // 日間必要休息時間（時間）

  // ADHD/ASD特化設定
  cognitiveOptimization: {
    preferredWorkStartTime: string; // 認知機能最適開始時刻
    energyPeakHours: string[]; // エネルギーピーク時間帯
    focusBlockDuration: number; // 集中ブロック時間（分）
    transitionBuffer: number; // タスク間バッファ時間（分）
    sensoryBreakNeeds: 'low' | 'medium' | 'high'; // 感覚休憩ニーズ
    stimulationPreference: 'minimal' | 'moderate' | 'high'; // 刺激度好み
  };

  // 通知設定
  notifications: {
    arrivalReminder: boolean; // 出勤リマインダー
    breakReminder: boolean; // 休憩リマインダー
    overtimeWarning: boolean; // 残業警告
    departureReminder: boolean; // 退勤リマインダー
    weeklyLimitWarning: boolean; // 週間制限警告
    monthlyLimitWarning: boolean; // 月間制限警告
  };

  // 例外設定
  exceptions: WorkPatternException[];

  createdAt: Date;
  updatedAt: Date;
}

// 例外設定（特定日の勤務パターン変更）
interface WorkPatternException {
  id: string;
  date: Date;
  type: 'holiday' | 'short_day' | 'long_day' | 'custom';
  customStartTime?: string;
  customEndTime?: string;
  customBreakDuration?: number;
  reason?: string;
  isRecurring: boolean;
  recurrenceRule?: {
    frequency: 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
}

// プリセットテンプレート
interface WorkPatternTemplate {
  id: string;
  name: string;
  description: string;
  category: 'standard' | 'adhd_friendly' | 'flexible' | 'strict';
  targetGroup: string[];
  settings: Partial<WorkPatternSettings>;
  benefits: string[];
  considerations: string[];
}

// 設定検証結果
interface ValidationResult {
  isValid: boolean;
  warnings: ValidationWarning[];
  errors: ValidationError[];
  suggestions: string[];
}

interface ValidationWarning {
  field: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export class WorkPatternSettingsService extends EventEmitter {
  private userSettings: Map<string, WorkPatternSettings[]> = new Map();
  private templates: WorkPatternTemplate[] = [];

  constructor() {
    super();
    this.initializeTemplates();
    this.initializeDemoData();
  }

  /**
   * テンプレートの初期化
   */
  private initializeTemplates(): void {
    this.templates = [
      {
        id: 'standard-9to5',
        name: '標準勤務（9-17時）',
        description: '一般的な9時-17時勤務パターン',
        category: 'standard',
        targetGroup: ['一般職', '管理職'],
        settings: {
          standardWorkHours: 8,
          startTime: '09:00',
          endTime: '17:00',
          lunchBreakDuration: 60,
          lunchBreakStart: '12:00',
          shortBreakDuration: 15,
          shortBreakFrequency: 120,
          overtimeThreshold: 0,
          maxOvertimePerDay: 180,
          maxOvertimePerWeek: 720,
          maxOvertimePerMonth: 2880,
        },
        benefits: ['安定したリズム', 'チーム連携しやすい', '社会的標準'],
        considerations: ['柔軟性に欠ける', '個人差を考慮しない'],
      },
      {
        id: 'adhd-optimized',
        name: 'ADHD最適化パターン',
        description: 'ADHD特性に配慮した柔軟な勤務パターン',
        category: 'adhd_friendly',
        targetGroup: ['ADHD', '注意欠陥'],
        settings: {
          standardWorkHours: 7.5,
          startTime: '10:00',
          endTime: '18:00',
          lunchBreakDuration: 45,
          lunchBreakStart: '13:00',
          shortBreakDuration: 10,
          shortBreakFrequency: 90,
          flexTimeEnabled: true,
          coreTimeStart: '11:00',
          coreTimeEnd: '15:00',
          cognitiveOptimization: {
            preferredWorkStartTime: '10:00',
            energyPeakHours: ['10:00-12:00', '14:00-16:00'],
            focusBlockDuration: 90,
            transitionBuffer: 15,
            sensoryBreakNeeds: 'high',
            stimulationPreference: 'moderate',
          },
        },
        benefits: ['集中力の最適化', '感覚的配慮', '柔軟性確保'],
        considerations: ['チーム調整が必要', '理解促進が重要'],
      },
      {
        id: 'asd-structured',
        name: 'ASD構造化パターン',
        description: 'ASD特性に配慮した構造化された勤務パターン',
        category: 'adhd_friendly',
        targetGroup: ['ASD', '自閉症スペクトラム'],
        settings: {
          standardWorkHours: 8,
          startTime: '09:00',
          endTime: '17:00',
          lunchBreakDuration: 60,
          lunchBreakStart: '12:00',
          shortBreakDuration: 20,
          shortBreakFrequency: 120,
          flexTimeEnabled: false,
          cognitiveOptimization: {
            preferredWorkStartTime: '09:00',
            energyPeakHours: ['09:00-11:00', '14:00-16:00'],
            focusBlockDuration: 120,
            transitionBuffer: 10,
            sensoryBreakNeeds: 'medium',
            stimulationPreference: 'minimal',
          },
        },
        benefits: ['予測可能性', '構造化された環境', '感覚負荷軽減'],
        considerations: ['変更への適応に時間', '環境調整が重要'],
      },
      {
        id: 'flexible-remote',
        name: 'フレキシブルリモート',
        description: 'リモートワーク向けの柔軟なパターン',
        category: 'flexible',
        targetGroup: ['リモートワーカー', 'フリーランス'],
        settings: {
          standardWorkHours: 8,
          startTime: '09:00',
          endTime: '18:00',
          lunchBreakDuration: 30,
          lunchBreakStart: '12:30',
          shortBreakDuration: 15,
          shortBreakFrequency: 120,
          flexTimeEnabled: true,
          earliestStartTime: '07:00',
          latestEndTime: '22:00',
          overtimeThreshold: 30,
        },
        benefits: ['高い柔軟性', 'ワークライフバランス', '効率性重視'],
        considerations: ['自己管理が重要', 'オーバーワークリスク'],
      },
    ];
  }

  /**
   * デモデータの初期化
   */
  private initializeDemoData(): void {
    const demoUserId = 'demo-user';
    const defaultPattern: WorkPatternSettings = {
      id: 'default-pattern',
      userId: demoUserId,
      name: 'デフォルトパターン',
      isDefault: true,
      isActive: true,

      standardWorkHours: 8,
      startTime: '09:00',
      endTime: '18:00',

      lunchBreakDuration: 60,
      lunchBreakStart: '12:00',
      shortBreakDuration: 15,
      shortBreakFrequency: 120,

      flexTimeEnabled: true,
      coreTimeStart: '10:00',
      coreTimeEnd: '15:00',
      earliestStartTime: '08:00',
      latestEndTime: '20:00',

      overtimeThreshold: 0,
      maxOvertimePerDay: 180, // 3時間
      maxOvertimePerWeek: 720, // 12時間
      maxOvertimePerMonth: 2880, // 48時間

      maxWorkHoursPerDay: 12,
      maxWorkHoursPerWeek: 48,
      requiredRestBetweenDays: 11,

      cognitiveOptimization: {
        preferredWorkStartTime: '09:30',
        energyPeakHours: ['09:30-11:30', '14:00-16:00'],
        focusBlockDuration: 90,
        transitionBuffer: 15,
        sensoryBreakNeeds: 'medium',
        stimulationPreference: 'moderate',
      },

      notifications: {
        arrivalReminder: true,
        breakReminder: true,
        overtimeWarning: true,
        departureReminder: true,
        weeklyLimitWarning: true,
        monthlyLimitWarning: true,
      },

      exceptions: [
        {
          id: 'friday-short',
          date: new Date(2024, 11, 6), // 毎週金曜日
          type: 'short_day',
          customEndTime: '16:00',
          reason: '金曜日短縮勤務',
          isRecurring: true,
          recurrenceRule: {
            frequency: 'weekly',
            interval: 1,
          },
        },
      ],

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.userSettings.set(demoUserId, [defaultPattern]);
  }

  /**
   * ユーザーの勤務パターン設定を取得
   */
  getUserPatterns(userId: string): WorkPatternSettings[] {
    return this.userSettings.get(userId) || [];
  }

  /**
   * アクティブな勤務パターンを取得
   */
  getActivePattern(userId: string): WorkPatternSettings | null {
    const patterns = this.getUserPatterns(userId);
    return patterns.find((p) => p.isActive) || null;
  }

  /**
   * デフォルトパターンを取得
   */
  getDefaultPattern(userId: string): WorkPatternSettings | null {
    const patterns = this.getUserPatterns(userId);
    return patterns.find((p) => p.isDefault) || null;
  }

  /**
   * テンプレート一覧を取得
   */
  getTemplates(): WorkPatternTemplate[] {
    return this.templates;
  }

  /**
   * カテゴリ別テンプレートを取得
   */
  getTemplatesByCategory(category: string): WorkPatternTemplate[] {
    return this.templates.filter((t) => t.category === category);
  }

  /**
   * 新しい勤務パターンを作成
   */
  createPattern(
    userId: string,
    pattern: Omit<WorkPatternSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): string {
    const id = `pattern-${Date.now()}`;
    const newPattern: WorkPatternSettings = {
      ...pattern,
      id,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 新しいパターンがアクティブな場合、他のパターンを非アクティブにする
    if (newPattern.isActive) {
      this.setActivePattern(userId, id);
    }

    const userPatterns = this.getUserPatterns(userId);
    userPatterns.push(newPattern);
    this.userSettings.set(userId, userPatterns);

    this.emit('patternCreated', { userId, pattern: newPattern });
    return id;
  }

  /**
   * 勤務パターンを更新
   */
  updatePattern(userId: string, patternId: string, updates: Partial<WorkPatternSettings>): boolean {
    const userPatterns = this.getUserPatterns(userId);
    const patternIndex = userPatterns.findIndex((p) => p.id === patternId);

    if (patternIndex === -1) return false;

    const updatedPattern = {
      ...userPatterns[patternIndex],
      ...updates,
      updatedAt: new Date(),
    };

    // バリデーション
    const validation = this.validatePattern(updatedPattern);
    if (!validation.isValid) {
      this.emit('validationError', { userId, patternId, validation });
      return false;
    }

    userPatterns[patternIndex] = updatedPattern;
    this.userSettings.set(userId, userPatterns);

    this.emit('patternUpdated', { userId, pattern: updatedPattern });
    return true;
  }

  /**
   * 勤務パターンを削除
   */
  deletePattern(userId: string, patternId: string): boolean {
    const userPatterns = this.getUserPatterns(userId);
    const pattern = userPatterns.find((p) => p.id === patternId);

    if (!pattern) return false;
    if (pattern.isDefault) {
      this.emit('error', { message: 'デフォルトパターンは削除できません' });
      return false;
    }

    const filteredPatterns = userPatterns.filter((p) => p.id !== patternId);
    this.userSettings.set(userId, filteredPatterns);

    // 削除されたパターンがアクティブだった場合、デフォルトをアクティブにする
    if (pattern.isActive) {
      const defaultPattern = filteredPatterns.find((p) => p.isDefault);
      if (defaultPattern) {
        this.setActivePattern(userId, defaultPattern.id);
      }
    }

    this.emit('patternDeleted', { userId, patternId });
    return true;
  }

  /**
   * アクティブパターンを設定
   */
  setActivePattern(userId: string, patternId: string): boolean {
    const userPatterns = this.getUserPatterns(userId);

    // 全てのパターンを非アクティブにする
    userPatterns.forEach((p) => {
      p.isActive = false;
    });

    // 指定されたパターンをアクティブにする
    const targetPattern = userPatterns.find((p) => p.id === patternId);
    if (!targetPattern) return false;

    targetPattern.isActive = true;
    targetPattern.updatedAt = new Date();

    this.userSettings.set(userId, userPatterns);
    this.emit('activePatternChanged', { userId, patternId, pattern: targetPattern });
    return true;
  }

  /**
   * テンプレートから勤務パターンを作成
   */
  createFromTemplate(userId: string, templateId: string, customName?: string): string | null {
    const template = this.templates.find((t) => t.id === templateId);
    if (!template) return null;

    const newPattern: Omit<WorkPatternSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      name: customName || template.name,
      isDefault: false,
      isActive: false,

      // デフォルト値
      standardWorkHours: 8,
      startTime: '09:00',
      endTime: '17:00',
      lunchBreakDuration: 60,
      lunchBreakStart: '12:00',
      shortBreakDuration: 15,
      shortBreakFrequency: 120,
      flexTimeEnabled: false,
      overtimeThreshold: 0,
      maxOvertimePerDay: 180,
      maxOvertimePerWeek: 720,
      maxOvertimePerMonth: 2880,
      maxWorkHoursPerDay: 12,
      maxWorkHoursPerWeek: 48,
      requiredRestBetweenDays: 11,
      cognitiveOptimization: {
        preferredWorkStartTime: '09:00',
        energyPeakHours: ['09:00-11:00', '14:00-16:00'],
        focusBlockDuration: 90,
        transitionBuffer: 15,
        sensoryBreakNeeds: 'medium',
        stimulationPreference: 'moderate',
      },
      notifications: {
        arrivalReminder: true,
        breakReminder: true,
        overtimeWarning: true,
        departureReminder: true,
        weeklyLimitWarning: true,
        monthlyLimitWarning: true,
      },
      exceptions: [],

      // テンプレート設定で上書き
      ...template.settings,
    };

    return this.createPattern(userId, newPattern);
  }

  /**
   * 勤務パターンの検証
   */
  validatePattern(pattern: WorkPatternSettings): ValidationResult {
    const warnings: ValidationWarning[] = [];
    const errors: ValidationError[] = [];
    const suggestions: string[] = [];

    // 基本時間の検証
    const startHour = parseInt(pattern.startTime.split(':')[0]);
    const endHour = parseInt(pattern.endTime.split(':')[0]);

    if (startHour >= endHour) {
      errors.push({
        field: 'endTime',
        message: '終了時刻は開始時刻より後である必要があります',
        code: 'INVALID_TIME_RANGE',
      });
    }

    // 労働時間の検証
    if (pattern.standardWorkHours > 12) {
      warnings.push({
        field: 'standardWorkHours',
        message: '1日12時間を超える労働時間は法的制限があります',
        severity: 'high',
      });
    }

    // 残業時間の検証
    if (pattern.maxOvertimePerMonth > 3600) {
      // 60時間
      errors.push({
        field: 'maxOvertimePerMonth',
        message: '月60時間を超える残業は法的制限があります',
        code: 'OVERTIME_LIMIT_EXCEEDED',
      });
    }

    // ADHD/ASD特化の検証と提案
    if (pattern.cognitiveOptimization.focusBlockDuration > 120) {
      suggestions.push('長時間の集中ブロックは疲労を招く可能性があります。90分以下を推奨します');
    }

    if (
      pattern.cognitiveOptimization.sensoryBreakNeeds === 'high' &&
      pattern.shortBreakFrequency > 90
    ) {
      suggestions.push('感覚的休憩ニーズが高い場合、より頻繁な休憩（60-90分おき）を推奨します');
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      suggestions,
    };
  }

  /**
   * 例外日を追加
   */
  addException(
    userId: string,
    patternId: string,
    exception: Omit<WorkPatternException, 'id'>
  ): string | null {
    const userPatterns = this.getUserPatterns(userId);
    const pattern = userPatterns.find((p) => p.id === patternId);

    if (!pattern) return null;

    const exceptionId = `exception-${Date.now()}`;
    const newException: WorkPatternException = {
      ...exception,
      id: exceptionId,
    };

    pattern.exceptions.push(newException);
    pattern.updatedAt = new Date();

    this.userSettings.set(userId, userPatterns);
    this.emit('exceptionAdded', { userId, patternId, exception: newException });

    return exceptionId;
  }

  /**
   * 例外日を削除
   */
  removeException(userId: string, patternId: string, exceptionId: string): boolean {
    const userPatterns = this.getUserPatterns(userId);
    const pattern = userPatterns.find((p) => p.id === patternId);

    if (!pattern) return false;

    const originalLength = pattern.exceptions.length;
    pattern.exceptions = pattern.exceptions.filter((e) => e.id !== exceptionId);

    if (pattern.exceptions.length < originalLength) {
      pattern.updatedAt = new Date();
      this.userSettings.set(userId, userPatterns);
      this.emit('exceptionRemoved', { userId, patternId, exceptionId });
      return true;
    }

    return false;
  }

  /**
   * 特定日の勤務パターンを取得（例外考慮）
   */
  getPatternForDate(userId: string, date: Date): WorkPatternSettings {
    const activePattern = this.getActivePattern(userId);
    if (!activePattern) {
      return this.getDefaultPattern(userId)!;
    }

    // 例外日をチェック
    const dateString = date.toDateString();
    const exception = activePattern.exceptions.find((e) => {
      if (e.isRecurring && e.recurrenceRule) {
        // 繰り返し例外の処理（簡略化）
        const dayOfWeek = date.getDay();
        const exceptionDayOfWeek = e.date.getDay();
        return dayOfWeek === exceptionDayOfWeek;
      }
      return e.date.toDateString() === dateString;
    });

    if (exception) {
      // 例外設定を適用したパターンを返す
      return {
        ...activePattern,
        startTime: exception.customStartTime || activePattern.startTime,
        endTime: exception.customEndTime || activePattern.endTime,
        lunchBreakDuration: exception.customBreakDuration || activePattern.lunchBreakDuration,
      };
    }

    return activePattern;
  }

  /**
   * 推奨勤務パターンを生成（ADHD/ASD特性に基づく）
   */
  generateRecommendedPattern(userId: string, cognitiveProfile: any): Partial<WorkPatternSettings> {
    const recommendations: Partial<WorkPatternSettings> = {};

    // 認知特性に基づく推奨
    if (cognitiveProfile.attentionalControl < 85) {
      recommendations.shortBreakFrequency = 60; // より頻繁な休憩
      recommendations.cognitiveOptimization = {
        preferredWorkStartTime: '09:00',
        energyPeakHours: ['09:00-11:00', '14:00-16:00'],
        focusBlockDuration: 60,
        transitionBuffer: 20,
        sensoryBreakNeeds: 'high',
        stimulationPreference: 'moderate',
      };
    }

    if (cognitiveProfile.processingSpeed < 85) {
      recommendations.flexTimeEnabled = true;
      recommendations.cognitiveOptimization = {
        preferredWorkStartTime: '10:00',
        energyPeakHours: ['10:00-12:00', '14:00-16:00'],
        focusBlockDuration: 90,
        transitionBuffer: 15,
        sensoryBreakNeeds: 'medium',
        stimulationPreference: 'minimal',
      };
    }

    return recommendations;
  }
}

export default WorkPatternSettingsService;
