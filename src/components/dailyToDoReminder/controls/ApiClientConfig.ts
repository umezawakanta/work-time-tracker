/**
 * APIクライアント設定インターフェース
 * APIクライアントの設定値を定義します
 */
export interface IApiClientConfig {
  baseUrl: string;
  apiVersion: string;
  requestTimeoutMs: number;
  maxRetries: number;
  retryDelay: number;
  graphqlEndpoint: string;
  headers: Record<string, string>;
}

/**
 * 部分的なAPIクライアント設定型
 * 設定更新時に使用する部分的な設定型です
 */
export type PartialApiClientConfig = Partial<IApiClientConfig>;

/**
 * リトライ戦略のオプション
 */
export interface RetryStrategyOptions {
  maxRetries: number;
  initialDelay: number;
  maxDelay?: number;
  backoffFactor?: number;
}

/**
 * APIクライアント設定
 * APIクライアントの動作を設定するクラス
 */
export class ApiClientConfig implements IApiClientConfig {
  public baseUrl: string;
  public apiVersion: string;
  public requestTimeoutMs: number;
  public maxRetries: number;
  public retryDelay: number;
  public graphqlEndpoint: string;
  public headers: Record<string, string>;

  private static instance: ApiClientConfig | null = null;

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): ApiClientConfig {
    if (!ApiClientConfig.instance) {
      ApiClientConfig.instance = new ApiClientConfig();
    }
    return ApiClientConfig.instance;
  }

  /**
   * コンストラクタ
   * プライベートコンストラクタでシングルトンパターンを実現
   */
  private constructor() {
    // デフォルト設定
    this.baseUrl = this.getEnvVariable('NEXT_PUBLIC_API_BASE_URL', 'https://api.example.com');
    this.apiVersion = this.getEnvVariable('NEXT_PUBLIC_API_VERSION', 'v1');
    this.requestTimeoutMs = 30000; // 30秒
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1秒（指数バックオフの基準値）
    this.graphqlEndpoint = 'graphql';
    this.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Client-Version': this.getEnvVariable('NEXT_PUBLIC_APP_VERSION', '1.0.0'),
    };
  }

  /**
   * 環境変数を安全に取得
   * @param key 環境変数のキー
   * @param defaultValue デフォルト値
   * @returns 環境変数の値またはデフォルト値
   */
  private getEnvVariable(key: string, defaultValue: string): string {
    // process.env がブラウザで undefined になる場合に対応
    const processEnv = typeof process !== 'undefined' && process.env ? process.env : {};
    return (processEnv[key] as string) || defaultValue;
  }

  /**
   * ヘッダーの取得
   * @returns 現在のヘッダーのコピー
   */
  public getHeaders(): Record<string, string> {
    return { ...this.headers };
  }

  /**
   * 認証トークンの更新
   * @param token 認証トークン
   */
  public updateAuthToken(token: string | null): void {
    if (token) {
      this.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.headers['Authorization'];
    }
  }

  /**
   * エンドポイントからURLを構築
   * @param endpoint APIエンドポイント
   * @returns 完全なURL
   */
  public buildUrl(endpoint: string): string {
    // エンドポイントが完全なURLの場合はそのまま返す
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }

    // ベースURLとバージョンを結合
    let url = this.baseUrl;

    // APIバージョンが含まれていない場合は追加
    if (
      !endpoint.startsWith(`/${this.apiVersion}/`) &&
      !endpoint.startsWith(this.apiVersion + '/')
    ) {
      url += `/${this.apiVersion}`;
    }

    // エンドポイントが/で始まる場合は調整
    if (endpoint.startsWith('/')) {
      url += endpoint;
    } else {
      url += `/${endpoint}`;
    }

    return url;
  }

  /**
   * GraphQL URLの構築
   * @returns GraphQL エンドポイントURL
   */
  public buildGraphQLUrl(): string {
    return this.buildUrl(this.graphqlEndpoint);
  }

  /**
   * リトライ遅延時間の計算
   * @param attempt 現在の試行回数
   * @returns 遅延時間（ミリ秒）
   */
  public calculateRetryDelay(attempt: number): number {
    const backoffFactor = 2;
    const maxDelay = 30000; // 最大30秒

    // 指数バックオフ: retryDelay * (backoffFactor ^ attempt)
    const delay = this.retryDelay * Math.pow(backoffFactor, attempt);

    // 最大遅延時間を超えないようにする
    return Math.min(delay, maxDelay);
  }

  /**
   * 設定の更新
   * @param configUpdates 更新する設定値
   */
  public update(configUpdates: PartialApiClientConfig): void {
    // 入力検証
    if (!configUpdates) {
      return;
    }

    // 各プロパティを型安全に更新
    if (configUpdates.baseUrl !== undefined) this.baseUrl = configUpdates.baseUrl;
    if (configUpdates.apiVersion !== undefined) this.apiVersion = configUpdates.apiVersion;
    if (configUpdates.graphqlEndpoint !== undefined)
      this.graphqlEndpoint = configUpdates.graphqlEndpoint;
    if (configUpdates.requestTimeoutMs !== undefined)
      this.requestTimeoutMs = configUpdates.requestTimeoutMs;
    if (configUpdates.maxRetries !== undefined) this.maxRetries = configUpdates.maxRetries;
    if (configUpdates.retryDelay !== undefined) this.retryDelay = configUpdates.retryDelay;

    // ヘッダーのマージ（既存のヘッダーは残す）
    if (configUpdates.headers) {
      this.headers = {
        ...this.headers,
        ...configUpdates.headers,
      };
    }
  }

  /**
   * 設定の複製
   * @returns 現在の設定のコピー
   */
  public clone(): IApiClientConfig {
    return {
      baseUrl: this.baseUrl,
      apiVersion: this.apiVersion,
      requestTimeoutMs: this.requestTimeoutMs,
      maxRetries: this.maxRetries,
      retryDelay: this.retryDelay,
      graphqlEndpoint: this.graphqlEndpoint,
      headers: { ...this.headers },
    };
  }

  /**
   * 設定の完全リセット
   */
  public reset(): void {
    ApiClientConfig.instance = null;
  }
}

export default ApiClientConfig.getInstance();
