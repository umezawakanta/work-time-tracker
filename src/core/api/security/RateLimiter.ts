/**
 * レート制限コンポーネント
 * APIリクエストの頻度を制限するためのユーティリティ
 */
import { ApiLogger } from '../tracking/ApiLogger';

/**
 * レート制限チェック結果インターフェース
 */
export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  remaining?: number;
  resetTime?: number;
}

/**
 * レート制限状態インターフェース
 */
interface RateLimitState {
  requestsInLastMinute: number;
  requestsInLastHour: number;
  lastMinuteTimestamp: number;
  lastHourTimestamp: number;
  blockedUntil: number | null;
}

/**
 * レート制限クラス
 */
export class RateLimiter {
  private logger = new ApiLogger();
  private initialized = false;
  private state: RateLimitState = {
    requestsInLastMinute: 0,
    requestsInLastHour: 0,
    lastMinuteTimestamp: 0,
    lastHourTimestamp: 0,
    blockedUntil: null,
  };
  private maxRequestsPerMinute = 60;
  private maxRequestsPerHour = 1000;
  private blockDuration = 5 * 60 * 1000; // 5分

  /**
   * コンストラクタ
   */
  constructor() {
    this.logger.setContext('RateLimiter');
  }

  /**
   * 初期化
   */
  public initialize(): void {
    if (this.initialized) return;

    this.logger.debug('レート制限を初期化しています');

    // 保存された状態を読み込む
    this.loadState();

    // 環境変数から設定を読み込む
    this.loadConfig();

    this.initialized = true;
    this.logger.debug('レート制限が初期化されました');
  }

  /**
   * 設定の読み込み
   */
  private loadConfig(): void {
    if (typeof process !== 'undefined' && process.env) {
      const env = process.env;

      // レート制限の設定
      if (env.NEXT_PUBLIC_API_RATE_LIMIT_PER_MINUTE) {
        const limit = parseInt(env.NEXT_PUBLIC_API_RATE_LIMIT_PER_MINUTE, 10);
        if (!isNaN(limit) && limit > 0) {
          this.maxRequestsPerMinute = limit;
        }
      }

      if (env.NEXT_PUBLIC_API_RATE_LIMIT_PER_HOUR) {
        const limit = parseInt(env.NEXT_PUBLIC_API_RATE_LIMIT_PER_HOUR, 10);
        if (!isNaN(limit) && limit > 0) {
          this.maxRequestsPerHour = limit;
        }
      }

      if (env.NEXT_PUBLIC_API_RATE_LIMIT_BLOCK_DURATION) {
        const duration = parseInt(env.NEXT_PUBLIC_API_RATE_LIMIT_BLOCK_DURATION, 10);
        if (!isNaN(duration) && duration > 0) {
          this.blockDuration = duration * 1000; // 秒からミリ秒に変換
        }
      }
    }
  }

