export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestData {
  [key: string]: any;
}

export interface ExtendedRequestConfig {
  retry?: number;
  timeout?: number;
  cache?: RequestCache;
}

export interface ApiServiceConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  features: string[];
  limits: {
    [key: string]: number;
  };
}

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
  };
  errorHandled?: boolean;
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
}

export interface ApiErrorResponse extends ApiResponse {
  data: any; // 必須に変更
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