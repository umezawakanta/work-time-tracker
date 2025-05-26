export class Logger {
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
}