/**
 * トークン検証コンポーネント
 * JWT等の認証トークンを検証するユーティリティ
 */
import { ApiLogger } from '../tracking/ApiLogger';

/**
 * トークン検証状態インターフェース
 */
interface TokenValidatorState {
  validTokens: string[];
  invalidTokens: string[];
  lastCleanup: number;
}

/**
 * トークン検証クラス
 */
export class TokenValidator {
  private logger = new ApiLogger();
  private initialized = false;
  private state: TokenValidatorState = {
    validTokens: [],
    invalidTokens: [],
    lastCleanup: 0,
  };
  private publicKey = '';
  private maxCacheSize = 100;
  private cleanupInterval = 24 * 60 * 60 * 1000; // 24時間

  /**
   * コンストラクタ
   */
  constructor() {
    this.logger.setContext('TokenValidator');
  }

  /**
   * 初期化
   */
  public initialize(): void {
    if (this.initialized) return;

    this.logger.debug('トークン検証を初期化しています');

    // 環境変数から設定を読み込む
    this.loadConfig();

    // 保存された状態を読み込む
    this.loadState();

    this.initialized = true;
    this.logger.debug('トークン検証が初期化されました');
  }

  /**
   * 設定の読み込み
   */
  private loadConfig(): void {
    if (typeof process !== 'undefined' && process.env) {
      const env = process.env;

      // JWT公開鍵の設定
      if (env.NEXT_PUBLIC_JWT_PUBLIC_KEY) {
        this.publicKey = env.NEXT_PUBLIC_JWT_PUBLIC_KEY;
      }

      // キャッシュサイズの設定
      if (env.NEXT_PUBLIC_TOKEN_CACHE_SIZE) {
        const size = parseInt(env.NEXT_PUBLIC_TOKEN_CACHE_SIZE, 10);
        if (!isNaN(size) && size > 0) {
          this.maxCacheSize = size;
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
        const savedState = localStorage.getItem('api-token-validator-state');
        if (savedState) {
          this.state = JSON.parse(savedState) as TokenValidatorState;
          this.logger.debug('トークン検証状態を読み込みました');
        }
      }
    } catch (error) {
      this.logger.error('トークン検証状態の読み込みに失敗しました', error);
      // エラーが発生した場合は状態をリセット
      this.resetState();
    }

    // 定期的なクリーンアップ
    const now = Date.now();
    if (now - this.state.lastCleanup > this.cleanupInterval) {
      this.cleanupCache();
    }
  }

  /**
   * 状態の保存
   */
  private saveState(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('api-token-validator-state', JSON.stringify(this.state));
      }
    } catch (error) {
      this.logger.error('トークン検証状態の保存に失敗しました', error);
    }
  }

  /**
   * 状態のリセット
   */
  private resetState(): void {
    this.state = {
      validTokens: [],
      invalidTokens: [],
      lastCleanup: Date.now(),
    };
    this.saveState();
  }

  /**
   * キャッシュのクリーンアップ
   */
  private cleanupCache(): void {
    this.state.validTokens = [];
    this.state.invalidTokens = [];
    this.state.lastCleanup = Date.now();
    this.saveState();
    this.logger.debug('トークンキャッシュをクリアしました');
  }

  /**
   * トークンの検証
   */
  public validate(token: string): {
    valid: boolean;
    reason?: string;
    payload?: Record<string, unknown>;
  } {
    if (!this.initialized) {
      this.initialize();
    }

    // キャッシュをチェック
    if (this.state.validTokens.includes(token)) {
      return { valid: true };
    }

    if (this.state.invalidTokens.includes(token)) {
      return { valid: false, reason: 'トークンが無効です' };
    }

    // トークンの形式チェック
    if (!this.isValidTokenFormat(token)) {
      this.addToInvalidCache(token);
      return { valid: false, reason: 'トークン形式が無効です' };
    }

    try {
      // JWT検証（シンプルな実装、実際にはもっと厳密な検証が必要）
      const payload = this.decodeJWT(token);

      // 期限切れチェック
      if (payload.exp && typeof payload.exp === 'number') {
        const expDate = new Date(payload.exp * 1000);
        if (expDate < new Date()) {
          this.addToInvalidCache(token);
          return { valid: false, reason: 'トークンの有効期限が切れています' };
        }
      }

      // 署名検証（この簡易実装では省略、実際には公開鍵を使って検証する）
      // この部分は実際の実装ではより堅牢に行う必要があります

      // 有効なトークンとしてキャッシュに追加
      this.addToValidCache(token);

      return { valid: true, payload };
    } catch (error) {
      this.logger.error('トークン検証エラー', error);
      this.addToInvalidCache(token);
      return {
        valid: false,
        reason: error instanceof Error ? error.message : 'トークン検証に失敗しました',
      };
    }
  }

  /**
   * トークン形式の検証
   */
  private isValidTokenFormat(token: string): boolean {
    // JWT形式のチェック（ヘッダー.ペイロード.署名）
    return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(token);
  }

  /**
   * JWTデコード
   */
  private decodeJWT(token: string): Record<string, unknown> {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('トークンのデコードに失敗しました');
    }
  }

  /**
   * 有効なトークンをキャッシュに追加
   */
  private addToValidCache(token: string): void {
    if (!this.state.validTokens.includes(token)) {
      this.state.validTokens.push(token);

      // 最大サイズを超えた場合は古いものから削除
      if (this.state.validTokens.length > this.maxCacheSize) {
        this.state.validTokens.shift();
      }

      this.saveState();
    }
  }

  /**
   * 無効なトークンをキャッシュに追加
   */
  private addToInvalidCache(token: string): void {
    if (!this.state.invalidTokens.includes(token)) {
      this.state.invalidTokens.push(token);

      // 最大サイズを超えた場合は古いものから削除
      if (this.state.invalidTokens.length > this.maxCacheSize) {
        this.state.invalidTokens.shift();
      }

      this.saveState();
    }
  }

  /**
   * ステータスの取得
   */
  public getStatus(): Record<string, unknown> {
    return {
      initialized: this.initialized,
      validTokensCount: this.state.validTokens.length,
      invalidTokensCount: this.state.invalidTokens.length,
      hasPublicKey: !!this.publicKey,
      lastCleanup: new Date(this.state.lastCleanup).toISOString(),
    };
  }
}
