export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  content: string;
  url?: string;
  hashtags: string[];
  media?: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  };
  scheduledTime?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  metrics?: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
  };
  publishedAt?: string;
}

export interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  connected: boolean;
  username?: string;
  followerCount?: number;
  lastSync?: string;
}

export interface ShareContent {
  title: string;
  description: string;
  url: string;
  image?: string;
  hashtags?: string[];
}

export interface SocialAnalytics {
  platform: string;
  totalPosts: number;
  totalEngagement: number;
  followerGrowth: number;
  topPerformingPost?: SocialPost;
  averageEngagement: number;
  bestTimeToPost: string;
}

/**
 * 📱 ソーシャルメディアサービス
 * Twitter/X、Facebook、LinkedIn連携機能を提供
 */
class SocialMediaService {
  private static instance: SocialMediaService | null = null;
  private platforms: Map<string, SocialPlatform> = new Map();
  private posts: SocialPost[] = [];
  private analytics: Map<string, SocialAnalytics> = new Map();

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): SocialMediaService {
    if (!SocialMediaService.instance) {
      SocialMediaService.instance = new SocialMediaService();
    }
    return SocialMediaService.instance;
  }

  /**
   * 🚀 サービス初期化
   */
  private initializeService(): void {
    this.setupSocialPlatforms();
    this.initializeAnalytics();
    console.log('📱 ソーシャルメディアサービス初期化完了');
  }

  /**
   * 🌐 ソーシャルプラットフォーム設定
   */
  private setupSocialPlatforms(): void {
    const platforms: SocialPlatform[] = [
      {
        id: 'twitter',
        name: 'Twitter/X',
        icon: '🐦',
        color: '#1DA1F2',
        connected: false,
      },
      {
        id: 'facebook',
        name: 'Facebook',
        icon: '👥',
        color: '#4267B2',
        connected: false,
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: '💼',
        color: '#0077B5',
        connected: false,
      },
      {
        id: 'instagram',
        name: 'Instagram',
        icon: '📸',
        color: '#E4405F',
        connected: false,
      },
      {
        id: 'youtube',
        name: 'YouTube',
        icon: '🎥',
        color: '#FF0000',
        connected: false,
      },
    ];

    platforms.forEach((platform) => {
      this.platforms.set(platform.id, platform);
    });
  }

  /**
   * 📊 分析データ初期化
   */
  private initializeAnalytics(): void {
    this.platforms.forEach((platform) => {
      this.analytics.set(platform.id, {
        platform: platform.name,
        totalPosts: 0,
        totalEngagement: 0,
        followerGrowth: 0,
        averageEngagement: 0,
        bestTimeToPost: '10:00',
      });
    });
  }

  /**
   * 🔗 プラットフォーム接続
   */
  async connectPlatform(platformId: string): Promise<boolean> {
    const platform = this.platforms.get(platformId);
    if (!platform) {
      throw new Error(`Platform ${platformId} not found`);
    }

    try {
      // 実際の実装では各プラットフォームのOAuth認証を実行
      switch (platformId) {
        case 'twitter':
          await this.connectTwitter();
          break;
        case 'facebook':
          await this.connectFacebook();
          break;
        case 'linkedin':
          await this.connectLinkedIn();
          break;
        default:
          throw new Error(`Platform ${platformId} not supported yet`);
      }

      platform.connected = true;
      platform.lastSync = new Date().toISOString();

      console.log(`✅ ${platform.name} 接続完了`);
      return true;
    } catch (error) {
      console.error(`❌ ${platform.name} 接続失敗:`, error);
      return false;
    }
  }

  /**
   * 🐦 Twitter/X接続
   */
  private async connectTwitter(): Promise<void> {
    // Twitter API接続のシミュレーション
    await this.delay(1000);

    const platform = this.platforms.get('twitter')!;
    platform.username = '@worktimetracker';
    platform.followerCount = 150;

    console.log('🐦 Twitter/X API 接続完了');
  }

  /**
   * 👥 Facebook接続
   */
  private async connectFacebook(): Promise<void> {
    // Facebook Graph API接続のシミュレーション
    await this.delay(1000);

    const platform = this.platforms.get('facebook')!;
    platform.username = 'Work Time Tracker';
    platform.followerCount = 75;

    console.log('👥 Facebook API 接続完了');
  }

  /**
   * 💼 LinkedIn接続
   */
  private async connectLinkedIn(): Promise<void> {
    // LinkedIn API接続のシミュレーション
    await this.delay(1000);

    const platform = this.platforms.get('linkedin')!;
    platform.username = 'Work Time Tracker';
    platform.followerCount = 100;

    console.log('💼 LinkedIn API 接続完了');
  }

  /**
   * 📤 コンテンツ共有
   */
  async shareContent(content: ShareContent, platforms: string[]): Promise<void> {
    const promises = platforms.map((platformId) => this.shareToplatform(content, platformId));
    await Promise.all(promises);
  }

  /**
   * 📱 個別プラットフォーム共有
   */
  private async shareToplatform(content: ShareContent, platformId: string): Promise<void> {
    const platform = this.platforms.get(platformId);
    if (!platform || !platform.connected) {
      throw new Error(`Platform ${platformId} is not connected`);
    }

    const post: SocialPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      platform,
      content: this.formatContentForPlatform(content, platformId),
      url: content.url,
      hashtags: content.hashtags || [],
      status: 'published',
      publishedAt: new Date().toISOString(),
      metrics: {
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0,
      },
    };

    this.posts.push(post);

    // 分析データ更新
    const analytics = this.analytics.get(platformId)!;
    analytics.totalPosts++;

    console.log(`📤 ${platform.name} に投稿完了: ${post.id}`);

    // エンゲージメント シミュレーション
    this.simulateEngagement(post);
  }

  /**
   * 📝 プラットフォーム別コンテンツフォーマット
   */
  private formatContentForPlatform(content: ShareContent, platformId: string): string {
    const hashtags = content.hashtags?.map((tag) => `#${tag}`).join(' ') || '';

    switch (platformId) {
      case 'twitter': {
        // Twitter/X: 280文字制限
        const twitterContent = `${content.title}\n\n${content.description}\n\n${content.url}\n\n${hashtags}`;
        return twitterContent.length > 280
          ? `${content.title}\n\n${content.url}\n\n${hashtags}`.slice(0, 280)
          : twitterContent;
      }

      case 'facebook':
        // Facebook: 長文可能
        return `${content.title}\n\n${content.description}\n\n${content.url}\n\n${hashtags}`;

      case 'linkedin':
        // LinkedIn: ビジネス向けフォーマット
        return `${content.title}\n\n${content.description}\n\n詳細はこちら: ${content.url}\n\n${hashtags}`;

      default:
        return `${content.title}\n\n${content.description}\n\n${content.url}\n\n${hashtags}`;
    }
  }

  /**
   * 📊 エンゲージメント シミュレーション
   */
  private simulateEngagement(post: SocialPost): void {
    // リアルタイムエンゲージメントのシミュレーション
    const intervals = [1000, 5000, 15000, 30000, 60000]; // 1秒、5秒、15秒、30秒、1分

    intervals.forEach((interval, index) => {
      setTimeout(() => {
        if (post.metrics) {
          post.metrics.views += Math.floor(Math.random() * 10) + 1;
          post.metrics.likes += Math.floor(Math.random() * 3);
          post.metrics.shares += Math.floor(Math.random() * 2);
          post.metrics.comments += Math.floor(Math.random() * 2);

          // 分析データ更新
          const analytics = this.analytics.get(post.platform.id)!;
          analytics.totalEngagement =
            post.metrics.likes + post.metrics.shares + post.metrics.comments;
        }
      }, interval);
    });
  }

  /**
   * 🚀 クイック共有ボタン
   */
  createShareButtons(content: ShareContent): HTMLElement {
    const container = document.createElement('div');
    container.className = 'social-share-buttons flex gap-2 mt-4';

    const connectedPlatforms = Array.from(this.platforms.values()).filter(
      (platform) => platform.connected
    );

    if (connectedPlatforms.length === 0) {
      container.innerHTML = `
        <p class="text-gray-500 text-sm">
          ソーシャルメディアアカウントを接続してください
        </p>
      `;
      return container;
    }

    connectedPlatforms.forEach((platform) => {
      const button = document.createElement('button');
      button.className = `
        flex items-center gap-2 px-3 py-2 rounded-lg text-white text-sm font-medium
        hover:opacity-90 transition-opacity
      `;
      button.style.backgroundColor = platform.color;
      button.innerHTML = `
        <span>${platform.icon}</span>
        <span>${platform.name}に共有</span>
      `;

      button.addEventListener('click', () => {
        this.shareToplatform(content, platform.id);
      });

      container.appendChild(button);
    });

    return container;
  }

  /**
   * 📈 ソーシャル分析ダッシュボード生成
   */
  generateAnalyticsDashboard(): HTMLElement {
    const dashboard = document.createElement('div');
    dashboard.className = 'social-analytics-dashboard bg-white p-6 rounded-lg shadow-lg';

    const analytics = Array.from(this.analytics.values());
    const totalPosts = analytics.reduce((sum, a) => sum + a.totalPosts, 0);
    const totalEngagement = analytics.reduce((sum, a) => sum + a.totalEngagement, 0);

    dashboard.innerHTML = `
      <h3 class="text-xl font-semibold mb-4">📊 ソーシャルメディア分析</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">${totalPosts}</div>
          <div class="text-sm text-gray-600">総投稿数</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-green-600">${totalEngagement}</div>
          <div class="text-sm text-gray-600">総エンゲージメント</div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-purple-600">${this.getConnectedPlatformsCount()}</div>
          <div class="text-sm text-gray-600">接続済みプラットフォーム</div>
        </div>
      </div>
      
      <div class="space-y-4">
        ${analytics
          .map(
            (a) => `
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${this.platforms.get(a.platform.toLowerCase())?.icon || '📱'}</span>
              <div>
                <div class="font-medium">${a.platform}</div>
                <div class="text-sm text-gray-600">${a.totalPosts} 投稿</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-medium">${a.totalEngagement} エンゲージメント</div>
              <div class="text-sm text-gray-600">平均 ${Math.round(a.averageEngagement)}</div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;

    return dashboard;
  }

  /**
   * 📋 最近の投稿一覧生成
   */
  generateRecentPostsList(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'recent-posts bg-white p-6 rounded-lg shadow-lg';

    const recentPosts = this.posts
      .sort(
        (a, b) => new Date(b.publishedAt || '').getTime() - new Date(a.publishedAt || '').getTime()
      )
      .slice(0, 5);

    container.innerHTML = `
      <h3 class="text-xl font-semibold mb-4">📝 最近の投稿</h3>
      
      <div class="space-y-4">
        ${
          recentPosts.length === 0
            ? '<p class="text-gray-500">まだ投稿がありません</p>'
            : recentPosts
                .map(
                  (post) => `
            <div class="border-l-4 border-blue-500 pl-4 py-2">
              <div class="flex items-center gap-2 mb-2">
                <span>${post.platform.icon}</span>
                <span class="font-medium">${post.platform.name}</span>
                <span class="text-sm text-gray-500">
                  ${new Date(post.publishedAt || '').toLocaleDateString('ja-JP')}
                </span>
              </div>
              <p class="text-sm text-gray-700 mb-2">${post.content.slice(0, 100)}...</p>
              <div class="flex gap-4 text-sm text-gray-600">
                <span>👁️ ${post.metrics?.views || 0}</span>
                <span>❤️ ${post.metrics?.likes || 0}</span>
                <span>🔄 ${post.metrics?.shares || 0}</span>
                <span>💬 ${post.metrics?.comments || 0}</span>
              </div>
            </div>
          `
                )
                .join('')
        }
      </div>
    `;

    return container;
  }

  /**
   * ⏰ 遅延ユーティリティ
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 📊 接続済みプラットフォーム数取得
   */
  private getConnectedPlatformsCount(): number {
    return Array.from(this.platforms.values()).filter((p) => p.connected).length;
  }

  // 外部API
  getPlatforms(): SocialPlatform[] {
    return Array.from(this.platforms.values());
  }

  getConnectedPlatforms(): SocialPlatform[] {
    return Array.from(this.platforms.values()).filter((p) => p.connected);
  }

  getPosts(limit?: number): SocialPost[] {
    const sortedPosts = this.posts.sort(
      (a, b) => new Date(b.publishedAt || '').getTime() - new Date(a.publishedAt || '').getTime()
    );
    return limit ? sortedPosts.slice(0, limit) : sortedPosts;
  }

  getAnalytics(platformId?: string): SocialAnalytics | SocialAnalytics[] {
    if (platformId) {
      return (
        this.analytics.get(platformId) || {
          platform: platformId,
          totalPosts: 0,
          totalEngagement: 0,
          followerGrowth: 0,
          averageEngagement: 0,
          bestTimeToPost: '10:00',
        }
      );
    }
    return Array.from(this.analytics.values());
  }

  async disconnectPlatform(platformId: string): Promise<void> {
    const platform = this.platforms.get(platformId);
    if (platform) {
      platform.connected = false;
      platform.username = undefined;
      platform.followerCount = undefined;
      platform.lastSync = undefined;
      console.log(`🔌 ${platform.name} 接続解除`);
    }
  }
}

export const socialMediaService = SocialMediaService.getInstance();
