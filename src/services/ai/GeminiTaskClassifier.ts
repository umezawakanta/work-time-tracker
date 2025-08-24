/**
 * 🤖 Gemini AI統合タスク分類サービス
 * 実用性とユーザビリティを最優先とした高度なタスク分析システム
 */

import axios from 'axios';
import { ENV } from '@/utils/env';
import {
  UnifiedTaskData,
  TaskQuadrantClassification,
  QuadrantType,
} from './QuadrantClassificationService';

// Gemini API設定
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// APIキーの取得と検証
const getGeminiApiKey = (): string => {
  const apiKey = ENV.GEMINI_API_KEY();

  if (!apiKey && ENV.isDev()) {
    console.warn('🚨 Gemini APIキーが未設定です。');
    console.log('💡 設定方法:');
    console.log('1. Google AI Studio (https://aistudio.google.com/app/apikey) でAPIキーを取得');
    console.log('2. .env.local に VITE_GEMINI_API_KEY=your_api_key を追加');
    console.log('3. 開発サーバーを再起動 (npm run dev)');
  }

  return apiKey || '';
};

// 高度なタスク分析結果の型定義
export interface AdvancedTaskAnalysis extends TaskQuadrantClassification {
  // 追加の分析項目
  strategicValue: number; // 戦略的価値 (1-10)
  riskLevel: number; // リスクレベル (1-10)
  energyRequired: number; // 必要エネルギー (1-10)
  dependencyLevel: number; // 依存度 (1-10)
  estimatedDuration: number; // AI推定作業時間（分）
  optimalTimeSlot: string; // 最適実行時間帯
  blockingTasks: string[]; // ブロックされているタスク
  prerequisites: string[]; // 前提条件
  successCriteria: string[]; // 成功基準
  kpiImpact: string; // KPIへの影響
}

// Geminiプロンプト生成関数
const createAdvancedPrompt = (task: UnifiedTaskData): string => {
  const now = new Date();
  const deadline = task.deadline ? new Date(task.deadline) : null;
  const daysUntilDeadline = deadline
    ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const urgencyIndicator =
    daysUntilDeadline !== null
      ? daysUntilDeadline <= 0
        ? '🚨 期限超過'
        : daysUntilDeadline <= 1
          ? '⚡ 明日期限'
          : daysUntilDeadline <= 3
            ? '🟡 3日以内'
            : daysUntilDeadline <= 7
              ? '🟢 1週間以内'
              : '📅 長期'
      : '📋 期限なし';

  return `
あなたは世界トップクラスの生産性コンサルタントで、McKinsey & Company, Boston Consulting Group, Deloitteでの豊富な経験を持ちます。
以下のタスクをStephen Coveyの時間管理マトリックスに基づき、最高レベルの実用性で分析してください。

【📋 タスク情報】
🎯 タイトル: "${task.title}"
📝 詳細: "${task.description || 'なし'}"
📅 期限: ${deadline ? `${deadline.toLocaleDateString('ja-JP')} ${urgencyIndicator}` : '期限なし'}
🏷️ カテゴリ: ${task.category || '未分類'}
⏱️ 推定時間: ${task.estimatedTime || '未設定'}分
📊 現在優先度: ${task.priority || '未設定'}
🏃 ステータス: ${task.status || '新規'}
🏷️ タグ: ${task.tags?.join(', ') || 'なし'}

【🧠 分析フレームワーク】
💎 重要度 (Strategic Importance):
- 長期目標への直接的貢献度
- 組織/個人の核心価値への影響
- ROI/価値創造ポテンシャル
- スキルアップ・成長への寄与

⚡ 緊急度 (Time Sensitivity):
- 締切の切迫性と硬度
- 他者・システムへの依存性
- 遅延時の波及影響
- 外部圧力・要求レベル

🎯 戦略的価値 (Strategic Value):
- 競争優位性への寄与
- 組織能力向上への影響
- 将来機会創出への貢献

⚠️ リスクレベル (Risk Assessment):
- 失敗時のダメージ
- 不確実性の度合い
- 修正可能性

【🗂️ 4象限分類】
🔴 essential: 重要+緊急 → 即座実行 (危機対応、締切間近重要案件)
🟦 effectiveness: 重要+非緊急 → 戦略実行 (計画、予防、自己投資、関係構築)
🟡 illusion: 非重要+緊急 → 効率化/委譲 (割り込み、一部会議、急かされる雑務)
⚪ waste: 非重要+非緊急 → 削除検討 (習慣的作業、時間つぶし、過度の完璧主義)

【📋 出力要求】以下のJSONフォーマットで詳細分析を提供してください:
{
  "quadrant": "essential|effectiveness|illusion|waste",
  "importance": 1-10の数値,
  "urgency": 1-10の数値,
  "confidence": 0.8-1.0の数値,
  "strategicValue": 1-10の数値,
  "riskLevel": 1-10の数値,
  "energyRequired": 1-10の数値,
  "dependencyLevel": 1-10の数値,
  "estimatedDuration": 推定実作業時間（分）,
  "optimalTimeSlot": "朝一|午前中|昼休み後|午後|夕方|夜間|週末",
  "reasoning": "150文字以内で実用的な分析理由",
  "recommendations": [
    "今すぐ実行できる具体的アクション",
    "効率化のための実践的提案", 
    "リスク軽減のための対策"
  ],
  "blockingTasks": ["このタスクにより阻害される他タスク"],
  "prerequisites": ["このタスク実行のための前提条件"],
  "successCriteria": ["成功判定基準"],
  "kpiImpact": "組織/個人KPIへの具体的影響",
  "priority": 1-100の総合優先度,
  "timeAllocation": 推奨時間配分割合(%)
}

【⚠️ 重要】
- 実行可能性を最優先し、明日から実践できる具体的提案を必須とします
- 抽象的表現を避け、行動指向の実用的回答をお願いします  
- ユーザーの時間価値最大化を念頭に置いた戦略的視点で分析してください
- 日本のビジネス環境と文化的コンテキストを考慮してください
`;
};

