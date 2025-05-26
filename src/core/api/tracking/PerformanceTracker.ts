export class PerformanceTracker {
  private static instance: PerformanceTracker;
  
  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }
  
  track(metric: string, value: number): void {
    // Stub
  }
}