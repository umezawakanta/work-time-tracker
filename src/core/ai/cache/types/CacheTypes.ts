/**
 * キャッシュ関連の型定義
 */
import { AIEnhancementType } from '../../types/AITypes';

/**
 * キャッシュステータス情報
 */
export interface CacheStatus {
  enabled: boolean;
  size: number;
  hitRate: number;
  oldestEntry: number | null;
  newestEntry: number | null;
  memoryUsage?: {
    bytes: number;
    percentage: number;
  };
  efficiency?: {
    savingsPercentage: number;
    costSaved: number;
  };
}

/**
 * キャッシュエントリインターフェース
 */
export interface CacheEntry {
  key: string;
  data: unknown;
  type: AIEnhancementType;
  timestamp: number;
  expiresAt: number | null;
  priority?: number; // 優先度（高いほど優先）
  lastAccessed?: number; // 最後にアクセスされた時間
  accessCount?: number; // アクセス回数
  size?: number; // 推定サイズ（バイト）
  tags?: string[]; // カテゴリータグ
  userId?: string; // ユーザーID（サブスクリプション関連）
}

/**
 * キャッシュ統計情報
 */
export interface CacheStats {
  hitCount: number;
  missCount: number;
  lastCleanup: number;
  created: number; // 作成時間（必須フィールド）
  updated?: number; // 最終更新時間
  byType?: Record<
    string,
    {
      hits: number;
      misses: number;
      ratio: number;
    }
  >;
  byUserId?: Record<
    string,
    {
      hits: number;
      misses: number;
      items: number;
    }
  >;
  estimatedSize?: number; // 推定合計サイズ（バイト）
}

/**
 * キャッシュ設定インターフェース
 */
export interface CacheConfig {
  enabled: boolean;
  maxSize: number; // エントリ数の最大値
  maxMemoryMB?: number; // 最大メモリ使用量（MB）
  defaultTTL: number; // デフォルトの有効期限（ミリ秒）
  cleanupInterval: number; // クリーンアップ間隔（ミリ秒）
  priorityBased?: boolean; // 優先度ベースのキャッシュ
  adaptiveTTL?: boolean; // アクセス頻度に基づく自動TTL調整
  distributedCache?: {
    // 分散キャッシュの設定
    enabled: boolean;
    endpoint?: string;
    syncInterval?: number;
  };
  encryption?: {
    // データ暗号化の設定
    enabled: boolean;
    keyId?: string;
  };
  compressionThreshold?: number; // 圧縮を行うサイズの閾値（バイト）
  premiumFeatures?: {
    // 有料サブスクリプション用機能
    enabled: boolean;
    requiredPlan: 'basic' | 'premium' | 'enterprise';
  };
  metrics?: {
    // メトリクス収集の設定
    enabled: boolean;
    detailed: boolean;
    endpoint?: string;
  };
}

/**
 * キャッシュエントリ優先度
 */
export enum CachePriority {
  LOW = 0,
  NORMAL = 5,
  HIGH = 10,
  CRITICAL = 20,
}

/**
 * サブスクリプションプラン
 */
export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

/**
 * プラン制限設定
 */
export interface PlanLimits {
  maxSize: number;
  maxTTL: number;
  features: {
    priorityCache: boolean;
    distributedCache: boolean;
    encryption: boolean;
    analytics: boolean;
  };
}

/**
 * キャッシュ分析結果
 */
export interface CacheAnalytics {
  efficiency: number; // 0-100%
  savings: {
    time: number; // ミリ秒
    cost: number; // 推定コスト削減額
    apiCalls: number; // 削減されたAPI呼び出し数
  };
  recommendations: string[];
  hotEntries: Array<{
    type: AIEnhancementType;
    accessCount: number;
    hitRate: number;
  }>;
}
