import { NextApiRequest, NextApiResponse } from 'next';
import { QualityMetrics } from '../../src/services/quality/QualityAnalysisService';

interface GitHubQualityPayload {
  timestamp: string;
  commit: string;
  branch: string;
  trigger: string;
  testCoverage: {
    overall: {
      lines: number;
      statements: number;
      functions: number;
      branches: number;
    };
  };
  staticAnalysis: {
    eslint: {
      errorCount: number;
      warningCount: number;
      totalFiles: number;
    };
    typescript: {
      errorCount: number;
    };
  };
  performance: {
    lighthouse: {
      performance: number;
      accessibility: number;
      bestPractices: number;
      seo: number;
    };
  };
}

// GitHub Actionsからのデータを品質メトリクスに変換
function transformGitHubData(payload: GitHubQualityPayload): Partial<QualityMetrics> {
  const qualityScore = {
    testing: payload.testCoverage.overall.lines,
    codeQuality: Math.max(
      0,
      100 -
        (payload.staticAnalysis.eslint.errorCount * 10 +
          payload.staticAnalysis.eslint.warningCount * 5)
    ),
    performance: payload.performance.lighthouse.performance,
    maintainability: Math.max(0, 100 - payload.staticAnalysis.typescript.errorCount * 5),
    overall: 0,
  };

  qualityScore.overall = Math.round(
    (qualityScore.testing +
      qualityScore.codeQuality +
      qualityScore.performance +
      qualityScore.maintainability) /
      4
  );

  return {
    testCoverage: {
      overall: payload.testCoverage.overall,
      files: [], // GitHub Actionsからは詳細ファイル情報は送らない
      summary: {
        total: 1000,
        covered: Math.round((1000 * payload.testCoverage.overall.lines) / 100),
        skipped: 10,
        pct: payload.testCoverage.overall.lines,
      },
      timestamp: payload.timestamp,
    },
    staticAnalysis: {
      eslint: {
        totalFiles: payload.staticAnalysis.eslint.totalFiles,
        totalIssues:
          payload.staticAnalysis.eslint.errorCount + payload.staticAnalysis.eslint.warningCount,
        errorCount: payload.staticAnalysis.eslint.errorCount,
        warningCount: payload.staticAnalysis.eslint.warningCount,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        issues: [], // 詳細な問題はGitHub Actionsサマリーで確認
      },
      typescript: {
        totalFiles: payload.staticAnalysis.eslint.totalFiles,
        totalErrors: payload.staticAnalysis.typescript.errorCount,
        errors: [],
      },
      timestamp: payload.timestamp,
    },
    performance: {
      lighthouse: {
        ...payload.performance.lighthouse,
        pwa: 76, // GitHub Actionsから取得されない場合のデフォルト値
      },
      metrics: {
        firstContentfulPaint: 1.2,
        largestContentfulPaint: 2.1,
        firstInputDelay: 8,
        cumulativeLayoutShift: 0.05,
        speedIndex: 1.8,
        totalBlockingTime: 150,
      },
      opportunities: [
        {
          id: 'ci-generated',
          title: 'CI/CDパイプラインで検出された改善機会',
          description: 'GitHub Actionsでの分析結果を確認してください',
          score: 0.8,
          numericValue: 100,
          displayValue: 'CI分析結果',
        },
      ],
      timestamp: payload.timestamp,
    },
    qualityScore,
    trends: [], // トレンドは別途計算
    lastUpdated: payload.timestamp,
  };
}

