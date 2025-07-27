/**
 * 🧠 認知負荷監視ダッシュボード
 * リアルタイム認知負荷表示・UI適応状態管理・ADHD/ASD最適化制御
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from 'recharts';
import {
  Brain,
  Zap,
  Eye,
  Activity,
  Target,
  Settings,
  AlertTriangle,
  CheckCircle,
  Gauge,
  Monitor,
  Sliders,
  RefreshCw,
  Play,
  Pause,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Focus,
} from 'lucide-react';
import {
  realtimeCognitiveLoadMonitor,
  CognitiveLoadMetrics,
  CognitiveLoadLevel,
  CognitiveLoadAlert,
} from '@/services/cognitive/RealtimeCognitiveLoadMonitor';
import { useAdaptiveUI } from '@/components/adaptive/AdaptiveUISystem';

interface CognitiveLoadDashboardProps {
  userId?: string;
  autoStart?: boolean;
  compactMode?: boolean;
}

export const CognitiveLoadDashboard: React.FC<CognitiveLoadDashboardProps> = ({
  userId = 'demo-user',
  autoStart = true,
  compactMode = false,
}) => {
  const [currentMetrics, setCurrentMetrics] = useState<CognitiveLoadMetrics | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<CognitiveLoadMetrics[]>([]);
  const [alerts, setAlerts] = useState<CognitiveLoadAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [autoAdaptation, setAutoAdaptation] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'adaptation' | 'history'>(
    'overview'
  );

  // 適応UIフック
  const { adaptationState, currentTheme, setCustomAdaptation, resetAdaptations } = useAdaptiveUI();

  // 監視システムの初期化
  useEffect(() => {
    if (autoStart) {
      startMonitoring();
    }

    // イベントリスナーの設定
    const handleMetricsCalculated = (metrics: CognitiveLoadMetrics) => {
      setCurrentMetrics(metrics);
      setMetricsHistory((prev) => {
        const newHistory = [...prev, metrics];
        return newHistory.slice(-50); // 最新50件のみ保持
      });
    };

    const handleAlert = (alert: CognitiveLoadAlert) => {
      setAlerts((prev) => {
        const newAlerts = [alert, ...prev];
        return newAlerts.slice(0, 10); // 最新10件のみ保持
      });
    };

    const handleMonitoringStarted = () => {
      setIsMonitoring(true);
    };

    const handleMonitoringStopped = () => {
      setIsMonitoring(false);
    };

    realtimeCognitiveLoadMonitor.on('cognitiveLoadCalculated', handleMetricsCalculated);
    realtimeCognitiveLoadMonitor.on('cognitiveLoadAlert', handleAlert);
    realtimeCognitiveLoadMonitor.on('monitoringStarted', handleMonitoringStarted);
    realtimeCognitiveLoadMonitor.on('monitoringStopped', handleMonitoringStopped);

    return () => {
      realtimeCognitiveLoadMonitor.off('cognitiveLoadCalculated', handleMetricsCalculated);
      realtimeCognitiveLoadMonitor.off('cognitiveLoadAlert', handleAlert);
      realtimeCognitiveLoadMonitor.off('monitoringStarted', handleMonitoringStarted);
      realtimeCognitiveLoadMonitor.off('monitoringStopped', handleMonitoringStopped);
    };
  }, [autoStart, userId]);

  const startMonitoring = () => {
    realtimeCognitiveLoadMonitor.startMonitoring(userId);
  };

  const stopMonitoring = () => {
    realtimeCognitiveLoadMonitor.stopMonitoring();
  };

  const toggleMonitoring = () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  const getLoadLevelColor = (level: CognitiveLoadLevel): string => {
    switch (level) {
      case 'minimal':
        return 'text-green-600 bg-green-50';
      case 'low':
        return 'text-blue-600 bg-blue-50';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getLoadLevelIcon = (level: CognitiveLoadLevel) => {
    switch (level) {
      case 'minimal':
        return <CheckCircle className="h-4 w-4" />;
      case 'low':
        return <Activity className="h-4 w-4" />;
      case 'moderate':
        return <Gauge className="h-4 w-4" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatMetricsForRadar = (metrics: CognitiveLoadMetrics) => {
    return [
      { subject: '注意力', value: metrics.attention.focusStability * 100 },
      { subject: '処理速度', value: metrics.processing.efficiency * 100 },
      { subject: 'ワーキングメモリ', value: metrics.workingMemory.capacity * 100 },
      { subject: '実行機能', value: metrics.executive.planning * 100 },
      { subject: '感覚処理', value: (1 - metrics.adhdFactors.sensoryOverload) * 100 },
      { subject: '衝動制御', value: (1 - metrics.adhdFactors.impulsivity) * 100 },
    ];
  };

  if (compactMode) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">認知負荷</span>
            </div>
            <div className="flex items-center gap-2">
              {currentMetrics && (
                <Badge className={getLoadLevelColor(currentMetrics.level)}>
                  {getLoadLevelIcon(currentMetrics.level)}
                  {currentMetrics.level}
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={toggleMonitoring}>
                {isMonitoring ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          {currentMetrics && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">総合負荷</span>
                <span className="text-sm font-bold">{currentMetrics.overall.toFixed(1)}/10</span>
              </div>
              <Progress value={(currentMetrics.overall / 10) * 100} className="h-2" />

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">注意力:</span>
                  <span className="ml-1 font-medium">
                    {Math.round(currentMetrics.attention.focusStability * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">処理:</span>
                  <span className="ml-1 font-medium">
                    {Math.round(currentMetrics.processing.efficiency * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            認知負荷リアルタイム監視
          </h2>
          <p className="text-gray-600 mt-1">ADHD/ASD特化認知負荷測定・適応的UI制御システム</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
            />
            <span className="text-sm text-gray-600">
              {isMonitoring ? 'リアルタイム監視中' : '監視停止中'}
            </span>
          </div>

          <Button
            variant={isMonitoring ? 'secondary' : 'default'}
            size="sm"
            onClick={toggleMonitoring}
          >
            {isMonitoring ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                停止
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                開始
              </>
            )}
          </Button>
        </div>
      </div>

      {/* アラート表示 */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 3).map((alert) => (
            <Alert
              key={alert.id}
              className={`border-l-4 ${
                alert.level === 'critical'
                  ? 'border-red-500 bg-red-50'
                  : alert.level === 'high'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-yellow-500 bg-yellow-50'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alert.message}</strong>
                {alert.recommendations.length > 0 && (
                  <ul className="mt-2 text-sm">
                    {alert.recommendations.map((rec, index) => (
                      <li key={index} className="ml-4">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* 現在の状態サマリー */}
      {currentMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">総合認知負荷</span>
                <Gauge className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {currentMetrics.overall.toFixed(1)}/10
              </div>
              <Badge className={`mt-2 ${getLoadLevelColor(currentMetrics.level)}`}>
                {getLoadLevelIcon(currentMetrics.level)}
                {currentMetrics.level}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">注意力</span>
                <Focus className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(currentMetrics.attention.focusStability * 100)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">フォーカス安定性</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">処理効率</span>
                <Zap className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(currentMetrics.processing.efficiency * 100)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">速度・精度・効率</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">ADHD影響</span>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(
                  ((currentMetrics.adhdFactors.hyperactivity +
                    currentMetrics.adhdFactors.inattention +
                    currentMetrics.adhdFactors.sensoryOverload) /
                    3) *
                    100
                )}
                %
              </div>
              <p className="text-xs text-gray-500 mt-1">多動・不注意・感覚</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* タブナビゲーション */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="details">詳細分析</TabsTrigger>
          <TabsTrigger value="adaptation">UI適応</TabsTrigger>
          <TabsTrigger value="history">履歴</TabsTrigger>
        </TabsList>

        {/* 概要タブ */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 認知機能レーダーチャート */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  認知機能プロファイル
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentMetrics && (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={formatMetricsForRadar(currentMetrics)}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="現在値"
                          dataKey="value"
                          stroke="#8B5CF6"
                          fill="#8B5CF6"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 時系列トレンド */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  認知負荷トレンド
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metricsHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                      />
                      <YAxis domain={[0, 10]} />
                      <Tooltip
                        labelFormatter={(time) => new Date(time).toLocaleString()}
                        formatter={(value: number) => [value.toFixed(2), '認知負荷']}
                      />
                      <Line
                        type="monotone"
                        dataKey="overall"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 詳細分析タブ */}
        <TabsContent value="details" className="space-y-6">
          {currentMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 注意力詳細 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">注意力機能</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>フォーカス安定性</span>
                      <span>{Math.round(currentMetrics.attention.focusStability * 100)}%</span>
                    </div>
                    <Progress value={currentMetrics.attention.focusStability * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>タスク切り替え</span>
                      <span>{Math.round(currentMetrics.attention.taskSwitching * 100)}%</span>
                    </div>
                    <Progress value={currentMetrics.attention.taskSwitching * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>注意散漫抵抗</span>
                      <span>
                        {Math.round(currentMetrics.attention.distractionResistance * 100)}%
                      </span>
                    </div>
                    <Progress value={currentMetrics.attention.distractionResistance * 100} />
                  </div>
                </CardContent>
              </Card>

              {/* 処理速度詳細 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">処理機能</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>処理速度</span>
                      <span>{Math.round(currentMetrics.processing.speed * 100)}%</span>
                    </div>
                    <Progress value={currentMetrics.processing.speed * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>精度</span>
                      <span>{Math.round(currentMetrics.processing.accuracy * 100)}%</span>
                    </div>
                    <Progress value={currentMetrics.processing.accuracy * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>効率性</span>
                      <span>{Math.round(currentMetrics.processing.efficiency * 100)}%</span>
                    </div>
                    <Progress value={currentMetrics.processing.efficiency * 100} />
                  </div>
                </CardContent>
              </Card>

              {/* ADHD要因詳細 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ADHD要因</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>多動性</span>
                      <span>{Math.round(currentMetrics.adhdFactors.hyperactivity * 100)}%</span>
                    </div>
                    <Progress value={currentMetrics.adhdFactors.hyperactivity * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>不注意</span>
                      <span>{Math.round(currentMetrics.adhdFactors.inattention * 100)}%</span>
                    </div>
                    <Progress value={currentMetrics.adhdFactors.inattention * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>衝動性</span>
                      <span>{Math.round(currentMetrics.adhdFactors.impulsivity * 100)}%</span>
                    </div>
                    <Progress value={currentMetrics.adhdFactors.impulsivity * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>感覚過負荷</span>
                      <span>{Math.round(currentMetrics.adhdFactors.sensoryOverload * 100)}%</span>
                    </div>
                    <Progress value={currentMetrics.adhdFactors.sensoryOverload * 100} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* UI適応タブ */}
        <TabsContent value="adaptation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 適応状態 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-blue-500" />
                  現在の適応状態
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-adaptation">自動適応</Label>
                  <Switch
                    id="auto-adaptation"
                    checked={autoAdaptation}
                    onCheckedChange={setAutoAdaptation}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">簡略化レイアウト</span>
                    <Badge
                      variant={
                        adaptationState.adaptations.simplifiedLayout ? 'default' : 'secondary'
                      }
                    >
                      {adaptationState.adaptations.simplifiedLayout ? '有効' : '無効'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">アニメーション削減</span>
                    <Badge
                      variant={
                        adaptationState.adaptations.reducedAnimations ? 'default' : 'secondary'
                      }
                    >
                      {adaptationState.adaptations.reducedAnimations ? '有効' : '無効'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">コントラスト増強</span>
                    <Badge
                      variant={
                        adaptationState.adaptations.increasedContrast ? 'default' : 'secondary'
                      }
                    >
                      {adaptationState.adaptations.increasedContrast ? '有効' : '無効'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">大きなタッチターゲット</span>
                    <Badge
                      variant={adaptationState.adaptations.largerTargets ? 'default' : 'secondary'}
                    >
                      {adaptationState.adaptations.largerTargets ? '有効' : '無効'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">フォーカスモード</span>
                    <Badge
                      variant={adaptationState.adaptations.focusMode ? 'default' : 'secondary'}
                    >
                      {adaptationState.adaptations.focusMode ? '有効' : '無効'}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button variant="outline" size="sm" onClick={resetAdaptations} className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    適応をリセット
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 手動制御 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-green-500" />
                  手動制御
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {Object.entries(adaptationState.adaptations).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key} className="text-sm">
                        {key === 'simplifiedLayout' && '簡略化レイアウト'}
                        {key === 'reducedAnimations' && 'アニメーション削減'}
                        {key === 'increasedContrast' && 'コントラスト増強'}
                        {key === 'largerTargets' && 'タッチターゲット拡大'}
                        {key === 'focusMode' && 'フォーカスモード'}
                        {key === 'calmColors' && '落ち着いた色調'}
                        {key === 'reducedOptions' && '選択肢削減'}
                        {key === 'visualCues' && '視覚的手がかり'}
                      </Label>
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => setCustomAdaptation({ [key]: checked })}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 履歴タブ */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-500" />
                認知負荷履歴（過去1時間）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metricsHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                    />
                    <YAxis domain={[0, 10]} />
                    <Tooltip labelFormatter={(time) => new Date(time).toLocaleString()} />
                    <Area
                      type="monotone"
                      dataKey="overall"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                      name="総合認知負荷"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* アラート履歴 */}
          {alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>アラート履歴</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getLoadLevelColor(alert.level)}>
                          {getLoadLevelIcon(alert.level)}
                          {alert.level}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {alert.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{alert.message}</p>
                      {alert.recommendations.length > 0 && (
                        <ul className="mt-2 text-xs text-gray-600">
                          {alert.recommendations.map((rec, index) => (
                            <li key={index} className="ml-4">
                              • {rec}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CognitiveLoadDashboard;
