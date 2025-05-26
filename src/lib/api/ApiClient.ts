export class ApiClient {
  private static instance: ApiClient;
  
  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }
  
  async get<T = any>(url: string, params?: any): Promise<{ data: T; success: boolean; error?: any }> {
    return { data: {} as T, success: true };
  }
  
  async post<T = any>(url: string, data?: any): Promise<{ data: T; success: boolean; error?: any }> {
    return { data: {} as T, success: true };
  }
  
  async fetch<T = any>(url: string, options?: any): Promise<{ data: T; success: boolean; error?: any }> {
    return { data: {} as T, success: true };
  }
}

export default ApiClient;