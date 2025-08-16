// src/services/ai/QuadrantClassificationService.ts
import axios from 'axios';
import { Task } from '@/types/task';
import { Todo } from '@/types/todo';

// Gemini APIの設定
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

import { ENV } from '@/utils/env';

// 環境変数取得（修正版）
const getGeminiApiKey = (): string => {
  // 複数の方法で環境変数を取得を試みる
  let apiKey = '';

  // 方法1: ENVヘルパーを使用
  apiKey = ENV.GEMINI_API_KEY() || '';

  // 方法2: import.meta.envから直接取得
  if (!apiKey) {
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      }
    } catch (e) {
      // 無視
    }
  }

  // 方法3: windowオブジェクトから取得（フォールバック）
  if (!apiKey && typeof window !== 'undefined') {
    try {
      apiKey = (window as any)?.import?.meta?.env?.VITE_GEMINI_API_KEY || '';
    } catch (e) {
      // 無視
    }
  }

  // 方法4: ユーザー提供のAPIキーを使用（一時的な解決策）
  // 注意: 本番環境では環境変数を使用してください
  if (!apiKey) {
    // ユーザーが提供したAPIキーを使用
    apiKey = 'AIzaSyDSapnVkg5I6U2JDjOme9cG4dkdfrxENh8';
    if (ENV.isDev()) {
      console.log('⚠️ ハードコーディングされたAPIキーを使用しています');
      console.log('💡 推奨: .envファイルを作成して環境変数を設定してください');
    }
  }

  // デバッグ情報を出力（開発環境のみ）
  if (ENV.isDev() && apiKey) {
    console.log('✅ Gemini API Key: 設定済み');
    console.log('  - APIキー長さ:', apiKey.length, '文字');
  }

  return apiKey;
};

// API_KEYを遅延評価に変更
let _apiKey: string | null = null;
const getApiKey = (): string => {
  if (_apiKey === null) {
    _apiKey = getGeminiApiKey();
  }
  return _apiKey;
};

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
  isCompleted?: boolean;
  updatedAt?: Date | string;
  createdAt?: Date | string;
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

// デバッグ情報（開発環境のみ）
const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
if (isDev) {
  console.log('🔍 環境変数チェック:');
  const apiKey =
    process.env.VITE_GEMINI_API_KEY ||
    (typeof window !== 'undefined' && (window as any).import?.meta?.env?.VITE_GEMINI_API_KEY);
  console.log('VITE_GEMINI_API_KEY:', apiKey ? '設定済み ✅' : '未設定 ❌');
  console.log('NODE_ENV:', process.env.NODE_ENV);
}

/**
 * 4象限タスク分類サービス - Gemini AI統合
 */
// レート制限の設定
const RATE_LIMIT = {
  requestsPerMinute: 10, // より保守的な制限（Gemini無料プラン向け）
  retryDelay: 3000, // リトライまでの初期遅延（ミリ秒）
  maxRetries: 3, // 最大リトライ回数
  batchSize: 1, // 同時処理の最大数（1つずつ処理）
  maxTasksPerAnalysis: 15, // 一度に分析する最大タスク数
  initialDelay: 1000, // 初回リクエスト前の待機時間
};

// キャッシュの実装（最大100件まで保持）
const classificationCache = new Map<string, TaskQuadrantClassification>();
const MAX_CACHE_SIZE = 100;

// 分析済みタスクの永続化
const ANALYZED_TASKS_KEY = 'quadrant_analyzed_tasks';
const CACHE_STORAGE_KEY = 'quadrant_classification_cache';

// 永続化されたキャッシュをロード
const loadPersistedCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_STORAGE_KEY);
    if (cached) {
      const parsedCache = JSON.parse(cached);
      Object.entries(parsedCache).forEach(([key, value]) => {
        classificationCache.set(key, value as TaskQuadrantClassification);
      });
      console.log(`📦 ${classificationCache.size}件の分析済みタスクをキャッシュから復元`);
    }
  } catch (error) {
    console.error('キャッシュの復元に失敗:', error);
  }
};

// キャッシュを永続化
const persistCache = () => {
  try {
    const cacheObject: Record<string, TaskQuadrantClassification> = {};
    classificationCache.forEach((value, key) => {
      cacheObject[key] = value;
    });
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cacheObject));
  } catch (error) {
    console.error('キャッシュの永続化に失敗:', error);
  }
};

// キャッシュのクリーンアップ
const cleanupCache = () => {
  if (classificationCache.size > MAX_CACHE_SIZE) {
    const entriesToDelete = classificationCache.size - MAX_CACHE_SIZE;
    const keys = Array.from(classificationCache.keys());
    for (let i = 0; i < entriesToDelete; i++) {
      classificationCache.delete(keys[i]);
    }
  }
  persistCache();
};

