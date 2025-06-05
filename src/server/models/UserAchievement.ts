import mongoose, { Document, Schema } from 'mongoose';

export interface IUserAchievement extends Document {
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  challengeId?: string;
}

const userAchievementSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    achievementId: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now },
    challengeId: { type: String },
  },
  { timestamps: true }
);

// ユーザーが同じアチーブメントを重複取得しないように
userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

export const UserAchievement = mongoose.model<IUserAchievement>(
  'UserAchievement',
  userAchievementSchema
);
