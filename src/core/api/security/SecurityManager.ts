/**
 * セキュリティマネージャー
 * APIリクエストのセキュリティを管理するコンポーネント
 */
import { ApiLogger } from '../tracking/ApiLogger';
import { RateLimiter } from './RateLimiter';
import { TokenValidator } from './TokenValidator';

/**
 * セキュリティチェック結果インターフェース
 */
export interface SecurityCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * トークン検証結果インターフェース
 */
export interface TokenValidationResult {
  valid: boolean;
  reason?: string;
  payload?: Record<string, unknown>;
}

/**
 * セキュリティマネージャークラス
 */
export class SecurityManager {
  private static instance: SecurityManager | null = null;
  private logger = ApiLogger.getInstance();
  private rateLimiter: RateLimiter;
  private tokenValidator: TokenValidator;
  private initialized = false;
  private securityRules: Record<string, unknown> = {};

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * コンストラクタ
   */
  private constructor() {
    this.logger.setContext('SecurityManager');
    this.rateLimiter = new RateLimiter();
    this.tokenValidator = new TokenValidator();
  }

  /**
   * 初期化
   */
  public initialize(): void {
    if (this.initialized) return;

    this.logger.info('セキュリティマネージャーを初期化しています');

    // レート制限の初期化
    this.rateLimiter.initialize();

    // トークン検証の初期化
    this.tokenValidator.initialize();

    // セキュリティルールの読み込み
    this.loadSecurityRules();

    this.initialized = true;
    this.logger.info('セキュリティマネージャーが初期化されました');
  }

  /**
   * セキュリティルールの読み込み
   */
  private loadSecurityRules(): void {
    // 環境変数から設定を読み込む
    if (typeof process !== 'undefined' && process.env) {
      const env = process.env;

      // APIセキュリティルールの設定
      if (env.NEXT_PUBLIC_API_SECURITY_RULES) {
        try {
          this.securityRules = JSON.parse(env.NEXT_PUBLIC_API_SECURITY_RULES);
          this.logger.debug('セキュリティルールを読み込みました');
        } catch (error) {
          this.logger.error('セキュリティルールの解析に失敗しました', error);
        }
      }
    }

    // デフォルトルールの設定
    if (Object.keys(this.securityRules).length === 0) {
      this.securityRules = {
        maxRequestsPerMinute: 60,
        maxRequestsPerHour: 1000,
        requireTokenFor: ['POST', 'PUT', 'DELETE', 'PATCH'],
        allowOrigins: ['*'],
        contentSecurityPolicy: true,
      };
    }
  }

  /**
   * リクエストのセキュリティチェック
   */
  public checkRequestSecurity(): SecurityCheckResult {
    if (!this.initialized) {
      this.initialize();
    }

    // レート制限チェック
    const rateLimitResult = this.rateLimiter.checkLimit();
    if (!rateLimitResult.allowed) {
      return {
        allowed: false,
        reason: rateLimitResult.reason || 'レート制限を超過しました',
      };
    }

    return { allowed: true };
  }

  /**
   * トークンの検証
   */
  public validateToken(token: string | null): TokenValidationResult {
    if (!this.initialized) {
      this.initialize();
    }

    if (!token) {
      return { valid: false, reason: 'トークンが提供されていません' };
    }

    return this.tokenValidator.validate(token);
  }

  /**
   * CSP（Content Security Policy）ヘッダーの生成
   */
  public generateCSPHeader(): string {
    if (!this.initialized) {
      this.initialize();
    }

    // CSPが無効の場合は空文字列を返す
    if (!this.securityRules.contentSecurityPolicy) {
      return '';
    }

    // 基本的なCSPポリシーを作成
    return [
      "default-src 'self'",
      "script-src 'self' https://trusted-cdn.com",
      "style-src 'self' https://trusted-cdn.com 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.yourdomain.com",
      "font-src 'self' https://trusted-cdn.com",
      "object-src 'none'",
      "media-src 'self'",
      "frame-src 'self'",
      "worker-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      'upgrade-insecure-requests',
    ].join('; ');
  }

  /**
   * CORSヘッダーの生成
   */
  public getCORSHeaders(): Record<string, string> {
    const allowOrigins = Array.isArray(this.securityRules.allowOrigins)
      ? this.securityRules.allowOrigins.join(', ')
      : '*';

    return {
      'Access-Control-Allow-Origin': allowOrigins,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // 24時間
    };
  }

  /**
   * URLの安全性チェック
   */
  public isSafeUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);

      // 許可されたプロトコルのみ
      if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
        return false;
      }

      // 許可されたドメインのみ
      const allowedDomains = (this.securityRules.allowedDomains as string[]) || [];
      if (allowedDomains.length > 0 && !allowedDomains.includes(parsedUrl.hostname)) {
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('URL解析エラー', error);
      return false;
    }
  }

  /**
   * セキュリティレポートの生成
   */
  public generateSecurityReport(): Record<string, unknown> {
    if (!this.initialized) {
      this.initialize();
    }

    return {
      rateLimiting: this.rateLimiter.getStatus(),
      tokenValidation: this.tokenValidator.getStatus(),
      securityRules: this.securityRules,
      cspEnabled: !!this.securityRules.contentSecurityPolicy,
    };
  }
}

export default SecurityManager.getInstance();
