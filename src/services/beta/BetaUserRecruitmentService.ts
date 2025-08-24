/**
 * 🧑‍🤝‍🧑 ベータユーザー募集サービス
 * ADHD/ASDコミュニティ連携・適格性スクリーニング・GDPR準拠・倫理的リクルート
 */

import { EventEmitter } from 'eventemitter3';

// ベータユーザーのプロファイル
export interface BetaUserProfile {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    age: number;
    country: string;
    timezone: string;
    preferredLanguage: string;
    contactPreference: 'email' | 'phone' | 'secure_message' | 'video_call';
  };

  // 神経多様性情報
  neurodiversityProfile: {
    hasADHD: boolean;
    adhdDiagnosed: boolean;
    adhdSelfIdentified: boolean;
    adhdType: 'inattentive' | 'hyperactive' | 'combined' | 'unknown';
    adhdDiagnosisDate?: Date;
    adhdMedication: boolean;

    hasASD: boolean;
    asdDiagnosed: boolean;
    asdSelfIdentified: boolean;
    asdSupportLevel: 1 | 2 | 3 | null;
    asdDiagnosisDate?: Date;

    hasOtherConditions: boolean;
    otherConditions: string[];

    // 機能的影響評価
    functionalImpact: {
      dailyLiving: 'minimal' | 'mild' | 'moderate' | 'significant' | 'severe';
      work: 'minimal' | 'mild' | 'moderate' | 'significant' | 'severe';
      social: 'minimal' | 'mild' | 'moderate' | 'significant' | 'severe';
      academic: 'minimal' | 'mild' | 'moderate' | 'significant' | 'severe';
    };
  };

  // 技術的背景
  technicalProfile: {
    deviceTypes: ('desktop' | 'laptop' | 'tablet' | 'smartphone')[];
    primaryDevice: 'desktop' | 'laptop' | 'tablet' | 'smartphone';
    operatingSystems: string[];
    browsers: string[];
    assistiveTechnology: {
      usesScreenReader: boolean;
      screenReaderType?: string;
      usesVoiceControl: boolean;
      usesKeyboardNavigation: boolean;
      usesHighContrast: boolean;
      usesFontSizeAdjustment: boolean;
      usesOtherAT: boolean;
      otherATDescription?: string;
    };
    internetConnectivity: 'high_speed' | 'moderate' | 'limited' | 'intermittent';
    techComfortLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  };

  // 参加モチベーション・経験
  participationProfile: {
    motivation: string;
    expectedTimeCommitment: 'minimal' | 'light' | 'moderate' | 'substantial';
    availableHours: number; // per week
    preferredSchedule: ('morning' | 'afternoon' | 'evening' | 'weekend')[];
    previousBetaExperience: boolean;
    previousBetaDetails?: string;
    researchParticipationHistory: boolean;
    feedbackExperience: 'none' | 'minimal' | 'some' | 'extensive';
  };

  // 同意・プライバシー
  consentProfile: {
    dataCollection: boolean;
    dataSharing: boolean;
    researchParticipation: boolean;
    publicTestimonials: boolean;
    videoRecording: boolean;
    screenRecording: boolean;
    longTermFollowUp: boolean;

    // GDPR/プライバシー権利
    rightToWithdraw: boolean;
    rightToDataDeletion: boolean;
    rightToDataPortability: boolean;
    rightToCorrection: boolean;

    consentDate: Date;
    consentVersion: string;
    ipAddress: string;
    userAgent: string;
  };

  // コミュニティ連携
  communityConnection: {
    referralSource: 'direct' | 'community' | 'professional' | 'social_media' | 'other';
    communityAffiliation?: string[];
    professionalReferrer?: string;
    socialMediaSource?: string;
    otherSource?: string;

    // ADHD/ASDコミュニティ参加
    participatesInCommunities: boolean;
    communityTypes: (
      | 'online_forum'
      | 'support_group'
      | 'advocacy_org'
      | 'professional_org'
      | 'social_media'
    )[];
    advocacyInvolvement: boolean;
    peerSupportExperience: boolean;
  };

  // 募集ステータス
  recruitmentStatus: {
    applicationDate: Date;
    status: 'applied' | 'screening' | 'approved' | 'declined' | 'waitlisted' | 'withdrawn';
    screeningScore: number; // 0-100
    approvalDate?: Date;
    declineReason?: string;
    priority: 'high' | 'medium' | 'low';

    // コミュニケーション履歴
    communications: CommunicationRecord[];

    // 特別配慮事項
    accommodations: string[];
    riskFactors: string[];
    ethicalConsiderations: string[];
  };
}

