import { BatchRequestItem, BatchRequestConfig } from './BatchRequestManager';

export class BatchRequestValidator {
  public validateBatchRequest(
    requests: readonly BatchRequestItem[],
    config: BatchRequestConfig
  ): void {
    if (requests.length === 0) {
      throw new Error('バッチリクエストが空です');
    }
    // 基本的な検証のみ実装
  }
}
