/**
 * APIリクエストハンドラー
 * 実際のHTTPリクエストを処理するクラス
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  ApiResponse,
  RequestData,
  ExtendedRequestConfig,
  ApiServiceConfig,
  ApiErrorResponse
} from './ApiTypes';
import { ApiManager } from './ApiManager';
import { Logger } from './Logger';

export class ApiRequestHandler {
  private axios: AxiosInstance;
  private apiManager: ApiManager;
  private logger: Logger;
  private readonly DEFAULT_TIMEOUT = 30000; // 30秒

  constructor(apiManager: ApiManager) {
    this.apiManager = apiManager;
    this.logger = Logger.getInstance();
    
    // Axiosインスタンスの作成と設定
    this.axios = axios.create({
      timeout: this.DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // インターセプターの設定
    this.setupInterceptors();
  }

  /**
   * リクエストインターセプターの設定
   */
  private setupInterceptors(): void {
    // リクエストインターセプター
    this.axios.interceptors.request.use(
      (config) => {
        // タイムスタンプの追加
        config.headers = config.headers || {};
        config.headers['X-Request-Time'] = Date.now().toString();
        
        // プラン情報の追加
        const userPlan = this.apiManager.getUserPlan();
        config.headers['X-Subscription-Plan'] = userPlan;
        
        return config;
      },
      (error) => {
        this.logger.error('Axiosリクエストインターセプターでエラーが発生しました', { error });
        return Promise.reject(error);
      }
    );
    
    // レスポンスインターセプター
    this.axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // ネットワークエラーやタイムアウトの処理
        if (!error.response) {
          this.logger.error('ネットワークエラーまたはタイムアウトが発生しました', { error });
          return Promise.reject(new Error('ネットワーク接続に問題があるか、サーバーが応答していません'));
        }
        
        // APIエラーレスポンスの処理
        const statusCode = error.response.status;
        this.logger.warn(`APIエラーレスポンス: ${statusCode}`, {
          status: statusCode,
          url: error.config.url,
          method: error.config.method,
          data: error.response.data
        });
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * APIリクエストの実行
   */
  public async executeRequest<T>(
    serviceConfig: ApiServiceConfig,
    method: string,
    endpoint: string,
    data?: RequestData,
    config?: ExtendedRequestConfig,
    serviceName?: string
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    
    try {
      // 設定の準備
      const axiosConfig: AxiosRequestConfig = {
        ...config,
        method: method.toLowerCase(),
        url: this.buildUrl(serviceConfig.baseEndpoint, endpoint),
      };
      
      // GET/DELETEリクエストの場合はparamsとして設定
      if (method === 'GET' || method === 'DELETE') {
        axiosConfig.params = data;
      } else {
        axiosConfig.data = data;
      }
      
      // リクエスト実行前のプラグインフックを実行
      const plugins = this.apiManager.getPlugins();
      
      for (const plugin of plugins) {
        if (plugin.hooks.beforeRequest) {
          await plugin.hooks.beforeRequest(axiosConfig, serviceName);
        }
      }
      
      // リクエスト実行
      const response: AxiosResponse = await this.axios.request(axiosConfig);
      
      // レスポンス処理後のプラグインフックを実行
      let processedData: T = response.data;
      
      for (const plugin of plugins) {
        if (plugin.hooks.afterResponse) {
          processedData = await plugin.hooks.afterResponse(
            processedData,
            response,
            serviceName
          );
        }
      }
      
      // 成功レスポンスの作成
      return {
        success: true,
        data: processedData,
        meta: {
          statusCode: response.status,
          headers: response.headers,
          timestamp: startTime,
          processingTime: Date.now() - startTime
        }
      };
    } catch (error) {
      // エラーレスポンスの作成
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: error instanceof Error ? error.message : '不明なエラーが発生しました',
        meta: {
          timestamp: startTime,
          processingTime: Date.now() - startTime
        }
      };
      
      // Axiosエラーの場合は追加情報を設定
      if (axios.isAxiosError(error) && error.response) {
        errorResponse.meta.statusCode = error.response.status;
        errorResponse.meta.headers = error.response.headers;
        errorResponse.data = error.response.data;
      }
      
      // エラー処理後のプラグインフックを実行
      const plugins = this.apiManager.getPlugins();
      
      for (const plugin of plugins) {
        if (plugin.hooks.onError) {
          await plugin.hooks.onError(errorResponse, error, serviceName);
        }
      }
      
      return errorResponse as ApiResponse<T>;
    }
  }

  /**
   * リクエストURLの構築
   */
  private buildUrl(baseEndpoint: string, endpoint: string): string {
    // ベースURLとエンドポイントを正しく結合
    if (baseEndpoint.endsWith('/') && endpoint.startsWith('/')) {
      return baseEndpoint + endpoint.substring(1);
    } else if (!baseEndpoint.endsWith('/') && !endpoint.startsWith('/')) {
      return `${baseEndpoint}/${endpoint}`;
    }
    return baseEndpoint + endpoint;
  }
}