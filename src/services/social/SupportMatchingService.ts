/**
 * 🎯 サポートマッチングサービス
 * ADHD/ASD特性を考慮した高度なピアサポートマッチングアルゴリズム
 */

import { BrowserEventEmitter as EventEmitter } from '@/lib/BrowserEventEmitter';

// マッチング用の型定義
interface UserCharacteristics {
  userId: string;
  diagnostics: ('adhd' | 'asd' | 'both' | 'suspected' | 'supporter')[];
  adhdSubtype?: 'inattentive' | 'hyperactive' | 'combined';
  asdLevel?: 1 | 2 | 3;
  comorbidities: string[];
  strengths: string[];
  challenges: string[];
  copingStrategies: string[];
  triggers: string[];
  communication: {
    style: 'direct' | 'gentle' | 'structured' | 'flexible';
    preferences: ('text' | 'voice' | 'video' | 'in_person')[];
    pacePreference: 'slow' | 'moderate' | 'fast';
    detailLevel: 'minimal' | 'moderate' | 'comprehensive';
  };
  availability: {
    timezone: string;
    preferredHours: { day: string; start: string; end: string }[];
    responseTime: 'immediate' | 'within_hour' | 'within_day' | 'flexible';
    sessionLength: 'short' | 'medium' | 'long' | 'flexible';
  };
  experience: {
    yearsWithDiagnosis: number;
    supportExperience: number;
    mentorshipExperience: number;
    groupExperience: number;
    professionalSupport: boolean;
  };
  personality: {
    introversion: number; // 0-100
    empathy: number; // 0-100
    patience: number; // 0-100
    optimism: number; // 0-100
    reliability: number; // 0-100
  };
  interests: string[];
  culturalBackground: {
    country: string;
    language: string;
    culturalFactors: string[];
  };
}

interface MatchingRequest {
  id: string;
  requesterId: string;
  type:
    | 'peer_support'
    | 'mentoring'
    | 'buddy_system'
    | 'crisis_support'
    | 'skill_sharing'
    | 'study_partner';
  urgency: 'low' | 'medium' | 'high' | 'crisis';
  duration: 'one_time' | 'short_term' | 'long_term' | 'ongoing';
  supportAreas: string[];
  preferredCharacteristics: {
    diagnostics?: ('adhd' | 'asd' | 'both')[];
    experienceLevel?: 'beginner' | 'intermediate' | 'experienced';
    ageRange?: { min: number; max: number };
    gender?: 'any' | 'same' | 'different';
    communicationStyle?: string[];
    personalityTraits?: string[];
    sharedInterests?: string[];
    culturalMatching?: boolean;
  };
  avoidanceFactors: string[];
  specificRequests: string;
  previousMatches: string[]; // user IDs of previous matches
  createdAt: Date;
  expiresAt: Date;
}

interface MatchScore {
  supporterId: string;
  overallScore: number; // 0-100
  compatibilityBreakdown: {
    diagnosticCompatibility: number;
    experienceMatch: number;
    communicationFit: number;
    personalityAlignment: number;
    availabilityOverlap: number;
    interestSimilarity: number;
    culturalFit: number;
    avoidanceFactors: number;
  };
  potentialChallenges: string[];
  strengths: string[];
  confidence: number; // 0-100
  reasoning: string;
}

interface MatchRecommendation {
  matchId: string;
  requesterId: string;
  supporterId: string;
  score: MatchScore;
  supportType: string;
  recommendedApproach: {
    initialContact: string;
    communicationMethod: string;
    sessionStructure: string;
    goals: string[];
    timeline: string;
  };
  riskFactors: string[];
  successPredictors: string[];
  followUpSchedule: string[];
  createdAt: Date;
}

export class SupportMatchingService extends EventEmitter {
  private userCharacteristics: Map<string, UserCharacteristics> = new Map();
  private matchingRequests: Map<string, MatchingRequest> = new Map();
  private matchRecommendations: Map<string, MatchRecommendation> = new Map();
  private matchingHistory: Map<string, any[]> = new Map();
  private learningData: Map<string, any> = new Map();

  constructor() {
    super();
    this.initializeMatchingService();
  }

