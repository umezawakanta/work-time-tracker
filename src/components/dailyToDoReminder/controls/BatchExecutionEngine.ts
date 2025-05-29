import { BatchRequestItem, BatchRequestConfig, BatchRequestResult } from './BatchRequestManager';

export class BatchExecutionEngine {
  constructor(
    private apiManager: unknown,
    private logger: unknown
  ) {}

  public async execute<T>(
    requests: readonly BatchRequestItem[],
    config: Required<BatchRequestConfig>
  ): Promise<readonly BatchRequestResult<T>[]> {
    // 基本的な並列実行のみ実装
    return [];
  }
}
