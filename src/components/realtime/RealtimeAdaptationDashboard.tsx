/**
 * 📊 リアルタイム適応ダッシュボード
 * 認知状態とシステム適応の可視化
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useRealtimeAdaptation,
  useCognitiveMonitoring,
  useSessionStats,
} from './RealtimeAdaptationProvider';
import {
  Brain,
  Activity,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Play,
  Pause,
  BarChart3,
  Settings,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Lightbulb,
  Sparkles,
  Coffee,
  RefreshCw,
} from 'lucide-react';

export const RealtimeAdaptationDashboard: React.FC = () => {
  const { state, isTracking, startTracking, stopTracking, addAdaptationEvent, updateUserResponse } =
    useRealtimeAdaptation();

  const cognitiveMetrics = useCognitiveMonitoring();
  const sessionStats = useSessionStats();
  const [selectedTab, setSelectedTab] = useState('overview');

  // 認知状態の色とアイコンを取得
  const getCognitiveColor = (value: number, inverse = false) => {
    if (inverse) {
      if (value < 30) return 'text-green-600 bg-green-100';
      if (value < 60) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    } else {
      if (value >= 70) return 'text-green-600 bg-green-100';
      if (value >= 40) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleRecommendationResponse = (eventIndex: number, response: 'accepted' | 'dismissed') => {
    updateUserResponse(eventIndex, response);

    addAdaptationEvent({
      type: 'recommendation',
      trigger: 'user_feedback',
      action: `ユーザー応答: ${response}`,
      impact: 'low',
    });
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            リアルタイム適応システム
          </h1>
          <p className="text-gray-600 mt-1">認知状態の監視とUI自動最適化システム</p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={isTracking ? 'default' : 'secondary'} className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {isTracking ? '追跡中' : '停止中'}
          </Badge>

          <Button
            onClick={isTracking ? stopTracking : startTracking}
            variant={isTracking ? 'outline' : 'default'}
            size="sm"
            className="flex items-center gap-2"
          >
            {isTracking ? (
              <>
                <Pause className="h-4 w-4" />
                停止
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                開始
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 状態アラート */}
      {cognitiveMetrics.needsBreak && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">休憩をお勧めします</AlertTitle>
          <AlertDescription className="text-orange-700">
            認知負荷が高くなっています。5-10分の休憩を取ることで集中力を回復できます。
          </AlertDescription>
        </Alert>
      )}

      {cognitiveMetrics.isOptimal && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">最適な状態です</AlertTitle>
          <AlertDescription className="text-green-700">
            現在の認知状態は非常に良好です。この調子で作業を継続しましょう！
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="cognitive">認知状態</TabsTrigger>
          <TabsTrigger value="adaptations">適応履歴</TabsTrigger>
          <TabsTrigger value="session">セッション</TabsTrigger>
        </TabsList>

        {/* 概要タブ */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 注意力レベル */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">注意力</CardTitle>
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{state.cognitiveState.attention}%</div>
                  <Progress value={state.cognitiveState.attention} className="h-2" />
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    {getTrendIcon(state.cognitiveState.trend)}
                    <span className="capitalize">{state.cognitiveState.trend}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* エネルギーレベル */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">エネルギー</CardTitle>
                  <Zap className="h-4 w-4 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{state.cognitiveState.energy}%</div>
                  <Progress value={state.cognitiveState.energy} className="h-2" />
                  <div
                    className={`text-xs px-2 py-1 rounded ${getCognitiveColor(state.cognitiveState.energy)}`}
                  >
                    {state.cognitiveState.energy >= 70
                      ? '高'
                      : state.cognitiveState.energy >= 40
                        ? '中'
                        : '低'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ストレスレベル */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">ストレス</CardTitle>
                  <Activity className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{state.cognitiveState.stress}%</div>
                  <Progress value={state.cognitiveState.stress} className="h-2" />
                  <div
                    className={`text-xs px-2 py-1 rounded ${getCognitiveColor(state.cognitiveState.stress, true)}`}
                  >
                    {state.cognitiveState.stress < 30
                      ? '低'
                      : state.cognitiveState.stress < 60
                        ? '中'
                        : '高'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 認知負荷 */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">認知負荷</CardTitle>
                  <Brain className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{state.cognitiveState.cognitiveLoad}%</div>
                  <Progress value={state.cognitiveState.cognitiveLoad} className="h-2" />
                  <div
                    className={`text-xs px-2 py-1 rounded ${getCognitiveColor(state.cognitiveState.cognitiveLoad, true)}`}
                  >
                    {state.cognitiveState.cognitiveLoad < 40
                      ? '軽'
                      : state.cognitiveState.cognitiveLoad < 70
                        ? '中'
                        : '重'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 推奨事項 */}
          {state.currentRecommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  現在の推奨事項
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {state.currentRecommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                    >
                      <span className="text-sm text-yellow-800">{recommendation}</span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRecommendationResponse(index, 'accepted')}
                          className="text-xs"
                        >
                          適用
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRecommendationResponse(index, 'dismissed')}
                          className="text-xs"
                        >
                          閉じる
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 認知状態タブ */}
        <TabsContent value="cognitive" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 詳細メトリクス */}
            <Card>
              <CardHeader>
                <CardTitle>詳細認知メトリクス</CardTitle>
                <CardDescription>現在の認知状態の詳細分析</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">フロー状態</span>
                    <span className="text-sm text-gray-600">{state.cognitiveState.flow}%</span>
                  </div>
                  <Progress value={state.cognitiveState.flow} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">推定信頼度</span>
                    <span className="text-sm text-gray-600">
                      {Math.round(state.cognitiveState.confidence * 100)}%
                    </span>
                  </div>
                  <Progress value={state.cognitiveState.confidence * 100} className="h-2" />
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">状態診断</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {cognitiveMetrics.isOptimal ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      )}
                      <span className="text-sm">
                        {cognitiveMetrics.isOptimal ? '最適状態' : '調整が必要'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {cognitiveMetrics.needsBreak ? (
                        <Coffee className="h-4 w-4 text-orange-600" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-blue-600" />
                      )}
                      <span className="text-sm">
                        {cognitiveMetrics.needsBreak ? '休憩推奨' : '作業継続可能'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* トレンドチャート */}
            <Card>
              <CardHeader>
                <CardTitle>認知状態トレンド</CardTitle>
                <CardDescription>時間経過による変化の傾向</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">トレンドチャート</p>
                    <p className="text-xs">（実装予定）</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 適応履歴タブ */}
        <TabsContent value="adaptations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>システム適応履歴</CardTitle>
              <CardDescription>実行されたUI調整と推奨事項の履歴</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {state.adaptationHistory
                  .slice(-10)
                  .reverse()
                  .map((event, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {event.type === 'ui_adjustment' && (
                          <Settings className="h-4 w-4 text-blue-600" />
                        )}
                        {event.type === 'recommendation' && (
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                        )}
                        {event.type === 'warning' && (
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                        )}
                        {event.type === 'celebration' && (
                          <Sparkles className="h-4 w-4 text-green-600" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{event.action}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {event.impact}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {event.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">トリガー: {event.trigger}</div>
                        {event.userResponse && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            ユーザー応答: {event.userResponse}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}

                {state.adaptationHistory.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="h-8 w-8 mx-auto mb-2" />
                    <p>まだ適応イベントがありません</p>
                    <p className="text-sm">システムが学習を開始するまでお待ちください</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* セッションタブ */}
        <TabsContent value="session" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  セッション時間
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sessionStats.duration}分</div>
                <div className="text-xs text-gray-600">継続時間</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  操作回数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sessionStats.interactions}</div>
                <div className="text-xs text-gray-600">総操作数</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  適応回数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sessionStats.adaptations}</div>
                <div className="text-xs text-gray-600">UI調整実行</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>セッション統計</CardTitle>
              <CardDescription>現在のセッションの詳細データ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">平均認知状態</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>注意力</span>
                      <span>{sessionStats.averageAttention}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>エネルギー</span>
                      <span>{sessionStats.averageEnergy}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">最近のイベント</h4>
                  <div className="space-y-1">
                    {sessionStats.recentEvents.map((event, index) => (
                      <div key={index} className="text-xs text-gray-600">
                        {event.timestamp.toLocaleTimeString()}: {event.action}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealtimeAdaptationDashboard;
