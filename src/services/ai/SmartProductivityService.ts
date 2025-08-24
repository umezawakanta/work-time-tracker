// src/services/ai/SmartProductivityService.ts
import { GeminiService, TaskDetailAnalysis } from '@/services/GeminiService';
import { multiAIIntegrationService } from '@/services/ai/MultiAIIntegrationService';
import { Todo } from '@/types/todo';

/**
 * 🧠 スマート生産性向上サービス
 * Gemini 2.5 Pro の最新機能を活用した高度な生産性分析システム
 */

export interface ProductivityInsight {
  type: 'efficiency' | 'scheduling' | 'priority' | 'optimization';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  actionItems: string[];
  estimatedTimesSaved: number; // 分単位
  confidence: number;
  category: string;
}

export interface SmartSchedule {
  timeSlot: {
    start: string; // ISO datetime
    end: string;
  };
  taskId: string;
  reason: string;
  energyLevel: 'low' | 'medium' | 'high';
  focusRequired: 'light' | 'medium' | 'deep';
  estimatedProductivity: number; // 0-100%
}

export interface WeeklyProductivityReport {
  period: {
    start: string;
    end: string;
  };
  insights: ProductivityInsight[];
  recommendations: string[];
  achievements: string[];
  areasForImprovement: string[];
  nextWeekPredictions: string[];
  productivityScore: number; // 0-100
  trends: {
    taskCompletion: number;
    efficiency: number;
    focusTime: number;
  };
}

export interface ProactiveTaskSuggestion {
  suggestedTask: {
    title: string;
    description: string;
    category: string;
    priority: number;
    estimatedDuration: number;
    deadline?: string;
  };
  reason: string;
  basedOnPattern: string;
  anticipatedBenefit: string;
  confidence: number;
  urgency: 'low' | 'medium' | 'high';
}

class SmartProductivityService {
  private readonly GEMINI_MODEL = 'gemini-2.5-pro';
  private lastAnalysisCache: Map<string, any> = new Map();
  private behaviorPatterns: Map<string, any> = new Map();

  /**
   * 🎯 スマートスケジューリング - Gemini 2.5 Pro の推論能力を活用
   */
  async generateSmartSchedule(
    todos: Todo[],
    userPreferences: any = {},
    timeWindow: { start: string; end: string }
  ): Promise<SmartSchedule[]> {
    try {
      console.log('🎯 Gemini 2.5 Pro によるスマートスケジューリング開始');

      const analysisPrompt = `
あなたは世界最高の生産性エキスパートです。Gemini 2.5 Pro の高度な推論能力を使って、以下のタスクを最適にスケジューリングしてください。

【タスクリスト】
${JSON.stringify(todos.slice(0, 10), null, 2)}

【時間枠】
開始: ${timeWindow.start}
終了: ${timeWindow.end}

【ユーザー設定】
${JSON.stringify(userPreferences, null, 2)}

以下の要素を考慮して、最適なスケジュールを作成してください：
1. **エネルギーレベル最適化**: 高エネルギー時に重要タスク、低エネルギー時に簡単タスク
2. **認知負荷管理**: 深い集中が必要なタスクは干渉を避けて配置
3. **モメンタム活用**: 似た性質のタスクをグループ化
4. **休憩とリカバリー**: 適切な休憩時間を確保
5. **緊急度と重要度**: アイゼンハワーマトリックスに基づく優先順位

各タスクに対して以下の JSON 形式でレスポンスしてください：
{
  "schedules": [
    {
      "timeSlot": {
        "start": "2024-01-15T09:00:00Z",
        "end": "2024-01-15T10:30:00Z"
      },
      "taskId": "task_id_here",
      "reason": "高エネルギー時間帯で重要なタスクを配置。集中力が最も高い朝の時間を活用。",
      "energyLevel": "high",
      "focusRequired": "deep",
      "estimatedProductivity": 85
    }
  ],
  "optimization_notes": "スケジューリングの考慮点と最適化理由"
}`;

      const response = await multiAIIntegrationService.processTask({
        prompt: analysisPrompt,
        taskType: 'planning',
        priority: 'high',
      });

      return this.parseScheduleResponse(response.content);
    } catch (error) {
      console.error('スマートスケジューリングエラー:', error);
      return this.generateFallbackSchedule(todos, timeWindow);
    }
  }

