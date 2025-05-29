/**
 * APIマネージャーHTTPメソッド
 * APIマネージャーのHTTPショートカットメソッドを提供するクラス
 */
import { ApiResponse, RequestData, ExtendedRequestConfig, HttpMethod } from './ApiTypes';
import { ApiManager } from './ApiManager';
import { BatchRequestItem, BatchRequestConfig } from './BatchRequestManager';

/**
 * APIマネージャーHTTPメソッドクラス
 */
export class ApiManagerHTTPMethods {
  private apiManager: ApiManager;

  constructor(apiManager: ApiManager) {
    this.apiManager = apiManager;
  }

  /**
   * GETリクエスト
   */
  public async get<T>(
    endpoint: string,
    params?: RequestData,
    config?: ExtendedRequestConfig,
    serviceName: string = 'default'
  ): Promise<ApiResponse<T>> {
    return this.apiManager.request<T>(serviceName, 'GET', endpoint, params, config);
  }

  /**
   * POSTリクエスト
   */
  public async post<T>(
    endpoint: string,
    data?: RequestData,
    config?: ExtendedRequestConfig,
    serviceName: string = 'default'
  ): Promise<ApiResponse<T>> {
    return this.apiManager.request<T>(serviceName, 'POST', endpoint, data, config);
  }

  /**
   * PUTリクエスト
   */
  public async put<T>(
    endpoint: string,
    data?: RequestData,
    config?: ExtendedRequestConfig,
    serviceName: string = 'default'
  ): Promise<ApiResponse<T>> {
    return this.apiManager.request<T>(serviceName, 'PUT', endpoint, data, config);
  }

  /**
   * DELETEリクエスト
   */
  public async delete<T>(
    endpoint: string,
    config?: ExtendedRequestConfig,
    serviceName: string = 'default'
  ): Promise<ApiResponse<T>> {
    return this.apiManager.request<T>(serviceName, 'DELETE', endpoint, undefined, config);
  }

  /**
   * PATCHリクエスト
   */
  public async patch<T>(
    endpoint: string,
    data?: RequestData,
    config?: ExtendedRequestConfig,
    serviceName: string = 'default'
  ): Promise<ApiResponse<T>> {
    return this.apiManager.request<T>(serviceName, 'PATCH', endpoint, data, config);
  }

  /**
   * HEADリクエスト
   */
  public async head<T>(
    endpoint: string,
    params?: RequestData,
    config?: ExtendedRequestConfig,
    serviceName: string = 'default'
  ): Promise<ApiResponse<T>> {
    return this.apiManager.request<T>(serviceName, 'HEAD', endpoint, params, config);
  }

  /**
   * OPTIONSリクエスト
   */
  public async options<T>(
    endpoint: string,
    params?: RequestData,
    config?: ExtendedRequestConfig,
    serviceName: string = 'default'
  ): Promise<ApiResponse<T>> {
    return this.apiManager.request<T>(serviceName, 'OPTIONS', endpoint, params, config);
  }

  /**
   * 一括リクエスト
   */
  public async batch<T>(
    requests: BatchRequestItem[],
    config?: BatchRequestConfig
  ): Promise<Array<ApiResponse<T>>> {
    const results = await this.apiManager
      .getBatchRequestManager()
      .executeBatch<T>(requests, config);
    return results.map((result) => result.data);
  }
}
