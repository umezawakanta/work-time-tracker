export class FeatureManager {
  private static instance: FeatureManager;
  private features: Map<string, boolean> = new Map();
  private featureLimits: Map<string, any> = new Map();
  private userPlan: string = 'free';

  private constructor() {
    this.initializeFeatures();
  }

  static getInstance(): FeatureManager {
    if (!this.instance) {
      this.instance = new FeatureManager();
    }
    return this.instance;
  }

  private initializeFeatures() {
    this.features.set('batchRequests', true);
    this.features.set('caching', true);
    this.features.set('metrics', true);
    this.features.set('api.batchRequest', true);
  }

  checkFeature(feature: string): boolean {
    return this.features.get(feature) ?? false;
  }

  checkFeatureLimit(feature: string): any {
    return {
      allowed: true,
      limit: 100,
      used: 0,
      remaining: 100,
    };
  }

  getUserPlan(): string {
    return this.userPlan;
  }

  setUserPlan(plan: string): void {
    this.userPlan = plan;
  }

  incrementFeatureUsage(feature: string): void {
    const current = this.featureLimits.get(feature) || { used: 0 };
    current.used++;
    this.featureLimits.set(feature, current);
  }

  enableFeature(feature: string): void {
    this.features.set(feature, true);
  }

  disableFeature(feature: string): void {
    this.features.set(feature, false);
  }
}

export default FeatureManager;
