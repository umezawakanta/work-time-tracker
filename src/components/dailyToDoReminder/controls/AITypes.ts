/**
 * AI機能の型定義
 * AI関連コンポーネント間で共有される型定義
 */
import { RequestConfig } from './ApiTypes';

/**
 * AI強化タイプ
 * AIによるデータ処理の種類を定義
 */
export type AIEnhancementType =
    | 'query-optimization'  // クエリの最適化
    | 'data-enrichment'     // データの拡充
    | 'content-generation'  // コンテンツ生成
    | 'personalization'     // パーソナライズ
    | 'anomaly-detection'   // 異常検出
    | 'semantic-search'     // 意味的検索
    | 'trend-analysis'      // トレンド分析
    | 'smart-chunking'      // スマートチャンキング
    | 'entity-extraction'   // エンティティ抽出
    | 'summarization'       // 要約
    | 'sentiment-analysis'  // 感情分析
    | 'translation'         // 翻訳
    | 'code-generation';    // コード生成

/**
 * AI機能オプション
 * AI処理の動作をカスタマイズするオプション
 */
export interface AIFeatureOptions {
    model?: string;                        // 使用するAIモデル
    temperature?: number;                  // ランダム性（0.0〜1.0）
    maxTokens?: number;                    // 最大トークン数
    required?: boolean;                    // 必須機能かどうか
    context?: Record<string, unknown>;     // コンテキスト情報
    requestConfig?: RequestConfig;         // リクエスト設定
    enhancementType?: AIEnhancementType;   // 強化タイプ
    streaming?: boolean;                   // ストリーミング応答を使用するか
    timeout?: number;                      // タイムアウト（ミリ秒）
    fallbackModel?: string;                // フォールバックモデル
    customPrompt?: string;                 // カスタムプロンプト
    systemMessage?: string;                // システムメッセージ
}

/**
 * AIプロバイダー
 * サポートされているAIサービスプロバイダー
 */
export type AIProvider =
    | 'openai'
    | 'anthropic'
    | 'google'
    | 'huggingface'
    | 'azure'
    | 'local';

/**
 * AIモデル情報
 * 利用可能なAIモデルの詳細情報
 */
export interface AIModel {
    id: string;                      // モデルID
    name: string;                    // モデル名
    version: string;                 // バージョン
    contextWindow: number;           // コンテキストウィンドウサイズ
    maxTokens: number;               // 最大出力トークン数
    provider: AIProvider;            // プロバイダー
    capabilities: AIEnhancementType[]; // サポートする機能
    tokenCost: {                     // トークンコスト
        input: number;                   // 入力トークンあたりのコスト
        output: number;                  // 出力トークンあたりのコスト
    };
    priority: number;                // 優先度（高いほど優先）
    multimodal?: boolean;            // 複数モダリティ対応（画像等）
    requiresSubscription?: boolean;  // サブスクリプション必須か
    trainable?: boolean;             // 微調整可能か
    customizable?: boolean;          // カスタマイズ可能か
    responseFormat?: string[];       // サポートする応答形式
}

/**
 * AIモデル要約
 * 外部表示用の簡略化されたモデル情報
 */
export interface AIModelSummary {
    id: string;                      // モデルID
    name: string;                    // モデル名
    provider: AIProvider;            // プロバイダー
    capabilities: AIEnhancementType[]; // サポートする機能
    multimodal?: boolean;            // 複数モダリティ対応
    requiresSubscription?: boolean;  // サブスクリプション必須か
}

/**
 * AIプロバイダー設定
 * 各AIプロバイダーへの接続設定
 */
export interface AIProviderConfig {
    apiKey?: string;                // APIキー
    baseUrl?: string;               // ベースURL
    organization?: string;          // 組織ID
    options?: Record<string, any>;  // その他のオプション
}

/**
 * AI強化結果
 * AI処理の結果
 */
export interface AIEnhancementResult {
    data: unknown;                  // 強化されたデータ
    type: AIEnhancementType;        // 強化タイプ
    modelUsed: string;              // 使用されたモデル
    tokens: {                       // トークン使用量
        input: number;                  // 入力トークン数
        output: number;                 // 出力トークン数
        total: number;                  // 合計トークン数
    };
    duration: number;               // 処理時間（ミリ秒）
    timestamp: number;              // タイムスタンプ
    cached?: boolean;               // キャッシュからの結果か
    annotations?: any[];            // 付加情報（引用・参照など）
}

/**
 * AIプロセッサーインターフェイス
 * 各AIプロバイダーの処理を実装するインターフェイス
 */
export interface AIProcessor {
    process(
        data: unknown,
        model: AIModel,
        enhancementType: AIEnhancementType,
        options: AIFeatureOptions,
        providerConfig: AIProviderConfig
    ): Promise<{
        data: unknown;
        inputTokens: number;
        outputTokens: number;
    }>;
}

/**
 * トークン使用統計
 * AIの使用状況を記録する統計情報
 */
export interface AIUsageStats {
    requests: number;               // リクエスト数
    tokens: {                       // トークン使用量
        input: number;                  // 入力トークン数
        output: number;                 // 出力トークン数
        total: number;                  // 合計トークン数
    };
    processingTime: number;         // 処理時間（ミリ秒）
    lastUsage: number;              // 最終使用時間
    costEstimate: number;           // コスト見積もり
    modelsUsed: Record<string, {    // モデル別使用状況
        requests: number;               // リクエスト数
        tokens: number;                 // 合計トークン数
        cost: number;                   // コスト
    }>;
}