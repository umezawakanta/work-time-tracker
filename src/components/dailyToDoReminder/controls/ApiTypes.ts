export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestData {
  [key: string]: string | number | boolean | null | undefined | RequestData | Array<RequestData>;
}

export interface ExtendedRequestConfig {
  retry?: number;
  timeout?: number;
  cache?: RequestCache;
  signal?: AbortSignal;
  priority?: RequestPriority;
  withCredentials?: boolean;
  retryDelay?: number;
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
  processingTime?: number;
  requestId?: string;
  statusCode?: number;
  headers?: Record<string, string>;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
    exceeded?: boolean;
  };
  featureLimit?: {
    feature: string;
    limit: number;
    used: number;
    plan: string;
  };
  errorHandled?: boolean;
}

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: ApiResponseMeta;
}

export interface ApiErrorResponse extends ApiResponse {
  data: unknown;
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