// 品質データストレージ（実際の実装では永続化が必要）
let qualityHistory: Array<{
  timestamp: string;
  commit: string;
  branch: string;
  metrics: Partial<QualityMetrics>;
}> = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-GitHub-Event, X-GitHub-SHA, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
    return;
  }

  try {
    // GitHub Actionsからのヘッダー検証
    const githubEvent = req.headers['x-github-event'] as string;
    const githubSha = req.headers['x-github-sha'] as string;

    console.log('GitHub webhook received:', {
      event: githubEvent,
      sha: githubSha?.substring(0, 7),
      timestamp: new Date().toISOString(),
    });

    // ペイロードの検証
    const payload = req.body as GitHubQualityPayload;

    if (!payload.timestamp || !payload.commit) {
      res.status(400).json({
        success: false,
        error: 'Invalid payload: missing required fields',
      });
      return;
    }

    // GitHub Actionsデータを品質メトリクスに変換
    const transformedMetrics = transformGitHubData(payload);

    // 履歴に保存（実際の実装では永続化）
    const historyEntry = {
      timestamp: payload.timestamp,
      commit: payload.commit,
      branch: payload.branch,
      metrics: transformedMetrics,
    };

    qualityHistory.push(historyEntry);

    // 最新100件のみ保持
    if (qualityHistory.length > 100) {
      qualityHistory = qualityHistory.slice(-100);
    }

    // トレンドデータを計算
    const trends = calculateTrends(qualityHistory);
    transformedMetrics.trends = trends;

    // 品質ゲートのチェック
    const qualityGate = checkQualityGate(transformedMetrics);

    console.log('Quality metrics processed:', {
      commit: payload.commit.substring(0, 7),
      qualityScore: transformedMetrics.qualityScore?.overall,
      qualityGate: qualityGate.passed ? 'PASSED' : 'FAILED',
      testCoverage: transformedMetrics.testCoverage?.overall.lines,
      eslintErrors: transformedMetrics.staticAnalysis?.eslint.errorCount,
      performance: transformedMetrics.performance?.lighthouse.performance,
    });

    // レスポンス
    res.status(200).json({
      success: true,
      message: 'Quality metrics updated successfully',
      data: {
        commit: payload.commit.substring(0, 7),
        branch: payload.branch,
        qualityScore: transformedMetrics.qualityScore?.overall,
        qualityGate: qualityGate.passed,
        metrics: {
          testCoverage: transformedMetrics.testCoverage?.overall.lines,
          eslintErrors: transformedMetrics.staticAnalysis?.eslint.errorCount,
          performance: transformedMetrics.performance?.lighthouse.performance,
        },
        timestamp: payload.timestamp,
      },
    });
  } catch (error) {
    console.error('GitHub webhook processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// トレンドデータの計算
function calculateTrends(history: Array<{ timestamp: string; metrics: Partial<QualityMetrics> }>) {
  // 過去30日間のデータを生成
  const trends: Array<{
    date: string;
    testCoverage: number;
    eslintScore: number;
    performanceScore: number;
    overallScore: number;
  }> = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // その日のデータがあるかチェック
    const dayData = history.find((h) => h.timestamp.startsWith(dateStr));

    if (dayData && dayData.metrics) {
      trends.push({
        date: dateStr,
        testCoverage: dayData.metrics.testCoverage?.overall.lines || 0,
        eslintScore: dayData.metrics.qualityScore?.codeQuality || 0,
        performanceScore: dayData.metrics.performance?.lighthouse.performance || 0,
        overallScore: dayData.metrics.qualityScore?.overall || 0,
      });
    } else {
      // データがない日は前日の値を使用（線形補間）
      const prevData = trends[trends.length - 1];
      if (prevData) {
        trends.push({
          date: dateStr,
          testCoverage: prevData.testCoverage,
          eslintScore: prevData.eslintScore,
          performanceScore: prevData.performanceScore,
          overallScore: prevData.overallScore,
        });
      } else {
        // 初期値
        trends.push({
          date: dateStr,
          testCoverage: 75,
          eslintScore: 85,
          performanceScore: 80,
          overallScore: 80,
        });
      }
    }
  }

  return trends;
}

// 品質ゲートのチェック
function checkQualityGate(metrics: Partial<QualityMetrics>) {
  const failures: string[] = [];
  const recommendations: string[] = [];

  // テストカバレッジのチェック
  if (metrics.testCoverage && metrics.testCoverage.overall.lines < 80) {
    failures.push(
      `テストカバレッジが基準値を下回っています: ${metrics.testCoverage.overall.lines}% < 80%`
    );
  }

  // 静的解析のチェック
  if (metrics.staticAnalysis?.eslint.errorCount && metrics.staticAnalysis.eslint.errorCount > 0) {
    failures.push(`ESLintエラーが${metrics.staticAnalysis.eslint.errorCount}件存在します`);
  }

  if (
    metrics.staticAnalysis?.typescript.totalErrors &&
    metrics.staticAnalysis.typescript.totalErrors > 0
  ) {
    failures.push(`TypeScriptエラーが${metrics.staticAnalysis.typescript.totalErrors}件存在します`);
  }

  // パフォーマンスのチェック
  if (
    metrics.performance?.lighthouse.performance &&
    metrics.performance.lighthouse.performance < 85
  ) {
    failures.push(
      `パフォーマンススコアが基準値を下回っています: ${metrics.performance.lighthouse.performance} < 85`
    );
  }

  // 推奨事項
  if (metrics.testCoverage && metrics.testCoverage.overall.lines < 90) {
    recommendations.push('テストカバレッジを90%以上に向上させることを推奨します');
  }

  if (
    metrics.staticAnalysis?.eslint.warningCount &&
    metrics.staticAnalysis.eslint.warningCount > 10
  ) {
    recommendations.push('ESLint警告を10件以下に削減することを推奨します');
  }

  return {
    passed: failures.length === 0,
    failures,
    recommendations,
  };
}

// データ取得用のエクスポート（他のAPIエンドポイントから使用）
export { qualityHistory };
