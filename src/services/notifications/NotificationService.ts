export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: any[];
  data?: any;
}

export interface TaskNotification {
  taskId: string;
  type: 'deadline' | 'reminder' | 'completion' | 'assignment';
  scheduledTime: Date;
  isRead: boolean;
  createdAt: Date;
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private notifications: TaskNotification[] = [];
  private workers: ServiceWorker[] = [];

  constructor() {
    this.checkPermission();
    this.initializeServiceWorker();
  }

  /**
   * 通知許可を確認・要求
   */
  async checkPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    this.permission = Notification.permission;

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'default') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    return false;
  }

  /**
   * ブラウザ通知を表示
   */
  async showNotification(options: NotificationOptions): Promise<Notification | null> {
    const hasPermission = await this.checkPermission();
    if (!hasPermission) {
      console.warn('Notification permission not granted');
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        data: options.data,
      });

      // 通知クリック時の処理
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();

        // タスク詳細画面への遷移など
        if (options.data?.taskId) {
          this.handleNotificationClick(options.data.taskId);
        }

        notification.close();
      };

      // 自動で閉じる（5秒後）
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  /**
   * タスク期限のリマインダー通知
   */
  async notifyTaskDeadline(task: {
    _id: string;
    task: string;
    deadline: string;
    priority: number;
  }): Promise<void> {
    const deadline = new Date(task.deadline);
    const now = new Date();
    const hoursUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));

    let title = '';
    let body = '';
    let requireInteraction = false;

    if (hoursUntilDeadline <= 0) {
      title = '⚠️ 期限超過のタスク';
      body = `「${task.task}」の期限が過ぎています`;
      requireInteraction = true;
    } else if (hoursUntilDeadline <= 1) {
      title = '🚨 期限迫る！';
      body = `「${task.task}」の期限まであと${hoursUntilDeadline}時間です`;
      requireInteraction = true;
    } else if (hoursUntilDeadline <= 24) {
      title = '⏰ 期限リマインダー';
      body = `「${task.task}」の期限まであと${hoursUntilDeadline}時間です`;
    }

    if (title) {
      await this.showNotification({
        title,
        body,
        tag: `deadline-${task._id}`,
        requireInteraction,
        data: { taskId: task._id, type: 'deadline' },
      });

      // 通知履歴に追加
      this.addNotificationHistory({
        taskId: task._id,
        type: 'deadline',
        scheduledTime: now,
        isRead: false,
        createdAt: now,
      });
    }
  }

  /**
   * タスク完了通知
   */
  async notifyTaskCompletion(task: {
    _id: string;
    task: string;
    completedDate: string;
  }): Promise<void> {
    await this.showNotification({
      title: '✅ タスク完了！',
      body: `「${task.task}」が完了しました`,
      tag: `completion-${task._id}`,
      data: { taskId: task._id, type: 'completion' },
    });

    this.addNotificationHistory({
      taskId: task._id,
      type: 'completion',
      scheduledTime: new Date(),
      isRead: false,
      createdAt: new Date(),
    });
  }

  /**
   * 定期的な通知チェック
   */
  startPeriodicCheck(
    tasks: Array<{
      _id: string;
      task: string;
      deadline: string;
      completed: boolean;
      priority: number;
    }>
  ): void {
    // 既存のタイマーをクリア
    this.stopPeriodicCheck();

    // 15分ごとに期限をチェック
    const checkInterval = setInterval(
      () => {
        this.checkTaskDeadlines(tasks);
      },
      15 * 60 * 1000
    );

    // ページ離脱時にクリア
    window.addEventListener('beforeunload', () => {
      clearInterval(checkInterval);
    });
  }

  /**
   * 定期チェックの停止
   */
  stopPeriodicCheck(): void {
    // 実装は上記のsetIntervalの管理で行う
  }

  /**
   * タスク期限の一括チェック
   */
  private checkTaskDeadlines(
    tasks: Array<{
      _id: string;
      task: string;
      deadline: string;
      completed: boolean;
      priority: number;
    }>
  ): void {
    const now = new Date();

    tasks
      .filter((task) => !task.completed && task.deadline)
      .forEach((task) => {
        const deadline = new Date(task.deadline);
        const hoursUntilDeadline = Math.ceil(
          (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
        );

        // 期限の1時間前、24時間前、期限超過時に通知
        if (hoursUntilDeadline === 1 || hoursUntilDeadline === 24 || hoursUntilDeadline <= 0) {
          // 重複通知を避けるため、既に同じタグで通知していないかチェック
          const notificationTag = `deadline-${task._id}-${hoursUntilDeadline}`;
          const existingNotification = this.notifications.find(
            (n) =>
              n.taskId === task._id &&
              n.type === 'deadline' &&
              Math.abs(n.scheduledTime.getTime() - now.getTime()) < 60 * 60 * 1000 // 1時間以内
          );

          if (!existingNotification) {
            this.notifyTaskDeadline(task);
          }
        }
      });
  }

  /**
   * 通知クリック時の処理
   */
  private handleNotificationClick(taskId: string): void {
    // タスク詳細画面への遷移
    const event = new CustomEvent('notificationClick', {
      detail: { taskId },
    });
    window.dispatchEvent(event);
  }

  /**
   * 通知履歴の追加
   */
  private addNotificationHistory(notification: TaskNotification): void {
    this.notifications.unshift(notification);

    // 最新100件のみ保持
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    // LocalStorageに保存
    try {
      localStorage.setItem('notification-history', JSON.stringify(this.notifications));
    } catch (error) {
      console.warn('Failed to save notification history:', error);
    }
  }

  /**
   * Service Workerの初期化
   */
  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
  }

  /**
   * 通知履歴の取得
   */
  getNotificationHistory(): TaskNotification[] {
    try {
      const stored = localStorage.getItem('notification-history');
      if (stored) {
        this.notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          scheduledTime: new Date(n.scheduledTime),
          createdAt: new Date(n.createdAt),
        }));
      }
    } catch (error) {
      console.warn('Failed to load notification history:', error);
    }

    return this.notifications;
  }

  /**
   * 通知の既読マーク
   */
  markAsRead(taskId: string): void {
    const notification = this.notifications.find((n) => n.taskId === taskId);
    if (notification) {
      notification.isRead = true;
      this.saveNotificationHistory();
    }
  }

  /**
   * 全ての通知を既読にする
   */
  markAllAsRead(): void {
    this.notifications.forEach((n) => (n.isRead = true));
    this.saveNotificationHistory();
  }

  /**
   * 通知履歴の保存
   */
  private saveNotificationHistory(): void {
    try {
      localStorage.setItem('notification-history', JSON.stringify(this.notifications));
    } catch (error) {
      console.warn('Failed to save notification history:', error);
    }
  }

  /**
   * 未読通知の数を取得
   */
  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }
}

// シングルトンインスタンス
export const notificationService = new NotificationService();
export default notificationService;
