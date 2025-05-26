export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
    details?: any;
  } | string;
  meta: ApiResponseMeta;
}

export interface ApiResponseMeta {
  timestamp: number;
  requestId?: string;
  headers?: Record<string, string>;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
    exceeded?: boolean;
  };
  cache?: {
    hit: boolean;
    ttl?: number;
    stale?: boolean;
    age?: number;
  };
  featureLimit?: {
    feature: string;
    limit: number;
    used: number;
    plan: string;
    allowed?: boolean;
    received?: number;
  };
  errorCode?: string;
  errorHandled?: boolean;
  processingTime?: number;
  statusCode?: number;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  retry?: number;
  cache?: boolean | RequestCache;
  signal?: AbortSignal;
  priority?: 'low' | 'normal' | 'high';
  withCredentials?: boolean;
  retryDelay?: number;
  cacheTTL?: number;
}

export interface ExtendedRequestConfig extends RequestConfig {
  _cachedResponse?: any;
  _cacheHit?: boolean;
}

export interface ApiErrorResponse extends Omit<ApiResponse<any>, 'data'> {
  data?: any;
  statusCode?: number;
}

export interface ApiServiceConfig {
  baseURL: string;
  baseEndpoint?: string; // 互換性のため
  timeout?: number;
  headers?: Record<string, string>;
}

export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'professional' | 'enterprise';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface RequestData {
  [key: string]: any;
}

export interface PluginHook {
  beforeRequest?: (config: any, serviceName: string) => Promise<void>;
  afterResponse?: (response: any, config: any, serviceName: string) => Promise<any>;
  onError?: (error: any, originalError: any, serviceName: string) => Promise<void>;
}

export interface ApiPlugin {
  name: string;
  hooks: PluginHook;
}