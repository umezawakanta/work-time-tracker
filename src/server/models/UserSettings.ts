import mongoose from 'mongoose';

// 機能設定のスキーマ
const UserSettingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  featureOrder: { 
    type: [String], 
    default: [
      'time-tracking',
      'projects', 
      'reports',
      'admin-panel',
      'bookshelf',
      'memos',
      'public-memos',
      'work-records'
    ]
  },
  hiddenFeatures: { 
    type: [String], 
    default: [] 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const UserSettings = mongoose.models.UserSettings || mongoose.model('UserSettings', UserSettingsSchema);
