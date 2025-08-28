/**
 * 🌱 認知成長支援サービス
 * ADHD/ASD特性に基づく長期的な認知成長と発達支援
 */

import { BrowserEventEmitter as EventEmitter } from '@/lib/BrowserEventEmitter';

// 成長データ型定義
interface CognitiveSkill {
  id: string;
  name: string;
  category:
    | 'attention'
    | 'executive_function'
    | 'working_memory'
    | 'processing_speed'
    | 'social_cognition'
    | 'emotional_regulation';
  description: string;
  currentLevel: number; // 0-100
  targetLevel: number; // 0-100
  developmentStage: 'beginner' | 'developing' | 'proficient' | 'advanced' | 'expert';
  adhdRelevance: number; // 0-1
  asdRelevance: number; // 0-1
  lastAssessed: Date;
  improvementRate: number; // per week
  exercises: SkillExercise[];
  milestones: Milestone[];
}

interface SkillExercise {
  id: string;
  title: string;
  description: string;
  type:
    | 'cognitive_training'
    | 'behavioral_practice'
    | 'mindfulness'
    | 'social_skill'
    | 'executive_function';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // minutes
  frequency: 'daily' | 'weekly' | 'biweekly';
  cognitiveLoad: number; // 1-10
  adaptiveVariations: AdaptiveVariation[];
  prerequisites: string[];
  learningObjectives: string[];
  measurableOutcomes: string[];
}

interface AdaptiveVariation {
  condition: string; // 適用条件
  modification: string; // 修正内容
  reason: string; // 理由
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  criteria: string[];
  isAchieved: boolean;
  achievedDate?: Date;
  reward: string;
  significance: 'minor' | 'major' | 'breakthrough';
}

interface GrowthPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  startDate: Date;
  estimatedDuration: number; // weeks
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetSkills: string[]; // skill IDs
  weeklyGoals: WeeklyGoal[];
  progressTracking: ProgressMetric[];
  adaptationHistory: PlanAdaptation[];
  isActive: boolean;
}

interface WeeklyGoal {
  week: number;
  objectives: string[];
  exercises: string[]; // exercise IDs
  expectedProgress: number; // 0-100
  actualProgress?: number; // 0-100
  challenges?: string[];
  successes?: string[];
  adaptations?: string[];
}

interface ProgressMetric {
  date: Date;
  skillId: string;
  measurement: number; // 0-100
  assessmentMethod:
    | 'self_report'
    | 'behavioral_observation'
    | 'cognitive_test'
    | 'performance_data';
  context: string;
  notes?: string;
}

interface PlanAdaptation {
  date: Date;
  reason: string;
  changes: string[];
  expectedImpact: string;
  success?: boolean;
}

interface GrowthInsight {
  id: string;
  type:
    | 'strength_discovery'
    | 'progress_acceleration'
    | 'obstacle_identification'
    | 'strategy_optimization';
  title: string;
  description: string;
  evidence: ProgressMetric[];
  recommendedActions: string[];
  confidence: number; // 0-1
  priority: number; // 1-10
  generatedAt: Date;
  skillsImpacted: string[];
}

interface PersonalizedStrategy {
  id: string;
  name: string;
  description: string;
  targetSkills: string[];
  techniques: string[];
  timeframe: number; // weeks
  successRate: number; // 0-1
  adaptationLevel: 'none' | 'minimal' | 'moderate' | 'extensive';
  cognitiveProfile: string[];
  contraindications: string[];
}

export class CognitiveGrowthSupportService extends EventEmitter {
  private cognitiveSkills: Map<string, CognitiveSkill[]> = new Map();
  private growthPlans: Map<string, GrowthPlan[]> = new Map();
  private progressData: Map<string, ProgressMetric[]> = new Map();
  private growthInsights: Map<string, GrowthInsight[]> = new Map();
  private personalizedStrategies: Map<string, PersonalizedStrategy[]> = new Map();
  private isAssessing: boolean = false;

  constructor() {
    super();
    this.initializeGrowthSystem();
  }

