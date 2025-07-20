/**
 * 🪒 髭剃り習慣サポートサービス
 * 毎日の髭剃りを確実に実現するための包括的支援システム
 */

class EventEmitter {
  private events: { [key: string]: ((...args: any[]) => void)[] } = {};

  on(event: string, listener: (...args: any[]) => void): void {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
  }

  off(event: string, listener: (...args: any[]) => void): void {
    if (!this.events[event]) return;
    const index = this.events[event].indexOf(listener);
    if (index > -1) this.events[event].splice(index, 1);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach((listener) => {
      try {
        listener(...args);
      } catch (error) {
        console.error(error);
      }
    });
  }
}

export interface ShavingRecord {
  id: string;
  date: Date;
  completed: boolean;
  shavingType: 'electric' | 'safety_razor' | 'cartridge' | 'disposable';
  method: 'dry_shave' | 'with_cream' | 'with_gel' | 'with_soap';
  duration: number; // 分
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  quality: 'perfect' | 'good' | 'adequate' | 'rushed' | 'skipped_areas';
  skinCondition: 'excellent' | 'good' | 'normal' | 'irritated' | 'cuts';
  barriers: ShavingBarrier[];
  completionTime: string; // HH:MM
  notes: string;
  streakDay: number;
  bladeCondition?: 'new' | 'good' | 'dull' | 'needs_replacement';
}

export interface ShavingBarrier {
  type:
    | 'time_pressure'
    | 'fatigue'
    | 'procrastination'
    | 'skin_sensitivity'
    | 'blade_dull'
    | 'no_cream'
    | 'executive_dysfunction'
    | 'sensory_issues'
    | 'morning_rush'
    | 'forgot_routine';
  severity: number; // 1-5
  description: string;
}

export interface ShavingPreferences {
  preferredTime: string; // HH:MM
  preferredMethod: 'electric' | 'safety_razor' | 'cartridge' | 'disposable';
  skinType: 'normal' | 'sensitive' | 'oily' | 'dry';
  bladeReplacementFrequency: number; // 日数
  reminderSettings: {
    enabled: boolean;
    times: string[]; // HH:MM[]
    escalationMinutes: number;
    emergencyMode: boolean;
  };
  goals: {
    dailyConsistency: boolean;
    qualityFocus: boolean;
    timeEfficiency: boolean;
    skinCare: boolean;
  };
}

export interface ShavingStats {
  currentStreak: number;
  longestStreak: number;
  monthlySuccessRate: number;
  averageDuration: number;
  preferredTimeSlot: string;
  commonBarriers: { type: string; frequency: number }[];
  qualityTrend: 'improving' | 'stable' | 'declining';
  skinHealthScore: number;
}

export interface ShavingMilestone {
  days: number;
  title: string;
  description: string;
  badge: string;
  reward: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface ShavingEmergencyAction {
  id: string;
  title: string;
  description: string;
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  effectiveness: number; // 1-10
}

class ShavingHabitService extends EventEmitter {
  private records: ShavingRecord[] = [];
  private preferences: ShavingPreferences;
  private milestones: ShavingMilestone[] = [];
  private reminderTimer: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.loadData();
    this.initializeMilestones();
    this.setupReminders();
  }

  private loadData(): void {
    const savedRecords = localStorage.getItem('shaving_records');
    const savedPreferences = localStorage.getItem('shaving_preferences');

    if (savedRecords) {
      this.records = JSON.parse(savedRecords).map((record: any) => ({
        ...record,
        date: new Date(record.date),
      }));
    }

    this.preferences = savedPreferences
      ? JSON.parse(savedPreferences)
      : this.getDefaultPreferences();
  }

  private saveData(): void {
    localStorage.setItem('shaving_records', JSON.stringify(this.records));
    localStorage.setItem('shaving_preferences', JSON.stringify(this.preferences));
  }

  private getDefaultPreferences(): ShavingPreferences {
    return {
      preferredTime: '07:00',
      preferredMethod: 'electric',
      skinType: 'normal',
      bladeReplacementFrequency: 7,
      reminderSettings: {
        enabled: true,
        times: ['07:00', '08:00', '08:30'],
        escalationMinutes: 30,
        emergencyMode: true,
      },
      goals: {
        dailyConsistency: true,
        qualityFocus: false,
        timeEfficiency: true,
        skinCare: false,
      },
    };
  }

