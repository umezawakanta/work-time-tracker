import mongoose from 'mongoose';

export interface IUserSubscription extends mongoose.Document {
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSubscriptionSchema = new mongoose.Schema<IUserSubscription>(
  {
    userId: { 
      type: String, 
      required: true,
      index: true 
    },
    planId: { 
      type: String, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['active', 'canceled', 'expired'],
      default: 'active' 
    },
    currentPeriodEnd: { 
      type: Date, 
      required: true 
    },
    cancelAtPeriodEnd: { 
      type: Boolean, 
      default: false 
    }
  },
  { 
    timestamps: true 
  }
);

export const UserSubscription = mongoose.model<IUserSubscription>('UserSubscription', UserSubscriptionSchema);