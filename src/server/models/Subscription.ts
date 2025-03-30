// 一般サブスクリプション（外部サービス）のモデル定義
import mongoose, { Document, Schema } from "mongoose";

// サブスクリプションモデルのインターフェース
export interface ISubscription extends Document {
  name: string;
  billingDate: number;
  type: string;
  amount: number;
  userId?: string;
  checkStatuses?: Record<string, boolean>;
  paymentMethod?: {
    type: string;
    lastFour?: string;
    expiryDate?: string;
    cardholderName?: string;
    isDefault: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// サブスクリプションのスキーマ
const SubscriptionSchema = new Schema<ISubscription>(
  {
    name: { type: String, required: true },
    billingDate: { type: Number, required: true },
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    userId: { type: String },
    checkStatuses: { type: Map, of: Boolean, default: {} },
    paymentMethod: {
      type: {
        type: String,
        enum: ['credit_card', 'bank_transfer', 'other']
      },
      lastFour: String,
      expiryDate: String,
      cardholderName: String,
      isDefault: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true, // createdAt, updatedAtを自動的に管理
  }
);

// インデックスの設定
SubscriptionSchema.index({ userId: 1 });
SubscriptionSchema.index({ type: 1 });

// モデルの作成
export const Subscription = mongoose.model<ISubscription>("Subscription", SubscriptionSchema);