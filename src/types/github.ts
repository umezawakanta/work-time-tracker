// GitHub API関連の型定義
export interface GitHubCommit {
  sha: string;
  node_id: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    tree: {
      sha: string;
      url: string;
    };
    url: string;
    comment_count: number;
    verification: {
      verified: boolean;
      reason: string;
      signature: string | null;
      payload: string | null;
    };
  };
  url: string;
  html_url: string;
  comments_url: string;
  author: GitHubUser | null;
  committer: GitHubUser | null;
  parents: Array<{
    sha: string;
    url: string;
    html_url: string;
  }>;
  stats?: {
    total: number;
    additions: number;
    deletions: number;
  };
  files?: GitHubCommitFile[];
}

export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

export interface GitHubCommitFile {
  sha: string;
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed';
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch?: string;
  previous_filename?: string;
}

export interface GitHubRepository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: GitHubUser;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  forks_count: number;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string;
    node_id: string;
  } | null;
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
}

export interface GitHubCommitsResponse {
  commits: GitHubCommit[];
  repository: GitHubRepository;
  totalCount: number;
  hasNextPage: boolean;
  nextPageUrl?: string;
}

export interface GitHubApiConfig {
  owner: string;
  repo: string;
  accessToken?: string;
  baseUrl?: string;
}

export interface CommitSearchParams {
  sha?: string;
  path?: string;
  author?: string;
  since?: string;
  until?: string;
  per_page?: number;
  page?: number;
}

// Webhook用の型定義
export interface GitHubWebhookPayload {
  action: string;
  repository: GitHubRepository;
  sender: GitHubUser;
  commits?: GitHubCommit[];
  head_commit?: GitHubCommit;
  ref?: string;
  before?: string;
  after?: string;
  created: boolean;
  deleted: boolean;
  forced: boolean;
  base_ref?: string;
  compare: string;
  pusher: {
    name: string;
    email: string;
  };
}

// ローカル表示用の拡張型
export interface EnhancedCommit extends GitHubCommit {
  relativeDate: string;
  commitType: 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore' | 'other';
  shortSha: string;
  authorName: string;
  authorAvatar?: string;
  linesChanged: number;
  filesChanged: number;
}

export interface UpdateHistoryStats {
  totalCommits: number;
  commitsThisMonth: number;
  commitsThisWeek: number;
  topContributors: Array<{
    author: string;
    commitCount: number;
    avatar?: string;
  }>;
  commitsByType: Record<string, number>;
  activityData: Array<{
    date: string;
    commits: number;
  }>;
}
