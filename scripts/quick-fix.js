// scripts/quick-fix.js
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function quickFix() {
    console.log('🔧 Starting quick fixes for TypeScript errors...\n');

    // 1. ApiClient.tsにfetchメソッドを追加
    await fixApiClient();

    // 2. 型定義の更新
    await updateTypeDefinitions();

    // 3. 未使用のインポートを削除
    await removeUnusedImports();

    // 4. MUI Grid関連の修正
    await fixMuiGrid();

    // 5. プライベートコンストラクタの修正
    await fixPrivateConstructors();

    // 6. 欠落しているエクスポートを追加
    await addMissingExports();

    console.log('\n✅ Quick fixes completed!');
    console.log('Run "npm run type-check" to see remaining errors.');
}

async function fixApiClient() {
    console.log('📝 Fixing ApiClient...');

    const apiClientPath = path.join(process.cwd(), 'src', 'lib', 'api', 'ApiClient.ts');

    const newContent = `export class ApiClient {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async fetch<T = any>(
    url: string, 
    options?: RequestInit
  ): Promise<{ data: T; success: boolean; error?: any }> {
    try {
      const response = await fetch(\`\${this.baseURL}\${url}\`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      
      const data = await response.json();
      
      return {
        data,
        success: response.ok,
        error: response.ok ? undefined : data.error
      };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  async get<T = any>(url: string, params?: any): Promise<{ data: T; success: boolean; error?: any }> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.fetch<T>(\`\${url}\${queryString}\`, { method: 'GET' });
  }
  
  async post<T = any>(url: string, data?: any): Promise<{ data: T; success: boolean; error?: any }> {
    return this.fetch<T>(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  async put<T = any>(url: string, data?: any): Promise<{ data: T; success: boolean; error?: any }> {
    return this.fetch<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  async delete<T = any>(url: string): Promise<{ data: T; success: boolean; error?: any }> {
    return this.fetch<T>(url, { method: 'DELETE' });
  }
  
  async patch<T = any>(url: string, data?: any): Promise<{ data: T; success: boolean; error?: any }> {
    return this.fetch<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
}

export default ApiClient;`;

    try {
        await fs.writeFile(apiClientPath, newContent);
        console.log('✅ ApiClient fixed');
    } catch (error) {
        console.error('❌ Failed to fix ApiClient:', error.message);
    }
}

async function updateTypeDefinitions() {
    console.log('📝 Updating type definitions...');

    const apiTypesPath = path.join(process.cwd(), 'src', 'components', 'dailyToDoReminder', 'controls', 'ApiTypes.ts');

    try {
        let content = await fs.readFile(apiTypesPath, 'utf8');

        // ExtendedRequestConfigインターフェースを追加
        if (!content.includes('ExtendedRequestConfig')) {
            content += `\n\nexport interface ExtendedRequestConfig extends RequestConfig {
  _cachedResponse?: any;
}`;
        }

        // ApiResponseMetaの更新
        const metaRegex = /export interface ApiResponseMeta {[\s\S]*?}/;
        if (metaRegex.test(content)) {
            content = content.replace(metaRegex, `export interface ApiResponseMeta {
  timestamp: number;
  requestId?: string;
  headers?: Record<string, string>;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
    exceeded?: boolean;
  };
  cache?: {
    hit: boolean;
    ttl?: number;
    stale?: boolean;
  };
  featureLimit?: {
    feature: string;
    limit: number;
    used: number;
    plan: string;
    allowed?: boolean;
    received?: number;
  };
  errorCode?: string;
  errorHandled?: boolean;
}`);
        }

        // RequestConfigの更新
        const configRegex = /export interface RequestConfig {[\s\S]*?}/;
        if (configRegex.test(content)) {
            content = content.replace(configRegex, `export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  retry?: number;
  cache?: boolean;
  signal?: AbortSignal;
  priority?: 'low' | 'normal' | 'high';
  withCredentials?: boolean;
  retryDelay?: number;
}`);
        }

        await fs.writeFile(apiTypesPath, content);
        console.log('✅ Type definitions updated');
    } catch (error) {
        console.error('❌ Failed to update type definitions:', error.message);
    }
}

