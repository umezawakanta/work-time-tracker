export class ApiLogger {
  private static instance: ApiLogger;
  
  static getInstance(): ApiLogger {
    if (!ApiLogger.instance) {
      ApiLogger.instance = new ApiLogger();
    }
    return ApiLogger.instance;
  }
  
  log(level: string, message: string, data?: any): void {
    console.log(`[${level}] ${message}`, data);
  }
  
  info(message: string, data?: any): void {
    this.log('INFO', message, data);
  }
  
  error(message: string, error?: any): void {
    this.log('ERROR', message, error);
  }
  
  warn(message: string, data?: any): void {
    this.log('WARN', message, data);
  }
  
  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      this.log('DEBUG', message, data);
    }
  }
}