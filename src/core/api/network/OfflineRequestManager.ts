export class OfflineRequestManager {
  queue(request: any): void {
    // Stub
  }

  processPendingRequests(): void {
    // Stub
  }

  initialize(): void {
    // Stub
  }

  handleOfflineRequest(requestFn: any): Promise<any> {
    return Promise.reject(new Error('Offline'));
  }

  saveState(): void {
    // Stub
  }
}
