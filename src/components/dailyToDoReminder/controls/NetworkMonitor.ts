export class NetworkMonitor {
  private isOnline: boolean = true;
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  private checkInterval: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => this.updateStatus(true));
      window.addEventListener('offline', () => this.updateStatus(false));
    }
  }

  private updateStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  onStatusChange(callback: (isOnline: boolean) => void): void {
    this.listeners.add(callback);
  }

  startMonitoring(): void {
    if (this.checkInterval) return;
    
    this.checkInterval = window.setInterval(() => {
      const wasOnline = this.isOnline;
      this.isOnline = navigator.onLine;
      
      if (wasOnline !== this.isOnline) {
        this.notifyListeners();
      }
    }, 5000);
  }

  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  isConnected(): boolean {
    return this.isOnline;
  }
}

export default NetworkMonitor;