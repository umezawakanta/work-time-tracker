import { ApiResponse, RequestConfig } from './ApiTypes';
import ApiClient from './ApiClient';

export class ApiClientHttpMethods {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async get<T = any>(
    url: string,
    params?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await this.apiClient.fetch<T>(`${url}${queryString}`, { 
      method: 'GET',
      ...config 
    });
    
    return {
      ...response,
      meta: {
        timestamp: Date.now(),
        ...response.meta
      }
    };
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.apiClient.fetch<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...config
    });
    
    return {
      ...response,
      meta: {
        timestamp: Date.now(),
        ...response.meta
      }
    };
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.apiClient.fetch<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...config
    });
    
    return {
      ...response,
      meta: {
        timestamp: Date.now(),
        ...response.meta
      }
    };
  }

  async delete<T = any>(
    url: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.apiClient.fetch<T>(url, {
      method: 'DELETE',
      ...config
    });
    
    return {
      ...response,
      meta: {
        timestamp: Date.now(),
        ...response.meta
      }
    };
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.apiClient.fetch<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...config
    });
    
    return {
      ...response,
      meta: {
        timestamp: Date.now(),
        ...response.meta
      }
    };
  }
}

export default ApiClientHttpMethods;