import { GitHubWebhookPayload } from '@/types/github';

export class WebhookService {
  private static instance: WebhookService;
  private eventListeners: Array<(payload: GitHubWebhookPayload) => void> = [];

  static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  // Webhookイベントリスナーを追加
  addListener(callback: (payload: GitHubWebhookPayload) => void) {
    this.eventListeners.push(callback);
  }

  // Webhookイベントリスナーを削除
  removeListener(callback: (payload: GitHubWebhookPayload) => void) {
    this.eventListeners = this.eventListeners.filter((listener) => listener !== callback);
  }

  // Webhookペイロードを処理
  handleWebhook(payload: GitHubWebhookPayload) {
    this.eventListeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (error) {
        console.error('Webhook listener error:', error);
      }
    });
  }

  // WebSocketまたはServer-Sent Eventsでリアルタイム更新を実装
  startRealtimeUpdates() {
    // 実装は環境に依存
    if (typeof EventSource !== 'undefined') {
      const eventSource = new EventSource('/api/github-events');

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as GitHubWebhookPayload;
          this.handleWebhook(payload);
        } catch (error) {
          console.error('Failed to parse webhook payload:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
      };

      return () => eventSource.close();
    }
  }
}
