import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  Target,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Lightbulb,
  Rocket,
} from 'lucide-react';
import WBSGenerator from '@/components/features/wbs/WBSGenerator';
import { WBSGenerationResult } from '@/services/ai/wbsService';

const WBSGeneratorPage: React.FC = () => {
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatedWBS, setGeneratedWBS] = useState<WBSGenerationResult | null>(null);

  const handleWBSGenerated = (result: WBSGenerationResult) => {
    setGeneratedWBS(result);
  };

  // 使用例のテンプレート
  const examples = [
    {
      title: 'Webアプリケーション開発',
      description: 'React + Node.jsを使ったWebアプリケーション開発プロジェクト',
      projectName: 'タスク管理Webアプリ開発',
      goal: '個人・チーム向けのタスク管理機能を持つWebアプリケーションを開発し、ユーザビリティとパフォーマンスの向上を図る',
      methodology: 'agile',
      estimatedTime: '280時間',
      icon: '💻',
    },
    {
      title: 'マーケティングキャンペーン',
      description: '新商品のローンチに向けたマーケティング戦略とキャンペーン実施',
      projectName: '新商品マーケティングキャンペーン',
      goal: '新商品の認知度向上と初月売上目標1000万円を達成するためのマーケティング戦略を実施する',
      methodology: 'waterfall',
      estimatedTime: '56時間',
      icon: '📈',
    },
    {
      title: 'イベント運営',
      description: '技術カンファレンスの企画・運営プロジェクト',
      projectName: '技術カンファレンス2024',
      goal: '参加者300名規模の技術カンファレンスを成功させ、技術コミュニティの活性化と知識共有を促進する',
      methodology: 'hybrid',
      estimatedTime: '48時間',
      icon: '🎯',
    },
  ];

  const features = [
    {
      icon: <Sparkles className="h-6 w-6 text-blue-500" />,
      title: 'AI自動生成',
      description: 'プロジェクト名と目標を入力するだけで、AIが適切なWBS構造を自動生成します',
    },
    {
      icon: <Target className="h-6 w-6 text-green-500" />,
      title: '複数テンプレート対応',
      description: 'ソフトウェア開発、マーケティング、研究、イベントなど様々なプロジェクトに対応',
    },
    {
      icon: <Clock className="h-6 w-6 text-orange-500" />,
      title: '工数自動算出',
      description: '各タスクの工数を自動算出し、プロジェクト全体の時間を見積もります',
    },
    {
      icon: <Users className="h-6 w-6 text-purple-500" />,
      title: 'リスク分析',
      description: 'プロジェクトの複雑度を分析し、潜在的なリスクと推奨事項を提示します',
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-teal-500" />,
      title: 'タスク連携',
      description: '生成されたWBSを既存のタスク管理システムに直接インポート可能',
    },
    {
      icon: <BookOpen className="h-6 w-6 text-indigo-500" />,
      title: 'エクスポート機能',
      description: 'CSV、JSON形式でのエクスポートやクリップボードコピーに対応',
    },
  ];

  if (showGenerator) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" onClick={() => setShowGenerator(false)} className="text-blue-600">
            ← 概要に戻る
          </Button>
          <h1 className="text-3xl font-bold">WBS生成ツール</h1>
        </div>
        <WBSGenerator onWBSGenerated={handleWBSGenerated} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* ヘーダーセクション */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="h-10 w-10 text-blue-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI WBS生成ツール
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          プロジェクト名と目標を入力するだけで、AIが自動的に作業分解構造（WBS）を生成します。
          効率的なプロジェクト管理を支援し、タスクの漏れや見積もりミスを防ぎます。
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Button
            onClick={() => setShowGenerator(true)}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Rocket className="h-5 w-5 mr-2" />
            WBSを生成する
          </Button>
        </div>
      </div>

      {/* 実績・統計セクション */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
            <p className="text-sm text-muted-foreground">機能実装完了</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600 mb-2">6+</div>
            <p className="text-sm text-muted-foreground">プロジェクトテンプレート</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-orange-600 mb-2">AI</div>
            <p className="text-sm text-muted-foreground">Claude API統合</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
            <p className="text-sm text-muted-foreground">生成可能なWBS</p>
          </CardContent>
        </Card>
      </div>

      {/* 機能紹介タブ */}
      <Tabs defaultValue="features" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="features">主な機能</TabsTrigger>
          <TabsTrigger value="examples">使用例</TabsTrigger>
          <TabsTrigger value="howto">使い方</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">{feature.icon}</div>
                    <div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {examples.map((example, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{example.icon}</span>
                    {example.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{example.description}</p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">
                        プロジェクト名
                      </span>
                      <p className="text-sm font-medium">{example.projectName}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">目標</span>
                      <p className="text-sm">{example.goal}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{example.methodology}</Badge>
                    <Badge variant="secondary">{example.estimatedTime}</Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowGenerator(true)}
                  >
                    このテンプレートを使用
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="howto" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                使い方ガイド
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">基本的な使い方</h3>
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                      <div>
                        <strong>プロジェクト名を入力</strong>
                        <p className="text-muted-foreground">
                          明確で分かりやすいプロジェクト名を入力してください
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      <div>
                        <strong>プロジェクト目標を記述</strong>
                        <p className="text-muted-foreground">
                          具体的で測定可能な目標を詳しく記述してください
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      <div>
                        <strong>開発手法を選択</strong>
                        <p className="text-muted-foreground">
                          ウォーターフォール、アジャイル、ハイブリッドから選択
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        4
                      </span>
                      <div>
                        <strong>WBSを生成</strong>
                        <p className="text-muted-foreground">
                          ボタンをクリックしてAIが自動生成したWBSを確認
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">効果的な使い方のコツ</h3>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-800 mb-1">✅ 良い例</h4>
                      <p className="text-green-700">
                        「オンライン書店システムを開発し、月間1000冊の売上を達成する」
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-medium text-red-800 mb-1">❌ 避けるべき例</h4>
                      <p className="text-red-700">「ウェブサイトを作る」</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-1">💡 ヒント</h4>
                      <ul className="text-blue-700 space-y-1">
                        <li>• 具体的な数値目標を含める</li>
                        <li>• 期限や制約条件を明記する</li>
                        <li>• ステークホルダーを特定する</li>
                        <li>• 成功指標を定義する</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 生成済みWBS結果の表示 */}
      {generatedWBS && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              最新の生成結果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium">プロジェクト名</p>
                <p className="text-muted-foreground">{generatedWBS.project.name}</p>
              </div>
              <div>
                <p className="font-medium">総工数</p>
                <p className="text-muted-foreground">
                  {generatedWBS.project.totalEstimatedHours}時間
                </p>
              </div>
              <div>
                <p className="font-medium">タスク数</p>
                <p className="text-muted-foreground">{generatedWBS.tasks.length}個</p>
              </div>
            </div>
            <Button onClick={() => setShowGenerator(true)} variant="outline" className="mt-4">
              詳細を確認する
            </Button>
          </CardContent>
        </Card>
      )}

      {/* CTA セクション */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-8 pb-8 text-center">
          <h2 className="text-2xl font-bold mb-4">プロジェクトを成功に導くWBSを今すぐ生成</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            AIの力を活用して、効率的で抜け漏れのないプロジェクト計画を立てましょう。
            わずか数分で詳細なWBSが完成します。
          </p>
          <Button
            onClick={() => setShowGenerator(true)}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            今すぐ始める
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WBSGeneratorPage;
