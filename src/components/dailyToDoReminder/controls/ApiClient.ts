import { ApiServiceConfig } from './ApiTypes';

export class ApiClient {
  private static instance: ApiClient;
  private baseURL: string;

  constructor(config: ApiServiceConfig) {
    this.baseURL = config.baseURL;
  }

  static getInstance(config?: ApiServiceConfig): ApiClient {
    if (!this.instance && config) {
      this.instance = new ApiClient(config);
    }
    return this.instance;
  }

  async fetch<T = unknown>(
    url: string,
    options?: RequestInit
  ): Promise<{ data: T; success: boolean; error?: unknown }> {
    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      const data = await response.json();

      return {
        data,
        success: response.ok,
        error: response.ok ? undefined : data.error,
      };
    } catch (error) {
      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async get<T = unknown>(
    url: string,
    params?: Record<string, string>
  ): Promise<{ data: T; success: boolean; error?: unknown }> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.fetch<T>(`${url}${queryString}`, { method: 'GET' });
  }

  async post<T = unknown>(
    url: string,
    data?: unknown
  ): Promise<{ data: T; success: boolean; error?: unknown }> {
    return this.fetch<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T = unknown>(
    url: string,
    data?: unknown
  ): Promise<{ data: T; success: boolean; error?: unknown }> {
    return this.fetch<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T = unknown>(url: string): Promise<{ data: T; success: boolean; error?: unknown }> {
    return this.fetch<T>(url, { method: 'DELETE' });
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown
  ): Promise<{ data: T; success: boolean; error?: unknown }> {
    return this.fetch<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export default ApiClient;

// Re-export types for compatibility
export type { ApiResponse, ExtendedRequestConfig, RequestData } from './ApiTypes';
