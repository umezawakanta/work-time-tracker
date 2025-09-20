import mongoose from 'mongoose';

// 給料・交通費記録のスキーマ
const SalaryRecordSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true }, // salaryからamountに変更
  type: { type: String, enum: ['income', 'expense'], required: true }, // 収入/支出のタイプを追加
  transportation: { type: Number, default: 0 },
  overtime: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 日記のスキーマ
const WorkDiarySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  mood: { type: String, enum: ['😊', '😐', '😔', '😤', '😴', '🤔', '😍', '😢'], default: '😊' },
  tags: [{ type: String }],
  isPrivate: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const SalaryRecord = mongoose.models.SalaryRecord || mongoose.model('SalaryRecord', SalaryRecordSchema);
export const WorkDiary = mongoose.models.WorkDiary || mongoose.model('WorkDiary', WorkDiarySchema);
