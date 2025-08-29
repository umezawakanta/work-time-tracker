import mongoose, { Schema, Document } from 'mongoose';

export interface DailyVictoryDocument extends Document {
  userId: string;
  date: string; // YYYY-MM-DD
  winCondition: string;
  criteria: string[];
  result: 'win' | 'lose' | 'pending';
  score?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DailyVictorySchema = new Schema<DailyVictoryDocument>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    winCondition: { type: String, required: true },
    criteria: [{ type: String, required: true }],
    result: { type: String, enum: ['win', 'lose', 'pending'], default: 'pending', required: true },
    score: { type: Number },
    notes: { type: String },
  },
  { timestamps: true, versionKey: false }
);

DailyVictorySchema.index({ userId: 1, date: -1 }, { unique: true });

export const DailyVictory =
  (mongoose.models.DailyVictory as mongoose.Model<DailyVictoryDocument>) ||
  mongoose.model<DailyVictoryDocument>('DailyVictory', DailyVictorySchema);

export default DailyVictory;
