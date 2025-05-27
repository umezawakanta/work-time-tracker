import { 
  ApiServiceConfig, 
  ApiResponse, 
  RequestConfig, 
  HttpMethod,
  ApiPlugin
} from './ApiTypes';
import { ApiRequestHandler } from './ApiRequestHandler';
import { ApiManagerHTTPMethods } from './ApiManagerHTTPMethods';
import { BatchRequestManager } from './BatchRequestManager';
import { FeatureManager } from './FeatureManager';
import { ApiMetricsCollector } from './ApiMetricsCollector';
import { ApiLogger } from './ApiLogger';
import { RateLimitManager } from './RateLimitManager';
import { NetworkMonitor } from './NetworkMonitor';

export class ApiManager {
  private services: Map<string, ApiServiceConfig> = new Map();
  private plugins: ApiPlugin[] = [];
  private requestHandler: ApiRequestHandler;
  private batchRequestManager: BatchRequestManager;
  private rateLimitManager: RateLimitManager;
  private featureManager: FeatureManager;
  private metricsCollector: ApiMetricsCollector;
  private logger: ApiLogger;
  private networkMonitor: NetworkMonitor;

  constructor() {
    this.requestHandler = new ApiRequestHandler();
    this.batchRequestManager = new BatchRequestManager(this);
    this.rateLimitManager = new RateLimitManager();
    this.featureManager = FeatureManager.getInstance();
    this.metricsCollector = ApiMetricsCollector.getInstance();
    this.logger = new ApiLogger();
    this.networkMonitor = new NetworkMonitor();
    
    this.initializeDefaultService();
  }

  private initializeDefaultService(): void {
    this.registerService('default', {
      baseURL: process.env.API_BASE_URL || 'https://api.example.com/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  public registerService(name: string, config: ApiServiceConfig): void {
    this.services.set(name, config);
  }

  public registerPlugin(plugin: ApiPlugin): void {
    this.plugins.push(plugin);
    this.requestHandler.registerPlugin(plugin);
  }

  public async request<T = any>(
    serviceName: string,
    method: HttpMethod | string,
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    
    try {
      // ネットワーク状態をチェック
      if (!this.networkMonitor.isConnected()) {
        return {
          success: false,
          data: null,
          error: 'ネットワークに接続されていません',
          meta: {
            timestamp: Date.now(),
            processingTime: Date.now() - startTime
          }
        };
      }

      // レート制限チェック
      const rateLimitCheck = await this.rateLimitManager.checkLimit(serviceName, endpoint);
      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          data: null,
          error: 'レート制限を超過しました',
          meta: {
            timestamp: Date.now(),
            processingTime: Date.now() - startTime,
            rateLimit: {
              limit: rateLimitCheck.limit,
              remaining: 0,
              reset: rateLimitCheck.resetTime,
              exceeded: true
            }
          }
        };
      }

      // サービス設定を取得
      const serviceConfig = this.services.get(serviceName);
      if (!serviceConfig) {
        throw new Error(`Service '${serviceName}' not found`);
      }

      // リクエストを実行
      const response = await this.requestHandler.executeRequest<T>(
        serviceName,
        serviceConfig,
        method,
        endpoint,
        data,
        config
      );

      // メトリクスを記録
      const duration = Date.now() - startTime;
      this.metricsCollector.recordRequestDuration(serviceName, method, endpoint, duration);

      if (response.success) {
        this.metricsCollector.incrementCounter('successful_requests');
      } else {
        this.metricsCollector.incrementCounter('failed_requests');
      }

      return response;
      
    } catch (error) {
      this.logger.error('Request failed', { serviceName, method, endpoint, error });
      this.metricsCollector.incrementCounter('unexpected_errors');
      
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          timestamp: Date.now(),
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  public http(): ApiManagerHTTPMethods {
    return new ApiManagerHTTPMethods(this);
  }

  public getBatchRequestManager(): BatchRequestManager {
    return this.batchRequestManager;
  }

  public getPlugins(): ApiPlugin[] {
    return this.plugins;
  }
}

export default ApiManager;