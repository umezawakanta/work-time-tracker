import mongoose from 'mongoose';

export interface INotification extends mongoose.Document {
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  timestamp: Date;
  link?: string;
  expiresAt?: Date;
  metadata?: object;
  createdAt: Date;
  updatedAt: Date;

  // save メソッドを追加
  save(): Promise<this>;
}

const NotificationSchema = new mongoose.Schema<INotification>(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['reminder', 'report', 'alert', 'success', 'info'],
      default: 'info',
    },
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
    link: { type: String }, // 通知をクリックした際の遷移先URL（オプション）
    expiresAt: { type: Date }, // 通知の有効期限（オプション）
    metadata: { type: mongoose.Schema.Types.Mixed }, // 追加のデータを保存できる柔軟なフィールド
  },
  { timestamps: true } // createdAt, updatedAtフィールドを自動追加
);

// インデックスを作成して検索パフォーマンスを向上
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, timestamp: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTLインデックス - 期限切れの通知を自動削除

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
