import { PlanFeature, PlanType, PlanTerm } from './PremiumPromotion';
import ApiClient from './ApiClient';
import CacheManager, { CachePriority } from '@/lib/cache/CacheManager';
import { ApiServiceConfig } from './ApiTypes';

// レスポンス型定義
export interface PricingPlans {
  monthly: Record<PlanType, number | null>;
  annual: Record<PlanType, number | null>;
  lifetime: Record<PlanType, number | null>;
}

export interface UpgradeResponse {
  success: boolean;
  redirectUrl?: string;
  message?: string;
  transactionId?: string;
}

export interface PromoResponse {
  valid: boolean;
  discount?: number;
  message?: string;
  expiresAt?: string;
}

export interface ReferralResponse {
  valid: boolean;
  discount?: number;
  referrerName?: string;
  message?: string;
  expiresAt?: string;
}

/**
 * プレミアムプランサービス
 * プラン情報の取得や決済処理を行うサービスクラス
 */
export class PremiumPlanService {
  private static instance: PremiumPlanService;
  private apiClient: ApiClient;
  private cacheManager: CacheManager;

  constructor() {
    const config: ApiServiceConfig = {
      baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    this.apiClient = new ApiClient(config);
    this.cacheManager = CacheManager.getInstance();
  }

  /**
   * シングルトンインスタンスの取得
   */
  public static getInstance(): PremiumPlanService {
    if (!PremiumPlanService.instance) {
      PremiumPlanService.instance = new PremiumPlanService();
    }
    return PremiumPlanService.instance;
  }

  /**
   * プラン機能の取得
   */
  public async getPlanFeatures(): Promise<PlanFeature[]> {
    const cacheKey = 'plan_features';

    // キャッシュから取得を試みる
    const cachedData = this.cacheManager.get<PlanFeature[]>(cacheKey);
    if (cachedData) return cachedData;

    try {
      // 本番環境ではAPIからデータを取得
      if (process.env.NODE_ENV === 'production') {
        const response = await this.apiClient.get<PlanFeature[]>('plans/features');

        if (response.success && response.data) {
          // キャッシュに保存（1時間有効）
          this.cacheManager.set(cacheKey, response.data, {
            ttl: 60 * 60 * 1000,
            priority: CachePriority.HIGH,
            persistToStorage: true,
          });

          return response.data;
        }
      }
    } catch (error) {
      console.error('プラン機能取得エラー:', error);
    }

    // フォールバック（開発環境または通信エラー時）
    const fallbackData = this.getFallbackPlanFeatures();

    // キャッシュに保存（開発環境でも）
    this.cacheManager.set(cacheKey, fallbackData, {
      ttl: 5 * 60 * 1000,
      priority: CachePriority.MEDIUM,
    });

    return fallbackData;
  }

  /**
   * 料金プランの取得
   */
  public async getPricingPlans(): Promise<PricingPlans> {
    const cacheKey = 'pricing_plans';

    // キャッシュから取得を試みる
    const cachedData = this.cacheManager.get<PricingPlans>(cacheKey);
    if (cachedData) return cachedData;

    try {
      // 本番環境ではAPIからデータを取得
      if (process.env.NODE_ENV === 'production') {
        const response = await this.apiClient.get<PricingPlans>('plans/pricing');

        if (response.success && response.data) {
          // キャッシュに保存（1時間有効）
          this.cacheManager.set(cacheKey, response.data, {
            ttl: 60 * 60 * 1000,
            priority: CachePriority.HIGH,
            persistToStorage: true,
          });

          return response.data;
        }
      }
    } catch (error) {
      console.error('料金プラン取得エラー:', error);
    }

    // フォールバック（開発環境または通信エラー時）
    const fallbackData = this.getFallbackPricingPlans();

    // キャッシュに保存（開発環境でも）
    this.cacheManager.set(cacheKey, fallbackData, {
      ttl: 5 * 60 * 1000,
      priority: CachePriority.MEDIUM,
    });

    return fallbackData;
  }

  /**
   * 月額換算の計算
   */
  public calculateMonthlyPrice(annualPrice: number): number {
    return Math.round(annualPrice / 12);
  }

  /**
   * 割引価格の計算
   */
  public calculateDiscountedPrice(originalPrice: number, discountRate: number): number {
    return Math.round(originalPrice * (1 - discountRate / 100));
  }

  /**
   * プランのアップグレード処理
   */
  public async upgradePlan(
    plan: PlanType,
    term: PlanTerm,
    referralCode?: string
  ): Promise<UpgradeResponse> {
    try {
      // 本番環境では実際のAPIを呼び出す
      if (process.env.NODE_ENV === 'production') {
        const response = await this.apiClient.post<UpgradeResponse>('billing/upgrade', {
          plan,
          term,
          referralCode,
        });

        if (response.success && response.data) {
          // アップグレードイベントの追跡（アナリティクス連携など）
          this.trackUpgradeEvent(plan, term, response.data.transactionId);
          return response.data;
        }

        return {
          success: false,
          message:
            typeof response.error === 'string'
              ? response.error
              : 'アップグレード処理中にエラーが発生しました。',
        };
      }

      // モック実装（開発環境用）
      const mockResponse = {
        success: true,
        transactionId: `mock-txn-${Date.now()}`,
        redirectUrl:
          plan === 'enterprise'
            ? '/contact/enterprise'
            : `/checkout/${plan}/${term}${referralCode ? `?ref=${referralCode}` : ''}`,
        message: '決済ページに移動します...',
      };

      // 開発環境でもイベント追跡
      this.trackUpgradeEvent(plan, term, mockResponse.transactionId);

      return mockResponse;
    } catch (error) {
      console.error('プランアップグレードエラー:', error);
      return {
        success: false,
        message: 'エラーが発生しました。後でもう一度お試しください。',
      };
    }
  }

  /**
   * プロモーションコードの検証
   */
  public async validatePromoCode(promoCode: string): Promise<PromoResponse> {
    if (!promoCode) {
      return { valid: false, message: 'プロモーションコードが指定されていません。' };
    }

    try {
      // 本番環境では実際のAPIを呼び出す
      if (process.env.NODE_ENV === 'production') {
        const response = await this.apiClient.get<PromoResponse>('promo/validate', {
          code: promoCode,
        });

        if (response.success && response.data) {
          return response.data;
        }

        return {
          valid: false,
          message:
            (typeof response.error === 'string'
              ? response.error
              : (response.error as any)?.message) || '検証中にエラーが発生しました。',
        };
      }

      // モック実装（開発環境用）
      return this.getMockPromoResponse(promoCode);
    } catch (error) {
      console.error('プロモーションコード検証エラー:', error);
      return { valid: false, message: '検証中にエラーが発生しました。' };
    }
  }

  /**
   * 紹介コードの検証
   */
  public async validateReferralCode(referralCode?: string): Promise<ReferralResponse> {
    if (!referralCode) {
      return { valid: false, message: '紹介コードが指定されていません。' };
    }

    try {
      // 本番環境では実際のAPIを呼び出す
      if (process.env.NODE_ENV === 'production') {
        const response = await this.apiClient.get<ReferralResponse>('referral/validate', {
          code: referralCode,
        });

        if (response.success && response.data) {
          return response.data;
        }

        return {
          valid: false,
          message: response.error || '検証中にエラーが発生しました。',
        };
      }

      // モック実装（開発環境用）
      return this.getMockReferralResponse(referralCode);
    } catch (error) {
      console.error('紹介コード検証エラー:', error);
      return { valid: false, message: '検証中にエラーが発生しました。' };
    }
  }

  /**
   * アップグレードイベントの追跡
   */
  private trackUpgradeEvent(plan: PlanType, term: PlanTerm, transactionId?: string): void {
    // 実際の実装ではアナリティクスサービスを統合
    if (typeof window !== 'undefined') {
      // Google Analytics
      if (window.gtag) {
        window.gtag('event', 'plan_upgrade', {
          plan_type: plan,
          plan_term: term,
          transaction_id: transactionId,
        });
      }

      // その他のアナリティクスイベント
      console.log('Plan upgrade tracked:', { plan, term, transactionId });
    }
  }

  /**
   * フォールバック用のプラン機能データ
   */
  private getFallbackPlanFeatures(): PlanFeature[] {
    return [
      {
        feature: 'タスク数制限',
        free: '100件',
        basic: '1,000件',
        professional: '無制限',
        enterprise: '無制限',
        tooltip: '作成可能なタスクの上限数',
      },
      {
        feature: 'ストレージ容量',
        free: '100MB',
        basic: '1GB',
        professional: '10GB',
        enterprise: '無制限',
        tooltip: '添付ファイルなどに使用できるストレージ容量',
      },
      {
        feature: 'データエクスポート',
        free: false,
        basic: true,
        professional: true,
        enterprise: true,
        tooltip: 'タスクデータのCSV/JSONエクスポート機能',
      },
      {
        feature: '自動優先度調整',
        free: false,
        basic: true,
        professional: true,
        enterprise: true,
        tooltip: 'AIによるタスクの優先度自動調整機能',
      },
      {
        feature: '統計分析機能',
        free: '基本のみ',
        basic: '基本のみ',
        professional: '高度な分析',
        enterprise: 'カスタム分析',
        tooltip: '生産性や完了率などの統計分析',
      },
      {
        feature: 'チーム共有',
        free: false,
        basic: false,
        professional: '最大5人',
        enterprise: '無制限',
        tooltip: 'タスクやプロジェクトの共有メンバー数',
      },
      {
        feature: '優先サポート',
        free: false,
        basic: false,
        professional: true,
        enterprise: true,
        tooltip: '問い合わせへの優先回答',
      },
      {
        feature: 'API連携',
        free: false,
        basic: false,
        professional: '基本のみ',
        enterprise: true,
        tooltip: '外部サービスとのAPI連携',
      },
      {
        feature: 'カスタムインテグレーション',
        free: false,
        basic: false,
        professional: false,
        enterprise: true,
        tooltip: '専用の連携開発サポート',
      },
      {
        feature: '専任カスタマーサクセスマネージャー',
        free: false,
        basic: false,
        professional: false,
        enterprise: true,
        tooltip: '導入・活用をサポートする専任担当者',
      },
    ];
  }

  /**
   * フォールバック用の料金プランデータ
   */
  private getFallbackPricingPlans(): PricingPlans {
    return {
      monthly: {
        free: 0,
        basic: 980,
        professional: 1980,
        enterprise: 4980,
      },
      annual: {
        free: 0,
        basic: 9800,
        professional: 19800,
        enterprise: 49800,
      },
      lifetime: {
        free: 0,
        basic: 29800,
        professional: 59800,
        enterprise: null, // お問い合わせ制
      },
    };
  }

  /**
   * モック用のプロモーションレスポンス
   */
  private getMockPromoResponse(promoCode: string): PromoResponse {
    if (promoCode === 'WELCOME25') {
      return {
        valid: true,
        discount: 25,
        message: '25%割引が適用されました！',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
    } else if (promoCode === 'SPRING30') {
      return {
        valid: true,
        discount: 30,
        message: '春の特別割引30%が適用されました！',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    return { valid: false, message: '無効なプロモーションコードです。' };
  }

  /**
   * モック用の紹介コードレスポンス
   */
  private getMockReferralResponse(referralCode: string): ReferralResponse {
    if (referralCode.length >= 6) {
      return {
        valid: true,
        discount: 15,
        referrerName: '田中さん',
        message: '紹介割引15%が適用されました！',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    return { valid: false, message: '無効な紹介コードです。' };
  }

  async getPlans() {
    return this.apiClient.get('/plans', undefined, {
      priority: 'normal',
    });
  }

  async updatePlan(planId: string) {
    return this.apiClient.post(
      '/plans/update',
      { planId },
      {
        priority: 'normal',
      }
    );
  }
}
