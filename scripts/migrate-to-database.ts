#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';

// データディレクトリのパス
const DATA_DIR = path.join(process.cwd(), 'data');

async function migrateData() {
  try {
    console.log('🚀 データベース移行テストを開始します...');

    // Check if data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      console.log('⚠️ データディレクトリが見つかりません。移行するデータがありません。');
      return;
    }

    console.log('📁 データディレクトリを確認中...');
    const files = fs.readdirSync(DATA_DIR);
    console.log(`見つかったファイル: ${files.join(', ')}`);

    if (files.length === 0) {
      console.log('⚠️ 移行するデータファイルがありません。');
      return;
    }

    console.log('✅ データベース移行テストが完了しました！');
    console.log('💡 注意: このスクリプトは現在、データファイルの存在確認のみを行っています。');
    console.log('💡 実際のデータ移行は、APIエンドポイント経由で行ってください。');
    console.log('💡 データベース接続は、アプリケーション起動時に自動的に行われます。');
  } catch (error) {
    console.error('❌ 移行中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプト実行
migrateData()
  .then(() => {
    console.log('🎉 移行スクリプトが完了しました');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 移行スクリプトが失敗しました:', error);
    process.exit(1);
  });

export { migrateData };
