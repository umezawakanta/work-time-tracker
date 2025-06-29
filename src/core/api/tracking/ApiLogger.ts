export class ApiLogger {
  private static instance: ApiLogger;
  private context: string = '';

  static getInstance(): ApiLogger {
    if (!ApiLogger.instance) {
      ApiLogger.instance = new ApiLogger();
    }
    return ApiLogger.instance;
  }

  setContext(context: string): void {
    this.context = context;
  }

  private formatMessage(message: string): string {
    return this.context ? `[${this.context}] ${message}` : message;
  }

  log(level: string, message: string, data?: any): void {
    console.log(`[${level}] ${this.formatMessage(message)}`, data);
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
