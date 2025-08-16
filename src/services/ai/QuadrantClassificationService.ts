// src/services/ai/QuadrantClassificationService.ts
import axios from 'axios';
import { Task } from '@/types/task';
import { Todo } from '@/types/todo';

// AI Provider Types
export type AIProvider = 'gemini' | 'claude' | 'openai' | 'ollama';

// API Configuration
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OLLAMA_API_URL = 'http://localhost:11434/api/chat';

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
      console.log('⚠️ ハードコーディングされたGemini APIキーを使用しています');
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

// Claude API キーの取得
const getClaudeApiKey = (): string => {
  let apiKey = '';

  // 方法1: ENVヘルパーを使用（両方のキー名をサポート）
  try {
    apiKey = ENV.CLAUDE_API_KEY?.() || ENV.ANTHROPIC_API_KEY?.() || '';
  } catch (e) {
    // 無視
  }

  // 方法2: import.meta.envから直接取得（両方のキー名をサポート）
  if (!apiKey) {
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        apiKey =
          import.meta.env.VITE_CLAUDE_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY || '';
      }
    } catch (e) {
      // 無視
    }
  }

  // 方法3: windowオブジェクトから取得（フォールバック）
  if (!apiKey && typeof window !== 'undefined') {
    try {
      apiKey =
        (window as any)?.import?.meta?.env?.VITE_CLAUDE_API_KEY ||
        (window as any)?.import?.meta?.env?.VITE_ANTHROPIC_API_KEY ||
        '';
    } catch (e) {
      // 無視
    }
  }

  // デバッグ情報を出力（開発環境のみ）
  if (ENV.isDev() && apiKey) {
    console.log('✅ Claude API Key: 設定済み');
    console.log('  - APIキー長さ:', apiKey.length, '文字');
  }

  return apiKey;
};

// OpenAI API キーの取得
const getOpenAIApiKey = (): string => {
  let apiKey = '';

  // 方法1: ENVヘルパーを使用
  try {
    apiKey = ENV.OPENAI_API_KEY?.() || '';
  } catch (e) {
    // 無視
  }

  // 方法2: import.meta.envから直接取得
  if (!apiKey) {
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
      }
    } catch (e) {
      // 無視
    }
  }

  // 方法3: windowオブジェクトから取得（フォールバック）
  if (!apiKey && typeof window !== 'undefined') {
    try {
      apiKey = (window as any)?.import?.meta?.env?.VITE_OPENAI_API_KEY || '';
    } catch (e) {
      // 無視
    }
  }

  // デバッグ情報を出力（開発環境のみ）
  if (ENV.isDev() && apiKey) {
    console.log('✅ OpenAI API Key: 設定済み');
    console.log('  - APIキー長さ:', apiKey.length, '文字');
  }

  return apiKey;
};

// Ollama設定の取得（APIキー不要、モデル名のみ）
const getOllamaModel = (): string => {
  // デフォルトモデル（日本語対応が良いモデル）
  const defaultModel = 'llama3.2:3b'; // または 'mistral', 'phi3', 'qwen2.5' など

  // 環境変数から取得を試みる
  let model = '';

  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      model = import.meta.env.VITE_OLLAMA_MODEL || '';
    }
  } catch (e) {
    // 無視
  }

  if (!model && typeof window !== 'undefined') {
    try {
      model = (window as any)?.import?.meta?.env?.VITE_OLLAMA_MODEL || '';
    } catch (e) {
      // 無視
    }
  }

  return model || defaultModel;
};

// Ollamaの接続確認
const checkOllamaConnection = async (): Promise<boolean> => {
  try {
    const response = await axios.get('http://localhost:11434/api/tags', {
      timeout: 5000,
    });
    return response.status === 200;
  } catch {
    return false;
  }
};

// API_KEYを遅延評価に変更
let _geminiApiKey: string | null = null;
let _claudeApiKey: string | null = null;
let _openaiApiKey: string | null = null;
let _ollamaModel: string | null = null;

