import mongoose, { Document, Schema } from 'mongoose';

export interface IAchievement extends Document {
  type: string;
  name: string;
  description: string;
  icon: string;
  condition: {
    type: string;
    value: number;
    challengeTypes?: string[];
  };
  rarity: string;
  experienceReward: number;
}

const achievementSchema = new Schema(
  {
    type: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    condition: {
      type: { type: String, required: true },
      value: { type: Number, required: true },
      challengeTypes: [{ type: String }],
    },
    rarity: {
      type: String,
      required: true,
      enum: ['common', 'rare', 'epic', 'legendary'],
    },
    experienceReward: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Achievement = mongoose.model<IAchievement>('Achievement', achievementSchema);
