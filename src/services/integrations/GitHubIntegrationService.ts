/**
 * 🐙 GitHub統合サービス
 * 自動プルリクエスト、Issue管理、コード分析
 */

export interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
  branch: string;
}

export interface PullRequestData {
  title: string;
  body: string;
  head: string;
  base: string;
  files: Array<{
    path: string;
    content: string;
    encoding?: 'utf-8' | 'base64';
  }>;
}

export interface IssueData {
  title: string;
  body: string;
  labels: string[];
  assignees?: string[];
  milestone?: number;
}

export interface CommitData {
  message: string;
  files: Array<{
    path: string;
    content: string;
  }>;
  branch: string;
}

class GitHubIntegrationService {
  private static instance: GitHubIntegrationService | null = null;
  private config: GitHubConfig | null = null;
  private baseUrl = 'https://api.github.com';

  public static getInstance(): GitHubIntegrationService {
    if (!GitHubIntegrationService.instance) {
      GitHubIntegrationService.instance = new GitHubIntegrationService();
    }
    return GitHubIntegrationService.instance;
  }

  /**
   * GitHub設定を初期化
   */
  public initialize(config: GitHubConfig): void {
    this.config = config;
    console.log(`🐙 GitHub統合を初期化: ${config.owner}/${config.repo}`);
  }

  /**
   * 自動改善プルリクエストを作成
   */
  public async createImprovementPullRequest(
    improvements: Array<{
      title: string;
      description: string;
      files: string[];
      changes: string[];
    }>
  ): Promise<{ url: string; number: number } | null> {
    if (!this.config) {
      console.error('❌ GitHub設定が初期化されていません');
      return null;
    }

    try {
      console.log('🚀 自動改善プルリクエストを作成中...');

      const branchName = `auto-improvement-${Date.now()}`;
      const title = `🤖 自動改善: ${improvements.map((i) => i.title).join(', ')}`;

      const body = this.generatePRBody(improvements);

      // 新しいブランチを作成
      await this.createBranch(branchName);

      // ファイルの変更をコミット
      const files = await this.generateImprovementFiles(improvements);
      await this.commitFiles({
        message: title,
        files,
        branch: branchName,
      });

      // プルリクエストを作成
      const pr = await this.createPullRequest({
        title,
        body,
        head: branchName,
        base: this.config.branch,
        files,
      });

      console.log(`✅ プルリクエスト作成完了: ${pr.url}`);
      return pr;
    } catch (error) {
      console.error('❌ プルリクエスト作成エラー:', error);
      return null;
    }
  }

  /**
   * バグレポートIssueを自動作成
   */
  public async createBugIssue(bugData: {
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    steps: string[];
    environment: string;
  }): Promise<{ url: string; number: number } | null> {
    if (!this.config) return null;

    try {
      const issueData: IssueData = {
        title: `🐛 ${bugData.title}`,
        body: this.generateBugIssueBody(bugData),
        labels: ['bug', `severity-${bugData.severity}`, 'auto-generated'],
      };

      const issue = await this.createIssue(issueData);
      console.log(`🐛 バグIssue作成完了: ${issue.url}`);
      return issue;
    } catch (error) {
      console.error('❌ バグIssue作成エラー:', error);
      return null;
    }
  }

  /**
   * 機能リクエストIssueを作成
   */
  public async createFeatureRequest(featureData: {
    title: string;
    description: string;
    rationale: string;
    acceptance: string[];
    priority: 'critical' | 'high' | 'medium' | 'low';
  }): Promise<{ url: string; number: number } | null> {
    if (!this.config) return null;

    try {
      const issueData: IssueData = {
        title: `✨ ${featureData.title}`,
        body: this.generateFeatureIssueBody(featureData),
        labels: ['enhancement', `priority-${featureData.priority}`, 'auto-generated'],
      };

      const issue = await this.createIssue(issueData);
      console.log(`✨ 機能リクエストIssue作成完了: ${issue.url}`);
      return issue;
    } catch (error) {
      console.error('❌ 機能リクエストIssue作成エラー:', error);
      return null;
    }
  }

  /**
   * リポジトリの統計を取得
   */
  public async getRepositoryStats(): Promise<{
    stars: number;
    forks: number;
    openIssues: number;
    openPRs: number;
    commits: number;
    contributors: number;
  } | null> {
    if (!this.config) return null;

    try {
      const repoResponse = await this.apiCall(`/repos/${this.config.owner}/${this.config.repo}`);
      const issuesResponse = await this.apiCall(
        `/repos/${this.config.owner}/${this.config.repo}/issues?state=open`
      );
      const prsResponse = await this.apiCall(
        `/repos/${this.config.owner}/${this.config.repo}/pulls?state=open`
      );
      const contributorsResponse = await this.apiCall(
        `/repos/${this.config.owner}/${this.config.repo}/contributors`
      );

      return {
        stars: repoResponse.stargazers_count,
        forks: repoResponse.forks_count,
        openIssues: issuesResponse.length,
        openPRs: prsResponse.length,
        commits: repoResponse.default_branch_commits || 0,
        contributors: contributorsResponse.length,
      };
    } catch (error) {
      console.error('❌ リポジトリ統計取得エラー:', error);
      return null;
    }
  }