  /**
   * 成長支援システムの初期化
   */
  private async initializeGrowthSystem(): Promise<void> {
    console.log('🌱 認知成長支援システムを初期化中...');

    this.initializeDefaultSkills();
    this.initializeDefaultStrategies();
    this.startContinuousAssessment();

    console.log('✅ 認知成長支援システムが準備完了');
    this.emit('systemReady');
  }

  /**
   * デフォルトスキルの初期化
   */
  private initializeDefaultSkills(): void {
    const defaultSkills: CognitiveSkill[] = [
      {
        id: 'sustained_attention',
        name: '持続的注意力',
        category: 'attention',
        description: '一つのタスクに長時間集中し続ける能力',
        currentLevel: 45,
        targetLevel: 75,
        developmentStage: 'developing',
        adhdRelevance: 0.95,
        asdRelevance: 0.7,
        lastAssessed: new Date(),
        improvementRate: 3, // 週3%改善
        exercises: [
          {
            id: 'attention_ex1',
            title: 'フォーカス瞑想',
            description: '呼吸に意識を向けて注意力を鍛える',
            type: 'mindfulness',
            difficulty: 'easy',
            duration: 10,
            frequency: 'daily',
            cognitiveLoad: 3,
            adaptiveVariations: [
              {
                condition: 'stress_high',
                modification: '5分に短縮、ガイド音声付き',
                reason: 'ストレス時は短時間で集中しやすく',
              },
            ],
            prerequisites: [],
            learningObjectives: ['注意持続時間の延長', '雑念の管理'],
            measurableOutcomes: ['瞑想継続時間', '雑念回数'],
          },
        ],
        milestones: [
          {
            id: 'attention_m1',
            title: '20分連続集中',
            description: '一つのタスクに20分間中断なく集中する',
            targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            criteria: ['20分間のタスク継続', '中断回数2回以下'],
            isAchieved: false,
            reward: '集中力マスターバッジ',
            significance: 'major',
          },
        ],
      },
      {
        id: 'working_memory',
        name: 'ワーキングメモリ',
        category: 'working_memory',
        description: '情報を一時的に保持し操作する能力',
        currentLevel: 35,
        targetLevel: 65,
        developmentStage: 'beginner',
        adhdRelevance: 0.9,
        asdRelevance: 0.6,
        lastAssessed: new Date(),
        improvementRate: 2.5,
        exercises: [
          {
            id: 'wm_ex1',
            title: 'Nバック課題',
            description: '数字の系列を記憶して前のものと比較する',
            type: 'cognitive_training',
            difficulty: 'medium',
            duration: 15,
            frequency: 'daily',
            cognitiveLoad: 7,
            adaptiveVariations: [
              {
                condition: 'fatigue_high',
                modification: '1-backから開始、徐々に2-backへ',
                reason: '疲労時は認知負荷を軽減',
              },
            ],
            prerequisites: [],
            learningObjectives: ['記憶容量の拡張', '情報更新スキル'],
            measurableOutcomes: ['正答率', '反応時間'],
          },
        ],
        milestones: [
          {
            id: 'wm_m1',
            title: '3-backクリア',
            description: '3つ前の刺激を正確に記憶・比較できる',
            targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            criteria: ['80%以上の正答率', '平均反応時間1.5秒以下'],
            isAchieved: false,
            reward: 'メモリマスターバッジ',
            significance: 'major',
          },
        ],
      },
      {
        id: 'cognitive_flexibility',
        name: '認知的柔軟性',
        category: 'executive_function',
        description: '思考パターンを柔軟に切り替える能力',
        currentLevel: 40,
        targetLevel: 70,
        developmentStage: 'developing',
        adhdRelevance: 0.85,
        asdRelevance: 0.9,
        lastAssessed: new Date(),
        improvementRate: 2,
        exercises: [
          {
            id: 'cf_ex1',
            title: '視点転換練習',
            description: '同じ状況を異なる視点から考える',
            type: 'behavioral_practice',
            difficulty: 'medium',
            duration: 20,
            frequency: 'weekly',
            cognitiveLoad: 6,
            adaptiveVariations: [
              {
                condition: 'asd_high',
                modification: '具体例を多用、段階的導入',
                reason: 'ASD特性では具体性が重要',
              },
            ],
            prerequisites: [],
            learningObjectives: ['多角的思考', '固定観念の克服'],
            measurableOutcomes: ['提案解決策数', '創造性スコア'],
          },
        ],
        milestones: [
          {
            id: 'cf_m1',
            title: '柔軟な問題解決',
            description: '複数の解決策を素早く生成できる',
            targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            criteria: ['5つ以上の解決策生成', '実用性80%以上'],
            isAchieved: false,
            reward: '柔軟思考バッジ',
            significance: 'major',
          },
        ],
      },
      {
        id: 'emotional_regulation',
        name: '感情調整',
        category: 'emotional_regulation',
        description: '感情を適切に管理・調整する能力',
        currentLevel: 50,
        targetLevel: 80,
        developmentStage: 'developing',
        adhdRelevance: 0.8,
        asdRelevance: 0.85,
        lastAssessed: new Date(),
        improvementRate: 4,
        exercises: [
          {
            id: 'er_ex1',
            title: '感情認識練習',
            description: '自分の感情を正確に識別し名前を付ける',
            type: 'mindfulness',
            difficulty: 'easy',
            duration: 10,
            frequency: 'daily',
            cognitiveLoad: 4,
            adaptiveVariations: [
              {
                condition: 'emotional_volatility_high',
                modification: '感情強度スケール使用、記録重視',
                reason: '感情変動が激しい時は客観化が重要',
              },
            ],
            prerequisites: [],
            learningObjectives: ['感情の自己認識', '感情語彙の拡充'],
            measurableOutcomes: ['感情識別精度', '反応時間'],
          },
        ],
        milestones: [
          {
            id: 'er_m1',
            title: '感情コントロール',
            description: '強い感情を適切に調整できる',
            targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            criteria: ['ストレス反応時間短縮', '冷静な判断維持'],
            isAchieved: false,
            reward: '感情マスターバッジ',
            significance: 'breakthrough',
          },
        ],
      },
      {
        id: 'social_communication',
        name: '社会的コミュニケーション',
        category: 'social_cognition',
        description: '他者との効果的な相互作用能力',
        currentLevel: 30,
        targetLevel: 60,
        developmentStage: 'beginner',
        adhdRelevance: 0.6,
        asdRelevance: 0.95,
        lastAssessed: new Date(),
        improvementRate: 1.5,
        exercises: [
          {
            id: 'sc_ex1',
            title: '非言語コミュニケーション練習',
            description: '表情やジェスチャーの意味を理解する',
            type: 'social_skill',
            difficulty: 'medium',
            duration: 25,
            frequency: 'biweekly',
            cognitiveLoad: 5,
            adaptiveVariations: [
              {
                condition: 'social_anxiety_high',
                modification: 'オンライン練習から開始、段階的対面',
                reason: '社会不安軽減のため段階的露出',
              },
            ],
            prerequisites: [],
            learningObjectives: ['非言語手がかりの認識', '適切な反応選択'],
            measurableOutcomes: ['認識精度', '反応適切性'],
          },
        ],
        milestones: [
          {
            id: 'sc_m1',
            title: '円滑な会話',
            description: '初対面の人との10分間の会話をスムーズに行う',
            targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            criteria: ['会話継続10分', '相手の満足度80%以上'],
            isAchieved: false,
            reward: 'コミュニケーションバッジ',
            significance: 'breakthrough',
          },
        ],
      },
    ];

    // デフォルトのモックスキル投入を廃止（実データは外部から供給）
  }

