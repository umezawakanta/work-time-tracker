import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { BlogPost, Comment } from '@/store/blogSlice';
import { api, USE_MOCK_DATA } from './apiConfig';

// Extend Window interface for custom properties
declare global {
  interface Window {
    __VITE_USE_MOCK_DATA__?: string;
    __API_CONNECTION_FAILED__?: boolean;
  }
}

interface BlogApiResponse {
  message: string;
  post: BlogPost;
}

interface CommentApiResponse {
  message: string;
  comment: Comment;
}

interface LikeApiResponse {
  message: string;
  likes: string[];
}

interface DraftApiResponse {
  message: string;
  draft: BlogPost;
}

// モックデータ
const mockBlogPosts: BlogPost[] = [
  {
    _id: 'mock-post-1',
    title: 'Work Time Tracker デモ記事 1',
    content:
      'これはWork Time Trackerのデモ環境での記事です。本番環境ではバックエンドサーバーがない場合のサンプルデータとして表示されています。',
    author: 'デモユーザー',
    category: 'デモ',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1日前
    updatedAt: new Date().toISOString(),
    likes: ['demo-user'],
    comments: [
      {
        _id: 'mock-comment-1',
        content: 'デモ環境のコメントです。',
        author: 'デモユーザー',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ],
    tags: ['デモ', '作業記録'],
    status: 'published' as const,
  },
  {
    _id: 'mock-post-2',
    title: 'プロジェクト管理のベストプラクティス',
    content:
      'プロジェクト管理において重要なのは、適切な時間追跡と進捗管理です。Work Time Trackerを使用することで、効率的なプロジェクト運営が可能になります。',
    author: 'デモユーザー',
    category: 'プロジェクト管理',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7日前
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    likes: ['demo-user'],
    comments: [],
    tags: ['プロジェクト管理', 'ベストプラクティス'],
    status: 'published' as const,
  },
  {
    _id: 'mock-post-3',
    title: '生産性向上のための時間管理術',
    content:
      '時間管理は現代のビジネスパーソンにとって必須のスキルです。このアプリケーションを活用して、あなたの生産性を向上させましょう。',
    author: 'デモユーザー',
    category: '生産性',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14日前
    updatedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    likes: [],
    comments: [
      {
        _id: 'mock-comment-2',
        content: '参考になる記事でした！',
        author: '読者',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    tags: ['生産性', '時間管理'],
    status: 'published' as const,
  },
];

export const blogApi = {
  getAll: (): Promise<AxiosResponse<BlogPost[]>> => {
    // モックモードの場合はモックデータを返す
    if (USE_MOCK_DATA || window.__VITE_USE_MOCK_DATA__ === 'true') {
      console.log('🎭 Mock mode: Returning mock blog posts');
      return Promise.resolve({
        data: mockBlogPosts,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as AxiosRequestConfig,
      } as AxiosResponse<BlogPost[]>);
    }

    // 安全な環境変数取得
    const getEnvVar = (key: string): string | undefined => {
      // Jest環境ではprocess.envを優先
      if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
      }

      // Vite環境でのimport.meta.env（安全にアクセス）
      try {
        if (typeof globalThis !== 'undefined' && (globalThis as any).import?.meta?.env) {
          return (globalThis as any).import.meta.env[key];
        }
      } catch (e) {
        // import.metaが利用できない場合は無視
      }

      return undefined;
    };

    if (getEnvVar('DEV') === 'true' || process.env.NODE_ENV === 'development') {
      console.log('🔄 API Call: GET /blog');
    }
    return api
      .get<BlogPost[]>('/blog')
      .then((response) => {
        if (getEnvVar('DEV') === 'true' || process.env.NODE_ENV === 'development') {
          console.log('✅ Blog API Response:', response.status, response.data?.length, 'posts');
        }
        return response;
      })
      .catch((error) => {
        console.error('❌ Blog API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          code: error.code,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
        });

        // ネットワークエラーなど重大な問題の場合のみフォールバック
        if (
          error.code === 'ECONNREFUSED' ||
          error.code === 'NETWORK_ERROR' ||
          error.message.includes('timeout')
        ) {
          console.log('🔧 Network error detected: Fallback to mock blog data');
          console.log(
            '💡 Tip: サーバーが停止している場合は `npm run dev` でサーバーを起動してください'
          );
          return Promise.resolve({
            data: mockBlogPosts,
            status: 200,
            statusText: 'OK (Network Error Fallback)',
            headers: {},
            config: {} as AxiosRequestConfig,
          } as AxiosResponse<BlogPost[]>);
        }

        throw error;
      });
  },

  create: (
    post: Omit<BlogPost, '_id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments'>
  ): Promise<AxiosResponse<BlogApiResponse>> => {
    return api.post<BlogApiResponse>('/blog', post);
  },

  update: (_id: string, updates: Partial<BlogPost>): Promise<AxiosResponse<BlogApiResponse>> => {
    return api.put<BlogApiResponse>(`/blog/${_id}`, updates);
  },

  delete: (_id: string): Promise<AxiosResponse<void>> => {
    return api.delete(`/blog/${_id}`);
  },

  addComment: (
    postId: string,
    comment: Omit<Comment, '_id' | 'createdAt'>
  ): Promise<AxiosResponse<CommentApiResponse>> => {
    return api.post<CommentApiResponse>(`/blog/${postId}/comments`, comment);
  },

  getById: (id: string): Promise<AxiosResponse<BlogPost>> => {
    // モックモードの場合はモックデータを返す
    if (USE_MOCK_DATA || window.__VITE_USE_MOCK_DATA__ === 'true') {
      console.log('🎭 Mock mode: Returning mock blog post for ID:', id);
      const mockPost = mockBlogPosts.find((post) => post._id === id) || mockBlogPosts[0];
      return Promise.resolve({
        data: mockPost,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as AxiosRequestConfig,
      } as AxiosResponse<BlogPost>);
    }

    // 安全な環境変数取得
    const getEnvVar = (key: string): string | undefined => {
      // Jest環境ではprocess.envを優先
      if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
      }

      // Vite環境でのimport.meta.env（安全にアクセス）
      try {
        if (typeof globalThis !== 'undefined' && (globalThis as any).import?.meta?.env) {
          return (globalThis as any).import.meta.env[key];
        }
      } catch (e) {
        // import.metaが利用できない場合は無視
      }

      return undefined;
    };

    if (getEnvVar('DEV') === 'true' || process.env.NODE_ENV === 'development') {
      console.log('🔄 API Call: GET /blog/' + id);
    }

    return api
      .get<BlogPost>(`/blog/${id}`)
      .then((response) => {
        if (getEnvVar('DEV') === 'true' || process.env.NODE_ENV === 'development') {
          console.log('✅ Blog Post API Response:', response.status, response.data?.title);
        }
        return response;
      })
      .catch((error) => {
        console.error('❌ Blog Post API Error:', error);

        // ネットワークエラーなど重大な問題の場合のみフォールバック
        if (
          error.code === 'ECONNREFUSED' ||
          error.code === 'NETWORK_ERROR' ||
          error.message.includes('timeout')
        ) {
          console.log('🔧 Network error detected: Fallback to mock blog post');
          console.log(
            '💡 Tip: サーバーが停止している場合は `npm run dev` でサーバーを起動してください'
          );
          const mockPost = mockBlogPosts.find((post) => post._id === id) || mockBlogPosts[0];
          return Promise.resolve({
            data: mockPost,
            status: 200,
            statusText: 'OK (Network Error Fallback)',
            headers: {},
            config: {} as AxiosRequestConfig,
          } as AxiosResponse<BlogPost>);
        }

        throw error;
      });
  },

  toggleLike: (postId: string, userId: string): Promise<AxiosResponse<LikeApiResponse>> => {
    return api.post<LikeApiResponse>(`/blog/${postId}/like`, { userId });
  },

  saveDraft: (draft: Partial<BlogPost>): Promise<AxiosResponse<DraftApiResponse>> => {
    return api.post<DraftApiResponse>('/blog/draft', draft);
  },

  publishPost: (postId: string): Promise<AxiosResponse<BlogApiResponse>> => {
    return api.put<BlogApiResponse>(`/blog/${postId}/publish`);
  },
};