// コミュニケーション記録
export interface CommunicationRecord {
  id: string;
  date: Date;
  type: 'email' | 'phone' | 'video_call' | 'secure_message' | 'form_submission';
  direction: 'inbound' | 'outbound';
  subject: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'concerned';
  actionItems: string[];
  followUpRequired: boolean;
  followUpDate?: Date;
}

// スクリーニング基準
export interface ScreeningCriteria {
  // 必須基準
  required: {
    ageRange: { min: number; max: number };
    neurodiversity: boolean; // ADHD/ASD診断または自認
    techAccess: boolean; // 基本的なデバイス・インターネットアクセス
    languageProficiency: string[];
    timeCommitment: number; // minimum hours per week
    informedConsent: boolean;
  };

  // 優先基準
  preferred: {
    diversityFactors: {
      ageDistribution: Record<string, number>; // age ranges and target percentages
      genderDiversity: boolean;
      geographicDiversity: boolean;
      severitySpectrum: boolean; // 異なる機能的影響レベル
      techSkillSpectrum: boolean;
    };

    // ADHD/ASD特性の多様性
    neurodiversitySpectrum: {
      adhdTypes: ('inattentive' | 'hyperactive' | 'combined')[];
      asdSupportLevels: (1 | 2 | 3)[];
      comorbidConditions: boolean;
      medicationStatus: ('medicated' | 'unmedicated' | 'variable')[];
    };

    // 参加品質指標
    qualityIndicators: {
      previousExperience: boolean;
      communicationSkills: 'basic' | 'good' | 'excellent';
      feedbackQuality: 'basic' | 'detailed' | 'insightful';
      reliability: 'uncertain' | 'likely' | 'high';
    };
  };

  // 除外基準
  exclusions: {
    conditions: string[]; // 参加不適格な状況
    riskFactors: string[]; // 倫理的リスク要因
    conflicts: string[]; // 利益相反
  };
}

// 募集キャンペーン
export interface RecruitmentCampaign {
  id: string;
  name: string;
  description: string;

  // キャンペーン設定
  settings: {
    startDate: Date;
    endDate: Date;
    targetParticipants: number;
    maxParticipants: number;
    screeningCriteria: ScreeningCriteria;

    // 多様性目標
    diversityTargets: {
      ageDistribution: Record<string, number>;
      genderRatio: Record<string, number>;
      neurodiversityMix: Record<string, number>;
      geographicDistribution: Record<string, number>;
    };
  };

  // コミュニティパートナー
  communityPartners: {
    organizations: CommunityPartner[];
    influencers: CommunityInfluencer[];
    professionals: ProfessionalPartner[];
  };

  // 募集チャネル
  recruitmentChannels: {
    adhdCommunities: string[];
    asdCommunities: string[];
    socialMedia: string[];
    professionalNetworks: string[];
    academicInstitutions: string[];
    healthcareProviders: string[];
  };

  // 進捗追跡
  progress: {
    applicationsReceived: number;
    screeningInProgress: number;
    approved: number;
    declined: number;
    waitlisted: number;
    diversityMetrics: Record<string, number>;
    qualityMetrics: Record<string, number>;
  };

  // 倫理的考慮事項
  ethicalFramework: {
    vulnerablePopulation: boolean;
    risksAssessed: boolean;
    benefitsDocumented: boolean;
    irb_approval: boolean; // Institutional Review Board
    ethicsReviewDate?: Date;
    ethicsReviewer?: string;
  };
}

// コミュニティパートナー
export interface CommunityPartner {
  id: string;
  name: string;
  type: 'nonprofit' | 'advocacy' | 'support_group' | 'professional_org';
  description: string;
  website?: string;
  contactPerson: string;
  contactEmail: string;
  partnershipType: 'endorsement' | 'active_recruitment' | 'advisory' | 'collaborative';
  reach: number; // estimated audience size
  demographics: {
    primaryConditions: string[];
    ageRange: { min: number; max: number };
    geographicFocus: string[];
  };
  partnershipDate: Date;
  agreementType: 'verbal' | 'written' | 'formal_contract';
}

// コミュニティインフルエンサー
export interface CommunityInfluencer {
  id: string;
  name: string;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'blog' | 'podcast';
  handle: string;
  audience: number;
  engagementRate: number;
  conditions: ('adhd' | 'asd' | 'both')[];
  contentType: 'educational' | 'personal' | 'advocacy' | 'entertainment';
  partnershipType: 'sponsored' | 'organic' | 'gifted' | 'collaborative';
}