  /**
   * デフォルト戦略の初期化
   */
  private initializeDefaultStrategies(): void {
    const defaultStrategies: PersonalizedStrategy[] = [
      {
        id: 'pomodoro_attention',
        name: 'ポモドーロ注意力向上',
        description: '25分集中＋5分休憩サイクルで持続的注意力を鍛える',
        targetSkills: ['sustained_attention'],
        techniques: ['時間分割', 'タイマー使用', '休憩の強制'],
        timeframe: 4,
        successRate: 0.8,
        adaptationLevel: 'moderate',
        cognitiveProfile: ['adhd_attention_deficit', 'time_blindness'],
        contraindications: ['severe_anxiety', 'time_pressure_sensitivity'],
      },
      {
        id: 'metacognitive_wm',
        name: 'メタ認知ワーキングメモリ訓練',
        description: '自分の記憶プロセスを意識しながらワーキングメモリを強化',
        targetSkills: ['working_memory'],
        techniques: ['記憶方略指導', 'セルフモニタリング', '段階的負荷増加'],
        timeframe: 8,
        successRate: 0.75,
        adaptationLevel: 'extensive',
        cognitiveProfile: ['adhd_working_memory_deficit', 'metacognitive_awareness'],
        contraindications: ['cognitive_overload_tendency'],
      },
      {
        id: 'cognitive_behavioral_flexibility',
        name: '認知行動柔軟性訓練',
        description: '認知行動療法的アプローチで思考の柔軟性を向上',
        targetSkills: ['cognitive_flexibility'],
        techniques: ['思考記録', '認知再構成', '行動実験'],
        timeframe: 12,
        successRate: 0.7,
        adaptationLevel: 'extensive',
        cognitiveProfile: ['asd_rigid_thinking', 'negative_thought_patterns'],
        contraindications: ['severe_depression', 'thought_disorder'],
      },
      {
        id: 'mindfulness_emotion',
        name: 'マインドフルネス感情調整',
        description: 'マインドフルネス技法による感情調整スキルの向上',
        targetSkills: ['emotional_regulation'],
        techniques: ['瞑想', '身体感覚への注意', '非判断的観察'],
        timeframe: 6,
        successRate: 0.85,
        adaptationLevel: 'minimal',
        cognitiveProfile: ['emotional_dysregulation', 'mindfulness_receptive'],
        contraindications: ['dissociation_tendency', 'severe_trauma'],
      },
      {
        id: 'social_skills_training',
        name: '構造化社会スキル訓練',
        description: '段階的・構造化されたアプローチで社会スキルを習得',
        targetSkills: ['social_communication'],
        techniques: ['ロールプレイ', 'ビデオモデリング', '段階的露出'],
        timeframe: 16,
        successRate: 0.65,
        adaptationLevel: 'extensive',
        cognitiveProfile: ['asd_social_communication_deficit', 'social_anxiety'],
        contraindications: ['severe_social_phobia', 'selective_mutism'],
      },
    ];

    // デフォルトのモック戦略投入を廃止（実データは外部から供給）
  }

