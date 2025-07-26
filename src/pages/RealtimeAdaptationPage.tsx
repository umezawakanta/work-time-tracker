/**
 * ⚡ リアルタイム適応システム ページ
 * 認知状態監視とUI自動調整の管理画面
 */

import React from 'react';
import RealtimeAdaptationDashboard from '@/components/realtime/RealtimeAdaptationDashboard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Zap,
  Target,
  Eye,
  Settings,
  ExternalLink,
  BookOpen,
  Users,
  Shield,
  Activity,
} from 'lucide-react';

const RealtimeAdaptationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ページヘッダー */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">リアルタイム適応システム</h1>
              <p className="text-lg text-gray-600 mt-2">
                ADHD/ASD特性に基づく認知状態監視とUI自動最適化
              </p>
            </div>
          </div>

          {/* 機能説明 */}
          <div className="max-w-4xl mx-auto">
            <Alert className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <Zap className="h-4 w-4 text-purple-600" />
              <AlertTitle className="text-purple-800">🧠 認知適応型インターフェース</AlertTitle>
              <AlertDescription className="text-purple-700">
                ユーザーの行動パターンをリアルタイムで分析し、注意力・エネルギー・ストレスレベルを推定。
                ADHD/ASD特性に最適化されたUIを自動的に提供します。
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* 機能概要カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Eye className="h-6 w-6" />
                <Badge variant="secondary" className="bg-white/20 text-white">
                  Core
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">行動パターン検出</h3>
              <p className="text-sm text-blue-100">
                クリック、スクロール、フォーカスパターンから認知状態を推定
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Brain className="h-6 w-6" />
                <Badge variant="secondary" className="bg-white/20 text-white">
                  AI
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">認知状態推定</h3>
              <p className="text-sm text-purple-100">
                注意力、エネルギー、ストレス、認知負荷をリアルタイム分析
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Settings className="h-6 w-6" />
                <Badge variant="secondary" className="bg-white/20 text-white">
                  Auto
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">UI自動調整</h3>
              <p className="text-sm text-green-100">
                認知状態に応じたコントラスト、アニメーション、レイアウト調整
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Target className="h-6 w-6" />
                <Badge variant="secondary" className="bg-white/20 text-white">
                  Smart
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">個人最適化</h3>
              <p className="text-sm text-orange-100">
                ADHD/ASD特性に基づくパーソナライズされた推奨事項
              </p>
            </CardContent>
          </Card>
        </div>

        {/* メインダッシュボード */}
        <RealtimeAdaptationDashboard />

        {/* 技術情報・使用方法 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                使用方法・ガイド
              </CardTitle>
              <CardDescription>システムの効果的な活用方法</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">初回設定</h4>
                    <p className="text-xs text-gray-600">
                      「開始」ボタンをクリックして追跡を開始してください
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">通常の使用</h4>
                    <p className="text-xs text-gray-600">
                      いつも通りサイトを使用してください。システムが自動的に学習します
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">推奨事項の活用</h4>
                    <p className="text-xs text-gray-600">
                      表示される推奨事項を参考に、休憩やタスク調整を行ってください
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">継続的な改善</h4>
                    <p className="text-xs text-gray-600">
                      使用を続けることで、システムがより精密に個人最適化されます
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  詳細ガイドを見る
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                プライバシー・技術情報
              </CardTitle>
              <CardDescription>データ処理とセキュリティについて</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-1">🔒 データ保護</h4>
                  <p className="text-xs text-gray-600">
                    すべての行動データはブラウザ内でのみ処理され、外部サーバーには送信されません
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">⚡ リアルタイム処理</h4>
                  <p className="text-xs text-gray-600">
                    30秒間隔での行動分析、5分間隔での認知状態推定を実行
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">🧠 ADHD/ASD特化</h4>
                  <p className="text-xs text-gray-600">
                    研究に基づくADHD/ASD特性を考慮したアルゴリズムを使用
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">📊 学習型システム</h4>
                  <p className="text-xs text-gray-600">
                    使用パターンから個人の特性を学習し、推奨精度を向上
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Activity className="h-3 w-3" />
                  <span>システム状態: 正常稼働中</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 関連機能への案内 */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              関連機能
            </CardTitle>
            <CardDescription>リアルタイム適応システムと連携する他の機能</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium text-sm">認知評価システム</div>
                  <div className="text-xs text-gray-600">WEIS相当の詳細認知測定</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium text-sm">ADHDタスク管理</div>
                  <div className="text-xs text-gray-600">最適化されたタスク管理</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <Settings className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium text-sm">適応的UI設定</div>
                  <div className="text-xs text-gray-600">UI個人カスタマイズ</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealtimeAdaptationPage;
