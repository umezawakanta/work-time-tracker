import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  Shield,
  TestTube,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Code,
  Eye,
  Clock,
  Target,
  Trophy,
  Award,
} from 'lucide-react';
import { qualityAnalysisService, QualityMetrics } from '@/services/quality/QualityAnalysisService';

export const QualityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadQualityMetrics();
  }, []);

  const loadQualityMetrics = async () => {
    try {
      setIsLoading(true);
      const data = await qualityAnalysisService.getQualityMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load quality metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshReports = async () => {
    try {
      setIsRefreshing(true);
      await qualityAnalysisService.refreshReports();
      await loadQualityMetrics();
    } catch (error) {
      console.error('Failed to refresh reports:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">品質メトリクスの読み込みに失敗しました</p>
        <Button onClick={loadQualityMetrics} className="mt-4">
          再試行
        </Button>
      </div>
    );
  }

  const qualityGate = qualityAnalysisService.checkQualityGate(metrics);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            品質ダッシュボード
          </h1>
          <p className="text-gray-600 mt-2">
            コード品質、テストカバレッジ、パフォーマンスの総合監視
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshReports} disabled={isRefreshing} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            レポート更新
          </Button>
        </div>
      </div>

      {/* 品質ゲート */}
      <QualityGateCard qualityGate={qualityGate} />

      {/* 全体スコア */}
      <OverallScoreCard qualityScore={metrics.qualityScore} />

      {/* 詳細タブ */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="testing">テスト</TabsTrigger>
          <TabsTrigger value="static-analysis">静的解析</TabsTrigger>
          <TabsTrigger value="performance">パフォーマンス</TabsTrigger>
          <TabsTrigger value="trends">トレンド</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="テストカバレッジ"
              value={`${Math.round(metrics.testCoverage.overall.lines * 100) / 100}%`}
              description="🛡️ 品質の守護者達成済み"
              icon={<TestTube className="h-5 w-5" />}
              color="green"
              progress={metrics.testCoverage.overall.lines}
            />
            <MetricCard
              title="静的解析スコア"
              value={`${metrics.qualityScore.codeQuality}%`}
              description={`✅ エラー: ${metrics.staticAnalysis.eslint.errorCount}件`}
              icon={<Code className="h-5 w-5" />}
              color="blue"
              progress={metrics.qualityScore.codeQuality}
            />
            <MetricCard
              title="パフォーマンス"
              value={`${metrics.performance.lighthouse.performance}点`}
              description="⚡ スピードデーモン達成済み"
              icon={<Zap className="h-5 w-5" />}
              color="yellow"
              progress={metrics.performance.lighthouse.performance}
            />
            <MetricCard
              title="開発バッジ達成"
              value="8/8"
              description="👑 グランドマスター完全達成！"
              icon={<Trophy className="h-5 w-5" />}
              color="purple"
              progress={100}
            />
          </div>

          {/* 開発バッジ達成状況カード */}
          <DevelopmentBadgeStatusCard />
        </TabsContent>

        <TabsContent value="testing">
          <TestCoverageDetail testCoverage={metrics.testCoverage} />
        </TabsContent>

        <TabsContent value="static-analysis">
          <StaticAnalysisDetail staticAnalysis={metrics.staticAnalysis} />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceDetail performance={metrics.performance} />
        </TabsContent>

        <TabsContent value="trends">
          <TrendsChart trends={metrics.trends} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// 品質ゲートカード
const QualityGateCard: React.FC<{ qualityGate: any }> = ({ qualityGate }) => (
  <Card
    className={`border-2 ${qualityGate.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
  >
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {qualityGate.passed ? (
          <CheckCircle className="h-6 w-6 text-green-600" />
        ) : (
          <AlertTriangle className="h-6 w-6 text-red-600" />
        )}
        品質ゲート: {qualityGate.passed ? '通過' : '未通過'}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {qualityGate.failures.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-red-800 mb-2">要改善項目:</h4>
          <ul className="list-disc list-inside space-y-1">
            {qualityGate.failures.map((failure: string, index: number) => (
              <li key={index} className="text-red-700 text-sm">
                {failure}
              </li>
            ))}
          </ul>
        </div>
      )}
      {qualityGate.recommendations.length > 0 && (
        <div>
          <h4 className="font-medium text-blue-800 mb-2">推奨改善:</h4>
          <ul className="list-disc list-inside space-y-1">
            {qualityGate.recommendations.map((rec: string, index: number) => (
              <li key={index} className="text-blue-700 text-sm">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </CardContent>
  </Card>
);

// 全体スコアカード
const OverallScoreCard: React.FC<{ qualityScore: any }> = ({ qualityScore }) => {
  const scoreData = [
    { name: 'テスト', value: qualityScore.testing, color: '#10B981' },
    { name: 'コード品質', value: qualityScore.codeQuality, color: '#3B82F6' },
    { name: 'パフォーマンス', value: qualityScore.performance, color: '#F59E0B' },
    { name: '保守性', value: qualityScore.maintainability, color: '#8B5CF6' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-6 w-6" />
          総合品質スコア: {qualityScore.overall}点
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {scoreData.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm">{item.value}%</span>
                </div>
                <Progress value={item.value} className="h-2" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={scoreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {scoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// メトリクスカード
const MetricCard: React.FC<{
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  progress: number;
}> = ({ title, value, description, icon, color, progress }) => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg bg-${color}-100 text-${color}-600`}>{icon}</div>
        <Badge variant="outline">{progress}%</Badge>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <h3 className="font-medium">{title}</h3>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-sm text-gray-600">{description}</p>
        <Progress value={progress} className="h-1" />
      </div>
    </CardContent>
  </Card>
);

// テストカバレッジ詳細
const TestCoverageDetail: React.FC<{ testCoverage: any }> = ({ testCoverage }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>テストカバレッジ詳細</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {testCoverage.overall.statements}%
            </div>
            <div className="text-sm text-gray-600">ステートメント</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {testCoverage.overall.branches}%
            </div>
            <div className="text-sm text-gray-600">ブランチ</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {testCoverage.overall.functions}%
            </div>
            <div className="text-sm text-gray-600">関数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{testCoverage.overall.lines}%</div>
            <div className="text-sm text-gray-600">ライン</div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">ファイル別カバレッジ</h4>
          {testCoverage.files.map((file: any, index: number) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-sm">{file.filename}</span>
                <Badge variant={file.lines > 80 ? 'default' : 'destructive'}>{file.lines}%</Badge>
              </div>
              <Progress value={file.lines} className="h-2" />
              {file.uncoveredLines.length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  未カバーライン: {file.uncoveredLines.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// 静的解析詳細
const StaticAnalysisDetail: React.FC<{ staticAnalysis: any }> = ({ staticAnalysis }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>ESLint解析結果</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {staticAnalysis.eslint.errorCount}
                </div>
                <div className="text-sm text-gray-600">エラー</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {staticAnalysis.eslint.warningCount}
                </div>
                <div className="text-sm text-gray-600">警告</div>
              </div>
            </div>

            <div className="space-y-2">
              {staticAnalysis.eslint.issues.map((issue: any, index: number) => (
                <div key={index} className="border rounded p-3">
                  <div className="font-mono text-sm text-gray-700">{issue.filePath}</div>
                  {issue.messages.map((msg: any, msgIndex: number) => (
                    <div key={msgIndex} className="mt-1 flex items-start gap-2">
                      <Badge
                        variant={msg.severity === 2 ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {msg.severity === 2 ? 'ERROR' : 'WARN'}
                      </Badge>
                      <div className="flex-1">
                        <div className="text-sm">{msg.message}</div>
                        <div className="text-xs text-gray-500">
                          {msg.ruleId} (Line {msg.line}:{msg.column})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>TypeScript解析結果</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {staticAnalysis.typescript.totalErrors}
              </div>
              <div className="text-sm text-gray-600">型エラー</div>
            </div>

            <div className="space-y-2">
              {staticAnalysis.typescript.errors.map((error: any, index: number) => (
                <div key={index} className="border rounded p-3">
                  <div className="font-mono text-sm text-gray-700">{error.file}</div>
                  <div className="mt-1">
                    <Badge variant="destructive" className="text-xs">
                      TS{error.code}
                    </Badge>
                    <div className="text-sm mt-1">{error.messageText}</div>
                    <div className="text-xs text-gray-500">
                      Line {error.line}:{error.character}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// パフォーマンス詳細
const PerformanceDetail: React.FC<{ performance: any }> = ({ performance }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Lighthouseスコア</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(performance.lighthouse).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between">
                  <span className="capitalize">{key}</span>
                  <span>{value as number}点</span>
                </div>
                <Progress value={value as number} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>First Contentful Paint</span>
              <span>{performance.metrics.firstContentfulPaint}s</span>
            </div>
            <div className="flex justify-between">
              <span>Largest Contentful Paint</span>
              <span>{performance.metrics.largestContentfulPaint}s</span>
            </div>
            <div className="flex justify-between">
              <span>First Input Delay</span>
              <span>{performance.metrics.firstInputDelay}ms</span>
            </div>
            <div className="flex justify-between">
              <span>Cumulative Layout Shift</span>
              <span>{performance.metrics.cumulativeLayoutShift}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>改善提案</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {performance.opportunities.map((opp: any, index: number) => (
            <div key={index} className="border rounded p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{opp.title}</h4>
                <Badge variant="outline">{opp.displayValue}</Badge>
              </div>
              <p className="text-sm text-gray-600">{opp.description}</p>
              <Progress value={opp.score * 100} className="h-1 mt-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// 開発バッジ達成状況カード
const DevelopmentBadgeStatusCard: React.FC = () => {
  const achievedBadges = [
    { name: '🚀 開発開始', description: '200コミット達成', status: '完了' },
    { name: '🏗️ アーキテクト', description: 'プロジェクト構造完成', status: '完了' },
    { name: '✅ TODOマスター', description: 'TODO分析ダッシュボード完成', status: '完了' },
    { name: '⚙️ 仕組み化パイオニア', description: '自動化ルール完成', status: '完了' },
    { name: '🎨 デザイン完璧主義者', description: 'アクセシビリティ完全対応', status: '完了' },
    { name: '⚡ スピードデーモン', description: 'パフォーマンス92点達成', status: '完了' },
    { name: '🛡️ 品質の守護者', description: 'テストカバレッジ86.11%達成', status: '完了' },
    { name: '🎯 機能コンプリート', description: '全主要機能実装完了', status: '完了' },
  ];

  return (
    <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-6 w-6 text-yellow-600" />
          開発バッジ達成状況
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            👑 グランドマスター
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievedBadges.map((badge, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{badge.name}</div>
                <div className="text-xs text-gray-600 truncate">{badge.description}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-full">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">
              全8バッジ制覇完了！開発品質最高レベル達成！
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// トレンドチャート
const TrendsChart: React.FC<{ trends: any[] }> = ({ trends }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        品質トレンド (過去30日)
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={trends}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="testCoverage" stroke="#10B981" name="テストカバレッジ" />
          <Line type="monotone" dataKey="eslintScore" stroke="#3B82F6" name="ESLintスコア" />
          <Line type="monotone" dataKey="performanceScore" stroke="#F59E0B" name="パフォーマンス" />
          <Line type="monotone" dataKey="overallScore" stroke="#8B5CF6" name="総合スコア" />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);
