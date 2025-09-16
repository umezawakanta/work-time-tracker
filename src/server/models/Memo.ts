import mongoose from 'mongoose';

export interface IMemo extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  isFamilyOnly: boolean;
  isAdminOnly: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const MemoSchema = new mongoose.Schema<IMemo>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: false },
  isFamilyOnly: { type: Boolean, default: false },
  isAdminOnly: { type: Boolean, default: false },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 更新時にupdatedAtを自動更新
MemoSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Memo = mongoose.model<IMemo>('Memo', MemoSchema);