// 初回ロード時にキャッシュを復元
loadPersistedCache();

// スリープ関数
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class QuadrantClassificationService {
  private static instance: QuadrantClassificationService | null = null;
  private lastRequestTime = 0;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;

  public static getInstance(): QuadrantClassificationService {
    if (!QuadrantClassificationService.instance) {
      QuadrantClassificationService.instance = new QuadrantClassificationService();
    }
    return QuadrantClassificationService.instance;
  }

  /**
   * キャッシュをクリア
   */
  public clearCache(): void {
    classificationCache.clear();
    localStorage.removeItem(CACHE_STORAGE_KEY);
    localStorage.removeItem(ANALYZED_TASKS_KEY);
    console.log('✅ 分類キャッシュと永続化データをクリアしました');
  }

  /**
   * レート制限を考慮した待機処理
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = (60 * 1000) / RATE_LIMIT.requestsPerMinute; // ミリ秒単位の最小間隔

    if (timeSinceLastRequest < minInterval) {
      const waitTime = minInterval - timeSinceLastRequest;
      await sleep(waitTime);
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * 単一タスクを4象限に分類（レート制限とリトライ対応）
   */
  /**
   * タスクのコンテンツハッシュを生成
   */
  private getTaskContentHash(task: UnifiedTaskData): string {
    // タスクの主要な内容を組み合わせてハッシュキーを生成
    const content = `${task.title}|${task.description || ''}|${task.priority || ''}|${task.deadline || ''}|${task.isCompleted}`;
    return content;
  }

  public async classifyTask(task: UnifiedTaskData): Promise<TaskQuadrantClassification> {
    // タスクの内容に基づくキャッシュキーを生成
    const contentHash = this.getTaskContentHash(task);
    const cacheKey = `${task.id}_${contentHash}`;

    // キャッシュチェック
    if (classificationCache.has(cacheKey)) {
      console.log(`📌 キャッシュヒット: タスク「${task.title}」の分析結果を再利用`);
      return classificationCache.get(cacheKey)!;
    }

    // 古いキーでもチェック（後方互換性）
    const oldCacheKey = `${task.id}_${task.updatedAt || task.createdAt}`;
    if (classificationCache.has(oldCacheKey)) {
      const cachedResult = classificationCache.get(oldCacheKey)!;
      // 新しいキーでも保存
      classificationCache.set(cacheKey, cachedResult);
      console.log(`📌 キャッシュヒット（旧形式）: タスク「${task.title}」の分析結果を再利用`);
      return cachedResult;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      if (ENV.isDev()) {
        console.warn('🚨 Gemini APIキーが設定されていません。ヒューリスティック分析を使用します。');
      }
      return this.fallbackClassification(task);
    }

    // リトライロジック
    let retryCount = 0;
    let lastError: any;

    while (retryCount <= RATE_LIMIT.maxRetries) {
      try {
        // レート制限の待機
        await this.waitForRateLimit();

        const prompt = this.createClassificationPrompt(task);

        const response = await axios.post(
          `${GEMINI_API_URL}?key=${apiKey}`,
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
            timeout: 30000, // 30秒のタイムアウト
          }
        );

        const generatedText = response.data.candidates[0].content.parts[0].text;
        const result = this.parseGeminiResponse(generatedText, task);

        // キャッシュに保存
        classificationCache.set(cacheKey, result);
        cleanupCache();

        return result;
      } catch (error: any) {
        lastError = error;

        // 429エラーの場合
        if (error.response?.status === 429) {
          retryCount++;
          if (retryCount <= RATE_LIMIT.maxRetries) {
            const delay = RATE_LIMIT.retryDelay * Math.pow(2, retryCount - 1); // 指数バックオフ
            console.warn(
              `⏳ レート制限に達しました。${delay / 1000}秒後にリトライします... (${retryCount}/${RATE_LIMIT.maxRetries})`
            );
            await sleep(delay);
            continue;
          }
        }

        // その他のエラーまたはリトライ上限に達した場合
        break;
      }
    }

    // エラーの詳細をログ
    if (lastError?.response?.status === 429) {
      console.warn('⚠️ Gemini APIのレート制限に達しました');
      console.log('💡 ヒューリスティック分析で代替します（十分な精度があります）');
    } else {
      console.error('Gemini API分類エラー:', lastError?.message || lastError);
    }

    const fallbackResult = this.fallbackClassification(task);

    // フォールバック結果もキャッシュに保存
    classificationCache.set(cacheKey, fallbackResult);

    return fallbackResult;
  }

  /**
   * 複数タスクをバッチで分類（レート制限対応）
   */
  public async classifyTasks(tasks: UnifiedTaskData[]): Promise<TaskQuadrantClassification[]> {
    console.log(`📊 ${tasks.length}個のタスクを分類開始...`);

    const results: TaskQuadrantClassification[] = [];
    let cachedCount = 0;
    let apiCallCount = 0;
    const tasksNeedingApiCall: UnifiedTaskData[] = [];

    // まずキャッシュをチェックして、API呼び出しが必要なタスクを特定
    for (const task of tasks) {
      const contentHash = this.getTaskContentHash(task);
      const cacheKey = `${task.id}_${contentHash}`;
      const oldCacheKey = `${task.id}_${task.updatedAt || task.createdAt}`;

      if (classificationCache.has(cacheKey) || classificationCache.has(oldCacheKey)) {
        // キャッシュから取得（classifyTaskメソッドが処理）
        const result = await this.classifyTask(task);
        results.push(result);
        cachedCount++;
      } else {
        // API呼び出しが必要
        tasksNeedingApiCall.push(task);
      }
    }

    // キャッシュヒット率を表示
    if (cachedCount > 0) {
      const hitRate = Math.round((cachedCount / tasks.length) * 100);
      console.log(`📌 キャッシュヒット率: ${hitRate}% (${cachedCount}/${tasks.length}件)`);
    }

    // API呼び出しが必要なタスクがある場合のみ処理
    if (tasksNeedingApiCall.length > 0) {
      console.log(`🚀 新規分析が必要なタスク: ${tasksNeedingApiCall.length}件`);

      // 初回待機
      console.log(`⏳ 初回リクエスト前に${RATE_LIMIT.initialDelay / 1000}秒待機...`);
      await sleep(RATE_LIMIT.initialDelay);

      // 順次処理（レート制限対策）
      for (let i = 0; i < tasksNeedingApiCall.length; i++) {
        const task = tasksNeedingApiCall[i];
        const taskNumber = i + 1;

        console.log(`🔄 新規タスク ${taskNumber}/${tasksNeedingApiCall.length} を分析中...`);

        try {
          const result = await this.classifyTask(task);
          results.push(result);
          apiCallCount++;
        } catch (error) {
          console.error(`タスク "${task.title}" の分類に失敗:`, error);
          const fallback = this.fallbackClassification(task);
          results.push(fallback);
        }

        // 次のタスクまで少し待機（最後のタスクでは待機しない）
        if (i < tasksNeedingApiCall.length - 1) {
          await sleep(1000); // 1秒待機
        }
      }
    }

    console.log(
      `✅ 分析完了: 合計${results.length}件（キャッシュ: ${cachedCount}件, 新規API: ${apiCallCount}件）`
    );

    // キャッシュを永続化
    persistCache();

    return results;
  }

  /**
   * 4象限分析を実行（レート制限対応）
   */
  public async analyzeQuadrants(tasks: UnifiedTaskData[]): Promise<QuadrantAnalysisResult> {
    // タスク数が多すぎる場合は制限
    const tasksToAnalyze = tasks.slice(0, RATE_LIMIT.maxTasksPerAnalysis);

    if (tasks.length > RATE_LIMIT.maxTasksPerAnalysis) {
      console.warn(
        `⚠️ タスク数が制限を超えています。最初の${RATE_LIMIT.maxTasksPerAnalysis}件のみを分析します。` +
          `（全${tasks.length}件中）`
      );
    }
    console.log('🎯 4象限分析を開始します...', { taskCount: tasksToAnalyze.length });

    const classifications = await this.classifyTasks(tasksToAnalyze);

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
  public convertToUnifiedTask(task: any): UnifiedTaskData | null {
    // null/undefinedチェック
    if (!task || typeof task !== 'object') {
      console.warn('🚨 無効なタスクデータを無視します:', task);
      return null;
    }

    const unified = {
      id: task._id || task.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: task.title || task.task || '無題のタスク',
      description: task.description || task.note || task.memo,
      deadline: task.deadline || task.dueDate,
      priority: task.priority,
      category: task.category,
      tags: task.tags,
      estimatedTime: task.estimatedTime || task.estimatedDuration,
      status: task.status,
      type: task.type,
      isCompleted: task.completed || task.isCompleted || task.status === 'completed',
      updatedAt: task.updatedAt,
      createdAt: task.createdAt,
    };

    return unified;
  }
}

export default QuadrantClassificationService;
