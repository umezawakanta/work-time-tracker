/**
 * APIクライアント設定
 * APIクライアントの設定を管理するクラス
 */
import Logger from './Logger';

class ApiClientConfig {
  public baseUrl: string;
  public apiVersion: string;
  public requestTimeoutMs: number;
  public maxRetries: number;
  public retryDelay: number;
  private defaultHeaders: Record<string, string>;
  private logger: Logger;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || '/api';
    this.apiVersion = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
    this.requestTimeoutMs = 30000; // 30秒
    this.maxRetries = 3; // 最大リトライ回数
    this.retryDelay = 1000; // リトライ間隔（ミリ秒）
    this.logger = Logger.getInstance();
    
    this.defaultHeaders = this.initDefaultHeaders();
  }

  /**
   * デフォルトヘッダーの初期化
   */
  private initDefaultHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Client-Version': process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      'Accept-Language': this.getBrowserLanguage(),
      'X-Requested-With': 'XMLHttpRequest',
      'X-Client-Platform': this.getClientPlatform()
    };
  }

  /**
   * ブラウザの言語設定を取得
   */
  private getBrowserLanguage(): string {
    if (typeof navigator === 'undefined') return 'ja-JP';
    return navigator.language || 'ja-JP';
  }

  /**
   * クライアントプラットフォームの取得
   */
  private getClientPlatform(): string {
    if (typeof navigator === 'undefined') return 'server';
    
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/android/i.test(userAgent)) return 'android';
    if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios';
    if (/windows/i.test(userAgent)) return 'windows';
    if (/macintosh/i.test(userAgent)) return 'mac';
    if (/linux/i.test(userAgent)) return 'linux';
    
    return 'unknown';
  }

  /**
   * 完全なURLを構築
   */
  public buildUrl(endpoint: string): string {
    // 既に絶対URLの場合はそのまま返す
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    
    // 相対パスの場合は、baseUrlとapiVersionを結合
    let url = this.baseUrl;
    
    // APIバージョンを追加
    if (this.apiVersion && !endpoint.startsWith(this.apiVersion)) {
      url = url.endsWith('/') ? `${url}${this.apiVersion}` : `${url}/${this.apiVersion}`;
    }
    
    // エンドポイントを追加
    if (endpoint.startsWith('/')) {
      url = url.endsWith('/') ? `${url}${endpoint.substring(1)}` : `${url}${endpoint}`;
    } else {
      url = url.endsWith('/') ? `${url}${endpoint}` : `${url}/${endpoint}`;
    }
    
    return url;
  }

  /**
   * 認証トークンの更新
   */
  public updateAuthToken(token: string | null): void {
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
    
    this.logger.info('認証トークンが更新されました');
  }

  /**
   * 現在のヘッダーを取得
   */
  public getHeaders(): Record<string, string> {
    return { ...this.defaultHeaders };
  }

  /**
   * カスタムヘッダーの追加
   */
  public addCustomHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  /**
   * カスタムヘッダーの削除
   */
  public removeCustomHeader(key: string): void {
    delete this.defaultHeaders[key];
  }

  /**
   * 設定の更新
   */
  public update(configUpdates: Partial<ApiClientConfig>): void {
    // 基本設定の更新
    if (configUpdates.baseUrl) this.baseUrl = configUpdates.baseUrl;
    if (configUpdates.apiVersion) this.apiVersion = configUpdates.apiVersion;
    if (configUpdates.requestTimeoutMs) this.requestTimeoutMs = configUpdates.requestTimeoutMs;
    if (configUpdates.maxRetries) this.maxRetries = configUpdates.maxRetries;
    if (configUpdates.retryDelay) this.retryDelay = configUpdates.retryDelay;
    
    this.logger.info('APIクライアント設定が更新されました', {
      baseUrl: this.baseUrl,
      apiVersion: this.apiVersion
    });
  }
}

export default ApiClientConfig;