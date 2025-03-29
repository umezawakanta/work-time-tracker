import mongoose from "mongoose";

export interface IUserSubscription extends mongoose.Document {
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  planId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'expired'],
    default: 'active',
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// インデックスの設定
UserSubscriptionSchema.index({ userId: 1 });
UserSubscriptionSchema.index({ status: 1 });
UserSubscriptionSchema.index({ currentPeriodEnd: 1 });

export const UserSubscription = mongoose.model<IUserSubscription>("UserSubscription", UserSubscriptionSchema);