export class NetworkMonitor {
  private static instance: NetworkMonitor;
  
  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }
  
  isOnline(): boolean {
    return navigator.onLine;
  }
}

export default NetworkMonitor;