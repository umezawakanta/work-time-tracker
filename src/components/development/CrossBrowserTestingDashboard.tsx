import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Monitor,
  Smartphone,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Chrome,
  Wifi,
  Bug,
  Settings,
  Eye,
  Zap,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface BrowserTestResult {
  browser: string;
  version: string;
  platform: string;
  status: 'passed' | 'failed' | 'warning' | 'testing';
  features: {
    [key: string]: {
      status: 'passed' | 'failed' | 'warning';
      message?: string;
    };
  };
  performance: {
    score: number;
    metrics: {
      fcp: number; // First Contentful Paint
      lcp: number; // Largest Contentful Paint
      fid: number; // First Input Delay
      cls: number; // Cumulative Layout Shift
    };
  };
}

interface CrossBrowserTestData {
  browsers: BrowserTestResult[];
  compatibilityScore: number;
  criticalIssues: number;
  totalTests: number;
  passedTests: number;
  lastTestRun: string;
}

export const CrossBrowserTestingDashboard: React.FC = () => {
  const [testData, setTestData] = useState<CrossBrowserTestData>({
    browsers: [
      {
        browser: 'Chrome',
        version: '121.0',
        platform: 'Windows',
        status: 'passed',
        features: {
          'CSS Grid': { status: 'passed' },
          Flexbox: { status: 'passed' },
          'ES6 Modules': { status: 'passed' },
          'Service Worker': { status: 'passed' },
          'Web Components': { status: 'passed' },
          'CSS Variables': { status: 'passed' },
          'Intersection Observer': { status: 'passed' },
          WebSocket: { status: 'passed' },
        },
        performance: {
          score: 96,
          metrics: { fcp: 1.2, lcp: 2.1, fid: 8, cls: 0.05 },
        },
      },
      {
        browser: 'Firefox',
        version: '122.0',
        platform: 'Windows',
        status: 'passed',
        features: {
          'CSS Grid': { status: 'passed' },
          Flexbox: { status: 'passed' },
          'ES6 Modules': { status: 'passed' },
          'Service Worker': { status: 'passed' },
          'Web Components': { status: 'warning', message: 'Partial support' },
          'CSS Variables': { status: 'passed' },
          'Intersection Observer': { status: 'passed' },
          WebSocket: { status: 'passed' },
        },
        performance: {
          score: 94,
          metrics: { fcp: 1.4, lcp: 2.3, fid: 12, cls: 0.08 },
        },
      },
      {
        browser: 'Safari',
        version: '17.2',
        platform: 'macOS',
        status: 'warning',
        features: {
          'CSS Grid': { status: 'passed' },
          Flexbox: { status: 'passed' },
          'ES6 Modules': { status: 'passed' },
          'Service Worker': { status: 'passed' },
          'Web Components': { status: 'warning', message: 'Limited support' },
          'CSS Variables': { status: 'passed' },
          'Intersection Observer': { status: 'passed' },
          WebSocket: { status: 'warning', message: 'Connection issues' },
        },
        performance: {
          score: 91,
          metrics: { fcp: 1.6, lcp: 2.8, fid: 15, cls: 0.12 },
        },
      },
      {
        browser: 'Edge',
        version: '121.0',
        platform: 'Windows',
        status: 'passed',
        features: {
          'CSS Grid': { status: 'passed' },
          Flexbox: { status: 'passed' },
          'ES6 Modules': { status: 'passed' },
          'Service Worker': { status: 'passed' },
          'Web Components': { status: 'passed' },
          'CSS Variables': { status: 'passed' },
          'Intersection Observer': { status: 'passed' },
          WebSocket: { status: 'passed' },
        },
        performance: {
          score: 95,
          metrics: { fcp: 1.3, lcp: 2.2, fid: 9, cls: 0.06 },
        },
      },
      {
        browser: 'Chrome Mobile',
        version: '121.0',
        platform: 'Android',
        status: 'passed',
        features: {
          'CSS Grid': { status: 'passed' },
          Flexbox: { status: 'passed' },
          'ES6 Modules': { status: 'passed' },
          'Service Worker': { status: 'passed' },
          'Web Components': { status: 'passed' },
          'CSS Variables': { status: 'passed' },
          'Intersection Observer': { status: 'passed' },
          WebSocket: { status: 'passed' },
        },
        performance: {
          score: 88,
          metrics: { fcp: 2.1, lcp: 3.5, fid: 25, cls: 0.15 },
        },
      },
      {
        browser: 'Safari Mobile',
        version: '17.2',
        platform: 'iOS',
        status: 'warning',
        features: {
          'CSS Grid': { status: 'passed' },
          Flexbox: { status: 'passed' },
          'ES6 Modules': { status: 'passed' },
          'Service Worker': { status: 'warning', message: 'iOS limitations' },
          'Web Components': { status: 'warning', message: 'Partial support' },
          'CSS Variables': { status: 'passed' },
          'Intersection Observer': { status: 'passed' },
          WebSocket: { status: 'warning', message: 'Background restrictions' },
        },
        performance: {
          score: 86,
          metrics: { fcp: 2.3, lcp: 3.8, fid: 30, cls: 0.18 },
        },
      },
    ],
    compatibilityScore: 92.5,
    criticalIssues: 2,
    totalTests: 48,
    passedTests: 44,
    lastTestRun: new Date().toISOString(),
  });

  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedBrowser, setSelectedBrowser] = useState<string | null>(null);

  const runCrossBrowserTests = async () => {
    setIsRunningTests(true);

    toast({
      title: 'テスト開始',
      description: 'クロスブラウザテストを実行しています...',
      variant: 'default',
    });

    // シミュレートされたテスト実行
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // テスト結果の更新
    setTestData((prev) => ({
      ...prev,
      lastTestRun: new Date().toISOString(),
      compatibilityScore: Math.min(prev.compatibilityScore + 1, 100),
      passedTests: prev.passedTests + 1,
    }));

    setIsRunningTests(false);

    toast({
      title: 'テスト完了',
      description: 'クロスブラウザテストが正常に完了しました',
      variant: 'default',
    });
  };

  const getBrowserIcon = (browser: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      Chrome: <Chrome className="h-4 w-4" />,
      Firefox: <Wifi className="h-4 w-4" />,
      Safari: <Monitor className="h-4 w-4" />,
      Edge: <Settings className="h-4 w-4" />,
      'Chrome Mobile': <Smartphone className="h-4 w-4" />,
      'Safari Mobile': <Smartphone className="h-4 w-4" />,
    };
    return iconMap[browser] || <Monitor className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'testing':
        return <Eye className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <Bug className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
      passed: 'default',
      failed: 'destructive',
      warning: 'secondary',
      testing: 'outline',
    };

    const labels: Record<string, string> = {
      passed: '成功',
      failed: '失敗',
      warning: '警告',
      testing: 'テスト中',
    };

    return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatLastTestRun = () => {
    const date = new Date(testData.lastTestRun);
    return date.toLocaleString('ja-JP');
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            🎨 クロスブラウザテストダッシュボード
          </h2>
          <p className="text-muted-foreground">全ブラウザでの互換性とパフォーマンステスト</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runCrossBrowserTests} disabled={isRunningTests} variant="default">
            {isRunningTests ? (
              <Zap className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Monitor className="h-4 w-4 mr-2" />
            )}
            {isRunningTests ? 'テスト実行中...' : 'テスト実行'}
          </Button>
        </div>
      </div>

      {/* サマリーメトリクス */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">互換性スコア</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testData.compatibilityScore}%</div>
            <Progress value={testData.compatibilityScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">テスト成功率</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((testData.passedTests / testData.totalTests) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {testData.passedTests}/{testData.totalTests} テスト
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">重要な問題</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{testData.criticalIssues}</div>
            <p className="text-xs text-muted-foreground">対応が必要</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">最終テスト</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{formatLastTestRun()}</div>
            <p className="text-xs text-muted-foreground">自動テスト実行中</p>
          </CardContent>
        </Card>
      </div>

      {/* タブコンテンツ */}
      <Tabs defaultValue="browsers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="browsers">ブラウザ状況</TabsTrigger>
          <TabsTrigger value="features">機能互換性</TabsTrigger>
          <TabsTrigger value="performance">パフォーマンス</TabsTrigger>
          <TabsTrigger value="issues">問題レポート</TabsTrigger>
        </TabsList>

        <TabsContent value="browsers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {testData.browsers.map((browser, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedBrowser(browser.browser)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {getBrowserIcon(browser.browser)}
                    {browser.browser}
                  </CardTitle>
                  {getStatusIcon(browser.status)}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">バージョン</span>
                      <Badge variant="outline">{browser.version}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">プラットフォーム</span>
                      <span className="text-xs">{browser.platform}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">ステータス</span>
                      {getStatusBadge(browser.status)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">パフォーマンス</span>
                      <span
                        className={`text-sm font-bold ${getPerformanceColor(browser.performance.score)}`}
                      >
                        {browser.performance.score}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>機能互換性マトリクス</CardTitle>
              <CardDescription>各ブラウザでの機能サポート状況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">機能</th>
                      {testData.browsers.map((browser, index) => (
                        <th key={index} className="text-center p-2">
                          <div className="flex items-center justify-center gap-1">
                            {getBrowserIcon(browser.browser)}
                            <span className="hidden md:inline">{browser.browser}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(testData.browsers[0].features).map((feature) => (
                      <tr key={feature} className="border-b">
                        <td className="p-2 font-medium">{feature}</td>
                        {testData.browsers.map((browser, index) => (
                          <td key={index} className="text-center p-2">
                            {getStatusIcon(browser.features[feature].status)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>パフォーマンススコア</CardTitle>
                <CardDescription>各ブラウザでのパフォーマンス評価</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testData.browsers.map((browser, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getBrowserIcon(browser.browser)}
                          <span className="text-sm font-medium">{browser.browser}</span>
                        </div>
                        <span
                          className={`font-bold ${getPerformanceColor(browser.performance.score)}`}
                        >
                          {browser.performance.score}
                        </span>
                      </div>
                      <Progress value={browser.performance.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
                <CardDescription>重要なパフォーマンス指標</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['fcp', 'lcp', 'fid', 'cls'].map((metric) => {
                    const avgValue =
                      testData.browsers.reduce(
                        (sum, browser) =>
                          sum +
                          browser.performance.metrics[
                            metric as keyof typeof browser.performance.metrics
                          ],
                        0
                      ) / testData.browsers.length;

                    const metricNames: Record<string, string> = {
                      fcp: 'First Contentful Paint',
                      lcp: 'Largest Contentful Paint',
                      fid: 'First Input Delay',
                      cls: 'Cumulative Layout Shift',
                    };

                    return (
                      <div key={metric} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{metricNames[metric]}</span>
                        <Badge variant="outline">
                          {metric === 'cls'
                            ? avgValue.toFixed(3)
                            : metric === 'fid'
                              ? `${avgValue.toFixed(0)}ms`
                              : `${avgValue.toFixed(1)}s`}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>検出された問題</CardTitle>
              <CardDescription>修正が必要な互換性問題</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testData.browsers
                  .filter((browser) => browser.status !== 'passed')
                  .map((browser, index) => {
                    const issues = Object.entries(browser.features).filter(
                      ([, feature]) => feature.status !== 'passed'
                    );

                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          {getBrowserIcon(browser.browser)}
                          <span className="font-medium">
                            {browser.browser} {browser.version}
                          </span>
                          {getStatusBadge(browser.status)}
                        </div>
                        <div className="space-y-2">
                          {issues.map(([feature, details]) => (
                            <div
                              key={feature}
                              className="flex justify-between items-center text-sm"
                            >
                              <span>{feature}</span>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(details.status)}
                                {details.message && (
                                  <span className="text-muted-foreground text-xs">
                                    {details.message}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                {testData.browsers.every((browser) => browser.status === 'passed') && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-green-600">すべてのテストに合格！</h3>
                    <p className="text-muted-foreground">
                      現在、重要な互換性問題は検出されていません。
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