  /**
   * マッチングサービスの初期化
   */
  private async initializeMatchingService(): Promise<void> {
    console.log('🎯 サポートマッチングサービスを初期化中...');

    this.initializeDefaultCharacteristics();
    this.startPeriodicMatching();
    this.initializeLearningSystem();

    console.log('✅ サポートマッチングサービスが準備完了');
    this.emit('systemReady');
  }

  /**
   * デフォルト特性の初期化
   */
  private initializeDefaultCharacteristics(): void {
    const demoCharacteristics: UserCharacteristics = {
      userId: 'demo-user',
      diagnostics: ['adhd'],
      adhdSubtype: 'combined',
      comorbidities: ['anxiety'],
      strengths: ['創造性', '直感力', '問題解決'],
      challenges: ['時間管理', '優先順位設定', '集中維持'],
      copingStrategies: ['タイマー使用', 'リスト作成', '環境調整'],
      triggers: ['騒音', '時間プレッシャー', '複数タスク'],
      communication: {
        style: 'flexible',
        preferences: ['text', 'voice'],
        pacePreference: 'moderate',
        detailLevel: 'moderate',
      },
      availability: {
        timezone: 'Asia/Tokyo',
        preferredHours: [
          { day: 'weekday', start: '19:00', end: '22:00' },
          { day: 'weekend', start: '10:00', end: '18:00' },
        ],
        responseTime: 'within_hour',
        sessionLength: 'medium',
      },
      experience: {
        yearsWithDiagnosis: 3,
        supportExperience: 1,
        mentorshipExperience: 0,
        groupExperience: 2,
        professionalSupport: true,
      },
      personality: {
        introversion: 60,
        empathy: 85,
        patience: 70,
        optimism: 75,
        reliability: 80,
      },
      interests: ['技術', '読書', '音楽', 'ゲーム'],
      culturalBackground: {
        country: 'JP',
        language: 'ja',
        culturalFactors: ['集団主義', '間接的コミュニケーション'],
      },
    };

    this.userCharacteristics.set('demo-user', demoCharacteristics);
  }

  /**
   * 定期的マッチング処理の開始
   */
  private startPeriodicMatching(): void {
    // 5分間隔でマッチング処理を実行
    setInterval(
      () => {
        this.processMatchingQueue();
      },
      5 * 60 * 1000
    );

    // 1時間間隔でマッチング学習を実行
    setInterval(
      () => {
        this.updateMatchingAlgorithm();
      },
      60 * 60 * 1000
    );
  }

  /**
   * 学習システムの初期化
   */
  private initializeLearningSystem(): void {
    // マッチング成功率を学習するためのベースライン設定
    this.learningData.set('baseline_scores', {
      diagnostic_weight: 0.25,
      experience_weight: 0.2,
      communication_weight: 0.2,
      personality_weight: 0.15,
      availability_weight: 0.1,
      interest_weight: 0.05,
      cultural_weight: 0.05,
    });
  }