async function removeUnusedImports() {
    console.log('📝 Removing unused imports...');

    const filesToFix = [
        'src/components/dailyToDoReminder/controls/PriceDisplay.tsx',
        'src/components/dailyToDoReminder/controls/StatisticsDetail.tsx',
        'src/components/dailyToDoReminder/controls/TodoSettings.tsx',
        'src/components/features/wbs/WBSManager.tsx',
        'src/services/referralService.ts',
        'src/services/userAccountService.ts',
        'src/services/wbs/WBSService.ts'
    ];

    for (const file of filesToFix) {
        try {
            const filePath = path.join(process.cwd(), file);
            let content = await fs.readFile(filePath, 'utf8');

            // 未使用のインポートを削除（コメントアウトではなく削除）
            const unusedImports = [
                'Badge', 'CardDescription', 'CardFooter', 'BarChart4',
                'Moon', 'Sun', 'Settings', 'User', 'deleteDoc',
                'WBSComment', 'WBSTemplate', 'WBSImportResult'
            ];

            for (const importName of unusedImports) {
                // 単独インポートの削除
                content = content.replace(new RegExp(`^import\\s+{\\s*${importName}\\s*}\\s+from\\s+['""][^'"]+['"];?\\s*$`, 'gm'), '');

                // 複数インポートから特定のものを削除
                content = content.replace(new RegExp(`(\\s*,)?\\s*${importName}\\s*(,)?`, 'g'), (match, before, after) => {
                    if (before && after) return ',';
                    return '';
                });
            }

            // 空のインポート文を削除
            content = content.replace(/^import\s+{\s*}\s+from\s+['"][^'"]+['"];?\s*$/gm, '');

            await fs.writeFile(filePath, content);
            console.log(`✅ Fixed imports in ${file}`);
        } catch (error) {
            console.error(`❌ Failed to fix ${file}:`, error.message);
        }
    }
}

async function fixMuiGrid() {
    console.log('📝 Fixing MUI Grid usage...');

    const filesToFix = [
        'src/pages/BlogPage.tsx',
        'src/pages/BlogPostDetail.tsx'
    ];

    for (const file of filesToFix) {
        try {
            const filePath = path.join(process.cwd(), file);
            let content = await fs.readFile(filePath, 'utf8');

            // Grid itemプロパティを追加
            content = content.replace(
                /<Grid\s+(xs={[^}]+}\s+sm={[^}]+}\s+md={[^}]+})/g,
                '<Grid item $1'
            );

            // Gridコンテナも確認
            if (!content.includes('<Grid container')) {
                content = content.replace(
                    /<Grid\s+spacing={[^}]+}>/g,
                    '<Grid container $&'
                );
            }

            await fs.writeFile(filePath, content);
            console.log(`✅ Fixed MUI Grid in ${file}`);
        } catch (error) {
            console.error(`❌ Failed to fix ${file}:`, error.message);
        }
    }
}

