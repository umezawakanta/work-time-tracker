import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  color: string;
  lastUsed?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'プロジェクト名は必須です'],
      trim: true,
    },
    color: {
      type: String,
      required: [true, 'カラーは必須です'],
      default: '#4285F4', // デフォルトのカラー
    },
    lastUsed: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: String,
      required: [true, 'ユーザーIDは必須です'],
      index: true, // ユーザーIDでの検索を高速化
    },
  },
  {
    timestamps: true, // createdAt, updatedAtを自動で管理
  }
);

// 同じユーザーの同じ名前のプロジェクトが存在しないことを確認する
ProjectSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
