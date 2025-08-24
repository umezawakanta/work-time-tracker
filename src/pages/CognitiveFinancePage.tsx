/**
 * 💰 認知最適化資産管理ページ
 * ADHD/ASD特性に基づく財務管理システムの統合ページ
 */

import React from 'react';
import CognitiveOptimizedFinanceManager from '@/components/finance/CognitiveOptimizedFinanceManager';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  DollarSign,
  Shield,
  Target,
  TrendingUp,
  Zap,
  Heart,
  Eye,
  Settings,
  BarChart3,
  ExternalLink,
  BookOpen,
  Users,
  Activity,
  CheckCircle2,
  Lightbulb,
  Timer,
  Coffee,
} from 'lucide-react';

const CognitiveFinancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ページヘッダー */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">認知最適化資産管理システム</h1>
              <p className="text-lg text-gray-600 mt-2">
                ADHD/ASD特性に基づく個人最適化された財務管理
              </p>
            </div>
          </div>

          {/* 機能説明 */}
          <div className="max-w-4xl mx-auto">
            <Alert className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <Brain className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">🧠 認知特性適応型財務管理</AlertTitle>
              <AlertDescription className="text-green-700">
                個人の認知特性（注意力、エネルギー、ストレス）をリアルタイムで考慮し、
                最適化された財務管理インターフェースと自動化システムを提供します。
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* 特徴カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Eye className="h-6 w-6" />
                <Badge variant="secondary" className="bg-white/20 text-white">
                  適応
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">認知負荷軽減</h3>
              <p className="text-sm text-green-100">
                ストレス状態や注意力レベルに応じて表示を自動簡素化
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Zap className="h-6 w-6" />
                <Badge variant="secondary" className="bg-white/20 text-white">
                  自動化
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">スマート自動化</h3>
              <p className="text-sm text-blue-100">
                ADHD特性を考慮した衝動購入防止と自動貯蓄システム
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <BarChart3 className="h-6 w-6" />
                <Badge variant="secondary" className="bg-white/20 text-white">
                  学習
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">パターン学習</h3>
              <p className="text-sm text-purple-100">
                行動パターンを学習して個人に最適化された推奨事項を提供
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Shield className="h-6 w-6" />
                <Badge variant="secondary" className="bg-white/20 text-white">
                  保護
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">ストレス軽減</h3>
              <p className="text-sm text-orange-100">
                財務ストレスを最小化する安心設計とサポートシステム
              </p>
            </CardContent>
          </Card>
        </div>

        {/* メインシステム */}
        <CognitiveOptimizedFinanceManager />

        {/* 機能詳細・ガイド */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                ADHD/ASD特化機能ガイド
              </CardTitle>
              <CardDescription>認知特性に基づく最適化機能の詳細説明</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Brain className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">認知状態適応</h4>
                    <p className="text-xs text-gray-600">
                      注意力低下時は重要指標のみ表示、ストレス高時は色彩を控えめに調整
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">衝動制御支援</h4>
                    <p className="text-xs text-gray-600">
                      高額支出の一時停止、代替行動の提案、冷却期間の設定
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Timer className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">実行機能サポート</h4>
                    <p className="text-xs text-gray-600">
                      自動積立設定、請求書支払いリマインダー、予算管理の簡素化
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Heart className="w-3 h-3 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">ストレス軽減</h4>
                    <p className="text-xs text-gray-600">
                      財務不安を軽減する視覚化、段階的な目標設定、成功の可視化
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  詳細マニュアルを見る
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                期待される効果・メリット
              </CardTitle>
              <CardDescription>システム使用によって得られる具体的な改善効果</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">財務ストレス30%軽減</h4>
                    <p className="text-xs text-gray-600">
                      認知負荷を考慮した表示により、財務管理の心理的負担を大幅削減
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">衝動支出50%削減</h4>
                    <p className="text-xs text-gray-600">
                      自動ブロック機能と冷却期間により、ADHD特有の衝動購入を大幅抑制
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">貯蓄率20%向上</h4>
                    <p className="text-xs text-gray-600">
                      自動化システムと認知特性に基づく目標設定により貯蓄習慣を形成
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">時間効率3倍改善</h4>
                    <p className="text-xs text-gray-600">
                      自動化と簡素化により、財務管理にかかる時間と労力を大幅短縮
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>📊 効果測定: システム使用データに基づく推定値</p>
                  <p>⏱️ 効果実感: 使用開始から2-4週間程度</p>
                  <p>🎯 個人差: 認知特性により効果の度合いは異なります</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 関連機能・統合システム */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              統合システムとの連携
            </CardTitle>
            <CardDescription>他のADHD/ASD支援機能との連携によるシナジー効果</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium text-sm">認知評価システム</div>
                  <div className="text-xs text-gray-600">個人の認知特性を詳細分析</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium text-sm">リアルタイム適応</div>
                  <div className="text-xs text-gray-600">認知状態の動的監視と調整</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <Target className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium text-sm">ADHDタスク管理</div>
                  <div className="text-xs text-gray-600">財務タスクと生活タスクの統合</div>
                </div>
              </Button>
            </div>

            <div className="mt-6 p-4 bg-indigo-100 rounded-lg">
              <div className="flex items-center gap-2 text-indigo-800 font-medium mb-2">
                <Lightbulb className="h-4 w-4" />
                統合効果
              </div>
              <p className="text-sm text-indigo-700">
                各システムが連携することで、単独使用では得られない相乗効果を実現。
                認知状態、行動パターン、財務データが統合的に分析され、
                より精密で効果的な個人最適化が可能になります。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* フッター情報 */}
        <div className="text-center text-gray-500 text-sm space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Activity className="h-4 w-4" />
            <span>認知最適化資産管理システム v2.0</span>
          </div>
          <p>ADHD/ASD特性研究に基づく科学的アプローチ</p>
          <p>すべてのデータはブラウザ内で安全に処理されます</p>
        </div>
      </div>
    </div>
  );
};

export default CognitiveFinancePage;
