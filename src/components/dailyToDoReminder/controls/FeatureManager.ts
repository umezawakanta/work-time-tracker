/**
 * 機能マネージャー
 * サブスクリプションプランに基づく機能制御を担当
 */
import Logger from './Logger';

/**
 * サブスクリプションプラン
 */
export type SubscriptionPlan = 'free' | 'basic' | 'professional' | 'enterprise';

/**
 * 機能の定義
 */
export interface Feature {
  id: string;
  name: string;
  description: string;
  availableInPlans: SubscriptionPlan[];
  limits?: Record<SubscriptionPlan, number | null>;
}

/**
 * 機能マネージャークラス
 */
export class FeatureManager {
  private static instance: FeatureManager;
  private features: Map<string, Feature>;
  private userPlan: SubscriptionPlan;
  private logger: Logger;
  private usageCounters: Map<string, number>;
  private overrideFeatures: Set<string>;
  
  private constructor() {
    this.features = new Map();
    this.userPlan = 'free'; // デフォルトは無料プラン
    this.logger = Logger.getInstance();
    this.usageCounters = new Map();
    this.overrideFeatures = new Set();
    
    // 主要機能の定義
    this.registerCoreFeatures();
  }
  
  /**
   * シングルトンインスタンスの取得
   */
  public static getInstance(): FeatureManager {
    if (!FeatureManager.instance) {
      FeatureManager.instance = new FeatureManager();
    }
    return FeatureManager.instance;
  }
  
  /**
   * 主要機能の登録
   */
  private registerCoreFeatures(): void {
    // APIリクエスト
    this.registerFeature({
      id: 'api.request',
      name: 'APIリクエスト',
      description: 'APIリクエストの実行',
      availableInPlans: ['free', 'basic', 'professional', 'enterprise'],
      limits: {
        free: 60, // 1時間あたり60リクエスト
        basic: 300, // 1時間あたり300リクエスト
        professional: 1000, // 1時間あたり1000リクエスト
        enterprise: null // 無制限
      }
    });
    
    // キャッシュ機能
    this.registerFeature({
      id: 'api.cache',
      name: 'APIキャッシュ',
      description: 'APIレスポンスのキャッシュ',
      availableInPlans: ['basic', 'professional', 'enterprise'],
      limits: {
        free: 0, // 利用不可
        basic: 10 * 60 * 1000, // 10分
        professional: 30 * 60 * 1000, // 30分
        enterprise: 60 * 60 * 1000 // 1時間
      }
    });
    
    // 一括リクエスト
    this.registerFeature({
      id: 'api.batchRequest',
      name: '一括リクエスト',
      description: '複数APIリクエストの同時実行',
      availableInPlans: ['professional', 'enterprise'],
      limits: {
        free: 0, // 利用不可
        basic: 0, // 利用不可
        professional: 5, // 最大5リクエスト
        enterprise: 20 // 最大20リクエスト
      }
    });
    
    // 詳細なログ
    this.registerFeature({
      id: 'logging.detailed',
      name: '詳細ログ',
      description: '詳細なAPIログの記録',
      availableInPlans: ['basic', 'professional', 'enterprise']
    });
    
    // レート制限の緩和
    this.registerFeature({
      id: 'api.rateLimit.relaxed',
      name: 'レート制限の緩和',
      description: 'APIレート制限の緩和',
      availableInPlans: ['professional', 'enterprise']
    });
  }
  
  /**
   * 機能の登録
   */
  public registerFeature(feature: Feature): void {
    this.features.set(feature.id, feature);
    this.logger.debug(`機能「${feature.name}」を登録しました`);
  }
  
  /**
   * 機能の有効性をチェック
   */
  public isFeatureEnabled(featureId: string): boolean {
    // 機能のオーバーライドがある場合
    if (this.overrideFeatures.has(featureId)) {
      return true;
    }
    
    const feature = this.features.get(featureId);
    
    if (!feature) {
      this.logger.warn(`存在しない機能「${featureId}」のチェックが要求されました`);
      return false;
    }
    
    return feature.availableInPlans.includes(this.userPlan);
  }
  
  /**
   * 機能の使用制限をチェック
   */
  public checkFeatureLimit(featureId: string): { allowed: boolean; limit: number | null; current: number } {
    const feature = this.features.get(featureId);
    
    if (!feature) {
      this.logger.warn(`存在しない機能「${featureId}」の制限チェックが要求されました`);
      return { allowed: false, limit: 0, current: 0 };
    }
    
    // 機能がプランで利用可能かチェック
    if (!this.isFeatureEnabled(featureId)) {
      return { allowed: false, limit: 0, current: 0 };
    }
    
    // 制限がない場合
    if (!feature.limits) {
      return { allowed: true, limit: null, current: 0 };
    }
    
    const limit = feature.limits[this.userPlan];
    
    // 無制限の場合
    if (limit === null) {
      return { allowed: true, limit: null, current: 0 };
    }
    
    // 現在の使用回数を取得
    const current = this.usageCounters.get(featureId) || 0;
    
    // 制限内かどうか
    return {
      allowed: current < limit,
      limit,
      current
    };
  }
  
  /**
   * 機能の使用をカウント
   */
  public incrementFeatureUsage(featureId: string, amount: number = 1): void {
    const current = this.usageCounters.get(featureId) || 0;
    this.usageCounters.set(featureId, current + amount);
  }
  
  /**
   * ユーザーのサブスクリプションプランを設定
   */
  public setUserPlan(plan: SubscriptionPlan): void {
    this.userPlan = plan;
    this.logger.info(`ユーザープランを「${plan}」に設定しました`);
    
    // 使用カウンターをリセット
    this.usageCounters.clear();
  }
  
  /**
   * ユーザーのサブスクリプションプランを取得
   */
  public getUserPlan(): SubscriptionPlan {
    return this.userPlan;
  }
  
  /**
   * 特定の機能を一時的にオーバーライド（有効化）
   */
  public overrideFeature(featureId: string, duration: number = 24 * 60 * 60 * 1000): void {
    this.overrideFeatures.add(featureId);
    this.logger.info(`機能「${featureId}」を一時的に有効化しました（${duration}ミリ秒）`);
    
    // 指定時間後に自動的に解除
    setTimeout(() => {
      this.overrideFeatures.delete(featureId);
      this.logger.info(`機能「${featureId}」の一時的な有効化が解除されました`);
    }, duration);
  }
  
  /**
   * 使用状況をリセット
   */
  public resetUsage(): void {
    this.usageCounters.clear();
    this.logger.debug('使用カウンターをリセットしました');
  }
  
  /**
   * 使用状況レポートを取得
   */
  public getUsageReport(): Record<string, { 
    feature: Feature; 
    usage: number; 
    limit: number | null; 
    enabled: boolean 
  }> {
    const report: Record<string, any> = {};
    
    for (const [featureId, feature] of this.features.entries()) {
      const usage = this.usageCounters.get(featureId) || 0;
      const limit = feature.limits ? feature.limits[this.userPlan] : null;
      const enabled = this.isFeatureEnabled(featureId);
      
      report[featureId] = {
        feature,
        usage,
        limit,
        enabled
      };
    }
    
    return report;
  }
}