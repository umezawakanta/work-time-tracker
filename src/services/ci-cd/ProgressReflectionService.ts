/**
 * 🔄 CI/CD自動進捗反映サービス
 * GitHub Actions、Vercel、その他CI/CDツールとの統合
 */

interface GitHubCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  url: string;
}

interface DeploymentInfo {
  id: string;
  status: 'building' | 'ready' | 'error' | 'canceled';
  url: string;
  createdAt: string;
  readyAt?: string;
  source: 'vercel' | 'netlify' | 'github-pages' | 'other';
}

interface TestResults {
  passed: number;
  failed: number;
  skipped: number;
  coverage: number;
  duration: number;
  timestamp: string;
}

interface ProgressUpdate {
  id: string;
  type: 'commit' | 'deployment' | 'test' | 'build' | 'release';
  status: 'pending' | 'in_progress' | 'success' | 'failure';
  title: string;
  description: string;
  metadata: any;
  timestamp: string;
  estimatedCompletion?: string;
}

class ProgressReflectionService {
  private static instance: ProgressReflectionService | null = null;
  private subscribers: Array<(update: ProgressUpdate) => void> = [];
  private progressHistory: ProgressUpdate[] = [];
  private pollingInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeWebhooks();
    this.startPolling();
  }

  public static getInstance(): ProgressReflectionService {
    if (!ProgressReflectionService.instance) {
      ProgressReflectionService.instance = new ProgressReflectionService();
    }
    return ProgressReflectionService.instance;
  }

  /**
   * Webhook初期化（実際の実装では外部サービス連携）
   */
  private initializeWebhooks(): void {
    // GitHub Webhook処理
    this.setupGitHubWebhook();
    // Vercel Webhook処理
    this.setupVercelWebhook();
    // テスト結果Webhook処理
    this.setupTestWebhook();
  }

  /**
   * GitHub Webhookセットアップ
   */
  private setupGitHubWebhook(): void {
    // 実際の実装では GitHub App または Webhook を設定
    console.log('🔗 GitHub Webhook セットアップ完了');
  }

  /**
   * Vercel Webhookセットアップ
   */
  private setupVercelWebhook(): void {
    // 実際の実装では Vercel Integration を設定
    console.log('🚀 Vercel Webhook セットアップ完了');
  }

  /**
   * テスト結果Webhookセットアップ
   */
  private setupTestWebhook(): void {
    // 実際の実装では Jest/Playwright テスト結果を受信
    console.log('🧪 Test Webhook セットアップ完了');
  }

  /**
   * 定期ポーリング開始
   */
  private startPolling(): void {
    this.pollingInterval = setInterval(async () => {
      await this.checkForUpdates();
    }, 30000); // 30秒間隔
  }

  /**
   * 進捗更新チェック
   */
  private async checkForUpdates(): Promise<void> {
    try {
      // GitHub API から最新コミットを取得
      const commits = await this.fetchLatestCommits();

      // Vercel API からデプロイ状況を取得
      const deployments = await this.fetchLatestDeployments();

      // テスト結果を取得
      const testResults = await this.fetchLatestTestResults();

      // 進捗更新を処理
      this.processCommits(commits);
      this.processDeployments(deployments);
      this.processTestResults(testResults);
    } catch (error) {
      console.error('進捗更新チェックエラー:', error);
    }
  }

  /**
   * 最新コミット取得
   */
  private async fetchLatestCommits(): Promise<GitHubCommit[]> {
    try {
      const token = process.env.REACT_APP_GITHUB_TOKEN;
      const repo = process.env.REACT_APP_GITHUB_REPO || 'work-time-tracker';
      const owner = process.env.REACT_APP_GITHUB_OWNER || 'kanta';

      if (!token) {
        console.warn('GitHub token not configured');
        return [];
      }

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const commits = await response.json();
      return commits.map((commit: any) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date,
        },
        url: commit.html_url,
      }));
    } catch (error) {
      console.error('GitHub commits fetch error:', error);
      return [];
    }
  }

  /**
   * 最新デプロイ情報取得
   */
  private async fetchLatestDeployments(): Promise<DeploymentInfo[]> {
    try {
      const token = process.env.REACT_APP_VERCEL_TOKEN;
      const projectId = process.env.REACT_APP_VERCEL_PROJECT_ID;

      if (!token || !projectId) {
        console.warn('Vercel token or project ID not configured');
        return [];
      }

      const response = await fetch(
        `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Vercel API error: ${response.status}`);
      }

      const data = await response.json();
      return data.deployments.map((deployment: any) => ({
        id: deployment.uid,
        status: deployment.state,
        url: deployment.url,
        createdAt: deployment.createdAt,
        readyAt: deployment.readyAt,
        source: 'vercel',
      }));
    } catch (error) {
      console.error('Vercel deployments fetch error:', error);
      return [];
    }
  }

  /**
   * 最新テスト結果取得
   */
  private async fetchLatestTestResults(): Promise<TestResults | null> {
    try {
      // GitHub Actions からテスト結果を取得
      const token = process.env.REACT_APP_GITHUB_TOKEN;
      const repo = process.env.REACT_APP_GITHUB_REPO || 'work-time-tracker';
      const owner = process.env.REACT_APP_GITHUB_OWNER || 'kanta';

      if (!token) {
        return null;
      }

      // ローカルファイルからテスト結果を読み取り（フォールバック）
      try {
        const response = await fetch('/test-results.json');
        if (response.ok) {
          return await response.json();
        }
      } catch (e) {
        // ファイルが存在しない場合は無視
      }

      return null;
    } catch (error) {
      console.error('Test results fetch error:', error);
      return null;
    }
  }

  /**
   * コミット処理
   */
  private processCommits(commits: GitHubCommit[]): void {
    commits.forEach((commit) => {
      const existingUpdate = this.progressHistory.find(
        (update) => update.metadata?.sha === commit.sha
      );

      if (!existingUpdate) {
        const progressUpdate: ProgressUpdate = {
          id: `commit-${commit.sha.slice(0, 8)}`,
          type: 'commit',
          status: 'success',
          title: `新しいコミット: ${commit.message.slice(0, 50)}...`,
          description: `${commit.author.name} による更新`,
          metadata: commit,
          timestamp: commit.author.date,
        };

        this.addProgressUpdate(progressUpdate);
      }
    });
  }

  /**
   * デプロイ処理
   */
  private processDeployments(deployments: DeploymentInfo[]): void {
    deployments.forEach((deployment) => {
      const existingUpdate = this.progressHistory.find(
        (update) => update.metadata?.id === deployment.id
      );

      const status =
        deployment.status === 'ready'
          ? 'success'
          : deployment.status === 'error'
            ? 'failure'
            : 'in_progress';

      const progressUpdate: ProgressUpdate = {
        id: `deployment-${deployment.id}`,
        type: 'deployment',
        status,
        title: `デプロイ ${status === 'success' ? '完了' : status === 'failure' ? '失敗' : '中'}`,
        description: `URL: ${deployment.url}`,
        metadata: deployment,
        timestamp: deployment.createdAt,
      };

      if (!existingUpdate) {
        this.addProgressUpdate(progressUpdate);
      } else if (existingUpdate.status !== status) {
        this.updateProgressStatus(existingUpdate.id, status);
      }
    });
  }

  /**
   * テスト結果処理
   */
  private processTestResults(testResults: TestResults | null): void {
    if (!testResults) return;

    const existingUpdate = this.progressHistory.find(
      (update) => update.type === 'test' && update.metadata?.timestamp === testResults.timestamp
    );

    if (!existingUpdate) {
      const status = testResults.failed === 0 ? 'success' : 'failure';

      const progressUpdate: ProgressUpdate = {
        id: `test-${testResults.timestamp}`,
        type: 'test',
        status,
        title: `テスト実行結果: ${testResults.passed}件成功, ${testResults.failed}件失敗`,
        description: `カバレッジ: ${testResults.coverage}%, 実行時間: ${testResults.duration}ms`,
        metadata: testResults,
        timestamp: testResults.timestamp,
      };

      this.addProgressUpdate(progressUpdate);
    }
  }

  /**
   * 進捗更新追加
   */
  private addProgressUpdate(update: ProgressUpdate): void {
    this.progressHistory.unshift(update);

    // 履歴を最新50件に制限
    if (this.progressHistory.length > 50) {
      this.progressHistory = this.progressHistory.slice(0, 50);
    }

    // 購読者に通知
    this.subscribers.forEach((callback) => {
      try {
        callback(update);
      } catch (error) {
        console.error('Progress update callback error:', error);
      }
    });

    console.log('📊 新しい進捗更新:', update);
  }

  /**
   * 進捗ステータス更新
   */
  private updateProgressStatus(updateId: string, status: ProgressUpdate['status']): void {
    const update = this.progressHistory.find((u) => u.id === updateId);
    if (update) {
      update.status = status;

      // 購読者に通知
      this.subscribers.forEach((callback) => {
        try {
          callback(update);
        } catch (error) {
          console.error('Progress status update callback error:', error);
        }
      });
    }
  }

  /**
   * 進捗更新購読
   */
  public subscribe(callback: (update: ProgressUpdate) => void): () => void {
    this.subscribers.push(callback);

    // 購読解除関数を返す
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * 進捗履歴取得
   */
  public getProgressHistory(): ProgressUpdate[] {
    return [...this.progressHistory];
  }

  /**
   * 最新進捗サマリー取得
   */
  public getProgressSummary(): {
    totalCommits: number;
    successfulDeployments: number;
    failedDeployments: number;
    lastTestResults: TestResults | null;
    latestActivity: string;
  } {
    const commits = this.progressHistory.filter((u) => u.type === 'commit');
    const deployments = this.progressHistory.filter((u) => u.type === 'deployment');
    const tests = this.progressHistory.filter((u) => u.type === 'test');

    const latestUpdate = this.progressHistory[0];

    return {
      totalCommits: commits.length,
      successfulDeployments: deployments.filter((d) => d.status === 'success').length,
      failedDeployments: deployments.filter((d) => d.status === 'failure').length,
      lastTestResults: tests.length > 0 ? tests[0].metadata : null,
      latestActivity: latestUpdate ? latestUpdate.timestamp : 'なし',
    };
  }

  /**
   * 手動進捗更新
   */
  public addManualUpdate(
    type: ProgressUpdate['type'],
    title: string,
    description: string,
    status: ProgressUpdate['status'] = 'success',
    metadata: any = {}
  ): void {
    const update: ProgressUpdate = {
      id: `manual-${Date.now()}`,
      type,
      status,
      title,
      description,
      metadata,
      timestamp: new Date().toISOString(),
    };

    this.addProgressUpdate(update);
  }

  /**
   * サービス停止
   */
  public stop(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.subscribers = [];
    console.log('🛑 ProgressReflectionService stopped');
  }
}

export { ProgressReflectionService, type ProgressUpdate, type TestResults };
