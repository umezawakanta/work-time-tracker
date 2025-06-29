/**
 * レポート共有機能のためのユーティリティ関数
 */

import { generateShareId, dataGenerator } from './idGenerator';

// 共有レポートのパラメータ型定義
export interface ShareReportParams {
  assets: number;
  debts: number;
  netWorth: number;
  assetGrowthRate: number;
  period?: string;
  includeTrends?: boolean;
  includeDetails?: boolean;
}

// 共有結果の型定義
export interface ShareResult {
  success: boolean;
  shareUrl?: string;
  expiresAt?: Date;
  error?: string;
}

/**
 * API操作の処理時間を動的計算
 */
const calculateApiProcessingTime = (operation: string, dataSize?: number): number => {
  const systemHealth = dataGenerator.generateSystemHealth();

  // 基本処理時間（操作タイプに基づく）
  const baseTime = {
    share: 800, // レポート共有
    fetch: 600, // データ取得
    history: 400, // 履歴取得
    revoke: 500, // 取り消し
  };

  const operationType = operation as keyof typeof baseTime;
  let processingTime = baseTime[operationType] || 600;

  // データサイズによる調整
  if (dataSize) {
    processingTime += Math.min(dataSize * 10, 500); // 最大500ms追加
  }

  // システム状況による調整
  const networkFactor = systemHealth.responseTime / 100; // 100msを基準とした係数
  const loadFactor = (2000 - systemHealth.throughput) / 2000; // スループットによる調整

  processingTime *= (networkFactor + loadFactor) / 2;

  // 200ms-2000msの範囲に制限
  return Math.round(Math.max(200, Math.min(2000, processingTime)));
};

/**
 * 資産/負債レポートを共有する
 * @param params 共有するレポートのパラメータ
 * @returns 共有結果のPromise
 */
export const shareReport = async (params: ShareReportParams): Promise<ShareResult> => {
  try {
    // 実際のアプリではAPIリクエストを送信してレポート共有URLを取得します
    // このデモではモックの応答を返します

    // APIリクエストをシミュレート（動的処理時間）
    const dataSize = Object.keys(params).length; // パラメータ数を複雑度の指標とする
    const processingTime = calculateApiProcessingTime('share', dataSize);
    await new Promise((resolve) => setTimeout(resolve, processingTime));

    // 共有URLを生成（デモ用）
    const shareId = generateShareId();
    const shareUrl = `https://example.com/shared-reports/${shareId}`;

    // パラメータを使用して何かを行う（ESLintエラー修正のため）
    console.log('共有するレポートの詳細:', params);

    // クリップボードにURLをコピー（実際のアプリでの実装例）
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
    }

    // 有効期限を設定（30日後）
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    return {
      success: true,
      shareUrl,
      expiresAt,
    };
  } catch (error) {
    console.error('レポート共有エラー:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー',
    };
  }
};

/**
 * 共有URLから報告書データを取得する
 * @param shareId 共有ID
 * @returns 共有レポートデータのPromise
 */
export const getSharedReport = async (shareId: string): Promise<ShareReportParams | null> => {
  try {
    // 実際のアプリではAPIリクエストを送信して共有レポートデータを取得します
    // このデモではモックの応答を返します

    // APIリクエストをシミュレート（動的処理時間）
    const processingTime = calculateApiProcessingTime('fetch', shareId.length);
    await new Promise((resolve) => setTimeout(resolve, processingTime));

    // 共有IDが有効かチェック（実際のアプリではサーバーサイドで検証）
    if (!shareId || shareId.length < 5) {
      return null;
    }

    console.log('取得しようとしている共有ID:', shareId);

    // モックデータを返す
    return {
      assets: 12500000,
      debts: 3000000,
      netWorth: 9500000,
      assetGrowthRate: 7.5,
      period: '2023年4月～2024年3月',
      includeTrends: true,
      includeDetails: false,
    };
  } catch (error) {
    console.error('共有レポート取得エラー:', error);
    return null;
  }
};

/**
 * 共有レポートへのアクセス履歴を取得する
 * @param shareId 共有ID
 * @returns アクセス履歴のPromise
 */
export const getShareAccessHistory = async (
  shareId: string
): Promise<{ date: Date; ip: string }[]> => {
  try {
    // 実際のアプリではAPIリクエストを送信してアクセス履歴を取得します
    // このデモではモックの応答を返します

    // APIリクエストをシミュレート（動的処理時間）
    const processingTime = calculateApiProcessingTime('history');
    await new Promise((resolve) => setTimeout(resolve, processingTime));

    console.log('アクセス履歴を取得する共有ID:', shareId);

    // モックデータを返す
    return [
      { date: new Date(Date.now() - 86400000 * 2), ip: '192.168.1.xxx' },
      { date: new Date(Date.now() - 86400000), ip: '192.168.1.xxx' },
      { date: new Date(), ip: '192.168.1.xxx' },
    ];
  } catch (error) {
    console.error('アクセス履歴取得エラー:', error);
    return [];
  }
};

/**
 * 共有レポートを取り消す
 * @param shareId 共有ID
 * @returns 成功したかどうか
 */
export const revokeSharedReport = async (shareId: string): Promise<boolean> => {
  try {
    // 実際のアプリではAPIリクエストを送信して共有を取り消します
    // このデモではモックの応答を返します

    // APIリクエストをシミュレート（動的処理時間）
    const processingTime = calculateApiProcessingTime('revoke', shareId.length);
    await new Promise((resolve) => setTimeout(resolve, processingTime));

    console.log('取り消す共有ID:', shareId);

    // 成功を返す
    return true;
  } catch (error) {
    console.error('共有レポート取り消しエラー:', error);
    return false;
  }
};