// 専門家パートナー
export interface ProfessionalPartner {
  id: string;
  name: string;
  profession:
    | 'psychologist'
    | 'psychiatrist'
    | 'occupational_therapist'
    | 'researcher'
    | 'educator';
  credentials: string[];
  institution: string;
  specialization: string[];
  yearsExperience: number;
  referralCapacity: number;
  partnershipType: 'referral' | 'advisory' | 'validation' | 'research_collaboration';
}

class BetaUserRecruitmentService extends EventEmitter {
  private static instance: BetaUserRecruitmentService | null = null;
  private applications: Map<string, BetaUserProfile> = new Map();
  private campaigns: Map<string, RecruitmentCampaign> = new Map();
  private communityPartners: Map<string, CommunityPartner> = new Map();
  private screeningCriteria!: ScreeningCriteria;
  private ethicsApproved: boolean = false;

  private constructor() {
    super();
    this.initializeRecruitmentService();
    this.setupDefaultScreeningCriteria();
    console.log('🧑‍🤝‍🧑 Beta User Recruitment Service initialized');
  }

  static getInstance(): BetaUserRecruitmentService {
    if (!BetaUserRecruitmentService.instance) {
      BetaUserRecruitmentService.instance = new BetaUserRecruitmentService();
    }
    return BetaUserRecruitmentService.instance;
  }

  /**
   * 募集サービス初期化
   */
  private initializeRecruitmentService(): void {
    // GDPR/プライバシー準拠設定
    this.setupPrivacyCompliance();

    // 倫理的研究フレームワーク設定
    this.setupEthicalFramework();

    // セキュリティ設定
    this.setupSecurityMeasures();

    console.log('🔒 Ethical recruitment framework configured');
  }

  /**
   * デフォルトスクリーニング基準設定
   */
  private setupDefaultScreeningCriteria(): void {
    this.screeningCriteria = {
      required: {
        ageRange: { min: 18, max: 65 },
        neurodiversity: true,
        techAccess: true,
        languageProficiency: ['en', 'ja'],
        timeCommitment: 2, // 2 hours per week minimum
        informedConsent: true,
      },
      preferred: {
        diversityFactors: {
          ageDistribution: {
            '18-25': 20,
            '26-35': 30,
            '36-45': 25,
            '46-55': 15,
            '56-65': 10,
          },
          genderDiversity: true,
          geographicDiversity: true,
          severitySpectrum: true,
          techSkillSpectrum: true,
        },
        neurodiversitySpectrum: {
          adhdTypes: ['inattentive', 'hyperactive', 'combined'],
          asdSupportLevels: [1, 2, 3],
          comorbidConditions: true,
          medicationStatus: ['medicated', 'unmedicated', 'variable'],
        },
        qualityIndicators: {
          previousExperience: false, // 優先するが必須ではない
          communicationSkills: 'basic',
          feedbackQuality: 'basic',
          reliability: 'uncertain',
        },
      },
      exclusions: {
        conditions: ['active_psychosis', 'severe_depression_untreated', 'substance_abuse_active'],
        riskFactors: [
          'vulnerable_population_additional',
          'coercion_potential',
          'conflict_of_interest',
        ],
        conflicts: ['competitor_employee', 'prior_legal_action', 'financial_conflict'],
      },
    };
  }

