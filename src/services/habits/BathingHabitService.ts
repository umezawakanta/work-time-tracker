/**
 * 🛁 入浴習慣サポートサービス
 * 毎日の入浴を確実に実現するための包括的支援システム
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

export interface BathingRecord {
  id: string;
  date: Date;
  completed: boolean;
  bathingType: 'full_bath' | 'shower' | 'quick_rinse' | 'body_wipe';
  duration: number; // 分
  temperature: 'hot' | 'warm' | 'lukewarm' | 'cool';
  mood: 'excellent' | 'good' | 'neutral' | 'reluctant' | 'forced';
  barriers: Barrier[];
  completionTime: string; // HH:MM
  notes: string;
  streakDay: number;
}

export interface Barrier {
  type:
    | 'fatigue'
    | 'time_pressure'
    | 'executive_dysfunction'
    | 'sensory_issues'
    | 'depression'
    | 'physical_discomfort'
    | 'other';
  severity: 1 | 2 | 3 | 4 | 5;
  description: string;
  overcame: boolean;
  strategy: string;
}

export interface BathingPlan {
  id: string;
  preferredTime: string; // HH:MM
  backupTimes: string[];
  minimumAcceptable: 'full_bath' | 'shower' | 'quick_rinse' | 'body_wipe';
  preparations: string[];
  motivators: string[];
  emergencyStrategies: string[];
}

export interface BathingReminder {
  id: string;
  scheduledTime: Date;
  type: 'gentle' | 'standard' | 'urgent' | 'emergency';
  message: string;
  escalationLevel: number;
  dismissed: boolean;
  snoozedUntil?: Date;
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  totalBaths: number;
  successRate: number; // 過去30日
  averageTimeOfDay: string;
  mostCommonBarriers: string[];
  mostEffectiveStrategies: string[];
  weeklyPattern: { [key: string]: number };
}

class BathingHabitService extends EventEmitter {
  private static instance: BathingHabitService;
  private currentPlan: BathingPlan | null = null;
  private reminderTimer: NodeJS.Timeout | null = null;
  private escalationTimer: NodeJS.Timeout | null = null;

  private constructor() {
    super();
    this.loadBathingPlan();
    this.setupDailyCheck();
    this.scheduleNextReminder();
  }

  public static getInstance(): BathingHabitService {
    if (!BathingHabitService.instance) {
      BathingHabitService.instance = new BathingHabitService();
    }
    return BathingHabitService.instance;
  }

  /**
   * 入浴記録の登録
   */
  public recordBathing(
    bathingType: BathingRecord['bathingType'],
    duration: number,
    temperature: BathingRecord['temperature'],
    mood: BathingRecord['mood'],
    barriers: Barrier[] = [],
    notes: string = ''
  ): BathingRecord {
    const today = new Date();
    const completionTime = today.toTimeString().slice(0, 5);
    const stats = this.getHabitStats();

    const record: BathingRecord = {
      id: `bathing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: today,
      completed: true,
      bathingType,
      duration,
      temperature,
      mood,
      barriers,
      completionTime,
      notes,
      streakDay: stats.currentStreak + 1,
    };

    this.saveBathingRecord(record);
    this.emit('bathingCompleted', record);

    // 連続記録の確認とお祝い
    if (record.streakDay > stats.longestStreak) {
      this.emit('newStreakRecord', {
        newRecord: record.streakDay,
        previousRecord: stats.longestStreak,
      });
    }

    // マイルストーンの確認
    this.checkMilestones(record.streakDay);

    // リマインダーをクリア
    this.clearTodaysReminders();

    return record;
  }

  /**
   * 入浴をスキップした記録
   */
  public recordSkip(
    reason: string,
    barriers: Barrier[],
    alternativeAction?: string
  ): BathingRecord {
    const today = new Date();

    const record: BathingRecord = {
      id: `skip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: today,
      completed: false,
      bathingType: 'body_wipe', // デフォルト
      duration: 0,
      temperature: 'warm',
      mood: 'reluctant',
      barriers,
      completionTime: '00:00',
      notes: `スキップ理由: ${reason}${alternativeAction ? ` | 代替行動: ${alternativeAction}` : ''}`,
      streakDay: 0,
    };

    this.saveBathingRecord(record);
    this.emit('bathingSkipped', { record, reason });

    // ストリーク途切れの対応
    this.handleStreakBreak();

    return record;
  }

  /**
   * 入浴プランの設定
   */
  public setupBathingPlan(plan: Omit<BathingPlan, 'id'>): BathingPlan {
    const bathingPlan: BathingPlan = {
      id: `plan_${Date.now()}`,
      ...plan,
    };

    this.currentPlan = bathingPlan;
    this.saveBathingPlan();
    this.scheduleNextReminder();

    this.emit('planUpdated', bathingPlan);
    return bathingPlan;
  }

  /**
   * 障害分析と対策提案
   */
  public analyzeBarriers(): {
    frequentBarriers: { type: string; frequency: number; avgSeverity: number }[];
    timePatterns: { time: string; difficulty: number }[];
    recommendations: string[];
    successfulStrategies: string[];
  } {
    const records = this.getAllBathingRecords();
    const barriers = records.flatMap((r) => r.barriers);

    // 頻出障害の分析
    const barrierStats: { [key: string]: { count: number; totalSeverity: number } } = {};
    barriers.forEach((barrier) => {
      if (!barrierStats[barrier.type]) {
        barrierStats[barrier.type] = { count: 0, totalSeverity: 0 };
      }
      barrierStats[barrier.type].count++;
      barrierStats[barrier.type].totalSeverity += barrier.severity;
    });

    const frequentBarriers = Object.entries(barrierStats)
      .map(([type, stats]) => ({
        type,
        frequency: stats.count,
        avgSeverity: stats.totalSeverity / stats.count,
      }))
      .sort((a, b) => b.frequency - a.frequency);

    // 時間パターンの分析
    const timePatterns = this.analyzeTimePatterns(records);

    // 推奨事項の生成
    const recommendations = this.generateRecommendations(frequentBarriers);

    // 成功した戦略
    const successfulStrategies = barriers
      .filter((b) => b.overcame)
      .map((b) => b.strategy)
      .filter((strategy, index, arr) => arr.indexOf(strategy) === index);

    return {
      frequentBarriers,
      timePatterns,
      recommendations,
      successfulStrategies,
    };
  }

  /**
   * 緊急モード：今すぐ入浴を促進
   */
  public activateEmergencyMode(): {
    urgentStrategies: string[];
    minimumActions: string[];
    motivationalMessages: string[];
    timeEstimate: number;
  } {
    const stats = this.getHabitStats();
    const isStreakAtRisk = stats.currentStreak > 7;

    return {
      urgentStrategies: [
        '5分だけの超短時間シャワー',
        '洗髪なしでボディだけ洗う',
        '濡れタオルでの全身拭き取り',
        '足湯だけでもOK',
        '朝シャワーに変更する',
      ],
      minimumActions: [
        '顔と手だけ洗う',
        '足だけお湯で洗う',
        '制汗剤とドライシャンプー使用',
        '清拭用ウェットティッシュで全身',
      ],
      motivationalMessages: [
        isStreakAtRisk
          ? `${stats.currentStreak}日間の記録を守りましょう！`
          : '今日から新しいスタートです',
        '5分だけでも大きな違いがあります',
        '完璧でなくても、実行することが大切',
        '明日の自分が感謝します',
      ],
      timeEstimate: 5,
    };
  }

  /**
   * 習慣統計の取得
   */
  public getHabitStats(): HabitStats {
    const records = this.getAllBathingRecords();
    const completedRecords = records.filter((r) => r.completed);
    const last30Days = records.filter((r) => {
      const daysDiff = (new Date().getTime() - r.date.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 30;
    });

    const currentStreak = this.calculateCurrentStreak(records);
    const longestStreak = this.calculateLongestStreak(records);

    return {
      currentStreak,
      longestStreak,
      totalBaths: completedRecords.length,
      successRate:
        last30Days.length > 0
          ? (last30Days.filter((r) => r.completed).length / last30Days.length) * 100
          : 0,
      averageTimeOfDay: this.calculateAverageTime(completedRecords),
      mostCommonBarriers: this.getMostCommonBarriers(records),
      mostEffectiveStrategies: this.getMostEffectiveStrategies(records),
      weeklyPattern: this.getWeeklyPattern(records),
    };
  }

  /**
   * パーソナライズされたモチベーションメッセージ
   */
  public getMotivationalMessage(): {
    message: string;
    type: 'encouragement' | 'celebration' | 'gentle_push' | 'streak_protection';
    action: string;
  } {
    const stats = this.getHabitStats();
    const todayRecord = this.getTodayRecord();

    if (todayRecord?.completed) {
      return {
        message: `🎉 ${stats.currentStreak}日連続達成！素晴らしいです！`,
        type: 'celebration',
        action: '明日も続けましょう',
      };
    }

    if (stats.currentStreak >= 7) {
      return {
        message: `⚡ ${stats.currentStreak}日間の記録を守るチャンス！`,
        type: 'streak_protection',
        action: '今すぐ入浴しませんか？',
      };
    }

    if (stats.currentStreak === 0) {
      return {
        message: '🌟 新しいスタートを切りましょう！小さな一歩が大きな変化を生みます',
        type: 'encouragement',
        action: '今日から始めてみませんか？',
      };
    }

    return {
      message: `💪 ${stats.currentStreak}日間継続中！調子いいですね`,
      type: 'gentle_push',
      action: '今日も続けて記録を伸ばしましょう',
    };
  }

  // プライベートメソッド

  private setupDailyCheck(): void {
    // 毎日23時に未実行チェック
    const now = new Date();
    const checkTime = new Date();
    checkTime.setHours(23, 0, 0, 0);

    if (checkTime <= now) {
      checkTime.setDate(checkTime.getDate() + 1);
    }

    setTimeout(() => {
      const todayRecord = this.getTodayRecord();
      if (!todayRecord?.completed) {
        this.emit('dailyMissedWarning', {
          message: '今日はまだ入浴していません',
          remainingTime: '1時間',
        });
      }

      // 24時間後に再設定
      this.setupDailyCheck();
    }, checkTime.getTime() - now.getTime());
  }

  private scheduleNextReminder(): void {
    if (!this.currentPlan) return;

    const now = new Date();
    const [hours, minutes] = this.currentPlan.preferredTime.split(':').map(Number);
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    this.reminderTimer = setTimeout(() => {
      this.sendReminder('standard');
      this.scheduleEscalation();
    }, reminderTime.getTime() - now.getTime());
  }

  private scheduleEscalation(): void {
    // 1時間後にエスカレーション
    this.escalationTimer = setTimeout(
      () => {
        const todayRecord = this.getTodayRecord();
        if (!todayRecord?.completed) {
          this.sendReminder('urgent');

          // さらに30分後に緊急
          setTimeout(
            () => {
              const stillNotDone = this.getTodayRecord();
              if (!stillNotDone?.completed) {
                this.sendReminder('emergency');
              }
            },
            30 * 60 * 1000
          );
        }
      },
      60 * 60 * 1000
    );
  }

  private sendReminder(type: BathingReminder['type']): void {
    const messages = {
      gentle: '🛁 入浴の時間です。リラックスタイムを楽しみましょう',
      standard: '🕐 予定の入浴時間になりました',
      urgent: '⚠️ 入浴をお忘れではありませんか？',
      emergency: '🚨 今日の入浴がまだです！5分だけでも構いません',
    };

    const reminder: BathingReminder = {
      id: `reminder_${Date.now()}`,
      scheduledTime: new Date(),
      type,
      message: messages[type],
      escalationLevel: type === 'gentle' ? 1 : type === 'standard' ? 2 : type === 'urgent' ? 3 : 4,
      dismissed: false,
    };

    this.emit('bathingReminder', reminder);
  }

  private clearTodaysReminders(): void {
    if (this.reminderTimer) {
      clearTimeout(this.reminderTimer);
      this.reminderTimer = null;
    }
    if (this.escalationTimer) {
      clearTimeout(this.escalationTimer);
      this.escalationTimer = null;
    }
  }

  private handleStreakBreak(): void {
    const stats = this.getHabitStats();
    if (stats.currentStreak > 3) {
      this.emit('streakBroken', {
        brokenStreak: stats.currentStreak,
        encouragement: 'ストリークが途切れましたが、明日から新しいスタートです！',
        tip: '完璧を目指さず、継続することを重視しましょう',
      });
    }
  }

  private checkMilestones(streakDay: number): void {
    const milestones = [7, 14, 21, 30, 50, 100];
    if (milestones.includes(streakDay)) {
      this.emit('milestoneAchieved', {
        milestone: streakDay,
        message: `🏆 ${streakDay}日連続達成！素晴らしい継続力です！`,
        reward: this.getMilestoneReward(streakDay),
      });
    }
  }

  private getMilestoneReward(streakDay: number): string {
    const rewards = {
      7: '🌟 1週間継続バッジ',
      14: '💎 2週間マスターバッジ',
      21: '🏅 習慣化チャンピオンバッジ',
      30: '👑 1ヶ月継続王者バッジ',
      50: '🚀 50日ストリークレジェンドバッジ',
      100: '🎯 100日達成グランドマスターバッジ',
    };
    return rewards[streakDay as keyof typeof rewards] || '🎉 継続記録バッジ';
  }

  private calculateCurrentStreak(records: BathingRecord[]): number {
    const sortedRecords = records
      .filter((r) => r.completed)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const record of sortedRecords) {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);

      if (recordDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (recordDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  }

  private calculateLongestStreak(records: BathingRecord[]): number {
    const completedRecords = records
      .filter((r) => r.completed)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    let maxStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const record of completedRecords) {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);

      if (lastDate) {
        const dayDiff = (recordDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      lastDate = recordDate;
    }

    return Math.max(maxStreak, currentStreak);
  }

  private analyzeTimePatterns(records: BathingRecord[]): { time: string; difficulty: number }[] {
    const timeGroups: { [key: string]: { total: number; barriers: number } } = {};

    records.forEach((record) => {
      const hour = record.completionTime.split(':')[0];
      const timeGroup = this.getTimeGroup(parseInt(hour));

      if (!timeGroups[timeGroup]) {
        timeGroups[timeGroup] = { total: 0, barriers: 0 };
      }

      timeGroups[timeGroup].total++;
      timeGroups[timeGroup].barriers += record.barriers.length;
    });

    return Object.entries(timeGroups).map(([time, stats]) => ({
      time,
      difficulty: stats.total > 0 ? stats.barriers / stats.total : 0,
    }));
  }

  private getTimeGroup(hour: number): string {
    if (hour >= 6 && hour < 12) return '朝 (6-12時)';
    if (hour >= 12 && hour < 18) return '昼 (12-18時)';
    if (hour >= 18 && hour < 22) return '夕方 (18-22時)';
    return '夜 (22-6時)';
  }

  private generateRecommendations(barriers: any[]): string[] {
    const recommendations = [];

    if (barriers.find((b) => b.type === 'fatigue')) {
      recommendations.push('疲労時は朝シャワーに変更を検討');
    }
    if (barriers.find((b) => b.type === 'time_pressure')) {
      recommendations.push('時短入浴ルーティンの確立');
    }
    if (barriers.find((b) => b.type === 'executive_dysfunction')) {
      recommendations.push('入浴前の準備チェックリスト活用');
    }

    return recommendations;
  }

  // ストレージ関連とユーティリティメソッド
  private getTodayRecord(): BathingRecord | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const records = this.getAllBathingRecords();

    return (
      records.find((r) => {
        const recordDate = new Date(r.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === today.getTime();
      }) || null
    );
  }

  private saveBathingRecord(record: BathingRecord): void {
    const records = this.getAllBathingRecords();
    const existingIndex = records.findIndex(
      (r) => new Date(r.date).toDateString() === new Date(record.date).toDateString()
    );

    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }

    localStorage.setItem('bathing_habit_records', JSON.stringify(records));
  }

  private getAllBathingRecords(): BathingRecord[] {
    try {
      const stored = localStorage.getItem('bathing_habit_records');
      return stored
        ? JSON.parse(stored).map((r: any) => ({
            ...r,
            date: new Date(r.date),
          }))
        : [];
    } catch {
      return [];
    }
  }

  private saveBathingPlan(): void {
    if (this.currentPlan) {
      localStorage.setItem('bathing_habit_plan', JSON.stringify(this.currentPlan));
    }
  }

  private loadBathingPlan(): void {
    try {
      const stored = localStorage.getItem('bathing_habit_plan');
      if (stored) {
        this.currentPlan = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load bathing plan:', error);
    }
  }

  private calculateAverageTime(records: BathingRecord[]): string {
    if (records.length === 0) return '20:00';

    const totalMinutes = records.reduce((sum, record) => {
      const [hours, minutes] = record.completionTime.split(':').map(Number);
      return sum + (hours * 60 + minutes);
    }, 0);

    const avgMinutes = totalMinutes / records.length;
    const hours = Math.floor(avgMinutes / 60);
    const minutes = Math.round(avgMinutes % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private getMostCommonBarriers(records: BathingRecord[]): string[] {
    const barriers = records.flatMap((r) => r.barriers);
    const frequency: { [key: string]: number } = {};

    barriers.forEach((barrier) => {
      frequency[barrier.type] = (frequency[barrier.type] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type);
  }

  private getMostEffectiveStrategies(records: BathingRecord[]): string[] {
    const strategies = records
      .flatMap((r) => r.barriers)
      .filter((b) => b.overcame)
      .map((b) => b.strategy);

    const frequency: { [key: string]: number } = {};
    strategies.forEach((strategy) => {
      frequency[strategy] = (frequency[strategy] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([strategy]) => strategy);
  }

  private getWeeklyPattern(records: BathingRecord[]): { [key: string]: number } {
    const pattern: { [key: string]: number } = {
      月: 0,
      火: 0,
      水: 0,
      木: 0,
      金: 0,
      土: 0,
      日: 0,
    };

    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

    records
      .filter((r) => r.completed)
      .forEach((record) => {
        const weekday = weekdays[record.date.getDay()];
        pattern[weekday]++;
      });

    return pattern;
  }
}

export const bathingHabitService = BathingHabitService.getInstance();
export default bathingHabitService;
