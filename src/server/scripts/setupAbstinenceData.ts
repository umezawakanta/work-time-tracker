import mongoose from 'mongoose';
import { Achievement } from '../models/Achievement.js';
import { INITIAL_ACHIEVEMENTS } from '../data/initialAchievements.js';
import { connectDB } from '../config/database.js';

export async function setupAbstinenceData() {
  try {
    await connectDB();

    // 既存のアチーブメントデータをクリア
    await Achievement.deleteMany({});

    // 初期アチーブメントデータを挿入
    await Achievement.insertMany(INITIAL_ACHIEVEMENTS);

    console.log('✅ 欲望制御システムの初期データをセットアップしました');
    console.log(`📊 ${INITIAL_ACHIEVEMENTS.length}個のアチーブメントを追加`);
  } catch (error) {
    console.error('❌ 初期データセットアップエラー:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// 直接実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  setupAbstinenceData();
}
