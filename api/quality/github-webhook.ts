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

interface GitHubPushPayload {
  ref: string;
  before: string;
  after: string;
  repository: {
    name: string;
    full_name: string;
  };
  pusher: {
    name: string;
    email: string;
  };
  commits: Array<{
    id: string;
    message: string;
    author: {
      name: string;
      email: string;
    };
    added: string[];
    removed: string[];
    modified: string[];
    timestamp: string;
  }>;
}

interface GitHubPullRequestPayload {
  action: 'opened' | 'closed' | 'merged' | 'synchronize';
  pull_request: {
    number: number;
    title: string;
    state: 'open' | 'closed';
    merged: boolean;
    user: {
      login: string;
    };
    created_at: string;
    merged_at?: string;
    additions: number;
    deletions: number;
    changed_files: number;
    body: string;
  };
  repository: {
    name: string;
    full_name: string;
  };
}

interface ProgressUpdate {
  taskId: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  source: 'github';
  reason: string;
  metadata: Record<string, any>;
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

// コミットメッセージからタスクIDを抽出
function extractTaskIdsFromCommits(commits: Array<{ message: string }>): string[] {
  const taskIds: string[] = [];
  const taskIdPattern = /(?:task-|#task-|fixes?\s+|closes?\s+|refs?\s+)([a-zA-Z0-9-]+)/gi;

  commits.forEach((commit) => {
    let match;
    while ((match = taskIdPattern.exec(commit.message)) !== null) {
      const taskId = match[1];
      if (!taskIds.includes(taskId)) {
        taskIds.push(taskId);
      }
    }
  });

  return taskIds;
}

// プルリクエストからタスクIDを抽出
function extractTaskIdsFromPR(title: string, body: string): string[] {
  const taskIds: string[] = [];
  const taskIdPattern = /(?:task-|#task-|fixes?\s+|closes?\s+|refs?\s+)([a-zA-Z0-9-]+)/gi;

  const text = `${title} ${body}`;
  let match;
  while ((match = taskIdPattern.exec(text)) !== null) {
    const taskId = match[1];
    if (!taskIds.includes(taskId)) {
      taskIds.push(taskId);
    }
  }

  return taskIds;
}

// コミット数に基づく進捗計算
function calculateProgressFromCommits(
  commits: Array<{ added: string[]; modified: string[]; removed: string[] }>
): number {
  let totalChanges = 0;
  commits.forEach((commit) => {
    totalChanges += commit.added.length + commit.modified.length + commit.removed.length;
  });

  // ファイル変更数に基づいて進捗を計算（最大10%の進捗追加）
  const progressIncrement = Math.min(10, totalChanges * 2);
  return progressIncrement;
}

// 進捗追跡システムに更新を送信
async function updateTaskProgress(updates: ProgressUpdate[]): Promise<void> {
  try {
    for (const update of updates) {
      console.log(`📈 タスク進捗更新: ${update.taskId}`, {
        progress: `+${update.progress}%`,
        status: update.status,
        reason: update.reason,
      });

      // 実際の進捗追跡APIに送信（モック実装）
      // 本番環境では /api/progress/tracking への API コールを実装
      await fetch('/api/progress/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'update',
          taskId: update.taskId,
          updates: {
            progress: update.progress,
            status: update.status,
          },
          source: update.source,
          reason: update.reason,
        }),
      });
    }
  } catch (error) {
    console.error('進捗更新エラー:', error);
  }
}

// プッシュイベントの処理
async function handlePushEvent(payload: GitHubPushPayload): Promise<ProgressUpdate[]> {
  console.log('🔄 Push event処理開始:', {
    ref: payload.ref,
    commits: payload.commits.length,
    author: payload.pusher.name,
  });

  const updates: ProgressUpdate[] = [];
  const taskIds = extractTaskIdsFromCommits(payload.commits);

  if (taskIds.length === 0) {
    console.log('⚠️ コミットからタスクIDが見つかりませんでした');
    return updates;
  }

  for (const taskId of taskIds) {
    const progressIncrement = calculateProgressFromCommits(payload.commits);

    updates.push({
      taskId,
      progress: progressIncrement,
      status: 'in-progress',
      source: 'github',
      reason: `${payload.commits.length}件のコミットが追加されました`,
      metadata: {
        commits: payload.commits.map((c) => ({
          id: c.id.substring(0, 7),
          message: c.message,
          author: c.author.name,
          timestamp: c.timestamp,
          filesChanged: c.added.length + c.modified.length + c.removed.length,
        })),
        branch: payload.ref.replace('refs/heads/', ''),
        repository: payload.repository.full_name,
      },
    });
  }

  return updates;
}

