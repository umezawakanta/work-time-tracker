import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

export interface Notification {
  id: string;
  type:
    | 'task_assigned'
    | 'task_updated'
    | 'task_completed'
    | 'mention'
    | 'deadline_reminder'
    | 'team_invitation';
  title: string;
  message: string;
  data?: Record<string, any>;
  userId: string;
  teamId?: string;
  taskId?: string;
  read: boolean;
  createdAt: Date;
}

class NotificationService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(notification: Notification) => void>> = new Map();

  connect(userId: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(process.env.VITE_WEBSOCKET_URL || 'http://localhost:3001', {
      auth: {
        token: localStorage.getItem('accessToken'),
        userId,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('🔗 Notification service connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Notification service disconnected');
    });

    this.socket.on('notification', (notification: Notification) => {
      this.handleNotification(notification);
    });

    this.socket.on('error', (error) => {
      console.error('Notification service error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private handleNotification(notification: Notification) {
    // トーストで表示
    this.showToast(notification);

    // リスナーに通知
    const typeListeners = this.listeners.get(notification.type);
    if (typeListeners) {
      typeListeners.forEach((listener) => listener(notification));
    }

    const globalListeners = this.listeners.get('*');
    if (globalListeners) {
      globalListeners.forEach((listener) => listener(notification));
    }

    // ブラウザ通知も表示（許可されている場合）
    this.showBrowserNotification(notification);
  }

  private showToast(notification: Notification) {
    const icons = {
      task_assigned: '📋',
      task_updated: '✏️',
      task_completed: '✅',
      mention: '👤',
      deadline_reminder: '⏰',
      team_invitation: '👥',
    };

    toast(notification.message, {
      icon: icons[notification.type] || '📢',
      duration: 4000,
      position: 'top-right',
    });
  }

  private showBrowserNotification(notification: Notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
      });
    }
  }

  // 通知タイプ別リスナー登録
  on(type: Notification['type'] | '*', listener: (notification: Notification) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);

    return () => {
      const typeListeners = this.listeners.get(type);
      if (typeListeners) {
        typeListeners.delete(listener);
        if (typeListeners.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }

  // 通知権限の要求
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // 通知の既読マーク
  async markAsRead(notificationId: string) {
    try {
      await fetch(`${process.env.VITE_API_URL}/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  // 通知の一括既読
  async markAllAsRead() {
    try {
      await fetch(`${process.env.VITE_API_URL}/notifications/read-all`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }
}

export const notificationService = new NotificationService();
