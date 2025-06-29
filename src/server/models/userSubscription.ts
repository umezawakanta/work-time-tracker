// ユーザーサブスクリプション（サイト内プラン管理）のモデル定義
import mongoose, { Document, Schema } from 'mongoose';

// ユーザーサブスクリプションモデルのインターフェース
export interface IUserSubscription extends Document {
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  cancelReason?: string;
  checkStatuses?: Record<string, boolean>; // 月ごとのチェックステータス追加
  paymentMethod?: {
    type: string;
    lastFour?: string;
    expiryDate?: string;
    cardholderName?: string;
    isDefault: boolean;
  };
  scheduledChanges?: {
    newPlanId: string;
    effectiveDate: Date;
  };
  resetAt?: Date;
  resetBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ユーザーサブスクリプションのスキーマ
const UserSubscriptionSchema = new Schema<IUserSubscription>(
  {
    userId: { type: String, required: true, unique: true },
    planId: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'canceled', 'expired'],
      required: true,
    },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    canceledAt: { type: Date },
    cancelReason: { type: String },
    checkStatuses: { type: Map, of: Boolean, default: {} }, // スキーマにcheckStatusesを追加
    paymentMethod: {
      type: {
        type: String,
        enum: ['credit_card', 'bank_transfer', 'other'],
      },
      lastFour: String,
      expiryDate: String,
      cardholderName: String,
      isDefault: { type: Boolean, default: true },
    },
    scheduledChanges: {
      newPlanId: String,
      effectiveDate: Date,
    },
    resetAt: { type: Date },
    resetBy: { type: String },
  },
  {
    timestamps: true, // createdAt, updatedAtを自動的に管理
  }
);

// インデックスの設定
UserSubscriptionSchema.index({ userId: 1 }, { unique: true });
UserSubscriptionSchema.index({ status: 1 });
UserSubscriptionSchema.index({ currentPeriodEnd: 1 });

// モデルの作成
export const UserSubscription = mongoose.model<IUserSubscription>(
  'UserSubscription',
  UserSubscriptionSchema
);