  /**
   * 継続的評価の開始
   */
  private startContinuousAssessment(): void {
    // 日次評価: 毎日夜に実行
    setInterval(
      () => {
        this.runDailyAssessment();
      },
      24 * 60 * 60 * 1000
    );

    // 週次評価: 毎週日曜日に実行
    setInterval(
      () => {
        if (new Date().getDay() === 0) {
          // 日曜日
          this.runWeeklyAssessment();
        }
      },
      24 * 60 * 60 * 1000
    );

    // 月次評価: 毎月1日に実行
    setInterval(
      () => {
        if (new Date().getDate() === 1) {
          // 月初
          this.runMonthlyAssessment();
        }
      },
      24 * 60 * 60 * 1000
    );
  }

  /**
   * 日次評価の実行
   */
  private async runDailyAssessment(): Promise<void> {
    for (const [userId, skills] of this.cognitiveSkills) {
      await this.assessDailyProgress(userId, skills);
    }
  }

  /**
   * 日次進捗評価
   */
  private async assessDailyProgress(userId: string, skills: CognitiveSkill[]): Promise<void> {
    const progressData = this.progressData.get(userId) || [];

    for (const skill of skills) {
      // 簡略化された進捗計算（実際の実装では行動データから算出）
      const recentProgress = progressData
        .filter(
          (p) => p.skillId === skill.id && p.date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        )
        .sort((a, b) => b.date.getTime() - a.date.getTime());

      if (recentProgress.length > 0) {
        const avgProgress =
          recentProgress.reduce((sum, p) => sum + p.measurement, 0) / recentProgress.length;
        const trend =
          recentProgress.length > 1
            ? (recentProgress[0].measurement -
                recentProgress[recentProgress.length - 1].measurement) /
              recentProgress.length
            : 0;

        // スキルレベルの更新
        const improvementFactor = Math.max(0.5, Math.min(2.0, 1 + trend / 100));
        skill.currentLevel = Math.min(
          100,
          skill.currentLevel + (skill.improvementRate / 7) * improvementFactor
        );
        skill.lastAssessed = new Date();

        // マイルストーンチェック
        await this.checkMilestones(userId, skill);
      }
    }

    this.emit('dailyAssessmentComplete', { userId, skillsAssessed: skills.length });
  }

