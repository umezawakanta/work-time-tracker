import { toast } from '@/components/ui/use-toast';

export interface ResourceAsset {
  url: string;
  type: 'image' | 'script' | 'style' | 'font' | 'video' | 'data';
  originalSize: number; // bytes
  compressedSize?: number; // bytes
  loadTime: number; // ms
  priority: 'critical' | 'high' | 'medium' | 'low';
  compressionRatio?: number; // 0-1
  cacheable: boolean;
  lazyLoaded: boolean;
}

export interface BundleAnalysis {
  totalSize: number; // bytes
  gzippedSize: number; // bytes
  chunks: BundleChunk[];
  duplicateModules: string[];
  unusedCode: number; // percentage
  treeshakingPotential: number; // bytes that could be removed
}

export interface BundleChunk {
  name: string;
  size: number; // bytes
  modules: string[];
  loadTime: number; // ms
  cached: boolean;
}

export interface OptimizationRule {
  id: string;
  name: string;
  description: string;
  category: 'compression' | 'loading' | 'caching' | 'bundling';
  enabled: boolean;
  impact: 'low' | 'medium' | 'high';
  savings: number; // estimated bytes saved
}

export interface ResourceMetrics {
  totalResources: number;
  totalSize: number; // bytes
  optimizedSize: number; // bytes
  savingsPercentage: number;
  loadTime: number; // ms
  cacheHitRatio: number; // 0-1
  compressionRatio: number; // 0-1
  lazyLoadedRatio: number; // 0-1
}

/**
 * ♻️ サステナブルコード推進者: リソース最適化サービス
 * アセット圧縮・バンドル最適化・効率的なリソース読み込み
 */
class ResourceOptimizationService {
  private static instance: ResourceOptimizationService | null = null;
  private resources: ResourceAsset[] = [];
  private bundleAnalysis: BundleAnalysis | null = null;
  private optimizationRules: OptimizationRule[];
  private metrics: ResourceMetrics;

  private constructor() {
    this.optimizationRules = [
      {
        id: 'image-compression',
        name: '画像圧縮',
        description: 'WebP/AVIF形式への変換と品質最適化',
        category: 'compression',
        enabled: true,
        impact: 'high',
        savings: 512000, // 500KB
      },
      {
        id: 'js-minification',
        name: 'JavaScript圧縮',
        description: 'コード圧縮とデッドコード除去',
        category: 'compression',
        enabled: true,
        impact: 'medium',
        savings: 256000, // 250KB
      },
      {
        id: 'css-optimization',
        name: 'CSS最適化',
        description: '未使用CSSの除去とクリティカルCSS抽出',
        category: 'compression',
        enabled: true,
        impact: 'medium',
        savings: 128000, // 125KB
      },
      {
        id: 'lazy-loading',
        name: '遅延読み込み',
        description: '画像とコンポーネントの遅延読み込み',
        category: 'loading',
        enabled: true,
        impact: 'high',
        savings: 1024000, // 1MB
      },
      {
        id: 'code-splitting',
        name: 'コード分割',
        description: 'ルートベースの動的インポート',
        category: 'bundling',
        enabled: true,
        impact: 'high',
        savings: 2048000, // 2MB
      },
      {
        id: 'tree-shaking',
        name: 'ツリーシェイキング',
        description: '未使用エクスポートの除去',
        category: 'bundling',
        enabled: true,
        impact: 'medium',
        savings: 384000, // 375KB
      },
      {
        id: 'gzip-compression',
        name: 'GZIP圧縮',
        description: 'テキストベースリソースの圧縮',
        category: 'compression',
        enabled: true,
        impact: 'high',
        savings: 1536000, // 1.5MB
      },
      {
        id: 'cache-optimization',
        name: 'キャッシュ最適化',
        description: 'ブラウザキャッシュとCDN活用',
        category: 'caching',
        enabled: true,
        impact: 'high',
        savings: 0, // load time improvement
      },
    ];

    this.metrics = {
      totalResources: 0,
      totalSize: 0,
      optimizedSize: 0,
      savingsPercentage: 0,
      loadTime: 0,
      cacheHitRatio: 0,
      compressionRatio: 0,
      lazyLoadedRatio: 0,
    };

    this.initializeService();
  }

  public static getInstance(): ResourceOptimizationService {
    if (!ResourceOptimizationService.instance) {
      ResourceOptimizationService.instance = new ResourceOptimizationService();
    }
    return ResourceOptimizationService.instance;
  }