const getApiKey = (provider: AIProvider = 'gemini'): string => {
  if (provider === 'claude') {
    if (_claudeApiKey === null) {
      _claudeApiKey = getClaudeApiKey();
    }
    return _claudeApiKey;
  } else if (provider === 'openai') {
    if (_openaiApiKey === null) {
      _openaiApiKey = getOpenAIApiKey();
    }
    return _openaiApiKey;
  } else if (provider === 'ollama') {
    // Ollamaはローカル実行のためAPIキー不要
    return 'local';
  } else {
    if (_geminiApiKey === null) {
      _geminiApiKey = getGeminiApiKey();
    }
    return _geminiApiKey;
  }
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
// レート制限の設定（プロバイダー別）
const RATE_LIMIT = {
  gemini: {
    requestsPerMinute: 5, // より厳しく制限
    retryDelay: 5000, // リトライ遅延を長めに
    maxRetries: 3,
    batchSize: 1,
    maxTasksPerAnalysis: 10, // タスク数を制限
    initialDelay: 2000, // 初期遅延を長めに
  },
  claude: {
    requestsPerMinute: 10,
    retryDelay: 3000,
    maxRetries: 3,
    batchSize: 1,
    maxTasksPerAnalysis: 20,
    initialDelay: 1000,
  },
  openai: {
    requestsPerMinute: 3, // OpenAIはより厳しい制限
    retryDelay: 5000, // 長めのリトライ遅延
    maxRetries: 5, // より多くのリトライ
    batchSize: 1,
    maxTasksPerAnalysis: 5, // 少なめのタスク数
    initialDelay: 2000, // 長めの初期遅延
  },
  ollama: {
    requestsPerMinute: 60, // ローカル実行なので制限緩め
    retryDelay: 1000,
    maxRetries: 3,
    batchSize: 1,
    maxTasksPerAnalysis: 50, // ローカルなので多めでOK
    initialDelay: 500,
  },
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
  private currentProvider: AIProvider = 'gemini';
  private originalProvider: AIProvider | null = null; // フォールバック前のプロバイダー
  private providerFailureCount: Map<AIProvider, number> = new Map();
  private providerLastFailureTime: Map<AIProvider, number> = new Map();
  private autoFallbackEnabled = true;

  public static getInstance(): QuadrantClassificationService {
    if (!QuadrantClassificationService.instance) {
      QuadrantClassificationService.instance = new QuadrantClassificationService();
    }
    return QuadrantClassificationService.instance;
  }

  /**
   * AIプロバイダーを設定
   */
  public setProvider(provider: AIProvider): void {
    this.currentProvider = provider;
    console.log(`🤖 AIプロバイダーを ${provider} に切り替えました`);

    // プロバイダー切り替え時にキャッシュをクリア（オプション）
    // this.clearCache();
  }

  /**
   * 現在のAIプロバイダーを取得
   */
  public getProvider(): AIProvider {
    return this.currentProvider;
  }

  /**
   * 利用可能なAIプロバイダーを取得
   */
  public async getAvailableProviders(): Promise<
    { provider: AIProvider; available: boolean; name: string }[]
  > {
    // Ollamaの接続状態を確認
    const ollamaAvailable = await checkOllamaConnection();

    return [
      {
        provider: 'gemini',
        available: !!getApiKey('gemini'),
        name: 'Google Gemini',
      },
      {
        provider: 'claude',
        available: !!getApiKey('claude'),
        name: 'Anthropic Claude',
      },
      {
        provider: 'openai',
        available: !!getApiKey('openai'),
        name: 'OpenAI GPT-4',
      },
      {
        provider: 'ollama',
        available: ollamaAvailable,
        name: 'ローカルLLM (Ollama)',
      },
    ];
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
   * 自動フォールバックの有効/無効を設定
   */
  public setAutoFallback(enabled: boolean): void {
    this.autoFallbackEnabled = enabled;
    console.log(`🔄 自動フォールバック: ${enabled ? '有効' : '無効'}`);
  }

  /**
   * 次の利用可能なプロバイダーを取得
   */
  private async getNextAvailableProvider(
    excludeProviders: AIProvider[] = []
  ): Promise<AIProvider | null> {
    const providers = await this.getAvailableProviders();
    const now = Date.now();
    const RECOVERY_TIME = 60000; // 1分後に再試行可能

    // 優先順位: Gemini > OpenAI > Ollama > Claude
    // 注意: ClaudeはCORS制限のためブラウザから直接呼び出せません
    const priorityOrder: AIProvider[] = ['gemini', 'openai', 'ollama', 'claude'];

    // ブラウザ環境でClaudeを除外
    const isInBrowser = typeof window !== 'undefined';
    const finalPriorityOrder = isInBrowser
      ? priorityOrder.filter((p) => p !== 'claude')
      : priorityOrder;

    for (const provider of finalPriorityOrder) {
      // 除外リストに含まれている場合はスキップ
      if (excludeProviders.includes(provider)) continue;

      // 現在のプロバイダーはスキップ
      if (provider === this.currentProvider) continue;

      // 利用可能性をチェック
      const providerInfo = providers.find((p) => p.provider === provider);
      if (!providerInfo || !providerInfo.available) continue;

      // 最近失敗したプロバイダーは一定時間スキップ
      const lastFailure = this.providerLastFailureTime.get(provider) || 0;
      if (now - lastFailure < RECOVERY_TIME) continue;

      return provider;
    }

    return null;
  }

  /**
   * プロバイダーの自動切り替え
   */
  private async fallbackToNextProvider(): Promise<boolean> {
    if (!this.autoFallbackEnabled) {
      console.log('⚠️ 自動フォールバックが無効です');
      return false;
    }

    const failedProvider = this.currentProvider;
    const nextProvider = await this.getNextAvailableProvider([failedProvider]);

    if (!nextProvider) {
      console.error('❌ 利用可能な代替プロバイダーがありません');
      return false;
    }

    // 元のプロバイダーを記憶（初回のみ）
    if (!this.originalProvider) {
      this.originalProvider = failedProvider;
    }

    // プロバイダーを切り替え
    this.currentProvider = nextProvider;

    console.log(`🔄 自動切り替え: ${failedProvider} → ${nextProvider}`);

    // UIに通知（動的インポートでtoastを使用）
    if (typeof window !== 'undefined') {
      import('sonner')
        .then(({ toast }) => {
          toast.warning(
            `レート制限のため ${this.getProviderDisplayName(failedProvider)} から ${this.getProviderDisplayName(nextProvider)} に自動切り替えしました`,
            { duration: 5000 }
          );
        })
        .catch(() => {
          // toast が利用できない場合は console.log のみ
          console.log(`⚠️ UI通知: ${failedProvider} → ${nextProvider} に自動切り替え`);
        });
    }

    return true;
  }

  /**
   * プロバイダーの表示名を取得
   */
  private getProviderDisplayName(provider: AIProvider): string {
    switch (provider) {
      case 'gemini':
        return 'Gemini';
      case 'claude':
        return 'Claude';
      case 'openai':
        return 'GPT-4';
      case 'ollama':
        return 'Ollama';
      default:
        return provider;
    }
  }

  /**
   * 元のプロバイダーに戻す
   */
  public async restoreOriginalProvider(): Promise<boolean> {
    if (!this.originalProvider) {
      console.log('ℹ️ 元のプロバイダーが記録されていません');
      return false;
    }

    const current = this.currentProvider;
    const original = this.originalProvider;

    // 元のプロバイダーが利用可能かチェック
    const providers = await this.getAvailableProviders();
    const originalProviderInfo = providers.find((p) => p.provider === original);

    if (!originalProviderInfo || !originalProviderInfo.available) {
      console.log(`⚠️ 元のプロバイダー ${original} はまだ利用できません`);
      return false;
    }

    // 最近失敗していないかチェック（5分経過後に復旧とみなす）
    const lastFailure = this.providerLastFailureTime.get(original) || 0;
    const now = Date.now();
    const RECOVERY_TIME = 300000; // 5分

    if (now - lastFailure < RECOVERY_TIME) {
      console.log(
        `⏳ 元のプロバイダー ${original} は回復待機中です（残り ${Math.ceil((RECOVERY_TIME - (now - lastFailure)) / 1000)}秒）`
      );
      return false;
    }

    // プロバイダーを元に戻す
    this.currentProvider = original;
    this.originalProvider = null;
    this.providerFailureCount.set(original, 0);

    console.log(`✅ プロバイダーを元に戻しました: ${current} → ${original}`);

    // UIに通知
    if (typeof window !== 'undefined') {
      import('sonner')
        .then(({ toast }) => {
          toast.success(
            `${this.getProviderDisplayName(original)} が復旧したため、元のプロバイダーに戻しました`,
            { duration: 5000 }
          );
        })
        .catch(() => {
          console.log(`✅ UI通知: ${original} に復旧`);
        });
    }

    return true;
  }

  /**
   * 現在のプロバイダー状態を取得
   */
  public getProviderStatus(): {
    current: AIProvider;
    original: AIProvider | null;
    isInFallback: boolean;
    failureCounts: Map<AIProvider, number>;
  } {
    return {
      current: this.currentProvider,
      original: this.originalProvider,
      isInFallback: this.originalProvider !== null,
      failureCounts: new Map(this.providerFailureCount),
    };
  }

  /**
   * タスクの期限を提案
   */
  public async suggestDeadline(task: {
    title: string;
    description?: string;
    priority?: number | string;
    type?: string;
    estimatedTime?: number;
  }): Promise<{ deadline: Date; reasoning: string; confidence: number }> {
    // ブラウザ環境でClaudeの場合はフォールバック
    const isInBrowser = typeof window !== 'undefined';
    if (isInBrowser && this.currentProvider === 'claude') {
      console.log(
        '⚠️ ClaudeはCORS制限のためブラウザから使用できません。ヒューリスティック分析を使用します。'
      );
      return this.fallbackDeadlineSuggestion(task);
    }

    const apiKey = getApiKey(this.currentProvider);
    if (!apiKey && this.currentProvider !== 'ollama') {
      // APIキーがない場合はヒューリスティックに期限を提案
      return this.fallbackDeadlineSuggestion(task);
    }

    // Ollamaの場合、接続確認
    if (this.currentProvider === 'ollama') {
      const isConnected = await checkOllamaConnection();
      if (!isConnected) {
        return this.fallbackDeadlineSuggestion(task);
      }
    }

    try {
      // レート制限の待機
      await this.waitForRateLimit();

      const prompt = this.createDeadlinePrompt(task);
      let generatedText: string;

      if (this.currentProvider === 'claude') {
        // Claude API コール
        const response = await axios.post(
          CLAUDE_API_URL,
          {
            model: 'claude-3-haiku-20240307',
            max_tokens: 500,
            temperature: 0.3,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
            },
            timeout: 15000,
          }
        );
        generatedText = response.data.content[0].text;
      } else if (this.currentProvider === 'openai') {
        // OpenAI API コール
        const response = await axios.post(
          OPENAI_API_URL,
          {
            model: 'gpt-4-turbo-preview',
            max_tokens: 500,
            temperature: 0.3,
            messages: [
              {
                role: 'system',
                content: 'あなたはタスク管理の専門家です。タスクの適切な期限を提案してください。',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            timeout: 15000,
          }
        );
        generatedText = response.data.choices[0].message.content;
      } else if (this.currentProvider === 'ollama') {
        // Ollama API コール
        if (_ollamaModel === null) {
          _ollamaModel = getOllamaModel();
        }

        const response = await axios.post(
          OLLAMA_API_URL,
          {
            model: _ollamaModel,
            messages: [
              {
                role: 'system',
                content: 'あなたはタスク管理の専門家です。タスクの適切な期限を提案してください。',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            stream: false,
            format: 'json',
            options: {
              temperature: 0.3,
              num_ctx: 2048,
              num_predict: 500,
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          }
        );
        generatedText = response.data.message.content;
      } else {
        // Gemini API コール
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
              maxOutputTokens: 500,
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 15000,
          }
        );
        generatedText = response.data.candidates[0].content.parts[0].text;
      }

      return this.parseDeadlineResponse(generatedText, task);
    } catch (error) {
      console.error('期限提案エラー:', error);
      return this.fallbackDeadlineSuggestion(task);
    }
  }

  /**
   * 期限提案プロンプトの作成
   */
  private createDeadlinePrompt(task: {
    title: string;
    description?: string;
    priority?: number | string;
    type?: string;
    estimatedTime?: number;
  }): string {
    const today = new Date();
    const todayStr = today.toLocaleDateString('ja-JP');
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][today.getDay()];

    return `
今日は${todayStr}（${dayOfWeek}）です。
以下のタスクに対して、適切な期限を提案してください。

タスク情報:
- タイトル: "${task.title}"
- 説明: "${task.description || 'なし'}"
- 優先度: ${task.priority || '中'}
- タイプ: ${task.type || '一般'}
- 推定作業時間: ${task.estimatedTime ? `${task.estimatedTime}分` : '不明'}

以下の要因を考慮して期限を設定してください：
1. タスクの複雑さと作業量
2. 優先度（高優先度は短め、低優先度は長め）
3. タスクのタイプ（バグ修正は緊急、計画タスクは余裕を持って）
4. 現実的な作業ペース（週末や祝日を考慮）
5. バッファ時間（予期せぬ問題への対処）

期限設定の目安：
- 緊急（バグ修正など）: 1-2日以内
- 高優先度: 3-5日以内
- 中優先度: 1-2週間以内
- 低優先度: 2-4週間以内
- 計画タスク: 1-3ヶ月以内

JSON形式で回答してください:
{
  "days_from_today": 期限までの日数（数値）,
  "reasoning": "期限設定の理由",
  "confidence": 0-1の確信度,
  "suggested_date": "YYYY-MM-DD形式の日付"
}
`;
  }

  /**
   * 期限提案応答の解析
   */
  private parseDeadlineResponse(
    response: string,
    task: any
  ): { deadline: Date; reasoning: string; confidence: number } {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        let deadline: Date;
        if (parsed.suggested_date) {
          deadline = new Date(parsed.suggested_date);
        } else if (parsed.days_from_today) {
          deadline = new Date();
          deadline.setDate(deadline.getDate() + parsed.days_from_today);
        } else {
          throw new Error('日付情報が不足');
        }

        // 週末の場合は翌営業日に調整
        const dayOfWeek = deadline.getDay();
        if (dayOfWeek === 0) {
          // 日曜日の場合、月曜日に
          deadline.setDate(deadline.getDate() + 1);
        } else if (dayOfWeek === 6) {
          // 土曜日の場合、月曜日に
          deadline.setDate(deadline.getDate() + 2);
        }

        return {
          deadline,
          reasoning: parsed.reasoning || '自動提案された期限です',
          confidence: parsed.confidence || 0.7,
        };
      }
    } catch (error) {
      console.error('期限応答解析エラー:', error);
    }

    return this.fallbackDeadlineSuggestion(task);
  }

  /**
   * フォールバック期限提案（ヒューリスティック）
   */
  private fallbackDeadlineSuggestion(task: {
    title: string;
    description?: string;
    priority?: number | string;
    type?: string;
    estimatedTime?: number;
  }): { deadline: Date; reasoning: string; confidence: number } {
    const deadline = new Date();
    let daysToAdd = 7; // デフォルト1週間
    let reasoning = 'デフォルト設定（1週間後）';

    // 優先度による調整
    const priority = typeof task.priority === 'number' ? task.priority : 3;
    if (priority <= 2) {
      daysToAdd = 3;
      reasoning = '高優先度のため3日後に設定';
    } else if (priority >= 4) {
      daysToAdd = 14;
      reasoning = '低優先度のため2週間後に設定';
    }

    // タスクタイプによる調整
    const title = task.title.toLowerCase();
    if (title.includes('バグ') || title.includes('修正') || title.includes('緊急')) {
      daysToAdd = Math.min(daysToAdd, 2);
      reasoning = '緊急性の高いタスクのため短期間で設定';
    } else if (title.includes('計画') || title.includes('検討') || title.includes('調査')) {
      daysToAdd = Math.max(daysToAdd, 14);
      reasoning = '計画・検討タスクのため余裕を持って設定';
    }

    // 作業時間による調整
    if (task.estimatedTime) {
      if (task.estimatedTime > 480) {
        // 8時間以上
        daysToAdd = Math.max(daysToAdd, 10);
        reasoning = '長時間の作業が必要なため余裕を持って設定';
      }
    }

    deadline.setDate(deadline.getDate() + daysToAdd);

    // 週末の場合は翌営業日に調整
    const dayOfWeek = deadline.getDay();
    if (dayOfWeek === 0) {
      deadline.setDate(deadline.getDate() + 1);
    } else if (dayOfWeek === 6) {
      deadline.setDate(deadline.getDate() + 2);
    }

    return {
      deadline,
      reasoning,
      confidence: 0.5,
    };
  }

  /**
   * タスクのタイプを提案
   */
  public async suggestTaskType(task: {
    title: string;
    description?: string;
    priority?: number | string;
    currentType?: string;
  }): Promise<{ type: string; reasoning: string; confidence: number }> {
    // ブラウザ環境でClaudeの場合はフォールバック
    const isInBrowser = typeof window !== 'undefined';
    if (isInBrowser && this.currentProvider === 'claude') {
      console.log(
        '⚠️ ClaudeはCORS制限のためブラウザから使用できません。ヒューリスティック分析を使用します。'
      );
      return this.fallbackTypeSuggestion(task);
    }

    const apiKey = getApiKey(this.currentProvider);
    if (!apiKey && this.currentProvider !== 'ollama') {
      // APIキーがない場合はヒューリスティックにタイプを提案
      return this.fallbackTypeSuggestion(task);
    }

    // Ollamaの場合、接続確認
    if (this.currentProvider === 'ollama') {
      const isConnected = await checkOllamaConnection();
      if (!isConnected) {
        return this.fallbackTypeSuggestion(task);
      }
    }

    try {
      // レート制限の待機
      await this.waitForRateLimit();

      const prompt = this.createTypePrompt(task);
      let generatedText: string;

      if (this.currentProvider === 'claude') {
        // Claude API コール
        const response = await axios.post(
          CLAUDE_API_URL,
          {
            model: 'claude-3-haiku-20240307',
            max_tokens: 300,
            temperature: 0.3,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
            },
            timeout: 10000,
          }
        );
        generatedText = response.data.content[0].text;
      } else if (this.currentProvider === 'openai') {
        // OpenAI API コール
        const response = await axios.post(
          OPENAI_API_URL,
          {
            model: 'gpt-4-turbo-preview',
            max_tokens: 300,
            temperature: 0.3,
            messages: [
              {
                role: 'system',
                content: 'あなたはタスク管理の専門家です。タスクのタイプを適切に分類してください。',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            timeout: 10000,
          }
        );
        generatedText = response.data.choices[0].message.content;
      } else if (this.currentProvider === 'ollama') {
        // Ollama API コール
        if (_ollamaModel === null) {
          _ollamaModel = getOllamaModel();
        }

        const response = await axios.post(
          OLLAMA_API_URL,
          {
            model: _ollamaModel,
            messages: [
              {
                role: 'system',
                content: 'あなたはタスク管理の専門家です。タスクのタイプを適切に分類してください。',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            stream: false,
            format: 'json',
            options: {
              temperature: 0.3,
              num_ctx: 2048,
              num_predict: 300,
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 20000,
          }
        );
        generatedText = response.data.message.content;
      } else {
        // Gemini API コール
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
              maxOutputTokens: 300,
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );
        generatedText = response.data.candidates[0].content.parts[0].text;
      }

      return this.parseTypeResponse(generatedText, task);
    } catch (error) {
      console.error('タイプ提案エラー:', error);
      return this.fallbackTypeSuggestion(task);
    }
  }

  /**
   * タイプ提案プロンプトの作成
   */
  private createTypePrompt(task: {
    title: string;
    description?: string;
    priority?: number | string;
    currentType?: string;
  }): string {
    return `
以下のタスクに対して、最も適切なタイプを提案してください。

タスク情報:
- タイトル: "${task.title}"
- 説明: "${task.description || 'なし'}"
- 優先度: ${task.priority || '中'}
- 現在のタイプ: ${task.currentType || '未設定'}

利用可能なタイプ:
- personal: 個人的なタスク（家事、趣味、プライベートな予定など）
- work: 仕事関連のタスク（業務、会議、プロジェクトなど）
- study: 学習・勉強関連のタスク（講座、資格、スキルアップなど）
- health: 健康・運動関連のタスク（運動、通院、健康管理など）
- other: その他のタスク（上記に当てはまらないもの）

タスクの内容を分析して、以下の基準で判断してください：
1. タイトルや説明に含まれるキーワード
2. タスクの性質（個人的、仕事、学習、健康など）
3. 優先度との整合性

JSON形式で回答してください:
{
  "type": "選択したタイプ（personal/work/study/health/other）",
  "reasoning": "タイプ選択の理由",
  "confidence": 0-1の確信度
}
`;
  }

  /**
   * タイプ提案応答の解析
   */
  private parseTypeResponse(
    response: string,
    task: any
  ): { type: string; reasoning: string; confidence: number } {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // タイプの検証
        const validTypes = ['personal', 'work', 'study', 'health', 'other'];
        const type = validTypes.includes(parsed.type) ? parsed.type : 'other';

        return {
          type,
          reasoning: parsed.reasoning || '自動提案されたタイプです',
          confidence: parsed.confidence || 0.7,
        };
      }
    } catch (error) {
      console.error('タイプ応答解析エラー:', error);
    }

    return this.fallbackTypeSuggestion(task);
  }

  /**
   * タスクの優先度を提案
   */
  public async suggestPriority(task: {
    title: string;
    description?: string;
    type?: string;
    deadline?: string;
  }): Promise<{ priority: number; reasoning: string; confidence: number }> {
    // ブラウザ環境でClaudeの場合はフォールバック
    const isInBrowser = typeof window !== 'undefined';
    if (isInBrowser && this.currentProvider === 'claude') {
      console.log(
        '⚠️ ClaudeはCORS制限のためブラウザから使用できません。ヒューリスティック分析を使用します。'
      );
      return this.fallbackPrioritySuggestion(task);
    }

    const apiKey = getApiKey(this.currentProvider);
    if (!apiKey && this.currentProvider !== 'ollama') {
      return this.fallbackPrioritySuggestion(task);
    }

    // Ollamaの場合、接続確認
    if (this.currentProvider === 'ollama') {
      const isConnected = await checkOllamaConnection();
      if (!isConnected) {
        return this.fallbackPrioritySuggestion(task);
      }
    }

    try {
      // レート制限の待機
      await this.waitForRateLimit();

      const prompt = this.createPriorityPrompt(task);
      let generatedText: string;

      if (this.currentProvider === 'claude') {
        // Claude API コール
        const response = await axios.post(
          CLAUDE_API_URL,
          {
            model: 'claude-3-haiku-20240307',
            max_tokens: 300,
            temperature: 0.3,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
            },
            timeout: 10000,
          }
        );
        generatedText = response.data.content[0].text;
      } else if (this.currentProvider === 'openai') {
        // OpenAI API コール
        const response = await axios.post(
          OPENAI_API_URL,
          {
            model: 'gpt-4-turbo-preview',
            max_tokens: 300,
            temperature: 0.3,
            messages: [
              {
                role: 'system',
                content: 'あなたはタスク管理の専門家です。タスクの優先度を適切に判定してください。',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            timeout: 10000,
          }
        );
        generatedText = response.data.choices[0].message.content;
      } else if (this.currentProvider === 'ollama') {
        // Ollama API コール
        if (_ollamaModel === null) {
          _ollamaModel = getOllamaModel();
        }

        const response = await axios.post(
          OLLAMA_API_URL,
          {
            model: _ollamaModel,
            messages: [
              {
                role: 'system',
                content: 'あなたはタスク管理の専門家です。タスクの優先度を適切に判定してください。',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            stream: false,
            format: 'json',
            options: {
              temperature: 0.3,
              num_ctx: 2048,
              num_predict: 300,
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 20000,
          }
        );
        generatedText = response.data.message.content;
      } else {
        // Gemini API コール
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
              maxOutputTokens: 300,
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );
        generatedText = response.data.candidates[0].content.parts[0].text;
      }

      return this.parsePriorityResponse(generatedText, task);
    } catch (error) {
      console.error('優先度提案エラー:', error);
      return this.fallbackPrioritySuggestion(task);
    }
  }

  /**
   * 優先度提案プロンプトの作成
   */
  private createPriorityPrompt(task: {
    title: string;
    description?: string;
    type?: string;
    deadline?: string;
  }): string {
    const deadlineInfo = task.deadline
      ? `期限: ${new Date(task.deadline).toLocaleDateString('ja-JP')}`
      : '期限: 未設定';

    return `
以下のタスクに対して、最も適切な優先度を提案してください。

タスク情報:
- タイトル: "${task.title}"
- 説明: "${task.description || 'なし'}"
- タイプ: ${task.type || '未設定'}
- ${deadlineInfo}

優先度レベル（1-5）:
- 5: 最優先（緊急かつ重要、即座に対応が必要）
- 4: 高優先（重要度が高く、早めの対応が必要）
- 3: 中優先（通常のタスク、標準的な対応）
- 2: 低優先（重要度は低いが、いずれ対応が必要）
- 1: 最低優先（余裕があるときに対応）

以下の基準で判断してください：
1. タスクの緊急性（期限との関係）
2. タスクの重要性（影響範囲、ビジネスインパクト）
3. タスクのタイプ（仕事関連は高め、個人的なものは調整）
4. キーワード（「緊急」「重要」「ASAP」などの有無）

JSON形式で回答してください:
{
  "priority": 1-5の数値,
  "reasoning": "優先度判定の理由",
  "confidence": 0-1の確信度
}
`;
  }

  /**
   * 優先度提案応答の解析
   */
  private parsePriorityResponse(
    response: string,
    task: any
  ): { priority: number; reasoning: string; confidence: number } {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // 優先度の検証（1-5の範囲）
        const priority = Math.max(1, Math.min(5, parsed.priority || 3));

        return {
          priority,
          reasoning: parsed.reasoning || '自動提案された優先度です',
          confidence: parsed.confidence || 0.7,
        };
      }
    } catch (error) {
      console.error('優先度応答解析エラー:', error);
    }

    return this.fallbackPrioritySuggestion(task);
  }

  /**
   * すべての項目（タイプ、優先度、期限）を一度に提案
   */
  public async suggestAllFields(task: { title: string; description?: string }): Promise<{
    type: string;
    priority: number;
    deadline: Date;
    reasoning: {
      type: string;
      priority: string;
      deadline: string;
    };
    confidence: number;
  }> {
    try {
      // 並行して3つの提案を実行
      const [typeResult, priorityResult, deadlineResult] = await Promise.all([
        this.suggestTaskType({
          title: task.title,
          description: task.description,
        }),
        this.suggestPriority({
          title: task.title,
          description: task.description,
        }),
        this.suggestDeadline({
          title: task.title,
          description: task.description,
        }),
      ]);

      // 総合的な確信度を計算
      const overallConfidence =
        (typeResult.confidence + priorityResult.confidence + deadlineResult.confidence) / 3;

      return {
        type: typeResult.type,
        priority: priorityResult.priority,
        deadline: deadlineResult.deadline,
        reasoning: {
          type: typeResult.reasoning,
          priority: priorityResult.reasoning,
          deadline: deadlineResult.reasoning,
        },
        confidence: overallConfidence,
      };
    } catch (error) {
      console.error('総合提案エラー:', error);

      // フォールバック
      const typeResult = this.fallbackTypeSuggestion(task);
      const priorityResult = this.fallbackPrioritySuggestion(task);
      const deadlineResult = this.fallbackDeadlineSuggestion(task);

      return {
        type: typeResult.type,
        priority: priorityResult.priority,
        deadline: deadlineResult.deadline,
        reasoning: {
          type: typeResult.reasoning,
          priority: priorityResult.reasoning,
          deadline: deadlineResult.reasoning,
        },
        confidence: 0.5,
      };
    }
  }

  /**
   * フォールバック優先度提案（ヒューリスティック）
   */
  private fallbackPrioritySuggestion(task: {
    title: string;
    description?: string;
    type?: string;
    deadline?: string;
  }): { priority: number; reasoning: string; confidence: number } {
    const text = `${task.title} ${task.description || ''}`.toLowerCase();
    let priority = 3; // デフォルト中優先
    let reasoning = '標準的なタスクとして中優先に設定';
    let confidence = 0.5;

    // 緊急性キーワード
    const urgentKeywords = ['緊急', '至急', '今すぐ', 'asap', 'urgent', '即座', '即日'];
    const importantKeywords = ['重要', '必須', 'critical', 'important', 'must', '必ず'];
    const lowKeywords = ['いつか', '時間があれば', '余裕', '検討', '将来'];

    // キーワードチェック
    const hasUrgent = urgentKeywords.some((k) => text.includes(k));
    const hasImportant = importantKeywords.some((k) => text.includes(k));
    const hasLow = lowKeywords.some((k) => text.includes(k));

    // 期限による調整
    if (task.deadline) {
      const deadline = new Date(task.deadline);
      const today = new Date();
      const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil <= 1) {
        priority = Math.max(priority, 4);
        reasoning = '期限が迫っているため高優先度に設定';
        confidence = 0.8;
      } else if (daysUntil <= 3) {
        priority = Math.max(priority, 3);
        reasoning = '期限が近いため中優先度以上に設定';
        confidence = 0.7;
      }
    }

    // キーワードによる調整
    if (hasUrgent && hasImportant) {
      priority = 5;
      reasoning = '緊急かつ重要なタスクのため最優先に設定';
      confidence = 0.9;
    } else if (hasUrgent || hasImportant) {
      priority = Math.max(priority, 4);
      reasoning = hasUrgent ? '緊急性が高いため高優先度に設定' : '重要度が高いため高優先度に設定';
      confidence = 0.8;
    } else if (hasLow) {
      priority = Math.min(priority, 2);
      reasoning = '余裕を持って対応可能なため低優先度に設定';
      confidence = 0.7;
    }

    // タスクタイプによる調整
    if (task.type === 'work') {
      priority = Math.max(priority, 3);
      if (priority === 3) reasoning = '仕事関連のため標準優先度に設定';
    }

    return {
      priority,
      reasoning,
      confidence,
    };
  }

  /**
   * フォールバックタイプ提案（ヒューリスティック）
   */
  private fallbackTypeSuggestion(task: {
    title: string;
    description?: string;
    priority?: number | string;
    currentType?: string;
  }): { type: string; reasoning: string; confidence: number } {
    const text = `${task.title} ${task.description || ''}`.toLowerCase();
    let type = 'other';
    let reasoning = 'キーワードマッチングによる自動分類';
    let confidence = 0.5;

    // 仕事関連のキーワード
    const workKeywords = [
      '会議',
      'ミーティング',
      '資料',
      '報告',
      'プレゼン',
      '業務',
      '仕事',
      'プロジェクト',
      '納期',
      'クライアント',
      '顧客',
      '提案',
      '見積',
      '契約',
      '営業',
      '開発',
      'meeting',
      'report',
      'presentation',
      'project',
      'client',
    ];

    // 個人的なキーワード
    const personalKeywords = [
      '買い物',
      '掃除',
      '洗濯',
      '料理',
      '家事',
      '家族',
      '友達',
      '趣味',
      '遊び',
      'ゲーム',
      '映画',
      '読書',
      'shopping',
      'cleaning',
      'family',
      'friend',
      'hobby',
    ];

    // 学習関連のキーワード
    const studyKeywords = [
      '勉強',
      '学習',
      '講座',
      '資格',
      'スキル',
      '研修',
      '本',
      '教材',
      '試験',
      'テスト',
      '練習',
      '復習',
      'study',
      'learn',
      'course',
      'skill',
      'exam',
      'test',
    ];

    // 健康関連のキーワード
    const healthKeywords = [
      '運動',
      'ジム',
      'ランニング',
      '散歩',
      '病院',
      '通院',
      '薬',
      '健康',
      'ダイエット',
      '体重',
      '睡眠',
      '休息',
      'exercise',
      'gym',
      'running',
      'hospital',
      'health',
      'diet',
    ];

    // キーワードマッチング
    const workMatches = workKeywords.filter((k) => text.includes(k)).length;
    const personalMatches = personalKeywords.filter((k) => text.includes(k)).length;
    const studyMatches = studyKeywords.filter((k) => text.includes(k)).length;
    const healthMatches = healthKeywords.filter((k) => text.includes(k)).length;

    // 最も多くマッチしたタイプを選択
    const matches = [
      { type: 'work', count: workMatches },
      { type: 'personal', count: personalMatches },
      { type: 'study', count: studyMatches },
      { type: 'health', count: healthMatches },
    ];

    const topMatch = matches.reduce((max, item) => (item.count > max.count ? item : max));

    if (topMatch.count > 0) {
      type = topMatch.type;
      confidence = Math.min(0.9, 0.5 + topMatch.count * 0.2);
      reasoning = `"${task.title}"に含まれるキーワードから${type}タスクと判断`;
    }

    return {
      type,
      reasoning,
      confidence,
    };
  }

  /**
   * 現在のプロバイダーの設定を取得
   */
  private getRateLimitConfig() {
    return RATE_LIMIT[this.currentProvider] || RATE_LIMIT.gemini;
  }

  /**
   * レート制限を考慮した待機処理
   */
  private async waitForRateLimit(): Promise<void> {
    const config = this.getRateLimitConfig();
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = (60 * 1000) / config.requestsPerMinute; // ミリ秒単位の最小間隔

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

    // ブラウザ環境でClaudeの場合はフォールバック
    const isInBrowser = typeof window !== 'undefined';
    if (isInBrowser && this.currentProvider === 'claude') {
      console.log(
        '⚠️ ClaudeはCORS制限のためブラウザから使用できません。ヒューリスティック分析を使用します。'
      );
      return this.fallbackClassification(task);
    }

    const apiKey = getApiKey(this.currentProvider);
    if (!apiKey && this.currentProvider !== 'ollama') {
      if (ENV.isDev()) {
        console.warn(
          `🚨 ${this.currentProvider.toUpperCase()} APIキーが設定されていません。ヒューリスティック分析を使用します。`
        );
      }
      return this.fallbackClassification(task);
    }

    // Ollamaの場合、接続確認
    if (this.currentProvider === 'ollama') {
      const isConnected = await checkOllamaConnection();
      if (!isConnected) {
        console.warn('🚨 Ollamaサーバーに接続できません。ヒューリスティック分析を使用します。');
        return this.fallbackClassification(task);
      }
    }

    // リトライロジック
    const config = this.getRateLimitConfig();
    let retryCount = 0;
    let lastError: any;

    while (retryCount <= config.maxRetries) {
      try {
        // レート制限の待機
        await this.waitForRateLimit();

        const prompt = this.createClassificationPrompt(task);
        let generatedText: string;

        if (this.currentProvider === 'claude') {
          // Claude API コール
          const response = await axios.post(
            CLAUDE_API_URL,
            {
              model: 'claude-3-haiku-20240307', // より高速で低コストなモデル
              max_tokens: 1500,
              temperature: 0.3,
              messages: [
                {
                  role: 'user',
                  content: prompt,
                },
              ],
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
              },
              timeout: 30000, // 30秒のタイムアウト
            }
          );

          generatedText = response.data.content[0].text;
        } else if (this.currentProvider === 'openai') {
          // OpenAI API コール
          const response = await axios.post(
            OPENAI_API_URL,
            {
              model: 'gpt-4-turbo-preview', // GPT-4 Turbo（高速・低コスト版）
              max_tokens: 1500,
              temperature: 0.3,
              messages: [
                {
                  role: 'system',
                  content:
                    'あなたはタスク管理の専門家です。タスクをアイゼンハワーマトリックスの4象限に分類し、JSON形式で回答してください。',
                },
                {
                  role: 'user',
                  content: prompt,
                },
              ],
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
              },
              timeout: 30000, // 30秒のタイムアウト
            }
          );

          generatedText = response.data.choices[0].message.content;
        } else if (this.currentProvider === 'ollama') {
          // Ollama API コール
          if (_ollamaModel === null) {
            _ollamaModel = getOllamaModel();
          }

          const response = await axios.post(
            OLLAMA_API_URL,
            {
              model: _ollamaModel,
              messages: [
                {
                  role: 'system',
                  content:
                    'あなたはタスク管理の専門家です。タスクをアイゼンハワーマトリックスの4象限に分類し、JSON形式で回答してください。',
                },
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              stream: false,
              format: 'json',
              options: {
                temperature: 0.3,
                num_ctx: 4096, // コンテキストウィンドウ
                num_predict: 1500, // 最大出力トークン数
              },
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
              timeout: 60000, // 60秒のタイムアウト（ローカル実行のため長め）
            }
          );

          generatedText = response.data.message.content;
        } else {
          // Gemini API コール
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

          generatedText = response.data.candidates[0].content.parts[0].text;
        }

        const result = this.parseAIResponse(generatedText, task);

        // キャッシュに保存
        classificationCache.set(cacheKey, result);
        cleanupCache();

        // 成功したら失敗カウントをリセット
        if (this.providerFailureCount.get(this.currentProvider)) {
          this.providerFailureCount.set(this.currentProvider, 0);
          console.log(`✅ ${this.currentProvider} のレート制限カウントをリセット`);
        }

        return result;
      } catch (error: any) {
        lastError = error;

        // 429エラーの場合
        if (error.response?.status === 429) {
          // 失敗回数を記録
          const failureCount = (this.providerFailureCount.get(this.currentProvider) || 0) + 1;
          this.providerFailureCount.set(this.currentProvider, failureCount);
          this.providerLastFailureTime.set(this.currentProvider, Date.now());

          // 3回連続で失敗したら自動切り替え
          if (failureCount >= 3 && this.autoFallbackEnabled) {
            console.log(`⚠️ ${this.currentProvider} で連続3回レート制限に達しました`);
            const switched = await this.fallbackToNextProvider();

            if (switched) {
              // 新しいプロバイダーで再試行
              console.log(`🔄 新しいプロバイダーで再試行します`);
              this.providerFailureCount.set(this.currentProvider, 0); // 新プロバイダーのカウントをリセット
              continue; // 新しいプロバイダーで最初から試行
            }
          }

          retryCount++;
          if (retryCount <= config.maxRetries) {
            const delay = config.retryDelay * Math.pow(2, retryCount - 1); // 指数バックオフ
            console.warn(
              `⏳ レート制限に達しました。${delay / 1000}秒後にリトライします... (${retryCount}/${config.maxRetries})`
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
      console.warn(`⚠️ ${this.currentProvider.toUpperCase()} APIのレート制限に達しました`);
      console.log('💡 ヒューリスティック分析で代替します（十分な精度があります）');
    } else {
      console.error(
        `${this.currentProvider.toUpperCase()} API分類エラー:`,
        lastError?.message || lastError
      );
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

    const config = this.getRateLimitConfig();
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
      console.log(`⏳ 初回リクエスト前に${config.initialDelay / 1000}秒待機...`);
      await sleep(config.initialDelay);

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
    const config = this.getRateLimitConfig();

    // タスク数が多すぎる場合は制限
    const tasksToAnalyze = tasks.slice(0, config.maxTasksPerAnalysis);

    if (tasks.length > config.maxTasksPerAnalysis) {
      console.warn(
        `⚠️ タスク数が制限を超えています。最初の${config.maxTasksPerAnalysis}件のみを分析します。` +
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
   * AI応答の解析（Gemini/Claude共通）
   */
  private parseAIResponse(response: string, task: UnifiedTaskData): TaskQuadrantClassification {
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
      console.error('AI応答解析エラー:', error);
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
