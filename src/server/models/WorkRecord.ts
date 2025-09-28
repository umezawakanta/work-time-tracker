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
  mood: { type: String, enum: ['1', '2', '3', '4', '5'], default: '3' },
  tags: [{ type: String }],
  isPrivate: { type: Boolean, default: true },
  // 新しい項目
  activities: [{ type: String }],
  workSummary: { type: String, default: '' },
  achievements: [{ type: String }],
  challenges: [{ type: String }],
  learnings: [{ type: String }],
  nextGoals: [{ type: String }],
  energyLevel: { type: Number, min: 1, max: 10, default: 5 },
  stressLevel: { type: Number, min: 1, max: 10, default: 5 },
  workHours: { type: Number, default: 0 },
  breakTime: { type: Number, default: 0 },
  productivity: { type: Number, min: 1, max: 10, default: 5 },
  notes: { type: String, default: '' },
  gratitude: { type: String, default: '' },
  reflection: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const SalaryRecord = mongoose.models.SalaryRecord || mongoose.model('SalaryRecord', SalaryRecordSchema);
export const WorkDiary = mongoose.models.WorkDiary || mongoose.model('WorkDiary', WorkDiarySchema);
