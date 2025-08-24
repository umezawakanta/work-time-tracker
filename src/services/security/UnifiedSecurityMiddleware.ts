/**
 * 🛡️ 統合セキュリティミドルウェア
 * 認証、認可、XSS/CSRF保護、レート制限等の包括的なセキュリティ機能
 */

import { unifiedAuthManager } from '@/services/auth/UnifiedAuthManager';
import { unifiedErrorHandler } from '@/services/error/UnifiedErrorHandler';
import { store } from '@/store';
import { addSystemEvent, addNotification } from '@/store/unifiedDataSlice';

// セキュリティレベル
export type SecurityLevel = 'public' | 'authenticated' | 'verified' | 'admin' | 'system';

// セキュリティ設定
export interface SecurityConfig {
  enableRateLimit: boolean;
  enableXSSProtection: boolean;
  enableCSRFProtection: boolean;
  enableSecurityHeaders: boolean;
  enableAuditLog: boolean;
  defaultSecurityLevel: SecurityLevel;
  rateLimitRules: RateLimitRule[];
  trustedDomains: string[];
  blockedIPs: string[];
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
}

// レート制限ルール
export interface RateLimitRule {
  endpoint: string;
  method: string;
  maxRequests: number;
  windowMs: number;
  skipIf?: (request: SecurityRequest) => boolean;
}

// セキュリティリクエスト
export interface SecurityRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  ip?: string;
  userAgent?: string;
  userId?: string;
  timestamp: number;
}

// セキュリティ結果
export interface SecurityResult {
  allowed: boolean;
  reason?: string;
  securityLevel: SecurityLevel;
  warnings: string[];
  blocked: boolean;
  rateLimited: boolean;
  requiresAdditionalAuth: boolean;
  metadata: {
    requestId: string;
    timestamp: string;
    processingTime: number;
    rules: string[];
  };
}

// セキュリティ監査ログ
export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  action: string;
  resource: string;
  result: 'allow' | 'deny' | 'warning';
  reason: string;
  ip?: string;
  userAgent?: string;
  additionalData?: Record<string, any>;
}

// セキュリティ統計
export interface SecurityStatistics {
  totalRequests: number;
  blockedRequests: number;
  rateLimitedRequests: number;
  securityWarnings: number;
  authenticationFailures: number;
  suspiciousActivities: number;
  topBlockedIPs: Array<{ ip: string; count: number }>;
  topBlockedEndpoints: Array<{ endpoint: string; count: number }>;
  securityLevelDistribution: Record<SecurityLevel, number>;
}

class UnifiedSecurityMiddleware {
  private static instance: UnifiedSecurityMiddleware;
  private config: SecurityConfig;
  private rateLimitStore: Map<string, RateLimitEntry[]> = new Map();
  private auditLogs: SecurityAuditLog[] = [];
  private blockedAttempts: Map<string, BlockedAttempt[]> = new Map();
  private csrfTokens: Set<string> = new Set();
  private sessionStore: Map<string, SessionData> = new Map();

  private constructor(config?: Partial<SecurityConfig>) {
    this.config = {
      enableRateLimit: true,
      enableXSSProtection: true,
      enableCSRFProtection: true,
      enableSecurityHeaders: true,
      enableAuditLog: true,
      defaultSecurityLevel: 'public',
      rateLimitRules: this.getDefaultRateLimitRules(),
      trustedDomains: ['localhost', '127.0.0.1'],
      blockedIPs: [],
      sessionTimeout: 24 * 60 * 60 * 1000, // 24時間
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15分
      ...config,
    };

    this.initialize();
  }

  /**
   * 🎯 シングルトンインスタンスの取得
   */
  public static getInstance(config?: Partial<SecurityConfig>): UnifiedSecurityMiddleware {
    if (!UnifiedSecurityMiddleware.instance) {
      UnifiedSecurityMiddleware.instance = new UnifiedSecurityMiddleware(config);
    }
    return UnifiedSecurityMiddleware.instance;
  }