/**
 * 🤖 Gemini AI統合タスク分類サービス
 */
export class GeminiTaskClassifier {
  private static instance: GeminiTaskClassifier;
  private apiKey: string;

  private constructor() {
    this.apiKey = getGeminiApiKey();
  }

  public static getInstance(): GeminiTaskClassifier {
    if (!GeminiTaskClassifier.instance) {
      GeminiTaskClassifier.instance = new GeminiTaskClassifier();
    }
    return GeminiTaskClassifier.instance;
  }

  /**
   * 🎯 高度なタスク分析
   */
  public async analyzeTask(task: UnifiedTaskData): Promise<AdvancedTaskAnalysis> {
    try {
      if (!this.apiKey) {
        return this.createFallbackAnalysis(task);
      }

      const prompt = createAdvancedPrompt(task);

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.1, // より一貫した結果のため低めに設定
            maxOutputTokens: 2048,
            topK: 40,
            topP: 0.9,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30秒タイムアウト
        }
      );

      const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('Gemini APIからの無効な応答');
      }

      return this.parseGeminiResponse(generatedText, task);
    } catch (error) {
      console.error('🚨 Gemini分析エラー:', error);

      if (ENV.isDev()) {
        console.log('📋 エラー詳細:', {
          taskTitle: task.title,
          error: error instanceof Error ? error.message : 'Unknown error',
          apiKeyConfigured: !!this.apiKey,
        });
      }

      return this.createFallbackAnalysis(task);
    }
  }

  /**
   * 📊 バッチタスク分析
   */
  public async analyzeTasks(tasks: UnifiedTaskData[]): Promise<AdvancedTaskAnalysis[]> {
    console.log(`🤖 ${tasks.length}件のタスクをGemini AIで分析開始...`);

    // 並列処理でパフォーマンス向上（APIレート制限を考慮して制御）
    const batchSize = 3; // 同時に処理するタスク数
    const results: AdvancedTaskAnalysis[] = [];

    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map((task) => this.analyzeTask(task)));
      results.push(...batchResults);

      // APIレート制限対策で少し待機
      if (i + batchSize < tasks.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`✅ Gemini分析完了: ${results.length}件`);
    return results;
  }

  /**
   * 🔍 Gemini応答解析
   */
  private parseGeminiResponse(response: string, task: UnifiedTaskData): AdvancedTaskAnalysis {
    try {
      // JSONブロックを抽出
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON形式の応答が見つかりません');
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);

      // 必須フィールドの検証
      const requiredFields = ['quadrant', 'importance', 'urgency', 'confidence'];
      for (const field of requiredFields) {
        if (!(field in parsedResponse)) {
          throw new Error(`必須フィールド '${field}' が不足しています`);
        }
      }

      return {
        taskId: task.id,
        quadrant: this.validateQuadrant(parsedResponse.quadrant),
        importance: this.clampValue(parsedResponse.importance, 1, 10),
        urgency: this.clampValue(parsedResponse.urgency, 1, 10),
        confidence: this.clampValue(parsedResponse.confidence, 0, 1),
        strategicValue: this.clampValue(parsedResponse.strategicValue || 5, 1, 10),
        riskLevel: this.clampValue(parsedResponse.riskLevel || 5, 1, 10),
        energyRequired: this.clampValue(parsedResponse.energyRequired || 5, 1, 10),
        dependencyLevel: this.clampValue(parsedResponse.dependencyLevel || 3, 1, 10),
        estimatedDuration: Math.max(
          5,
          parsedResponse.estimatedDuration || task.estimatedTime || 30
        ),
        optimalTimeSlot: parsedResponse.optimalTimeSlot || '午前中',
        reasoning: parsedResponse.reasoning || '自動分析による結果です',
        recommendations: Array.isArray(parsedResponse.recommendations)
          ? parsedResponse.recommendations.slice(0, 3)
          : ['タスクを実行してください', '進捗を定期的に確認してください'],
        blockingTasks: Array.isArray(parsedResponse.blockingTasks)
          ? parsedResponse.blockingTasks
          : [],
        prerequisites: Array.isArray(parsedResponse.prerequisites)
          ? parsedResponse.prerequisites
          : [],
        successCriteria: Array.isArray(parsedResponse.successCriteria)
          ? parsedResponse.successCriteria
          : ['タスクの完了'],
        kpiImpact: parsedResponse.kpiImpact || '生産性向上に寄与',
        priority: this.clampValue(parsedResponse.priority || 50, 1, 100),
        timeAllocation: this.clampValue(parsedResponse.timeAllocation || 25, 0, 100),
      };
    } catch (error) {
      console.warn('⚠️ Gemini応答解析失敗:', error);
      return this.createFallbackAnalysis(task);
    }
  }

  /**
   * 🛡️ フォールバック分析（API使用不可時）
   */
  private createFallbackAnalysis(task: UnifiedTaskData): AdvancedTaskAnalysis {
    // ヒューリスティック分析
    const now = new Date();
    const deadline = task.deadline ? new Date(task.deadline) : null;
    const daysUntilDeadline = deadline
      ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    // 重要度判定（キーワードベース）
    const importantKeywords = ['重要', '戦略', '売上', '顧客', '成長', '目標', '計画'];
    const importance = importantKeywords.some(
      (keyword) => task.title.includes(keyword) || task.description?.includes(keyword)
    )
      ? 8
      : 5;

    // 緊急度判定（期限ベース）
    const urgency =
      daysUntilDeadline <= 1 ? 9 : daysUntilDeadline <= 3 ? 7 : daysUntilDeadline <= 7 ? 5 : 3;

    // 象限判定
    const quadrant: QuadrantType =
      importance >= 7 && urgency >= 7
        ? 'essential'
        : importance >= 7 && urgency < 7
          ? 'effectiveness'
          : importance < 7 && urgency >= 7
            ? 'illusion'
            : 'waste';

    return {
      taskId: task.id,
      quadrant,
      importance,
      urgency,
      confidence: 0.7,
      strategicValue: importance,
      riskLevel: urgency,
      energyRequired: 5,
      dependencyLevel: 3,
      estimatedDuration: task.estimatedTime || 30,
      optimalTimeSlot: '午前中',
      reasoning: 'ヒューリスティック分析による自動分類です',
      recommendations: [
        quadrant === 'essential' ? '最優先で実行してください' : '計画的に実行してください',
        '進捗を定期的に確認してください',
        '必要に応じて他者と相談してください',
      ],
      blockingTasks: [],
      prerequisites: [],
      successCriteria: ['タスクの完了'],
      kpiImpact: '生産性向上',
      priority: importance * 10 + urgency,
      timeAllocation: 25,
    };
  }

  /**
   * 🔧 ユーティリティ関数
   */
  private validateQuadrant(quadrant: string): QuadrantType {
    const validQuadrants: QuadrantType[] = ['essential', 'effectiveness', 'illusion', 'waste'];
    return validQuadrants.includes(quadrant as QuadrantType)
      ? (quadrant as QuadrantType)
      : 'effectiveness';
  }

  private clampValue(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value || min));
  }
}

// シングルトンインスタンスをエクスポート
export const geminiTaskClassifier = GeminiTaskClassifier.getInstance();
export default geminiTaskClassifier;
