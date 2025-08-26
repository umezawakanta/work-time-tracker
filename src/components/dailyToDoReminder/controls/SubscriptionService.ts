/**
 * サブスクリプションサービス
 * ユーザーのサブスクリプション情報を管理するクラス
 */
import { ApiResponse, ApiServiceConfig } from './ApiTypes';
import ApiClient from './ApiClient';

/**
 * サブスクリプション状態の型定義
 */
export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'expired' | 'cancelled';

/**
 * サブスクリプションプランの型定義
 */
export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise';

/**
 * サブスクリプション情報の型定義
 */
export interface SubscriptionInfo {
  id: string;
  name: string;
  features: string[];
  price: number;
  billing: 'monthly' | 'yearly';
  status?: SubscriptionStatus;
}

export class SubscriptionService {
  private apiClient: ApiClient;
  private cachedInfo: SubscriptionInfo | null = null;
  private lastFetchTime = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分間キャッシュ

  constructor() {
    const config: ApiServiceConfig = {
      baseURL:
        (typeof process !== 'undefined' ? (process as any).env?.VITE_API_BASE_URL : undefined) ||
        'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    this.apiClient = new ApiClient(config);
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
  public async getSubscriptionInfo(): Promise<ApiResponse<SubscriptionInfo>> {
    try {
      const response = await this.apiClient.get<SubscriptionInfo>('/subscription/info');
      return this.createSuccessResponse(response.data);
    } catch {
      return this.createErrorResponse('Failed to get subscription info');
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
      const response = await this.apiClient.fetch<SubscriptionInfo>('subscription/upgrade', {
        method: 'POST',
        body: JSON.stringify({ plan, paymentMethod }),
      });

      if (response.success && response.data) {
        this.cachedInfo = response.data;
        this.lastFetchTime = Date.now();
        return this.createSuccessResponse(response.data);
      } else {
        this.invalidateCache();
        return this.createErrorResponse('Upgrade failed');
      }
    } catch (error) {
      console.error('サブスクリプションのアップグレードに失敗しました', error);
      this.invalidateCache();

      return {
        data: {} as SubscriptionInfo,
        success: false,
        error: {
          code: 'ERROR',
          message: error instanceof Error ? error.message : '不明なエラーが発生しました',
        },
        meta: {
          timestamp: Date.now(),
        },
      };
    }
  }

  /**
   * サブスクリプションをダウングレード
   */
  public async downgrade(reason?: string): Promise<ApiResponse<SubscriptionInfo>> {
    try {
      const response = await this.apiClient.fetch<SubscriptionInfo>('subscription/downgrade', {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });

      if (response.success && response.data) {
        this.cachedInfo = response.data;
        this.lastFetchTime = Date.now();
        return this.createSuccessResponse(response.data);
      } else {
        this.invalidateCache();
        return this.createErrorResponse('Downgrade failed');
      }
    } catch (error) {
      console.error('サブスクリプションのダウングレードに失敗しました', error);
      this.invalidateCache();

      return {
        data: {} as SubscriptionInfo,
        success: false,
        error: {
          code: 'ERROR',
          message: error instanceof Error ? error.message : '不明なエラーが発生しました',
        },
        meta: {
          timestamp: Date.now(),
        },
      };
    }
  }

  /**
   * デフォルトのサブスクリプション情報を取得
   */
  private getDefaultSubscriptionInfo(): SubscriptionInfo {
    return {
      id: 'default',
      name: 'Free Plan',
      features: ['Basic features'],
      price: 0,
      billing: 'monthly',
      status: 'inactive',
    };
  }

  /**
   * キャッシュを無効化
   */
  private invalidateCache(): void {
    this.lastFetchTime = 0;
    this.cachedInfo = null;
  }

  async updateSubscription(planId: string): Promise<ApiResponse<SubscriptionInfo>> {
    try {
      const response = await this.apiClient.post<SubscriptionInfo>('/subscription/update', {
        planId,
      });

      return {
        data: response.data,
        success: response.success,
        error: response.error
          ? {
              code: 'SUBSCRIPTION_ERROR',
              message: typeof response.error === 'string' ? response.error : 'Unknown error',
            }
          : undefined,
        meta: {
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      return {
        success: false,
        data: {} as SubscriptionInfo,
        error: {
          code: 'SUBSCRIPTION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update subscription',
        },
        meta: {
          timestamp: Date.now(),
        },
      };
    }
  }

  private createSuccessResponse<T>(data: T): ApiResponse<T> {
    return {
      data,
      success: true,
      meta: {
        timestamp: Date.now(),
      },
    };
  }

  private createErrorResponse<T>(message: string): ApiResponse<T> {
    return {
      data: {} as T,
      success: false,
      error: {
        code: 'ERROR',
        message,
      },
      meta: {
        timestamp: Date.now(),
      },
    };
  }
}

export default SubscriptionService;
