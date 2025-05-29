export interface ApiServiceConfig {
  baseURL: string;
  timeout: number;
  retries?: number;
  headers?: Record<string, string>;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  cache?: RequestCache;
  retry?: number;
  signal?: AbortSignal;
  priority?: 'low' | 'normal' | 'high';
  withCredentials?: boolean;
  retryDelay?: number;
  cacheTTL?: number;
}

export interface ApiResponse<T> {
  data: T | null;
  success: boolean;
  error?: Error | string;
  meta: ApiResponseMeta;
}

export interface ApiResponseMeta {
  timestamp: number;
  headers?: Record<string, string>;
  statusCode?: number;
  featureLimit?: FeatureLimit;
  errorHandled?: boolean;
}

export interface FeatureLimit {
  feature: string;
  limit: number;
  used: number;
  plan: string;
  allowed?: boolean;
  received?: number;
}

export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'professional' | 'enterprise';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
