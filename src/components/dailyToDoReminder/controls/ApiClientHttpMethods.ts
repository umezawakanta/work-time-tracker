import { ApiResponse, ExtendedRequestConfig } from './ApiTypes';
import ApiClient from './ApiClient';

export class ApiClientHttpMethods {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async get<T = unknown>(
    url: string,
    params?: Record<string, string>,
    config?: ExtendedRequestConfig
  ): Promise<ApiResponse<T>> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const { retry, timeout, retryDelay, ...requestInit } = config || {};

    const response = await this.apiClient.fetch<T>(`${url}${queryString}`, {
      method: 'GET',
      ...requestInit,
    });

    return {
      data: response.data,
      success: response.success,
      error: response.error
        ? {
            code: 'API_ERROR',
            message: typeof response.error === 'string' ? response.error : 'Unknown error occurred',
          }
        : undefined,
      meta: {
        timestamp: Date.now(),
      },
    };
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: ExtendedRequestConfig
  ): Promise<ApiResponse<T>> {
    const { retry, timeout, retryDelay, ...requestInit } = config || {};

    const response = await this.apiClient.fetch<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...requestInit,
    });

    return {
      data: response.data,
      success: response.success,
      error: response.error
        ? {
            code: 'API_ERROR',
            message: typeof response.error === 'string' ? response.error : 'Unknown error occurred',
          }
        : undefined,
      meta: {
        timestamp: Date.now(),
      },
    };
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: ExtendedRequestConfig
  ): Promise<ApiResponse<T>> {
    const { retry, timeout, retryDelay, ...requestInit } = config || {};

    const response = await this.apiClient.fetch<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...requestInit,
    });

    return {
      data: response.data,
      success: response.success,
      error: response.error
        ? {
            code: 'API_ERROR',
            message: typeof response.error === 'string' ? response.error : 'Unknown error occurred',
          }
        : undefined,
      meta: {
        timestamp: Date.now(),
      },
    };
  }

  async delete<T = unknown>(url: string, config?: ExtendedRequestConfig): Promise<ApiResponse<T>> {
    const { retry, timeout, retryDelay, ...requestInit } = config || {};

    const response = await this.apiClient.fetch<T>(url, {
      method: 'DELETE',
      ...requestInit,
    });

    return {
      data: response.data,
      success: response.success,
      error: response.error
        ? {
            code: 'API_ERROR',
            message: typeof response.error === 'string' ? response.error : 'Unknown error occurred',
          }
        : undefined,
      meta: {
        timestamp: Date.now(),
      },
    };
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: ExtendedRequestConfig
  ): Promise<ApiResponse<T>> {
    const { retry, timeout, retryDelay, ...requestInit } = config || {};

    const response = await this.apiClient.fetch<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...requestInit,
    });

    return {
      data: response.data,
      success: response.success,
      error: response.error
        ? {
            code: 'API_ERROR',
            message: typeof response.error === 'string' ? response.error : 'Unknown error occurred',
          }
        : undefined,
      meta: {
        timestamp: Date.now(),
      },
    };
  }
}

export default ApiClientHttpMethods;
