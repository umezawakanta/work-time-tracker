export class ApiMetricsCollector {
  private metrics: Map<string, any> = new Map();
  
  record(metric: string, value: any): void {
    this.metrics.set(metric, value);
  }
  
  getMetrics(): Map<string, any> {
    return this.metrics;
  }
}