import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { BlogPost, Comment } from '@/store/blogSlice';
import { api } from './apiConfig';
import { getEnv } from '@/utils/env';

// (モック関連のグローバルは削除)

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

// モックデータは廃止

function coerceArray<T>(value: unknown, splitPattern: RegExp = /[\s,]+/): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === 'string') {
    const parts = value
      .split(splitPattern)
      .map((s) => s.trim())
      .filter(Boolean) as unknown as T[];
    return parts;
  }
  return [] as T[];
}

function normalizePost(raw: any): BlogPost {
  const createdAt = raw?.createdAt
    ? new Date(raw.createdAt).toISOString()
    : new Date().toISOString();
  const updatedAt = raw?.updatedAt ? new Date(raw.updatedAt).toISOString() : createdAt;
  return {
    _id: String(raw?._id ?? raw?.id ?? ''),
    title: String(raw?.title ?? ''),
    content: String(raw?.content ?? ''),
    author: String(raw?.author ?? ''),
    authorId: String(raw?.authorId ?? raw?.userId ?? ''),
    category: String(raw?.category ?? ''),
    tags: coerceArray<string>(raw?.tags),
    likes: coerceArray<string>(raw?.likes),
    comments: Array.isArray(raw?.comments)
      ? (raw.comments as Comment[]).map((c: any) => ({
          _id: String(c?._id ?? c?.id ?? ''),
          content: String(c?.content ?? ''),
          author: String(c?.author ?? ''),
          createdAt: c?.createdAt ? new Date(c.createdAt).toISOString() : createdAt,
        }))
      : [],
    createdAt,
    updatedAt,
    status: raw?.status === 'draft' || raw?.status === 'published' ? raw.status : 'published',
  };
}

export const blogApi = {
  getAll: (): Promise<AxiosResponse<BlogPost[]>> => {
    if (getEnv('DEV') === 'true' || process.env.NODE_ENV === 'development') {
      console.log('🔄 API Call: GET /blog');
    }
    return api
      .get<BlogPost[] | { success?: boolean; posts?: any[] }>('/blog')
      .then((response) => {
        const payload = response.data as any;
        const list: any[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.posts)
            ? payload.posts
            : [];
        const normalized: BlogPost[] = list.map(normalizePost);
        return {
          ...response,
          data: normalized,
        } as AxiosResponse<BlogPost[]>;
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
        throw error;
      });
  },

  create: (
    post: Omit<BlogPost, '_id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments'>
  ): Promise<AxiosResponse<BlogApiResponse>> => {
    // Use a stricter timeout for create to prevent UI freeze on network hiccups
    return api.post<BlogApiResponse>('/blog', post, { timeout: 15000 });
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
    if (getEnv('DEV') === 'true' || process.env.NODE_ENV === 'development') {
      console.log('🔄 API Call: GET /blog/' + id);
    }

    return api
      .get<BlogPost | { success?: boolean; post?: any }>(`/blog/${id}`)
      .then((response) => {
        const payload = response.data as any;
        const raw = (payload && (payload.post ?? payload)) as any;
        const normalized = normalizePost(raw);
        return { ...response, data: normalized } as AxiosResponse<BlogPost>;
      })
      .catch((error) => {
        console.error('❌ Blog Post API Error:', error);
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