  /**
   * マッチングリクエストの作成
   */
  public async createMatchingRequest(
    requesterId: string,
    requestData: Omit<
      MatchingRequest,
      'id' | 'requesterId' | 'createdAt' | 'expiresAt' | 'previousMatches'
    >
  ): Promise<string> {
    const requestId = `match_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const request: MatchingRequest = {
      id: requestId,
      requesterId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日後に期限切れ
      previousMatches: this.getPreviousMatches(requesterId),
      ...requestData,
    };

    this.matchingRequests.set(requestId, request);

    // 即座にマッチング試行
    await this.processMatchingRequest(requestId);

    this.emit('matchingRequestCreated', { requestId, urgency: request.urgency });
    return requestId;
  }

  /**
   * 個別マッチングリクエストの処理
   */
  private async processMatchingRequest(requestId: string): Promise<void> {
    const request = this.matchingRequests.get(requestId);
    if (!request) return;

    const requesterCharacteristics = this.userCharacteristics.get(request.requesterId);
    if (!requesterCharacteristics) return;

    // 利用可能なサポーター候補を取得
    const candidates = this.findCandidates(request, requesterCharacteristics);

    // 各候補のマッチスコアを計算
    const scoredCandidates = await Promise.all(
      candidates.map((candidate) =>
        this.calculateMatchScore(request, requesterCharacteristics, candidate)
      )
    );

    // スコア順でソート
    const sortedCandidates = scoredCandidates
      .filter((score) => score.overallScore >= 60) // 最低閾値
      .sort((a, b) => b.overallScore - a.overallScore);

    if (sortedCandidates.length > 0) {
      // 最適候補でマッチング推奨を作成
      const bestMatch = sortedCandidates[0];
      await this.createMatchRecommendation(request, bestMatch);
    } else {
      // マッチなしの場合、要求を調整提案
      await this.suggestRequestAdjustments(requestId);
    }
  }

  /**
   * 候補者検索
   */
  private findCandidates(
    request: MatchingRequest,
    requesterCharacteristics: UserCharacteristics
  ): UserCharacteristics[] {
    const candidates: UserCharacteristics[] = [];

    for (const [userId, characteristics] of this.userCharacteristics) {
      // 自分自身を除外
      if (userId === request.requesterId) continue;

      // 過去のマッチを除外
      if (request.previousMatches.includes(userId)) continue;

      // 基本的な適格性チェック
      if (this.isEligibleCandidate(request, characteristics)) {
        candidates.push(characteristics);
      }
    }

    return candidates;
  }

  /**
   * 基本適格性チェック
   */
  private isEligibleCandidate(request: MatchingRequest, candidate: UserCharacteristics): boolean {
    // 診断要件チェック
    if (request.preferredCharacteristics.diagnostics) {
      const hasMatchingDiagnosis = request.preferredCharacteristics.diagnostics.some((diag) =>
        candidate.diagnostics.includes(diag)
      );
      if (!hasMatchingDiagnosis) return false;
    }

    // 経験レベルチェック
    if (request.preferredCharacteristics.experienceLevel) {
      if (
        !this.matchesExperienceLevel(candidate, request.preferredCharacteristics.experienceLevel)
      ) {
        return false;
      }
    }

    // 言語チェック
    if (candidate.culturalBackground.language !== 'ja') return false; // 現在は日本語のみ

    // 利用可能性の基本チェック
    if (!this.hasAvailabilityOverlap(request, candidate)) return false;

    return true;
  }

  /**
   * 経験レベルマッチング
   */
  private matchesExperienceLevel(candidate: UserCharacteristics, requiredLevel: string): boolean {
    const totalExperience =
      candidate.experience.supportExperience + candidate.experience.mentorshipExperience;

    switch (requiredLevel) {
      case 'beginner':
        return totalExperience <= 1;
      case 'intermediate':
        return totalExperience >= 1 && totalExperience <= 5;
      case 'experienced':
        return totalExperience >= 3;
      default:
        return true;
    }
  }

  /**
   * 利用可能時間の重複チェック
   */
  private hasAvailabilityOverlap(
    request: MatchingRequest,
    candidate: UserCharacteristics
  ): boolean {
    // 簡略化された実装：時間帯の重複があるかチェック
    return candidate.availability.preferredHours.length > 0;
  }

  /**
   * マッチスコア計算
   */
  private async calculateMatchScore(
    request: MatchingRequest,
    requester: UserCharacteristics,
    candidate: UserCharacteristics
  ): Promise<MatchScore> {
    const weights = this.learningData.get('baseline_scores');

    // 各要素のスコア計算
    const diagnosticScore = this.calculateDiagnosticCompatibility(requester, candidate);
    const experienceScore = this.calculateExperienceMatch(request, candidate);
    const communicationScore = this.calculateCommunicationFit(requester, candidate);
    const personalityScore = this.calculatePersonalityAlignment(requester, candidate);
    const availabilityScore = this.calculateAvailabilityOverlap(requester, candidate);
    const interestScore = this.calculateInterestSimilarity(requester, candidate);
    const culturalScore = this.calculateCulturalFit(requester, candidate);
    const avoidanceScore = this.calculateAvoidanceFactors(request, candidate);

    // 重み付き総合スコア
    const overallScore = Math.round(
      diagnosticScore * weights.diagnostic_weight +
        experienceScore * weights.experience_weight +
        communicationScore * weights.communication_weight +
        personalityScore * weights.personality_weight +
        availabilityScore * weights.availability_weight +
        interestScore * weights.interest_weight +
        culturalScore * weights.cultural_weight +
        avoidanceScore * 0.1
    );

    // 潜在的課題と強みの特定
    const potentialChallenges = this.identifyPotentialChallenges(requester, candidate);
    const strengths = this.identifyStrengths(requester, candidate);

    // 信頼度計算
    const confidence = this.calculateConfidence(overallScore, [
      diagnosticScore,
      experienceScore,
      communicationScore,
      personalityScore,
    ]);

    return {
      supporterId: candidate.userId,
      overallScore: Math.max(0, Math.min(100, overallScore)),
      compatibilityBreakdown: {
        diagnosticCompatibility: diagnosticScore,
        experienceMatch: experienceScore,
        communicationFit: communicationScore,
        personalityAlignment: personalityScore,
        availabilityOverlap: availabilityScore,
        interestSimilarity: interestScore,
        culturalFit: culturalScore,
        avoidanceFactors: avoidanceScore,
      },
      potentialChallenges,
      strengths,
      confidence,
      reasoning: this.generateReasoningText(
        overallScore,
        diagnosticScore,
        experienceScore,
        communicationScore
      ),
    };
  }

  /**
   * 診断適合性計算
   */
  private calculateDiagnosticCompatibility(
    requester: UserCharacteristics,
    candidate: UserCharacteristics
  ): number {
    let score = 0;

    // 同一診断の場合
    const sharedDiagnoses = requester.diagnostics.filter((d) => candidate.diagnostics.includes(d));
    score += sharedDiagnoses.length * 30;

    // ADHD同士の場合、サブタイプも考慮
    if (requester.diagnostics.includes('adhd') && candidate.diagnostics.includes('adhd')) {
      if (requester.adhdSubtype === candidate.adhdSubtype) {
        score += 20;
      } else if (requester.adhdSubtype === 'combined' || candidate.adhdSubtype === 'combined') {
        score += 10; // combinedタイプは理解が広い
      }
    }

    // 併存症の共通性
    const sharedComorbidities = requester.comorbidities.filter((c) =>
      candidate.comorbidities.includes(c)
    );
    score += sharedComorbidities.length * 15;

    return Math.min(100, score);
  }

  /**
   * 経験マッチング計算
   */
  private calculateExperienceMatch(
    request: MatchingRequest,
    candidate: UserCharacteristics
  ): number {
    let score = 50; // ベーススコア

    // サポート経験
    if (candidate.experience.supportExperience > 0) {
      score += Math.min(30, candidate.experience.supportExperience * 10);
    }

    // 要求タイプに応じた経験評価
    switch (request.type) {
      case 'mentoring':
        score += candidate.experience.mentorshipExperience * 15;
        break;
      case 'crisis_support':
        score += candidate.experience.professionalSupport ? 20 : -10;
        break;
      case 'peer_support':
        // ピアサポートでは経験差が大きすぎない方が良い
        if (candidate.experience.yearsWithDiagnosis > 10) score -= 10;
        break;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * コミュニケーション適合性計算
   */
  private calculateCommunicationFit(
    requester: UserCharacteristics,
    candidate: UserCharacteristics
  ): number {
    let score = 0;

    // コミュニケーションスタイル
    if (requester.communication.style === candidate.communication.style) {
      score += 40;
    } else if (
      requester.communication.style === 'flexible' ||
      candidate.communication.style === 'flexible'
    ) {
      score += 25;
    }

    // 共通の好みの通信手段
    const sharedPreferences = requester.communication.preferences.filter((p) =>
      candidate.communication.preferences.includes(p)
    );
    score += sharedPreferences.length * 15;

    // ペースの適合性
    if (requester.communication.pacePreference === candidate.communication.pacePreference) {
      score += 20;
    } else if (
      requester.communication.pacePreference === 'moderate' ||
      candidate.communication.pacePreference === 'moderate'
    ) {
      score += 10;
    }

    return Math.min(100, score);
  }

  /**
   * 性格適合性計算
   */
  private calculatePersonalityAlignment(
    requester: UserCharacteristics,
    candidate: UserCharacteristics
  ): number {
    let score = 0;

    // 内向性/外向性の適合性
    const introversionDiff = Math.abs(
      requester.personality.introversion - candidate.personality.introversion
    );
    score += Math.max(0, 30 - introversionDiff / 3);

    // 共感性（サポーターは高い方が良い）
    score += candidate.personality.empathy / 2;

    // 忍耐力（サポーターは高い方が良い）
    score += candidate.personality.patience / 3;

    // 信頼性（両者とも重要）
    const avgReliability =
      (requester.personality.reliability + candidate.personality.reliability) / 2;
    score += avgReliability / 4;

    return Math.min(100, score);
  }

  /**
   * 利用可能時間重複計算
   */
  private calculateAvailabilityOverlap(
    requester: UserCharacteristics,
    candidate: UserCharacteristics
  ): number {
    // 簡略化された実装
    const requesterHours = requester.availability.preferredHours.length;
    const candidateHours = candidate.availability.preferredHours.length;

    if (requesterHours === 0 || candidateHours === 0) return 0;

    // タイムゾーンチェック
    if (requester.availability.timezone !== candidate.availability.timezone) return 20;

    // 重複する時間帯があると仮定して基本スコア
    return 70;
  }

  /**
   * 興味類似性計算
   */
  private calculateInterestSimilarity(
    requester: UserCharacteristics,
    candidate: UserCharacteristics
  ): number {
    const sharedInterests = requester.interests.filter((interest) =>
      candidate.interests.includes(interest)
    );

    const maxInterests = Math.max(requester.interests.length, candidate.interests.length);
    if (maxInterests === 0) return 50;

    return Math.round((sharedInterests.length / maxInterests) * 100);
  }

  /**
   * 文化的適合性計算
   */
  private calculateCulturalFit(
    requester: UserCharacteristics,
    candidate: UserCharacteristics
  ): number {
    let score = 50; // ベーススコア

    // 同一国の場合
    if (requester.culturalBackground.country === candidate.culturalBackground.country) {
      score += 30;
    }

    // 言語
    if (requester.culturalBackground.language === candidate.culturalBackground.language) {
      score += 20;
    }

    return Math.min(100, score);
  }

  /**
   * 回避要因計算
   */
  private calculateAvoidanceFactors(
    request: MatchingRequest,
    candidate: UserCharacteristics
  ): number {
    let penalty = 0;

    // 要求者の回避要因に該当するかチェック
    for (const avoidance of request.avoidanceFactors) {
      if (candidate.challenges.includes(avoidance) || candidate.triggers.includes(avoidance)) {
        penalty += 20;
      }
    }

    return Math.max(0, 100 - penalty);
  }

  /**
   * 潜在的課題の特定
   */
  private identifyPotentialChallenges(
    requester: UserCharacteristics,
    candidate: UserCharacteristics
  ): string[] {
    const challenges: string[] = [];

    // 両者の課題が重複する場合
    const sharedChallenges = requester.challenges.filter((c) => candidate.challenges.includes(c));
    if (sharedChallenges.length > 0) {
      challenges.push(`共通の課題: ${sharedChallenges.join(', ')}`);
    }

    // トリガーの重複
    const sharedTriggers = requester.triggers.filter((t) => candidate.triggers.includes(t));
    if (sharedTriggers.length > 0) {
      challenges.push(`共通のトリガー: ${sharedTriggers.join(', ')}`);
    }

    // 性格の極端な違い
    const introversionDiff = Math.abs(
      requester.personality.introversion - candidate.personality.introversion
    );
    if (introversionDiff > 50) {
      challenges.push('コミュニケーションスタイルの大きな差');
    }

    return challenges;
  }

  /**
   * 強みの特定
   */
  private identifyStrengths(
    requester: UserCharacteristics,
    candidate: UserCharacteristics
  ): string[] {
    const strengths: string[] = [];

    // 候補者の強みが要求者の課題をカバーできる場合
    const complementaryStrengths = candidate.strengths.filter((s) =>
      requester.challenges.some((c) => this.isComplementary(s, c))
    );
    if (complementaryStrengths.length > 0) {
      strengths.push(`補完的強み: ${complementaryStrengths.join(', ')}`);
    }

    // 高い共感性
    if (candidate.personality.empathy > 80) {
      strengths.push('高い共感性');
    }

    // 豊富な経験
    if (candidate.experience.supportExperience > 2) {
      strengths.push('豊富なサポート経験');
    }

    // 類似の成功戦略
    const sharedStrategies = requester.copingStrategies.filter((s) =>
      candidate.copingStrategies.includes(s)
    );
    if (sharedStrategies.length > 0) {
      strengths.push(`共通の成功戦略: ${sharedStrategies.join(', ')}`);
    }

    return strengths;
  }

  /**
   * 補完性チェック
   */
  private isComplementary(strength: string, challenge: string): boolean {
    const complementaryPairs: Record<string, string[]> = {
      時間管理: ['計画性', '組織力', '時間感覚'],
      優先順位設定: ['判断力', '分析力', '決断力'],
      集中維持: ['集中力', '持続力', '忍耐力'],
      感情調整: ['冷静さ', '感情制御', 'マインドフルネス'],
    };

    return complementaryPairs[challenge]?.includes(strength) || false;
  }

  /**
   * 信頼度計算
   */
  private calculateConfidence(overallScore: number, individualScores: number[]): number {
    // スコアの分散が小さいほど信頼度が高い
    const mean = individualScores.reduce((sum, score) => sum + score, 0) / individualScores.length;
    const variance =
      individualScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      individualScores.length;
    const std = Math.sqrt(variance);

    // 標準偏差が小さく、全体スコアが高いほど信頼度が高い
    const varianceConfidence = Math.max(0, 100 - std);
    const scoreConfidence = overallScore;

    return Math.round((varianceConfidence + scoreConfidence) / 2);
  }

  /**
   * 推論テキスト生成
   */
  private generateReasoningText(
    overall: number,
    diagnostic: number,
    experience: number,
    communication: number
  ): string {
    const reasons: string[] = [];

    if (diagnostic > 80) {
      reasons.push('診断と特性が非常に類似している');
    } else if (diagnostic > 60) {
      reasons.push('診断に関連性がある');
    }

    if (experience > 80) {
      reasons.push('豊富な支援経験を持つ');
    } else if (experience > 60) {
      reasons.push('適切な支援経験がある');
    }

    if (communication > 80) {
      reasons.push('コミュニケーションスタイルが非常に適合');
    } else if (communication > 60) {
      reasons.push('コミュニケーションが取りやすい');
    }

    if (overall > 85) {
      return `非常に適合度の高いマッチです。${reasons.join('、')}ため、効果的なサポート関係が期待できます。`;
    } else if (overall > 70) {
      return `良好なマッチです。${reasons.join('、')}ため、有意義なサポートが可能です。`;
    } else if (overall > 60) {
      return `適度なマッチです。${reasons.join('、')}ため、工夫次第で良いサポート関係を築けます。`;
    } else {
      return `マッチ度は中程度です。相互理解に時間をかければ、良い関係を築ける可能性があります。`;
    }
  }

  /**
   * マッチング推奨の作成
   */
  private async createMatchRecommendation(
    request: MatchingRequest,
    bestMatch: MatchScore
  ): Promise<void> {
    const requesterCharacteristics = this.userCharacteristics.get(request.requesterId)!;
    const supporterCharacteristics = this.userCharacteristics.get(bestMatch.supporterId)!;

    const recommendation: MatchRecommendation = {
      matchId: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requesterId: request.requesterId,
      supporterId: bestMatch.supporterId,
      score: bestMatch,
      supportType: request.type,
      recommendedApproach: this.generateRecommendedApproach(
        request,
        requesterCharacteristics,
        supporterCharacteristics
      ),
      riskFactors: bestMatch.potentialChallenges,
      successPredictors: bestMatch.strengths,
      followUpSchedule: this.generateFollowUpSchedule(request.type),
      createdAt: new Date(),
    };

    this.matchRecommendations.set(recommendation.matchId, recommendation);

    this.emit('matchRecommendationCreated', {
      matchId: recommendation.matchId,
      requesterId: request.requesterId,
      supporterId: bestMatch.supporterId,
      score: bestMatch.overallScore,
    });
  }

  /**
   * 推奨アプローチ生成
   */
  private generateRecommendedApproach(
    request: MatchingRequest,
    requester: UserCharacteristics,
    supporter: UserCharacteristics
  ): MatchRecommendation['recommendedApproach'] {
    const sharedPreferences = requester.communication.preferences.filter((p) =>
      supporter.communication.preferences.includes(p)
    );

    const communicationMethod = sharedPreferences[0] || 'text';

    const approach = {
      initialContact: this.generateInitialContactGuidance(requester, supporter),
      communicationMethod: communicationMethod,
      sessionStructure: this.generateSessionStructure(request.type, requester, supporter),
      goals: this.generateGoals(request),
      timeline: this.generateTimeline(request.duration),
    };

    return approach;
  }

  /**
   * 初回コンタクトガイダンス生成
   */
  private generateInitialContactGuidance(
    requester: UserCharacteristics,
    supporter: UserCharacteristics
  ): string {
    let guidance = '相互紹介から始めて、';

    if (requester.communication.style === 'gentle' || supporter.communication.style === 'gentle') {
      guidance += 'ゆっくりと信頼関係を築いていきましょう。';
    } else if (requester.communication.style === 'direct') {
      guidance += '率直で明確なコミュニケーションを心がけましょう。';
    } else {
      guidance += '相手のペースに合わせて進めていきましょう。';
    }

    return guidance;
  }

  /**
   * セッション構造生成
   */
  private generateSessionStructure(
    type: string,
    requester: UserCharacteristics,
    supporter: UserCharacteristics
  ): string {
    switch (type) {
      case 'mentoring':
        return '構造化されたセッションで目標設定と進捗確認を定期的に行う';
      case 'peer_support':
        return '自由な対話を中心とし、必要に応じてリソース共有を行う';
      case 'crisis_support':
        return '即座の安全確保と感情的支援に焦点を当てる';
      case 'skill_sharing':
        return '具体的なスキル習得に向けた実践的なセッション';
      default:
        return '柔軟なアプローチで相手のニーズに合わせて調整';
    }
  }

  /**
   * 目標生成
   */
  private generateGoals(request: MatchingRequest): string[] {
    const goals: string[] = [];

    request.supportAreas.forEach((area) => {
      switch (area) {
        case '時間管理':
          goals.push('効果的な時間管理スキルの習得');
          break;
        case 'ストレス管理':
          goals.push('ストレス対処法の開発');
          break;
        case '社会スキル':
          goals.push('社会的相互作用の改善');
          break;
        default:
          goals.push(`${area}の改善`);
      }
    });

    if (goals.length === 0) {
      goals.push('全般的なサポートと成長');
    }

    return goals;
  }

  /**
   * タイムライン生成
   */
  private generateTimeline(duration: string): string {
    switch (duration) {
      case 'one_time':
        return '1回のセッションで完了';
      case 'short_term':
        return '2-4週間の短期間サポート';
      case 'long_term':
        return '3-6ヶ月の継続的サポート';
      case 'ongoing':
        return '必要に応じて継続的な関係維持';
      default:
        return '柔軟な期間設定';
    }
  }

  /**
   * フォローアップスケジュール生成
   */
  private generateFollowUpSchedule(type: string): string[] {
    switch (type) {
      case 'crisis_support':
        return ['24時間後', '3日後', '1週間後', '2週間後'];
      case 'mentoring':
        return ['1週間後', '2週間後', '1ヶ月後', '3ヶ月後'];
      case 'peer_support':
        return ['1週間後', '1ヶ月後', '3ヶ月後'];
      default:
        return ['1週間後', '1ヶ月後'];
    }
  }

  /**
   * マッチングキューの処理
   */
  private async processMatchingQueue(): Promise<void> {
    const pendingRequests = Array.from(this.matchingRequests.values()).filter(
      (request) => request.expiresAt > new Date() && !this.matchRecommendations.has(request.id)
    );

    for (const request of pendingRequests) {
      await this.processMatchingRequest(request.id);
    }
  }

  /**
   * マッチングアルゴリズムの更新
   */
  private async updateMatchingAlgorithm(): Promise<void> {
    // マッチング成功率に基づいて重みを調整
    const successfulMatches = Array.from(this.matchingHistory.values())
      .flat()
      .filter((match) => match.success === true);

    if (successfulMatches.length > 10) {
      // 成功事例から学習してアルゴリズムを改善
      console.log('📊 マッチングアルゴリズムを更新中...');
      this.emit('algorithmUpdated', {
        totalMatches: successfulMatches.length,
        successRate: this.calculateSuccessRate(),
      });
    }
  }

  /**
   * 成功率計算
   */
  private calculateSuccessRate(): number {
    const allMatches = Array.from(this.matchingHistory.values()).flat();
    if (allMatches.length === 0) return 0;

    const successfulMatches = allMatches.filter((match) => match.success === true);
    return Math.round((successfulMatches.length / allMatches.length) * 100);
  }

  /**
   * 過去のマッチ取得
   */
  private getPreviousMatches(userId: string): string[] {
    const history = this.matchingHistory.get(userId) || [];
    return history.map((match) => match.partnerId);
  }

  /**
   * リクエスト調整提案
   */
  private async suggestRequestAdjustments(requestId: string): Promise<void> {
    const request = this.matchingRequests.get(requestId);
    if (!request) return;

    const suggestions: string[] = [];

    // 要求が厳しすぎる場合の調整提案
    if (request.preferredCharacteristics.diagnostics?.length === 1) {
      suggestions.push('診断要件を拡大してみてください');
    }

    if (request.preferredCharacteristics.experienceLevel === 'experienced') {
      suggestions.push('経験レベル要件を緩和してみてください');
    }

    this.emit('matchingAdjustmentSuggested', {
      requestId,
      suggestions,
    });
  }

  // Public API Methods

  /**
   * ユーザー特性の登録・更新
   */
  public async updateUserCharacteristics(characteristics: UserCharacteristics): Promise<void> {
    this.userCharacteristics.set(characteristics.userId, characteristics);
    this.emit('characteristicsUpdated', { userId: characteristics.userId });
  }

  /**
   * マッチング推奨の取得
   */
  public getMatchRecommendations(userId: string): MatchRecommendation[] {
    return Array.from(this.matchRecommendations.values()).filter(
      (rec) => rec.requesterId === userId || rec.supporterId === userId
    );
  }

  /**
   * マッチング統計の取得
   */
  public getMatchingStatistics(): any {
    const totalRequests = this.matchingRequests.size;
    const totalRecommendations = this.matchRecommendations.size;
    const successRate = this.calculateSuccessRate();

    return {
      totalRequests,
      totalRecommendations,
      successRate,
      averageMatchScore: this.calculateAverageMatchScore(),
      activeMatches: this.getActiveMatchesCount(),
      pendingRequests: this.getPendingRequestsCount(),
    };
  }

  /**
   * 平均マッチスコア計算
   */
  private calculateAverageMatchScore(): number {
    const recommendations = Array.from(this.matchRecommendations.values());
    if (recommendations.length === 0) return 0;

    const totalScore = recommendations.reduce((sum, rec) => sum + rec.score.overallScore, 0);
    return Math.round(totalScore / recommendations.length);
  }

  /**
   * アクティブマッチ数取得
   */
  private getActiveMatchesCount(): number {
    return Array.from(this.matchingHistory.values())
      .flat()
      .filter((match) => match.status === 'active').length;
  }

  /**
   * 保留中リクエスト数取得
   */
  private getPendingRequestsCount(): number {
    return Array.from(this.matchingRequests.values()).filter((req) => req.expiresAt > new Date())
      .length;
  }

  /**
   * サービス停止
   */
  public stop(): void {
    console.log('🎯 サポートマッチングサービスを停止しました');
  }
}

export default SupportMatchingService;
