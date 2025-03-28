import mongoose from 'mongoose';
import { IUser } from './User'; // 型としてインポート

// プロジェクトのインターフェース
export interface IProject extends mongoose.Document {
  name: string;
  color: string;
  lastUsed?: Date;
  owner: mongoose.Types.ObjectId | IUser;
  isArchived: boolean;
  createdAt: Date;
}

// スタティックメソッドのインターフェース
interface ProjectModel extends mongoose.Model<IProject> {
  findRecentProjects(userId: mongoose.Types.ObjectId): Promise<IProject[]>;
}

// スキーマ定義
const projectSchema = new mongoose.Schema<IProject, ProjectModel>({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  color: { 
    type: String, 
    required: true 
  },
  lastUsed: { 
    type: Date,
    default: Date.now
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// カスタムスタティックメソッド
projectSchema.statics.findRecentProjects = async function(userId: mongoose.Types.ObjectId) {
  return this.find({ 
    owner: userId,
    isArchived: false 
  })
  .sort({ lastUsed: -1 })
  .limit(10); // 最近の10件を取得
};

// モデルの作成
export const Project = mongoose.model<IProject, ProjectModel>('Project', projectSchema);