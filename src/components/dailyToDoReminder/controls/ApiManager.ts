/**
 * APIマネージャー
 * APIクライアントとプラグインを管理するクラス
 */
import { 
    ApiResponse, 
    RequestData, 
    ExtendedRequestConfig, 
    SubscriptionPlan,
    ApiServiceConfig,
    IApiManager,
    HttpMethod
  } from './ApiTypes';
  import { ApiPlugin } from './ApiPlugin';
  import Logger from './Logger';
  import { FeatureManager } from './FeatureManager';
  import { ApiRequestHandler } from './ApiRequestHandler';
  import { AnalyticsManager } from './AnalyticsManager';
  import { ApiMetricsCollector } from './ApiMetricsCollector';
  import { RateLimitManager } from './RateLimitManager';
  import { 
    BatchRequestManager, 
    BatchRequestItem, 
    BatchRequestConfig
  } from './BatchRequestManager';
  import { ApiManagerHTTPMethods } from './ApiManagerHTTPMethods';
  
  /**
   * APIマネージャークラス
   */
  export class ApiManager implements IApiManager {
    private static instance: ApiManager;
    private plugins: ApiPlugin[];
    private services: Map<string, ApiServiceConfig>;
    private logger: Logger;
    private featureManager: FeatureManager;
    private requestHandler: ApiRequestHandler;
    private userPlan: SubscriptionPlan;
    private analyticsManager: AnalyticsManager;
    private metricsCollector: ApiMetricsCollector;
    private rateLimitManager: RateLimitManager;
    private batchRequestManager: BatchRequestManager;
    private httpMethods: ApiManagerHTTPMethods;
    
    private constructor() {
      this.plugins = [];
      this.services = new Map();
      this.logger = Logger.getInstance();
      this.featureManager = FeatureManager.getInstance();
      this.analyticsManager = AnalyticsManager.getInstance();
      this.metricsCollector = new ApiMetricsCollector(); // シングルトンではない場合の対応
      this.userPlan = 'free'; // デフォルトは無料プラン
      this.rateLimitManager = new RateLimitManager();
      
      // コンポーネントの初期化順序に注意
      this.requestHandler = new ApiRequestHandler(this);
      this.batchRequestManager = new BatchRequestManager(this);
      this.httpMethods = new ApiManagerHTTPMethods(this);
      
      // デフォルトサービス設定
      this.registerService('default', {
        baseEndpoint: process.env.API_BASE_URL || 'https://api.example.com/v1'
      });
      
      // 初期化ログ
      this.logger.info('APIマネージャーを初期化しました');
    }
    
    /**
     * シングルトンインスタンスの取得
     */
    public static getInstance(): ApiManager {
      if (!ApiManager.instance) {
        ApiManager.instance = new ApiManager();
      }
      return ApiManager.instance;
    }
    
    /**
     * プラグインの登録
     */
    public registerPlugin(plugin: ApiPlugin): void {
      // 既に同名のプラグインが登録されている場合は削除
      this.plugins = this.plugins.filter(p => p.name !== plugin.name);
      
      // プラグインを追加
      this.plugins.push(plugin);
      
      // 優先度でソート
      this.plugins.sort((a, b) => b.priority - a.priority);
      
      this.logger.info(`プラグイン「${plugin.name}」を登録しました`, {
        hooks: plugin.hooks,
        priority: plugin.priority
      });
    }
    
    /**
     * プラグインの削除
     */
    public unregisterPlugin(pluginName: string): boolean {
      const initialLength = this.plugins.length;
      this.plugins = this.plugins.filter(p => p.name !== pluginName);
      
      const removed = initialLength > this.plugins.length;
      if (removed) {
        this.logger.info(`プラグイン「${pluginName}」を削除しました`);
      }
      
      return removed;
    }
    
    /**
     * 登録済みプラグインの取得
     */
    public getPlugins(): ApiPlugin[] {
      return [...this.plugins];
    }
    
    /**
     * APIサービスの登録
     */
    public registerService(serviceName: string, config: ApiServiceConfig): void {
      this.services.set(serviceName, config);
      this.logger.info(`APIサービス「${serviceName}」を登録しました`, {
        baseEndpoint: config.baseEndpoint
      });
    }
    
    /**
     * APIサービスの設定を取得
     */
    public getServiceConfig(serviceName: string = 'default'): ApiServiceConfig {
      const config = this.services.get(serviceName);
      
      if (!config) {
        throw new Error(`APIサービス「${serviceName}」が見つかりません`);
      }
      
      return config;
    }
    
    /**
     * ユーザーのサブスクリプションプランを設定
     */
    public setUserPlan(plan: SubscriptionPlan): void {
      this.userPlan = plan;
      this.featureManager.setUserPlan(plan);
      this.rateLimitManager.setUserPlan(plan);
      this.logger.info(`ユーザープランを「${plan}」に設定しました`);
      
      // アナリティクスにプラン変更を記録
      this.analyticsManager.trackEvent('subscription_plan_change', {
        plan,
        timestamp: Date.now()
      });
    }
    
    /**
     * 現在のサブスクリプションプランを取得
     */
    public getUserPlan(): SubscriptionPlan {
      return this.userPlan;
    }
    
    /**
     * APIリクエストを実行
     */
    public async request<T>(
      serviceName: string,
      method: HttpMethod | string,
      endpoint: string,
      data?: RequestData,
      config?: ExtendedRequestConfig
    ): Promise<ApiResponse<T>> {
      const startTime = Date.now();
      
      try {
        // サービス設定を取得
        const serviceConfig = this.getServiceConfig(serviceName);
        
        // レート制限のチェック
        const rateLimitResult = this.rateLimitManager.checkRateLimit(serviceName);
        if (!rateLimitResult.allowed) {
          // メトリクスを記録
          this.metricsCollector.incrementCounter('rate_limit_exceeded');
          
          // アナリティクスにレート制限超過を記録
          this.analyticsManager.trackEvent('rate_limit_exceeded', {
            service: serviceName,
            plan: this.userPlan,
            count: rateLimitResult.currentCount,
            limit: rateLimitResult.limit
          });
          
          return {
        success: false,
        data: null,
        error: 
              timestamp: startTime,
              rateLimit: {
                exceeded: true,
                resetAt: rateLimitResult.resetTime,
                resetIn: rateLimitResult.resetTime - startTime
              }
            }
          };
        }
        
        // リクエストハンドラーを使用してリクエストを実行
        const response = await this.requestHandler.executeRequest<T>(
          serviceConfig,
          method,
          endpoint,
          data,
          config,
          serviceName
        );
        
        // メトリクスを記録
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        this.metricsCollector.recordRequestDuration(serviceName, method, endpoint, duration);
        
        if (response.success) {
          this.metricsCollector.incrementCounter('successful_requests');
        } else {
          this.metricsCollector.incrementCounter('failed_requests');
        }
        
        return response;
      } catch (error) {
        // 予期せぬエラーの場合
        this.logger.error('APIリクエスト実行中に予期せぬエラーが発生しました', {
          error,
          serviceName,
          method,
          endpoint
        });
        
        // メトリクスを記録
        this.metricsCollector.incrementCounter('unexpected_errors');
        
        return {
        success: false,
        data: null,
        error: 
            timestamp: startTime,
            processingTime: Date.now() - startTime
          }
        };
      }
    }
    
    /**
     * HTTPメソッド関連の機能を取得
     */
    public http(): ApiManagerHTTPMethods {
      return this.httpMethods;
    }
    
    /**
     * バッチリクエストマネージャーの取得
     */
    public getBatchRequestManager(): BatchRequestManager {
      return this.batchRequestManager;
    }
  }