import mongoose, { Document, Schema } from 'mongoose';

export interface ITeamMember extends Document {
  name: string;
  email: string;
  avatar?: string;
  role: string;
  skills: string[];
  availability: 'available' | 'busy' | 'unavailable';
  workload: number;
  projectId: string;
  userId: string;
}

const teamMemberSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String },
    role: { type: String, required: true },
    skills: [{ type: String }],
    availability: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available',
    },
    workload: { type: Number, default: 0, min: 0, max: 100 },
    projectId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

// 同じプロジェクト内で同じユーザーが重複しないようにする
teamMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

export const TeamMember = mongoose.model<ITeamMember>('TeamMember', teamMemberSchema);
