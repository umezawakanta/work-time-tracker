import mongoose from 'mongoose';

export interface INotification extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  type: 'memo_response' | 'status_update' | 'admin_message' | 'memo_reply';
  title: string;
  message: string;
  relatedMemoId?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new mongoose.Schema<INotification>({
  userId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['memo_response', 'status_update', 'admin_message', 'memo_reply'], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedMemoId: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 更新時にupdatedAtを自動更新
NotificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