  private initializeMilestones(): void {
    this.milestones = [
      {
        days: 3,
        title: '🪒 髭剃りスタート',
        description: '3日連続で髭剃り完了！',
        badge: '🌱',
        reward: 'シェービング基礎ガイド解放',
        unlocked: false,
      },
      {
        days: 7,
        title: '📅 1週間キープ',
        description: '1週間毎日髭剃りを継続！',
        badge: '⭐',
        reward: '剃り方テクニック解放',
        unlocked: false,
      },
      {
        days: 14,
        title: '🎯 2週間の習慣',
        description: '2週間の継続で習慣化開始！',
        badge: '🏆',
        reward: '高級シェービングクリーム推奨',
        unlocked: false,
      },
      {
        days: 21,
        title: '🧠 習慣の力',
        description: '21日で脳の習慣回路が形成！',
        badge: '💎',
        reward: 'カスタムシェービングプラン',
        unlocked: false,
      },
      {
        days: 30,
        title: '👑 1ヶ月マスター',
        description: '30日連続達成でマスターレベル！',
        badge: '👑',
        reward: 'シェービング上級者認定',
        unlocked: false,
      },
      {
        days: 50,
        title: '🌟 エキスパート',
        description: '50日継続でエキスパート認定！',
        badge: '🌟',
        reward: 'プレミアムシェービングセット',
        unlocked: false,
      },
      {
        days: 100,
        title: '🏅 レジェンド',
        description: '100日達成！髭剃りレジェンド！',
        badge: '🏅',
        reward: '永続記念バッジ',
        unlocked: false,
      },
    ];
  }

  // 髭剃り記録を追加
  recordShaving(shavingData: Partial<ShavingRecord>): ShavingRecord {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 今日の記録を確認
    const existingRecord = this.records.find((record) => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
    });

    if (existingRecord) {
      // 既存記録を更新
      Object.assign(existingRecord, shavingData);
      this.saveData();
      this.emit('shaving_updated', existingRecord);
      return existingRecord;
    }

    // 新規記録を作成
    const newRecord: ShavingRecord = {
      id: Date.now().toString(),
      date: today,
      completed: true,
      shavingType: 'electric',
      method: 'dry_shave',
      duration: 5,
      timeOfDay: 'morning',
      quality: 'good',
      skinCondition: 'normal',
      barriers: [],
      completionTime: new Date().toTimeString().slice(0, 5),
      notes: '',
      streakDay: this.calculateCurrentStreak() + 1,
      ...shavingData,
    };

    this.records.push(newRecord);
    this.saveData();
    this.checkMilestones();
    this.emit('shaving_recorded', newRecord);

