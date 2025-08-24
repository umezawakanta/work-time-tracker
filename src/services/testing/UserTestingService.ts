/**
 * 🔬 実ユーザーテストサービス
 * ADHD/ASDユーザー向けベータテスト・フィードバック収集・ユーザビリティ測定・改善提案システム
 */

import { EventEmitter } from 'eventemitter3';

// テストの種類
export type TestType =
  | 'usability_test'
  | 'accessibility_test'
  | 'cognitive_load_test'
  | 'feature_feedback'
  | 'bug_report'
  | 'satisfaction_survey'
  | 'adhd_specific_test'
  | 'asd_specific_test'
  | 'mobile_experience_test'
  | 'onboarding_test';

// ユーザープロファイル
export interface TestUserProfile {
  id: string;
  demographics: {
    age: number;
    gender: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
    location: string;
    education: string;
    techExperience: 'beginner' | 'intermediate' | 'advanced';
  };
  neurodiversity: {
    hasADHD: boolean;
    adhdType?: 'inattentive' | 'hyperactive' | 'combined';
    hasASD: boolean;
    hasOtherConditions: string[];
    medicationStatus: 'none' | 'adhd_medication' | 'other' | 'multiple';
    diagnosisDate?: Date;
    selfDiagnosed: boolean;
  };
  assistiveTechnology: {
    usesScreenReader: boolean;
    usesVoiceControl: boolean;
    usesKeyboardNavigation: boolean;
    preferredFontSize: number;
    preferredContrast: 'normal' | 'high' | 'low';
    otherAccommodations: string[];
  };
  preferences: {
    communicationStyle: 'direct' | 'gentle' | 'detailed' | 'minimal';
    feedbackPreference: 'immediate' | 'batched' | 'on_request';
    testingTimePreference: 'morning' | 'afternoon' | 'evening' | 'flexible';
    sessionLengthPreference: number; // minutes
  };
  consentGiven: {
    dataCollection: boolean;
    videoRecording: boolean;
    audioRecording: boolean;
    screenRecording: boolean;
    anonymousSharing: boolean;
    researchParticipation: boolean;
  };
}

// テストセッション
export interface TestSession {
  id: string;
  userId: string;
  testType: TestType;
  title: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
  tasks: TestTask[];
  environment: {
    device: 'desktop' | 'tablet' | 'mobile';
    browser: string;
    browserVersion: string;
    operatingSystem: string;
    screenResolution: string;
    assistiveTechUsed: string[];
  };
  facilitator?: string;
  recordingUrls?: {
    screen?: string;
    audio?: string;
    webcam?: string;
  };
  metadata: {
    testVersion: string;
    buildVersion: string;
    featureFlags: Record<string, boolean>;
    experimentalFeatures: string[];
  };
}

// テストタスク
export interface TestTask {
  id: string;
  sessionId: string;
  order: number;
  title: string;
  description: string;
  instructions: string[];
  successCriteria: string[];
  startTime?: Date;
  endTime?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  result: {
    completed: boolean;
    timeToComplete?: number; // seconds
    errorsCount: number;
    assistanceNeeded: boolean;
    frustrationLevel: number; // 1-10
    confidenceLevel: number; // 1-10
    cognitiveLoadRating: number; // 1-10
  };
  interactions: UserInteraction[];
  feedback: TaskFeedback;
}

// ユーザーインタラクション
export interface UserInteraction {
  id: string;
  taskId: string;
  timestamp: Date;
  type: 'click' | 'scroll' | 'keyboard' | 'voice' | 'gesture' | 'hover' | 'focus' | 'error';
  element: string;
  elementType: string;
  position?: { x: number; y: number };
  value?: string;
  duration?: number;
  successful: boolean;
  errorMessage?: string;
  cognitiveLoadAtTime: number; // 1-10
  emotionalState?: 'calm' | 'focused' | 'frustrated' | 'confused' | 'excited' | 'tired';
}