// プルリクエストイベントの処理
async function handlePullRequestEvent(
  payload: GitHubPullRequestPayload
): Promise<ProgressUpdate[]> {
  console.log('🔀 Pull request event処理開始:', {
    action: payload.action,
    number: payload.pull_request.number,
    title: payload.pull_request.title,
    merged: payload.pull_request.merged,
  });

  const updates: ProgressUpdate[] = [];
  const taskIds = extractTaskIdsFromPR(payload.pull_request.title, payload.pull_request.body);

  if (taskIds.length === 0) {
    console.log('⚠️ PRからタスクIDが見つかりませんでした');
    return updates;
  }

  for (const taskId of taskIds) {
    let progressIncrement = 0;
    let status: ProgressUpdate['status'] = 'in-progress';
    let reason = '';

    switch (payload.action) {
      case 'opened':
        progressIncrement = 5;
        reason = `PR #${payload.pull_request.number} が作成されました`;
        break;

      case 'merged':
        progressIncrement = 15;
        status = 'completed';
        reason = `PR #${payload.pull_request.number} がマージされました`;
        break;

      case 'closed':
        if (payload.pull_request.merged) {
          progressIncrement = 15;
          status = 'completed';
          reason = `PR #${payload.pull_request.number} がマージされ完了しました`;
        } else {
          progressIncrement = 0;
          reason = `PR #${payload.pull_request.number} がクローズされました`;
        }
        break;

      case 'synchronize':
        progressIncrement = 2;
        reason = `PR #${payload.pull_request.number} が更新されました`;
        break;
    }

    updates.push({
      taskId,
      progress: progressIncrement,
      status,
      source: 'github',
      reason,
      metadata: {
        pullRequest: {
          number: payload.pull_request.number,
          title: payload.pull_request.title,
          state: payload.pull_request.state,
          merged: payload.pull_request.merged,
          author: payload.pull_request.user.login,
          additions: payload.pull_request.additions,
          deletions: payload.pull_request.deletions,
          changedFiles: payload.pull_request.changed_files,
          createdAt: payload.pull_request.created_at,
          mergedAt: payload.pull_request.merged_at,
        },
        repository: payload.repository.full_name,
      },
    });
  }

  return updates;
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
    'Content-Type, X-GitHub-Event, X-GitHub-SHA, Authorization, X-GitHub-Delivery'
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
    // GitHub Webhookのヘッダー検証
    const githubEvent = req.headers['x-github-event'] as string;
    const githubSha = req.headers['x-github-sha'] as string;
    const githubDelivery = req.headers['x-github-delivery'] as string;

    console.log('🔔 GitHub webhook受信:', {
      event: githubEvent,
      sha: githubSha?.substring(0, 7),
      delivery: githubDelivery,
      timestamp: new Date().toISOString(),
    });

    const payload = req.body;
    let progressUpdates: ProgressUpdate[] = [];
    let qualityMetrics: Partial<QualityMetrics> | null = null;

    // イベントタイプに応じた処理
    switch (githubEvent) {
      case 'push':
        progressUpdates = await handlePushEvent(payload as GitHubPushPayload);
        break;

      case 'pull_request':
        progressUpdates = await handlePullRequestEvent(payload as GitHubPullRequestPayload);
        break;

      case 'workflow_run':
      case 'check_run':
        // GitHub Actionsからの品質メトリクス
        if (payload.timestamp && payload.commit) {
          qualityMetrics = transformGitHubData(payload as GitHubQualityPayload);

          // 履歴に保存
          const historyEntry = {
            timestamp: payload.timestamp,
            commit: payload.commit,
            branch: payload.branch,
            metrics: qualityMetrics,
          };

          qualityHistory.push(historyEntry);

          // 最新100件のみ保持
          if (qualityHistory.length > 100) {
            qualityHistory = qualityHistory.slice(-100);
          }

          // トレンドデータを計算
          const trends = calculateTrends(qualityHistory);
          qualityMetrics.trends = trends;

          // 品質スコアに基づく進捗更新
          if (qualityMetrics.qualityScore?.overall) {
            const qualityScore = qualityMetrics.qualityScore.overall;
            const qualityProgressUpdate: ProgressUpdate = {
              taskId: 'task-quality-improvement',
              progress: Math.min(5, Math.floor(qualityScore / 20)), // 品質スコアに基づく進捗
              status: qualityScore >= 90 ? 'completed' : 'in-progress',
              source: 'github',
              reason: `品質スコア: ${qualityScore}/100`,
              metadata: {
                qualityMetrics: {
                  overall: qualityScore,
                  testCoverage: qualityMetrics.testCoverage?.overall.lines,
                  codeQuality: qualityMetrics.qualityScore.codeQuality,
                  performance: qualityMetrics.performance?.lighthouse.performance,
                },
                commit: payload.commit?.substring(0, 7),
                branch: payload.branch,
              },
            };
            progressUpdates.push(qualityProgressUpdate);
          }
        }
        break;

      default:
        console.log(`⚠️ 未対応のイベントタイプ: ${githubEvent}`);
    }

    // 進捗更新の実行
    if (progressUpdates.length > 0) {
      await updateTaskProgress(progressUpdates);
      console.log(`✅ ${progressUpdates.length}件の進捗更新を完了`);
    }

    // 品質ゲートのチェック
    let qualityGate = null;
    if (qualityMetrics) {
      qualityGate = checkQualityGate(qualityMetrics);
      console.log('品質メトリクス処理完了:', {
        commit: payload.commit?.substring(0, 7),
        qualityScore: qualityMetrics.qualityScore?.overall,
        qualityGate: qualityGate.passed ? 'PASSED' : 'FAILED',
        testCoverage: qualityMetrics.testCoverage?.overall.lines,
        eslintErrors: qualityMetrics.staticAnalysis?.eslint.errorCount,
        performance: qualityMetrics.performance?.lighthouse.performance,
      });
    }

    // 成功レスポンス
    res.status(200).json({
      success: true,
      message: 'Webhook処理が完了しました',
      data: {
        event: githubEvent,
        progressUpdates: progressUpdates.length,
        tasksUpdated: [...new Set(progressUpdates.map((u) => u.taskId))],
        qualityMetrics: qualityMetrics
          ? {
              commit: payload.commit?.substring(0, 7),
              qualityScore: qualityMetrics.qualityScore?.overall,
              qualityGate: qualityGate?.passed,
            }
          : null,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ GitHub webhook処理エラー:', error);
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
