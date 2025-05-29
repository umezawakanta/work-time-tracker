// scripts/fix-remaining-errors.js
import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';

async function fixRemainingErrors() {
    console.log(chalk.blue.bold('🔧 Fixing remaining TypeScript errors...\n'));

    // 1. ApiManager.tsの構文エラーを修正
    await fixApiManagerSyntax();

    // 2. BlogPage.tsxのGrid問題を修正
    await fixBlogPageGrid();

    console.log(chalk.green.bold('\n✨ All fixes completed!'));
}

async function fixApiManagerSyntax() {
    console.log(chalk.yellow('📝 Fixing ApiManager.ts syntax errors...'));

    const filePath = path.join(process.cwd(), 'src/components/dailyToDoReminder/controls/ApiManager.ts');

    try {
        let content = await fs.readFile(filePath, 'utf8');

        // 構文エラーの原因を特定して修正
        // returnステートメントの欠落やブレースの不一致を探す

        // 完全に書き直す方が安全な場合
        const fixedContent = `import { 
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
        throw new Error(\`Service '\${serviceName}' not found\`);
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
}

export default ApiManager;`;

        await fs.writeFile(filePath, fixedContent);
        console.log(chalk.green('✅ ApiManager.ts fixed'));
    } catch (error) {
        console.error(chalk.red('❌ Failed to fix ApiManager.ts:'), error.message);
    }
}

async function fixBlogPageGrid() {
    console.log(chalk.yellow('📝 Fixing BlogPage.tsx Grid issues...'));

    const filePath = path.join(process.cwd(), 'src/pages/BlogPage.tsx');

    try {
        let content = await fs.readFile(filePath, 'utf8');

        // Grid2への変換が不完全な場合、統一する
        if (content.includes('Grid2')) {
            // すべてのGridタグをGrid2に統一
            content = content.replace(/<Grid\s+/g, '<Grid2 ');
            content = content.replace(/<\/Grid>/g, '</Grid2>');

            // containerプロパティを修正（Grid2では不要な場合がある）
            content = content.replace(/\scontainer\s/g, ' ');

            // itemプロパティを削除（Grid2では不要）
            content = content.replace(/\sitem\s/g, ' ');

            // xs, sm, mdプロパティをsizeプロパティに変換
            content = content.replace(
                /xs={(\d+)}\s+sm={(\d+)}\s+md={(\d+)}/g,
                'size={{ xs: $1, sm: $2, md: $3 }}'
            );

            // 単独のxs, sm, mdプロパティも変換
            content = content.replace(/\sxs={(\d+)}/g, ' size={{ xs: $1 }}');
            content = content.replace(/\ssm={(\d+)}/g, ' size={{ sm: $1 }}');
            content = content.replace(/\smd={(\d+)}/g, ' size={{ md: $1 }}');
        } else {
            // Grid v1を使用している場合は、itemプロパティが必要
            // <Grid item xs={12}>のような形式に修正
            content = content.replace(
                /<Grid\s+xs=/g,
                '<Grid item xs='
            );
        }

        await fs.writeFile(filePath, content);
        console.log(chalk.green('✅ BlogPage.tsx fixed'));
    } catch (error) {
        console.error(chalk.red('❌ Failed to fix BlogPage.tsx:'), error.message);
    }
}

// メイン実行
fixRemainingErrors().catch(console.error);