import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeEntry extends Document {
  userId: string;
  projectId?: string;
  projectName?: string;
  category: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // 秒単位
  isActive: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TimeEntrySchema = new Schema<ITimeEntry>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  projectId: {
    type: String,
    required: false
  },
  projectName: {
    type: String,
    required: false
  },
  category: {
    type: String,
    required: true,
    default: 'work'
  },
  description: {
    type: String,
    required: false
  },
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {
    type: Date,
    required: false
  },
  duration: {
    type: Number,
    required: false
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },
  tags: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// インデックスを追加
TimeEntrySchema.index({ userId: 1, startTime: -1 });
TimeEntrySchema.index({ userId: 1, isActive: 1 });

// 更新時にupdatedAtを自動更新
TimeEntrySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const TimeEntry = mongoose.models.TimeEntry || mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);
