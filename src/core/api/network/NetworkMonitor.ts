export class NetworkMonitor {
  private static instance: NetworkMonitor;
  private listeners: Array<(isOnline: boolean) => void> = [];
  private monitoring = false;

  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  onStatusChange(callback: (isOnline: boolean) => void): void {
    this.listeners.push(callback);
  }

  startMonitoring(): void {
    if (this.monitoring) return;

    this.monitoring = true;
    const handleOnline = () => this.notifyListeners(true);
    const handleOffline = () => this.notifyListeners(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  }

  stopMonitoring(): void {
    this.monitoring = false;
    // Remove event listeners if needed
  }

  private notifyListeners(isOnline: boolean): void {
    this.listeners.forEach((callback) => callback(isOnline));
  }
}

export default NetworkMonitor;
