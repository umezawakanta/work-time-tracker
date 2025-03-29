import mongoose from "mongoose";

export interface ISubscription extends mongoose.Document {
  name: string;
  billingDate: string;
  type: string;
  amount: number;
  paymentMethod: 'credit' | 'bank' | 'paypal' | 'apple' | 'google';
  bankAccount: string | null;
  checkedMonths: string[];
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  billingDate: {
    type: String,
    required: true,
    // YYYY/MM/DD形式のバリデーション
    validate: {
      validator: function(v: string) {
        return /^\d{4}\/\d{2}\/\d{2}$/.test(v);
      },
      message: (props: { value: string }) => `${props.value} は有効な日付形式(YYYY/MM/DD)ではありません。`
    }
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['credit', 'bank', 'paypal', 'apple', 'google'],
    default: 'credit'
  },
  bankAccount: {
    type: String,
    default: null
  },
  checkedMonths: [{
    type: String,
    // YYYY/MM形式のバリデーション
    validate: {
      validator: function(v: string) {
        return /^\d{4}\/\d{2}$/.test(v);
      },
      message: (props: { value: string }) => `${props.value} は有効な月形式(YYYY/MM)ではありません。`
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// インデックスの設定
SubscriptionSchema.index({ type: 1 });
SubscriptionSchema.index({ paymentMethod: 1 });
SubscriptionSchema.index({ billingDate: 1 });
SubscriptionSchema.index({ isActive: 1 });

export const Subscription = mongoose.model<ISubscription>("Subscription", SubscriptionSchema);