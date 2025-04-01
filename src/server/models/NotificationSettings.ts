import mongoose from "mongoose";

export interface INotificationSettings extends mongoose.Document {
  userId: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
  reminders: boolean;
  reports: boolean;
  alerts: boolean;
  marketing: boolean;
  emailFrequency: string;
  createdAt: Date;
  updatedAt: Date;

  // save メソッドを追加
  save(): Promise<this>;
}

const NotificationSettingsSchema = new mongoose.Schema<INotificationSettings>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: Boolean, default: true }, // メール通知
    push: { type: Boolean, default: true }, // プッシュ通知
    inApp: { type: Boolean, default: true }, // アプリ内通知
    reminders: { type: Boolean, default: true }, // リマインダー通知
    reports: { type: Boolean, default: true }, // レポート通知
    alerts: { type: Boolean, default: true }, // アラート通知
    marketing: { type: Boolean, default: false }, // マーケティング通知
    emailFrequency: {
      type: String,
      enum: ["immediate", "daily", "weekly", "never"],
      default: "immediate"
    }, // メール通知の頻度
  },
  { timestamps: true } // createdAt, updatedAtフィールドを自動追加
);

export const NotificationSettings = mongoose.model<INotificationSettings>(
  "NotificationSettings",
  NotificationSettingsSchema
);