export class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: Map<string, any> = new Map();
  private activeTracking: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): PerformanceTracker {
    if (!this.instance) {
      this.instance = new PerformanceTracker();
    }
    return this.instance;
  }

  initialize(): void {
    console.log('Performance tracker initialized');
  }

  startTracking(): string {
    const trackingId = Math.random().toString(36).substr(2, 9);
    this.activeTracking.set(trackingId, Date.now());
    return trackingId;
  }

  stopTracking(trackingId: string, metadata?: any): void {
    const startTime = this.activeTracking.get(trackingId);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.metrics.set(trackingId, {
        duration,
        metadata,
        timestamp: new Date().toISOString(),
      });
      this.activeTracking.delete(trackingId);
    }
  }

  track(metric: string, value: number): void {
    const existing = this.metrics.get(metric) || [];
    existing.push({ value, timestamp: Date.now() });
    this.metrics.set(metric, existing);
  }

  saveMetrics(): void {
    const metricsData = Object.fromEntries(this.metrics);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('performance_metrics', JSON.stringify(metricsData));
    }
  }

  getMetrics(): Map<string, any> {
    return this.metrics;
  }
}

export default PerformanceTracker;
