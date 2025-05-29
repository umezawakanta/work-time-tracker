export enum CachePriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
}

export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, unknown> = new Map();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set(key: string, value: unknown, _options?: unknown): void {
    this.cache.set(key, value);
  }

  get<T = unknown>(key: string): T | null {
    return (this.cache.get(key) as T) || null;
  }
}

export default CacheManager;
