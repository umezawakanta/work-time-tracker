/**
 * レート制限マネージャー
 * APIリクエストのレート制限を管理するクラス
 */
import { SubscriptionPlan } from './ApiTypes';
import Logger from './Logger';

/**
 * レート制限のチェック結果
 */
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  currentCount: number;
  resetTime: number;
  remaining: number;
}

/**
 * レート制限マネージャークラス
 */
export class RateLimitManager {
  private rateLimitCounter: Map<string, number>;
  private lastRateLimitReset: number;
  private resetInterval: number;
  private userPlan: SubscriptionPlan;
  private logger: Logger;
  private resetTimer: number | null;
  private customLimits: Map<string, number>;
  
  constructor() {
    this.rateLimitCounter = new Map();
    this.lastRateLimitReset = Date.now();
    this.resetInterval = 60 * 60 * 1000; // デフォルトは1時間
    this.userPlan = 'free';
    this.logger = Logger.getInstance();
    this.resetTimer = null;
    this.customLimits = new Map();
    
    // レート制限のリセット処理を設定
    this.setupRateLimitReset();
  }
  
  /**
   * レート制限のリセット処理を設定
   */
  private setupRateLimitReset(): void {
    // ブラウザ環境でのみsetIntervalを使用
    if (typeof window !== 'undefined') {
      this.resetTimer = window.setInterval(() => {
        this.resetRateLimits();
      }, this.resetInterval);
    } else {
      // Node.js環境などでは別の方法でタイマーを設定
      // 例: setTimeout の再帰など
    }
  }
  
  /**
   * レート制限のリセット
   */
  public resetRateLimits(): void {
    this.rateLimitCounter.clear();
    this.lastRateLimitReset = Date.now();
    this.logger.debug('レート制限カウンターをリセットしました');
  }
  
  /**
   * レート制限のリセット間隔を設定
   * @param intervalMs ミリ秒単位のリセット間隔
   */
  public setResetInterval(intervalMs: number): void {
    this.resetInterval = intervalMs;
    
    // 既存のタイマーをクリア
    if (this.resetTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.resetTimer);
    }
    
    // 新しいタイマーを設定
    this.setupRateLimitReset();
    
    this.logger.info(`レート制限のリセット間隔を${intervalMs}ミリ秒に設定しました`);
  }
  
  /**
   * ユーザーのサブスクリプションプランを設定
   */
  public setUserPlan(plan: SubscriptionPlan): void {
    this.userPlan = plan;
  }
  
  /**
   * カスタムレート制限を設定
   * @param serviceKey サービスキー
   * @param limit 制限値
   */
  public setCustomLimit(serviceKey: string, limit: number): void {
    this.customLimits.set(serviceKey, limit);
    this.logger.debug(`サービス「${serviceKey}」のカスタムレート制限を${limit}に設定しました`);
  }
  
  /**
   * カスタムレート制限を削除
   * @param serviceKey サービスキー
   */
  public removeCustomLimit(serviceKey: string): void {
    this.customLimits.delete(serviceKey);
    this.logger.debug(`サービス「${serviceKey}」のカスタムレート制限を削除しました`);
  }
  
  /**
   * プラン別のレート制限を取得
   * @param serviceName サービス名
   * @returns レート制限値
   */
  private getPlanLimit(serviceName: string): number {
    // カスタム制限の確認
    const customLimit = this.customLimits.get(serviceName);
    if (customLimit !== undefined) {
      return customLimit;
    }
    
    // プラン別のデフォルト制限
    const limits: Record<SubscriptionPlan, number> = {
      free: 60, // 1時間あたり60リクエスト
      basic: 300, // 1時間あたり300リクエスト
      professional: 1000, // 1時間あたり1000リクエスト
      enterprise: Infinity // 無制限
    };
    
    return limits[this.userPlan];
  }
  
  /**
   * レート制限のチェック
   * @param serviceName サービス名
   * @returns レート制限のチェック結果
   */
  public checkRateLimit(serviceName: string): RateLimitResult {
    const key = `${serviceName}`;
    const currentCount = this.rateLimitCounter.get(key) || 0;
    const limit = this.getPlanLimit(serviceName);
    const resetTime = this.lastRateLimitReset + this.resetInterval;
    
    // 結果オブジェクト
    const result: RateLimitResult = {
      allowed: currentCount < limit,
      limit,
      currentCount,
      resetTime,
      remaining: limit - currentCount
    };
    
    if (currentCount >= limit) {
      this.logger.warn(`レート制限を超過しました: ${currentCount}/${limit} (${this.userPlan}プラン)`, {
        service: serviceName,
        plan: this.userPlan
      });
      return result;
    }
    
    // カウンターを増加
    this.rateLimitCounter.set(key, currentCount + 1);
    return result;
  }
  
  /**
   * レート制限のカウンターを取得
   * @param serviceName サービス名
   * @returns 現在のカウンター値
   */
  public getRateLimitCount(serviceName: string): number {
    return this.rateLimitCounter.get(serviceName) || 0;
  }
  
  /**
   * 次回リセット時間を取得
   * @returns リセット時間（Unix時間）
   */
  public getNextResetTime(): number {
    return this.lastRateLimitReset + this.resetInterval;
  }
  
  /**
   * 次回リセットまでの残り時間を取得
   * @returns 残り時間（ミリ秒）
   */
  public getTimeUntilReset(): number {
    const now = Date.now();
    const resetTime = this.getNextResetTime();
    return Math.max(0, resetTime - now);
  }
  
  /**
   * 現在のレート制限の状態を取得
   * @returns すべてのサービスのレート制限状態
   */
  public getRateLimitStatus(): Record<string, RateLimitResult> {
    const status: Record<string, RateLimitResult> = {};
    
    for (const [service, count] of this.rateLimitCounter.entries()) {
      const limit = this.getPlanLimit(service);
      const resetTime = this.lastRateLimitReset + this.resetInterval;
      
      status[service] = {
        allowed: count < limit,
        limit,
        currentCount: count,
        resetTime,
        remaining: limit - count
      };
    }
    
    return status;
  }
  
  /**
   * リソース解放
   */
  public dispose(): void {
    if (this.resetTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.resetTimer);
      this.resetTimer = null;
    }
    
    this.rateLimitCounter.clear();
    this.customLimits.clear();
    
    this.logger.debug('RateLimitManagerのリソースを解放しました');
  }
}