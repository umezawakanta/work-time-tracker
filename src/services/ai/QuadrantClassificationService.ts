// src/services/ai/QuadrantClassificationService.ts
import axios from 'axios';
import { Task } from '@/types/task';
import { Todo } from '@/types/todo';

// Gemini APIの設定
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Vite環境での環境変数取得（修正版）
const getGeminiApiKey = (): string => {
  // Viteでの正しい環境変数アクセス方法
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // デバッグ情報を出力（開発環境のみ）
  if (import.meta.env.DEV) {
    console.log('🔍 Gemini API Key Debug:');
    console.log('  - import.meta.env.VITE_GEMINI_API_KEY:', apiKey ? '設定済み ✅' : '未設定 ❌');
    console.log('  - 全環境変数:', import.meta.env);
  }
  
  return apiKey || '';
};

const API_KEY = getGeminiApiKey();

// 4象限の定義
export type QuadrantType = 'essential' | 'effectiveness' | 'illusion' | 'waste';

// 象限の詳細情報
export interface QuadrantInfo {
  quadrant: QuadrantType;
  name: string;
  description: string;
  importance: 'high' | 'low';
  urgency: 'high' | 'low';
  color: string;
  icon: string;
}

// タスクの象限分類結果
export interface TaskQuadrantClassification {
  taskId: string;
  quadrant: QuadrantType;
  importance: number; // 1-10スケール
  urgency: number; // 1-10スケール
  confidence: number; // 0-1
  reasoning: string;
  recommendations: string[];
  timeAllocation?: number; // 推奨時間配分（%）
  priority: number; // 1-100スケール
}

// タスク統合データ（様々なタスク形式に対応）
export interface UnifiedTaskData {
  id: string;
  title: string;
  description?: string;
  deadline?: Date | string;
  priority?: number | string;
  category?: string;
  tags?: string[];
  estimatedTime?: number;
  status?: string;
  type?: string;
}

// 4象限分析結果
export interface QuadrantAnalysisResult {
  totalTasks: number;
  quadrantBreakdown: Record<
    QuadrantType,
    {
      count: number;
      percentage: number;
      totalEstimatedTime: number;
      tasks: TaskQuadrantClassification[];
    }
  >;
  recommendations: {
    focus: string[];
    eliminate: string[];
    delegate: string[];
    schedule: string[];
  };
  timeDistribution: Record<QuadrantType, number>;
  productivity: {
    score: number;
    insights: string[];
  };
}

// 4象限の定義データ
export const QUADRANT_DEFINITIONS: Record<QuadrantType, QuadrantInfo> = {
  essential: {
    quadrant: 'essential',
    name: '必須',
    description: '重要度も緊急度も高いタスク - 即座に実行',
    importance: 'high',
    urgency: 'high',
    color: '#ef4444', // red-500
    icon: '🔥',
  },
  effectiveness: {
    quadrant: 'effectiveness',
    name: '効果性',
    description: '重要度が高いが緊急度が低いタスク - 計画的に実行',
    importance: 'high',
    urgency: 'low',
    color: '#3b82f6', // blue-500
    icon: '📈',
  },
  illusion: {
    quadrant: 'illusion',
    name: '錯覚',
    description: '緊急度が高いが重要度が低いタスク - 委任可能',
    importance: 'low',
    urgency: 'high',
    color: '#f59e0b', // amber-500
    icon: '⚡',
  },
  waste: {
    quadrant: 'waste',
    name: '浪費・過剰',
    description: '重要度も緊急度も低いタスク - 排除検討',
    importance: 'low',
    urgency: 'low',
    color: '#6b7280', // gray-500
    icon: '🗑️',
  },
};

// ファイルの上部でデバッグ
console.log('🔍 環境変数チェック:');
console.log('VITE_GEMINI_API_KEY:', import.meta.env.VITE_GEMINI_API_KEY);
console.log('NODE_ENV:', import.meta.env.MODE);
console.log(
  'All VITE vars:',
  Object.keys(import.meta.env).filter((key) => key.startsWith('VITE_'))
);

/**
 * 4象限タスク分類サービス - Gemini AI統合
 */
export class QuadrantClassificationService {
  private static instance: QuadrantClassificationService | null = null;

  public static getInstance(): QuadrantClassificationService {
    if (!QuadrantClassificationService.instance) {
      QuadrantClassificationService.instance = new QuadrantClassificationService();
    }
    return QuadrantClassificationService.instance;
  }

