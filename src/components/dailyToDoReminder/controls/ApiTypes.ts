export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface RequestData {
  [key: string]: any;
}

export interface RequestConfig extends ExtendedRequestConfig {}

export interface ExtendedRequestConfig {
  retry?: number;
  timeout?: number;
  cache?: RequestCache;
  cacheTTL?: number;
  _cacheHit?: boolean;
}

export interface ApiServiceConfig {
  baseURL: string;
  baseEndpoint?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// SubscriptionPlanを拡張
export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'enterprise' | 'professional';

export interface ApiResponseMeta {
  timestamp: number;
  requestId?: string;
  statusCode?: number;
  headers?: Record<string, string>;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
  featureLimit?: {
    feature: string;
    limit: number;
    used: number;
    plan: string;
    allowed?: boolean;
    received?: number;
  };
  errorHandled?: boolean;
  processingTime?: number;
  cache?: {
    hit: boolean;
    ttl?: number;
  };
}

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta: ApiResponseMeta;
  statusCode?: number;
}

export interface ApiErrorResponse extends ApiResponse {
  data: any;
}

export interface IApiManager {
  request<T>(
    serviceName: string,
    method: HttpMethod,
    endpoint: string,
    data?: RequestData,
    config?: ExtendedRequestConfig
  ): Promise<ApiResponse<T>>;
}