import mongoose, { Document, Schema } from 'mongoose';

export interface IAbstinenceLog extends Document {
  challengeId: string;
  userId: string;
  date: Date;
  status: 'success' | 'failure' | 'reset';
  note?: string;
  experienceGained: number;
}

const abstinenceLogSchema = new Schema(
  {
    challengeId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ['success', 'failure', 'reset'],
    },
    note: { type: String },
    experienceGained: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 同じ日の同じチャレンジに対するログは1つのみ
abstinenceLogSchema.index({ challengeId: 1, date: 1 }, { unique: true });

export const AbstinenceLog = mongoose.model<IAbstinenceLog>('AbstinenceLog', abstinenceLogSchema);
