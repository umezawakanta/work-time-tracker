export class ApiMetricsCollector {
  private static instance: ApiMetricsCollector;
  private metrics: Map<string, any[]> = new Map();
  private counters: Map<string, number> = new Map();
  private activeRequests: Map<string, number> = new Map();
  
  private constructor() {}
  
  static getInstance(): ApiMetricsCollector {
    if (!this.instance) {
      this.instance = new ApiMetricsCollector();
    }
    return this.instance;
  }
  
  recordRequestDuration(
    serviceName: string,
    method: string,
    endpoint: string,
    duration: number
  ): void {
    const key = `${serviceName}:${method}:${endpoint}`;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    this.metrics.get(key)!.push({
      duration,
      timestamp: Date.now()
    });
  }
  
  startRequest(url: string, method: string): void {
    const key = `${method}:${url}`;
    this.activeRequests.set(key, Date.now());
  }
  
  endRequest(url: string, method: string, status: number, duration: number): void {
    const key = `${method}:${url}`;
    this.activeRequests.delete(key);
    this.recordRequestDuration('default', method, url, duration);
  }
  
  recordError(url: string, error: string): void {
    this.incrementCounter('errors');
  }
  
  incrementCounter(name: string): void {
    this.counters.set(name, (this.counters.get(name) || 0) + 1);
  }
  
  recordValue(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push({
      value,
      timestamp: Date.now()
    });
  }
  
  getAverageDuration(serviceName: string, method: string, endpoint: string): number {
    const key = `${serviceName}:${method}:${endpoint}`;
    const records = this.metrics.get(key);
    
    if (!records || records.length === 0) {
      return 0;
    }
    
    const totalDuration = records.reduce((sum, record) => sum + record.duration, 0);
    return totalDuration / records.length;
  }
  
  clearMetrics(): void {
    this.metrics.clear();
    this.counters.clear();
    this.activeRequests.clear();
  }
}

export default ApiMetricsCollector;