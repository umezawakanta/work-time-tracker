import mongoose from 'mongoose';
import { BlogPost } from '../models/BlogPost.js';
import { connectDB } from '../config/database.js';

const sampleBlogPosts = [
  {
    title: 'Work Time Tracker の使い方ガイド',
    content: `# Work Time Tracker の基本的な使い方

## はじめに
Work Time Trackerは効率的な時間管理を支援するアプリケーションです。

## 主要機能
1. **時間記録**: 作業時間を正確に記録
2. **タスク管理**: ToDo リストで作業を整理
3. **分析機能**: 生産性の可視化
4. **レポート**: 詳細な作業報告書の生成

## 使い方
1. ダッシュボードにアクセス
2. 新しいタスクを作成
3. タイマーを開始
4. 作業完了後にタイマーを停止

効率的な時間管理で生産性を向上させましょう！`,
    author: 'システム管理者',
    category: '技術',
    tags: ['ガイド', '使い方', '時間管理'],
    status: 'published' as const,
  },
  {
    title: 'プロジェクト管理のベストプラクティス',
    content: `# プロジェクト管理のベストプラクティス

## 計画段階
プロジェクトの成功は適切な計画から始まります。

### 重要なポイント
- **明確な目標設定**: SMART原則に基づく目標設定
- **スコープ定義**: プロジェクトの範囲を明確にする
- **リソース配分**: 人員とツールの適切な配置

## 実行段階
計画を実行に移す際の重要な要素：

1. **定期的な進捗確認**
2. **チームコミュニケーション**
3. **リスク管理**
4. **品質管理**

## 振り返り
プロジェクト完了後の振り返りは次回の改善につながります。

Work Time Trackerを活用して、効率的なプロジェクト管理を実現しましょう。`,
    author: 'プロジェクトマネージャー',
    category: 'ビジネス',
    tags: ['プロジェクト管理', 'ベストプラクティス', 'チーム管理'],
    status: 'published' as const,
  },
  {
    title: '生産性向上のための5つのコツ',
    content: `# 生産性向上のための5つのコツ

現代のビジネス環境では、限られた時間で最大の成果を出すことが求められます。

## 1. 時間の可視化
Work Time Trackerを使用して、自分がどのように時間を使っているかを把握しましょう。

## 2. 優先順位の明確化
- 重要かつ緊急なタスク
- 重要だが緊急でないタスク
- 緊急だが重要でないタスク
- 緊急でも重要でもないタスク

## 3. 集中時間の確保
ポモドーロテクニックなどを活用して、集中できる時間を作りましょう。

## 4. 定期的な休憩
適度な休憩は長期的な生産性向上につながります。

## 5. 振り返りと改善
定期的に自分の作業方法を見直し、改善点を見つけましょう。

継続的な改善で、より効率的な働き方を実現できます。`,
    author: '生産性専門家',
    category: 'ライフスタイル',
    tags: ['生産性', '時間管理', '効率化', 'ポモドーロ'],
    status: 'published' as const,
  },
  {
    title: 'リモートワークでの時間管理術',
    content: `# リモートワークでの時間管理術

リモートワークでは、オフィスワークとは異なる時間管理のスキルが必要です。

## 課題と対策

### 1. 境界線の曖昧さ
**課題**: 仕事とプライベートの境界が曖昧になりがち
**対策**: 明確な作業時間を設定し、Work Time Trackerで記録

### 2. 集中力の維持
**課題**: 自宅では集中を維持するのが困難
**対策**: 
- 専用の作業スペースの確保
- 集中タイムの設定
- 適度な休憩の取り入れ

### 3. コミュニケーション
**課題**: チームとのコミュニケーション不足
**対策**: 
- 定期的なオンラインミーティング
- 進捗の可視化
- チャットツールの活用

## おすすめツール
1. **Work Time Tracker**: 時間記録と分析
2. **ビデオ会議ツール**: チームコミュニケーション
3. **プロジェクト管理ツール**: タスクの共有

適切な時間管理で、リモートワークの生産性を最大化しましょう。`,
    author: 'リモートワーク専門家',
    category: 'テクノロジー',
    tags: ['リモートワーク', '時間管理', '生産性', 'テレワーク'],
    status: 'published' as const,
  },
];

async function seedBlogData() {
  try {
    console.log('📚 Connecting to MongoDB...');
    await connectDB();

    console.log('🗑️ Clearing existing blog posts...');
    await BlogPost.deleteMany({});

    console.log('📝 Creating sample blog posts...');
    const createdPosts = await BlogPost.insertMany(sampleBlogPosts);

    console.log('✅ Sample blog data seeded successfully!');
    console.log(`📊 Created ${createdPosts.length} blog posts:`);

    createdPosts.forEach((post, index) => {
      console.log(`  ${index + 1}. ${post.title} (${post.category})`);
    });

    console.log('\n🎉 You can now view these posts in your application!');
    console.log('🌐 Visit: http://localhost:3000/blog');
  } catch (error) {
    console.error('❌ Error seeding blog data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// スクリプト実行
seedBlogData();
