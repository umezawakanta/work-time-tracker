/**
 * APIメトリクス収集クラス
 * APIパフォーマンスとエラー率を測定
 */
class ApiMetricsCollector {
    private requestCounts: Record<string, number> = {};
    private errorCounts: Record<string, number> = {};
    private responseTimesMs: Record<string, number[]> = {};
    private cacheHits: Record<string, number> = {};
    private cacheMisses: Record<string, number> = {};
    private activeRequests: Map<string, number> = new Map();
    
    /**
     * リクエスト開始時の記録
     */
    public startRequest(url: string, method: string): void {
      const key = this.getMetricKey(url, method);
      this.activeRequests.set(key, Date.now());
      
      if (!this.requestCounts[key]) {
        this.requestCounts[key] = 0;
      }
      
      this.requestCounts[key]++;
    }
    
    /**
     * リクエスト終了時の記録
     */
    public endRequest(
      url: string, 
      method: string, 
      statusCode: number, 
      processingTimeMs: number
    ): void {
      const key = this.getMetricKey(url, method);
      this.activeRequests.delete(key);
      
      if (!this.responseTimesMs[key]) {
        this.responseTimesMs[key] = [];
      }
      
      this.responseTimesMs[key].push(processingTimeMs);
      
      // レスポンス時間履歴を最大100件に制限
      if (this.responseTimesMs[key].length > 100) {
        this.responseTimesMs[key].shift();
      }
    }
    
    /**
     * エラーの記録
     */
    public recordError(url: string, errorMessage: string): void {
      const key = new URL(url).pathname;
      
      if (!this.errorCounts[key]) {
        this.errorCounts[key] = 0;
      }
      
      this.errorCounts[key]++;
    }
    
    /**
     * キャッシュヒットの記録
     */
    public recordCacheHit(endpoint: string): void {
      if (!this.cacheHits[endpoint]) {
        this.cacheHits[endpoint] = 0;
      }
      
      this.cacheHits[endpoint]++;
    }
    
    /**
     * キャッシュミスの記録
     */
    public recordCacheMiss(endpoint: string): void {
      if (!this.cacheMisses[endpoint]) {
        this.cacheMisses[endpoint] = 0;
      }
      
      this.cacheMisses[endpoint]++;
    }
    
    /**
     * メトリック用のキーを生成
     */
    private getMetricKey(url: string, method: string): string {
      const pathname = new URL(url).pathname;
      return `${method}:${pathname}`;
    }
    
    /**
     * 平均応答時間を計算
     */
    private calculateAverageResponseTime(endpoint: string): number | null {
      const times = this.responseTimesMs[endpoint];
      
      if (!times || times.length === 0) {
        return null;
      }
      
      const sum = times.reduce((acc, time) => acc + time, 0);
      return Math.round(sum / times.length);
    }
    
    /**
     * キャッシュヒット率を計算
     */
    private calculateCacheHitRate(endpoint: string): number | null {
      const hits = this.cacheHits[endpoint] || 0;
      const misses = this.cacheMisses[endpoint] || 0;
      const total = hits + misses;
      
      if (total === 0) {
        return null;
      }
      
      return Number((hits / total * 100).toFixed(1));
    }
    
    /**
     * すべてのメトリクスを取得
     */
    public getMetrics(): Record<string, unknown> {
      const endpoints = new Set([
        ...Object.keys(this.requestCounts),
        ...Object.keys(this.errorCounts),
        ...Object.keys(this.responseTimesMs)
      ]);
      
      const endpointMetrics: Record<string, unknown> = {};
      
      for (const endpoint of endpoints) {
        const requests = this.requestCounts[endpoint] || 0;
        const errors = this.errorCounts[endpoint] || 0;
        const errorRate = requests ? Number((errors / requests * 100).toFixed(1)) : 0;
        
        endpointMetrics[endpoint] = {
          requests,
          errors,
          errorRate,
          averageResponseTimeMs: this.calculateAverageResponseTime(endpoint),
          cacheHitRate: this.calculateCacheHitRate(endpoint)
        };
      }
      
      return {
        endpoints: endpointMetrics,
        activeRequests: this.activeRequests.size,
        totalRequests: Object.values(this.requestCounts).reduce((sum, count) => sum + count, 0),
        totalErrors: Object.values(this.errorCounts).reduce((sum, count) => sum + count, 0)
      };
    }
  }
  
  export default ApiMetricsCollector;