  /**
   * 保存された状態の読み込み
   */
  private loadState(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const savedState = localStorage.getItem('api-rate-limit-state');
        if (savedState) {
          this.state = JSON.parse(savedState) as RateLimitState;
          this.logger.debug('レート制限状態を読み込みました');
        }
      }
    } catch (error) {
      this.logger.error('レート制限状態の読み込みに失敗しました', error);
      // エラーが発生した場合は状態をリセット
      this.resetState();
    }
  }

  /**
   * 状態の保存
   */
  private saveState(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('api-rate-limit-state', JSON.stringify(this.state));
      }
    } catch (error) {
      this.logger.error('レート制限状態の保存に失敗しました', error);
    }
  }

  /**
   * 状態のリセット
   */
  private resetState(): void {
    this.state = {
      requestsInLastMinute: 0,
      requestsInLastHour: 0,
      lastMinuteTimestamp: Date.now(),
      lastHourTimestamp: Date.now(),
      blockedUntil: null,
    };
    this.saveState();
  }

  /**
   * レート制限チェック
   */
  public checkLimit(): RateLimitResult {
    if (!this.initialized) {
      this.initialize();
    }

    const now = Date.now();

    // ブロック中かどうかをチェック
    if (this.state.blockedUntil && now < this.state.blockedUntil) {
      const remainingBlockTime = Math.ceil((this.state.blockedUntil - now) / 1000);
      return {
        allowed: false,
        reason: `レート制限により${remainingBlockTime}秒間ブロックされています`,
        resetTime: this.state.blockedUntil,
      };
    }

    // ブロックが終了していた場合はリセット
    if (this.state.blockedUntil && now >= this.state.blockedUntil) {
      this.state.blockedUntil = null;
    }

    // 1分経過していたらカウントをリセット
    if (now - this.state.lastMinuteTimestamp >= 60 * 1000) {
      this.state.requestsInLastMinute = 0;
      this.state.lastMinuteTimestamp = now;
    }

    // 1時間経過していたらカウントをリセット
    if (now - this.state.lastHourTimestamp >= 60 * 60 * 1000) {
      this.state.requestsInLastHour = 0;
      this.state.lastHourTimestamp = now;
    }

    // リクエスト数をカウントアップ
    this.state.requestsInLastMinute++;
    this.state.requestsInLastHour++;

    // 1分あたりの制限チェック
    if (this.state.requestsInLastMinute > this.maxRequestsPerMinute) {
      this.state.blockedUntil = now + this.blockDuration;
      this.saveState();
      return {
        allowed: false,
        reason: `1分あたりの最大リクエスト数(${this.maxRequestsPerMinute})を超過しました`,
        resetTime: this.state.blockedUntil,
      };
    }

    // 1時間あたりの制限チェック
    if (this.state.requestsInLastHour > this.maxRequestsPerHour) {
      this.state.blockedUntil = now + this.blockDuration;
      this.saveState();
      return {
        allowed: false,
        reason: `1時間あたりの最大リクエスト数(${this.maxRequestsPerHour})を超過しました`,
        resetTime: this.state.blockedUntil,
      };
    }

    // 定期的に状態を保存
    if (this.state.requestsInLastMinute % 10 === 0) {
      this.saveState();
    }

    // 残りリクエスト数
    const remainingMinute = this.maxRequestsPerMinute - this.state.requestsInLastMinute;
    const remainingHour = this.maxRequestsPerHour - this.state.requestsInLastHour;

    return {
      allowed: true,
      remaining: Math.min(remainingMinute, remainingHour),
    };
  }

  /**
   * 状態の取得
   */
  public getStatus(): Record<string, unknown> {
    if (!this.initialized) {
      this.initialize();
    }

    const now = Date.now();
    const minuteReset = this.state.lastMinuteTimestamp + 60 * 1000;
    const hourReset = this.state.lastHourTimestamp + 60 * 60 * 1000;

    return {
      minuteLimit: this.maxRequestsPerMinute,
      hourLimit: this.maxRequestsPerHour,
      minuteUsage: this.state.requestsInLastMinute,
      hourUsage: this.state.requestsInLastHour,
      minuteRemaining: this.maxRequestsPerMinute - this.state.requestsInLastMinute,
      hourRemaining: this.maxRequestsPerHour - this.state.requestsInLastHour,
      minuteResetIn: Math.max(0, Math.ceil((minuteReset - now) / 1000)),
      hourResetIn: Math.max(0, Math.ceil((hourReset - now) / 1000)),
      blocked: !!this.state.blockedUntil && now < this.state.blockedUntil,
      blockedUntil: this.state.blockedUntil,
    };
  }

  /**
   * 制限の設定
   */
  public setLimits(perMinute: number, perHour: number): void {
    if (perMinute > 0) {
      this.maxRequestsPerMinute = perMinute;
    }
    if (perHour > 0) {
      this.maxRequestsPerHour = perHour;
    }
    this.logger.info(`レート制限を更新しました: ${perMinute}/分, ${perHour}/時`);
  }
}
