import mongoose, { Schema, Document, Model } from 'mongoose';

export type OutcomeResult = 'win' | 'lose' | 'pending';

export interface DailyOutcomeDocument extends Document {
  userId: string;
  date: string; // YYYY-MM-DD in user local (server uses UTC)
  winCondition: string; // Human-readable condition decided by AI/assistant
  criteria: string[]; // Bullet criteria to evaluate
  createdBy: 'ai' | 'user' | 'system';
  result: OutcomeResult;
  score?: number; // Optional 0-100 score if evaluated by AI later
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DailyOutcomeSchema = new Schema<DailyOutcomeDocument>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    winCondition: { type: String, required: true },
    criteria: { type: [String], default: [] },
    createdBy: { type: String, enum: ['ai', 'user', 'system'], default: 'system' },
    result: { type: String, enum: ['win', 'lose', 'pending'], default: 'pending', index: true },
    score: { type: Number },
    notes: { type: String },
  },
  { timestamps: true, versionKey: false }
);

DailyOutcomeSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyOutcome: Model<DailyOutcomeDocument> =
  mongoose.models.DailyOutcome ||
  mongoose.model<DailyOutcomeDocument>('DailyOutcome', DailyOutcomeSchema);

export default DailyOutcome;