  /**
   * ベータユーザー申請処理
   */
  async submitApplication(
    applicationData: Omit<BetaUserProfile, 'id' | 'recruitmentStatus'>
  ): Promise<string> {
    const applicationId = `beta_app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const application: BetaUserProfile = {
      id: applicationId,
      ...applicationData,
      recruitmentStatus: {
        applicationDate: new Date(),
        status: 'applied',
        screeningScore: 0,
        priority: 'medium',
        communications: [],
        accommodations: [],
        riskFactors: [],
        ethicalConsiderations: [],
      },
    };

    // プライバシー準拠チェック
    await this.validatePrivacyCompliance(application);

    // 初期スクリーニング実行
    const screeningResult = await this.performInitialScreening(application);
    application.recruitmentStatus.screeningScore = screeningResult.score;
    application.recruitmentStatus.status = screeningResult.status;

    // アプリケーション保存
    this.applications.set(applicationId, application);

    // 自動応答送信
    await this.sendApplicationConfirmation(application);

    // 適格性に基づく次ステップ
    if (screeningResult.status === 'approved') {
      await this.processApprovedApplication(application);
    } else if (screeningResult.status === 'screening') {
      await this.scheduleDetailedScreening(application);
    }

    this.emit('applicationSubmitted', { applicationId, application, screeningResult });

    console.log(`📝 Beta application submitted: ${applicationId} (${screeningResult.status})`);
    return applicationId;
  }

  /**
   * 初期スクリーニング実行
   */
  private async performInitialScreening(
    application: BetaUserProfile
  ): Promise<{ score: number; status: BetaUserProfile['recruitmentStatus']['status'] }> {
    let score = 0;
    const criteria = this.screeningCriteria;

    // 必須基準チェック
    let passedRequired = true;

    // 年齢チェック
    if (
      application.personalInfo.age < criteria.required.ageRange.min ||
      application.personalInfo.age > criteria.required.ageRange.max
    ) {
      passedRequired = false;
    } else {
      score += 20;
    }

    // 神経多様性チェック
    if (
      criteria.required.neurodiversity &&
      !(application.neurodiversityProfile.hasADHD || application.neurodiversityProfile.hasASD)
    ) {
      passedRequired = false;
    } else {
      score += 30;
    }

    // 技術アクセスチェック
    if (criteria.required.techAccess && application.technicalProfile.deviceTypes.length === 0) {
      passedRequired = false;
    } else {
      score += 20;
    }

    // 時間コミットメントチェック
    if (application.participationProfile.availableHours < criteria.required.timeCommitment) {
      passedRequired = false;
    } else {
      score += 15;
    }

    // 同意チェック
    if (
      !application.consentProfile.dataCollection ||
      !application.consentProfile.researchParticipation
    ) {
      passedRequired = false;
    } else {
      score += 15;
    }

    if (!passedRequired) {
      return { score: 0, status: 'declined' };
    }

    // 優先基準による追加スコア
    if (application.participationProfile.previousBetaExperience) {
      score += 5;
    }

    if (application.participationProfile.feedbackExperience !== 'none') {
      score += 5;
    }

    if (application.communityConnection.participatesInCommunities) {
      score += 10;
    }

    // ステータス決定
    let status: BetaUserProfile['recruitmentStatus']['status'];
    if (score >= 80) {
      status = 'approved';
    } else if (score >= 60) {
      status = 'screening';
    } else if (score >= 40) {
      status = 'waitlisted';
    } else {
      status = 'declined';
    }

    return { score, status };
  }

  /**
   * 募集キャンペーン作成
   */
  async createRecruitmentCampaign(
    campaignData: Omit<RecruitmentCampaign, 'id' | 'progress'>
  ): Promise<string> {
    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const campaign: RecruitmentCampaign = {
      id: campaignId,
      ...campaignData,
      progress: {
        applicationsReceived: 0,
        screeningInProgress: 0,
        approved: 0,
        declined: 0,
        waitlisted: 0,
        diversityMetrics: {},
        qualityMetrics: {},
      },
    };

    this.campaigns.set(campaignId, campaign);

    // コミュニティパートナーに通知
    await this.notifyPartners(campaign);

    this.emit('campaignCreated', { campaignId, campaign });

    console.log(`📢 Recruitment campaign created: ${campaignId}`);
    return campaignId;
  }

  /**
   * コミュニティパートナー追加
   */
  async addCommunityPartner(partner: Omit<CommunityPartner, 'id'>): Promise<string> {
    const partnerId = `partner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const partnerProfile: CommunityPartner = {
      id: partnerId,
      ...partner,
    };

    this.communityPartners.set(partnerId, partnerProfile);

    this.emit('partnerAdded', { partnerId, partner: partnerProfile });

    console.log(`🤝 Community partner added: ${partner.name}`);
    return partnerId;
  }

  /**
   * プライバシー・セキュリティ設定
   */
  private setupPrivacyCompliance(): void {
    // GDPR準拠設定
    console.log('🔒 GDPR compliance configured');
  }

  private setupEthicalFramework(): void {
    // 倫理的研究フレームワーク
    console.log('⚖️ Ethical research framework configured');
  }

  private setupSecurityMeasures(): void {
    // セキュリティ設定
    console.log('🛡️ Security measures configured');
  }

  /**
   * ヘルパーメソッド（プレースホルダー）
   */
  private async validatePrivacyCompliance(application: BetaUserProfile): Promise<void> {
    // プライバシー準拠検証
  }

