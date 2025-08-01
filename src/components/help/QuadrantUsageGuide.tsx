/**
 * 🎯 4象限タスク分類システム使用ガイドコンポーネント
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  HelpCircle,
  Target,
  Brain,
  TrendingUp,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  Play,
  BookOpen,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Settings,
  Download,
  Share2,
  Zap,
  Trophy,
  Home,
  BarChart3,
  X,
} from 'lucide-react';

interface QuadrantUsageGuideProps {
  isOpen?: boolean;
  onClose?: () => void;
  showAsModal?: boolean;
}

/**
 * 4象限使用ガイドコンポーネント
 */
export const QuadrantUsageGuide: React.FC<QuadrantUsageGuideProps> = ({
  isOpen = true,
  onClose,
  showAsModal = false,
}) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: 'アクセス方法',
      icon: <Home className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription>
              <strong>現在のページ:</strong> /quadrant-dashboard - 4象限マトリックス
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-semibold">📍 アクセス方法（3つの方法）</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-2 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                      1
                    </span>
                    <span>ナビゲーション</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>システムナビゲーション</span>
                    </div>
                    <ArrowRight className="w-4 h-4 mx-auto text-gray-400" />
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>分析カテゴリ</span>
                    </div>
                    <ArrowRight className="w-4 h-4 mx-auto text-gray-400" />
                    <div className="flex items-center space-x-2 font-semibold text-blue-600">
                      <Target className="w-4 h-4" />
                      <span>4象限マトリックス</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                      2
                    </span>
                    <span>直接URL</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                    /quadrant-dashboard
                  </div>
                  <p className="text-xs text-gray-600 mt-2">ブラウザのアドレスバーに直接入力</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                      3
                    </span>
                    <span>クイックアクション</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>「統合分析」ボタン</span>
                    </div>
                    <p className="text-xs text-gray-600">システムナビゲーション下部</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '4象限の理解',
      icon: <Brain className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold">🧠 アイゼンハワーマトリックス（4象限）</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 border-red-200 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2 text-red-700">
                  <span className="text-2xl">🔥</span>
                  <span>第1象限：必須</span>
                </CardTitle>
                <CardDescription className="text-red-600">重要度：高 × 緊急度：高</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">即座に実行</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>緊急の問題対応</li>
                    <li>期限直前のタスク</li>
                    <li>危機管理</li>
                  </ul>
                  <Badge variant="destructive" className="text-xs">
                    最優先で実行
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2 text-blue-700">
                  <span className="text-2xl">📈</span>
                  <span>第2象限：効果性</span>
                </CardTitle>
                <CardDescription className="text-blue-600">重要度：高 × 緊急度：低</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">計画的に実行</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>戦略的プロジェクト</li>
                    <li>スキル向上</li>
                    <li>予防・準備</li>
                  </ul>
                  <Badge variant="default" className="text-xs">
                    最も重要な象限
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200 bg-amber-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2 text-amber-700">
                  <span className="text-2xl">⚡</span>
                  <span>第3象限：錯覚</span>
                </CardTitle>
                <CardDescription className="text-amber-600">
                  重要度：低 × 緊急度：高
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">委任を検討</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>一部の会議</li>
                    <li>割り込み作業</li>
                    <li>他人の緊急事項</li>
                  </ul>
                  <Badge variant="secondary" className="text-xs">
                    委任・簡素化
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2 text-gray-700">
                  <span className="text-2xl">🗑️</span>
                  <span>第4象限：浪費・過剰</span>
                </CardTitle>
                <CardDescription className="text-gray-600">重要度：低 × 緊急度：低</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">排除を検討</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>時間つぶし</li>
                    <li>無駄な作業</li>
                    <li>意味のない活動</li>
                  </ul>
                  <Badge variant="outline" className="text-xs">
                    削除・最小化
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      title: '使用手順',
      icon: <Play className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold">🚀 ステップバイステップガイド</h4>

          <div className="space-y-4">
            {[
              {
                step: 1,
                title: 'ダッシュボードにアクセス',
                description: 'システムナビゲーションから4象限マトリックスページを開く',
                icon: <Home className="w-4 h-4" />,
              },
              {
                step: 2,
                title: 'AI分析の実行',
                description: 'Gemini AIが既存タスクを自動分析（数秒〜1分）',
                icon: <Brain className="w-4 h-4" />,
              },
              {
                step: 3,
                title: '分類結果の確認',
                description: '4つの象限にタスクが自動分類される',
                icon: <Target className="w-4 h-4" />,
              },
              {
                step: 4,
                title: '詳細分析の確認',
                description: '分析・レポートタブでチャートと洞察を確認',
                icon: <BarChart3 className="w-4 h-4" />,
              },
              {
                step: 5,
                title: 'アクションの実行',
                description: '推奨アクションに基づいてタスクを処理',
                icon: <CheckCircle2 className="w-4 h-4" />,
              },
            ].map((step) => (
              <div key={step.step} className="flex items-start space-x-3">
                <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {step.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {step.icon}
                    <h5 className="font-medium">{step.title}</h5>
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>💡 Pro Tip:</strong>
              タスクに詳細な説明、期限、カテゴリを設定すると、AI分析の精度が大幅に向上します。
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      title: '機能説明',
      icon: <Settings className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold">⚙️ 主要機能とツール</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>分析ダッシュボード</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1">
                  <li>• 生産性スコア（1-100）</li>
                  <li>• 象限別分布チャート</li>
                  <li>• 時間配分円グラフ</li>
                  <li>• AI洞察とアドバイス</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>自動更新</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1">
                  <li>• 1-60分間隔で設定可能</li>
                  <li>• リアルタイム分析</li>
                  <li>• 進捗通知</li>
                  <li>• バックグラウンド処理</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>レポート出力</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1">
                  <li>• JSON形式でエクスポート</li>
                  <li>• 分析結果保存</li>
                  <li>• タイムスタンプ付き</li>
                  <li>• データバックアップ</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Share2 className="w-4 h-4" />
                  <span>結果共有</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1">
                  <li>• SNS共有対応</li>
                  <li>• クリップボードコピー</li>
                  <li>• サマリー形式</li>
                  <li>• プライバシー配慮</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              設定タブからフィルタ、通知、表示オプションをカスタマイズできます。
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      title: 'ベストプラクティス',
      icon: <Trophy className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold">🏆 効果的な活用方法</h4>

          <div className="space-y-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>📅 日次ルーティン</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="text-sm space-y-2">
                  <li>
                    1. <strong>朝一番</strong>：4象限分析を実行
                  </li>
                  <li>
                    2. <strong>最優先</strong>：必須タスク（第1象限）を即座に処理
                  </li>
                  <li>
                    3. <strong>計画</strong>：効果性タスク（第2象限）を午前中にスケジュール
                  </li>
                  <li>
                    4. <strong>委任</strong>：錯覚タスク（第3象限）の委任先を検討
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>📊 週次レビュー</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="text-sm space-y-2">
                  <li>
                    1. <strong>履歴確認</strong>：週の傾向を「履歴・トレンド」で分析
                  </li>
                  <li>
                    2. <strong>スコア改善</strong>：生産性スコア70以上を目標
                  </li>
                  <li>
                    3. <strong>浪費削減</strong>：第4象限タスクの削減策を検討
                  </li>
                  <li>
                    4. <strong>効果性向上</strong>：第2象限タスクの割合を40%以上に
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>🔄 継続的改善</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li>
                    • <strong>AIアドバイス活用</strong>：洞察に基づく改善実行
                  </li>
                  <li>
                    • <strong>タスク品質向上</strong>：詳細情報で分析精度アップ
                  </li>
                  <li>
                    • <strong>自動化活用</strong>：他システムとの連携
                  </li>
                  <li>
                    • <strong>定期見直し</strong>：月1回の設定・運用見直し
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      title: 'FAQ',
      icon: <HelpCircle className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold">❓ よくある質問</h4>

          <div className="space-y-3">
            {[
              {
                q: 'タスクが分類されないのですが？',
                a: '以下を確認してください：\n• タスクが登録されているか\n• タスクに詳細情報が設定されているか\n• ブラウザのJavaScriptが有効か',
              },
              {
                q: 'AI分析が失敗します',
                a: 'Gemini APIが利用できない場合、自動的にヒューリスティック分析（キーワード・期限ベース）に切り替わります。基本的な分類は継続されます。',
              },
              {
                q: '分析結果が不正確に感じます',
                a: 'タスクの詳細情報（説明、期限、カテゴリ、見積時間）を充実させることで分析精度が向上します。また、手動で象限を調整することも可能です。',
              },
              {
                q: '他のタスク管理ツールとの違いは？',
                a: '本システムの特徴：\n• Gemini AIによる自動分類\n• リアルタイム生産性分析\n• 他システムとの統合\n• ゲーミフィケーション要素',
              },
              {
                q: 'データの安全性は？',
                a: 'タスクデータは暗号化されて保存され、AI分析時のみ一時的に処理されます。個人情報は適切に保護されています。',
              },
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm flex items-start space-x-2">
                      <span className="bg-blue-100 text-blue-600 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        Q
                      </span>
                      <span>{faq.q}</span>
                    </h5>
                    <div className="ml-7">
                      <p className="text-sm text-gray-600 whitespace-pre-line">{faq.a}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ),
    },
  ];

  const GuideContent = () => (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>4象限タスク分類システム 使用ガイド</span>
          </h2>
          <p className="text-gray-600 mt-1">Gemini AI駆動の生産性分析ツールの使い方</p>
        </div>
        {showAsModal && onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* ステップナビゲーション */}
      <div className="flex flex-wrap gap-2">
        {steps.map((step, index) => (
          <Button
            key={index}
            variant={activeStep === index ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveStep(index)}
            className="flex items-center space-x-2"
          >
            {step.icon}
            <span>{step.title}</span>
            {activeStep === index && <CheckCircle2 className="w-3 h-3" />}
          </Button>
        ))}
      </div>

      {/* コンテンツエリア */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {steps[activeStep].icon}
            <span>{steps[activeStep].title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">{steps[activeStep].content}</ScrollArea>
        </CardContent>
      </Card>

      {/* ナビゲーション */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
          disabled={activeStep === 0}
        >
          前へ
        </Button>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {activeStep + 1} / {steps.length}
          </span>
        </div>
        <Button
          variant="outline"
          onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
          disabled={activeStep === steps.length - 1}
        >
          次へ
        </Button>
      </div>
    </div>
  );

  if (showAsModal) {
    return isOpen ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
          <GuideContent />
        </div>
      </div>
    ) : null;
  }

  return <GuideContent />;
};

export default QuadrantUsageGuide;
