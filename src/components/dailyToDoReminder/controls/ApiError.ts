/**
 * APIエラー
 * API通信に関連するエラーを表すクラスで、様々なエラータイプを分類し、
 * 適切なエラーハンドリングを可能にします。
 */
class ApiError extends Error {
  public readonly statusCode?: number;
  public readonly code?: string;
  public readonly data?: unknown;
  public readonly timestamp: number;
  public readonly requestId?: string;
  public readonly endpoint?: string;
  public readonly cause?: Error;

  constructor(
    message: string,
    options?: {
      cause?: Error;
      statusCode?: number;
      code?: string;
      data?: unknown;
      requestId?: string;
      endpoint?: string;
    }
  ) {
    // TypeScriptエラーを修正: Errorコンストラクタには1つの引数のみ渡す
    super(message);

    this.name = 'ApiError';
    this.timestamp = Date.now();

    if (options) {
      this.cause = options.cause;
      this.statusCode = options.statusCode;
      this.code = options.code;
      this.data = options.data;
      this.requestId = options.requestId;
      this.endpoint = options.endpoint;
    }
  }

  /**
   * エラーメッセージに詳細情報を付加した文字列を取得
   */
  public getDetailedMessage(): string {
    const details: string[] = [];

    if (this.statusCode) {
      details.push(`ステータスコード: ${this.statusCode}`);
    }
    if (this.code) {
      details.push(`エラーコード: ${this.code}`);
    }
    if (this.requestId) {
      details.push(`リクエストID: ${this.requestId}`);
    }
    if (this.endpoint) {
      details.push(`エンドポイント: ${this.endpoint}`);
    }

    return details.length > 0 ? `${this.message} (${details.join(', ')})` : this.message;
  }

  /**
   * エラーがネットワーク関連かどうかを判定
   */
  public isNetworkError(): boolean {
    return (
      this.code === 'NETWORK_ERROR' || this.code === 'TIMEOUT' || this.code === 'CONNECTION_ABORTED'
    );
  }

  /**
   * エラーが認証関連かどうかを判定
   */
  public isAuthError(): boolean {
    return (
      this.statusCode === 401 ||
      this.statusCode === 403 ||
      this.code === 'UNAUTHORIZED' ||
      this.code === 'TOKEN_EXPIRED'
    );
  }

  /**
   * エラーがサーバー関連かどうかを判定
   */
  public isServerError(): boolean {
    return this.statusCode !== undefined && this.statusCode >= 500 && this.statusCode < 600;
  }

  /**
   * エラーがクライアント関連（ユーザー入力など）かどうかを判定
   */
  public isClientError(): boolean {
    return (
      this.statusCode !== undefined &&
      this.statusCode >= 400 &&
      this.statusCode < 500 &&
      !this.isAuthError()
    );
  }

  /**
   * エラーが一時的なものかどうかを判定（リトライ可能か）
   */
  public isTransient(): boolean {
    const transientCodes = ['RATE_LIMIT', 'TIMEOUT', 'NETWORK_ERROR', 'SERVICE_UNAVAILABLE'];
    return (
      this.isNetworkError() || this.isServerError() || transientCodes.includes(this.code || '')
    );
  }

  /**
   * ユーザーにわかりやすいエラーメッセージを生成
   */
  public toUserFriendlyMessage(): string {
    if (this.isNetworkError()) {
      return 'ネットワーク接続に問題が発生しました。インターネット接続を確認し、再度お試しください。';
    }

    if (this.isAuthError()) {
      return '認証に失敗しました。再度ログインしてください。';
    }

    if (this.isServerError()) {
      return 'サーバーでエラーが発生しました。しばらく経ってから再度お試しください。';
    }

    if (this.isClientError()) {
      return '入力内容に問題があります。入力内容を確認して再度お試しください。';
    }

    return 'エラーが発生しました。しばらく経ってから再度お試しください。';
  }

  /**
   * APIエラーオブジェクトを標準化されたフォーマットに変換
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      timestamp: this.timestamp,
      requestId: this.requestId,
      endpoint: this.endpoint,
      isTransient: this.isTransient(),
    };
  }
}

export default ApiError;
