import { Server as HttpServer } from 'http';
import { WebSocketServer } from 'ws';
import WebSocket from 'ws';
import { IncomingMessage } from 'http';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Notification } from '../models/Notification.js';
import { NotificationSettings } from '../models/NotificationSettings.js';

// カスタムペイロード型を定義
interface CustomJwtPayload extends JwtPayload {
  id: string;
}

// WebSocketサービスの戻り値型
interface WebSocketService {
  sendNotification: (userId: string, notification: NotificationDocument) => Promise<boolean>;
  broadcastNotification: (message: string) => void;
}

// 通知データ型の定義
interface NotificationData {
  userId: string;
  type: 'reminder' | 'report' | 'alert' | string;
  title?: string;
  message?: string;
  link?: string;
  [key: string]: unknown;
}

// 通知ドキュメント型の定義
interface NotificationDocument extends NotificationData {
  _id?: string;
  timestamp: Date;
  read: boolean;
  save: () => Promise<NotificationDocument>;
}

// WebSocketサーバーの設定
export const setupWebSocketServer = (server: HttpServer): WebSocketService => {
  // WebSocketサーバーの作成（パスを指定）
  const wss = new WebSocketServer({
    server,
    path: '/notifications', // クライアント側のパスと一致させる
  });

  console.log('WebSocketサーバーを初期化しました。パス: /notifications');

  // クライアント接続を保持するマップ
  const clients = new Map<string, WebSocket>();

  // 接続イベントのハンドリング
  wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
    console.log('WebSocket接続が確立されました。URL:', request.url);

    // メッセージ受信時の処理
    ws.on('message', async (message: WebSocket.Data) => {
      try {
        const data = JSON.parse(typeof message === 'string' ? message : message.toString());
        console.log('WebSocketメッセージを受信しました:', data.type);

        // 認証処理
        if (data.type === 'auth') {
          // トークンの検証
          const token = data.token;
          if (!token) {
            console.error('認証トークンがありません');
            ws.send(JSON.stringify({ type: 'error', message: '認証トークンがありません' }));
            return;
          }

          try {
            // トークンの検証（実際の実装ではシークレットキーは環境変数から取得）
            const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
            console.log('JWT検証を実行します。Secret長:', jwtSecret.length);

            const decoded = jwt.verify(token, jwtSecret) as CustomJwtPayload;
            const userId = decoded.id;

            // ユーザーIDを確認
            if (userId !== data.userId) {
              console.error(
                `認証エラー: トークンのユーザーID(${userId})と送信されたID(${data.userId})が一致しません`
              );
              ws.send(JSON.stringify({ type: 'error', message: '無効な認証情報です' }));
              return;
            }

            // クライアントを保存
            clients.set(userId, ws);
            console.log(`ユーザー ${userId} が認証されました`);

            // 認証成功のレスポンス
            ws.send(JSON.stringify({ type: 'auth_success' }));

            // 接続中のクライアント数をログ
            console.log(`接続中のクライアント数: ${clients.size}`);
          } catch (err) {
            console.error('トークン検証エラー:', err);
            ws.send(JSON.stringify({ type: 'error', message: '無効なトークンです' }));
          }
        }
      } catch (error) {
        console.error('WebSocketメッセージ処理エラー:', error);
      }
    });

    // 接続切断時の処理
    ws.on('close', (code, reason) => {
      console.log(`WebSocket接続が閉じられました。コード: ${code}, 理由: ${reason}`);

      // クライアントマップからユーザーを削除
      for (const [userId, client] of clients.entries()) {
        if (client === ws) {
          clients.delete(userId);
          console.log(`ユーザー ${userId} の接続が切断されました`);
          break;
        }
      }
      console.log(`接続中のクライアント数: ${clients.size}`);
    });

    // エラー時の処理
    ws.on('error', (error) => {
      console.error('WebSocketエラー:', error);
    });
  });

  // サーバーエラー時の処理
  wss.on('error', (error) => {
    console.error('WebSocketサーバーエラー:', error);
  });

  return {
    // 特定のユーザーに通知を送信する関数
    sendNotification: async (
      userId: string,
      notification: NotificationDocument
    ): Promise<boolean> => {
      try {
        // ユーザーの通知設定を確認
        const settings = await NotificationSettings.findOne({ userId });

        // 通知設定がある場合、設定に基づいて処理
        if (settings) {
          // アプリ内通知がオフの場合はスキップ
          if (!settings.inApp) {
            console.log(`ユーザー ${userId} のアプリ内通知はオフです`);
            return false;
          }

          // 通知タイプに基づいて設定を確認
          const notificationType = notification.type;
          if (
            (notificationType === 'reminder' && !settings.reminders) ||
            (notificationType === 'report' && !settings.reports) ||
            (notificationType === 'alert' && !settings.alerts)
          ) {
            console.log(`ユーザー ${userId} の ${notificationType} 通知はオフです`);
            return false;
          }
        }

        // 接続中のクライアントを取得
        const client = clients.get(userId);
        if (!client) {
          console.log(`ユーザー ${userId} は現在オフラインです`);
          return false;
        }

        // WebSocketが開いている場合のみ送信
        if (client.readyState === WebSocket.OPEN) {
          const payload = JSON.stringify({
            type: 'notification',
            notification,
          });

          client.send(payload);
          console.log(`ユーザー ${userId} に通知を送信しました: ${notification.type}`);
          return true;
        } else {
          console.log(
            `ユーザー ${userId} のWebSocket接続が開いていません。readyState: ${client.readyState}`
          );
          return false;
        }
      } catch (error) {
        console.error('通知送信エラー:', error);
        return false;
      }
    },

    // すべてのユーザーにブロードキャストする関数（システム全体通知用）
    broadcastNotification: (message: string): void => {
      console.log(`全ユーザーへブロードキャスト通知: ${message}`);
      let sentCount = 0;

      clients.forEach((client) => {
        // ここからuserId引数を削除
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: 'broadcast',
              message,
            })
          );
          sentCount++;
        }
      });

      console.log(`ブロードキャスト通知を ${sentCount}/${clients.size} クライアントに送信しました`);
    },
  };
};

