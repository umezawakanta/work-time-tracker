/**
 * 繝ｬ繝ｼ繝亥宛髯舌・繝阪・繧ｸ繝｣繝ｼ
 * API繝ｪ繧ｯ繧ｨ繧ｹ繝医・繝ｬ繝ｼ繝亥宛髯舌ｒ邂｡逅・☆繧九け繝ｩ繧ｹ
 */
import { SubscriptionPlan } from './ApiTypes';
import Logger from './Logger';

/**
 * 繝ｬ繝ｼ繝亥宛髯舌・繝√ぉ繝・け邨先棡
 */
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  currentCount: number;
  resetTime: number;
  remaining: number;
}

/**
 * 繝ｬ繝ｼ繝亥宛髯舌・繝阪・繧ｸ繝｣繝ｼ繧ｯ繝ｩ繧ｹ
 */
export class RateLimitManager {
  async checkLimit(serviceName: string, endpoint: string): Promise<{
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
  }> {
    // 繧ｷ繝ｳ繝励Ν縺ｪ螳溯｣・    return {
      allowed: true,
      limit: 100,
      remaining: 99,
      resetTime: Date.now() + 3600000
    };
  }

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
    this.resetInterval = 60 * 60 * 1000; // 繝・ヵ繧ｩ繝ｫ繝医・1譎る俣
    this.userPlan = 'free';
    this.logger = Logger.getInstance();
    this.resetTimer = null;
    this.customLimits = new Map();
    
    // 繝ｬ繝ｼ繝亥宛髯舌・繝ｪ繧ｻ繝・ヨ蜃ｦ逅・ｒ險ｭ螳・
    this.setupRateLimitReset();
  }
  
  /**
   * 繝ｬ繝ｼ繝亥宛髯舌・繝ｪ繧ｻ繝・ヨ蜃ｦ逅・ｒ險ｭ螳・
   */
  private setupRateLimitReset(): void {
    // 繝悶Λ繧ｦ繧ｶ迺ｰ蠅・〒縺ｮ縺ｿsetInterval繧剃ｽｿ逕ｨ
    if (typeof window !== 'undefined') {
      this.resetTimer = window.setInterval(() => {
        this.resetRateLimits();
      }, this.resetInterval);
    } else {
      // Node.js迺ｰ蠅・↑縺ｩ縺ｧ縺ｯ蛻･縺ｮ譁ｹ豕輔〒繧ｿ繧､繝槭・繧定ｨｭ螳・
      // 萓・ setTimeout 縺ｮ蜀榊ｸｰ縺ｪ縺ｩ
    }
  }
  
  /**
   * 繝ｬ繝ｼ繝亥宛髯舌・繝ｪ繧ｻ繝・ヨ
   */
  public resetRateLimits(): void {
    this.rateLimitCounter.clear();
    this.lastRateLimitReset = Date.now();
    this.logger.debug('繝ｬ繝ｼ繝亥宛髯舌き繧ｦ繝ｳ繧ｿ繝ｼ繧偵Μ繧ｻ繝・ヨ縺励∪縺励◆');
  }
  
  /**
   * 繝ｬ繝ｼ繝亥宛髯舌・繝ｪ繧ｻ繝・ヨ髢馴囈繧定ｨｭ螳・
   * @param intervalMs 繝溘Μ遘貞腰菴阪・繝ｪ繧ｻ繝・ヨ髢馴囈
   */
  public setResetInterval(intervalMs: number): void {
    this.resetInterval = intervalMs;
    
    // 譌｢蟄倥・繧ｿ繧､繝槭・繧偵け繝ｪ繧｢
    if (this.resetTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.resetTimer);
    }
    
    // 譁ｰ縺励＞繧ｿ繧､繝槭・繧定ｨｭ螳・
    this.setupRateLimitReset();
    
    this.logger.info(`繝ｬ繝ｼ繝亥宛髯舌・繝ｪ繧ｻ繝・ヨ髢馴囈繧・{intervalMs}繝溘Μ遘偵↓險ｭ螳壹＠縺ｾ縺励◆`);
  }
  
  /**
   * 繝ｦ繝ｼ繧ｶ繝ｼ縺ｮ繧ｵ繝悶せ繧ｯ繝ｪ繝励す繝ｧ繝ｳ繝励Λ繝ｳ繧定ｨｭ螳・
   */
  public setUserPlan(plan: SubscriptionPlan): void {
    this.userPlan = plan;
  }
  
  /**
   * 繧ｫ繧ｹ繧ｿ繝繝ｬ繝ｼ繝亥宛髯舌ｒ險ｭ螳・
   * @param serviceKey 繧ｵ繝ｼ繝薙せ繧ｭ繝ｼ
   * @param limit 蛻ｶ髯仙､
   */
  public setCustomLimit(serviceKey: string, limit: number): void {
    this.customLimits.set(serviceKey, limit);
    this.logger.debug(`繧ｵ繝ｼ繝薙せ縲・{serviceKey}縲阪・繧ｫ繧ｹ繧ｿ繝繝ｬ繝ｼ繝亥宛髯舌ｒ${limit}縺ｫ險ｭ螳壹＠縺ｾ縺励◆`);
  }
  
  /**
   * 繧ｫ繧ｹ繧ｿ繝繝ｬ繝ｼ繝亥宛髯舌ｒ蜑企勁
   * @param serviceKey 繧ｵ繝ｼ繝薙せ繧ｭ繝ｼ
   */
  public removeCustomLimit(serviceKey: string): void {
    this.customLimits.delete(serviceKey);
    this.logger.debug(`繧ｵ繝ｼ繝薙せ縲・{serviceKey}縲阪・繧ｫ繧ｹ繧ｿ繝繝ｬ繝ｼ繝亥宛髯舌ｒ蜑企勁縺励∪縺励◆`);
  }
  
  /**
   * 繝励Λ繝ｳ蛻･縺ｮ繝ｬ繝ｼ繝亥宛髯舌ｒ蜿門ｾ・
   * @param serviceName 繧ｵ繝ｼ繝薙せ蜷・
   * @returns 繝ｬ繝ｼ繝亥宛髯仙､
   */
  private getPlanLimit(serviceName: string): number {
    // 繧ｫ繧ｹ繧ｿ繝蛻ｶ髯舌・遒ｺ隱・
    const _customLimit = this.customLimits.get(serviceName);
    if (customLimit !== undefined) {
      return customLimit;
    }
    
    // 繝励Λ繝ｳ蛻･縺ｮ繝・ヵ繧ｩ繝ｫ繝亥宛髯・
    const limits: Record<SubscriptionPlan, number> = {
      free: 60, // 1譎る俣縺ゅ◆繧・0繝ｪ繧ｯ繧ｨ繧ｹ繝・
      basic: 300, // 1譎る俣縺ゅ◆繧・00繝ｪ繧ｯ繧ｨ繧ｹ繝・
      professional: 1000, // 1譎る俣縺ゅ◆繧・000繝ｪ繧ｯ繧ｨ繧ｹ繝・
      enterprise: Infinity // 辟｡蛻ｶ髯・
    };
    
    return limits[this.userPlan];
  }
  
  /**
   * 繝ｬ繝ｼ繝亥宛髯舌・繝√ぉ繝・け
   * @param serviceName 繧ｵ繝ｼ繝薙せ蜷・
   * @returns 繝ｬ繝ｼ繝亥宛髯舌・繝√ぉ繝・け邨先棡
   */
  public checkRateLimit(serviceName: string): RateLimitResult {
    const _key = `${serviceName}`;
    const _currentCount = this.rateLimitCounter.get(key) || 0;
    const _limit = this.getPlanLimit(serviceName);
    const _resetTime = this.lastRateLimitReset + this.resetInterval;
    
    // 邨先棡繧ｪ繝悶ず繧ｧ繧ｯ繝・
    const result: RateLimitResult = {
      allowed: currentCount < limit,
      limit,
      currentCount,
      resetTime,
      remaining: limit - currentCount
    };
    
    if (currentCount >= limit) {
      this.logger.warn(`繝ｬ繝ｼ繝亥宛髯舌ｒ雜・℃縺励∪縺励◆: ${currentCount}/${limit} (${this.userPlan}繝励Λ繝ｳ)`, {
        service: serviceName,
        plan: this.userPlan
      });
      return result;
    }
    
    // 繧ｫ繧ｦ繝ｳ繧ｿ繝ｼ繧貞｢怜刈
    this.rateLimitCounter.set(key, currentCount + 1);
    return result;
  }
  
  /**
   * 繝ｬ繝ｼ繝亥宛髯舌・繧ｫ繧ｦ繝ｳ繧ｿ繝ｼ繧貞叙蠕・
   * @param serviceName 繧ｵ繝ｼ繝薙せ蜷・
   * @returns 迴ｾ蝨ｨ縺ｮ繧ｫ繧ｦ繝ｳ繧ｿ繝ｼ蛟､
   */
  public getRateLimitCount(serviceName: string): number {
    return this.rateLimitCounter.get(serviceName) || 0;
  }
  
  /**
   * 谺｡蝗槭Μ繧ｻ繝・ヨ譎る俣繧貞叙蠕・
   * @returns 繝ｪ繧ｻ繝・ヨ譎る俣・・nix譎る俣・・
   */
  public getNextResetTime(): number {
    return this.lastRateLimitReset + this.resetInterval;
  }
  
  /**
   * 谺｡蝗槭Μ繧ｻ繝・ヨ縺ｾ縺ｧ縺ｮ谿九ｊ譎る俣繧貞叙蠕・
   * @returns 谿九ｊ譎る俣・医Α繝ｪ遘抵ｼ・
   */
  public getTimeUntilReset(): number {
    const _now = Date.now();
    const _resetTime = this.getNextResetTime();
    return Math.max(0, resetTime - now);
  }
  
  /**
   * 迴ｾ蝨ｨ縺ｮ繝ｬ繝ｼ繝亥宛髯舌・迥ｶ諷九ｒ蜿門ｾ・
   * @returns 縺吶∋縺ｦ縺ｮ繧ｵ繝ｼ繝薙せ縺ｮ繝ｬ繝ｼ繝亥宛髯千憾諷・
   */
  public getRateLimitStatus(): Record<string, RateLimitResult> {
    const status: Record<string, RateLimitResult> = {};
    
    for (const [service, count] of this.rateLimitCounter.entries()) {
      const _limit = this.getPlanLimit(service);
      const _resetTime = this.lastRateLimitReset + this.resetInterval;
      
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
   * 繝ｪ繧ｽ繝ｼ繧ｹ隗｣謾ｾ
   */
  public dispose(): void {
    if (this.resetTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.resetTimer);
      this.resetTimer = null;
    }
    
    this.rateLimitCounter.clear();
    this.customLimits.clear();
    
    this.logger.debug('RateLimitManager縺ｮ繝ｪ繧ｽ繝ｼ繧ｹ繧定ｧ｣謾ｾ縺励∪縺励◆');
  }
}
