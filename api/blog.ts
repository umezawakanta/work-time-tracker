import { VercelRequest, VercelResponse } from '@vercel/node';

// サンプルブログデータ
const blogPosts = [
  {
    id: '1',
    title: 'Work Time Tracker へようこそ',
    content: `
# Work Time Tracker の特徴

Work Time Tracker は、効率的な時間管理とタスク管理を支援するツールです。

## 主な機能

- **タスク管理**: 直感的なインターフェースでタスクを作成・管理
- **時間追跡**: 作業時間を正確に記録
- **カレンダー統合**: タスクをカレンダー形式で視覚化
- **AI機能**: タスクの優先順位付けや最適化の提案

このツールを使って、生産性を向上させましょう！
    `,
    excerpt: 'Work Time Tracker の主要機能をご紹介します。効率的な時間管理とタスク管理を始めましょう。',
    slug: 'welcome-to-work-time-tracker',
    author: 'Work Time Tracker Team',
    publishedAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    tags: ['welcome', 'features', 'introduction'],
    status: 'published',
  },
  {
    id: '2',
    title: 'Phase 1 完了: 基本機能実装',
    content: `
# Phase 1 の成果

Work Time Tracker の Phase 1 開発が完了しました！

## 実装された機能

### 認証システム
- ログイン・ログアウト機能
- ユーザー登録
- パスワードリセット

### タスク管理
- タスクの作成・編集・削除
- 優先度設定
- カテゴリ分類
- 期限設定

### カレンダー機能
- タスクの視覚化
- ドラッグ&ドロップでのスケジュール調整
- 月・週・日表示の切り替え

## 次のステップ

Phase 2 では AI 機能の本格実装を予定しています。
    `,
    excerpt: 'Phase 1 の開発が完了し、基本的なタスク管理機能が利用可能になりました。',
    slug: 'phase-1-completion',
    author: 'Development Team',
    publishedAt: '2025-01-10T15:30:00Z',
    updatedAt: '2025-01-10T15:30:00Z',
    tags: ['development', 'phase1', 'milestone'],
    status: 'published',
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // URLから操作を判定
  const { url } = req;
  const path = url?.split('?')[0];

  try {
    if (path?.endsWith('/blog') || path?.endsWith('/blog/')) {
      return await handleBlogIndex(req, res);
    } else if (path?.includes('/blog/') && path?.split('/blog/')[1]) {
      const slug = path.split('/blog/')[1];
      return await handleBlogPost(req, res, slug);
    } else {
      return res.status(404).json({ error: 'Blog endpoint not found' });
    }
  } catch (error) {
    console.error('❌ Blog API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました',
    });
  }
}

// ブログ一覧取得
async function handleBlogIndex(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { limit = '10', offset = '0', tag } = req.query;

  let filteredPosts = blogPosts.filter((post) => post.status === 'published');

  // タグフィルター
  if (tag && typeof tag === 'string') {
    filteredPosts = filteredPosts.filter((post) => post.tags.includes(tag));
  }

  // ページネーション
  const limitNum = parseInt(limit as string);
  const offsetNum = parseInt(offset as string);
  const paginatedPosts = filteredPosts.slice(offsetNum, offsetNum + limitNum);

  // レスポンス用にcontentを除外してexcerptのみ返す
  const postsForList = paginatedPosts.map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug,
    author: post.author,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    tags: post.tags,
  }));

  return res.status(200).json({
    posts: postsForList,
    pagination: {
      total: filteredPosts.length,
      limit: limitNum,
      offset: offsetNum,
      hasNext: offsetNum + limitNum < filteredPosts.length,
      hasPrev: offsetNum > 0,
    },
    meta: {
      availableTags: Array.from(new Set(blogPosts.flatMap((post) => post.tags))),
    },
  });
}

// 個別ブログ記事取得
async function handleBlogPost(req: VercelRequest, res: VercelResponse, identifier: string) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // IDまたはslugで検索
  const post = blogPosts.find(
    (p) => p.id === identifier || p.slug === identifier
  );

  if (!post || post.status !== 'published') {
    return res.status(404).json({
      error: 'Post not found',
      message: '指定された記事が見つかりません',
    });
  }

  console.log('✅ Blog post retrieved:', { id: post.id, title: post.title });

  return res.status(200).json({
    post: {
      ...post,
      // 関連記事を提案（同じタグを持つ記事）
      relatedPosts: blogPosts
        .filter((p) => 
          p.id !== post.id && 
          p.status === 'published' &&
          p.tags.some((tag) => post.tags.includes(tag))
        )
        .slice(0, 3)
        .map((p) => ({
          id: p.id,
          title: p.title,
          excerpt: p.excerpt,
          slug: p.slug,
          publishedAt: p.publishedAt,
        })),
    },
  });
} 