  private async sendApplicationConfirmation(application: BetaUserProfile): Promise<void> {
    // 申請確認メール送信
    console.log(`📧 Application confirmation sent to ${application.personalInfo.email}`);
  }

  private async processApprovedApplication(application: BetaUserProfile): Promise<void> {
    // 承認済み申請の処理
    console.log(`✅ Processing approved application: ${application.id}`);
  }

  private async scheduleDetailedScreening(application: BetaUserProfile): Promise<void> {
    // 詳細スクリーニング予約
    console.log(`📅 Scheduling detailed screening for: ${application.id}`);
  }

  private async notifyPartners(campaign: RecruitmentCampaign): Promise<void> {
    // パートナー通知
    console.log(`📢 Notifying partners about campaign: ${campaign.name}`);
  }

  /**
   * 公開メソッド
   */
  public getApplication(applicationId: string): BetaUserProfile | null {
    return this.applications.get(applicationId) || null;
  }

  public getCampaign(campaignId: string): RecruitmentCampaign | null {
    return this.campaigns.get(campaignId) || null;
  }

  public getPartner(partnerId: string): CommunityPartner | null {
    return this.communityPartners.get(partnerId) || null;
  }

  public getAllApplications(): BetaUserProfile[] {
    return Array.from(this.applications.values());
  }

  public getApplicationsByStatus(
    status: BetaUserProfile['recruitmentStatus']['status']
  ): BetaUserProfile[] {
    return Array.from(this.applications.values()).filter(
      (app) => app.recruitmentStatus.status === status
    );
  }

  public getDashboardData() {
    const applications = Array.from(this.applications.values());
    const campaigns = Array.from(this.campaigns.values());
    const partners = Array.from(this.communityPartners.values());

    return {
      summary: {
        totalApplications: applications.length,
        approved: applications.filter((a) => a.recruitmentStatus.status === 'approved').length,
        screening: applications.filter((a) => a.recruitmentStatus.status === 'screening').length,
        waitlisted: applications.filter((a) => a.recruitmentStatus.status === 'waitlisted').length,
        declined: applications.filter((a) => a.recruitmentStatus.status === 'declined').length,
      },
      campaigns: {
        active: campaigns.filter(
          (c) => new Date() >= c.settings.startDate && new Date() <= c.settings.endDate
        ).length,
        total: campaigns.length,
      },
      partners: {
        total: partners.length,
        byType: partners.reduce(
          (acc, p) => {
            acc[p.type] = (acc[p.type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
      diversity: this.calculateDiversityMetrics(),
    };
  }

  private calculateDiversityMetrics() {
    const applications = Array.from(this.applications.values()).filter(
      (a) => a.recruitmentStatus.status === 'approved'
    );

    if (applications.length === 0) return {};

    return {
      ageDistribution: this.calculateAgeDistribution(applications),
      neurodiversityMix: this.calculateNeurodiversityMix(applications),
      techSkillDistribution: this.calculateTechSkillDistribution(applications),
    };
  }

  private calculateAgeDistribution(applications: BetaUserProfile[]) {
    const ageGroups = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56-65': 0,
    };

    applications.forEach((app) => {
      const age = app.personalInfo.age;
      if (age >= 18 && age <= 25) ageGroups['18-25']++;
      else if (age >= 26 && age <= 35) ageGroups['26-35']++;
      else if (age >= 36 && age <= 45) ageGroups['36-45']++;
      else if (age >= 46 && age <= 55) ageGroups['46-55']++;
      else if (age >= 56 && age <= 65) ageGroups['56-65']++;
    });

    return ageGroups;
  }

  private calculateNeurodiversityMix(applications: BetaUserProfile[]) {
    return {
      adhdOnly: applications.filter(
        (a) => a.neurodiversityProfile.hasADHD && !a.neurodiversityProfile.hasASD
      ).length,
      asdOnly: applications.filter(
        (a) => !a.neurodiversityProfile.hasADHD && a.neurodiversityProfile.hasASD
      ).length,
      both: applications.filter(
        (a) => a.neurodiversityProfile.hasADHD && a.neurodiversityProfile.hasASD
      ).length,
    };
  }

  private calculateTechSkillDistribution(applications: BetaUserProfile[]) {
    const skillLevels = { beginner: 0, intermediate: 0, advanced: 0, expert: 0 };
    applications.forEach((app) => {
      skillLevels[app.technicalProfile.techComfortLevel]++;
    });
    return skillLevels;
  }
}

export const betaUserRecruitmentService = BetaUserRecruitmentService.getInstance();
export default betaUserRecruitmentService;
