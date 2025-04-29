/**
 * APIエラー
 * API通信に関連するエラーを表すクラス
 */
class ApiError extends Error {
    public statusCode?: number;
    public code?: string;
    public data?: unknown;
  
    constructor(
      message: string,
      options?: {
        cause?: Error;
        statusCode?: number;
        code?: string;
        data?: unknown;
      }
    ) {
      super(message, options);
      this.name = 'ApiError';
      
      if (options) {
        this.statusCode = options.statusCode;
        this.code = options.code;
        this.data = options.data;
      }
    }
  
    /**
     * エラーがネットワーク関連かどうかを判定
     */
    public isNetworkError(): boolean {
      return this.code === 'NETWORK_ERROR' || this.code === 'TIMEOUT';
    }
  
    /**
     * エラーが認証関連かどうかを判定
     */
    public isAuthError(): boolean {
      return this.statusCode === 401 || this.statusCode === 403;
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
      return this.statusCode !== undefined && this.statusCode >= 400 && this.statusCode < 500;
    }
  
    /**
     * エラーが一時的なものかどうかを判定（リトライ可能か）
     */
    public isTransient(): boolean {
      return this.isNetworkError() || this.isServerError() || this.code === 'RATE_LIMIT';
    }
  }
  
  export default ApiError;