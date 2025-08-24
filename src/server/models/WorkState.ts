import mongoose, { Schema, Document, Model } from 'mongoose';

export interface WorkStateDocument extends Document {
  userId: string;
  isWorking: boolean;
  startTime: Date | null;
  projectName: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkStateSchema = new Schema<WorkStateDocument>(
  {
    userId: { type: String, required: true, index: true, unique: true },
    isWorking: { type: Boolean, required: true, default: false },
    startTime: { type: Date, default: null },
    projectName: { type: String, required: true, default: '' },
    description: { type: String, required: true, default: '' },
  },
  { timestamps: true, versionKey: false }
);

export const WorkState: Model<WorkStateDocument> =
  mongoose.models.WorkState || mongoose.model<WorkStateDocument>('WorkState', WorkStateSchema);

export default WorkState;