  /**
   * 📊 週次生産性レポート生成
   */
  async generateWeeklyReport(
    userId: string,
    historicalData: any[]
  ): Promise<WeeklyProductivityReport> {
    try {
      console.log('📊 週次AI生産性レポート生成開始');

      const reportPrompt = `
あなたは AI 生産性コンサルタントです。以下のデータから包括的な週次レポートを生成してください。

【ユーザー】${userId}
【期間】過去7日間のデータ
【データ】
${JSON.stringify(historicalData.slice(0, 20), null, 2)}

以下の観点で詳細分析してください：

1. **生産性パターン分析**
   - 最も生産的な時間帯と曜日
   - エネルギーレベルの変化パターン
   - 集中力の持続時間の傾向

2. **タスク完了効率**
   - 予定時間 vs 実際時間の差異
   - タスクタイプ別の完了率
   - 先延ばし傾向の分析

3. **改善機会の特定**
   - 時間の無駄遣いポイント
   - 非効率なタスク順序
   - 休憩・回復時間の最適化

4. **次週への提案**
   - 予測される課題と対策
   - 推奨スケジュール調整
   - 新しい生産性技法の提案

JSON 形式で構造化されたレポートを返してください。定量的データと具体的アクションプランを含めてください。`;

      const response = await multiAIIntegrationService.processTask({
        prompt: reportPrompt,
        taskType: 'analysis',
        priority: 'normal',
      });

      return this.parseWeeklyReport(response.content);
    } catch (error) {
      console.error('週次レポート生成エラー:', error);
      return this.generateFallbackReport();
    }
  }

  /**
   * 🔮 プロアクティブタスク提案
   */
  async generateProactiveTaskSuggestions(
    userId: string,
    currentContext: any
  ): Promise<ProactiveTaskSuggestion[]> {
    try {
      console.log('🔮 プロアクティブタスク提案生成');

      const suggestionPrompt = `
あなたは予測的 AI アシスタントです。ユーザーの行動パターンと現在の状況から、未来のニーズを予測してタスクを提案してください。

【ユーザー】${userId}
【現在の状況】
${JSON.stringify(currentContext, null, 2)}

以下の観点でプロアクティブな提案を生成：

1. **予防的タスク**: 問題が発生する前の対策
2. **機会最大化**: チャンスを逃さないための準備
3. **効率向上**: ワークフローの最適化
4. **スキル向上**: 長期的な成長につながるタスク
5. **メンテナンス**: 定期的に必要な保守作業

各提案は以下の要素を含めてください：
- 提案理由（なぜ今このタスクが必要か）
- 行動しなかった場合のリスク
- 期待される具体的なベネフィット
- 最適実行タイミング

JSON 形式で回答してください。`;

      const response = await multiAIIntegrationService.processTask({
        prompt: suggestionPrompt,
        taskType: 'planning',
        priority: 'normal',
      });

      return this.parseProactiveSuggestions(response.content);
    } catch (error) {
      console.error('プロアクティブ提案エラー:', error);
      return [];
    }
  }

  /**
   * 🎭 パーソナライズされた効率化提案
   */
  async generatePersonalizedInsights(
    todos: Todo[],
    userBehaviorData: any
  ): Promise<ProductivityInsight[]> {
    try {
      const insightsPrompt = `
個人の行動パターンに基づいて、カスタマイズされた生産性向上提案を生成してください。

【現在のタスク】
${JSON.stringify(todos.slice(0, 8), null, 2)}

【行動データ】
${JSON.stringify(userBehaviorData, null, 2)}

以下の分野で個人最適化された提案を生成：

1. **時間管理の最適化**
   - この人特有の時間の使い方の癖
   - 個人のリズムに合った作業パターン

2. **注意力管理**
   - 集中力の波に合わせたタスク配置
   - 気が散る要因とその対策

3. **モチベーション維持**
   - この人が続けやすい報酬システム
   - やる気を維持する工夫

4. **ストレス軽減**
   - プレッシャーポイントの特定と対策
   - リラックス方法の提案

実行可能で即効性のある提案を JSON 形式で返してください。`;

      const response = await GeminiService.analyzeTaskDetails(insightsPrompt);
      return this.parseProductivityInsights(response);
    } catch (error) {
      console.error('パーソナライズ分析エラー:', error);
      return [];
    }
  }

