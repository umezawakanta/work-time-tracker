import {
  GitHubCommit,
  GitHubCommitsResponse,
  GitHubApiConfig,
  CommitSearchParams,
  EnhancedCommit,
  UpdateHistoryStats,
} from '@/types/github';

interface BranchCreateOptions {
  projectId: string;
  taskId: string;
  description: string;
}

interface PullRequestOptions {
  branchName: string;
  title: string;
  description: string;
  projectId: string;
}

interface PullRequestResult {
  url: string;
}

export class GitHubService {
  private config: GitHubApiConfig;
  private baseUrl: string;

  constructor(config: GitHubApiConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.github.com';
  }

  /**
   * GitHub APIリクエストの共通ヘッダー
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    if (this.config.accessToken) {
      headers['Authorization'] = `token ${this.config.accessToken}`;
    }

    return headers;
  }

  /**
   * APIリクエストの実行
   */
  private async makeRequest<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('GitHub API rate limit exceeded');
        }
        if (response.status === 404) {
          throw new Error('Repository not found');
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GitHub API request failed:', error);
      throw error;
    }
  }

  /**
   * コミット履歴を取得
   */
  async getCommits(params: CommitSearchParams = {}): Promise<GitHubCommit[]> {
    const queryParams = new URLSearchParams();

    if (params.sha) queryParams.append('sha', params.sha);
    if (params.path) queryParams.append('path', params.path);
    if (params.author) queryParams.append('author', params.author);
    if (params.since) queryParams.append('since', params.since);
    if (params.until) queryParams.append('until', params.until);
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.page) queryParams.append('page', params.page.toString());

    // デフォルトで最新50件を取得
    if (!params.per_page) queryParams.append('per_page', '50');

    const url = `${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/commits?${queryParams}`;
    return await this.makeRequest<GitHubCommit[]>(url);
  }

  /**
   * 特定のコミットの詳細情報を取得
   */
  async getCommitDetail(sha: string): Promise<GitHubCommit> {
    const url = `${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/commits/${sha}`;
    return await this.makeRequest<GitHubCommit>(url);
  }

  /**
   * リポジトリ情報を取得
   */
  async getRepository() {
    const url = `${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}`;
    return await this.makeRequest(url);
  }

  /**
   * コミットタイプを判定
   */
  private determineCommitType(message: string): EnhancedCommit['commitType'] {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.startsWith('feat:') || lowerMessage.includes('feature')) return 'feat';
    if (lowerMessage.startsWith('fix:') || lowerMessage.includes('bug')) return 'fix';
    if (lowerMessage.startsWith('docs:') || lowerMessage.includes('document')) return 'docs';
    if (lowerMessage.startsWith('style:') || lowerMessage.includes('styling')) return 'style';
    if (lowerMessage.startsWith('refactor:') || lowerMessage.includes('refactor'))
      return 'refactor';
    if (lowerMessage.startsWith('test:') || lowerMessage.includes('test')) return 'test';
    if (lowerMessage.startsWith('chore:') || lowerMessage.includes('chore')) return 'chore';

    return 'other';
  }

  /**
   * 相対日時を計算
   */
  private getRelativeDate(date: string): string {
    const now = new Date();
    const commitDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - commitDate.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}秒前`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分前`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}時間前`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}日前`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}ヶ月前`;

    return `${Math.floor(diffInSeconds / 31536000)}年前`;
  }

  /**
   * コミット情報を拡張
   */
  enhanceCommits(commits: GitHubCommit[]): EnhancedCommit[] {
    return commits.map((commit) => ({
      ...commit,
      relativeDate: this.getRelativeDate(commit.commit.author.date),
      commitType: this.determineCommitType(commit.commit.message),
      shortSha: commit.sha.substring(0, 7),
      authorName: commit.commit.author.name,
      authorAvatar: commit.author?.avatar_url,
      linesChanged: (commit.stats?.additions || 0) + (commit.stats?.deletions || 0),
      filesChanged: commit.files?.length || 0,
    }));
  }

  /**
   * 統計情報を計算
   */
  async calculateStats(commits: GitHubCommit[]): Promise<UpdateHistoryStats> {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const commitsThisMonth = commits.filter(
      (commit) => new Date(commit.commit.author.date) >= oneMonthAgo
    ).length;

    const commitsThisWeek = commits.filter(
      (commit) => new Date(commit.commit.author.date) >= oneWeekAgo
    ).length;

    // 貢献者別の統計
    const contributorMap = new Map<string, { count: number; avatar?: string }>();
    commits.forEach((commit) => {
      const author = commit.commit.author.name;
      const existing = contributorMap.get(author) || { count: 0 };
      contributorMap.set(author, {
        count: existing.count + 1,
        avatar: commit.author?.avatar_url || existing.avatar,
      });
    });

    const topContributors = Array.from(contributorMap.entries())
      .map(([author, data]) => ({
        author,
        commitCount: data.count,
        avatar: data.avatar,
      }))
      .sort((a, b) => b.commitCount - a.commitCount)
      .slice(0, 5);

    // コミットタイプ別の統計
    const enhancedCommits = this.enhanceCommits(commits);
    const commitsByType = enhancedCommits.reduce(
      (acc, commit) => {
        acc[commit.commitType] = (acc[commit.commitType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // 過去30日間のアクティビティデータ
    const activityData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const commitsOnDate = commits.filter((commit) => {
        const commitDate = new Date(commit.commit.author.date).toISOString().split('T')[0];
        return commitDate === dateStr;
      }).length;

      activityData.push({
        date: dateStr,
        commits: commitsOnDate,
      });
    }

    return {
      totalCommits: commits.length,
      commitsThisMonth,
      commitsThisWeek,
      topContributors,
      commitsByType,
      activityData,
    };
  }

  async createBranch(branchName: string, options: BranchCreateOptions): Promise<void> {
    // TODO: Implement actual GitHub API integration
    console.log('Creating branch:', branchName, options);
    // Mock implementation for now
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async createPullRequest(options: PullRequestOptions): Promise<PullRequestResult> {
    // TODO: Implement actual GitHub API integration
    console.log('Creating PR:', options);
    // Mock implementation for now
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      url: `https://github.com/example/repo/pull/${Math.floor(Math.random() * 1000)}`,
    };
  }
}

// シングルトンインスタンス
let githubServiceInstance: GitHubService | null = null;

export const getGitHubService = (): GitHubService => {
  if (!githubServiceInstance) {
    githubServiceInstance = new GitHubService({
      owner: 'umezawakanta', // あなたのGitHubユーザー名
      repo: 'work-time-tracker', // リポジトリ名
      accessToken: import.meta.env.VITE_GITHUB_TOKEN, // 環境変数からトークンを取得
    });
  }
  return githubServiceInstance;
};

// 直接インポートできるシングルトンインスタンス
export const githubService = getGitHubService();
