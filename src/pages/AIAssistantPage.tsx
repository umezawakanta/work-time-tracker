import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  MessageSquare,
  Settings,
  Sparkles,
  Info,
  ArrowRight,
  Zap,
  Code,
  BarChart3,
  Users,
  Target,
  Rocket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

import AIChat from '@/components/ai/AIChat';
import AISettings from '@/components/ai/AISettings';
import AITaskSuggestions from '@/components/ai/AITaskSuggestions';
import anthropicService from '@/services/ai/anthropicService';

const AIAssistantPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('assistant');
  const isConfigured = anthropicService.isConfigured();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-500" />
              AI アシスタント
            </h1>
            <p className="text-gray-600 mt-2">
              Anthropic Claude APIを活用した高度なAI機能でタスク管理を効率化
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isConfigured ? (
              <Badge className="py-1 px-3" variant="default">
                <Sparkles className="h-3 w-3 mr-1" />
                Claude 接続済み
              </Badge>
            ) : (
              <Badge className="py-1 px-3" variant="outline">
                未設定
              </Badge>
            )}
          </div>
        </div>

        {!isConfigured && (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              AI機能を使用するには、まず設定タブでAnthropicのAPIキーを設定してください。
              <Button
                variant="link"
                className="px-1 h-auto"
                onClick={() => setActiveTab('settings')}
              >
                設定を開く
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assistant">
            <MessageSquare className="h-4 w-4 mr-2" />
            AIチャット
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <BarChart3 className="h-4 w-4 mr-2" />
            タスク分析
          </TabsTrigger>
          <TabsTrigger value="features">
            <Sparkles className="h-4 w-4 mr-2" />
            機能一覧
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            設定
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assistant" className="mt-6">
          <AIChat />
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <AITaskSuggestions />
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Task Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-500" />
                  タスク分析
                </CardTitle>
                <CardDescription>AIがタスクを分析し、優先順位や時間配分を最適化</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>優先度の自動調整</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>作業時間の予測</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>関連タスクのグループ化</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Code Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-green-500" />
                  コード生成
                </CardTitle>
                <CardDescription>要件から高品質なコードを自動生成</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>多言語対応</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Rocket className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>フレームワーク対応</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>ベストプラクティス準拠</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Natural Language Processing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  自然言語処理
                </CardTitle>
                <CardDescription>自然な会話でタスクを作成・管理</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>意図の理解</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>文脈を考慮した応答</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>会話履歴の記憶</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Workflow Optimization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-orange-500" />
                  ワークフロー最適化
                </CardTitle>
                <CardDescription>作業プロセスを分析し改善提案</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <BarChart3 className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>ボトルネックの特定</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>自動化の提案</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>効率化のアドバイス</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Smart Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  スマートテンプレート
                </CardTitle>
                <CardDescription>プロジェクトに最適なタスクテンプレートを生成</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>業界別テンプレート</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>カスタマイズ可能</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Rocket className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>ベストプラクティス</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Task Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-500" />
                  タスク分解
                </CardTitle>
                <CardDescription>複雑なタスクを管理可能なサブタスクに分解</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>自動分解提案</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BarChart3 className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>依存関係の管理</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>時間見積もり</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Available Models */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">利用可能なAIモデル</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Claude 3.5 Sonnet</CardTitle>
                  <Badge className="w-fit">最新・推奨</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    最新の高性能モデル。複雑なタスクに最適で、高速なレスポンスとコストパフォーマンスのバランスが優れています。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Claude 3 Opus</CardTitle>
                  <Badge variant="outline" className="w-fit">
                    最高性能
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    最も高性能なモデル。高度な推論や複雑な分析が必要なタスクに適しています。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Claude 3 Sonnet</CardTitle>
                  <Badge variant="outline" className="w-fit">
                    バランス型
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    性能とコストのバランスが取れたモデル。一般的なタスクに適しています。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Claude 3 Haiku</CardTitle>
                  <Badge variant="outline" className="w-fit">
                    高速・軽量
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    高速で効率的なモデル。シンプルなタスクや大量処理に最適です。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <AISettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAssistantPage;
