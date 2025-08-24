import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useADHDNotifications } from '@/hooks/useADHDNotifications';
import adhdService, { ThoughtEntry, FocusSession, ADHDInsight } from '@/services/adhdService';
import {
  Brain,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Eye,
  Heart,
  Lightbulb,
  Pause,
  Play,
  Bell,
  X,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

export const ADHDFocusHelper: React.FC = () => {
  const [currentThought, setCurrentThought] = useState('');
  const [thoughts, setThoughts] = useState<ThoughtEntry[]>([]);
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [currentGoal, setCurrentGoal] = useState('');
  const [showRealityCheck, setShowRealityCheck] = useState(false);
  const [mindfulnessTimer, setMindfulnessTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [insights, setInsights] = useState<ADHDInsight[]>([]);
  const [showInsights, setShowInsights] = useState(false);

  // ADHD通知システム
  const {
    notifications,
    removeNotification,
    triggerEmergencyRealityCheck,
    requestNotificationPermission,
  } = useADHDNotifications();

  // データ読み込み
  useEffect(() => {
    const loadedThoughts = adhdService.getThoughts(10);
    setThoughts(loadedThoughts);

    const loadedInsights = adhdService.generateInsights();
    setInsights(loadedInsights);
  }, []);

  // 現実チェック用の質問リスト
  const realityQuestions = [
    'この考えは今の現実に基づいていますか？',
    'この考えは実際に起こっている事実ですか？',
    'この考えは今やるべきタスクに関係がありますか？',
    'この考えは解決可能な問題についてですか？',
    'この考えは建設的で有益ですか？',
  ];

  // マインドフルネスタイマー
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive) {
      interval = setInterval(() => {
        setMindfulnessTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  // 定期的な現実チェック提案
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (activeSession && !showRealityCheck) {
          setShowRealityCheck(true);
        }
      },
      10 * 60 * 1000
    ); // 10分ごと

    return () => clearInterval(interval);
  }, [activeSession, showRealityCheck]);

  // セッション開始
  const startFocusSession = () => {
    if (!currentGoal.trim()) return;

    const newSession = adhdService.startSession(currentGoal);
    setActiveSession(newSession);
    setCurrentGoal('');
    setIsTimerActive(true);
  };

  // セッション終了
  const endFocusSession = () => {
    if (activeSession) {
      const completedSession = adhdService.endSession(activeSession);
      console.log('Focus session completed:', completedSession);

      // インサイトを更新
      const newInsights = adhdService.generateInsights();
      setInsights(newInsights);

      setActiveSession(null);
      setIsTimerActive(false);
      setMindfulnessTimer(0);
    }
  };

  // 思考の記録と分析
  const recordThought = () => {
    if (!currentThought.trim()) return;

    const thoughtData = {
      content: currentThought,
      type: analyzeThoughtType(currentThought) as 'reality' | 'fantasy' | 'worry' | 'focus',
      score: calculateRealityScore(currentThought),
    };

    const savedThought = adhdService.saveThought(thoughtData);
    setThoughts((prev) => [savedThought, ...prev.slice(0, 9)]);
    setCurrentThought('');

    if (activeSession) {
      setActiveSession((prev) =>
        prev
          ? {
              ...prev,
              thoughtsChecked: prev.thoughtsChecked + 1,
              realityScore: calculateAverageRealityScore([...thoughts, savedThought]),
            }
          : null
      );
    }

    // インサイトを更新
    const newInsights = adhdService.generateInsights();
    setInsights(newInsights);
  };

  // 思考タイプの分析
  const analyzeThoughtType = (thought: string): ThoughtEntry['type'] => {
    const lowerThought = thought.toLowerCase();

    if (
      lowerThought.includes('もし') ||
      lowerThought.includes('だったら') ||
      lowerThought.includes('かもしれない') ||
      lowerThought.includes('想像')
    ) {
      return 'fantasy';
    }

    if (
      lowerThought.includes('心配') ||
      lowerThought.includes('不安') ||
      lowerThought.includes('怖い') ||
      lowerThought.includes('大丈夫')
    ) {
      return 'worry';
    }

    if (
      lowerThought.includes('今') ||
      lowerThought.includes('実際') ||
      lowerThought.includes('事実') ||
      lowerThought.includes('現実')
    ) {
      return 'reality';
    }

    return 'focus';
  };

  // 現実度スコアの計算
  const calculateRealityScore = (thought: string): number => {
    const lowerThought = thought.toLowerCase();
    let score = 5; // 基準点

    // 現実的な要素
    if (lowerThought.includes('今') || lowerThought.includes('実際')) score += 2;
    if (lowerThought.includes('事実') || lowerThought.includes('確認')) score += 2;
    if (lowerThought.includes('具体的') || lowerThought.includes('明確')) score += 1;

    // 非現実的な要素
    if (lowerThought.includes('もし') || lowerThought.includes('だったら')) score -= 2;
    if (lowerThought.includes('想像') || lowerThought.includes('妄想')) score -= 3;
    if (lowerThought.includes('完璧') || lowerThought.includes('絶対')) score -= 1;

    return Math.max(1, Math.min(10, score));
  };

  // 平均現実度スコアの計算
  const calculateAverageRealityScore = (thoughtList: ThoughtEntry[]): number => {
    if (thoughtList.length === 0) return 0;
    const sum = thoughtList.reduce((acc, thought) => acc + thought.score, 0);
    return Math.round(sum / thoughtList.length);
  };

  // 思考タイプ別の色とアイコン
  const getThoughtTypeInfo = (type: ThoughtEntry['type']) => {
    switch (type) {
      case 'reality':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-4 w-4" />,
          label: '現実的',
        };
      case 'fantasy':
        return {
          color: 'bg-purple-100 text-purple-800',
          icon: <Brain className="h-4 w-4" />,
          label: '想像',
        };
      case 'worry':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <AlertTriangle className="h-4 w-4" />,
          label: '心配',
        };
      case 'focus':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: <Target className="h-4 w-4" />,
          label: '集中',
        };
    }
  };

  // 現実チェックプロンプト
  const RealityCheckPrompt = () => (
    <Alert className="border-orange-200 bg-orange-50">
      <Eye className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-3">
          <p className="font-medium">🧠 現実チェックの時間です</p>
          <div className="space-y-2">
            {realityQuestions.map((question, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-400 rounded-full" />
                {question}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setShowRealityCheck(false)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              チェック完了
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowRealityCheck(false)}>
              後で
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-2">
          🧠 ADHD集中サポート
        </h1>
        <p className="text-gray-600">妄想を防ぎ、現実に集中するためのツール</p>
      </div>

      {/* 現実チェックプロンプト */}
      {showRealityCheck && <RealityCheckPrompt />}

      {/* インサイト表示 */}
      {insights.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-blue-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AIインサイト
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowInsights(!showInsights)}>
                {showInsights ? '隠す' : '表示'}
              </Button>
            </CardTitle>
          </CardHeader>
          {showInsights && (
            <CardContent>
              <div className="space-y-3">
                {insights.slice(0, 3).map((insight) => (
                  <div
                    key={insight.id}
                    className={`p-3 rounded-lg border ${
                      insight.type === 'warning'
                        ? 'bg-red-50 border-red-200'
                        : insight.type === 'achievement'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                        {insight.actionable && insight.actions && (
                          <div className="mt-2">
                            <div className="text-xs font-medium text-gray-700 mb-1">
                              推奨アクション:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {insight.actions.map((action, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          insight.confidence > 0.8
                            ? 'bg-green-100 text-green-800'
                            : insight.confidence > 0.6
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {Math.round(insight.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* アクティブセッション表示 */}
      {activeSession && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-blue-900">集中セッション進行中</h3>
                <p className="text-blue-700">目標: {activeSession.goal}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">
                  {Math.floor(mindfulnessTimer / 60)}:
                  {(mindfulnessTimer % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-blue-600">経過時間</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold">{activeSession.thoughtsChecked}</div>
                <div className="text-sm text-gray-600">思考チェック</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{activeSession.realityScore}/10</div>
                <div className="text-sm text-gray-600">現実度</div>
              </div>
              <div className="text-center">
                <Button
                  onClick={endFocusSession}
                  variant="outline"
                  size="sm"
                  className="border-blue-300"
                >
                  セッション終了
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* セッション開始 */}
      {!activeSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              集中セッション開始
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">今の目標・タスク</label>
              <Input
                value={currentGoal}
                onChange={(e) => setCurrentGoal(e.target.value)}
                placeholder="例: レポートを1時間で完成させる"
                className="w-full"
              />
            </div>
            <Button onClick={startFocusSession} disabled={!currentGoal.trim()} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              集中セッション開始
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 思考記録 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            思考の記録と分析
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">今考えていること</label>
            <Textarea
              value={currentThought}
              onChange={(e) => setCurrentThought(e.target.value)}
              placeholder="頭に浮かんだ考えを書いてください..."
              className="w-full"
              rows={3}
            />
          </div>
          <Button onClick={recordThought} disabled={!currentThought.trim()} className="w-full">
            <Lightbulb className="h-4 w-4 mr-2" />
            思考を記録・分析
          </Button>
        </CardContent>
      </Card>

      {/* 思考履歴 */}
      {thoughts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              思考履歴
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {thoughts.map((thought) => {
                const typeInfo = getThoughtTypeInfo(thought.type);
                return (
                  <div key={thought.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={typeInfo.color}>
                        {typeInfo.icon}
                        <span className="ml-1">{typeInfo.label}</span>
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">現実度: {thought.score}/10</span>
                        <div className="w-16">
                          <Progress value={thought.score * 10} className="h-2" />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm">{thought.content}</p>
                    <div className="text-xs text-gray-400 mt-1">
                      {thought.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 集中のためのヒント */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Heart className="h-5 w-5" />
            ADHD集中のコツ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
            <div>
              <h4 className="font-medium mb-2">🎯 現実に戻る方法</h4>
              <ul className="space-y-1">
                <li>• 5つの感覚に注意を向ける</li>
                <li>• 今の時間と場所を確認する</li>
                <li>• 深呼吸を3回する</li>
                <li>• 具体的な行動を1つ決める</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">⚡ 妄想を防ぐ習慣</h4>
              <ul className="space-y-1">
                <li>• 10分ごとに現実チェック</li>
                <li>• 思考を書き出して客観視</li>
                <li>• タイマーで作業時間を区切る</li>
                <li>• 完了したタスクを記録する</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