  /**
   * マイルストーンチェック
   */
  private async checkMilestones(userId: string, skill: CognitiveSkill): Promise<void> {
    for (const milestone of skill.milestones) {
      if (!milestone.isAchieved && skill.currentLevel >= 70) {
        // 簡略化された達成条件
        milestone.isAchieved = true;
        milestone.achievedDate = new Date();

        const insight: GrowthInsight = {
          id: `milestone_${milestone.id}_${Date.now()}`,
          type: 'progress_acceleration',
          title: `🎉 マイルストーン達成: ${milestone.title}`,
          description: `${skill.name}の重要なマイルストーンを達成しました！`,
          evidence: [],
          recommendedActions: [
            '成功体験を記録',
            '次のレベルの目標設定',
            '達成方法の他スキルへの応用',
          ],
          confidence: 1.0,
          priority: 9,
          generatedAt: new Date(),
          skillsImpacted: [skill.id],
        };

        const insights = this.growthInsights.get(userId) || [];
        insights.push(insight);
        this.growthInsights.set(userId, insights);

        this.emit('milestoneAchieved', {
          userId,
          skillId: skill.id,
          milestone,
          insight,
        });
      }
    }
  }

  /**
   * 週次評価の実行
   */
  private async runWeeklyAssessment(): Promise<void> {
    for (const [userId, skills] of this.cognitiveSkills) {
      await this.generateWeeklyInsights(userId, skills);
      await this.optimizeGrowthPlans(userId);
    }
  }

  /**
   * 週次インサイト生成
   */
  private async generateWeeklyInsights(userId: string, skills: CognitiveSkill[]): Promise<void> {
    const progressData = this.progressData.get(userId) || [];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentProgress = progressData.filter((p) => p.date >= weekAgo);

    if (recentProgress.length === 0) return;

    // 成長率分析
    const growthRates = skills.map((skill) => {
      const skillProgress = recentProgress.filter((p) => p.skillId === skill.id);
      if (skillProgress.length < 2) return { skillId: skill.id, rate: 0 };

      const sorted = skillProgress.sort((a, b) => a.date.getTime() - b.date.getTime());
      const rate = (sorted[sorted.length - 1].measurement - sorted[0].measurement) / 7; // 週間成長率
      return { skillId: skill.id, rate };
    });

    // 最も成長したスキル
    const topGrowthSkill = growthRates.reduce((max, current) =>
      current.rate > max.rate ? current : max
    );

    if (topGrowthSkill.rate > 2) {
      // 週2%以上の成長
      const skill = skills.find((s) => s.id === topGrowthSkill.skillId)!;
      const insight: GrowthInsight = {
        id: `growth_${topGrowthSkill.skillId}_${Date.now()}`,
        type: 'strength_discovery',
        title: `📈 顕著な成長: ${skill.name}`,
        description: `${skill.name}が週間で${topGrowthSkill.rate.toFixed(1)}%向上しました。この調子を維持しましょう！`,
        evidence: recentProgress.filter((p) => p.skillId === skill.id),
        recommendedActions: [
          '現在の練習方法を継続',
          'より高度なエクササイズに挑戦',
          '他のスキルに同じ方法を応用',
        ],
        confidence: 0.85,
        priority: 7,
        generatedAt: new Date(),
        skillsImpacted: [skill.id],
      };

      const insights = this.growthInsights.get(userId) || [];
      insights.push(insight);
      this.growthInsights.set(userId, insights);
    }

    // 停滞しているスキル
    const stagnantSkills = growthRates.filter((gr) => gr.rate < 0.5 && gr.rate >= 0);
    if (stagnantSkills.length > 0) {
      const skillNames = stagnantSkills
        .map((sg) => skills.find((s) => s.id === sg.skillId)?.name)
        .join(', ');

      const insight: GrowthInsight = {
        id: `stagnant_${Date.now()}`,
        type: 'obstacle_identification',
        title: `⚠️ 成長停滞の可能性: ${skillNames}`,
        description: `いくつかのスキルで成長が停滞している可能性があります。アプローチを見直しましょう。`,
        evidence: [],
        recommendedActions: [
          'エクササイズの変更',
          '難易度の調整',
          'モチベーション向上策の実施',
          '専門家との相談を検討',
        ],
        confidence: 0.7,
        priority: 6,
        generatedAt: new Date(),
        skillsImpacted: stagnantSkills.map((sg) => sg.skillId),
      };

      const insights = this.growthInsights.get(userId) || [];
      insights.push(insight);
      this.growthInsights.set(userId, insights);
    }
  }

