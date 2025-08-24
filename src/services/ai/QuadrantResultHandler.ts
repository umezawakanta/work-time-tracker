// Interfaces for receiving results from QuadrantClassificationService
// Define importance/urgency score types and a result handler I/F only (no concrete impl)

export type Quadrant = 1 | 2 | 3 | 4;

/**
 * 重要度・緊急度スコア
 * Scale recommendation: 0–100 (0: lowest, 100: highest)
 */
export interface QuadrantScore {
  importance: number;
  urgency: number;
}

/**
 * 分類結果
 */
export interface QuadrantClassification {
  quadrant: Quadrant;
  score: QuadrantScore;
  confidence?: number; // 0–1
  rationale?: string; // モデルの根拠（任意）
}

/**
 * 入力タスク情報（必要最低限）
 */
export interface QuadrantInput {
  taskId?: string;
  title?: string;
  description?: string;
}

/**
 * 分類結果受け取り関数のI/F（非同期対応）
 */
export type QuadrantResultReceiver = (payload: {
  input: QuadrantInput;
  result: QuadrantClassification;
}) => void | Promise<void>;

/**
 * 空実装（雛形）。
 * 実装接続までは no-op として使えます。
 */
export const noopQuadrantResultReceiver: QuadrantResultReceiver = async () => {
  // no-op placeholder
};
