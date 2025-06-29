/**
 * 🏆 バッジ信頼性計算ユーティリティ
 * 固定のconfidence値を動的計算に置き換え
 */

import { dataGenerator } from './idGenerator';

export interface BadgeCalculationParams {
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  estimatedHours: number;
  dependencies: string[];
  category: string;
  targetWeek: number;
  progress?: number;
}

/**
 * バッジ達成の信頼性を動的計算
 */
export function calculateBadgeConfidence(params: BadgeCalculationParams): number {
  const { difficulty, estimatedHours, dependencies, category, targetWeek, progress = 0 } = params;

  // 基本信頼度（難易度に基づく）
  const baseDifficulty = {
    bronze: 90,
    silver: 85,
    gold: 80,
    platinum: 75,
    legendary: 70,
  };

  let confidence = baseDifficulty[difficulty];

  // 所要時間による調整（短すぎても長すぎても信頼性は下がる）
  const optimalHours = 30; // 最適な時間
  const hoursFactor = 1 - Math.abs(estimatedHours - optimalHours) / 100;
  confidence *= Math.max(0.8, hoursFactor);

  // 依存関係による調整（依存が多いほど不確実性が増す）
  const dependencyPenalty = Math.min(dependencies.length * 2, 10);
  confidence -= dependencyPenalty;

  // カテゴリによる調整（技術的なものほど予測しやすい）
  const categoryModifiers = {
    technical: 5,
    infrastructure: 3,
    devops: 4,
    performance: 2,
    marketing: -2,
    management: -3,
    education: 0,
    finance: 1,
  };

  const modifier = categoryModifiers[category as keyof typeof categoryModifiers] || 0;
  confidence += modifier;

  // 進捗による調整（すでに進んでいる場合は信頼性アップ）
  if (progress > 0) {
    confidence += progress * 0.2; // 進捗20%で4ポイント上昇
  }

  // 週数による調整（遠い未来ほど不確実）
  const weekPenalty = Math.min(targetWeek * 0.5, 10);
  confidence -= weekPenalty;

  // システム状況による微調整
  const systemHealth = dataGenerator.generateSystemHealth();
  const systemFactor = (systemHealth.uptime - 99) * 2; // 稼働率による微調整
  confidence += systemFactor;

  // 範囲を60-95に制限（現実的な範囲）
  return Math.round(Math.max(60, Math.min(95, confidence)));
}

/**
 * バッジ予測完了日を動的計算
 */
export function calculatePredictedCompletionDate(
  startDate: string,
  estimatedHours: number,
  difficulty: string,
  confidence: number
): string {
  const start = new Date(startDate);

  // 難易度による時間調整係数
  const difficultyFactors = {
    bronze: 0.9,
    silver: 1.0,
    gold: 1.2,
    platinum: 1.5,
    legendary: 2.0,
  };

  const factor = difficultyFactors[difficulty as keyof typeof difficultyFactors] || 1.0;

  // 信頼性が低い場合は追加時間を見込む
  const confidenceFactor = confidence < 80 ? 1.3 : 1.0;

  // 実際の作業時間を計算（1日8時間、週5日と仮定）
  const adjustedHours = estimatedHours * factor * confidenceFactor;
  const workDays = Math.ceil(adjustedHours / 8);
  const calendarDays = Math.ceil(workDays * 1.4); // 週末を考慮

  const completionDate = new Date(start);
  completionDate.setDate(start.getDate() + calendarDays);

  return completionDate.toISOString().split('T')[0];
}

/**
 * 進捗に基づく信頼性リアルタイム更新
 */
export function updateConfidenceBasedOnProgress(
  originalConfidence: number,
  currentProgress: number,
  timeElapsed: number,
  estimatedTotalTime: number
): number {
  // 進捗率と時間の比率から実際のペースを計算
  const expectedProgress = Math.min((timeElapsed / estimatedTotalTime) * 100, 100);
  const progressDifference = currentProgress - expectedProgress;

  let adjustedConfidence = originalConfidence;

  // 予定より早い場合は信頼性アップ
  if (progressDifference > 10) {
    adjustedConfidence += 10;
  } else if (progressDifference > 5) {
    adjustedConfidence += 5;
  }
  // 予定より遅い場合は信頼性ダウン
  else if (progressDifference < -10) {
    adjustedConfidence -= 15;
  } else if (progressDifference < -5) {
    adjustedConfidence -= 8;
  }

  return Math.round(Math.max(50, Math.min(98, adjustedConfidence)));
}

/**
 * カテゴリ別の標準信頼性を取得
 */
export function getStandardConfidenceByCategory(category: string): number {
  const standardConfidence = {
    technical: 85,
    infrastructure: 82,
    devops: 83,
    performance: 80,
    marketing: 75,
    management: 73,
    education: 78,
    finance: 77,
    ecommerce: 74,
    legal: 76,
    hr: 79,
    sales: 72,
    administration: 81,
  };

  return standardConfidence[category as keyof typeof standardConfidence] || 75;
}

/**
 * 複数バッジの依存関係を考慮した信頼性計算
 */
export function calculateGroupConfidence(badges: BadgeCalculationParams[]): number {
  if (badges.length === 0) {
    return 75;
  }

  const individualConfidences = badges.map((badge) => calculateBadgeConfidence(badge));

  // 個別信頼性の平均
  const averageConfidence =
    individualConfidences.reduce((sum, conf) => sum + conf, 0) / badges.length;

  // グループサイズによる調整（バッジが多いほど実現困難）
  const groupSizePenalty = Math.min(badges.length * 1.5, 12);

  // 依存関係の複雑さを評価
  const totalDependencies = badges.reduce((sum, badge) => sum + badge.dependencies.length, 0);
  const dependencyPenalty = Math.min(totalDependencies * 0.8, 8);

  const groupConfidence = averageConfidence - groupSizePenalty - dependencyPenalty;

  return Math.round(Math.max(55, Math.min(95, groupConfidence)));
}
