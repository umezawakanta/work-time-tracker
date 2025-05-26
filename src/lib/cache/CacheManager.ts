export enum CachePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export class CacheManager {
  set(key: string, value: any, priority: CachePriority): void {
    // Stub implementation
  }
  
  get(key: string): any {
    // Stub implementation
    return null;
  }
}

export default CacheManager;