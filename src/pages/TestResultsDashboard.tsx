/**
 * 🧪 テスト結果ダッシュボード
 * 単体・結合・システム試験の結果を視覚的に表示
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Play,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Target,
  Activity,
  BarChart3,
  TrendingUp,
  Database,
  Shield,
  Zap,
  Brain,
  Smartphone,
  Globe,
  Settings,
  FileText,
  Download,
  Filter,
  Calendar,
} from 'lucide-react';
import ComprehensiveTestingService from '@/services/testing/ComprehensiveTestingService';
import { toast } from 'react-hot-toast';

interface TestCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const TestResultsDashboard: React.FC = () => {
  const [testingService] = useState(() => ComprehensiveTestingService.getInstance());
  const [isRunning, setIsRunning] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<any | null>(null);
  const [testHistory, setTestHistory] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState<string>('overview');

  const testCategories: TestCategory[] = [
    {
      id: 'authentication',
      name: '認証システム',
      icon: <Shield className="w-4 h-4" />,
      color: 'bg-blue-500',
      description: 'ログイン、ユーザー登録、セッション管理',
    },
    {
      id: 'payment',
      name: '課金システム',
      icon: <Database className="w-4 h-4" />,
      color: 'bg-green-500',
      description: 'Stripe統合、決済処理、サブスクリプション',
    },
    {
      id: 'ui',
      name: 'UI/UX',
      icon: <Smartphone className="w-4 h-4" />,
      color: 'bg-purple-500',
      description: 'レスポンシブデザイン、ユーザビリティ',
    },
    {
      id: 'accessibility',
      name: 'アクセシビリティ',
      icon: <Globe className="w-4 h-4" />,
      color: 'bg-orange-500',
      description: 'WCAG準拠、ADHD/ASD配慮',
    },
    {
      id: 'performance',
      name: 'パフォーマンス',
      icon: <Zap className="w-4 h-4" />,
      color: 'bg-yellow-500',
      description: 'ページ速度、Web Vitals',
    },
    {
      id: 'ai',
      name: 'AI統合',
      icon: <Brain className="w-4 h-4" />,
      color: 'bg-pink-500',
      description: 'OpenAI、Claude、Gemini統合',
    },
    {
      id: 'database',
      name: 'データ整合性',
      icon: <Database className="w-4 h-4" />,
      color: 'bg-indigo-500',
      description: 'CRUD操作、バックアップ、復旧',
    },
  ];

  useEffect(() => {
    // 初期データ読み込み
    loadTestData();

    // 定期的な更新（実行中のみ）
    const interval = setInterval(() => {
      if (isRunning) {
        loadTestData();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const adaptRunResultToExecution = (result: any) => {
    try {
      const allResults = (result?.testSuites || [])
        .flatMap((suite: any) => suite.tests || [])
        .map((t: any) => ({
          testId: t.id || t.name,
          status:
            t.status === 'passing'
              ? 'passed'
              : t.status === 'failing'
                ? 'failed'
                : t.status || 'unknown',
          duration: typeof t.duration === 'number' ? Math.round(t.duration * 1000) : 0,
          message: t.description || '',
          details: t.details || undefined,
          error: t.error ? { message: String(t.error) } : undefined,
        }));

      const passed = allResults.filter((r: any) => r.status === 'passed').length;
      const failed = allResults.filter((r: any) => r.status === 'failed').length;
      const total = allResults.length;
      const durationSec = Number(result?.overallStats?.totalDuration || 0);

      return {
        id: `exec-${Date.now()}`,
        startTime: new Date().toISOString(),
        status: failed > 0 ? 'failed' : 'completed',
        results: allResults,
        summary: {
          passed,
          failed,
          skipped: 0,
          total,
          duration: Math.round(durationSec * 1000),
        },
      };
    } catch {
      return {
        id: `exec-${Date.now()}`,
        startTime: new Date().toISOString(),
        status: 'failed',
        results: [],
        summary: { passed: 0, failed: 0, skipped: 0, total: 0, duration: 0 },
      };
    }
  };

  const computeSummary = (execution: any | null) => {
    if (!execution) return { totalTests: 0, overallStatus: 'unknown' } as any;
    const { summary } = execution;
    return {
      totalTests: summary?.total || 0,
      overallStatus: summary?.failed > 0 ? 'unhealthy' : 'healthy',
    } as any;
  };

  const loadTestData = () => {
    // No-op: data is maintained locally after each run
  };

  const runAllTests = async () => {
    try {
      setIsRunning(true);
      toast.loading('全テストを実行中...', { id: 'test-execution' });

      const result = await testingService.runAllTests();
      const execution = adaptRunResultToExecution(result);

      setCurrentExecution(execution);
      setTestHistory((prev) => [execution, ...prev]);

      if (execution.status === 'completed') {
        toast.success(
          `テスト実行完了: ${execution.summary.passed}件成功, ${execution.summary.failed}件失敗`,
          { id: 'test-execution' }
        );
      } else {
        toast.error(`テスト実行失敗: ${execution.summary.errors}件エラー`, {
          id: 'test-execution',
        });
      }
    } catch (error) {
      console.error('テスト実行エラー:', error);
      toast.error('テストの実行に失敗しました', { id: 'test-execution' });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'skipped':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'passed':
      case 'completed':
        return 'default';
      case 'failed':
      case 'error':
        return 'destructive';
      case 'running':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const latestExecution = testHistory[0];
  const testSummary = computeSummary(latestExecution || currentExecution);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">テスト結果ダッシュボード</h1>
            <p className="text-gray-600">単体・結合・システム試験の包括的結果表示</p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center space-x-2"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{isRunning ? 'テスト実行中...' : '全テスト実行'}</span>
            </Button>
            <Button variant="outline" onClick={loadTestData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              更新
            </Button>
          </div>
        </div>

        {/* 実行中のプログレス */}
        {isRunning && currentExecution && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="font-medium">テスト実行中</span>
                </div>
                <div className="text-sm text-gray-600">
                  {currentExecution.results.length} / {testSummary.totalTests} 完了
                </div>
              </div>
              <Progress
                value={(currentExecution.results.length / testSummary.totalTests) * 100}
                className="h-2"
              />
            </CardContent>
          </Card>
        )}

        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">総テスト数</p>
                  <p className="text-2xl font-bold">{testSummary.totalTests}</p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">成功率</p>
                  <p className="text-2xl font-bold text-green-600">
                    {latestExecution
                      ? Math.round(
                          (latestExecution.summary.passed / latestExecution.summary.total) * 100
                        )
                      : 0}
                    %
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">最終実行</p>
                  <p className="text-sm font-medium">
                    {latestExecution
                      ? new Date(latestExecution.startTime).toLocaleString()
                      : 'なし'}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">システム状態</p>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={testSummary.overallStatus === 'healthy' ? 'default' : 'destructive'}
                    >
                      {testSummary.overallStatus === 'healthy' ? '正常' : '問題あり'}
                    </Badge>
                  </div>
                </div>
                <Activity className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* メインタブ */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="results">詳細結果</TabsTrigger>
            <TabsTrigger value="categories">カテゴリ別</TabsTrigger>
            <TabsTrigger value="history">履歴</TabsTrigger>
          </TabsList>

          {/* 概要タブ */}
          <TabsContent value="overview" className="space-y-6">
            {latestExecution ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 最新実行結果サマリー */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5" />
                      <span>最新実行結果</span>
                    </CardTitle>
                    <CardDescription>
                      {new Date(latestExecution.startTime).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {latestExecution.summary.passed}
                          </div>
                          <div className="text-sm text-gray-500">成功</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {latestExecution.summary.failed}
                          </div>
                          <div className="text-sm text-gray-500">失敗</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-xl font-medium text-yellow-600">
                            {latestExecution.summary.skipped}
                          </div>
                          <div className="text-sm text-gray-500">スキップ</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-medium text-gray-600">
                            {Math.round(latestExecution.summary.duration / 1000)}s
                          </div>
                          <div className="text-sm text-gray-500">実行時間</div>
                        </div>
                      </div>

                      <Progress
                        value={
                          (latestExecution.summary.passed / latestExecution.summary.total) * 100
                        }
                        className="h-3"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* テストカテゴリ別結果 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="w-5 h-5" />
                      <span>カテゴリ別結果</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {testCategories.map((category) => {
                        const categoryResults = latestExecution.results.filter(
                          (result) => result.details?.category === category.id
                        );
                        const successRate =
                          categoryResults.length > 0
                            ? (categoryResults.filter((r) => r.status === 'passed').length /
                                categoryResults.length) *
                              100
                            : 0;

                        return (
                          <div key={category.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${category.color} text-white`}>
                                {category.icon}
                              </div>
                              <div>
                                <div className="font-medium">{category.name}</div>
                                <div className="text-sm text-gray-500">
                                  {categoryResults.length}件のテスト
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{Math.round(successRate)}%</div>
                              <div className="text-sm text-gray-500">成功率</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">テスト結果がありません</h3>
                  <p className="text-gray-600 mb-4">テストを実行して結果を確認しましょう</p>
                  <Button onClick={runAllTests} disabled={isRunning}>
                    <Play className="w-4 h-4 mr-2" />
                    テストを実行
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 詳細結果タブ */}
          <TabsContent value="results" className="space-y-6">
            {latestExecution && latestExecution.results.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>詳細テスト結果</CardTitle>
                  <CardDescription>{latestExecution.results.length}件のテスト結果</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {latestExecution.results.map((result, index) => (
                      <div
                        key={result.testId || index}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            {getStatusIcon(result.status)}
                            <div className="flex-1">
                              <div className="font-medium">{result.testId}</div>
                              {result.message && (
                                <div className="text-sm text-gray-600 mt-1">{result.message}</div>
                              )}
                              {result.error && (
                                <div className="text-sm text-red-600 mt-1">
                                  {result.error.message}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getStatusBadgeVariant(result.status)}>
                              {result.status}
                            </Badge>
                            <div className="text-sm text-gray-500">{result.duration}ms</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">詳細結果を表示するテストデータがありません</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* カテゴリ別タブ */}
          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${category.color} text-white`}>
                        {category.icon}
                      </div>
                      <span>{category.name}</span>
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {latestExecution ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>テスト数:</span>
                          <span className="font-medium">
                            {
                              latestExecution.results.filter(
                                (r) => r.details?.category === category.id
                              ).length
                            }
                            件
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>成功率:</span>
                          <span className="font-medium text-green-600">
                            {(() => {
                              const categoryResults = latestExecution.results.filter(
                                (r) => r.details?.category === category.id
                              );
                              return categoryResults.length > 0
                                ? Math.round(
                                    (categoryResults.filter((r) => r.status === 'passed').length /
                                      categoryResults.length) *
                                      100
                                  )
                                : 0;
                            })()}
                            %
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">データなし</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 履歴タブ */}
          <TabsContent value="history" className="space-y-6">
            {testHistory.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>テスト実行履歴</CardTitle>
                  <CardDescription>過去のテスト実行結果の履歴</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {testHistory.map((execution) => (
                      <div key={execution.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <Badge variant={getStatusBadgeVariant(execution.status)}>
                                {execution.status}
                              </Badge>
                              <div className="font-medium">
                                {new Date(execution.startTime).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {execution.summary.total}件中 {execution.summary.passed}件成功
                              {execution.summary.failed > 0 &&
                                `, ${execution.summary.failed}件失敗`}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {Math.round(execution.summary.duration / 1000)}秒
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">テスト実行履歴がありません</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TestResultsDashboard;
