import { User } from '@/types';
import mongoose from 'mongoose';

// ワークプリセットのインターフェース
export interface IWorkPreset extends mongoose.Document {
  name: string;
  description?: string;
  projectId: mongoose.Types.ObjectId;
  duration: number;
  owner: mongoose.Types.ObjectId | User;
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
}

// スタティックメソッドのインターフェース
interface WorkPresetModel extends mongoose.Model<IWorkPreset> {
  findPopularPresets(userId: mongoose.Types.ObjectId): Promise<IWorkPreset[]>;
}

// スキーマ定義
const workPresetSchema = new mongoose.Schema<IWorkPreset, WorkPresetModel>({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String,
    trim: true 
  },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project',
    required: true 
  },
  duration: { 
    type: Number, 
    required: true,
    min: [1, '期間は1以上である必要があります'] 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  usageCount: { 
    type: Number, 
    default: 0 
  },
  lastUsed: { 
    type: Date,
    default: Date.now 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 人気のプリセットを取得するスタティックメソッド
workPresetSchema.statics.findPopularPresets = async function(userId: mongoose.Types.ObjectId) {
  return this.find({ 
    owner: userId 
  })
  .sort({ usageCount: -1, lastUsed: -1 })
  .limit(10) // 最も使用頻度の高い10件を取得
  .populate('projectId'); // プロジェクト情報を含める
};

// モデルの作成
export const WorkPreset = mongoose.model<IWorkPreset, WorkPresetModel>('WorkPreset', workPresetSchema);