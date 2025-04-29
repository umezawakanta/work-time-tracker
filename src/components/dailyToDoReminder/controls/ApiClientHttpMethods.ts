/**
 * APIクライアントHTTPメソッド
 * 各HTTPメソッド（GET、POST、PUT、DELETE、PATCH）の実装
 */
import ApiClient from './ApiClient';
import { ApiResponse, RequestConfig } from './ApiTypes';

class ApiClientHttpMethods {
  private apiClient: ApiClient;
  
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * GETリクエスト
   */
  public async get<T>(
    endpoint: string, 
    params?: Record<string, string>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    let url = endpoint;
    
    // URLパラメータの追加
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });
      
      const queryString = queryParams.toString();
      if (queryString) {
        url = `${endpoint}?${queryString}`;
      }
    }
    
    return this.apiClient.fetch<T>(url, { method: 'GET' }, config);
  }

  /**
   * POSTリクエスト
   */
  public async post<T>(
    endpoint: string, 
    data?: Record<string, unknown> | unknown[] | null,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.apiClient.fetch<T>(
      endpoint, 
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined
      },
      config
    );
  }

  /**
   * PUTリクエスト
   */
  public async put<T>(
    endpoint: string, 
    data?: Record<string, unknown> | unknown[] | null,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.apiClient.fetch<T>(
      endpoint, 
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined
      },
      config
    );
  }

  /**
   * DELETEリクエスト
   */
  public async delete<T>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.apiClient.fetch<T>(
      endpoint, 
      { method: 'DELETE' },
      config
    );
  }

  /**
   * PATCHリクエスト
   */
  public async patch<T>(
    endpoint: string, 
    data?: Record<string, unknown> | unknown[] | null,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.apiClient.fetch<T>(
      endpoint, 
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined
      },
      config
    );
  }

  /**
   * マルチパートFORMリクエスト（ファイルアップロード用）
   */
  public async uploadFile<T>(
    endpoint: string,
    file: File,
    fieldName: string = 'file',
    additionalData?: Record<string, string>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // 追加データがある場合は追加
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    
    return this.apiClient.fetch<T>(
      endpoint,
      {
        method: 'POST',
        body: formData,
        // FormDataを使用する場合は、Content-Typeヘッダーを設定しない
        // （ブラウザが自動的に設定する）
        headers: {}
      },
      config
    );
  }
}

export default ApiClientHttpMethods;