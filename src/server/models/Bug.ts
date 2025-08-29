import mongoose, { Schema, Document } from 'mongoose';

export interface BugDocument extends Document {
  title: string;
  description?: string;
  featureId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BugSchema = new Schema<BugDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    featureId: { type: String, required: true, index: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
      required: true,
    },
    createdBy: { type: String },
  },
  { timestamps: true }
);

export default (mongoose.models.Bug as mongoose.Model<BugDocument>) ||
  mongoose.model<BugDocument>('Bug', BugSchema);
