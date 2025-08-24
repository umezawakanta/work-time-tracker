import mongoose, { Document, Schema } from 'mongoose';

export interface IImplementationLog extends Document {
  action: string;
  details?: string;
  projectId: string;
  userId: string;
  user: string;
  timestamp: Date;
}

const implementationLogSchema = new Schema(
  {
    action: { type: String, required: true },
    details: { type: String },
    projectId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    user: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false } // timestampフィールドを手動で管理
);

// インデックスの作成
implementationLogSchema.index({ projectId: 1, timestamp: -1 });

export const ImplementationLog = mongoose.model<IImplementationLog>(
  'ImplementationLog',
  implementationLogSchema
);
