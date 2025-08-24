import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Brain,
  Globe,
  Code,
  TrendingUp,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Github,
  Eye,
  Settings,
} from 'lucide-react';

export const SelfImprovementDashboard: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('analysis');
  const [cycleNumber, setCycleNumber] = useState(1);
  const [successRate, setSuccessRate] = useState(95.2);
  const [totalImprovements, setTotalImprovements] = useState(47);

  const startSelfImprovement = async () => {
    setLoading(true);
    setIsRunning(true);
    setLoading(false);
  };

  const stopSelfImprovement = () => {
    setIsRunning(false);
  };

  const runManualCycle = async () => {
    setLoading(true);
    setCycleNumber((prev) => prev + 1);
    setLoading(false);
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'analysis':
        return <Brain className="h-4 w-4" />;
      case 'planning':
        return <Settings className="h-4 w-4" />;
      case 'implementation':
        return <Code className="h-4 w-4" />;
      case 'deployment':
        return <Globe className="h-4 w-4" />;
      case 'monitoring':
        return <Eye className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'analysis':
        return 'bg-blue-500';
      case 'planning':
        return 'bg-yellow-500';
      case 'implementation':
        return 'bg-purple-500';
      case 'deployment':
        return 'bg-green-500';
      case 'monitoring':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ヘッダー */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🤖 自己改善ダッシュボード</h1>
          <p className="text-xl text-gray-600 mb-6">Cursor ⇒ Claude ⇒ GitHub ⇒ Vercel ⇒ Cursor</p>
          <p className="text-gray-500">
            AI駆動の継続的改善サイクルで、サイトが自動的に成長していきます
          </p>
        </div>

        {/* サイクル制御 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>改善サイクル制御</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Button
                onClick={startSelfImprovement}
                disabled={isRunning || loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                自動サイクル開始
              </Button>

              <Button onClick={stopSelfImprovement} disabled={!isRunning} variant="destructive">
                <Pause className="h-4 w-4 mr-2" />
                サイクル停止
              </Button>

              <Button onClick={runManualCycle} disabled={loading} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                手動実行
              </Button>

              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
                ></div>
                <span className="text-sm text-gray-600">{isRunning ? '自動実行中' : '停止中'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 現在のサイクル状況 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">現在のフェーズ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full ${getPhaseColor(currentPhase)} flex items-center justify-center text-white`}
                >
                  {getPhaseIcon(currentPhase)}
                </div>
                <div>
                  <p className="text-lg font-semibold capitalize">{currentPhase}</p>
                  <p className="text-xs text-gray-500">
                    最終更新: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">サイクル回数</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">#{cycleNumber}</p>
              <p className="text-xs text-gray-500">完了: {cycleNumber - 1}回</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">成功率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-green-600">{successRate.toFixed(1)}%</p>
                <Progress value={successRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">改善数</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{totalImprovements}</p>
              <p className="text-xs text-gray-500">累計改善項目</p>
            </CardContent>
          </Card>
        </div>

        {/* サイクルフロー可視化 */}
        <Card>
          <CardHeader>
            <CardTitle>🔄 改善サイクルフロー</CardTitle>
            <CardDescription>各フェーズの進行状況と次のステップ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between space-x-4 overflow-x-auto pb-4">
              {[
                { phase: 'analysis', name: '分析', icon: Brain, description: 'サイト現状分析' },
                { phase: 'planning', name: '計画', icon: Settings, description: 'AI改善計画' },
                { phase: 'implementation', name: '実装', icon: Code, description: 'コード生成' },
                {
                  phase: 'deployment',
                  name: 'デプロイ',
                  icon: Globe,
                  description: 'GitHub → Vercel',
                },
                { phase: 'monitoring', name: '監視', icon: Eye, description: '効果測定' },
              ].map((step, index) => (
                <div key={step.phase} className="flex flex-col items-center space-y-2 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      currentPhase === step.phase
                        ? `${getPhaseColor(step.phase)} border-transparent text-white shadow-lg scale-110`
                        : 'border-gray-300 text-gray-400 bg-white'
                    }`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p
                      className={`text-sm font-medium ${
                        currentPhase === step.phase ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 改善計画一覧 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>改善計画</span>
            </CardTitle>
            <CardDescription>現在のサイクルで実装予定の改善項目</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: 'Lintエラーの修正',
                  description: 'TypeScriptとESLintエラーを自動修正してコード品質を向上',
                  priority: 'high',
                  category: 'code',
                  effort: 'small',
                  impact: 'medium',
                  changes: ['型定義の追加', 'unused変数の削除', 'import文の整理'],
                },
                {
                  title: 'パフォーマンス最適化',
                  description: 'バンドルサイズを削減し、読み込み速度を改善',
                  priority: 'high',
                  category: 'performance',
                  effort: 'medium',
                  impact: 'high',
                  changes: ['コード分割の実装', '未使用ライブラリの削除', '画像最適化'],
                },
                {
                  title: 'アクセシビリティ改善',
                  description: 'WCAG 2.1準拠のアクセシビリティ機能を追加',
                  priority: 'medium',
                  category: 'ui',
                  effort: 'medium',
                  impact: 'high',
                  changes: ['ARIAラベルの追加', 'キーボードナビゲーション', 'コントラスト調整'],
                },
              ].map((improvement, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium text-gray-900">{improvement.title}</h3>
                      <p className="text-sm text-gray-600">{improvement.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getPriorityColor(improvement.priority)}>
                        {improvement.priority}
                      </Badge>
                      <Badge variant="outline">{improvement.category}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">工数:</span>
                      <span className="ml-1">{improvement.effort}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">期待効果:</span>
                      <span className="ml-1">{improvement.impact}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">対象ファイル:</span>
                      <span className="ml-1">{improvement.changes.length}個</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">変更内容:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {improvement.changes.map((change: string, changeIndex: number) => (
                        <li key={changeIndex} className="flex items-start space-x-2">
                          <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 統合ステータス */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>マルチAI統合</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">9つのAIサービス統合済み</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>• ChatGPT, Claude, Gemini</p>
                  <p>• Manus, NotebookLM, Notion</p>
                  <p>• AI Studio, SuperWhisper, Sora</p>
                  <p>• コンセンサス機能により信頼性向上</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('/multi-ai', '_blank')}
                  className="w-full"
                >
                  🤖 マルチAIダッシュボード
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Github className="h-5 w-5" />
                <span>GitHub統合</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">接続済み</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>• 自動プルリクエスト作成</p>
                  <p>• Issue管理</p>
                  <p>• コミット分析</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Vercel統合</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">接続済み</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>• 自動デプロイ</p>
                  <p>• パフォーマンス監視</p>
                  <p>• エラー追跡</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* フッター情報 */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-500">
              <p>🤖 このダッシュボードは自己改善エンジンによって管理されています</p>
              <p className="mt-1">次回自動実行: {isRunning ? '24時間後' : '未設定'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SelfImprovementDashboard;