// 通知を作成し、WebSocketで送信する関数
export const createAndSendNotification = async (
  wsService: WebSocketService | null,
  notificationData: NotificationData
): Promise<NotificationDocument | null> => {
  try {
    // 通知設定を確認
    const userId = notificationData.userId;
    const settings = await NotificationSettings.findOne({ userId });

    // 設定に基づいて通知をスキップするかどうか判断
    if (settings) {
      const notificationType = notificationData.type;
      if (
        (notificationType === 'reminder' && !settings.reminders) ||
        (notificationType === 'report' && !settings.reports) ||
        (notificationType === 'alert' && !settings.alerts) ||
        !settings.inApp
      ) {
        console.log(`ユーザー ${userId} の通知設定により通知はスキップされました`);
        return null;
      }
    }

    // データベースに通知を保存
    const notificationObj = {
      ...notificationData,
      timestamp: new Date(),
      read: false,
    };

    // 新しい通知ドキュメントを作成
    const notificationDoc = new Notification(notificationObj);

    // Mongooseドキュメントを NotificationDocument 型にキャスト
    const notification = notificationDoc as unknown as NotificationDocument;

    // 保存
    await notification.save();
    console.log(`通知をデータベースに保存しました: ${notification._id}`);

    // WebSocketで通知を送信
    if (wsService) {
      const sent = await wsService.sendNotification(userId, notification);
      console.log(`WebSocketで通知送信: ${sent ? '成功' : '失敗'}`);
    } else {
      console.log(
        'WebSocketサービスが提供されていないため、通知はデータベースにのみ保存されました'
      );
    }

    return notification;
  } catch (error) {
    console.error('通知作成エラー:', error);
    return null;
  }
};
