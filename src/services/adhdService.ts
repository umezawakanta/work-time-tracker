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

export interface ThoughtEntry {
  id: string;
  content: string;
  timestamp: Date;
  type: 'reality' | 'fantasy' | 'worry' | 'focus';
  score: number; // 1-10 現実度スコア
  tags?: string[];
  context?: string; // どんな状況で考えたか
}

export interface FocusSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  goal: string;
  thoughtsChecked: number;
  realityScore: number;
  interruptionCount: number;
  successfulRedirects: number;
  mood: 'very-low' | 'low' | 'normal' | 'good' | 'excellent';
  energy: 'very-low' | 'low' | 'normal' | 'high' | 'very-high';
}

export interface ADHDProgress {
  totalSessions: number;
  averageSessionLength: number;
  totalThoughtsAnalyzed: number;
  averageRealityScore: number;
  streakDays: number;
  lastActiveDate: string;
  weeklyGoal: number;
  monthlyTrends: {
    [key: string]: {
      sessions: number;
      avgRealityScore: number;
      totalFocusTime: number;
    };
  };
}

export interface ADHDSettings {
  realityCheckInterval: number; // 分
  focusBreakInterval: number; // 分
  mindfulnessReminders: boolean;
  taskReminders: boolean;
  soundEnabled: boolean;
  emergencyContactEnabled: boolean;
  personalizedTips: boolean;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  focusSessionGoal: number; // 1日の目標セッション数
}

export interface ADHDInsight {
  id: string;
  type: 'pattern' | 'achievement' | 'suggestion' | 'warning';
  title: string;
  description: string;
  confidence: number; // 0-1
  actionable: boolean;
  actions?: string[];
  createdAt: Date;
}

class ADHDService extends EventEmitter {
  private static instance: ADHDService;
  private readonly STORAGE_KEYS = {
    SESSIONS: 'adhd-focus-sessions',
    THOUGHTS: 'adhd-thoughts',
    PROGRESS: 'adhd-progress',
    SETTINGS: 'adhd-settings',
    INSIGHTS: 'adhd-insights',
  };

  private constructor() {
    super();
    this.initializeData();
  }

  public static getInstance(): ADHDService {
    if (!ADHDService.instance) {
      ADHDService.instance = new ADHDService();
    }
    return ADHDService.instance;
  }

  /**
   * データの初期化
   */
  private initializeData(): void {
    // デフォルト設定の確認・設定
    const settings = this.getSettings();
    if (!settings) {
      this.saveSettings({
        realityCheckInterval: 10,
        focusBreakInterval: 25,
        mindfulnessReminders: true,
        taskReminders: true,
        soundEnabled: true,
        emergencyContactEnabled: false,
        personalizedTips: true,
        difficultyLevel: 'beginner',
        focusSessionGoal: 3,
      });
    }

    // プログレスデータの確認・初期化
    const progress = this.getProgress();
    if (!progress) {
      this.saveProgress({
        totalSessions: 0,
        averageSessionLength: 0,
        totalThoughtsAnalyzed: 0,
        averageRealityScore: 0,
        streakDays: 0,
        lastActiveDate: '',
        weeklyGoal: 5,
        monthlyTrends: {},
      });
    }
  }

  /**
   * ===== 思考管理 =====
   */

  public saveThought(thought: Omit<ThoughtEntry, 'id' | 'timestamp'>): ThoughtEntry {
    const thoughts = this.getThoughts();
    const newThought: ThoughtEntry = {
      ...thought,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    thoughts.unshift(newThought);

    // 最新1000件を保持
    if (thoughts.length > 1000) {
      thoughts.splice(1000);
    }

    localStorage.setItem(this.STORAGE_KEYS.THOUGHTS, JSON.stringify(thoughts));

    // プログレス更新
    this.updateProgress();
    this.emit('thoughtSaved', newThought);

    return newThought;
  }

  public getThoughts(limit?: number): ThoughtEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.THOUGHTS);
      const thoughts = stored ? JSON.parse(stored) : [];

      // Date オブジェクトに変換
      thoughts.forEach((thought: any) => {
        thought.timestamp = new Date(thought.timestamp);
      });

