export class ApiLogger {
  debug(message: string): void {
    console.debug(message);
  }

  setContext(context: string): void {
    // コンテキスト設定
  }
  private static instance: ApiLogger;
  
  constructor() {}
  
  static getInstance(): ApiLogger {
    if (!this.instance) {
      this.instance = new ApiLogger();
    }
    return this.instance;
  }
  
  log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }
  
  info(message: string, data?: any): void {
    this.log('info', message, data);
  }
  
  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }
  
  error(message: string, data?: any): void {
    this.log('error', message, data);
  }
}

export default ApiLogger;
