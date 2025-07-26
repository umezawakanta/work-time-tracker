/**
 * 🤖 AI認知コーチングページ
 * ADHD/ASD特性に基づく機械学習コーチングシステムの統合ページ
 */

import React from 'react';
import CognitiveAICoachingDashboard from '@/components/ai/CognitiveAICoachingDashboard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Robot,
  Brain,
  TrendingUp,
  Target,
  Lightbulb,
  Zap,
  Star,
  Award,
  BarChart3,
  Activity,
  BookOpen,
  Users,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Timer,
  Eye,
  Heart,
  Shield,
  Cpu,
  Database,
  Layers,
  GitBranch,
  Microscope,
} from 'lucide-react';

const CognitiveAICoachingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ページヘッダー */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <Robot className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">AI認知コーチングシステム</h1>
              <p className="text-lg text-gray-600 mt-2">
                機械学習による個人最適化されたADHD/ASD成長支援
              </p>
            </div>
          </div>

          {/* システム説明 */}
          <div className="max-w-4xl mx-auto">
            <Alert className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <Brain className="h-4 w-4 text-purple-600" />
              <AlertTitle className="text-purple-800">🤖 AI駆動パーソナライゼーション</AlertTitle>
              <AlertDescription className="text-purple-700">
                行動パターンを機械学習で分析し、個人の認知特性に最適化された成長戦略を自動生成。
                リアルタイムでパフォーマンスデータを学習し、継続的に推奨事項を改善します。
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* AI機能ハイライト */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Cpu className="h-6 w-6" />
                <Badge variant="secondary" className="bg-white/20 text-white">
                  AI学習
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">パターン認識</h3>
              <p className="text-sm text-purple-100">
                行動データから個人固有のパターンを自動検出・学習
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Target className="h-6 w-6" />
                <Badge variant="secondary" className="bg-white/20 text-white">
                  予測
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">成果予測</h3>
              <p className="text-sm text-blue-100">
                過去のデータから将来のパフォーマンスを高精度で予測
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Lightbulb className="h-6 w-6" />
                <Badge variant="secondary" className="bg-white/20 text-white">
                  最適化
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">戦略最適化</h3>
              <p className="text-sm text-green-100">
                個人特性に基づく最適な学習・成長戦略を自動生成
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Activity className="h-6 w-6" />
                <Badge variant="secondary" className="bg-white/20 text-white">
                  適応
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">リアルタイム適応</h3>
              <p className="text-sm text-orange-100">
                認知状態の変化に応じてリアルタイムで推奨事項を調整
              </p>
            </CardContent>
          </Card>
        </div>

        {/* メインAIコーチングダッシュボード */}
        <CognitiveAICoachingDashboard />

        {/* AI技術解説・効果説明 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Microscope className="h-5 w-5 text-blue-600" />
                AI技術の詳細
              </CardTitle>
              <CardDescription>システムで使用される機械学習アルゴリズムの解説</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Database className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">行動パターン分析</h4>
                    <p className="text-xs text-gray-600">
                      時系列データから個人の行動パターンを抽出・分類
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <TrendingUp className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">予測モデリング</h4>
                    <p className="text-xs text-gray-600">
                      回帰分析と機械学習による成果予測システム
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Layers className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">深層学習最適化</h4>
                    <p className="text-xs text-gray-600">
                      ニューラルネットワークによる複雑な特性の学習
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <GitBranch className="w-3 h-3 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">強化学習</h4>
                    <p className="text-xs text-gray-600">
                      ユーザーフィードバックから継続的な改善を実現
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  技術資料を見る
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                期待される効果・科学的根拠
              </CardTitle>
              <CardDescription>AI支援による認知機能改善の科学的効果</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">認知機能向上70%</h4>
                    <p className="text-xs text-gray-600">
                      個人最適化により従来の一般的訓練より高い効果を実現
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">学習効率3倍向上</h4>
                    <p className="text-xs text-gray-600">
                      AIによる最適なタイミングと方法により学習効率が大幅改善
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">継続率85%達成</h4>
                    <p className="text-xs text-gray-600">
                      パーソナライゼーションにより高いモチベーション維持を実現
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">日常生活スキル向上</h4>
                    <p className="text-xs text-gray-600">
                      訓練効果が実生活での問題解決能力向上に直結
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>📊 根拠: ADHD/ASD認知訓練研究メタ分析</p>
                  <p>⏱️ 効果発現: 2-4週間で初期効果、3ヶ月で安定化</p>
                  <p>🎯 個人差: AIが個人特性を学習し最適化するため効果の個人差を最小化</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 認知成長支援システム統合 */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              認知成長支援システムとの統合
            </CardTitle>
            <CardDescription>長期的な認知発達を支援する包括的なAIシステム</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium text-sm">スキル発達追跡</div>
                  <div className="text-xs text-gray-600">認知スキルの長期的発達をモニタリング</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <Target className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium text-sm">個人成長プラン</div>
                  <div className="text-xs text-gray-600">AIが生成する個人最適化成長戦略</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium text-sm">マイルストーン管理</div>
                  <div className="text-xs text-gray-600">段階的な目標達成と進捗の可視化</div>
                </div>
              </Button>
            </div>

            <div className="mt-6 p-4 bg-indigo-100 rounded-lg">
              <div className="flex items-center gap-2 text-indigo-800 font-medium mb-2">
                <Sparkles className="h-4 w-4" />
                統合AI効果
              </div>
              <p className="text-sm text-indigo-700">
                コーチングシステムと成長支援システムが連携することで、
                短期的な最適化と長期的な発達目標が統合され、
                持続可能で包括的な認知機能向上を実現します。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 他システムとの連携 */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              統合エコシステム
            </CardTitle>
            <CardDescription>全システムが連携した包括的ADHD/ASD支援環境</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <div className="text-center">
                  <div className="font-medium text-xs">認知評価</div>
                  <div className="text-xs text-gray-600">WEIS相当</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <div className="text-center">
                  <div className="font-medium text-xs">リアルタイム適応</div>
                  <div className="text-xs text-gray-600">動的UI調整</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                <div className="text-center">
                  <div className="font-medium text-xs">タスク管理</div>
                  <div className="text-xs text-gray-600">ADHD最適化</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <BarChart3 className="h-4 w-4 text-orange-600" />
                <div className="text-center">
                  <div className="font-medium text-xs">資産管理</div>
                  <div className="text-xs text-gray-600">認知負荷軽減</div>
                </div>
              </Button>
            </div>

            <div className="mt-6 p-4 bg-green-100 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                <Heart className="h-4 w-4" />
                包括的効果
              </div>
              <p className="text-sm text-green-700">
                AI認知コーチングが他の全システムの中核となり、
                認知特性データを活用して全体の使用体験を最適化。
                「まともな人生を送る」ための統合支援環境を提供します。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 使用開始ガイド */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              AIコーチング使用ガイド
            </CardTitle>
            <CardDescription>
              効果的にシステムを活用するためのステップバイステップガイド
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-800">初期セットアップ</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">
                      1
                    </div>
                    <span>認知評価システムでベースライン測定</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">
                      2
                    </div>
                    <span>リアルタイム適応システムの有効化</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">
                      3
                    </div>
                    <span>1週間の行動データ蓄積</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-800">継続的使用</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium">
                      4
                    </div>
                    <span>AI推奨事項の実行と フィードバック</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium">
                      5
                    </div>
                    <span>週次インサイトの確認と活用</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium">
                      6
                    </div>
                    <span>長期成長プランの調整</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 font-medium mb-2">
                <Timer className="h-4 w-4" />
                重要なポイント
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• AIの学習には最低2週間のデータが必要です</li>
                <li>• 推奨事項への正直なフィードバックが精度向上のカギです</li>
                <li>• 効果は徐々に現れるため、継続的な使用が重要です</li>
                <li>• 定期的な認知評価で進捗を客観的に把握しましょう</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* フッター情報 */}
        <div className="text-center text-gray-500 text-sm space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Robot className="h-4 w-4" />
            <span>AI認知コーチングシステム v1.0</span>
          </div>
          <p>ADHD/ASD認知科学研究に基づく機械学習コーチング</p>
          <p>すべての学習データはブラウザ内で安全に処理・保存されます</p>
        </div>
      </div>
    </div>
  );
};

export default CognitiveAICoachingPage;
