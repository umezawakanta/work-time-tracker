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
    this.events[event].forEach((listener) => listener(...args));
  }
}

// 型定義
export interface ShavingRecord {
  id: string;
  date: string;
  shavingType: 'electric' | 'safety_razor' | 'cartridge' | 'disposable';
  method: 'dry_shave' | 'with_cream' | 'with_gel' | 'with_soap';
  duration: number;
  quality: 'perfect' | 'good' | 'adequate' | 'rushed' | 'skipped_areas';
  skinCondition: 'excellent' | 'good' | 'normal' | 'irritated' | 'cuts';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  completed: boolean;
  notes?: string;
}

export interface ShavingStats {
  currentStreak: number;
  longestStreak: number;
  monthlySuccessRate: number;
  averageDuration: number;
  totalShaves: number;
  preferredTime: string;
  mostUsedType: string;
}

export interface ShavingMilestone {
  days: number;
  title: string;
  description: string;
  badge: string;
  reward: string;
  unlocked: boolean;
}

export interface ShavingEmergencyAction {
  id: string;
  title: string;
  description: string;
  estimatedTime: number;
  effectiveness: number;
}

class ShavingHabitService extends EventEmitter {
  private records: ShavingRecord[] = [];
  private milestones: ShavingMilestone[] = [
    {
      days: 3,
      title: '髭剃りビギナー',
      description: '3日連続で髭剃りを完了',
      badge: '🪒',
      reward: 'スキンケアのコツヒント',
      unlocked: false,
    },
    {
      days: 7,
      title: '髭剃りハビット',
      description: '1週間連続で髭剃りを継続',
      badge: '✨',
      reward: 'シェービングクリームサンプル',
      unlocked: false,
    },
    {
      days: 14,
      title: '髭剃りマスター',
      description: '2週間の完璧な髭剃り習慣',
      badge: '👨‍💼',
      reward: '高級シェーバー割引券',
      unlocked: false,
    },
    {
      days: 21,
      title: '身だしなみエキスパート',
      description: '21日間の身だしなみルーティン完成',
      badge: '🎩',
      reward: 'プレミアムアフターシェーブ',
      unlocked: false,
    },
    {
      days: 30,
      title: '髭剃りレジェンド',
      description: '1か月間の完璧な髭剃り習慣',
      badge: '👑',
      reward: '電動シェーバー新製品',
      unlocked: false,
    },
    {
      days: 50,
      title: '身だしなみ職人',
      description: '50日間の卓越した髭剃り技術',
      badge: '🏆',
      reward: 'プロフェッショナルセット',
      unlocked: false,
    },
    {
      days: 100,
      title: '髭剃りの神',
      description: '100日間の究極の身だしなみ',
      badge: '⚡',
      reward: '最高級シェービングセット',
      unlocked: false,
    },
  ];

  constructor() {
    super();
    this.loadData();
    this.updateMilestones();
  }

  private loadData(): void {
    const storedRecords = localStorage.getItem('shaving-records');
    if (storedRecords) {
      this.records = JSON.parse(storedRecords);
    }
  }

  private saveData(): void {
    localStorage.setItem('shaving-records', JSON.stringify(this.records));
  }

  recordShaving(data: {
    shavingType: 'electric' | 'safety_razor' | 'cartridge' | 'disposable';
    method: 'dry_shave' | 'with_cream' | 'with_gel' | 'with_soap';
    duration: number;
    quality: 'perfect' | 'good' | 'adequate' | 'rushed' | 'skipped_areas';
    skinCondition: 'excellent' | 'good' | 'normal' | 'irritated' | 'cuts';
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    notes?: string;
  }): ShavingRecord {
    const today = new Date().toISOString().split('T')[0];

    const record: ShavingRecord = {
      id: `shaving-${Date.now()}`,
      date: today,
      completed: true,
      ...data,
    };

    // 今日の記録があれば更新、なければ追加
    const existingIndex = this.records.findIndex((r) => r.date === today);
    if (existingIndex >= 0) {
      this.records[existingIndex] = record;
    } else {
      this.records.push(record);
    }

    this.saveData();
    this.updateMilestones();
    this.emit('shaving_recorded', record);

    return record;
  }

