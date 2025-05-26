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

  async fetch<T = any>(
    url: string, 
    options?: RequestInit
  ): Promise<{ data: T; success: boolean; error?: any }> {
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
        error: response.ok ? undefined : data.error
      };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  async get<T = any>(url: string, params?: any): Promise<{ data: T; success: boolean; error?: any }> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.fetch<T>(`${url}${queryString}`, { method: 'GET' });
  }
  
  async post<T = any>(url: string, data?: any): Promise<{ data: T; success: boolean; error?: any }> {
    return this.fetch<T>(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  async put<T = any>(url: string, data?: any): Promise<{ data: T; success: boolean; error?: any }> {
    return this.fetch<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  async delete<T = any>(url: string): Promise<{ data: T; success: boolean; error?: any }> {
    return this.fetch<T>(url, { method: 'DELETE' });
  }
  
  async patch<T = any>(url: string, data?: any): Promise<{ data: T; success: boolean; error?: any }> {
    return this.fetch<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
}

export default ApiClient;