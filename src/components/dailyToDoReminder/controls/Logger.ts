export class Logger {
  private static instance: Logger;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // Static methods
  static log(level: string, message: string, data?: any): void {
    console.log(`[${level}] ${message}`, data);
  }

  static info(message: string, data?: any): void {
    this.log('INFO', message, data);
  }

  static error(message: string, error?: any): void {
    this.log('ERROR', message, error);
  }

  static warn(message: string, data?: any): void {
    this.log('WARN', message, data);
  }

  // Instance methods
  log(level: string, message: string, data?: any): void {
    Logger.log(level, message, data);
  }

  info(message: string, data?: any): void {
    Logger.info(message, data);
  }

  error(message: string, error?: any): void {
    Logger.error(message, error);
  }

  warn(message: string, data?: any): void {
    Logger.warn(message, data);
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      Logger.log('DEBUG', message, data);
    }
  }
}

export default Logger;
