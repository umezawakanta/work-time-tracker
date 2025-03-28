import mongoose from "mongoose";

export interface ISubscription extends mongoose.Document {
  name: string;
  billingDate: string;
  type: string;
  amount: number;
  // 追加のフィールド
  isActive?: boolean;
  category?: string;
  description?: string;
  lastBilledAt?: Date;
  nextBillingDate?: Date;
  currency?: string;
  billingCycle?: 'monthly' | 'yearly' | 'quarterly';
  notes?: string;
  url?: string;
  autoRenew?: boolean;
  startDate?: string;
  expiresAt?: Date;
  owner?: mongoose.Types.ObjectId; // ユーザー関連付け用
}

const SubscriptionSchema = new mongoose.Schema<ISubscription>({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  billingDate: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: [0, '金額は0以上である必要があります'] 
  },
  // 追加のフィールド定義
  isActive: { 
    type: Boolean, 
    default: true 
  },
  category: { 
    type: String,
    trim: true 
  },
  description: { 
    type: String,
    trim: true 
  },
  lastBilledAt: { 
    type: Date 
  },
  nextBillingDate: { 
    type: Date 
  },
  currency: { 
    type: String, 
    default: 'JPY' 
  },
  billingCycle: { 
    type: String,
    enum: ['monthly', 'yearly', 'quarterly'],
    default: 'monthly' 
  },
  notes: { 
    type: String,
    trim: true 
  },
  url: { 
    type: String,
    validate: {
      validator: function(v: string) {
        // URLの簡易バリデーション（不要なエスケープ文字を削除）
        return !v || /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v);
      },
      message: props => `${props.value}は有効なURLではありません`
    }
  },
  autoRenew: { 
    type: Boolean, 
    default: true 
  },
  startDate: { 
    type: String 
  },
  expiresAt: { 
    type: Date 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, {
  timestamps: true, // createdAtとupdatedAtを自動追加
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// バーチャルプロパティの追加例
SubscriptionSchema.virtual('isExpired').get(function() {
  return this.expiresAt ? new Date() > this.expiresAt : false;
});

// カスタムメソッドの追加
SubscriptionSchema.methods.calculateNextBillingDate = function() {
  if (!this.lastBilledAt) return;

  const lastBilled = new Date(this.lastBilledAt);
  switch (this.billingCycle) {
    case 'monthly':
      return new Date(lastBilled.setMonth(lastBilled.getMonth() + 1));
    case 'quarterly':
      return new Date(lastBilled.setMonth(lastBilled.getMonth() + 3));
    case 'yearly':
      return new Date(lastBilled.setFullYear(lastBilled.getFullYear() + 1));
    default:
      return null;
  }
};

// スタティックメソッドの追加
SubscriptionSchema.statics.findActiveSubscriptions = function(userId) {
  return this.find({ 
    owner: userId, 
    isActive: true,
    expiresAt: { $gt: new Date() }
  });
};

export const Subscription = mongoose.model<ISubscription>(
  "Subscription",
  SubscriptionSchema
);