  /**
   * 単一タスクを4象限に分類
   */
  public async classifyTask(task: UnifiedTaskData): Promise<TaskQuadrantClassification> {
    try {
      if (!API_KEY) {
        if (import.meta.env.DEV) {
          console.warn('🚨 Gemini APIキーが設定されていません。ヒューリスティック分析を使用します。');
          console.log('💡 解決方法:');
          console.log('  1. .env.local ファイルに VITE_GEMINI_API_KEY=your_api_key を追加');
          console.log('  2. 開発サーバーを再起動 (pnpm dev)');
          console.log('  3. Google AI Studio (https://makersuite.google.com/app/apikey) でキーを取得');
        }
        return this.fallbackClassification(task);
      }

      const prompt = this.createClassificationPrompt(task);

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1500,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const generatedText = response.data.candidates[0].content.parts[0].text;
      return this.parseGeminiResponse(generatedText, task);
    } catch (error) {
      console.error('Gemini API分類エラー:', error);
      return this.fallbackClassification(task);
    }
  }

  /**
   * 複数タスクをバッチで分類
   */
  public async classifyTasks(tasks: UnifiedTaskData[]): Promise<TaskQuadrantClassification[]> {
    const classifications = await Promise.all(tasks.map((task) => this.classifyTask(task)));
    return classifications;
  }

  /**
   * 4象限分析を実行
   */
  public async analyzeQuadrants(tasks: UnifiedTaskData[]): Promise<QuadrantAnalysisResult> {
    console.log('🎯 4象限分析を開始します...', { taskCount: tasks.length });

    const classifications = await this.classifyTasks(tasks);

    // 象限別の集計
    const quadrantBreakdown: Record<QuadrantType, any> = {
      essential: { count: 0, percentage: 0, totalEstimatedTime: 0, tasks: [] },
      effectiveness: { count: 0, percentage: 0, totalEstimatedTime: 0, tasks: [] },
      illusion: { count: 0, percentage: 0, totalEstimatedTime: 0, tasks: [] },
      waste: { count: 0, percentage: 0, totalEstimatedTime: 0, tasks: [] },
    };

    classifications.forEach((classification) => {
      const quadrant = classification.quadrant;
      quadrantBreakdown[quadrant].count++;
      quadrantBreakdown[quadrant].tasks.push(classification);

      const task = tasks.find((t) => t.id === classification.taskId);
      if (task?.estimatedTime) {
        quadrantBreakdown[quadrant].totalEstimatedTime += task.estimatedTime;
      }
    });

    // パーセンテージの計算
    const totalTasks = classifications.length;
    Object.keys(quadrantBreakdown).forEach((key) => {
      const quadrant = key as QuadrantType;
      quadrantBreakdown[quadrant].percentage =
        totalTasks > 0 ? Math.round((quadrantBreakdown[quadrant].count / totalTasks) * 100) : 0;
    });

    // 推奨事項の生成
    const recommendations = this.generateRecommendations(quadrantBreakdown);

    // 時間配分の計算
    const timeDistribution = this.calculateTimeDistribution(quadrantBreakdown);

    // 生産性スコアの計算
    const productivity = this.calculateProductivityScore(quadrantBreakdown);

    return {
      totalTasks,
      quadrantBreakdown,
      recommendations,
      timeDistribution,
      productivity,
    };
  }

  /**
   * Gemini分類プロンプトの作成
   */
  private createClassificationPrompt(task: UnifiedTaskData): string {
    const deadline = task.deadline ? new Date(task.deadline).toLocaleDateString() : '未設定';

    return `
以下のタスクをアイゼンハワーマトリックス（4象限）に分類してください。

タスク情報:
- タイトル: "${task.title}"
- 説明: "${task.description || '説明なし'}"
- 期限: ${deadline}
- カテゴリ: ${task.category || '未分類'}
- 推定時間: ${task.estimatedTime || '不明'}分
- 現在の優先度: ${task.priority || '未設定'}

アイゼンハワーマトリックス（4象限）:
1. 【必須】重要度HIGH × 緊急度HIGH → 今すぐやる（危機管理、緊急の問題）
2. 【効果性】重要度HIGH × 緊急度LOW → 計画して実行（予防、準備、計画）
3. 【錯覚】重要度LOW × 緊急度HIGH → 委任を検討（一部の会議、一部の電話）
4. 【浪費・過剰】重要度LOW × 緊急度LOW → 排除を検討（時間つぶし、無駄な活動）

以下の基準で分析してください：
- 重要度: このタスクは目標達成にどの程度寄与するか（1-10）
- 緊急度: このタスクはどの程度急いで実行すべきか（1-10）
- ビジネスインパクト: 組織や個人の成果への影響
- 代替可能性: 他の人に委任できるか
- 延期可能性: 後回しにできるか

JSON形式で回答してください:
{
  "quadrant": "essential" | "effectiveness" | "illusion" | "waste",
  "importance": 1-10の数値,
  "urgency": 1-10の数値,
  "confidence": 0-1の確信度,
  "reasoning": "分類の詳細な理由",
  "recommendations": ["具体的な行動提案1", "行動提案2", "行動提案3"],
  "timeAllocation": 推奨時間配分パーセンテージ（0-100）,
  "priority": 最終的な優先度スコア（1-100）
}
`;
  }

