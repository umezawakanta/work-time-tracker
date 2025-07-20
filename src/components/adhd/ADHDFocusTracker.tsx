import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import adhdService from '@/services/adhdService';
import adhdTodoIntegration, { ADHDTaskRecommendation } from '@/services/adhdTodoIntegrationService';
import {
  Brain,
  Heart,
  Zap,
  Eye,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Target,
  Activity,
  Coffee,
} from 'lucide-react';

interface FocusMetrics {
  attention: number; // 注意力 (0-100)
  concentration: number; // 集中度 (0-100)
  distraction: number; // 散漫度 (0-100)
  energy: number; // エネルギーレベル (0-100)
  mood: number; // 気分 (0-100)
}

interface FocusState {
  isActive: boolean;
  startTime: Date | null;
  currentMetrics: FocusMetrics;
  sessionId: string | null;
  interruptionCount: number;
  lastCheckTime: Date;
  focusHistory: { timestamp: Date; metrics: FocusMetrics }[];
}

interface FocusRecommendation {
  type: 'break' | 'technique' | 'environment' | 'task-switch';
  urgency: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  actions: string[];
  estimatedBenefit: number; // 0-100
}

export const ADHDFocusTracker: React.FC = () => {
  const [focusState, setFocusState] = useState<FocusState>({
    isActive: false,
    startTime: null,
    currentMetrics: {
      attention: 70,
      concentration: 70,
      distraction: 30,
      energy: 70,
      mood: 70,
    },
    sessionId: null,
    interruptionCount: 0,
    lastCheckTime: new Date(),
    focusHistory: [],
  });

  const [recommendations, setRecommendations] = useState<FocusRecommendation[]>([]);
  const [taskRecommendations, setTaskRecommendations] = useState<ADHDTaskRecommendation[]>([]);
  const [showDetailedMetrics, setShowDetailedMetrics] = useState(false);
  const [isAutoTracking, setIsAutoTracking] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 自動トラッキング
  useEffect(() => {
    if (isAutoTracking) {
      checkIntervalRef.current = setInterval(() => {
        checkFocusState();
      }, 30000); // 30秒ごと
    } else {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isAutoTracking]);

  // 集中セッション開始
  const startTracking = useCallback(() => {
    const session = adhdService.startSession('集中度トラッキング');
    setFocusState((prev) => ({
      ...prev,
      isActive: true,
      startTime: new Date(),
      sessionId: session.id,
      interruptionCount: 0,
    }));

    // 初期レコメンデーション生成
    generateRecommendations(focusState.currentMetrics);
    updateTaskRecommendations();
  }, [focusState.currentMetrics]);

  // 集中セッション終了
  const stopTracking = useCallback(() => {
    if (focusState.sessionId) {
      const session = adhdService.getSessions().find((s) => s.id === focusState.sessionId);
      if (session) {
        adhdService.endSession({
          ...session,
          thoughtsChecked: focusState.interruptionCount,
          realityScore: calculateOverallFocusScore(focusState.currentMetrics),
          mood: getMoodFromScore(focusState.currentMetrics.mood),
          energy: getEnergyFromScore(focusState.currentMetrics.energy),
        });
      }
    }

    setFocusState((prev) => ({
      ...prev,
      isActive: false,
      startTime: null,
      sessionId: null,
    }));
  }, [focusState.sessionId, focusState.interruptionCount, focusState.currentMetrics]);

  // 集中状態チェック
  const checkFocusState = useCallback(() => {
    if (!focusState.isActive) return;

    // 簡易的な集中度計算（実際の実装では、マウス操作、キーボード入力、アプリケーション切り替えなどを監視）
    const newMetrics = calculateFocusMetrics();

    setFocusState((prev) => ({
      ...prev,
      currentMetrics: newMetrics,
      lastCheckTime: new Date(),
      focusHistory: [
        ...prev.focusHistory.slice(-19), // 最新20件を保持
        { timestamp: new Date(), metrics: newMetrics },
      ],
    }));

    // レコメンデーション更新
    generateRecommendations(newMetrics);

    // アラート判定
    if (alertsEnabled) {
      checkForAlerts(newMetrics);
    }
  }, [focusState.isActive, alertsEnabled]);

  // 集中度メトリクス計算（簡易版）
  const calculateFocusMetrics = (): FocusMetrics => {
    // 実際の実装では、デバイスセンサー、ユーザー行動、時間経過などを考慮
    const timeElapsed = focusState.startTime
      ? (new Date().getTime() - focusState.startTime.getTime()) / (1000 * 60) // 分
      : 0;

    // 時間経過による集中度の自然な低下
    const timeDecay = Math.max(0, 100 - timeElapsed * 2);

    // ランダムな変動（実際は実際のデータ）
    const variation = () => Math.random() * 20 - 10; // -10 to +10

    const baseAttention = Math.max(0, Math.min(100, 80 + variation()));
    const baseConcentration = Math.max(0, Math.min(100, timeDecay + variation()));
    const baseDistraction = Math.max(0, Math.min(100, 30 + timeElapsed * 1.5 + variation()));
    const baseEnergy = Math.max(0, Math.min(100, 80 - timeElapsed * 1 + variation()));
    const baseMood = Math.max(0, Math.min(100, focusState.currentMetrics.mood + variation()));

    return {
      attention: baseAttention,
      concentration: baseConcentration,
      distraction: baseDistraction,
      energy: baseEnergy,
      mood: baseMood,
    };
  };

  // レコメンデーション生成
  const generateRecommendations = useCallback(
    (metrics: FocusMetrics) => {
      const recommendations: FocusRecommendation[] = [];

      // 集中度が低い場合
      if (metrics.concentration < 60) {
        recommendations.push({
          type: 'technique',
          urgency: 'medium',
          title: '集中力向上テクニック',
          description: '集中度が低下しています。呼吸法で集中力を回復しましょう。',
          actions: ['4-7-8呼吸法を3回', '5分間瞑想', 'デスクトップを整理'],
          estimatedBenefit: 75,
        });
      }

      // 散漫度が高い場合
      if (metrics.distraction > 70) {
        recommendations.push({
          type: 'environment',
          urgency: 'high',
          title: '環境改善',
          description: '注意散漫な状態です。環境を整えましょう。',
          actions: ['通知をオフ', '不要なタブを閉じる', '静かな場所に移動'],
          estimatedBenefit: 80,
        });
      }

      // エネルギーが低い場合
      if (metrics.energy < 50) {
        recommendations.push({
          type: 'break',
          urgency: 'medium',
          title: 'エネルギー回復',
          description: 'エネルギーレベルが低下しています。短い休憩を取りましょう。',
          actions: ['5分間散歩', '水分補給', '軽いストレッチ'],
          estimatedBenefit: 70,
        });
      }

      // 長時間作業している場合
      const timeElapsed = focusState.startTime
        ? (new Date().getTime() - focusState.startTime.getTime()) / (1000 * 60)
        : 0;

      if (timeElapsed > 25) {
        recommendations.push({
          type: 'break',
          urgency: 'high',
          title: 'ポモドーロ休憩',
          description: '25分経過しました。休憩時間です。',
          actions: ['5分間完全休憩', '目を休める', '深呼吸'],
          estimatedBenefit: 90,
        });
      }

      // 総合スコアが低い場合
      const overallScore = calculateOverallFocusScore(metrics);
      if (overallScore < 50) {
        recommendations.push({
          type: 'task-switch',
          urgency: 'medium',
          title: 'タスク変更',
          description:
            '現在のタスクでの集中が困難です。別のタスクに切り替えることを検討しましょう。',
          actions: ['より簡単なタスクに変更', '環境を変える', '休憩後に再開'],
          estimatedBenefit: 65,
        });
      }

      setRecommendations(
        recommendations.sort((a, b) => {
          const urgencyOrder = { high: 3, medium: 2, low: 1 };
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        })
      );
    },
    [focusState.startTime]
  );

  // タスクレコメンデーション更新
  const updateTaskRecommendations = useCallback(() => {
    const tasks = adhdTodoIntegration.getTasks();
    const currentMood = getMoodFromScore(focusState.currentMetrics.mood);
    const currentEnergy = getEnergyFromScore(focusState.currentMetrics.energy);
    const availableMinutes = 25; // ポモドーロタイマー想定

    const taskRecs = adhdTodoIntegration.getTaskRecommendations(
      tasks,
      currentMood,
      currentEnergy,
      availableMinutes
    );

    setTaskRecommendations(taskRecs);
  }, [focusState.currentMetrics]);

  // アラート判定
  const checkForAlerts = useCallback(
    (metrics: FocusMetrics) => {
      const overallScore = calculateOverallFocusScore(metrics);

      if (overallScore < 40 && alertTimeoutRef.current === null) {
        // 集中度が著しく低下した場合のアラート
        alertTimeoutRef.current = setTimeout(() => {
          if (alertsEnabled) {
            alert('🧠 集中度が低下しています。休憩を取るか、環境を変えることをお勧めします。');
          }
          alertTimeoutRef.current = null;
        }, 5000); // 5秒後にアラート
      }
    },
    [alertsEnabled]
  );

  // メトリクス手動更新
  const updateMetric = (metric: keyof FocusMetrics, value: number) => {
    setFocusState((prev) => ({
      ...prev,
      currentMetrics: {
        ...prev.currentMetrics,
        [metric]: value,
      },
    }));

    // レコメンデーション再生成
    const newMetrics = { ...focusState.currentMetrics, [metric]: value };
    generateRecommendations(newMetrics);
  };

  // 中断記録
  const recordInterruption = () => {
    setFocusState((prev) => ({
      ...prev,
      interruptionCount: prev.interruptionCount + 1,
    }));

    // 思考記録として保存
    adhdService.saveThought({
      content: '作業中断が発生しました',
      type: 'worry',
      score: 3,
    });
  };

  // ヘルパー関数
  const calculateOverallFocusScore = (metrics: FocusMetrics): number => {
    return Math.round(
      metrics.attention * 0.3 +
        metrics.concentration * 0.4 +
        (100 - metrics.distraction) * 0.2 +
        metrics.energy * 0.1
    );
  };

  const getMoodFromScore = (
    score: number
  ): 'very-low' | 'low' | 'normal' | 'good' | 'excellent' => {
    if (score < 20) return 'very-low';
    if (score < 40) return 'low';
    if (score < 60) return 'normal';
    if (score < 80) return 'good';
    return 'excellent';
  };

  const getEnergyFromScore = (
    score: number
  ): 'very-low' | 'low' | 'normal' | 'high' | 'very-high' => {
    if (score < 20) return 'very-low';
    if (score < 40) return 'low';
    if (score < 60) return 'normal';
    if (score < 80) return 'high';
    return 'very-high';
  };

  const getMetricColor = (value: number, invert = false): string => {
    const threshold = invert ? 100 - value : value;
    if (threshold >= 70) return 'text-green-600';
    if (threshold >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricBgColor = (value: number, invert = false): string => {
    const threshold = invert ? 100 - value : value;
    if (threshold >= 70) return 'bg-green-100 border-green-200';
    if (threshold >= 50) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-2">
          <Activity className="h-8 w-8 text-blue-600" />
          ADHD集中度トラッカー
        </h1>
        <p className="text-gray-600">リアルタイムで集中状態を監視し、最適化提案を行います</p>
      </div>

      {/* コントロールパネル */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              集中セッション制御
            </div>
            <div className="flex gap-2">
              <Button
                variant={isAutoTracking ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsAutoTracking(!isAutoTracking)}
              >
                {isAutoTracking ? 'オート' : 'マニュアル'}
              </Button>
              <Button
                variant={alertsEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAlertsEnabled(!alertsEnabled)}
              >
                アラート {alertsEnabled ? 'ON' : 'OFF'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4">
            {!focusState.isActive ? (
              <Button
                onClick={startTracking}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                size="lg"
              >
                <PlayCircle className="h-5 w-5 mr-2" />
                集中トラッキング開始
              </Button>
            ) : (
              <>
                <Button
                  onClick={stopTracking}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3"
                  size="lg"
                >
                  <PauseCircle className="h-5 w-5 mr-2" />
                  セッション終了
                </Button>
                <Button
                  onClick={recordInterruption}
                  variant="outline"
                  className="px-6 py-3"
                  size="lg"
                >
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  中断記録
                </Button>
              </>
            )}
          </div>

          {focusState.isActive && focusState.startTime && (
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-600">セッション時間</div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.floor((new Date().getTime() - focusState.startTime.getTime()) / (1000 * 60))}
                分
              </div>
              <div className="text-sm text-gray-500">
                中断回数: {focusState.interruptionCount}回
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 現在の集中度メトリクス */}
      <Card className={getMetricBgColor(calculateOverallFocusScore(focusState.currentMetrics))}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              現在の集中状態
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">総合スコア:</span>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {calculateOverallFocusScore(focusState.currentMetrics)}/100
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(focusState.currentMetrics).map(([key, value]) => (
              <div key={key} className="text-center">
                <div
                  className={`text-2xl font-bold ${getMetricColor(value, key === 'distraction')}`}
                >
                  {Math.round(value)}
                </div>
                <div className="text-sm text-gray-600 capitalize">
                  {key === 'attention'
                    ? '注意力'
                    : key === 'concentration'
                      ? '集中度'
                      : key === 'distraction'
                        ? '散漫度'
                        : key === 'energy'
                          ? 'エネルギー'
                          : '気分'}
                </div>
                <Progress
                  value={key === 'distraction' ? 100 - value : value}
                  className="h-2 mt-1"
                />
              </div>
            ))}
          </div>

          {showDetailedMetrics && (
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold">手動調整</h4>
              {Object.entries(focusState.currentMetrics).map(([key, value]) => (
                <div key={key} className="flex items-center gap-4">
                  <div className="w-20 text-sm">
                    {key === 'attention'
                      ? '注意力'
                      : key === 'concentration'
                        ? '集中度'
                        : key === 'distraction'
                          ? '散漫度'
                          : key === 'energy'
                            ? 'エネルギー'
                            : '気分'}
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={([newValue]) =>
                      updateMetric(key as keyof FocusMetrics, newValue)
                    }
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <div className="w-12 text-sm font-medium">{Math.round(value)}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetailedMetrics(!showDetailedMetrics)}
            >
              {showDetailedMetrics ? '詳細を隠す' : '詳細表示・手動調整'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* レコメンデーション */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              集中力改善提案
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.slice(0, 3).map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    rec.urgency === 'high'
                      ? 'bg-red-50 border-red-200'
                      : rec.urgency === 'medium'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">{rec.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          rec.urgency === 'high'
                            ? 'bg-red-100 text-red-800'
                            : rec.urgency === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {rec.urgency === 'high'
                          ? '緊急'
                          : rec.urgency === 'medium'
                            ? '推奨'
                            : '提案'}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                        効果 {rec.estimatedBenefit}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rec.actions.map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => {
                          // アクション実行のトラッキング
                          adhdService.saveThought({
                            content: `改善アクション実行: ${action}`,
                            type: 'focus',
                            score: 8,
                          });
                        }}
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* タスクレコメンデーション */}
      {taskRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              現在の状態に適したタスク
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {taskRecommendations.slice(0, 4).map((taskRec, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">{taskRec.task.title}</h4>
                    <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                      {taskRec.score}点
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    推定時間: {taskRec.task.estimatedMinutes}分 • 難易度: {taskRec.task.difficulty}
                  </div>
                  <div className="text-xs text-blue-600">
                    {taskRec.reasoning.slice(0, 2).join(' • ')}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs h-6"
                    onClick={() => {
                      adhdTodoIntegration.startTaskFocusSession(taskRec.task);
                    }}
                  >
                    このタスクで開始
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 集中度履歴 */}
      {focusState.focusHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              集中度履歴
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {focusState.focusHistory.slice(-5).map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="text-sm text-gray-600">
                    {entry.timestamp.toLocaleTimeString()}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xs">集中: {Math.round(entry.metrics.concentration)}</div>
                    <div className="text-xs">注意: {Math.round(entry.metrics.attention)}</div>
                    <div className="text-xs">総合: {calculateOverallFocusScore(entry.metrics)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
