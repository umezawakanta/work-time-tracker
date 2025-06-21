import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Target, Zap, Trophy, ArrowRight } from 'lucide-react';
import {
  DevelopmentBadge,
  DEVELOPMENT_BADGES,
  findNextAchievableBadge,
  generateDailyDevelopmentGoal,
} from '@/types/development-badges';

export const DevelopmentMotivation: React.FC = () => {
  const [nextBadge, setNextBadge] = useState<DevelopmentBadge | null>(null);
  const [dailyGoal, setDailyGoal] = useState<string>('');
  const [actionItems, setActionItems] = useState<string[]>([]);

  useEffect(() => {
    const badge = findNextAchievableBadge();
    setNextBadge(badge);
    setDailyGoal(generateDailyDevelopmentGoal(badge));
    setActionItems(generateActionItems());
  }, []);

  const generateActionItems = (): string[] => {
    // 31ページ実装済みの状況に基づく具体的なアクションアイテム
    return [
      '🎯 機能コンプリート達成: 品質向上とコードリファクタリング',
      '✅ TODO機能: 統計・分析ダッシュボードの追加',
      '🎨 UI統一性: 全ページのデザインシステム適用確認',
      '⚡ パフォーマンス: 画像最適化とコード分割実装',
      '🧪 テスト強化: 重要コンポーネントのE2Eテスト追加',
      '📱 アクセシビリティ: WAI-ARIA属性とキーボードナビゲーション',
      '🔧 自動化: GitHub ActionsでのCI/CD改善',
      '📊 監視: リアルタイム分析とエラー追跡の設定',
      '🚀 デプロイ: 本番環境でのパフォーマンス最適化',
      '📖 ドキュメント: API仕様書とコンポーネントライブラリ作成',
    ];
  };

  const getNextBadgeRecommendations = (): Array<{
    badge: DevelopmentBadge;
    priority: number;
    tasks: string[];
  }> => {
    return [
      {
        badge: DEVELOPMENT_BADGES.find((b) => b.id === 'feature-completionist')!,
        priority: 1,
        tasks: [
          '全31ページの機能テスト実行',
          'ユーザビリティテストの実施',
          'エラーハンドリングの改善',
          'データ検証の強化',
        ],
      },
      {
        badge: DEVELOPMENT_BADGES.find((b) => b.id === 'todo-master')!,
        priority: 2,
        tasks: [
          'TODO分析ダッシュボード作成',
          '生産性レポート機能',
          'AI予測機能の実装',
          'チーム連携機能',
        ],
      },
      {
        badge: DEVELOPMENT_BADGES.find((b) => b.id === 'design-perfectionist')!,
        priority: 3,
        tasks: [
          'デザインシステム完全適用',
          'アニメーション統一',
          'ダークモード対応',
          'モバイル最適化',
        ],
      },
    ];
  };

  const [completedToday, setCompletedToday] = useState<string[]>([]);

  const toggleTaskCompletion = (task: string) => {
    setCompletedToday((prev) =>
      prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
    );
  };

  const todayProgress = Math.round((completedToday.length / actionItems.length) * 100);

  return (
    <div className="space-y-6">
      {/* 今日の進捗サマリー */}
      <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            🎉 開発進捗: 素晴らしい成果です！
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-3xl font-bold text-green-600">31</div>
                <div className="text-sm text-gray-600">実装済みページ</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-3xl font-bold text-blue-600">85%</div>
                <div className="text-sm text-gray-600">機能完成度</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-3xl font-bold text-purple-600">200+</div>
                <div className="text-sm text-gray-600">コミット数</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">今日のタスク進捗</span>
                <span className="text-sm text-gray-600">
                  {completedToday.length}/{actionItems.length}
                </span>
              </div>
              <Progress value={todayProgress} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 次に獲得可能なバッジ */}
      {nextBadge && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              次の目標バッジ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">{nextBadge.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{nextBadge.name}</h3>
                <p className="text-gray-600">{nextBadge.description}</p>
                <div className="mt-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">進捗</span>
                    <span className="text-sm">{nextBadge.progress}%</span>
                  </div>
                  <Progress value={nextBadge.progress} className="h-2" />
                </div>
              </div>
            </div>
            <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded">
              💡 今日の目標: {dailyGoal}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 今日のアクションアイテム */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-green-600" />
            今日のアクションアイテム
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {actionItems.slice(0, 5).map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  completedToday.includes(item)
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => toggleTaskCompletion(item)}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    completedToday.includes(item)
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300'
                  }`}
                >
                  {completedToday.includes(item) && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <span className={completedToday.includes(item) ? 'line-through text-gray-500' : ''}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* バッジ獲得戦略 */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 バッジ獲得戦略</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getNextBadgeRecommendations().map((recommendation, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{recommendation.badge.icon}</span>
                    <div>
                      <h4 className="font-semibold">{recommendation.badge.name}</h4>
                      <p className="text-sm text-gray-600">{recommendation.badge.description}</p>
                    </div>
                  </div>
                  <Badge variant={recommendation.priority === 1 ? 'default' : 'outline'}>
                    優先度 {recommendation.priority}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {recommendation.tasks.map((task, taskIndex) => (
                    <div key={taskIndex} className="flex items-center gap-2 text-sm">
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span>{task}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <Progress value={recommendation.badge.progress} className="h-2" />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {recommendation.badge.progress}% 完了
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 成功のお祝い */}
      {todayProgress >= 50 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-4xl">🎉</div>
              <h3 className="text-lg font-semibold text-green-800">素晴らしい進捗です！</h3>
              <p className="text-green-600">
                今日は{completedToday.length}個のタスクを完了しました。
                この調子で次のバッジ獲得を目指しましょう！
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