  /**
   * Gemini応答の解析
   */
  private parseGeminiResponse(response: string, task: UnifiedTaskData): TaskQuadrantClassification {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        return {
          taskId: task.id,
          quadrant: parsed.quadrant || 'waste',
          importance: parsed.importance || 5,
          urgency: parsed.urgency || 5,
          confidence: parsed.confidence || 0.5,
          reasoning: parsed.reasoning || '自動分類されました',
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
          timeAllocation: parsed.timeAllocation || 25,
          priority: parsed.priority || 50,
        };
      }
    } catch (error) {
      console.error('Gemini応答解析エラー:', error);
    }

    return this.fallbackClassification(task);
  }

  /**
   * フォールバック分類（ヒューリスティック）
   */
  private fallbackClassification(task: UnifiedTaskData): TaskQuadrantClassification {
    console.log('🔄 ヒューリスティック分類を使用:', task.title);

    let importance = 5;
    let urgency = 5;
    let quadrant: QuadrantType = 'effectiveness';

    // 期限による緊急度判定
    if (task.deadline) {
      const deadline = new Date(task.deadline);
      const now = new Date();
      const daysUntilDeadline = Math.ceil(
        (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilDeadline <= 1) urgency = 9;
      else if (daysUntilDeadline <= 3) urgency = 7;
      else if (daysUntilDeadline <= 7) urgency = 5;
      else urgency = 3;
    }

    // キーワードによる重要度判定
    const text = `${task.title} ${task.description || ''}`.toLowerCase();
    const highImportanceKeywords = [
      '重要',
      '必須',
      '緊急',
      'critical',
      'urgent',
      '優先',
      '目標',
      'プロジェクト',
    ];
    const lowImportanceKeywords = ['雑務', '整理', 'ついで', '暇つぶし', '娯楽', 'sns', 'チェック'];

    const highMatches = highImportanceKeywords.filter((keyword) => text.includes(keyword)).length;
    const lowMatches = lowImportanceKeywords.filter((keyword) => text.includes(keyword)).length;

    if (highMatches > lowMatches) importance = 8;
    else if (lowMatches > highMatches) importance = 3;

    // 象限の決定
    if (importance >= 7 && urgency >= 7) quadrant = 'essential';
    else if (importance >= 7 && urgency < 7) quadrant = 'effectiveness';
    else if (importance < 7 && urgency >= 7) quadrant = 'illusion';
    else quadrant = 'waste';

    return {
      taskId: task.id,
      quadrant,
      importance,
      urgency,
      confidence: 0.6,
      reasoning: 'キーワードと期限に基づくヒューリスティック分析',
      recommendations: this.getQuadrantRecommendations(quadrant),
      timeAllocation: this.getDefaultTimeAllocation(quadrant),
      priority: this.calculatePriority(importance, urgency),
    };
  }

  /**
   * 象限別の推奨事項生成
   */
  private generateRecommendations(quadrantBreakdown: Record<QuadrantType, any>) {
    return {
      focus: [
        `【必須】${quadrantBreakdown.essential.count}件のタスクを最優先で実行`,
        `【効果性】${quadrantBreakdown.effectiveness.count}件のタスクを計画的にスケジュール`,
      ],
      eliminate: [
        `【浪費・過剰】${quadrantBreakdown.waste.count}件のタスクの排除を検討`,
        '時間を浪費するタスクを特定し、削除または最小化',
      ],
      delegate: [
        `【錯覚】${quadrantBreakdown.illusion.count}件のタスクの委任を検討`,
        '緊急だが重要でないタスクは他者への依頼を検討',
      ],
      schedule: [
        '効果性タスクを定期的なスケジュールに組み込む',
        '必須タスクの発生を予防するための計画を立てる',
      ],
    };
  }

  /**
   * 時間配分の計算
   */
  private calculateTimeDistribution(
    quadrantBreakdown: Record<QuadrantType, any>
  ): Record<QuadrantType, number> {
    const totalTime = Object.values(quadrantBreakdown).reduce(
      (sum: number, quad: any) => sum + quad.totalEstimatedTime,
      0
    );

    return {
      essential:
        totalTime > 0
          ? Math.round((quadrantBreakdown.essential.totalEstimatedTime / totalTime) * 100)
          : 0,
      effectiveness:
        totalTime > 0
          ? Math.round((quadrantBreakdown.effectiveness.totalEstimatedTime / totalTime) * 100)
          : 0,
      illusion:
        totalTime > 0
          ? Math.round((quadrantBreakdown.illusion.totalEstimatedTime / totalTime) * 100)
          : 0,
      waste:
        totalTime > 0
          ? Math.round((quadrantBreakdown.waste.totalEstimatedTime / totalTime) * 100)
          : 0,
    };
  }

  /**
   * 生産性スコアの計算
   */
  private calculateProductivityScore(quadrantBreakdown: Record<QuadrantType, any>) {
    const total = Object.values(quadrantBreakdown).reduce(
      (sum: number, quad: any) => sum + quad.count,
      0
    );

    if (total === 0) {
      return {
        score: 50,
        insights: ['タスクが登録されていません'],
      };
    }

    // 重要な象限の割合で生産性を評価
    const essentialRatio = quadrantBreakdown.essential.count / total;
    const effectivenessRatio = quadrantBreakdown.effectiveness.count / total;
    const wasteRatio = quadrantBreakdown.waste.count / total;

    let score = 50; // ベーススコア
    score += effectivenessRatio * 40; // 効果性タスクがあるとプラス
    score += essentialRatio * 20; // 必須タスクは必要だがあまり多いと問題
    score -= wasteRatio * 30; // 浪費タスクがあるとマイナス

    score = Math.max(0, Math.min(100, Math.round(score)));

    const insights = [];
    if (effectivenessRatio > 0.4) insights.push('✅ 計画的なタスク管理ができています');
    if (essentialRatio > 0.3) insights.push('⚠️ 緊急タスクが多すぎます。予防策を検討してください');
    if (wasteRatio > 0.2) insights.push('🗑️ 不要なタスクが多いです。タスクの整理をおすすめします');
    if (quadrantBreakdown.illusion.count > quadrantBreakdown.effectiveness.count) {
      insights.push('🎯 錯覚タスクが多いです。委任や自動化を検討してください');
    }

    return { score, insights };
  }

  /**
   * ユーティリティメソッド
   */
  private getQuadrantRecommendations(quadrant: QuadrantType): string[] {
    const recommendations = {
      essential: ['即座に実行', '他のタスクを中断してでも対応', '再発防止策を検討'],
      effectiveness: ['計画的にスケジュール', '十分な時間を確保', '定期的な進捗確認'],
      illusion: ['委任可能性を検討', '簡素化できないか確認', '本当に必要か再評価'],
      waste: ['排除を検討', '最小限の時間で対応', '自動化を検討'],
    };
    return recommendations[quadrant];
  }

  private getDefaultTimeAllocation(quadrant: QuadrantType): number {
    const allocations = {
      essential: 15, // 緊急だが少なくあるべき
      effectiveness: 50, // 最も重要
      illusion: 25, // 委任前提
      waste: 10, // 最小限
    };
    return allocations[quadrant];
  }

  private calculatePriority(importance: number, urgency: number): number {
    // 重要度を重視した優先度計算（重要度70%、緊急度30%）
    return Math.round((importance * 0.7 + urgency * 0.3) * 10);
  }

  /**
   * タスクを統一形式に変換
   */
  public convertToUnifiedTask(task: any): UnifiedTaskData {
    return {
      id: task._id || task.id || String(Date.now()),
      title: task.title || task.task || '無題のタスク',
      description: task.description || task.note || task.memo,
      deadline: task.deadline || task.dueDate,
      priority: task.priority,
      category: task.category,
      tags: task.tags,
      estimatedTime: task.estimatedTime || task.estimatedDuration,
      status: task.status,
      type: task.type,
    };
  }
}

export default QuadrantClassificationService;