      return limit ? thoughts.slice(0, limit) : thoughts;
    } catch (error) {
      console.error('思考データの読み込みエラー:', error);
      return [];
    }
  }

  public analyzeThoughtPattern(timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'): any {
    const thoughts = this.getThoughts();
    const now = new Date();
    let cutoffDate: Date;

    switch (timeframe) {
      case 'daily':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const recentThoughts = thoughts.filter((t) => t.timestamp >= cutoffDate);

    const typeDistribution = recentThoughts.reduce(
      (acc, thought) => {
        acc[thought.type] = (acc[thought.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const averageScore =
      recentThoughts.length > 0
        ? recentThoughts.reduce((sum, t) => sum + t.score, 0) / recentThoughts.length
        : 0;

    return {
      totalThoughts: recentThoughts.length,
      typeDistribution,
      averageRealityScore: averageScore,
      trendDirection: this.calculateTrend(recentThoughts),
    };
  }

  private calculateTrend(thoughts: ThoughtEntry[]): 'improving' | 'stable' | 'declining' {
    if (thoughts.length < 5) return 'stable';

    const half = Math.floor(thoughts.length / 2);
    const recentScores = thoughts.slice(0, half).map((t) => t.score);
    const olderScores = thoughts.slice(half).map((t) => t.score);

    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;

    const difference = recentAvg - olderAvg;

    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'declining';
    return 'stable';
  }

  /**
   * ===== セッション管理 =====
   */

  public startSession(goal: string): FocusSession {
    const session: FocusSession = {
      id: Date.now().toString(),
      startTime: new Date(),
      goal,
      thoughtsChecked: 0,
      realityScore: 0,
      interruptionCount: 0,
      successfulRedirects: 0,
      mood: 'normal',
      energy: 'normal',
    };

    this.emit('sessionStarted', session);
    return session;
  }

  public endSession(session: FocusSession): FocusSession {
    const completedSession = {
      ...session,
      endTime: new Date(),
    };

    const sessions = this.getSessions();
    sessions.unshift(completedSession);

    // 最新500セッションを保持
    if (sessions.length > 500) {
      sessions.splice(500);
    }

    localStorage.setItem(this.STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    this.updateProgress();
    this.emit('sessionCompleted', completedSession);

    return completedSession;
  }

  public getSessions(limit?: number): FocusSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.SESSIONS);
      const sessions = stored ? JSON.parse(stored) : [];

      // Date オブジェクトに変換
      sessions.forEach((session: any) => {
        session.startTime = new Date(session.startTime);
        if (session.endTime) {
          session.endTime = new Date(session.endTime);
        }
      });

      return limit ? sessions.slice(0, limit) : sessions;
    } catch (error) {
      console.error('セッションデータの読み込みエラー:', error);
      return [];
    }
  }

  /**
   * ===== プログレス管理 =====
   */

  public getProgress(): ADHDProgress | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.PROGRESS);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('プログレスデータの読み込みエラー:', error);
      return null;
    }
  }

  public saveProgress(progress: ADHDProgress): void {
    localStorage.setItem(this.STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    this.emit('progressUpdated', progress);
  }

  private updateProgress(): void {
    const sessions = this.getSessions();
    const thoughts = this.getThoughts();
    const completedSessions = sessions.filter((s) => s.endTime);

    const totalSessionTime = completedSessions.reduce((total, session) => {
      if (session.endTime) {
        return total + (session.endTime.getTime() - session.startTime.getTime());
      }
      return total;
    }, 0);

    const averageSessionLength =
      completedSessions.length > 0
        ? totalSessionTime / completedSessions.length / (1000 * 60) // 分に変換
        : 0;

    const averageRealityScore =
      thoughts.length > 0 ? thoughts.reduce((sum, t) => sum + t.score, 0) / thoughts.length : 0;

    const streakDays = this.calculateStreak(sessions);

    const progress: ADHDProgress = {
      totalSessions: completedSessions.length,
      averageSessionLength,
      totalThoughtsAnalyzed: thoughts.length,
      averageRealityScore,
      streakDays,
      lastActiveDate: new Date().toISOString(),
      weeklyGoal: this.getSettings()?.focusSessionGoal || 5,
      monthlyTrends: this.calculateMonthlyTrends(sessions, thoughts),
    };

    this.saveProgress(progress);
  }

  private calculateStreak(sessions: FocusSession[]): number {
    const completedSessions = sessions.filter((s) => s.endTime);
    if (completedSessions.length === 0) return 0;

    const dates = completedSessions.map((s) => {
      const date = new Date(s.startTime);
      return date.toDateString();
    });

    const uniqueDates = [...new Set(dates)].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    let streak = 0;
    const today = new Date().toDateString();

    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);

      if (uniqueDates[i] === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateMonthlyTrends(sessions: FocusSession[], thoughts: ThoughtEntry[]): any {
    const trends: any = {};
    const now = new Date();

    for (let i = 0; i < 6; i++) {
      // 過去6ヶ月
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth() + 1}`;

      const monthSessions = sessions.filter((s) => {
        const sessionDate = new Date(s.startTime);
        return (
          sessionDate.getFullYear() === monthDate.getFullYear() &&
          sessionDate.getMonth() === monthDate.getMonth()
        );
      });

      const monthThoughts = thoughts.filter((t) => {
        const thoughtDate = new Date(t.timestamp);
        return (
          thoughtDate.getFullYear() === monthDate.getFullYear() &&
          thoughtDate.getMonth() === monthDate.getMonth()
        );
      });

      const totalFocusTime =
        monthSessions.reduce((total, session) => {
          if (session.endTime) {
            return total + (session.endTime.getTime() - session.startTime.getTime());
          }
          return total;
        }, 0) /
        (1000 * 60); // 分に変換

      const avgRealityScore =
        monthThoughts.length > 0
          ? monthThoughts.reduce((sum, t) => sum + t.score, 0) / monthThoughts.length
          : 0;

      trends[monthKey] = {
        sessions: monthSessions.length,
        avgRealityScore,
        totalFocusTime,
      };
    }

    return trends;
  }

  /**
   * ===== 設定管理 =====
   */

  public getSettings(): ADHDSettings | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('設定データの読み込みエラー:', error);
      return null;
    }
  }

  public saveSettings(settings: ADHDSettings): void {
    localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.emit('settingsUpdated', settings);
  }

  public updateSettings(partialSettings: Partial<ADHDSettings>): void {
    const currentSettings = this.getSettings();
    if (currentSettings) {
      const updatedSettings = { ...currentSettings, ...partialSettings };
      this.saveSettings(updatedSettings);
    }
  }

  /**
   * ===== インサイト生成 =====
   */

  public generateInsights(): ADHDInsight[] {
    const insights: ADHDInsight[] = [];
    const sessions = this.getSessions();
    const thoughts = this.getThoughts();
    const progress = this.getProgress();

    // パターン認識に基づくインサイト
    const thoughtPattern = this.analyzeThoughtPattern('weekly');

    if (thoughtPattern.averageRealityScore < 5) {
      insights.push({
        id: `insight-${Date.now()}-1`,
        type: 'warning',
        title: '現実度スコアの低下',
        description:
          '今週の現実度スコアが平均より低くなっています。休息とリラクゼーションを心がけましょう。',
        confidence: 0.8,
        actionable: true,
        actions: ['深呼吸エクササイズ', '現実チェック頻度を上げる', '軽い運動'],
        createdAt: new Date(),
      });
    }

    if (progress && progress.streakDays >= 7) {
      insights.push({
        id: `insight-${Date.now()}-2`,
        type: 'achievement',
        title: '継続達成！',
        description: `${progress.streakDays}日連続で集中トレーニングを続けています。素晴らしい成果です！`,
        confidence: 1.0,
        actionable: false,
        createdAt: new Date(),
      });
    }

    const recentSessions = sessions.slice(0, 10);
    if (recentSessions.length >= 5) {
      const avgInterruptions =
        recentSessions.reduce((sum, s) => sum + s.interruptionCount, 0) / recentSessions.length;

      if (avgInterruptions > 3) {
        insights.push({
          id: `insight-${Date.now()}-3`,
          type: 'suggestion',
          title: '集中環境の改善',
          description: '最近のセッションで中断が多くなっています。集中環境を見直してみましょう。',
          confidence: 0.7,
          actionable: true,
          actions: ['通知をオフにする', '作業場所を変える', '集中時間を短くする'],
          createdAt: new Date(),
        });
      }
    }

    return insights;
  }

  /**
   * ===== ユーティリティ =====
   */

  public exportData(): any {
    return {
      sessions: this.getSessions(),
      thoughts: this.getThoughts(),
      progress: this.getProgress(),
      settings: this.getSettings(),
      insights: this.generateInsights(),
      exportDate: new Date().toISOString(),
    };
  }

  public importData(data: any): boolean {
    try {
      if (data.sessions)
        localStorage.setItem(this.STORAGE_KEYS.SESSIONS, JSON.stringify(data.sessions));
      if (data.thoughts)
        localStorage.setItem(this.STORAGE_KEYS.THOUGHTS, JSON.stringify(data.thoughts));
      if (data.progress)
        localStorage.setItem(this.STORAGE_KEYS.PROGRESS, JSON.stringify(data.progress));
      if (data.settings)
        localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));

      this.emit('dataImported', data);
      return true;
    } catch (error) {
      console.error('データインポートエラー:', error);
      return false;
    }
  }

  public clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    this.initializeData();
    this.emit('dataCleared');
  }
}

export const adhdService = ADHDService.getInstance();
export default adhdService;