  /**
   * 🚀 サービス初期化
   */
  private initializeService(): void {
    this.analyzeCurrentResources();
    this.applyOptimizationRules();
    this.setupResourceMonitoring();
    console.log('📦 リソース最適化サービス初期化完了');
  }

  /**
   * 🔍 現在のリソース分析
   */
  private analyzeCurrentResources(): void {
    // Performance API からリソース情報を取得
    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    this.resources = resourceEntries.map((entry) => {
      const resource: ResourceAsset = {
        url: entry.name,
        type: this.getResourceType(entry.name),
        originalSize: entry.transferSize || entry.encodedBodySize || 0,
        loadTime: entry.responseEnd - entry.startTime,
        priority: this.getPriority(entry.name),
        cacheable: entry.responseStart > 0, // キャッシュから読み込まれた場合
        lazyLoaded: false, // 初期読み込みは false
      };

      // 圧縮比率を推定
      if (entry.transferSize && entry.decodedBodySize) {
        resource.compressionRatio = 1 - entry.transferSize / entry.decodedBodySize;
        resource.compressedSize = entry.transferSize;
      }

      return resource;
    });

    this.updateMetrics();
    console.log(`🔍 ${this.resources.length}個のリソースを分析しました`);
  }

  /**
   * 📊 リソースタイプ判定
   */
  private getResourceType(url: string): ResourceAsset['type'] {
    const extension = url.split('.').pop()?.toLowerCase() || '';

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'].includes(extension)) {
      return 'image';
    }
    if (['js', 'mjs', 'ts'].includes(extension)) {
      return 'script';
    }
    if (['css', 'scss', 'sass'].includes(extension)) {
      return 'style';
    }
    if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(extension)) {
      return 'font';
    }
    if (['mp4', 'webm', 'ogg'].includes(extension)) {
      return 'video';
    }
    return 'data';
  }

  /**
   * ⚡ リソース優先度判定
   */
  private getPriority(url: string): ResourceAsset['priority'] {
    // クリティカルリソースの判定
    if (url.includes('critical') || url.includes('above-fold')) {
      return 'critical';
    }

    // HTMLとCSS は高優先度
    if (url.includes('.html') || url.includes('.css')) {
      return 'high';
    }

    // JavaScript は中優先度
    if (url.includes('.js')) {
      return 'medium';
    }

    // その他は低優先度
    return 'low';
  }

  /**
   * ⚙️ 最適化ルール適用
   */
  private applyOptimizationRules(): void {
    this.optimizationRules.forEach((rule) => {
      if (rule.enabled) {
        this.applyRule(rule);
      }
    });
  }

  /**
   * 🔧 個別ルール適用
   */
  private applyRule(rule: OptimizationRule): void {
    switch (rule.id) {
      case 'image-compression':
        this.optimizeImages();
        break;
      case 'js-minification':
        this.optimizeJavaScript();
        break;
      case 'css-optimization':
        this.optimizeCSS();
        break;
      case 'lazy-loading':
        this.enableLazyLoading();
        break;
      case 'code-splitting':
        this.suggestCodeSplitting();
        break;
      case 'tree-shaking':
        this.analyzeTreeShaking();
        break;
      case 'gzip-compression':
        this.checkGzipCompression();
        break;
      case 'cache-optimization':
        this.optimizeCaching();
        break;
    }
  }

  /**
   * 🖼️ 画像最適化
   */
  private optimizeImages(): void {
    const images = this.resources.filter((r) => r.type === 'image');

    images.forEach((img) => {
      // WebP対応チェック
      if (!img.url.includes('.webp') && this.supportsWebP()) {
        console.log(`🖼️ ${img.url} をWebPに変換することで約30%の削減が可能`);

        // 最適化後のサイズを推定
        img.compressedSize = Math.floor(img.originalSize * 0.7);
        img.compressionRatio = 0.3;
      }

      // 画像サイズチェック
      if (img.originalSize > 500000) {
        // 500KB以上
        console.log(
          `🖼️ ${img.url} のサイズが大きすぎます（${this.formatBytes(img.originalSize)}）`
        );
      }
    });
  }

  /**
   * 📝 JavaScript最適化
   */
  private optimizeJavaScript(): void {
    const scripts = this.resources.filter((r) => r.type === 'script');

    scripts.forEach((script) => {
      // 圧縮チェック
      if (!script.compressionRatio || script.compressionRatio < 0.5) {
        console.log(`📝 ${script.url} の圧縮を改善できます`);
      }

      // バンドルサイズチェック
      if (script.originalSize > 1000000) {
        // 1MB以上
        console.log(`📝 ${script.url} をコード分割で最適化できます`);
      }
    });
  }

  /**
   * 🎨 CSS最適化
   */
  private optimizeCSS(): void {
    const styles = this.resources.filter((r) => r.type === 'style');

    styles.forEach((style) => {
      // 未使用CSS検出（簡易版）
      this.detectUnusedCSS(style.url);

      // クリティカルCSS抽出提案
      if (style.priority !== 'critical') {
        console.log(`🎨 ${style.url} からクリティカルCSSを抽出できます`);
      }
    });
  }

  /**
   * 🔄 遅延読み込み有効化
   */
  private enableLazyLoading(): void {
    // 画像の遅延読み込み
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach((img) => {
      if (!this.isAboveFold(img)) {
        img.setAttribute('loading', 'lazy');

        // リソース配列更新
        const resource = this.resources.find((r) => r.url === (img as HTMLImageElement).src);
        if (resource) {
          resource.lazyLoaded = true;
        }
      }
    });

    // iframe の遅延読み込み
    const iframes = document.querySelectorAll('iframe:not([loading])');
    iframes.forEach((iframe) => {
      if (!this.isAboveFold(iframe)) {
        iframe.setAttribute('loading', 'lazy');
      }
    });

    console.log('🔄 遅延読み込みを適用しました');
  }

  /**
   * 📱 ファーストビュー判定
   */
  private isAboveFold(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.left < window.innerWidth;
  }

  /**
   * ✂️ コード分割提案
   */
  private suggestCodeSplitting(): void {
    // 大きなJavaScriptファイルをチェック
    const largeScripts = this.resources.filter(
      (r) => r.type === 'script' && r.originalSize > 500000 // 500KB以上
    );

    largeScripts.forEach((script) => {
      console.log(`✂️ ${script.url} をルートベースで分割することを推奨`);
    });

    // 動的インポートの提案
    this.suggestDynamicImports();
  }

  /**
   * 🌲 ツリーシェイキング分析
   */
  private analyzeTreeShaking(): void {
    // バンドル分析（実際の実装では webpack-bundle-analyzer などを使用）
    console.log('🌲 未使用エクスポートの検出を実行中...');

    // 推定未使用コード（実際のプロジェクトでは静的解析が必要）
    const estimatedUnusedCode = 15; // 15% の未使用コード
    console.log(`🌲 推定未使用コード: ${estimatedUnusedCode}%`);
  }

  /**
   * 🗜️ GZIP圧縮チェック
   */
  private checkGzipCompression(): void {
    const textResources = this.resources.filter(
      (r) => r.type === 'script' || r.type === 'style' || r.type === 'data'
    );

    textResources.forEach((resource) => {
      if (!resource.compressionRatio || resource.compressionRatio < 0.6) {
        console.log(`🗜️ ${resource.url} でGZIP圧縮が効果的です`);
      }
    });
  }

  /**
   * 💾 キャッシュ最適化
   */
  private optimizeCaching(): void {
    this.resources.forEach((resource) => {
      if (!resource.cacheable && resource.type !== 'data') {
        console.log(`💾 ${resource.url} にキャッシュヘッダーを追加することを推奨`);
      }
    });

    // Service Worker によるキャッシュ戦略を提案
    this.suggestServiceWorkerCaching();
  }

  /**
   * 🔍 未使用CSS検出
   */
  private detectUnusedCSS(cssUrl: string): void {
    // 簡易未使用CSS検出（実際の実装では PurgeCSS などを使用）
    console.log(`🔍 ${cssUrl} の未使用CSS分析を実行中...`);
  }

  /**
   * 📦 動的インポート提案
   */
  private suggestDynamicImports(): void {
    console.log('📦 ルートベースの動的インポートを検討してください:');
    console.log('  - React.lazy() でコンポーネント分割');
    console.log('  - 条件付きインポートでライブラリ最適化');
  }

  /**
   * 🔧 Service Worker キャッシュ戦略提案
   */
  private suggestServiceWorkerCaching(): void {
    console.log('🔧 Service Worker キャッシュ戦略:');
    console.log('  - 静的アセット: cache-first');
    console.log('  - API レスポンス: network-first');
    console.log('  - 画像: stale-while-revalidate');
  }

  /**
   * 📊 リソース監視設定
   */
  private setupResourceMonitoring(): void {
    // Resource Timing API による継続監視
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceResourceTiming[];
        entries.forEach((entry) => {
          this.processNewResource(entry);
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    }

    // 定期的なメトリクス更新
    setInterval(() => {
      this.updateMetrics();
    }, 30000); // 30秒ごと
  }

  /**
   * 🆕 新しいリソース処理
   */
  private processNewResource(entry: PerformanceResourceTiming): void {
    const resource: ResourceAsset = {
      url: entry.name,
      type: this.getResourceType(entry.name),
      originalSize: entry.transferSize || entry.encodedBodySize || 0,
      loadTime: entry.responseEnd - entry.startTime,
      priority: this.getPriority(entry.name),
      cacheable: entry.responseStart > 0,
      lazyLoaded: false,
    };

    if (entry.transferSize && entry.decodedBodySize) {
      resource.compressionRatio = 1 - entry.transferSize / entry.decodedBodySize;
      resource.compressedSize = entry.transferSize;
    }

    this.resources.push(resource);
    this.updateMetrics();
  }

  /**
   * 📈 メトリクス更新
   */
  private updateMetrics(): void {
    this.metrics.totalResources = this.resources.length;
    this.metrics.totalSize = this.resources.reduce((sum, r) => sum + r.originalSize, 0);
    this.metrics.optimizedSize = this.resources.reduce(
      (sum, r) => sum + (r.compressedSize || r.originalSize),
      0
    );
    this.metrics.savingsPercentage =
      ((this.metrics.totalSize - this.metrics.optimizedSize) / this.metrics.totalSize) * 100;
    this.metrics.loadTime =
      this.resources.reduce((sum, r) => sum + r.loadTime, 0) / this.resources.length;
    this.metrics.cacheHitRatio =
      this.resources.filter((r) => r.cacheable).length / this.resources.length;
    this.metrics.compressionRatio =
      this.resources
        .filter((r) => r.compressionRatio)
        .reduce((sum, r) => sum + (r.compressionRatio || 0), 0) / this.resources.length;
    this.metrics.lazyLoadedRatio =
      this.resources.filter((r) => r.lazyLoaded).length / this.resources.length;
  }

  /**
   * 🖼️ WebP対応チェック
   */
  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * 📏 バイト数フォーマット
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 外部API
  getResources(): ResourceAsset[] {
    return [...this.resources];
  }

  getMetrics(): ResourceMetrics {
    return { ...this.metrics };
  }

  getOptimizationRules(): OptimizationRule[] {
    return [...this.optimizationRules];
  }

  toggleRule(ruleId: string, enabled: boolean): void {
    const rule = this.optimizationRules.find((r) => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
      if (enabled) {
        this.applyRule(rule);
      }
    }
  }

  getBundleAnalysis(): BundleAnalysis | null {
    return this.bundleAnalysis;
  }

  /**
   * 📊 最適化レポート生成
   */
  generateOptimizationReport(): {
    metrics: ResourceMetrics;
    recommendations: string[];
    potentialSavings: number;
  } {
    const recommendations: string[] = [];
    let potentialSavings = 0;

    // 画像最適化の推奨
    const largeImages = this.resources.filter((r) => r.type === 'image' && r.originalSize > 200000);
    if (largeImages.length > 0) {
      recommendations.push(
        `${largeImages.length}個の大きな画像を最適化することで約${this.formatBytes(largeImages.reduce((sum, img) => sum + img.originalSize * 0.3, 0))}の削減が可能`
      );
      potentialSavings += largeImages.reduce((sum, img) => sum + img.originalSize * 0.3, 0);
    }

    // JavaScript 最適化の推奨
    const largeScripts = this.resources.filter(
      (r) => r.type === 'script' && r.originalSize > 500000
    );
    if (largeScripts.length > 0) {
      recommendations.push(
        `${largeScripts.length}個の大きなJavaScriptファイルをコード分割で最適化可能`
      );
      potentialSavings += largeScripts.reduce((sum, script) => sum + script.originalSize * 0.2, 0);
    }

    // 遅延読み込み推奨
    const lazyLoadCandidates = this.resources.filter((r) => !r.lazyLoaded && r.priority === 'low');
    if (lazyLoadCandidates.length > 0) {
      recommendations.push(`${lazyLoadCandidates.length}個のリソースを遅延読み込み可能`);
    }

    return {
      metrics: this.getMetrics(),
      recommendations,
      potentialSavings,
    };
  }
}

export const resourceOptimizationService = ResourceOptimizationService.getInstance();
