export interface BatchRequestItem {
  id?: string;
  endpoint: string;
  method: string;
  data?: any;
  params?: any;
  config?: any;
}
