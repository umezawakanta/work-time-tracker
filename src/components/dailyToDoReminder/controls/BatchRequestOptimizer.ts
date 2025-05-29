import { BatchRequestItem } from './BatchRequestManager';

export class BatchRequestOptimizer {
  public optimizeRequests(requests: readonly BatchRequestItem[]): readonly BatchRequestItem[] {
    return requests; // 最適化なしで元のリクエストを返す
  }
}
