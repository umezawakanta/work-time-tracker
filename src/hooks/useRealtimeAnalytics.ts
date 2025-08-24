import { useState, useEffect, useRef, useCallback } from 'react';

interface AnalyticsData {
  activeUsers: number;
  completionRate: number;
  todaysTasks: number;
  weeklyTrend: number;
  realtimeEvents: AnalyticsEvent[];
}

interface AnalyticsEvent {
  id: string;
  timestamp: Date;
  type: 'task_created' | 'task_completed' | 'user_joined' | 'user_left';
  userId: string;
  data: Record<string, any>;
}

interface UseRealtimeAnalyticsOptions {
  userId?: string;
  teamId?: string;
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxEvents?: number;
}

/**
 * 📊 データウィザード: リアルタイム分析フック
 * WebSocket接続とライブデータ管理を行うカスタムフック
 */
export const useRealtimeAnalytics = (options: UseRealtimeAnalyticsOptions = {}) => {
  const {
    userId = 'current-user',
    teamId,
    autoConnect = true,
    reconnectInterval = 5000,
    maxEvents = 100,
  } = options;

  const [data, setData] = useState<AnalyticsData>({
    activeUsers: 0,
    completionRate: 0,
    todaysTasks: 0,
    weeklyTrend: 0,
    realtimeEvents: [],
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 📊 WebSocket接続
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // 既に接続済み
    }

    setIsConnecting(true);
    setError(null);

    try {
      // 動的ポート検出
      const getWebSocketUrl = () => {
        if (process.env.VITE_WEBSOCKET_URL) {
          return process.env.VITE_WEBSOCKET_URL;
        }

        // 開発環境では現在のホストとポートを使用
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          const currentPort = window.location.port;
          // フロントエンドポートから推測（フロントエンドが3003なら、バックエンドは3004）
          const backendPort = currentPort ? parseInt(currentPort) + 1 : 3001;
          return `ws://${window.location.hostname}:${backendPort}`;
        }

        // 本番環境では現在のホストを使用
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${window.location.host}`;
      };

      const wsUrl = getWebSocketUrl();
      // In production, attempt only if same-origin wss is available
      if (
        !wsUrl &&
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1'
      ) {
        console.warn('RealtimeAnalytics: Skipping WebSocket connect in production (no URL)');
        setIsConnecting(false);
        return;
      }
      // サーバーが提供している /notifications パスを使用
      const ws = new WebSocket(`${wsUrl}/notifications`);

      ws.onopen = () => {
        console.log('📊 Real-time analytics connected');
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);

        // 認証とサブスクリプション
        ws.send(
          JSON.stringify({
            type: 'auth',
            userId,
            teamId,
            token: localStorage.getItem('accessToken'),
          })
        );

        ws.send(
          JSON.stringify({
            type: 'subscribe',
            channels: ['analytics', 'tasks', 'users'],
          })
        );

        // ピング送信で接続維持
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
          setLastUpdate(new Date());
        } catch (error) {
          console.error('Analytics WebSocket message parse error:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('📊 Analytics WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // 自動再接続
        if (autoConnect && !event.wasClean) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('📊 Analytics WebSocket error:', error);
        setError('接続エラーが発生しました');
        setIsConnecting(false);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setError('接続に失敗しました');
      setIsConnecting(false);
    }
  }, [userId, teamId, autoConnect, reconnectInterval]);

  // メッセージハンドラー
  const handleMessage = useCallback(
    (message: any) => {
      switch (message.type) {
        case 'analytics_data':
          console.log('📊 Received analytics data:', message.data);
          setData((prev) => ({
            ...prev,
            ...message.data,
            realtimeEvents: prev.realtimeEvents, // 既存のイベントを保持
          }));
          break;

        case 'analytics_update':
          setData((prev) => ({
            ...prev,
            ...message.data,
          }));
          break;

        case 'event': {
          const newEvent: AnalyticsEvent = {
            id: message.id || `${Date.now()}-${Math.random()}`,
            timestamp: new Date(message.timestamp || Date.now()),
            type: message.eventType,
            userId: message.userId,
            data: message.data || {},
          };

          setData((prev) => ({
            ...prev,
            realtimeEvents: [newEvent, ...prev.realtimeEvents.slice(0, maxEvents - 1)],
          }));

          // 特定イベントの処理
          if (message.eventType === 'task_completed') {
            setData((prev) => ({
              ...prev,
              todaysTasks: prev.todaysTasks + 1,
              completionRate: Math.min(prev.completionRate + 1, 100),
            }));
          }
          break;
        }

        case 'user_count_update':
          setData((prev) => ({
            ...prev,
            activeUsers: message.count,
          }));
          break;

        case 'subscribe_success':
          console.log('📊 Successfully subscribed to channels:', message.channels);
          break;

        case 'pong':
          // ピング応答 - 接続確認
          break;

        default:
          console.log('Unknown analytics message type:', message.type);
      }
    },
    [maxEvents]
  );

  // 切断
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  // イベント送信
  const sendEvent = useCallback((eventType: string, eventData: Record<string, any> = {}) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'event',
          eventType,
          data: eventData,
          timestamp: new Date().toISOString(),
        })
      );
    } else {
      console.warn('WebSocket not connected, event not sent:', eventType);
    }
  }, []);

  // データリフレッシュ
  const refresh = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'refresh' }));
    } else {
      // フォールバック: HTTP APIで取得
      try {
        const response = await fetch('/api/analytics/current', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (response.ok) {
          const analyticsData = await response.json();
          setData((prev) => ({
            ...prev,
            ...analyticsData,
          }));
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error('Failed to refresh analytics data:', error);
      }
    }
  }, []);

  // 初期化
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, autoConnect]);

  return {
    data,
    isConnected,
    isConnecting,
    error,
    lastUpdate,
    connect,
    disconnect,
    sendEvent,
    refresh,
    // 便利なヘルパー関数
    trackTaskCompletion: (taskId: string, taskData: Record<string, any> = {}) => {
      sendEvent('task_completed', { taskId, ...taskData });
    },
    trackTaskCreation: (taskId: string, taskData: Record<string, any> = {}) => {
      sendEvent('task_created', { taskId, ...taskData });
    },
    trackUserActivity: (activityType: string, activityData: Record<string, any> = {}) => {
      sendEvent('user_activity', { activityType, ...activityData });
    },
  };
};
