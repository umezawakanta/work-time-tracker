import mongoose, { Document, Schema } from 'mongoose';

export interface IResource extends Document {
  title: string;
  url: string;
  description?: string;
  category: string;
  icon?: string;
  projectId?: string;
  isGlobal: boolean;
  createdBy: string;
}

const resourceSchema = new Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    icon: { type: String },
    projectId: { type: String, index: true },
    isGlobal: { type: Boolean, default: false },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

// インデックスの作成
resourceSchema.index({ category: 1 });
resourceSchema.index({ projectId: 1, category: 1 });

export const Resource = mongoose.model<IResource>('Resource', resourceSchema);