    return newRecord;
  }

  // 現在のストリークを計算
  calculateCurrentStreak(): number {
    if (this.records.length === 0) return 0;

    const sortedRecords = this.records
      .filter((record) => record.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const record of sortedRecords) {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);

      if (recordDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
      } else if (recordDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  }

  // 統計情報を取得
  getStats(): ShavingStats {
    const currentStreak = this.calculateCurrentStreak();
    const longestStreak = this.calculateLongestStreak();

    const last30Days = this.records.filter((record) => {
      const daysDiff = (Date.now() - new Date(record.date).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    });

    const monthlySuccessRate = (last30Days.filter((r) => r.completed).length / 30) * 100;

    const averageDuration =
      last30Days.length > 0
        ? last30Days.reduce((sum, record) => sum + record.duration, 0) / last30Days.length
        : 0;

    const timeSlots = last30Days.reduce(
      (acc, record) => {
        acc[record.timeOfDay] = (acc[record.timeOfDay] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const preferredTimeSlot = Object.keys(timeSlots).reduce(
      (a, b) => (timeSlots[a] > timeSlots[b] ? a : b),
      'morning'
    );

    const barrierCounts = last30Days
      .flatMap((r) => r.barriers)
      .reduce(
        (acc, barrier) => {
          acc[barrier.type] = (acc[barrier.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

    const commonBarriers = Object.entries(barrierCounts)
      .map(([type, frequency]) => ({ type, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3);

    const qualityScores = last30Days.map((r) => {
      switch (r.quality) {
        case 'perfect':
          return 5;
        case 'good':
          return 4;
        case 'adequate':
          return 3;
        case 'rushed':
          return 2;
        case 'skipped_areas':
          return 1;
        default:
          return 3;
      }
    });

    const recentQuality =
      qualityScores.slice(-7).reduce((a, b) => a + b, 0) /
      Math.max(qualityScores.slice(-7).length, 1);
    const olderQuality =
      qualityScores.slice(-14, -7).reduce((a, b) => a + b, 0) /
      Math.max(qualityScores.slice(-14, -7).length, 1);

    const qualityTrend =
      recentQuality > olderQuality + 0.2
        ? 'improving'
        : recentQuality < olderQuality - 0.2
          ? 'declining'
          : 'stable';

    const skinHealthScore =
      last30Days.reduce((score, record) => {
        switch (record.skinCondition) {
          case 'excellent':
            return score + 5;
          case 'good':
            return score + 4;
          case 'normal':
            return score + 3;
          case 'irritated':
            return score + 2;
          case 'cuts':
            return score + 1;
          default:
            return score + 3;
        }
      }, 0) / Math.max(last30Days.length, 1);

    return {
      currentStreak,
      longestStreak,
      monthlySuccessRate,
      averageDuration,
      preferredTimeSlot,
      commonBarriers,
      qualityTrend,
      skinHealthScore,
    };
  }

  private calculateLongestStreak(): number {
    if (this.records.length === 0) return 0;

    const sortedRecords = this.records
      .filter((record) => record.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let maxStreak = 0;
    let currentStreak = 0;
    let expectedDate = new Date(sortedRecords[0]?.date || new Date());

    for (const record of sortedRecords) {
      const recordDate = new Date(record.date);

      if (recordDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }

      expectedDate = new Date(recordDate.getTime() + 24 * 60 * 60 * 1000);
    }

    return maxStreak;
  }

  // マイルストーンチェック
  private checkMilestones(): void {
    const currentStreak = this.calculateCurrentStreak();

    this.milestones.forEach((milestone) => {
      if (!milestone.unlocked && currentStreak >= milestone.days) {
        milestone.unlocked = true;
        milestone.unlockedAt = new Date();
        this.emit('milestone_unlocked', milestone);
      }
    });
  }

  // 緊急モード用の簡単な髭剃りオプション
  getEmergencyShavingOptions(): ShavingEmergencyAction[] {
    return [
      {
        id: 'quick_electric',
        title: '⚡ 2分電気シェーバー',
        description: '電気シェーバーで顔全体を素早く剃る',
        estimatedTime: 2,
        difficulty: 'easy',
        effectiveness: 7,
      },
      {
        id: 'focus_visible',
        title: '👁️ 見える部分だけ',
        description: '首、あご周りなど目立つ部分だけを剃る',
        estimatedTime: 3,
        difficulty: 'easy',
        effectiveness: 6,
      },
      {
        id: 'dry_cartridge',
        title: '🪒 ドライ剃り',
        description: 'シェービングクリームなしで軽く剃る',
        estimatedTime: 4,
        difficulty: 'medium',
        effectiveness: 5,
      },
      {
        id: 'stubble_trim',
        title: '✂️ 髭トリマー',
        description: 'トリマーで全体を短くカット',
        estimatedTime: 3,
        difficulty: 'easy',
        effectiveness: 6,
      },
      {
        id: 'postpone_evening',
        title: '🌙 夕方に延期',
        description: '今は諦めて夕方に丁寧に剃る',
        estimatedTime: 0,
        difficulty: 'easy',
        effectiveness: 3,
      },
    ];
  }

  // リマインダー設定
  private setupReminders(): void {
    if (!this.preferences.reminderSettings.enabled) return;

    // 毎日のリマインダーチェック
    setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);

      // 今日髭剃りしたかチェック
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayRecord = this.records.find((record) => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === today.getTime() && record.completed;
      });

      if (!todayRecord && this.preferences.reminderSettings.times.includes(currentTime)) {
        this.sendReminder('standard');
      }
    }, 60000); // 1分ごとにチェック
  }

  private sendReminder(type: 'standard' | 'urgent' | 'emergency'): void {
    const stats = this.getStats();
    const messages = {
      standard: [
        `🪒 髭剃りタイムです！現在${stats.currentStreak}日連続継続中`,
        '📅 今日も髭剃りで清潔感をキープしましょう',
        '⏰ 髭剃りの時間になりました',
      ],
      urgent: [
        '🚨 髭剃りリマインダー：いつもより1時間遅れています',
        '⚠️ 緊急：髭剃りを忘れていませんか？',
      ],
      emergency: [
        '🆘 最終警告：今日の髭剃りをお忘れですか？',
        '💔 せっかくの継続記録が途切れてしまいます',
      ],
    };

    const randomMessage = messages[type][Math.floor(Math.random() * messages[type].length)];

    this.emit('reminder', {
      type,
      message: randomMessage,
      stats,
      emergencyOptions: type === 'emergency' ? this.getEmergencyShavingOptions() : undefined,
    });
  }

  // 設定更新
  updatePreferences(newPreferences: Partial<ShavingPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.saveData();
    this.emit('preferences_updated', this.preferences);
  }

  // データ取得メソッド
  getRecords(): ShavingRecord[] {
    return this.records;
  }

  getPreferences(): ShavingPreferences {
    return this.preferences;
  }

  getMilestones(): ShavingMilestone[] {
    return this.milestones;
  }

  // 今日の記録を取得
  getTodayRecord(): ShavingRecord | undefined {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.records.find((record) => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
    });
  }

  // 障害を記録
  recordBarrier(barrier: ShavingBarrier): void {
    const todayRecord = this.getTodayRecord();
    if (todayRecord) {
      todayRecord.barriers.push(barrier);
      this.saveData();
      this.emit('barrier_recorded', barrier);
    }
  }

  // ガイダンス生成
  generateShavingGuidance(): string {
    const stats = this.getStats();
    const todayRecord = this.getTodayRecord();

    if (todayRecord?.completed) {
      return '✅ 今日はもう髭剃り完了済みです！素晴らしい継続力ですね。';
    }

    const messages = [
      `🎯 現在${stats.currentStreak}日連続で継続中！この調子で今日も頑張りましょう`,
      `⏰ あなたの好きな時間帯は${stats.preferredTimeSlot}ですね`,
      `🌟 平均${Math.round(stats.averageDuration)}分で完了しています`,
    ];

    if (stats.commonBarriers.length > 0) {
      const topBarrier = stats.commonBarriers[0];
      messages.push(
        `💡 最近「${topBarrier.type}」が障害になることが多いですね。対策を考えてみましょう`
      );
    }

    return messages[Math.floor(Math.random() * messages.length)];
  }
}

export const shavingHabitService = new ShavingHabitService();
