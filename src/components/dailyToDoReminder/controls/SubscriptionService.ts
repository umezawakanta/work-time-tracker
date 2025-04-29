/**
 * サブスクリプションサービス
 * ユーザーのサブスクリプション情報を管理するクラス
 */
import { ApiResponse } from './ApiTypes';
import ApiClient from './ApiClient';

/**
 * サブスクリプション状態の型定義
 */
export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'expired';

/**
 * サブスクリプションプランの型定義
 */
export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise';

/**
 * サブスクリプション情報の型定義
 */
export interface SubscriptionInfo {
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  paymentMethod?: string;
  features: string[];
  usage: {
    current: number;
    limit: number;
    unit: string;
  };
}

class SubscriptionService {
  private apiClient: ApiClient;
  private cachedInfo: SubscriptionInfo | null = null;
  private lastFetchTime = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分間キャッシュ

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  /**
   * サブスクリプション状態を取得
   */
  public getStatus(): SubscriptionStatus {
    return this.cachedInfo?.status || 'inactive';
  }

  /**
   * サブスクリプション情報を取得
   */
  public async getSubscriptionInfo(): Promise<SubscriptionInfo> {
    const now = Date.now();
    
    // キャッシュが有効期限内であれば使用
    if (this.cachedInfo && this.lastFetchTime > 0 && now - this.lastFetchTime < this.CACHE_TTL) {
      return this.cachedInfo;
    }
    
    try {
      // 最新のサブスクリプション情報を取得
      const response = await this.apiClient.fetch<SubscriptionInfo>(
        'subscription/info',
        { method: 'GET' },
        { cache: 'no-cache' }
      );
      
      if (response.success && response.data) {
        // キャッシュを更新
        this.cachedInfo = response.data;
        this.lastFetchTime = now;
        return response.data;
      }
      
      return this.getDefaultSubscriptionInfo();
    } catch (error) {
      console.error('サブスクリプション情報の取得に失敗しました', error);
      return this.getDefaultSubscriptionInfo();
    }
  }

  /**
   * サブスクリプションをアップグレード
   */
  public async upgrade(
    plan: SubscriptionPlan,
    paymentMethod?: string
  ): Promise<ApiResponse<SubscriptionInfo>> {
    try {
      const response = await this.apiClient.fetch<SubscriptionInfo>(
        'subscription/upgrade',
        {
          method: 'POST',
          body: JSON.stringify({
            plan,
            paymentMethod
          })
        }
      );
      
      if (response.success && response.data) {
        // キャッシュを更新
        this.cachedInfo = response.data;
        this.lastFetchTime = Date.now();
      } else {
        // キャッシュを無効化して次回強制的に更新
        this.invalidateCache();
      }
      
      return response;
    } catch (error) {
      console.error('サブスクリプションのアップグレードに失敗しました', error);
      this.invalidateCache();
      
      return {
        success: false,
        error: error instanceof Error ? error.message : '不明なエラーが発生しました',
        meta: {
          timestamp: Date.now()
        }
      };
    }
  }

  /**
   * サブスクリプションをダウングレード
   */
  public async downgrade(
    reason?: string
  ): Promise<ApiResponse<SubscriptionInfo>> {
    try {
      const response = await this.apiClient.fetch<SubscriptionInfo>(
        'subscription/downgrade',
        {
          method: 'POST',
          body: JSON.stringify({ reason })
        }
      );
      
      if (response.success && response.data) {
        // キャッシュを更新
        this.cachedInfo = response.data;
        this.lastFetchTime = Date.now();
      } else {
        // キャッシュを無効化して次回強制的に更新
        this.invalidateCache();
      }
      
      return response;
    } catch (error) {
      console.error('サブスクリプションのダウングレードに失敗しました', error);
      this.invalidateCache();
      
      return {
        success: false,
        error: error instanceof Error ? error.message : '不明なエラーが発生しました',
        meta: {
          timestamp: Date.now()
        }
      };
    }
  }

  /**
   * デフォルトのサブスクリプション情報を取得
   */
  private getDefaultSubscriptionInfo(): SubscriptionInfo {
    return {
      status: 'inactive',
      plan: 'free',
      startDate: new Date().toISOString(),
      autoRenew: false,
      features: ['基本機能'],
      usage: {
        current: 0,
        limit: 10,
        unit: '件'
      }
    };
  }

  /**
   * キャッシュを無効化
   */
  private invalidateCache(): void {
    this.lastFetchTime = 0;
    this.cachedInfo = null;
  }
}

export default SubscriptionService;