  /**
   * 成長プランの最適化
   */
  private async optimizeGrowthPlans(userId: string): Promise<void> {
    const plans = this.growthPlans.get(userId) || [];
    const skills = this.cognitiveSkills.get(userId) || [];
    const progressData = this.progressData.get(userId) || [];

    for (const plan of plans.filter((p) => p.isActive)) {
      const currentWeek =
        Math.floor((Date.now() - plan.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

      if (currentWeek <= plan.weeklyGoals.length) {
        const currentGoal = plan.weeklyGoals[currentWeek - 1];

        // 実際の進捗を評価
        const actualProgress = this.calculateWeeklyProgress(
          plan.targetSkills,
          progressData,
          currentWeek
        );
        currentGoal.actualProgress = actualProgress;

        // 期待値との差を分析
        const progressGap = actualProgress - currentGoal.expectedProgress;

        if (progressGap < -20) {
          // 20%以上の遅れ
          // プラン適応の提案
          const adaptation: PlanAdaptation = {
            date: new Date(),
            reason: `進捗が期待値を下回る (${progressGap.toFixed(1)}%)`,
            changes: ['エクササイズの難易度を下げる', '頻度を調整する', '追加のサポートを提供'],
            expectedImpact: '次週の進捗改善',
          };

          plan.adaptationHistory.push(adaptation);
          this.emit('planAdaptationSuggested', { userId, planId: plan.id, adaptation });
        }
      }
    }
  }

  /**
   * 週間進捗の計算
   */
  private calculateWeeklyProgress(
    targetSkills: string[],
    progressData: ProgressMetric[],
    week: number
  ): number {
    const weekStart = new Date(Date.now() - (8 - week) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    const weeklyData = progressData.filter(
      (p) => targetSkills.includes(p.skillId) && p.date >= weekStart && p.date <= weekEnd
    );

    if (weeklyData.length === 0) return 0;

    return weeklyData.reduce((sum, d) => sum + d.measurement, 0) / weeklyData.length;
  }

  /**
   * 月次評価の実行
   */
  private async runMonthlyAssessment(): Promise<void> {
    for (const [userId, skills] of this.cognitiveSkills) {
      await this.generateMonthlyReport(userId, skills);
      await this.adjustLongTermGoals(userId, skills);
    }
  }

  /**
   * 月次レポート生成
   */
  private async generateMonthlyReport(userId: string, skills: CognitiveSkill[]): Promise<void> {
    const progressData = this.progressData.get(userId) || [];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const monthlyProgress = progressData.filter((p) => p.date >= monthAgo);

    if (monthlyProgress.length === 0) return;

    // 月間成長サマリー
    const monthlySummary = {
      totalProgress: monthlyProgress.length,
      averageImprovement:
        monthlyProgress.reduce((sum, p) => sum + p.measurement, 0) / monthlyProgress.length,
      skillsImproved: [...new Set(monthlyProgress.map((p) => p.skillId))],
      milestonesAchieved: skills.reduce(
        (count, skill) =>
          count +
          skill.milestones.filter(
            (m) => m.isAchieved && m.achievedDate && m.achievedDate >= monthAgo
          ).length,
        0
      ),
    };

    const insight: GrowthInsight = {
      id: `monthly_report_${Date.now()}`,
      type: 'progress_acceleration',
      title: '📊 月間成長レポート',
      description: `過去1ヶ月で${monthlySummary.skillsImproved.length}のスキルが向上し、${monthlySummary.milestonesAchieved}のマイルストーンを達成しました。`,
      evidence: monthlyProgress,
      recommendedActions: ['成功パターンの継続', '新しいチャレンジの設定', '長期目標の再評価'],
      confidence: 0.9,
      priority: 8,
      generatedAt: new Date(),
      skillsImpacted: monthlySummary.skillsImproved,
    };

    const insights = this.growthInsights.get(userId) || [];
    insights.push(insight);
    this.growthInsights.set(userId, insights);

    this.emit('monthlyReportGenerated', { userId, summary: monthlySummary, insight });
  }

  /**
   * 長期目標の調整
   */
  private async adjustLongTermGoals(userId: string, skills: CognitiveSkill[]): Promise<void> {
    for (const skill of skills) {
      const recentRate = skill.improvementRate;
      const weeksToTarget = (skill.targetLevel - skill.currentLevel) / recentRate;

      // 目標が近すぎる場合は上方修正
      if (weeksToTarget < 4) {
        skill.targetLevel = Math.min(100, skill.targetLevel + 15);

        // 新しいマイルストーン追加
        const newMilestone: Milestone = {
          id: `advanced_${skill.id}_${Date.now()}`,
          title: `${skill.name} 上級レベル達成`,
          description: `${skill.name}でより高いレベルに到達する`,
          targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          criteria: [`レベル${skill.targetLevel}到達`, '一貫した高パフォーマンス'],
          isAchieved: false,
          reward: '上級マスターバッジ',
          significance: 'breakthrough',
        };

        skill.milestones.push(newMilestone);
      }

      // 目標が遠すぎる場合は中間マイルストーン追加
      if (weeksToTarget > 20) {
        const intermediateTarget =
          skill.currentLevel + (skill.targetLevel - skill.currentLevel) / 2;

        const intermediateMilestone: Milestone = {
          id: `intermediate_${skill.id}_${Date.now()}`,
          title: `${skill.name} 中間目標達成`,
          description: `${skill.name}の中間レベルに到達する`,
          targetDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
          criteria: [`レベル${Math.round(intermediateTarget)}到達`],
          isAchieved: false,
          reward: '中級マスターバッジ',
          significance: 'major',
        };

        skill.milestones.push(intermediateMilestone);
      }
    }
  }

  // Public API methods

  /**
   * 進捗データの記録
   */
  public async recordProgress(
    userId: string,
    skillId: string,
    measurement: number,
    assessmentMethod:
      | 'self_report'
      | 'behavioral_observation'
      | 'cognitive_test'
      | 'performance_data',
    context: string,
    notes?: string
  ): Promise<void> {
    const progressMetric: ProgressMetric = {
      date: new Date(),
      skillId,
      measurement: Math.max(0, Math.min(100, measurement)),
      assessmentMethod,
      context,
      notes,
    };

    const progressData = this.progressData.get(userId) || [];
    progressData.push(progressMetric);

    // 最新1000件のみ保持
    if (progressData.length > 1000) {
      progressData.splice(0, progressData.length - 1000);
    }

    this.progressData.set(userId, progressData);

    // スキルレベルの即座更新
    const skills = this.cognitiveSkills.get(userId) || [];
    const skill = skills.find((s) => s.id === skillId);
    if (skill) {
      // 最新の測定値を重み付けして反映
      skill.currentLevel = skill.currentLevel * 0.8 + measurement * 0.2;
      skill.lastAssessed = new Date();

      await this.checkMilestones(userId, skill);
    }

    this.emit('progressRecorded', { userId, skillId, measurement, progressMetric });
  }

  /**
   * 個人成長プランの作成
   */
  public async createGrowthPlan(
    userId: string,
    name: string,
    description: string,
    targetSkills: string[],
    duration: number,
    priority: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<string> {
    const planId = `plan_${Date.now()}`;

    // 週次目標の自動生成
    const weeklyGoals: WeeklyGoal[] = [];
    for (let week = 1; week <= duration; week++) {
      const expectedProgress = Math.min(100, (week / duration) * 80); // 80%まで段階的向上

      weeklyGoals.push({
        week,
        objectives: [`Week ${week}: ${name}の進捗`],
        exercises: [], // 実際の実装ではスキルに基づいて選択
        expectedProgress,
      });
    }

    const growthPlan: GrowthPlan = {
      id: planId,
      userId,
      name,
      description,
      startDate: new Date(),
      estimatedDuration: duration,
      priority,
      targetSkills,
      weeklyGoals,
      progressTracking: [],
      adaptationHistory: [],
      isActive: true,
    };

    const plans = this.growthPlans.get(userId) || [];
    plans.push(growthPlan);
    this.growthPlans.set(userId, plans);

    this.emit('growthPlanCreated', { userId, planId, plan: growthPlan });
    return planId;
  }

  /**
   * 認知スキル取得
   */
  public getCognitiveSkills(userId: string): CognitiveSkill[] {
    return this.cognitiveSkills.get(userId) || [];
  }

  /**
   * 成長インサイト取得
   */
  public getGrowthInsights(userId: string): GrowthInsight[] {
    return this.growthInsights.get(userId) || [];
  }

  /**
   * 成長プラン取得
   */
  public getGrowthPlans(userId: string): GrowthPlan[] {
    return this.growthPlans.get(userId) || [];
  }

  /**
   * パーソナライズド戦略取得
   */
  public getPersonalizedStrategies(userId: string): PersonalizedStrategy[] {
    return this.personalizedStrategies.get(userId) || [];
  }

  /**
   * 進捗統計取得
   */
  public getProgressStatistics(userId: string): any {
    const skills = this.cognitiveSkills.get(userId) || [];
    const progressData = this.progressData.get(userId) || [];
    const plans = this.growthPlans.get(userId) || [];
    const insights = this.growthInsights.get(userId) || [];

    const achievedMilestones = skills.reduce(
      (count, skill) => count + skill.milestones.filter((m) => m.isAchieved).length,
      0
    );

    const totalMilestones = skills.reduce((count, skill) => count + skill.milestones.length, 0);

    const averageSkillLevel =
      skills.length > 0
        ? skills.reduce((sum, skill) => sum + skill.currentLevel, 0) / skills.length
        : 0;

    const activePlans = plans.filter((p) => p.isActive).length;

    return {
      totalSkills: skills.length,
      averageLevel: Math.round(averageSkillLevel),
      achievedMilestones,
      totalMilestones,
      milestoneCompletionRate:
        totalMilestones > 0 ? Math.round((achievedMilestones / totalMilestones) * 100) : 0,
      totalProgressEntries: progressData.length,
      activePlans,
      totalInsights: insights.length,
      lastAssessment:
        skills.length > 0 ? Math.max(...skills.map((s) => s.lastAssessed.getTime())) : null,
    };
  }

  /**
   * エクササイズの実行記録
   */
  public recordExerciseCompletion(
    userId: string,
    skillId: string,
    exerciseId: string,
    performance: number,
    duration: number,
    notes?: string
  ): void {
    this.recordProgress(
      userId,
      skillId,
      performance,
      'performance_data',
      `Exercise: ${exerciseId}`,
      `Duration: ${duration}min. ${notes || ''}`
    );

    this.emit('exerciseCompleted', { userId, skillId, exerciseId, performance, duration });
  }

  /**
   * サービス停止
   */
  public stop(): void {
    console.log('🌱 認知成長支援サービスを停止しました');
  }
}

export default CognitiveGrowthSupportService;