  /**
   * 🚀 セキュリティミドルウェアの初期化
   */
  private initialize(): void {
    console.log('🛡️ Initializing Unified Security Middleware...');

    // セキュリティヘッダーの設定
    if (this.config.enableSecurityHeaders) {
      this.setupSecurityHeaders();
    }

    // CSRFトークンの生成
    if (this.config.enableCSRFProtection) {
      this.generateCSRFToken();
    }

    // 定期クリーンアップの開始
    this.startCleanupTasks();

    // セキュリティイベントの記録
    this.recordSecurityEvent({
      action: 'system_init',
      resource: 'security_middleware',
      result: 'allow',
      reason: 'Security middleware initialized successfully',
    });

    console.log('✅ Unified Security Middleware initialized');
  }

  /**
   * 🔍 セキュリティチェックのメインエントリーポイント
   */
  public async checkSecurity(
    request: SecurityRequest,
    requiredLevel: SecurityLevel = 'public'
  ): Promise<SecurityResult> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    const result: SecurityResult = {
      allowed: false,
      securityLevel: 'public',
      warnings: [],
      blocked: false,
      rateLimited: false,
      requiresAdditionalAuth: false,
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTime: 0,
        rules: [],
      },
    };

    try {
      // 1. IP ブロックチェック
      if (this.isIPBlocked(request.ip)) {
        result.blocked = true;
        result.reason = 'IP address is blocked';
        this.recordSecurityEvent({
          action: 'request_blocked',
          resource: request.url,
          result: 'deny',
          reason: 'Blocked IP address',
          ip: request.ip,
        });
        return result;
      }

      // 2. レート制限チェック
      if (this.config.enableRateLimit) {
        const rateLimitResult = this.checkRateLimit(request);
        if (!rateLimitResult.allowed) {
          result.rateLimited = true;
          result.reason = rateLimitResult.reason;
          result.metadata.rules.push('rate_limit');
          this.recordSecurityEvent({
            action: 'rate_limit_exceeded',
            resource: request.url,
            result: 'deny',
            reason: 'Rate limit exceeded',
            ip: request.ip,
            userId: request.userId,
          });
          return result;
        }
      }

      // 3. XSS 保護チェック
      if (this.config.enableXSSProtection) {
        const xssResult = this.checkXSS(request);
        if (!xssResult.safe) {
          result.blocked = true;
          result.reason = 'Potential XSS attack detected';
          result.metadata.rules.push('xss_protection');
          this.recordSecurityEvent({
            action: 'xss_attempt',
            resource: request.url,
            result: 'deny',
            reason: 'XSS attack detected',
            ip: request.ip,
            additionalData: { payload: xssResult.details },
          });
          return result;
        }
        if (xssResult.warnings.length > 0) {
          result.warnings.push(...xssResult.warnings);
        }
      }

      // 4. CSRF 保護チェック
      if (this.config.enableCSRFProtection && this.requiresCSRFProtection(request)) {
        const csrfResult = this.checkCSRF(request);
        if (!csrfResult.valid) {
          result.blocked = true;
          result.reason = 'CSRF token validation failed';
          result.metadata.rules.push('csrf_protection');
          this.recordSecurityEvent({
            action: 'csrf_violation',
            resource: request.url,
            result: 'deny',
            reason: 'Invalid CSRF token',
            ip: request.ip,
            userId: request.userId,
          });
          return result;
        }
      }

      // 5. 認証レベルチェック
      const authResult = await this.checkAuthenticationLevel(request, requiredLevel);
      result.securityLevel = authResult.level;
      result.requiresAdditionalAuth = authResult.requiresAdditionalAuth;

      if (!authResult.sufficient) {
        result.reason = authResult.reason;
        result.metadata.rules.push('authentication_level');
        this.recordSecurityEvent({
          action: 'insufficient_auth',
          resource: request.url,
          result: 'deny',
          reason: 'Insufficient authentication level',
          userId: request.userId,
        });
        return result;
      }

      // 6. セッション有効性チェック
      if (request.userId) {
        const sessionValid = this.validateSession(request.userId);
        if (!sessionValid) {
          result.reason = 'Invalid or expired session';
          result.metadata.rules.push('session_validation');
          this.recordSecurityEvent({
            action: 'invalid_session',
            resource: request.url,
            result: 'deny',
            reason: 'Session invalid or expired',
            userId: request.userId,
          });
          return result;
        }
      }

      // すべてのチェックをパス
      result.allowed = true;
      result.metadata.processingTime = Date.now() - startTime;

      // 監査ログの記録
      if (this.config.enableAuditLog) {
        this.recordSecurityEvent({
          action: 'request_allowed',
          resource: request.url,
          result: 'allow',
          reason: 'All security checks passed',
          userId: request.userId,
          ip: request.ip,
        });
      }

      return result;
    } catch (error) {
      console.error('❌ Security check failed:', error);

      unifiedErrorHandler.handleError(error, {
        component: 'UnifiedSecurityMiddleware',
        action: 'security_check',
        additionalData: { requestId, url: request.url },
      });

      result.blocked = true;
      result.reason = 'Security check failed';
      result.metadata.processingTime = Date.now() - startTime;

      return result;
    }
  }

  /**
   * 📊 レート制限チェック
   */
  private checkRateLimit(request: SecurityRequest): { allowed: boolean; reason?: string } {
    const key = this.getRateLimitKey(request);
    const now = Date.now();

    // 適用可能なルールを検索
    const applicableRules = this.config.rateLimitRules.filter((rule) =>
      this.matchesRateLimitRule(request, rule)
    );

    for (const rule of applicableRules) {
      // スキップ条件をチェック
      if (rule.skipIf && rule.skipIf(request)) {
        continue;
      }

      const ruleKey = `${key}:${rule.endpoint}:${rule.method}`;
      const entries = this.rateLimitStore.get(ruleKey) || [];

      // 古いエントリーを削除
      const validEntries = entries.filter((entry) => now - entry.timestamp < rule.windowMs);

      // レート制限チェック
      if (validEntries.length >= rule.maxRequests) {
        return {
          allowed: false,
          reason: `Rate limit exceeded: ${rule.maxRequests} requests per ${rule.windowMs}ms`,
        };
      }

      // 新しいエントリーを追加
      validEntries.push({ timestamp: now });
      this.rateLimitStore.set(ruleKey, validEntries);
    }

    return { allowed: true };
  }

  /**
   * 🔒 XSS保護チェック
   */
  private checkXSS(request: SecurityRequest): {
    safe: boolean;
    warnings: string[];
    details?: string[];
  } {
    const warnings: string[] = [];
    const details: string[] = [];

    // 危険なパターンの検出
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^>]*>/gi,
      /<object\b[^>]*>/gi,
      /<embed\b[^>]*>/gi,
      /<form\b[^>]*>/gi,
    ];

    const suspiciousPatterns = [
      /alert\s*\(/gi,
      /document\.cookie/gi,
      /window\.location/gi,
      /eval\s*\(/gi,
    ];

    // リクエストボディのチェック
    const content = JSON.stringify(request.body || '');

    for (const pattern of dangerousPatterns) {
      if (pattern.test(content)) {
        details.push(`Dangerous pattern detected: ${pattern.source}`);
      }
    }

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        warnings.push(`Suspicious pattern detected: ${pattern.source}`);
      }
    }

    // URLパラメーターのチェック
    try {
      const url = new URL(request.url, 'http://localhost');
      for (const [key, value] of url.searchParams.entries()) {
        for (const pattern of dangerousPatterns) {
          if (pattern.test(value)) {
            details.push(`Dangerous pattern in URL parameter ${key}: ${pattern.source}`);
          }
        }
      }
    } catch {
      // URL解析エラーは無視
    }

    return {
      safe: details.length === 0,
      warnings,
      details: details.length > 0 ? details : undefined,
    };
  }

  /**
   * 🛡️ CSRF保護チェック
   */
  private checkCSRF(request: SecurityRequest): { valid: boolean; reason?: string } {
    // GET, HEAD, OPTIONS は CSRF トークン不要
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method.toUpperCase())) {
      return { valid: true };
    }

    // CSRFトークンの取得
    const token =
      request.headers['x-csrf-token'] ||
      request.headers['csrf-token'] ||
      (request.body && request.body.csrfToken);

    if (!token) {
      return { valid: false, reason: 'CSRF token missing' };
    }

    if (!this.csrfTokens.has(token)) {
      return { valid: false, reason: 'Invalid CSRF token' };
    }

    return { valid: true };
  }

  /**
   * 🔐 認証レベルチェック
   */
  private async checkAuthenticationLevel(
    request: SecurityRequest,
    requiredLevel: SecurityLevel
  ): Promise<{
    sufficient: boolean;
    level: SecurityLevel;
    requiresAdditionalAuth: boolean;
    reason?: string;
  }> {
    // 認証状態の確認
    const authState = unifiedAuthManager.getState();

    if (!authState.isAuthenticated) {
      return {
        sufficient: requiredLevel === 'public',
        level: 'public',
        requiresAdditionalAuth: requiredLevel !== 'public',
        reason: requiredLevel !== 'public' ? 'Authentication required' : undefined,
      };
    }

    const user = authState.user;
    if (!user) {
      return {
        sufficient: false,
        level: 'public',
        requiresAdditionalAuth: true,
        reason: 'User information not available',
      };
    }

    // ユーザーのセキュリティレベルを判定
    let userLevel: SecurityLevel = 'authenticated';

    if (user.isVerified) {
      userLevel = 'verified';
    }

    if (user.role === 'admin') {
      userLevel = 'admin';
    }

    // レベルの数値化（比較用）
    const levelValues = {
      public: 0,
      authenticated: 1,
      verified: 2,
      admin: 3,
      system: 4,
    };

    const userLevelValue = levelValues[userLevel];
    const requiredLevelValue = levelValues[requiredLevel];

    return {
      sufficient: userLevelValue >= requiredLevelValue,
      level: userLevel,
      requiresAdditionalAuth: userLevelValue < requiredLevelValue,
      reason:
        userLevelValue < requiredLevelValue
          ? `Insufficient privileges: ${userLevel} < ${requiredLevel}`
          : undefined,
    };
  }

  /**
   * ✅ セッション有効性チェック
   */
  private validateSession(userId: string): boolean {
    const sessionData = this.sessionStore.get(userId);

    if (!sessionData) {
      return false;
    }

    const now = Date.now();

    // セッションタイムアウトチェック
    if (now - sessionData.lastActivity > this.config.sessionTimeout) {
      this.sessionStore.delete(userId);
      return false;
    }

    // セッションの更新
    sessionData.lastActivity = now;
    this.sessionStore.set(userId, sessionData);

    return true;
  }

  /**
   * 🔐 CSRFトークンの生成
   */
  public generateCSRFToken(): string {
    const token = 'csrf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
    this.csrfTokens.add(token);

    // 古いトークンの削除（最大100個まで保持）
    if (this.csrfTokens.size > 100) {
      const tokens = Array.from(this.csrfTokens);
      tokens.slice(0, 50).forEach((oldToken) => this.csrfTokens.delete(oldToken));
    }

    return token;
  }

  /**
   * 🛡️ セキュリティヘッダーの設定
   */
  private setupSecurityHeaders(): void {
    // この関数は実際のHTTPレスポンスヘッダー設定で使用
    // フロントエンドでは主にメタタグやCSPの設定に使用

    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': this.buildCSP(),
    };

    // メタタグとして適用（可能な場合）
    if (typeof document !== 'undefined') {
      Object.entries(securityHeaders).forEach(([name, value]) => {
        let meta = document.querySelector(`meta[http-equiv="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('http-equiv', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', value);
      });
    }
  }

  /**
   * 📝 CSPポリシーの構築
   */
  private buildCSP(): string {
    const policies = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ];

    return policies.join('; ');
  }

  /**
   * 📊 セキュリティ監査ログの記録
   */
  private recordSecurityEvent(event: Omit<SecurityAuditLog, 'id' | 'timestamp'>): void {
    const auditLog: SecurityAuditLog = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      ...event,
    };

    this.auditLogs.push(auditLog);

    // ログサイズの制限（最大1000件）
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(-1000);
    }

    // 重要なイベントはシステムイベントとしても記録
    if (event.result === 'deny') {
      store.dispatch(
        addSystemEvent({
          id: `security_${auditLog.id}`,
          type: 'warning',
          message: `Security: ${event.action} - ${event.reason}`,
          timestamp: auditLog.timestamp,
          component: 'UnifiedSecurityMiddleware',
        })
      );
    }
  }

  /**
   * 🧹 定期クリーンアップタスク
   */
  private startCleanupTasks(): void {
    // 5分ごとにクリーンアップを実行
    setInterval(
      () => {
        this.cleanupRateLimitStore();
        this.cleanupOldAuditLogs();
        this.cleanupExpiredSessions();
        this.cleanupCSRFTokens();
      },
      5 * 60 * 1000
    );
  }

  /**
   * 🗑️ レート制限ストアのクリーンアップ
   */
  private cleanupRateLimitStore(): void {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1時間

    for (const [key, entries] of this.rateLimitStore.entries()) {
      const validEntries = entries.filter((entry) => now - entry.timestamp < maxAge);

      if (validEntries.length === 0) {
        this.rateLimitStore.delete(key);
      } else {
        this.rateLimitStore.set(key, validEntries);
      }
    }
  }

  /**
   * 🗑️ 古い監査ログのクリーンアップ
   */
  private cleanupOldAuditLogs(): void {
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7日間
    const cutoff = Date.now() - maxAge;

    this.auditLogs = this.auditLogs.filter((log) => new Date(log.timestamp).getTime() > cutoff);
  }

  /**
   * 🗑️ 期限切れセッションのクリーンアップ
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();

    for (const [userId, session] of this.sessionStore.entries()) {
      if (now - session.lastActivity > this.config.sessionTimeout) {
        this.sessionStore.delete(userId);
      }
    }
  }

  /**
   * 🗑️ CSRFトークンのクリーンアップ
   */
  private cleanupCSRFTokens(): void {
    // CSRFトークンの数が多くなった場合に古いものを削除
    if (this.csrfTokens.size > 50) {
      const tokens = Array.from(this.csrfTokens);
      const tokensToKeep = tokens.slice(-30); // 最新30個を保持

      this.csrfTokens.clear();
      tokensToKeep.forEach((token) => this.csrfTokens.add(token));
    }
  }

  /**
   * 📊 統計情報の取得
   */
  public getStatistics(): SecurityStatistics {
    const logs = this.auditLogs;
    const totalRequests = logs.length;
    const blockedRequests = logs.filter((log) => log.result === 'deny').length;
    const rateLimitedRequests = logs.filter((log) => log.action === 'rate_limit_exceeded').length;
    const securityWarnings = logs.filter((log) => log.result === 'warning').length;
    const authenticationFailures = logs.filter((log) => log.action.includes('auth')).length;
    const suspiciousActivities = logs.filter(
      (log) => log.action.includes('xss') || log.action.includes('csrf')
    ).length;

    // IPアドレス別の統計
    const ipCounts = new Map<string, number>();
    logs.forEach((log) => {
      if (log.ip && log.result === 'deny') {
        ipCounts.set(log.ip, (ipCounts.get(log.ip) || 0) + 1);
      }
    });

    const topBlockedIPs = Array.from(ipCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));

    // エンドポイント別の統計
    const endpointCounts = new Map<string, number>();
    logs.forEach((log) => {
      if (log.result === 'deny') {
        endpointCounts.set(log.resource, (endpointCounts.get(log.resource) || 0) + 1);
      }
    });

    const topBlockedEndpoints = Array.from(endpointCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, count }));

    // セキュリティレベル分布（仮の実装）
    const securityLevelDistribution: Record<SecurityLevel, number> = {
      public: 0,
      authenticated: 0,
      verified: 0,
      admin: 0,
      system: 0,
    };

    return {
      totalRequests,
      blockedRequests,
      rateLimitedRequests,
      securityWarnings,
      authenticationFailures,
      suspiciousActivities,
      topBlockedIPs,
      topBlockedEndpoints,
      securityLevelDistribution,
    };
  }

  /**
   * 🛠️ ヘルパーメソッド
   */
  private getDefaultRateLimitRules(): RateLimitRule[] {
    return [
      {
        endpoint: '/api/auth/login',
        method: 'POST',
        maxRequests: 5,
        windowMs: 15 * 60 * 1000, // 15分
      },
      {
        endpoint: '/api/auth/register',
        method: 'POST',
        maxRequests: 3,
        windowMs: 60 * 60 * 1000, // 1時間
      },
      {
        endpoint: '/api/*',
        method: '*',
        maxRequests: 100,
        windowMs: 15 * 60 * 1000, // 15分
      },
    ];
  }

  private isIPBlocked(ip?: string): boolean {
    return ip ? this.config.blockedIPs.includes(ip) : false;
  }

  private getRateLimitKey(request: SecurityRequest): string {
    return request.ip || request.userId || 'anonymous';
  }

  private matchesRateLimitRule(request: SecurityRequest, rule: RateLimitRule): boolean {
    const methodMatch = rule.method === '*' || rule.method === request.method;
    const endpointMatch =
      rule.endpoint === '*' ||
      request.url.includes(rule.endpoint) ||
      new RegExp(rule.endpoint.replace('*', '.*')).test(request.url);

    return methodMatch && endpointMatch;
  }

  private requiresCSRFProtection(request: SecurityRequest): boolean {
    // API エンドポイントで state-changing メソッドの場合に CSRF 保護が必要
    const statefulMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    return statefulMethods.includes(request.method.toUpperCase()) && request.url.includes('/api/');
  }

  private generateRequestId(): string {
    return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
  }

  private generateAuditId(): string {
    return 'audit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
  }

  /**
   * 📋 パブリックAPI
   */
  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): SecurityConfig {
    return { ...this.config };
  }

  public getAuditLogs(): SecurityAuditLog[] {
    return [...this.auditLogs];
  }

  public blockIP(ip: string): void {
    if (!this.config.blockedIPs.includes(ip)) {
      this.config.blockedIPs.push(ip);
      this.recordSecurityEvent({
        action: 'ip_blocked',
        resource: 'security_config',
        result: 'allow',
        reason: `IP ${ip} manually blocked`,
        ip,
      });
    }
  }

  public unblockIP(ip: string): void {
    const index = this.config.blockedIPs.indexOf(ip);
    if (index > -1) {
      this.config.blockedIPs.splice(index, 1);
      this.recordSecurityEvent({
        action: 'ip_unblocked',
        resource: 'security_config',
        result: 'allow',
        reason: `IP ${ip} manually unblocked`,
        ip,
      });
    }
  }

  public createSession(userId: string): void {
    this.sessionStore.set(userId, {
      userId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    });
  }

  public destroySession(userId: string): void {
    this.sessionStore.delete(userId);
  }
}

// 型定義
interface RateLimitEntry {
  timestamp: number;
}

interface BlockedAttempt {
  timestamp: number;
  reason: string;
}

interface SessionData {
  userId: string;
  createdAt: number;
  lastActivity: number;
}

// シングルトンインスタンスをエクスポート
export const unifiedSecurityMiddleware = UnifiedSecurityMiddleware.getInstance();

// デフォルトエクスポート
export default unifiedSecurityMiddleware;
