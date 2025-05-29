/**
 * APIクライアントHTTPメソッド
 * 各HTTPメソッド（GET、POST、PUT、DELETE、PATCH）の実装
 */
import { ApiClient } from './ApiClient';
import { ApiResponse, RequestConfig } from './ApiTypes';

/**
 * APIクライアントHTTPメソッドクラス
 */
export class ApiClientHttpMethods {
  private apiClient: ApiClient;

  /**
   * コンストラクタ
   */
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * GETリクエスト
   * データを取得するためのリクエスト
   */
  public async get<T>(
    endpoint: string,
    params?: Record<string, string>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    // クエリパラメータを処理
    const url = params ? this.appendQueryParams(endpoint, params) : endpoint;

    return this.apiClient.request<T>('GET', url, undefined, config);
  }

  /**
   * POSTリクエスト
   * 新しいリソースを作成するためのリクエスト
   */
  public async post<T>(
    endpoint: string,
    data?: Record<string, unknown> | unknown[] | null,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    // Fix undefined Content-Type headers
    const headers: Record<string, string> = {};

    if (data && !(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json'; // Don't set to undefined
    }

    return this.apiClient.request<T>('POST', endpoint, data, { ...config, headers });
  }

  /**
   * PUTリクエスト
   * 既存のリソースを更新するためのリクエスト
   */
  public async put<T>(
    endpoint: string,
    data?: Record<string, unknown> | unknown[] | null,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.apiClient.request<T>('PUT', endpoint, data, config);
  }

  /**
   * DELETEリクエスト
   * リソースを削除するためのリクエスト
   */
  public async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.apiClient.request<T>('DELETE', endpoint, undefined, config);
  }

  /**
   * PATCHリクエスト
   * リソースを部分的に更新するためのリクエスト
   */
  public async patch<T>(
    endpoint: string,
    data?: Record<string, unknown> | unknown[] | null,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.apiClient.request<T>('PATCH', endpoint, data, config);
  }

  /**
   * ファイルアップロード
   * ファイルをサーバーにアップロードするためのリクエスト
   */
  public async uploadFile<T>(
    endpoint: string,
    file: File,
    fieldName = 'file',
    additionalData?: Record<string, string>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    // FormDataを作成
    const formData = new FormData();

    // ファイルを追加
    formData.append(fieldName, file);

    // 追加データがあれば追加
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    // Content-Typeヘッダーを削除（ブラウザが自動的に設定するため）
    const requestConfig: RequestConfig = {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': undefined, // undefinedを設定するとヘッダーが削除される
      },
    };

    return this.apiClient.request<T>('POST', endpoint, formData, requestConfig);
  }

  /**
   * マルチパートフォームデータの送信
   * 複数のフィールドとファイルを含むフォームを送信するためのリクエスト
   */
  public async sendFormData<T>(
    endpoint: string,
    formData: FormData,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    // Content-Typeヘッダーを削除（ブラウザが自動的に設定するため）
    const requestConfig: RequestConfig = {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': undefined,
      },
    };

    return this.apiClient.request<T>('POST', endpoint, formData, requestConfig);
  }

  /**
   * クエリパラメータをURLに追加
   */
  private appendQueryParams(url: string, params: Record<string, string>): string {
    // パラメータが空の場合はURLをそのまま返す
    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    // パラメータを処理
    const queryParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    // クエリパラメータがない場合はURLをそのまま返す
    if (!queryParams) {
      return url;
    }

    // URLにすでにクエリパラメータがある場合は&で追加、ない場合は?で追加
    const separator = url.includes('?') ? '&' : '?';

    return `${url}${separator}${queryParams}`;
  }
}

export default ApiClientHttpMethods;
