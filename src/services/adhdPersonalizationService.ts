import adhdService, { FocusSession, ThoughtEntry, ADHDProgress } from './adhdService';
import adhdTodoIntegration, { ADHDTask } from './adhdTodoIntegrationService';

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

export interface UserProfile {
  id: string;
  name?: string;
  adhdType: 'primarily-inattentive' | 'primarily-hyperactive' | 'combined' | 'not-specified';
  severityLevel: 'mild' | 'moderate' | 'severe';
  primaryChallenges: string[]; // 主な困難
  strengthAreas: string[]; // 得意分野
  optimalConditions: {
    bestTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | 'variable';
    preferredEnvironment: 'quiet' | 'background-noise' | 'music' | 'nature-sounds';
    optimalSessionLength: number; // 分
    breakFrequency: number; // 分
    motivationType: 'reward' | 'deadline' | 'collaboration' | 'variety';
  };
  triggers: {
    distractionTriggers: string[];
    stressTriggers: string[];
    hyperfocusTriggers: string[];
  };
  preferences: {
    communicationStyle: 'direct' | 'encouraging' | 'detailed' | 'minimal';
    feedbackFrequency: 'real-time' | 'session-end' | 'daily' | 'weekly';
    reminderStyle: 'gentle' | 'firm' | 'gamified' | 'visual';
    progressTracking: 'detailed' | 'summary' | 'visual' | 'minimal';
  };
  medications?: {
    name: string;
    dosage: string;
    timing: string[];
    effectDuration: number; // 時間
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalizationInsight {
  type: 'pattern' | 'recommendation' | 'optimization' | 'warning';
  confidence: number; // 0-1
  title: string;
  description: string;
  evidence: string[];
  suggestions: string[];
  impact: 'high' | 'medium' | 'low';
  category: 'focus' | 'time-management' | 'stress' | 'motivation' | 'environment';
}

export interface AdaptiveRecommendation {
  id: string;
  type: 'task-adjustment' | 'schedule-optimization' | 'environment-change' | 'technique-suggestion';
  priority: number; // 1-10
  title: string;
  description: string;
  implementation: string[];
  expectedBenefit: string;
  basedOn: string[];
  validUntil?: Date;
}

class ADHDPersonalizationService extends EventEmitter {
  private static instance: ADHDPersonalizationService;
  private readonly STORAGE_KEYS = {
    PROFILE: 'adhd-user-profile',
    INSIGHTS: 'adhd-personalization-insights',
    PATTERNS: 'adhd-learned-patterns',
  };

  private constructor() {
    super();
    this.initializeProfile();
  }

  public static getInstance(): ADHDPersonalizationService {
    if (!ADHDPersonalizationService.instance) {
      ADHDPersonalizationService.instance = new ADHDPersonalizationService();
    }
    return ADHDPersonalizationService.instance;
  }

  /**
   * ===== プロファイル管理 =====
   */

  public getUserProfile(): UserProfile | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.PROFILE);
      if (stored) {
        const profile = JSON.parse(stored);
        profile.createdAt = new Date(profile.createdAt);
        profile.updatedAt = new Date(profile.updatedAt);
        return profile;
      }
      return null;
    } catch (error) {
      console.error('プロファイル読み込みエラー:', error);
      return null;
    }
  }

  public createUserProfile(
    profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>
  ): UserProfile {
    const profile: UserProfile = {
      ...profileData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.saveUserProfile(profile);
    this.emit('profileCreated', profile);
    return profile;
  }

  public updateUserProfile(updates: Partial<UserProfile>): UserProfile | null {
    const currentProfile = this.getUserProfile();
    if (!currentProfile) return null;

    const updatedProfile: UserProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date(),
    };

    this.saveUserProfile(updatedProfile);
    this.emit('profileUpdated', updatedProfile);
    return updatedProfile;
  }

  private saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(this.STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  private initializeProfile(): void {
    const profile = this.getUserProfile();
    if (!profile) {
      // デフォルトプロファイルの作成
      this.createUserProfile({
        adhdType: 'not-specified',
        severityLevel: 'moderate',
        primaryChallenges: ['concentration', 'time-management', 'task-switching'],
        strengthAreas: ['creativity', 'problem-solving'],
        optimalConditions: {
          bestTimeOfDay: 'morning',
          preferredEnvironment: 'quiet',
          optimalSessionLength: 25,
          breakFrequency: 5,
          motivationType: 'reward',
        },
        triggers: {
          distractionTriggers: ['notifications', 'noise', 'clutter'],
          stressTriggers: ['deadlines', 'interruptions', 'multitasking'],
          hyperfocusTriggers: ['interesting-tasks', 'flow-state', 'quiet-environment'],
        },
        preferences: {
          communicationStyle: 'encouraging',
          feedbackFrequency: 'session-end',
          reminderStyle: 'gentle',
          progressTracking: 'visual',
        },
      });
    }
  }

  /**
   * ===== パターン分析 =====
   */

  public analyzeUserPatterns(): PersonalizationInsight[] {
    const profile = this.getUserProfile();
    if (!profile) return [];

    const sessions = adhdService.getSessions();
    const thoughts = adhdService.getThoughts();
    const tasks = adhdTodoIntegration.getTasks();
    const progress = adhdService.getProgress();

    const insights: PersonalizationInsight[] = [];

    // 最適な時間帯の分析
    insights.push(...this.analyzeOptimalTiming(sessions, profile));

    // セッション長の最適化
    insights.push(...this.analyzeSessionLength(sessions, profile));

    // 思考パターンの分析
    insights.push(...this.analyzeThoughtPatterns(thoughts, profile));

    // タスク完了パターンの分析
    insights.push(...this.analyzeTaskPatterns(tasks, profile));

    // 進捗とプロファイルの整合性分析
    insights.push(...this.analyzeProgressAlignment(progress, profile));

    // インサイトを保存
    this.saveInsights(insights);

    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  private analyzeOptimalTiming(
    sessions: FocusSession[],
    profile: UserProfile
  ): PersonalizationInsight[] {
    const insights: PersonalizationInsight[] = [];

    if (sessions.length < 5) return insights;

    // 時間帯別のパフォーマンス分析
    const timeSlots = {
      morning: { sessions: 0, avgScore: 0, totalScore: 0 },
      afternoon: { sessions: 0, avgScore: 0, totalScore: 0 },
      evening: { sessions: 0, avgScore: 0, totalScore: 0 },
      night: { sessions: 0, avgScore: 0, totalScore: 0 },
    };

    sessions
      .filter((s) => s.endTime)
      .forEach((session) => {
        const hour = new Date(session.startTime).getHours();
        const timeSlot = this.getTimeSlot(hour);
        const score = session.realityScore;

        timeSlots[timeSlot].sessions++;
        timeSlots[timeSlot].totalScore += score;
        timeSlots[timeSlot].avgScore =
          timeSlots[timeSlot].totalScore / timeSlots[timeSlot].sessions;
      });

    // 最高パフォーマンス時間帯を特定
    const bestTimeSlot = Object.entries(timeSlots)
      .filter(([_, data]) => data.sessions >= 2)
      .sort((a, b) => b[1].avgScore - a[1].avgScore)[0];

    if (bestTimeSlot && bestTimeSlot[1].avgScore > 7) {
      const currentOptimal = profile.optimalConditions.bestTimeOfDay;
      const bestTime = bestTimeSlot[0] as typeof currentOptimal;

      if (currentOptimal !== bestTime) {
        insights.push({
          type: 'optimization',
          confidence: Math.min(0.9, bestTimeSlot[1].sessions / 10),
          title: '最適な時間帯の発見',
          description: `データから${this.getTimeDisplayName(bestTime)}が最も集中できる時間帯であることが判明しました。`,
          evidence: [
            `${bestTime}の平均集中度: ${bestTimeSlot[1].avgScore.toFixed(1)}`,
            `セッション数: ${bestTimeSlot[1].sessions}回`,
            `現在設定: ${currentOptimal}`,
          ],
          suggestions: [
            `プロファイルの最適時間を${this.getTimeDisplayName(bestTime)}に変更`,
            '重要なタスクをこの時間帯にスケジュール',
            'この時間帯の環境を最適化',
          ],
          impact: 'high',
          category: 'time-management',
        });
      }
    }

    return insights;
  }

  private analyzeSessionLength(
    sessions: FocusSession[],
    profile: UserProfile
  ): PersonalizationInsight[] {
    const insights: PersonalizationInsight[] = [];

    if (sessions.length < 10) return insights;

    const completedSessions = sessions.filter((s) => s.endTime);
    const sessionLengths = completedSessions.map((s) => {
      const duration = (s.endTime!.getTime() - s.startTime.getTime()) / (1000 * 60);
      return { duration, score: s.realityScore };
    });

    // 最適なセッション長を分析
    const durationRanges = [
      { min: 0, max: 15, count: 0, totalScore: 0, avgScore: 0 },
      { min: 15, max: 25, count: 0, totalScore: 0, avgScore: 0 },
      { min: 25, max: 35, count: 0, totalScore: 0, avgScore: 0 },
      { min: 35, max: 50, count: 0, totalScore: 0, avgScore: 0 },
      { min: 50, max: 90, count: 0, totalScore: 0, avgScore: 0 },
    ];

    sessionLengths.forEach(({ duration, score }) => {
      const range = durationRanges.find((r) => duration >= r.min && duration < r.max);
      if (range) {
        range.count++;
        range.totalScore += score;
        range.avgScore = range.totalScore / range.count;
      }
    });

    const bestRange = durationRanges
      .filter((r) => r.count >= 3)
      .sort((a, b) => b.avgScore - a.avgScore)[0];

    if (bestRange && bestRange.avgScore > 7) {
      const optimalLength = Math.floor((bestRange.min + bestRange.max) / 2);
      const currentLength = profile.optimalConditions.optimalSessionLength;

      if (Math.abs(optimalLength - currentLength) > 5) {
        insights.push({
          type: 'optimization',
          confidence: Math.min(0.8, bestRange.count / 15),
          title: '最適なセッション長の発見',
          description: `${optimalLength}分程度のセッションで最高のパフォーマンスを発揮しています。`,
          evidence: [
            `${bestRange.min}-${bestRange.max}分の平均集中度: ${bestRange.avgScore.toFixed(1)}`,
            `該当セッション数: ${bestRange.count}回`,
            `現在設定: ${currentLength}分`,
          ],
          suggestions: [
            `セッション長を${optimalLength}分に調整`,
            'ポモドーロタイマーの設定を更新',
            'この長さでの習慣化を図る',
          ],
          impact: 'medium',
          category: 'focus',
        });
      }
    }

    return insights;
  }

  private analyzeThoughtPatterns(
    thoughts: ThoughtEntry[],
    profile: UserProfile
  ): PersonalizationInsight[] {
    const insights: PersonalizationInsight[] = [];

    if (thoughts.length < 20) return insights;

    // 最近30日の思考パターン
    const recentThoughts = thoughts.filter((t) => {
      const daysDiff = (new Date().getTime() - t.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    });

    // 思考タイプの分布
    const typeDistribution = recentThoughts.reduce(
      (acc, thought) => {
        acc[thought.type] = (acc[thought.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // 現実度スコアの推移
    const avgRealityScore =
      recentThoughts.reduce((sum, t) => sum + t.score, 0) / recentThoughts.length;

    // 妄想的思考が多い場合
    if (typeDistribution.fantasy > recentThoughts.length * 0.4) {
      insights.push({
        type: 'warning',
        confidence: 0.7,
        title: '現実逃避傾向の増加',
        description: '最近、現実逃避的な思考が増加しています。適切な対策が必要です。',
        evidence: [
          `妄想的思考の割合: ${Math.round((typeDistribution.fantasy / recentThoughts.length) * 100)}%`,
          `平均現実度スコア: ${avgRealityScore.toFixed(1)}`,
          `総思考記録数: ${recentThoughts.length}`,
        ],
        suggestions: [
          '現実チェックの頻度を増やす',
          'グラウンディング技法の練習',
          '具体的な目標設定',
          '専門家への相談を検討',
        ],
        impact: 'high',
        category: 'focus',
      });
    }

    // 心配事が多い場合
    if (typeDistribution.worry > recentThoughts.length * 0.3) {
      insights.push({
        type: 'recommendation',
        confidence: 0.6,
        title: '不安管理の必要性',
        description: '心配や不安な思考が多く記録されています。不安管理技法が効果的です。',
        evidence: [
          `心配事の割合: ${Math.round((typeDistribution.worry / recentThoughts.length) * 100)}%`,
          `不安関連の思考数: ${typeDistribution.worry}`,
        ],
        suggestions: [
          '不安管理技法の学習',
          '心配事の書き出し練習',
          'マインドフルネス瞑想',
          '問題解決スキルの向上',
        ],
        impact: 'medium',
        category: 'stress',
      });
    }

    return insights;
  }

  private analyzeTaskPatterns(tasks: ADHDTask[], profile: UserProfile): PersonalizationInsight[] {
    const insights: PersonalizationInsight[] = [];

    if (tasks.length < 10) return insights;

    const completedTasks = tasks.filter((t) => t.status === 'completed');
    if (completedTasks.length < 5) return insights;

    // 完了率の高い難易度レベルを分析
    const difficultySuccess = Object.entries(
      tasks.reduce(
        (acc, task) => {
          if (!acc[task.difficulty]) {
            acc[task.difficulty] = { total: 0, completed: 0 };
          }
          acc[task.difficulty].total++;
          if (task.status === 'completed') {
            acc[task.difficulty].completed++;
          }
          return acc;
        },
        {} as Record<string, { total: number; completed: number }>
      )
    )
      .map(([difficulty, stats]) => ({
        difficulty,
        successRate: stats.completed / stats.total,
        count: stats.total,
      }))
      .filter((item) => item.count >= 3);

    const bestDifficulty = difficultySuccess.sort((a, b) => b.successRate - a.successRate)[0];

    if (bestDifficulty && bestDifficulty.successRate > 0.8) {
      insights.push({
        type: 'pattern',
        confidence: Math.min(0.8, bestDifficulty.count / 10),
        title: '最適な難易度レベルの特定',
        description: `${bestDifficulty.difficulty}レベルのタスクで高い成功率を示しています。`,
        evidence: [
          `成功率: ${Math.round(bestDifficulty.successRate * 100)}%`,
          `該当タスク数: ${bestDifficulty.count}`,
        ],
        suggestions: [
          `${bestDifficulty.difficulty}レベルのタスクを中心に計画`,
          '成功体験を積み重ねて自信を構築',
          '段階的に難易度を上げる戦略',
        ],
        impact: 'medium',
        category: 'motivation',
      });
    }

    return insights;
  }

  private analyzeProgressAlignment(
    progress: ADHDProgress | null,
    profile: UserProfile
  ): PersonalizationInsight[] {
    const insights: PersonalizationInsight[] = [];

    if (!progress) return insights;

    // 進捗とプロファイル設定の整合性チェック
    if (progress.averageSessionLength > 0) {
      const actualLength = progress.averageSessionLength;
      const settingLength = profile.optimalConditions.optimalSessionLength;
      const difference = Math.abs(actualLength - settingLength);

      if (difference > 10) {
        insights.push({
          type: 'optimization',
          confidence: 0.6,
          title: 'プロファイル設定の調整が必要',
          description: '実際のセッション長とプロファイル設定に大きな違いがあります。',
          evidence: [
            `実際の平均セッション長: ${actualLength.toFixed(1)}分`,
            `設定値: ${settingLength}分`,
            `差異: ${difference.toFixed(1)}分`,
          ],
          suggestions: [
            'プロファイル設定を実際の行動に合わせて調整',
            '理想と現実のバランスを見直し',
            '段階的な改善目標の設定',
          ],
          impact: 'low',
          category: 'focus',
        });
      }
    }

    return insights;
  }

  /**
   * ===== 適応的推奨 =====
   */

  public getAdaptiveRecommendations(): AdaptiveRecommendation[] {
    const profile = this.getUserProfile();
    if (!profile) return [];

    const insights = this.analyzeUserPatterns();
    const recommendations: AdaptiveRecommendation[] = [];

    // インサイトに基づく推奨事項の生成
    insights.forEach((insight) => {
      if (insight.type === 'optimization' && insight.confidence > 0.6) {
        recommendations.push({
          id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'schedule-optimization',
          priority: Math.round(insight.confidence * 10),
          title: insight.title,
          description: insight.description,
          implementation: insight.suggestions,
          expectedBenefit: `${Math.round(insight.confidence * 100)}%の改善が期待されます`,
          basedOn: insight.evidence,
        });
      }
    });

    // 時間帯別の推奨
    if (profile.optimalConditions.bestTimeOfDay) {
      recommendations.push({
        id: `time-opt-${Date.now()}`,
        type: 'schedule-optimization',
        priority: 8,
        title: '最適時間帯での作業',
        description: `${this.getTimeDisplayName(profile.optimalConditions.bestTimeOfDay)}に重要なタスクをスケジュールしましょう`,
        implementation: [
          'カレンダーの最適時間帯をブロック',
          '重要度の高いタスクを配置',
          'この時間の中断を最小化',
        ],
        expectedBenefit: '集中力が最大30%向上する可能性があります',
        basedOn: ['ユーザープロファイル設定', '過去のパフォーマンスデータ'],
      });
    }

    // ADHD タイプ別の推奨
    recommendations.push(...this.getTypeSpecificRecommendations(profile));

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  private getTypeSpecificRecommendations(profile: UserProfile): AdaptiveRecommendation[] {
    const recommendations: AdaptiveRecommendation[] = [];

    switch (profile.adhdType) {
      case 'primarily-inattentive':
        recommendations.push({
          id: `inattentive-${Date.now()}`,
          type: 'technique-suggestion',
          priority: 7,
          title: '注意力散漫対策',
          description: '不注意優勢型に効果的な集中力向上技法を実践しましょう',
          implementation: [
            'ポモドーロテクニックの活用',
            '視覚的リマインダーの設置',
            'タスクの細分化',
            '環境の整理整頓',
          ],
          expectedBenefit: '集中持続時間の改善が期待されます',
          basedOn: ['ADHDタイプ: 不注意優勢型'],
        });
        break;

      case 'primarily-hyperactive':
        recommendations.push({
          id: `hyperactive-${Date.now()}`,
          type: 'technique-suggestion',
          priority: 7,
          title: '多動性管理',
          description: '多動優勢型に適したエネルギー管理技法を取り入れましょう',
          implementation: [
            '短時間集中 + 活動的休憩',
            'フィジェットツールの活用',
            '立ち仕事の導入',
            '運動を取り入れた休憩',
          ],
          expectedBenefit: 'エネルギーの効果的な活用が可能になります',
          basedOn: ['ADHDタイプ: 多動優勢型'],
        });
        break;

      case 'combined':
        recommendations.push({
          id: `combined-${Date.now()}`,
          type: 'technique-suggestion',
          priority: 8,
          title: '複合型対応戦略',
          description: '注意力と多動性の両面に対応した総合的なアプローチを実践しましょう',
          implementation: [
            '柔軟なセッション長の調整',
            '複数の対処法の組み合わせ',
            '状況に応じた戦略の切り替え',
            '包括的な環境最適化',
          ],
          expectedBenefit: '症状の包括的な管理が可能になります',
          basedOn: ['ADHDタイプ: 混合型'],
        });
        break;
    }

    return recommendations;
  }

  /**
   * ===== ヘルパーメソッド =====
   */

  private getTimeSlot(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  private getTimeDisplayName(timeSlot: string): string {
    const names = {
      morning: '朝（6-12時）',
      afternoon: '昼（12-17時）',
      evening: '夕方（17-22時）',
      night: '夜（22-6時）',
      variable: '変動',
    };
    return names[timeSlot as keyof typeof names] || timeSlot;
  }

  private saveInsights(insights: PersonalizationInsight[]): void {
    localStorage.setItem(this.STORAGE_KEYS.INSIGHTS, JSON.stringify(insights));
  }

  public getStoredInsights(): PersonalizationInsight[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.INSIGHTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('インサイト読み込みエラー:', error);
      return [];
    }
  }

  /**
   * ===== プロファイル自動更新 =====
   */

  public autoUpdateProfile(): void {
    const profile = this.getUserProfile();
    if (!profile) return;

    const insights = this.analyzeUserPatterns();
    const updates: Partial<UserProfile> = {};

    // 高信頼度のインサイトに基づくプロファイル自動更新
    insights.forEach((insight) => {
      if (insight.confidence > 0.8 && insight.type === 'optimization') {
        // 最適時間帯の更新など、特定の自動更新ロジック
        // 実装は慎重に行い、ユーザーの明示的な同意を得る
      }
    });

    if (Object.keys(updates).length > 0) {
      this.updateUserProfile(updates);
      this.emit('profileAutoUpdated', updates);
    }
  }

  /**
   * ===== データエクスポート/インポート =====
   */

  public exportPersonalizationData(): any {
    return {
      profile: this.getUserProfile(),
      insights: this.getStoredInsights(),
      recommendations: this.getAdaptiveRecommendations(),
      exportDate: new Date().toISOString(),
    };
  }
}

export const adhdPersonalization = ADHDPersonalizationService.getInstance();
export default adhdPersonalization;
