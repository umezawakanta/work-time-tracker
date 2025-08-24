import mongoose, { Document, Schema } from 'mongoose';

export interface IAbstinenceChallenge extends Document {
  userId: string;
  type: string;
  title: string;
  description?: string;
  startDate: Date;
  currentStreak: number;
  longestStreak: number;
  level: number;
  experience: number;
  experienceToNext: number;
  isActive: boolean;
  difficultyMultiplier: number;
}

const abstinenceChallengeSchema = new Schema(
  {
    userId: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        'alcohol',
        'smoking',
        'gambling',
        'masturbation',
        'pornography',
        'prostitution',
        'shopping',
        'social_media',
        'gaming',
        'junk_food',
      ],
    },
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    experienceToNext: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
    difficultyMultiplier: { type: Number, default: 1.0 },
  },
  { timestamps: true }
);

// ユーザーごとの同じタイプのチャレンジは1つのみ
abstinenceChallengeSchema.index({ userId: 1, type: 1 }, { unique: true });

export const AbstinenceChallenge = mongoose.model<IAbstinenceChallenge>(
  'AbstinenceChallenge',
  abstinenceChallengeSchema
);
