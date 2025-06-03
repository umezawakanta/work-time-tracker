import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkTimeEntry extends Document {
  projectName: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  duration: number;
  date: Date;
  userId: string;
  createdAt: Date;
}

const WorkTimeSchema = new Schema<IWorkTimeEntry>({
  projectName: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  description: String,
  duration: { type: Number, required: true },
  date: { type: Date, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const WorkTimeEntry = mongoose.model<IWorkTimeEntry>('WorkTime', WorkTimeSchema);
