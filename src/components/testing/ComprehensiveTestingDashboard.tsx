import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  RefreshCw,
  Download,
  Activity,
  TestTube,
  Zap,
  Shield,
  Target,
  AlertTriangle,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Server,
  Globe,
  Users,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TestResult {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'system' | 'e2e';
  status: 'passing' | 'failing' | 'running' | 'pending';
  duration: number;
  coverage: number;
  lastRun: string;
  description: string;
  error?: string;
}

interface TestSuite {
  name: string;
  type: 'unit' | 'integration' | 'system' | 'e2e';
  tests: TestResult[];
  totalTests: number;
  passingTests: number;
  failingTests: number;
  coverage: number;
  duration: number;
}

/**
 * 包括的テストダッシュボード - 視覚的確認システム
 */
const ComprehensiveTestingDashboard: React.FC = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // 初期化とデータ取得
  useEffect(() => {
    fetchTestResults();
    const interval = setInterval(fetchTestResults, 30000); // 30秒ごとに更新
    return () => clearInterval(interval);
  }, []);

  const fetchTestResults = async () => {
    try {
      // 実際のテスト結果を取得
      const response = await fetch('/api/testing/results');
      if (response.ok) {
        const data = await response.json();
        setTestSuites(data.testSuites || getMockTestResults());
      } else {
        // APIが利用できない場合はモックデータを使用
        setTestSuites(getMockTestResults());
      }
      setLastUpdate(new Date());
    } catch (error) {
      console.warn('テスト結果の取得に失敗しました。モックデータを使用します。', error);
      setTestSuites(getMockTestResults());
      setLastUpdate(new Date());
    }
  };

  const getMockTestResults = (): TestSuite[] => {
    return [
      {
        name: '単体テスト (Unit Tests)',
        type: 'unit',
        totalTests: 247,
        passingTests: 239,
        failingTests: 8,
        coverage: 87.4,
        duration: 45.2,
        tests: [
          {
            id: 'unit-auth-1',
            name: 'Authentication Service Tests',
            type: 'unit',
            status: 'passing',
            duration: 12.3,
            coverage: 94.2,
            lastRun: new Date(Date.now() - 300000).toISOString(),
            description: 'ログイン・ログアウト・セッション管理のテスト',
          },
          {
            id: 'unit-billing-1',
            name: 'Billing System Tests',
            type: 'unit',
            status: 'passing',
            duration: 8.7,
            coverage: 91.5,
            lastRun: new Date(Date.now() - 300000).toISOString(),
            description: 'Stripe決済・サブスクリプション管理のテスト',
          },
          {
            id: 'unit-quadrant-1',
            name: 'Quadrant Classification Tests',
            type: 'unit',
            status: 'failing',
            duration: 5.4,
            coverage: 78.9,
            lastRun: new Date(Date.now() - 180000).toISOString(),
            description: '4象限タスク分類システムのテスト',
            error: 'Gemini API key validation failed',
          },
        ],
      },
      {
        name: '結合テスト (Integration Tests)',
        type: 'integration',
        totalTests: 89,
        passingTests: 82,
        failingTests: 7,
        coverage: 76.8,
        duration: 156.7,
        tests: [
          {
            id: 'int-auth-billing-1',
            name: 'Auth + Billing Integration',
            type: 'integration',
            status: 'passing',
            duration: 23.4,
            coverage: 85.1,
            lastRun: new Date(Date.now() - 900000).toISOString(),
            description: '認証システムと課金システムの連携テスト',
          },
          {
            id: 'int-api-db-1',
            name: 'API + Database Integration',
            type: 'integration',
            status: 'passing',
            duration: 34.7,
            coverage: 79.3,
            lastRun: new Date(Date.now() - 900000).toISOString(),
            description: 'APIとデータベースの連携テスト',
          },
        ],
      },
      {
        name: 'システムテスト (System Tests)',
        type: 'system',
        totalTests: 45,
        passingTests: 43,
        failingTests: 2,
        coverage: 68.9,
        duration: 234.5,
        tests: [
          {
            id: 'sys-user-flow-1',
            name: 'Complete User Journey',
            type: 'system',
            status: 'passing',
            duration: 67.8,
            coverage: 72.4,
            lastRun: new Date(Date.now() - 1800000).toISOString(),
            description: 'ユーザー登録から課金まで完全フローのテスト',
          },
          {
            id: 'sys-performance-1',
            name: 'Performance & Load Tests',
            type: 'system',
            status: 'failing',
            duration: 89.2,
            coverage: 65.1,
            lastRun: new Date(Date.now() - 1800000).toISOString(),
            description: 'パフォーマンス・負荷テスト',
            error: 'Response time exceeded 2s threshold',
          },
        ],
      },
      {
        name: 'E2Eテスト (End-to-End Tests)',
        type: 'e2e',
        totalTests: 28,
        passingTests: 26,
        failingTests: 2,
        coverage: 45.2,
        duration: 412.3,
        tests: [
          {
            id: 'e2e-critical-1',
            name: 'Critical User Paths',
            type: 'e2e',
            status: 'passing',
            duration: 156.7,
            coverage: 48.9,
            lastRun: new Date(Date.now() - 3600000).toISOString(),
            description: 'クリティカルユーザーパスのE2Eテスト',
          },
        ],
      },
    ];
  };

  const runAllTests = async () => {
    setIsRunning(true);
    toast('全テストスイートを実行中...', { icon: '🧪' });

    try {
      // 実際のテスト実行API呼び出し
      const response = await fetch('/api/testing/run-all', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('全テストが完了しました！');
      } else {
        toast.error('テスト実行中にエラーが発生しました');
      }
    } catch (error) {
      console.error('テスト実行エラー:', error);
      toast.error('テスト実行中にエラーが発生しました');
    } finally {
      setIsRunning(false);
      await fetchTestResults();
    }
  };

  const calculateOverallStats = () => {
    const totalTests = testSuites.reduce((sum, suite) => sum + suite.totalTests, 0);
    const passingTests = testSuites.reduce((sum, suite) => sum + suite.passingTests, 0);
    const failingTests = testSuites.reduce((sum, suite) => sum + suite.failingTests, 0);
    const totalCoverage =
      testSuites.reduce((sum, suite) => sum + suite.coverage, 0) / testSuites.length;
    const totalDuration = testSuites.reduce((sum, suite) => sum + suite.duration, 0);

    return {
      totalTests,
      passingTests,
      failingTests,
      successRate: totalTests > 0 ? (passingTests / totalTests) * 100 : 0,
      totalCoverage,
      totalDuration,
    };
  };

  const overallStats = calculateOverallStats();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passing':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failing':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passing':
        return 'bg-green-100 text-green-800';
      case 'failing':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                <TestTube className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">包括的テストダッシュボード</h1>
                <p className="text-gray-600 mt-2">
                  単体・結合・システム・E2Eテストの視覚的確認システム
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={runAllTests}
                disabled={isRunning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isRunning ? '実行中...' : '全テスト実行'}
              </Button>
              <Button variant="outline" onClick={fetchTestResults}>
                <RefreshCw className="h-4 w-4 mr-2" />
                更新
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 概要統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">成功率</p>
                  <p className="text-3xl font-bold text-green-900">
                    {overallStats.successRate.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={overallStats.successRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">総テスト数</p>
                  <p className="text-3xl font-bold text-blue-900">{overallStats.totalTests}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-blue-700">
                成功: {overallStats.passingTests} / 失敗: {overallStats.failingTests}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">カバレッジ</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {overallStats.totalCoverage.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={overallStats.totalCoverage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">実行時間</p>
                  <p className="text-3xl font-bold text-yellow-900">
                    {(overallStats.totalDuration / 60).toFixed(1)}分
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Zap className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-yellow-700">
                最終更新: {lastUpdate.toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* メインコンテンツ */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="unit">単体テスト</TabsTrigger>
            <TabsTrigger value="integration">結合テスト</TabsTrigger>
            <TabsTrigger value="system">システムテスト</TabsTrigger>
            <TabsTrigger value="e2e">E2Eテスト</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  テストスイート概要
                </CardTitle>
                <CardDescription>全テストスイートの実行状況とパフォーマンス指標</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testSuites.map((suite) => (
                    <div key={suite.name} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{suite.name}</h3>
                        <Badge variant="outline">
                          {suite.passingTests}/{suite.totalTests} 成功
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">成功率</p>
                          <p className="text-xl font-bold text-green-600">
                            {((suite.passingTests / suite.totalTests) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">カバレッジ</p>
                          <p className="text-xl font-bold text-blue-600">
                            {suite.coverage.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">実行時間</p>
                          <p className="text-xl font-bold text-purple-600">
                            {suite.duration.toFixed(1)}秒
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">失敗数</p>
                          <p className="text-xl font-bold text-red-600">{suite.failingTests}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Progress
                          value={(suite.passingTests / suite.totalTests) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {testSuites.map((suite) => (
            <TabsContent key={suite.type} value={suite.type} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    {suite.name}
                  </CardTitle>
                  <CardDescription>詳細なテスト結果と診断情報</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {suite.tests.map((test) => (
                      <div key={test.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(test.status)}
                            <h3 className="font-semibold">{test.name}</h3>
                            <Badge className={getStatusColor(test.status)}>{test.status}</Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(test.lastRun).toLocaleString()}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">{test.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">実行時間</p>
                            <p className="font-semibold">{test.duration.toFixed(1)}秒</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">カバレッジ</p>
                            <p className="font-semibold">{test.coverage.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">ステータス</p>
                            <p className="font-semibold capitalize">{test.status}</p>
                          </div>
                        </div>
                        {test.error && (
                          <Alert className="border-red-200 bg-red-50">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-red-800">
                              <strong>エラー:</strong> {test.error}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* アクションボタン */}
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            レポートダウンロード
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            詳細ログ表示
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            カバレッジレポート
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveTestingDashboard;
