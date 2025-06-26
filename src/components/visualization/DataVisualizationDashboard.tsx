import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  BarChart3,
  LineChart,
  PieChart,
  Box,
  Play,
  Pause,
  Download,
  Settings,
  Maximize,
  RotateCcw,
  Zap,
  Eye,
  Layers,
  BookOpen,
  Activity,
  TrendingUp,
  AlertTriangle,
  Target,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// サービスのインポート（実際の実装時）
// import { interactiveChartService } from '@/services/visualization/InteractiveChartService';
// import { threeDVisualizationService } from '@/services/visualization/ThreeDVisualizationService';
// import { dataStorytellingService } from '@/services/visualization/DataStorytellingService';

interface DashboardState {
  activeTab: string;
  selectedChart: string | null;
  selected3DVisualization: string | null;
  selectedStory: string | null;
  isPlaying: boolean;
  realTimeEnabled: boolean;
  performanceMode: 'low' | 'medium' | 'high' | 'ultra';
}

interface ChartMetrics {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'loading' | 'error';
  dataPoints: number;
  renderTime: number;
  fps: number;
  memoryUsage: number;
}

interface VisualizationInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'prediction';
  title: string;
  description: string;
  significance: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
}

const DataVisualizationDashboard: React.FC = () => {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    activeTab: 'charts',
    selectedChart: null,
    selected3DVisualization: null,
    selectedStory: null,
    isPlaying: false,
    realTimeEnabled: false,
    performanceMode: 'medium',
  });

  const [chartMetrics, setChartMetrics] = useState<ChartMetrics[]>([]);
  const [insights, setInsights] = useState<VisualizationInsight[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeDashboard();
    setupRealTimeUpdates();
    return () => {
      cleanup();
    };
  }, []);

  /**
   * 📊 ダッシュボード初期化
   */
  const initializeDashboard = () => {
    // サンプルチャートメトリクス
    const sampleMetrics: ChartMetrics[] = [
      {
        id: 'productivity-trend',
        name: '生産性トレンド',
        type: 'line',
        status: 'active',
        dataPoints: 30,
        renderTime: 12.5,
        fps: 60,
        memoryUsage: 1024,
      },
      {
        id: 'task-distribution',
        name: 'タスク分布',
        type: 'pie',
        status: 'active',
        dataPoints: 6,
        renderTime: 8.3,
        fps: 60,
        memoryUsage: 512,
      },
      {
        id: 'performance-heatmap',
        name: 'パフォーマンスヒートマップ',
        type: 'heatmap',
        status: 'active',
        dataPoints: 168,
        renderTime: 25.7,
        fps: 45,
        memoryUsage: 2048,
      },
    ];

    // サンプルインサイト
    const sampleInsights: VisualizationInsight[] = [
      {
        id: 'insight1',
        type: 'trend',
        title: '生産性向上トレンド',
        description: '過去2週間で生産性が15%向上しています',
        significance: 'high',
        confidence: 0.87,
      },
      {
        id: 'insight2',
        type: 'anomaly',
        title: '異常値検出',
        description: '火曜日の午後に生産性の大幅な低下が見られます',
        significance: 'critical',
        confidence: 0.92,
      },
      {
        id: 'insight3',
        type: 'correlation',
        title: '相関関係発見',
        description: 'ポモドーロ使用率と生産性に強い正の相関があります',
        significance: 'medium',
        confidence: 0.78,
      },
    ];

    setChartMetrics(sampleMetrics);
    setInsights(sampleInsights);

    toast({
      title: 'ダッシュボード初期化完了',
      description: 'データビジュアライゼーションダッシュボードが準備できました',
      variant: 'default',
    });
  };

  /**
   * 🔄 リアルタイム更新設定
   */
  const setupRealTimeUpdates = () => {
    const interval = setInterval(() => {
      if (dashboardState.realTimeEnabled) {
        updateMetrics();
        generateNewInsights();
      }
    }, 5000);

    return () => clearInterval(interval);
  };

  /**
   * 📊 メトリクス更新
   */
  const updateMetrics = () => {
    setChartMetrics((prev) =>
      prev.map((metric) => ({
        ...metric,
        renderTime: metric.renderTime + (Math.random() - 0.5) * 2,
        fps: Math.max(30, Math.min(60, metric.fps + (Math.random() - 0.5) * 5)),
        memoryUsage: metric.memoryUsage + Math.floor((Math.random() - 0.5) * 100),
      }))
    );
  };

  /**
   * 💡 新しいインサイト生成
   */
  const generateNewInsights = () => {
    const newInsight: VisualizationInsight = {
      id: `insight_${Date.now()}`,
      type: ['trend', 'anomaly', 'correlation', 'prediction'][Math.floor(Math.random() * 4)] as any,
      title: `自動検出インサイト ${new Date().toLocaleTimeString()}`,
      description: 'リアルタイムデータ分析により新しいパターンが発見されました',
      significance: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
      confidence: Math.random() * 0.3 + 0.7,
    };

    setInsights((prev) => [newInsight, ...prev.slice(0, 4)]);
  };

  /**
   * 🎬 ストーリー再生
   */
  const playStory = async (storyId: string) => {
    setDashboardState((prev) => ({ ...prev, isPlaying: true, selectedStory: storyId }));

    try {
      // dataStorytellingService.playStory(storyId);

      toast({
        title: 'ストーリー再生開始',
        description: 'データストーリーテリングを開始しました',
        variant: 'default',
      });

      // 5秒後に自動停止（デモ用）
      setTimeout(() => {
        setDashboardState((prev) => ({ ...prev, isPlaying: false }));
      }, 5000);
    } catch (error) {
      toast({
        title: '再生エラー',
        description: 'ストーリーの再生に失敗しました',
        variant: 'destructive',
      });
    }
  };

  /**
   * 📤 チャートエクスポート
   */
  const exportChart = async (chartId: string, format: 'png' | 'svg' | 'pdf' | 'json') => {
    try {
      // const result = await interactiveChartService.exportChart(chartId, { format });

      toast({
        title: 'エクスポート完了',
        description: `チャートを${format.toUpperCase()}形式でエクスポートしました`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'エクスポートエラー',
        description: 'チャートのエクスポートに失敗しました',
        variant: 'destructive',
      });
    }
  };

  /**
   * 🔧 パフォーマンスモード変更
   */
  const changePerformanceMode = (mode: 'low' | 'medium' | 'high' | 'ultra') => {
    setDashboardState((prev) => ({ ...prev, performanceMode: mode }));

    toast({
      title: 'パフォーマンスモード変更',
      description: `パフォーマンスモードを${mode}に変更しました`,
      variant: 'default',
    });
  };

  /**
   * 🔄 リアルタイム切り替え
   */
  const toggleRealTime = () => {
    setDashboardState((prev) => ({
      ...prev,
      realTimeEnabled: !prev.realTimeEnabled,
    }));

    toast({
      title: dashboardState.realTimeEnabled ? 'リアルタイム停止' : 'リアルタイム開始',
      description: `リアルタイム更新を${dashboardState.realTimeEnabled ? '停止' : '開始'}しました`,
      variant: 'default',
    });
  };

  /**
   * 🔄 クリーンアップ
   */
  const cleanup = () => {
    // リアルタイム更新停止
    // アニメーション停止
    // リソース解放
  };

  /**
   * 🎨 インサイトアイコン取得
   */
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="h-4 w-4" />;
      case 'anomaly':
        return <AlertTriangle className="h-4 w-4" />;
      case 'correlation':
        return <Target className="h-4 w-4" />;
      case 'prediction':
        return <Eye className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  /**
   * 🎨 重要度色取得
   */
  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-black';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div
      className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50"
      ref={containerRef}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            データビジュアライゼーション
          </h1>
          <p className="text-gray-600 mt-1">
            インタラクティブチャート・3D可視化・データストーリーテリング
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={dashboardState.realTimeEnabled} onCheckedChange={toggleRealTime} />
            <span className="text-sm font-medium">リアルタイム</span>
          </div>

          <Select value={dashboardState.performanceMode} onValueChange={changePerformanceMode}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">低品質</SelectItem>
              <SelectItem value="medium">中品質</SelectItem>
              <SelectItem value="high">高品質</SelectItem>
              <SelectItem value="ultra">最高品質</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* メトリクス概要 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">アクティブチャート</p>
                <p className="text-2xl font-bold text-blue-600">{chartMetrics.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">データポイント</p>
                <p className="text-2xl font-bold text-green-600">
                  {chartMetrics
                    .reduce((sum, metric) => sum + metric.dataPoints, 0)
                    .toLocaleString()}
                </p>
              </div>
              <Box className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均FPS</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(
                    chartMetrics.reduce((sum, metric) => sum + metric.fps, 0) /
                      chartMetrics.length || 0
                  )}
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">インサイト</p>
                <p className="text-2xl font-bold text-orange-600">{insights.length}</p>
              </div>
              <Eye className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 可視化エリア */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>可視化エリア</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full p-0">
              <Tabs
                value={dashboardState.activeTab}
                onValueChange={(tab) => setDashboardState((prev) => ({ ...prev, activeTab: tab }))}
                className="h-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="charts" className="flex items-center gap-2">
                    <LineChart className="h-4 w-4" />
                    チャート
                  </TabsTrigger>
                  <TabsTrigger value="3d" className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    3D可視化
                  </TabsTrigger>
                  <TabsTrigger value="story" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    ストーリー
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="charts" className="h-full mt-0 p-4">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full border rounded-lg bg-white"
                    style={{ minHeight: '400px' }}
                  />
                </TabsContent>

                <TabsContent value="3d" className="h-full mt-0 p-4">
                  <div className="w-full h-full border rounded-lg bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Layers className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">3D可視化エリア</p>
                      <p className="text-sm opacity-75">Three.js 3D データ可視化</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="story" className="h-full mt-0 p-4">
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">データストーリー</h3>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => playStory('sample-story')}
                          disabled={dashboardState.isPlaying}
                        >
                          {dashboardState.isPlaying ? (
                            <Pause className="h-4 w-4 mr-1" />
                          ) : (
                            <Play className="h-4 w-4 mr-1" />
                          )}
                          {dashboardState.isPlaying ? '再生中' : '再生'}
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 border rounded-lg bg-white p-4 overflow-auto">
                      <div className="space-y-4">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-medium">シーン 1: 現状分析</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            現在の生産性レベルと傾向を確認しています...
                          </p>
                        </div>

                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-medium">シーン 2: パターン発見</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            生産性の高い時間帯と要因を特定しています...
                          </p>
                        </div>

                        <div className="border-l-4 border-orange-500 pl-4">
                          <h4 className="font-medium">シーン 3: 改善提案</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            データに基づく具体的な改善策を提示しています...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* サイドパネル */}
        <div className="space-y-6">
          {/* チャートリスト */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">アクティブチャート</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {chartMetrics.map((metric) => (
                <div
                  key={metric.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <p className="text-sm font-medium">{metric.name}</p>
                    <p className="text-xs text-gray-500">
                      {metric.type} • {metric.dataPoints}pts
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={metric.status === 'active' ? 'default' : 'secondary'}>
                      {metric.fps}fps
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => exportChart(metric.id, 'png')}>
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* インサイト */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">AIインサイト</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight) => (
                <div key={insight.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <span className="text-sm font-medium">{insight.title}</span>
                    </div>
                    <Badge className={getSignificanceColor(insight.significance)}>
                      {insight.significance}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      信頼度: {Math.round(insight.confidence * 100)}%
                    </span>
                    <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${insight.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* パフォーマンス */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">パフォーマンス</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {chartMetrics.map((metric) => (
                <div key={metric.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{metric.name}</span>
                    <span className="text-gray-500">{metric.renderTime.toFixed(1)}ms</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        metric.renderTime < 16
                          ? 'bg-green-500'
                          : metric.renderTime < 32
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, (metric.renderTime / 50) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataVisualizationDashboard;