  getTodayRecord(): ShavingRecord | undefined {
    const today = new Date().toISOString().split('T')[0];
    return this.records.find((record) => record.date === today);
  }

  getStats(): ShavingStats {
    const currentStreak = this.getCurrentStreak();
    const longestStreak = this.getLongestStreak();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRecords = this.records.filter((record) => new Date(record.date) >= thirtyDaysAgo);

    const monthlySuccessRate =
      recentRecords.length > 0 ? (recentRecords.filter((r) => r.completed).length / 30) * 100 : 0;

    const totalDuration = this.records.reduce((sum, record) => sum + record.duration, 0);
    const averageDuration = this.records.length > 0 ? totalDuration / this.records.length : 0;

    const timeFrequency = this.records.reduce(
      (acc, record) => {
        acc[record.timeOfDay] = (acc[record.timeOfDay] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const preferredTime =
      Object.entries(timeFrequency).sort(([, a], [, b]) => b - a)[0]?.[0] || 'morning';

    const typeFrequency = this.records.reduce(
      (acc, record) => {
        acc[record.shavingType] = (acc[record.shavingType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostUsedType =
      Object.entries(typeFrequency).sort(([, a], [, b]) => b - a)[0]?.[0] || 'electric';

    return {
      currentStreak,
      longestStreak,
      monthlySuccessRate,
      averageDuration,
      totalShaves: this.records.length,
      preferredTime,
      mostUsedType,
    };
  }

  private getCurrentStreak(): number {
    const sortedRecords = [...this.records]
      .filter((r) => r.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sortedRecords.length === 0) return 0;

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < sortedRecords.length; i++) {
      const recordDate = new Date(sortedRecords[i].date);
      const daysDiff = Math.floor((today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private getLongestStreak(): number {
    const sortedRecords = [...this.records]
      .filter((r) => r.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let maxStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const record of sortedRecords) {
      const recordDate = new Date(record.date);

      if (lastDate && recordDate.getTime() - lastDate.getTime() === 24 * 60 * 60 * 1000) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }

      maxStreak = Math.max(maxStreak, currentStreak);
      lastDate = recordDate;
    }

    return maxStreak;
  }

  getMilestones(): ShavingMilestone[] {
    return [...this.milestones];
  }

  private updateMilestones(): void {
    const currentStreak = this.getCurrentStreak();

    this.milestones.forEach((milestone) => {
      if (!milestone.unlocked && currentStreak >= milestone.days) {
        milestone.unlocked = true;
        this.emit('milestone_unlocked', milestone);
      }
    });
  }

  generateShavingGuidance(): string {
    const today = this.getTodayRecord();
    const stats = this.getStats();

    if (today?.completed) {
      return `✨ 今日の髭剃り完了！${stats.currentStreak}日連続です`;
    }

    if (stats.currentStreak === 0) {
      return '🪒 新しいスタート！今日から髭剃り習慣を始めましょう';
    }

    const hour = new Date().getHours();
    if (hour >= 21) {
      return '⏰ そろそろ髭剃りの時間です。明日に備えて身だしなみを整えましょう';
    }

    return `🎯 ${stats.currentStreak}日連続中！今日も継続しましょう`;
  }

  getEmergencyShavingOptions(): ShavingEmergencyAction[] {
    return [
      {
        id: 'quick-electric',
        title: '超速電気シェーバー',
        description: '電気シェーバーで最低限の髭剃り',
        estimatedTime: 2,
        effectiveness: 7,
      },
      {
        id: 'partial-shave',
        title: '部分髭剃り',
        description: '顔の見える部分だけ剃る',
        estimatedTime: 3,
        effectiveness: 6,
      },
      {
        id: 'wet-towel',
        title: '濡れタオルで整える',
        description: '濡れタオルで髭を整える',
        estimatedTime: 1,
        effectiveness: 4,
      },
      {
        id: 'tomorrow-morning',
        title: '朝シェーブに変更',
        description: '明朝の髭剃りに変更',
        estimatedTime: 0,
        effectiveness: 8,
      },
    ];
  }

  setReminder(time: string): void {
    // リマインダー設定の実装
    this.emit('reminder_set', { time });
  }
}

export const shavingHabitService = new ShavingHabitService();
