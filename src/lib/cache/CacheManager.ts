export enum CachePriority {
  LOW = 'LOW',
  NORMAL = 'MEDIUM',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, any> = new Map();
  
  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }
  
  set(key: string, value: any, options?: any): void {
    this.cache.set(key, value);
  }
  
  get<T = any>(key: string): T | null {
    return this.cache.get(key) || null;
  }
}

export default CacheManager;