// タスクフィードバック
export interface TaskFeedback {
  taskId: string;
  userId: string;
  ratings: {
    difficulty: number; // 1-10
    clarity: number; // 1-10
    accessibility: number; // 1-10
    satisfaction: number; // 1-10
    adhdFriendliness: number; // 1-10
    asdFriendliness: number; // 1-10
  };
  verbatimFeedback: {
    whatWorkedWell: string;
    whatWasConfusing: string;
    suggestedImprovements: string;
    additionalComments: string;
  };
  adhdSpecificFeedback: {
    attentionChallenges: string[];
    distractionPoints: string[];
    hyperfocusExperience: string;
    executiveFunctionChallenges: string[];
    sensoryIssues: string[];
  };
  asdSpecificFeedback: {
    sensoryOverload: string[];
    routineDisruption: string;
    socialInteractionChallenges: string[];
    informationProcessing: string;
    communicationPreferences: string[];
  };
}

// テスト結果分析
export interface TestAnalysis {
  sessionId: string;
  userId: string;
  analysisDate: Date;
  overallMetrics: {
    completionRate: number; // percentage
    averageTaskTime: number; // seconds
    errorRate: number; // errors per task
    satisfactionScore: number; // 1-10
    cognitiveLoadScore: number; // 1-10
    accessibilityScore: number; // 1-10
  };
  adhdSpecificMetrics: {
    attentionMaintenance: number; // 1-10
    distractionResistance: number; // 1-10
    executiveFunctionSupport: number; // 1-10
    hyperfocusAccommodation: number; // 1-10
    sensoryFriendliness: number; // 1-10
  };
  asdSpecificMetrics: {
    predictabilityScore: number; // 1-10
    sensoryComfort: number; // 1-10
    communicationClarity: number; // 1-10
    routineSupport: number; // 1-10
    flexibilityBalance: number; // 1-10
  };
  insights: {
    strengthAreas: string[];
    improvementAreas: string[];
    criticalIssues: string[];
    quickWins: string[];
    longTermGoals: string[];
  };
  recommendations: TestRecommendation[];
}

// テスト推奨事項
export interface TestRecommendation {
  id: string;
  category: 'ui_design' | 'accessibility' | 'cognitive_support' | 'technical' | 'content';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  rationale: string;
  implementationEffort: 'low' | 'medium' | 'high';
  expectedImpact: 'low' | 'medium' | 'high';
  affectedUserGroups: string[];
  technicalDetails: {
    component?: string;
    files?: string[];
    estimatedHours?: number;
    dependencies?: string[];
  };
  businessImpact: {
    userSatisfactionImprovement: number; // percentage
    accessibilityCompliance: boolean;
    retentionImpact: number; // percentage
    supportTicketReduction: number; // percentage
  };
}

// 集約分析結果
export interface AggregatedInsights {
  analysisDate: Date;
  totalParticipants: number;
  sessionsAnalyzed: number;
  demographics: {
    adhdUsers: number;
    asdUsers: number;
    neurotypicalUsers: number;
    averageAge: number;
    deviceDistribution: Record<string, number>;
  };
  overallFindings: {
    mostProblematicFeatures: string[];
    bestPerformingFeatures: string[];
    commonUserJourneyIssues: string[];
    accessibilityGaps: string[];
    adhdSpecificChallenges: string[];
    asdSpecificChallenges: string[];
  };
  prioritizedRecommendations: TestRecommendation[];
  nextSteps: {
    immediateActions: string[];
    designIterations: string[];
    developmentTasks: string[];
    researchQuestions: string[];
  };
}

class UserTestingService extends EventEmitter {
  private static instance: UserTestingService | null = null;
  private testUsers: Map<string, TestUserProfile> = new Map();
  private sessions: Map<string, TestSession> = new Map();
  private analyses: Map<string, TestAnalysis> = new Map();
  private aggregatedInsights: AggregatedInsights | null = null;
  private isRecording: boolean = false;
  private currentSession: TestSession | null = null;

  private constructor() {
    super();
    this.initializeTestingEnvironment();
    console.log('🔬 User Testing Service initialized');
  }