  /**
   * 最近のコミット履歴を分析
   */
  public async analyzeRecentCommits(days: number = 7): Promise<{
    totalCommits: number;
    commitsPerDay: number;
    topContributors: string[];
    frequentlyChangedFiles: string[];
  } | null> {
    if (!this.config) return null;

    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const commits = await this.apiCall(
        `/repos/${this.config.owner}/${this.config.repo}/commits?since=${since}`
      );

      const contributors = commits.map((c: any) => c.author?.login).filter(Boolean);
      const files = commits.flatMap((c: any) => c.files?.map((f: any) => f.filename) || []);

      return {
        totalCommits: commits.length,
        commitsPerDay: commits.length / days,
        topContributors: this.getTopItems(contributors, 5),
        frequentlyChangedFiles: this.getTopItems(files, 10),
      };
    } catch (error) {
      console.error('❌ コミット分析エラー:', error);
      return null;
    }
  }

  // === プライベートメソッド ===

  private async createBranch(branchName: string): Promise<void> {
    // ブランチ作成のロジック（GitHub API）
    console.log(`🌿 ブランチ作成: ${branchName}`);
  }

  private async commitFiles(commitData: CommitData): Promise<void> {
    // ファイルコミットのロジック
    console.log(`💾 ファイルコミット: ${commitData.message}`);
  }

  private async createPullRequest(
    prData: PullRequestData
  ): Promise<{ url: string; number: number }> {
    // プルリクエスト作成のロジック（模擬）
    return {
      url: `https://github.com/${this.config!.owner}/${this.config!.repo}/pull/123`,
      number: 123,
    };
  }

  private async createIssue(issueData: IssueData): Promise<{ url: string; number: number }> {
    // Issue作成のロジック（模擬）
    return {
      url: `https://github.com/${this.config!.owner}/${this.config!.repo}/issues/456`,
      number: 456,
    };
  }

  private async apiCall(endpoint: string, options?: any): Promise<any> {
    if (!this.config) throw new Error('GitHub設定が初期化されていません');

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        Authorization: `token ${this.config.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private generatePRBody(
    improvements: Array<{ title: string; description: string; changes: string[] }>
  ): string {
    let body = `## 🤖 自動改善プルリクエスト

このプルリクエストは自己改善エンジンによって自動生成されました。

### 📋 改善内容

`;

    improvements.forEach((improvement, index) => {
      body += `#### ${index + 1}. ${improvement.title}

${improvement.description}

**変更点:**
${improvement.changes.map((change) => `- ${change}`).join('\n')}

`;
    });

    body += `
### 🔍 検証方法

- [ ] ビルドが成功することを確認
- [ ] テストが全て通ることを確認  
- [ ] 機能が正常に動作することを確認
- [ ] パフォーマンスが改善されていることを確認

### 🚀 マージ後の効果

この改善により、以下の効果が期待されます：
- コード品質の向上
- パフォーマンスの改善
- ユーザー体験の向上
- 保守性の向上

---
*このプルリクエストは自動生成されました。問題がある場合はIssueを作成してください。*
`;

    return body;
  }

  private generateBugIssueBody(bugData: {
    description: string;
    severity: string;
    steps: string[];
    environment: string;
  }): string {
    return `## 🐛 バグレポート

### 📝 説明
${bugData.description}

### 🚨 重要度
${bugData.severity}

### 🔄 再現手順
${bugData.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

### 🖥️ 環境
${bugData.environment}

### 📱 期待される動作
正常に動作すること

---
*このIssueは自動生成されました。*`;
  }

  private generateFeatureIssueBody(featureData: {
    description: string;
    rationale: string;
    acceptance: string[];
    priority: string;
  }): string {
    return `## ✨ 機能リクエスト

### 📝 説明
${featureData.description}

### 🤔 理由
${featureData.rationale}

### ✅ 受け入れ条件
${featureData.acceptance.map((criteria) => `- [ ] ${criteria}`).join('\n')}

### 🎯 優先度
${featureData.priority}

---
*このIssueは自動生成されました。*`;
  }

  private async generateImprovementFiles(
    improvements: Array<{
      title: string;
      files: string[];
      changes: string[];
    }>
  ): Promise<Array<{ path: string; content: string }>> {
    // 改善用のファイル内容を生成
    return [];
  }

  private getTopItems(items: string[], count: number): string[] {
    const frequency = items.reduce(
      (acc, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([item]) => item);
  }
}

export const gitHubIntegrationService = GitHubIntegrationService.getInstance();
