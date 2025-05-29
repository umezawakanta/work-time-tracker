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
    const response = await this.apiClient.fetch<T>(`${url}${queryString}`, {
      method: 'GET',
      ...config,
    });

    return {
      ...response,
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
    const response = await this.apiClient.fetch<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...config,
    });

    return {
      ...response,
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
    const response = await this.apiClient.fetch<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...config,
    });

    return {
      ...response,
      meta: {
        timestamp: Date.now(),
      },
    };
  }

  async delete<T = unknown>(url: string, config?: ExtendedRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.apiClient.fetch<T>(url, {
      method: 'DELETE',
      ...config,
    });

    return {
      ...response,
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
    const response = await this.apiClient.fetch<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...config,
    });

    return {
      ...response,
      meta: {
        timestamp: Date.now(),
      },
    };
  }
}

export default ApiClientHttpMethods;
