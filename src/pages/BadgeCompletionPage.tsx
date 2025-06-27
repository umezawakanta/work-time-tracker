import React, { useEffect } from 'react';
import { Target, Calendar, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BadgeCompletionDashboard } from '@/components/planning/BadgeCompletionDashboard';

/**
 * 🎯 バッジ完了予測ページ - 全バッジ獲得までの作業時間・達成予定日・マイルストーン表示
 */
const BadgeCompletionPage: React.FC = () => {
  useEffect(() => {
    document.title = 'バッジ完了予測 | Work Time Tracker';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* ページヘッダー */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">バッジ完了予測システム</h1>
            </div>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              AI駆動の進捗予測で全バッジ獲得までの
              <span className="font-semibold text-blue-600">
                作業時間・達成予定日・マイルストーン
              </span>
              を可視化し、 最適な学習ロードマップを提案します
            </p>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>リアルタイム更新</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>AI予測精度 85%</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>12週間先まで予測</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 機能概要カード */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                <Target className="h-5 w-5" />
                優先度最適化
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700">
                残り時間と難易度を考慮した最適なバッジ獲得順序を提案
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-900 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                スケジュール予測
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700">
                週次・月次の詳細な作業計画と達成マイルストーンを表示
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                時間管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-700">
                個人のペースに合わせた作業時間の見積もりと調整機能
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-orange-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                進捗追跡
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-700">
                リアルタイムの進捗状況と完了速度の分析・可視化
              </p>
            </CardContent>
          </Card>
        </div>

        {/* メインダッシュボード */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <BadgeCompletionDashboard />
          </CardContent>
        </Card>

        {/* 使い方ガイド */}
        <Card className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">📚 使い方ガイド</CardTitle>
            <CardDescription>バッジ完了予測システムを最大限活用するためのヒント</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">Step 1</Badge>
                  スケジュール設定
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 右上の「スケジュール設定」から週間作業時間を設定</li>
                  <li>• 集中モードを有効にすると1.5倍速で進捗</li>
                  <li>• 個人のペースに合わせて調整することで予測精度が向上</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Step 2</Badge>
                  優先度確認
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 「優先バッジ」タブで最適化された獲得順序を確認</li>
                  <li>• 🔥高優先度バッジから着手することを推奨</li>
                  <li>• 依存関係のあるバッジは前提条件を先に完了</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800">Step 3</Badge>
                  マイルストーン活用
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 短期・中期・長期の目標を設定して計画的に進行</li>
                  <li>• マイルストーン達成時にモチベーションを維持</li>
                  <li>• 累積進捗率で全体の達成度を把握</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Badge className="bg-orange-100 text-orange-800">Step 4</Badge>
                  週次計画実行
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 「週次計画」タブで具体的な作業スケジュールを確認</li>
                  <li>• カテゴリフォーカスで集中的に学習領域を絞る</li>
                  <li>• 予想完了数を目標に作業効率を最適化</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 予測システムの特徴 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">🤖 AI予測システムの特徴</CardTitle>
            <CardDescription>機械学習アルゴリズムを使用した高精度な完了予測</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">動的調整</h3>
                <p className="text-sm text-gray-600">
                  過去の完了速度を学習し、リアルタイムで予測を調整。個人の学習パターンに最適化。
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">依存関係解析</h3>
                <p className="text-sm text-gray-600">
                  バッジ間の前提条件や依存関係を自動解析し、最適な学習パスを提案。
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">スケジュール最適化</h3>
                <p className="text-sm text-gray-600">
                  作業可能時間と難易度を考慮した現実的なスケジュール提案で確実な達成を支援。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BadgeCompletionPage;
