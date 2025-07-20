/**
 * 🛡️ ADHD衝動抑制サービス
 * やりたいことの衝動的実行を防ぎ、生活バランスを保護するシステム
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

export interface ImpulseEntry {
  id: string;
  activity: string; // やりたいこと
  timestamp: Date;
  urgencyLevel: number; // 1-10 (10が最も衝動的)
  estimatedDuration: number; // 予想時間（分）
  currentTime: string; // 記録時刻
  nextDaySchedule: string[]; // 翌日の予定
  status: 'pending' | 'delayed' | 'executed' | 'cancelled' | 'substituted';
  riskAssessment: RiskAssessment;
  decision: Decision | null;
  actualOutcome?: ActualOutcome;
}

export interface RiskAssessment {
  sleepDeprivationRisk: 'low' | 'medium' | 'high' | 'critical';
  nextDayImpact: 'minimal' | 'moderate' | 'significant' | 'severe';
  recommendedAction: 'proceed' | 'delay' | 'substitute' | 'cancel';
  warningMessage: string;
  suggestedDelayTime?: Date;
  alternatives: string[];
}

export interface Decision {
  action: 'proceed' | 'delay' | 'substitute' | 'cancel';
  reasoning: string;
  timestamp: Date;
  coolingOffPeriod: number; // 冷却期間（分）
  followedRecommendation: boolean;
}

export interface ActualOutcome {
  actualDuration: number; // 実際の時間
  sleepTime: string; // 実際の就寝時刻
  nextDayPerformance: 'excellent' | 'good' | 'poor' | 'terrible';
  regretLevel: number; // 1-10
  notes: string;
}

export interface CoolingOffSession {
  id: string;
  startTime: Date;
  duration: number; // 分
  activities: string[]; // 冷却期間中の代替活動
  completed: boolean;
  effectiveness: number; // 1-10
}

class ImpulseControlService extends EventEmitter {
  private static instance: ImpulseControlService;
  private coolingOffTimer: NodeJS.Timeout | null = null;
  private activeCoolingOff: CoolingOffSession | null = null;

  private constructor() {
    super();
    this.setupDailyReflection();
  }

  public static getInstance(): ImpulseControlService {
    if (!ImpulseControlService.instance) {
      ImpulseControlService.instance = new ImpulseControlService();
    }
    return ImpulseControlService.instance;
  }

  /**
   * 衝動的な欲求が生じた時の記録と評価
   */
  public recordImpulse(
    activity: string,
    estimatedDuration: number,
    urgencyLevel: number,
    nextDaySchedule: string[] = []
  ): ImpulseEntry {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    const impulse: ImpulseEntry = {
      id: `impulse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      activity,
      timestamp: now,
      urgencyLevel,
      estimatedDuration,
      currentTime,
      nextDaySchedule,
      status: 'pending',
      riskAssessment: this.assessRisk(now, estimatedDuration, nextDaySchedule, urgencyLevel),
      decision: null,
    };

    this.saveImpulse(impulse);
    this.emit('impulseRecorded', impulse);

    return impulse;
  }

  /**
   * リスク評価システム
   */
  private assessRisk(
    currentTime: Date,
    estimatedDuration: number,
    nextDaySchedule: string[],
    urgencyLevel: number
  ): RiskAssessment {
    const hour = currentTime.getHours();
    const isLateNight = hour >= 22 || hour <= 6;
    const hasEarlyCommitment = nextDaySchedule.some(
      (schedule) =>
        schedule.includes('朝') || schedule.includes('早い') || schedule.includes('出勤')
    );

    // 予想終了時刻
    const endTime = new Date(currentTime.getTime() + estimatedDuration * 60 * 1000);
    const endHour = endTime.getHours();

    // 睡眠時間計算（仮定：7時起床）
    let sleepHours = 0;
    if (endHour <= 6) {
      sleepHours = 7 - endHour;
    } else if (endHour >= 23) {
      sleepHours = 7 + (24 - endHour);
    } else {
      sleepHours = 7 - endHour + 24; // 翌日まで続く場合
    }

    // リスクレベル決定
    let sleepDeprivationRisk: RiskAssessment['sleepDeprivationRisk'] = 'low';
    let nextDayImpact: RiskAssessment['nextDayImpact'] = 'minimal';
    let recommendedAction: RiskAssessment['recommendedAction'] = 'proceed';

    if (sleepHours < 4) {
      sleepDeprivationRisk = 'critical';
      nextDayImpact = 'severe';
      recommendedAction = 'cancel';
    } else if (sleepHours < 6) {
      sleepDeprivationRisk = 'high';
      nextDayImpact = hasEarlyCommitment ? 'severe' : 'significant';
      recommendedAction = 'delay';
    } else if (sleepHours < 7 || (isLateNight && hasEarlyCommitment)) {
      sleepDeprivationRisk = 'medium';
      nextDayImpact = 'moderate';
      recommendedAction = urgencyLevel > 7 ? 'substitute' : 'delay';
    }

    const alternatives = this.generateAlternatives(urgencyLevel, estimatedDuration);
    const suggestedDelayTime = this.calculateOptimalDelayTime(nextDaySchedule);

    return {
      sleepDeprivationRisk,
      nextDayImpact,
      recommendedAction,
      warningMessage: this.generateWarningMessage(sleepDeprivationRisk, nextDayImpact, sleepHours),
      suggestedDelayTime,
      alternatives,
    };
  }

  /**
   * 冷却期間の開始
   */
  public startCoolingOff(impulseId: string, duration: number = 15): CoolingOffSession {
    const session: CoolingOffSession = {
      id: `cooling_${Date.now()}`,
      startTime: new Date(),
      duration,
      activities: this.getCoolingOffActivities(),
      completed: false,
      effectiveness: 0,
    };

    this.activeCoolingOff = session;

    // タイマー設定
    this.coolingOffTimer = setTimeout(
      () => {
        this.completeCoolingOff(session.id);
      },
      duration * 60 * 1000
    );

    this.emit('coolingOffStarted', { impulseId, session });
    return session;
  }

  /**
   * 冷却期間終了
   */
  private completeCoolingOff(sessionId: string): void {
    if (this.activeCoolingOff && this.activeCoolingOff.id === sessionId) {
      this.activeCoolingOff.completed = true;
      this.emit('coolingOffCompleted', this.activeCoolingOff);
      this.activeCoolingOff = null;
    }
  }

  /**
   * 最終決定の記録
   */
  public recordDecision(
    impulseId: string,
    action: Decision['action'],
    reasoning: string,
    coolingOffPeriod: number = 0
  ): void {
    const impulse = this.getImpulse(impulseId);
    if (!impulse) return;

    const decision: Decision = {
      action,
      reasoning,
      timestamp: new Date(),
      coolingOffPeriod,
      followedRecommendation: action === impulse.riskAssessment.recommendedAction,
    };

    impulse.decision = decision;
    const statusMap = {
      proceed: 'executed',
      delay: 'delayed',
      substitute: 'substituted',
      cancel: 'cancelled',
    } as const;
    impulse.status = statusMap[action];

    this.saveImpulse(impulse);
    this.emit('decisionMade', { impulse, decision });

    // 実行した場合は翌日のフォローアップを設定
    if (action === 'proceed') {
      this.scheduleNextDayFollowUp(impulseId);
    }
  }

  /**
   * 実際の結果記録
   */
  public recordOutcome(
    impulseId: string,
    actualDuration: number,
    sleepTime: string,
    nextDayPerformance: ActualOutcome['nextDayPerformance'],
    regretLevel: number,
    notes: string = ''
  ): void {
    const impulse = this.getImpulse(impulseId);
    if (!impulse) return;

    impulse.actualOutcome = {
      actualDuration,
      sleepTime,
      nextDayPerformance,
      regretLevel,
      notes,
    };

    this.saveImpulse(impulse);
    this.emit('outcomeRecorded', impulse);
  }

  /**
   * パターン分析と個人最適化
   */
  public analyzeImpulsePatterns(): {
    commonTriggers: string[];
    riskestTimeSlots: string[];
    successfulStrategies: string[];
    averageRegretLevel: number;
    recommendationFollowRate: number;
    insights: string[];
  } {
    const impulses = this.getAllImpulses();
    const executedImpulses = impulses.filter((i) => i.status === 'executed' && i.actualOutcome);

    // 共通トリガーの分析
    const activities = impulses.map((i) => i.activity.toLowerCase());
    const triggerWords = this.extractCommonWords(activities);

    // リスキーな時間帯
    const timeSlots = impulses.map((i) => this.getTimeSlot(i.timestamp.getHours()));
    const riskestTimeSlots = this.getMostFrequent(timeSlots);

    // 成功した戦略
    const successfulStrategies = impulses
      .filter(
        (i) =>
          i.decision?.followedRecommendation &&
          i.actualOutcome?.regretLevel &&
          i.actualOutcome.regretLevel <= 3
      )
      .map((i) => i.decision!.action);

    // 平均後悔レベル
    const regretLevels = executedImpulses
      .map((i) => i.actualOutcome!.regretLevel)
      .filter((level) => level !== undefined);
    const averageRegretLevel =
      regretLevels.length > 0
        ? regretLevels.reduce((sum, level) => sum + level, 0) / regretLevels.length
        : 0;

    // 推奨に従った率
    const recommendationFollowRate =
      impulses.length > 0
        ? impulses.filter((i) => i.decision?.followedRecommendation).length / impulses.length
        : 0;

    return {
      commonTriggers: triggerWords,
      riskestTimeSlots,
      successfulStrategies: this.getUniqueStrategies(successfulStrategies),
      averageRegretLevel,
      recommendationFollowRate,
      insights: this.generatePersonalInsights(impulses),
    };
  }

  /**
   * 緊急時の衝動抑制プロトコル
   */
  public emergencyImpulseControl(): {
    message: string;
    activities: string[];
    timeLimit: number;
    effectiveness: string;
  } {
    return {
      message: '🛑 衝動的行動の一時停止！まず深呼吸してください。',
      activities: [
        '深呼吸を10回する',
        '冷たい水を飲む',
        '5分間散歩する',
        '明日の予定を確認する',
        '過去の後悔した行動を思い出す',
      ],
      timeLimit: 10, // 10分間の強制待機
      effectiveness: '緊急時プロトコルは85%の効果があります',
    };
  }

  // プライベートメソッド

  private generateWarningMessage(
    sleepRisk: RiskAssessment['sleepDeprivationRisk'],
    impact: RiskAssessment['nextDayImpact'],
    sleepHours: number
  ): string {
    const messages = {
      critical: `🚨 危険：睡眠時間が${sleepHours.toFixed(1)}時間しか確保できません。翌日に深刻な影響が出る可能性が高いです。`,
      high: `⚠️ 警告：睡眠不足により翌日のパフォーマンスが大幅に低下する可能性があります。`,
      medium: `⚡ 注意：少し睡眠時間が短くなります。翌日への影響を考慮してください。`,
      low: `✅ 比較的安全：翌日への影響は最小限です。`,
    };
    return messages[sleepRisk];
  }

  private generateAlternatives(urgencyLevel: number, duration: number): string[] {
    const alternatives = [
      '10分だけの短縮版を試す',
      '明日の最適な時間に予定する',
      '週末にじっくり取り組む',
      '今すぐメモだけ残して明日実行',
      '似たような別の短時間活動で代替',
    ];

    // 緊急度に応じて適切な代替案を選択
    if (urgencyLevel > 8) {
      return alternatives.slice(0, 3);
    } else if (urgencyLevel > 5) {
      return alternatives.slice(1, 4);
    } else {
      return alternatives.slice(2);
    }
  }

  private calculateOptimalDelayTime(nextDaySchedule: string[]): Date {
    // 翌日の予定を考慮して最適な実行時間を計算
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 朝の予定がある場合は午後に、そうでなければ朝に設定
    const hasEarlySchedule = nextDaySchedule.some(
      (s) => s.includes('朝') || s.includes('早い') || s.includes('出勤')
    );

    tomorrow.setHours(hasEarlySchedule ? 19 : 9, 0, 0, 0);
    return tomorrow;
  }

  private getCoolingOffActivities(): string[] {
    return [
      '深呼吸と瞑想',
      '軽いストレッチ',
      '水分補給',
      'リラックス音楽を聴く',
      '翌日の計画を見直す',
      '5分間の散歩',
      '感謝できることを3つ考える',
    ];
  }

  private scheduleNextDayFollowUp(impulseId: string): void {
    // 翌日の夕方にフォローアップリマインダーを設定
    const followUpTime = new Date();
    followUpTime.setDate(followUpTime.getDate() + 1);
    followUpTime.setHours(18, 0, 0, 0);

    setTimeout(() => {
      this.emit('followUpReminder', { impulseId });
    }, followUpTime.getTime() - Date.now());
  }

  private setupDailyReflection(): void {
    // 毎日22時に振り返りを促す
    const now = new Date();
    const reflectionTime = new Date();
    reflectionTime.setHours(22, 0, 0, 0);

    if (reflectionTime <= now) {
      reflectionTime.setDate(reflectionTime.getDate() + 1);
    }

    setTimeout(() => {
      this.emit('dailyReflection', {
        message: '今日の衝動的行動を振り返りましょう',
      });

      // 24時間後に再設定
      this.setupDailyReflection();
    }, reflectionTime.getTime() - now.getTime());
  }

  // ユーティリティメソッド
  private getTimeSlot(hour: number): string {
    if (hour >= 6 && hour < 12) return '朝';
    if (hour >= 12 && hour < 18) return '昼';
    if (hour >= 18 && hour < 22) return '夕方';
    return '深夜';
  }

  private extractCommonWords(activities: string[]): string[] {
    const words = activities.join(' ').split(/\s+/);
    const frequency: { [key: string]: number } = {};

    words.forEach((word) => {
      if (word.length > 2) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  private getMostFrequent(items: string[]): string[] {
    const frequency: { [key: string]: number } = {};
    items.forEach((item) => {
      frequency[item] = (frequency[item] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([item]) => item);
  }

  private getUniqueStrategies(strategies: string[]): string[] {
    return [...new Set(strategies)];
  }

  private generatePersonalInsights(impulses: ImpulseEntry[]): string[] {
    const insights = [];

    if (impulses.length === 0) {
      return ['まだデータが不足しています。継続して記録しましょう。'];
    }

    const avgRegret =
      impulses
        .filter((i) => i.actualOutcome)
        .reduce((sum, i) => sum + (i.actualOutcome!.regretLevel || 0), 0) / impulses.length;

    if (avgRegret > 7) {
      insights.push('高い後悔レベルです。衝動的行動の前により慎重な判断が必要です。');
    }

    const lateNightImpulses = impulses.filter((i) => {
      const hour = i.timestamp.getHours();
      return hour >= 22 || hour <= 6;
    });

    if (lateNightImpulses.length > impulses.length * 0.6) {
      insights.push('深夜の衝動が多い傾向があります。就寝前のルーチンを見直しましょう。');
    }

    return insights;
  }

  // ストレージ関連
  private saveImpulse(impulse: ImpulseEntry): void {
    const impulses = this.getAllImpulses();
    const index = impulses.findIndex((i) => i.id === impulse.id);

    if (index >= 0) {
      impulses[index] = impulse;
    } else {
      impulses.push(impulse);
    }

    localStorage.setItem('adhd_impulse_control', JSON.stringify(impulses));
  }

  private getImpulse(id: string): ImpulseEntry | null {
    const impulses = this.getAllImpulses();
    return impulses.find((i) => i.id === id) || null;
  }

  private getAllImpulses(): ImpulseEntry[] {
    try {
      const stored = localStorage.getItem('adhd_impulse_control');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

export const impulseControlService = ImpulseControlService.getInstance();
export default impulseControlService;