  /**
   * 📈 リアルタイム最適化提案
   */
  async getRealTimeOptimization(currentTask: Todo, context: any): Promise<string[]> {
    try {
      const optimizationPrompt = `
現在実行中のタスクをリアルタイムで最適化してください。

【現在のタスク】
${JSON.stringify(currentTask, null, 2)}

【状況】
${JSON.stringify(context, null, 2)}

以下の観点で即座に実行できる最適化提案を生成：
1. このタスクをより効率的に完了する方法
2. 時間短縮のための具体的技法
3. 品質を下げずに速度を上げる方法
4. 次のタスクへの準備を同時並行で進める方法

簡潔で実行可能な提案のみを配列形式で返してください。`;

      const response = await GeminiService.analyzeTaskDetails(optimizationPrompt);
      return this.parseOptimizationTips(response);
    } catch (error) {
      console.error('リアルタイム最適化エラー:', error);
      return ['フォーカスを維持し、他の作業に手を出さないようにしましょう'];
    }
  }

  // ヘルパーメソッド
  private parseScheduleResponse(response: string): SmartSchedule[] {
    try {
      const parsed = JSON.parse(response.replace(/```json|```/g, ''));
      return parsed.schedules || [];
    } catch {
      return [];
    }
  }

  private parseWeeklyReport(response: string): WeeklyProductivityReport {
    try {
      const parsed = JSON.parse(response.replace(/```json|```/g, ''));
      return {
        period: { start: new Date().toISOString(), end: new Date().toISOString() },
        insights: parsed.insights || [],
        recommendations: parsed.recommendations || [],
        achievements: parsed.achievements || [],
        areasForImprovement: parsed.areasForImprovement || [],
        nextWeekPredictions: parsed.nextWeekPredictions || [],
        productivityScore: parsed.productivityScore || 75,
        trends: parsed.trends || { taskCompletion: 0, efficiency: 0, focusTime: 0 },
      };
    } catch {
      return this.generateFallbackReport();
    }
  }

  private parseProactiveSuggestions(response: string): ProactiveTaskSuggestion[] {
    try {
      const parsed = JSON.parse(response.replace(/```json|```/g, ''));
      return parsed.suggestions || [];
    } catch {
      return [];
    }
  }

  private parseProductivityInsights(analysis: TaskDetailAnalysis): ProductivityInsight[] {
    return [
      {
        type: 'efficiency',
        title: '効率化提案',
        description: analysis.description,
        impact: 'medium',
        actionItems: analysis.actionItems || [],
        estimatedTimesSaved: 15,
        confidence: analysis.confidence,
        category: analysis.category,
      },
    ];
  }

  private parseOptimizationTips(analysis: TaskDetailAnalysis): string[] {
    return analysis.actionItems || ['現在のタスクに集中して完了させましょう'];
  }

  private generateFallbackSchedule(todos: Todo[], timeWindow: any): SmartSchedule[] {
    return todos.slice(0, 3).map((todo, index) => ({
      timeSlot: {
        start: new Date(Date.now() + index * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + (index + 1) * 60 * 60 * 1000).toISOString(),
      },
      taskId: todo._id,
      reason: '基本的な時間順配置',
      energyLevel: 'medium' as const,
      focusRequired: 'medium' as const,
      estimatedProductivity: 70,
    }));
  }

  private generateFallbackReport(): WeeklyProductivityReport {
    return {
      period: { start: new Date().toISOString(), end: new Date().toISOString() },
      insights: [],
      recommendations: ['定期的なタスクレビューを実施しましょう'],
      achievements: ['今週もお疲れ様でした'],
      areasForImprovement: ['さらなる効率化の余地があります'],
      nextWeekPredictions: ['来週も頑張りましょう'],
      productivityScore: 75,
      trends: { taskCompletion: 75, efficiency: 70, focusTime: 80 },
    };
  }
}

export const smartProductivityService = new SmartProductivityService();
