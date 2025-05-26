export class ApiMetricsCollector {
  private static instance: ApiMetricsCollector;
  private metrics: Map<string, any> = new Map();
  
  static getInstance(): ApiMetricsCollector {
    if (!ApiMetricsCollector.instance) {
      ApiMetricsCollector.instance = new ApiMetricsCollector();
    }
    return ApiMetricsCollector.instance;
  }
  
  record(metric: string, value: any): void {
    this.metrics.set(metric, value);
  }
  
  incrementCounter(metric: string): void {
    const current = this.metrics.get(metric) || 0;
    this.metrics.set(metric, current + 1);
  }
  
  recordValue(metric: string, value: number): void {
    this.metrics.set(metric, value);
  }
  
  getMetrics(): Map<string, any> {
    return this.metrics;
  }
}