async function fixPrivateConstructors() {
    console.log('📝 Creating/fixing ApiLogger...');

    const apiLoggerDir = path.join(process.cwd(), 'src', 'components', 'dailyToDoReminder', 'controls');
    const apiLoggerPath = path.join(apiLoggerDir, 'ApiLogger.ts');

    // ディレクトリが存在することを確認
    try {
        await fs.access(apiLoggerDir);
    } catch {
        await fs.mkdir(apiLoggerDir, { recursive: true });
    }

    const apiLoggerContent = `export class ApiLogger {
  private static instance: ApiLogger;
  
  private constructor() {}
  
  static getInstance(): ApiLogger {
    if (!this.instance) {
      this.instance = new ApiLogger();
    }
    return this.instance;
  }
  
  log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = \`[\${timestamp}] [\${level.toUpperCase()}] \${message}\`;
    
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }
  
  info(message: string, data?: any): void {
    this.log('info', message, data);
  }
  
  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }
  
  error(message: string, data?: any): void {
    this.log('error', message, data);
  }
}

export default ApiLogger;`;

    try {
        await fs.writeFile(apiLoggerPath, apiLoggerContent);
        console.log('✅ ApiLogger created/fixed');
    } catch (error) {
        console.error('❌ Failed to create ApiLogger:', error.message);
    }

    // 使用箇所を修正
    const filesToUpdate = [
        'src/core/ai/AIFeatureManager.ts',
        'src/core/ai/models/AIModelRegistry.ts',
        'src/core/ai/processors/AIProcessorFactory.ts',
        'src/core/ai/security/AISecurityManager.ts',
        'src/core/ai/tracking/AIUsageTracker.ts'
    ];

    for (const file of filesToUpdate) {
        try {
            const filePath = path.join(process.cwd(), file);
            let content = await fs.readFile(filePath, 'utf8');

            // インポートを追加（まだない場合）
            if (!content.includes("import { ApiLogger }") && !content.includes("import ApiLogger")) {
                content = `import { ApiLogger } from '@/components/dailyToDoReminder/controls/ApiLogger';\n` + content;
            }

            // new ApiLogger()をApiLogger.getInstance()に置き換え
            content = content.replace(
                /private logger = new ApiLogger\(\);/g,
                'private logger = ApiLogger.getInstance();'
            );

            await fs.writeFile(filePath, content);
            console.log(`✅ Updated ApiLogger usage in ${file}`);
        } catch (error) {
            console.error(`❌ Failed to update ${file}:`, error.message);
        }
    }
}

async function addMissingExports() {
    console.log('📝 Adding missing exports...');

    // FeatureManager.tsを作成
    const featureManagerPath = path.join(process.cwd(), 'src', 'components', 'dailyToDoReminder', 'controls', 'FeatureManager.ts');
    const featureManagerContent = `export class FeatureManager {
  private features: Map<string, boolean> = new Map();
  
  constructor() {
    // デフォルトの機能を設定
    this.features.set('batchRequests', true);
    this.features.set('caching', true);
    this.features.set('metrics', true);
  }
  
  checkFeature(feature: string): boolean {
    return this.features.get(feature) ?? false;
  }
  
  enableFeature(feature: string): void {
    this.features.set(feature, true);
  }
  
  disableFeature(feature: string): void {
    this.features.set(feature, false);
  }
  
  getEnabledFeatures(): string[] {
    return Array.from(this.features.entries())
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature);
  }
}

export default FeatureManager;`;

    try {
        await fs.writeFile(featureManagerPath, featureManagerContent);
        console.log('✅ FeatureManager created');
    } catch (error) {
        console.error('❌ Failed to create FeatureManager:', error.message);
    }

    // ApiMetricsCollector.tsを作成
    const metricsPath = path.join(process.cwd(), 'src', 'components', 'dailyToDoReminder', 'controls', 'ApiMetricsCollector.ts');
    const metricsContent = `export class ApiMetricsCollector {
  private metrics: Map<string, any[]> = new Map();
  
  recordRequestDuration(
    serviceName: string,
    method: string,
    endpoint: string,
    duration: number
  ): void {
    const key = \`\${serviceName}:\${method}:\${endpoint}\`;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    this.metrics.get(key)!.push({
      duration,
      timestamp: Date.now()
    });
  }
  
  getAverageDuration(serviceName: string, method: string, endpoint: string): number {
    const key = \`\${serviceName}:\${method}:\${endpoint}\`;
    const records = this.metrics.get(key);
    
    if (!records || records.length === 0) {
      return 0;
    }
    
    const totalDuration = records.reduce((sum, record) => sum + record.duration, 0);
    return totalDuration / records.length;
  }
  
  clearMetrics(): void {
    this.metrics.clear();
  }
}

export default ApiMetricsCollector;`;

    try {
        await fs.writeFile(metricsPath, metricsContent);
        console.log('✅ ApiMetricsCollector created');
    } catch (error) {
        console.error('❌ Failed to create ApiMetricsCollector:', error.message);
    }
}

// メイン実行
try {
    await quickFix();
} catch (error) {
    console.error('❌ Error during quick fix:', error);
    process.exit(1);
}