  static getInstance(): UserTestingService {
    if (!UserTestingService.instance) {
      UserTestingService.instance = new UserTestingService();
    }
    return UserTestingService.instance;
  }

  /**
   * テスト環境初期化
   */
  private initializeTestingEnvironment(): void {
    // テスト用のイベントリスナー設定
    this.setupEventListeners();

    // パフォーマンス測定開始
    this.startPerformanceMonitoring();

    console.log('🧪 Testing environment configured for ADHD/ASD user research');
  }

  /**
   * テストユーザー登録
   */
  async registerTestUser(profile: Omit<TestUserProfile, 'id'>): Promise<string> {
    const userId = `test_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const completeProfile: TestUserProfile = {
      id: userId,
      ...profile,
    };

    this.testUsers.set(userId, completeProfile);

    this.emit('userRegistered', { userId, profile: completeProfile });

    console.log(`👤 Test user registered: ${userId}`);
    return userId;
  }

  /**
   * テストセッション作成
   */
  async createTestSession(
    userId: string,
    testType: TestType,
    title: string,
    description: string,
    tasks: Omit<TestTask, 'id' | 'sessionId' | 'interactions' | 'result' | 'feedback'>[]
  ): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 環境情報取得
    const environment = await this.detectEnvironment();

    const session: TestSession = {
      id: sessionId,
      userId,
      testType,
      title,
      description,
      startTime: new Date(),
      status: 'scheduled',
      tasks: tasks.map((task, index) => ({
        ...task,
        id: `task_${sessionId}_${index}`,
        sessionId,
        order: index,
        status: 'pending',
        result: {
          completed: false,
          errorsCount: 0,
          assistanceNeeded: false,
          frustrationLevel: 5,
          confidenceLevel: 5,
          cognitiveLoadRating: 5,
        },
        interactions: [],
        feedback: {
          taskId: `task_${sessionId}_${index}`,
          userId,
          ratings: {
            difficulty: 5,
            clarity: 5,
            accessibility: 5,
            satisfaction: 5,
            adhdFriendliness: 5,
            asdFriendliness: 5,
          },
          verbatimFeedback: {
            whatWorkedWell: '',
            whatWasConfusing: '',
            suggestedImprovements: '',
            additionalComments: '',
          },
          adhdSpecificFeedback: {
            attentionChallenges: [],
            distractionPoints: [],
            hyperfocusExperience: '',
            executiveFunctionChallenges: [],
            sensoryIssues: [],
          },
          asdSpecificFeedback: {
            sensoryOverload: [],
            routineDisruption: '',
            socialInteractionChallenges: [],
            informationProcessing: '',
            communicationPreferences: [],
          },
        },
      })),
      environment,
      metadata: {
        testVersion: '1.0.0',
        buildVersion: process.env.REACT_APP_VERSION || '1.0.0',
        featureFlags: await this.getActiveFeatureFlags(),
        experimentalFeatures: await this.getExperimentalFeatures(),
      },
    };

    this.sessions.set(sessionId, session);

    this.emit('sessionCreated', { sessionId, session });

    console.log(`📝 Test session created: ${sessionId} for user ${userId}`);
    return sessionId;
  }

  /**
   * テストセッション開始
   */
  async startTestSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.status !== 'scheduled') {
      throw new Error(`Session ${sessionId} is not in scheduled status`);
    }

    // セッション開始
    session.status = 'in_progress';
    session.startTime = new Date();
    this.currentSession = session;

    // 記録開始
    await this.startRecording(session);

    // 最初のタスクを開始
    if (session.tasks.length > 0) {
      session.tasks[0].status = 'in_progress';
      session.tasks[0].startTime = new Date();
    }

    this.emit('sessionStarted', { sessionId, session });

    console.log(`▶️ Test session started: ${sessionId}`);
  }

  /**
   * ユーザーインタラクション記録
   */
  recordUserInteraction(
    sessionId: string,
    taskId: string,
    interaction: Omit<UserInteraction, 'id' | 'taskId' | 'timestamp'>
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'in_progress') return;

    const task = session.tasks.find((t) => t.id === taskId);
    if (!task || task.status !== 'in_progress') return;

    const completeInteraction: UserInteraction = {
      id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskId,
      timestamp: new Date(),
      ...interaction,
    };

    task.interactions.push(completeInteraction);

    // リアルタイム分析
    this.analyzeInteractionInRealtime(completeInteraction, task);

    this.emit('interactionRecorded', { sessionId, taskId, interaction: completeInteraction });
  }

  /**
   * タスク完了
   */
  async completeTask(
    sessionId: string,
    taskId: string,
    result: TestTask['result'],
    feedback: TaskFeedback
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const task = session.tasks.find((t) => t.id === taskId);
    if (!task) return;

    // タスク完了処理
    task.status = 'completed';
    task.endTime = new Date();
    task.result = result;
    task.feedback = feedback;

    // 次のタスク開始
    const nextTask = session.tasks.find((t) => t.status === 'pending');
    if (nextTask) {
      nextTask.status = 'in_progress';
      nextTask.startTime = new Date();
    } else {
      // 全タスク完了
      await this.completeSession(sessionId);
    }

    this.emit('taskCompleted', { sessionId, taskId, result, feedback });

    console.log(`✅ Task completed: ${taskId} in session ${sessionId}`);
  }

  /**
   * セッション完了
   */
  async completeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.status = 'completed';
    session.endTime = new Date();
    this.currentSession = null;

    // 記録停止
    await this.stopRecording(session);

    // 分析開始
    const analysis = await this.analyzeSession(sessionId);

    this.emit('sessionCompleted', { sessionId, session, analysis });

    console.log(`🏁 Test session completed: ${sessionId}`);
  }

  /**
   * セッション分析
   */
  private async analyzeSession(sessionId: string): Promise<TestAnalysis> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const user = this.testUsers.get(session.userId);
    if (!user) {
      throw new Error(`User ${session.userId} not found`);
    }

    // 基本メトリクス計算
    const overallMetrics = this.calculateOverallMetrics(session);

    // ADHD特化メトリクス
    const adhdSpecificMetrics = this.calculateADHDMetrics(session, user);

    // ASD特化メトリクス
    const asdSpecificMetrics = this.calculateASDMetrics(session, user);

    // インサイト生成
    const insights = this.generateInsights(
      session,
      overallMetrics,
      adhdSpecificMetrics,
      asdSpecificMetrics
    );

    // 推奨事項生成
    const recommendations = this.generateRecommendations(session, insights);

    const analysis: TestAnalysis = {
      sessionId,
      userId: session.userId,
      analysisDate: new Date(),
      overallMetrics,
      adhdSpecificMetrics,
      asdSpecificMetrics,
      insights,
      recommendations,
    };

    this.analyses.set(sessionId, analysis);

    return analysis;
  }

  /**
   * 集約分析
   */
  async generateAggregatedInsights(): Promise<AggregatedInsights> {
    const allAnalyses = Array.from(this.analyses.values());
    const allUsers = Array.from(this.testUsers.values());

    if (allAnalyses.length === 0) {
      throw new Error('No test sessions available for analysis');
    }

    // 人口統計情報
    const demographics = {
      adhdUsers: allUsers.filter((u) => u.neurodiversity.hasADHD).length,
      asdUsers: allUsers.filter((u) => u.neurodiversity.hasASD).length,
      neurotypicalUsers: allUsers.filter(
        (u) => !u.neurodiversity.hasADHD && !u.neurodiversity.hasASD
      ).length,
      averageAge: allUsers.reduce((sum, u) => sum + u.demographics.age, 0) / allUsers.length,
      deviceDistribution: this.calculateDeviceDistribution(allAnalyses),
    };

    // 全体的発見事項
    const overallFindings = {
      mostProblematicFeatures: this.identifyProblematicFeatures(allAnalyses),
      bestPerformingFeatures: this.identifyBestFeatures(allAnalyses),
      commonUserJourneyIssues: this.identifyJourneyIssues(allAnalyses),
      accessibilityGaps: this.identifyAccessibilityGaps(allAnalyses),
      adhdSpecificChallenges: this.identifyADHDChallenges(allAnalyses),
      asdSpecificChallenges: this.identifyASDChallenges(allAnalyses),
    };

    // 優先順位付き推奨事項
    const prioritizedRecommendations = this.prioritizeRecommendations(allAnalyses);

    // 次のステップ
    const nextSteps = this.generateNextSteps(overallFindings, prioritizedRecommendations);

    const insights: AggregatedInsights = {
      analysisDate: new Date(),
      totalParticipants: allUsers.length,
      sessionsAnalyzed: allAnalyses.length,
      demographics,
      overallFindings,
      prioritizedRecommendations,
      nextSteps,
    };

    this.aggregatedInsights = insights;
    this.emit('aggregatedInsightsGenerated', insights);

    return insights;
  }

  /**
   * ヘルパーメソッド
   */
  private setupEventListeners(): void {
    // DOM イベントリスナー設定
    if (typeof document !== 'undefined') {
      document.addEventListener('click', this.handleDOMEvent.bind(this));
      document.addEventListener('scroll', this.handleDOMEvent.bind(this));
      document.addEventListener('keydown', this.handleDOMEvent.bind(this));
      document.addEventListener('focus', this.handleDOMEvent.bind(this));
      document.addEventListener('blur', this.handleDOMEvent.bind(this));
    }
  }

  private handleDOMEvent(event: Event): void {
    if (!this.currentSession || !this.isRecording) return;

    const currentTask = this.currentSession.tasks.find((t) => t.status === 'in_progress');
    if (!currentTask) return;

    // インタラクション記録
    this.recordUserInteraction(this.currentSession.id, currentTask.id, {
      type: this.mapEventTypeToInteractionType(event.type),
      element: this.getElementSelector(event.target as HTMLElement),
      elementType: (event.target as HTMLElement)?.tagName || 'unknown',
      position: this.getEventPosition(event),
      successful: true,
      cognitiveLoadAtTime: this.estimateCurrentCognitiveLoad(),
    });
  }

  private async detectEnvironment(): Promise<TestSession['environment']> {
    return {
      device: this.detectDeviceType(),
      browser: navigator.userAgent.split(' ')[0] || 'unknown',
      browserVersion: navigator.userAgent || 'unknown',
      operatingSystem: navigator.platform || 'unknown',
      screenResolution: `${screen.width}x${screen.height}`,
      assistiveTechUsed: await this.detectAssistiveTech(),
    };
  }

  private async startRecording(session: TestSession): Promise<void> {
    this.isRecording = true;

    // 実際の実装では、適切な録画ライブラリを使用
    console.log(`🎥 Recording started for session ${session.id}`);
  }

  private async stopRecording(session: TestSession): Promise<void> {
    this.isRecording = false;

    console.log(`🛑 Recording stopped for session ${session.id}`);
  }

  private analyzeInteractionInRealtime(interaction: UserInteraction, task: TestTask): void {
    // リアルタイム分析ロジック
    if (!interaction.successful) {
      task.result.errorsCount++;
    }

    // 認知負荷が高い場合のアラート
    if (interaction.cognitiveLoadAtTime > 8) {
      this.emit('highCognitiveLoad', {
        sessionId: this.currentSession?.id,
        taskId: task.id,
        cognitiveLoad: interaction.cognitiveLoadAtTime,
      });
    }
  }

  // プレースホルダーメソッド（実際の実装で拡張）
  private startPerformanceMonitoring(): void {}
  private async getActiveFeatureFlags(): Promise<Record<string, boolean>> {
    return {};
  }
  private async getExperimentalFeatures(): Promise<string[]> {
    return [];
  }
  private mapEventTypeToInteractionType(eventType: string): UserInteraction['type'] {
    return 'click';
  }
  private getElementSelector(element: HTMLElement): string {
    return element.tagName || 'unknown';
  }
  private getEventPosition(event: Event): { x: number; y: number } | undefined {
    return undefined;
  }
  private estimateCurrentCognitiveLoad(): number {
    return 5;
  }
  private detectDeviceType(): TestSession['environment']['device'] {
    return 'desktop';
  }
  private async detectAssistiveTech(): Promise<string[]> {
    return [];
  }
  private calculateOverallMetrics(session: TestSession): TestAnalysis['overallMetrics'] {
    return {
      completionRate: 85,
      averageTaskTime: 120,
      errorRate: 0.2,
      satisfactionScore: 7.5,
      cognitiveLoadScore: 6.2,
      accessibilityScore: 8.1,
    };
  }
  private calculateADHDMetrics(
    session: TestSession,
    user: TestUserProfile
  ): TestAnalysis['adhdSpecificMetrics'] {
    return {
      attentionMaintenance: 7,
      distractionResistance: 6,
      executiveFunctionSupport: 8,
      hyperfocusAccommodation: 7,
      sensoryFriendliness: 8,
    };
  }
  private calculateASDMetrics(
    session: TestSession,
    user: TestUserProfile
  ): TestAnalysis['asdSpecificMetrics'] {
    return {
      predictabilityScore: 8,
      sensoryComfort: 7,
      communicationClarity: 8,
      routineSupport: 9,
      flexibilityBalance: 6,
    };
  }
  private generateInsights(
    session: TestSession,
    overall: any,
    adhd: any,
    asd: any
  ): TestAnalysis['insights'] {
    return {
      strengthAreas: [],
      improvementAreas: [],
      criticalIssues: [],
      quickWins: [],
      longTermGoals: [],
    };
  }
  private generateRecommendations(
    session: TestSession,
    insights: TestAnalysis['insights']
  ): TestRecommendation[] {
    return [];
  }
  private calculateDeviceDistribution(analyses: TestAnalysis[]): Record<string, number> {
    return {};
  }
  private identifyProblematicFeatures(analyses: TestAnalysis[]): string[] {
    return [];
  }
  private identifyBestFeatures(analyses: TestAnalysis[]): string[] {
    return [];
  }
  private identifyJourneyIssues(analyses: TestAnalysis[]): string[] {
    return [];
  }
  private identifyAccessibilityGaps(analyses: TestAnalysis[]): string[] {
    return [];
  }
  private identifyADHDChallenges(analyses: TestAnalysis[]): string[] {
    return [];
  }
  private identifyASDChallenges(analyses: TestAnalysis[]): string[] {
    return [];
  }
  private prioritizeRecommendations(analyses: TestAnalysis[]): TestRecommendation[] {
    return [];
  }
  private generateNextSteps(
    findings: any,
    recommendations: TestRecommendation[]
  ): AggregatedInsights['nextSteps'] {
    return {
      immediateActions: [],
      designIterations: [],
      developmentTasks: [],
      researchQuestions: [],
    };
  }

  /**
   * 公開メソッド
   */
  public getTestUser(userId: string): TestUserProfile | null {
    return this.testUsers.get(userId) || null;
  }

  public getTestSession(sessionId: string): TestSession | null {
    return this.sessions.get(sessionId) || null;
  }

  public getSessionAnalysis(sessionId: string): TestAnalysis | null {
    return this.analyses.get(sessionId) || null;
  }

  public getAllTestSessions(): TestSession[] {
    return Array.from(this.sessions.values());
  }

  public getAggregatedInsights(): AggregatedInsights | null {
    return this.aggregatedInsights;
  }

  public getDashboardData() {
    return {
      totalUsers: this.testUsers.size,
      totalSessions: this.sessions.size,
      completedSessions: Array.from(this.sessions.values()).filter((s) => s.status === 'completed')
        .length,
      ongoingSessions: Array.from(this.sessions.values()).filter((s) => s.status === 'in_progress')
        .length,
      insights: this.aggregatedInsights,
      recentAnalyses: Array.from(this.analyses.values()).slice(-5),
    };
  }
}

export const userTestingService = UserTestingService.getInstance();
export default userTestingService;
