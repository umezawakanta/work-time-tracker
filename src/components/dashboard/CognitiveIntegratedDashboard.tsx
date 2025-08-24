/**
 * 🧠 認知統合ダッシュボード - ADHD/ASD特化型統合管理画面
 * 認知特性に基づいてパーソナライズされたタスク管理・資産管理・生活管理
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  Target,
  DollarSign,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Calendar,
  BarChart3,
  Heart,
  Zap,
  Timer,
  Star,
} from 'lucide-react';
import CognitiveIntegrationService from '@/services/cognitive/CognitiveIntegrationService';

interface DashboardData {
  personalizedGreeting: string;
  cognitiveStatus: {
    efficiency: number;
    recommendation: string;
    optimalTaskType: string;
  };
  optimizedWorkflow: {
    currentFocus: string;
    todaysPlan: Array<{
      time: string;
      activity: string;
      duration: number;
      cognitiveLoad: string;
    }>;
    energyManagement: {
      currentLevel: string;
      suggestions: string[];
      warningThreshold: number;
    };
    breakSchedule: Array<{
      time: string;
      type: string;
      duration: number;
      activity: string;
    }>;
  };
  adaptiveRecommendations: string[];
  progressMetrics: {
    cognitiveImprovement: number;
    taskCompletionRate: number;
    financialGoalProgress: number;
    overallWellbeing: number;
  };
  nextActions: Array<{
    priority: string;
    action: string;
    reason: string;
    estimatedTime: number;
  }>;
}

interface DashboardUser {
  id?: string;
  uid?: string;
  email?: string;
  name?: string;
  displayName?: string;
  createdAt?: string;
}

export const CognitiveIntegratedDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cognitiveService] = useState(() => new CognitiveIntegrationService());
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user: authUser } = useAuth();

  useEffect(() => {
    // 現在時刻を1分ごとに更新
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadDashboardData(authUser);
  }, [authUser]);

  const loadDashboardData = async (currentUser: DashboardUser | null | undefined) => {
    try {
      setIsLoading(true);

      if (!currentUser) {
        console.warn('ユーザーが認証されていません');
        setIsLoading(false);
        return;
      }

      const userId = currentUser.uid || currentUser.id;

      // プロファイル存在チェック（簡易: 既存設定の有無で判断）
      const existingSettings = cognitiveService.getOptimizedSettings(userId);
      if (!existingSettings) {
        await cognitiveService.updateCognitiveProfile({
          id: `${userId}-profile`,
          userId,
          date: new Date(),
          verbalComprehension: 100,
          perceptualReasoning: 100,
          workingMemory: 100,
          processingSpeed: 100,
          executiveFunction: 100,
          attentionalControl: 100,
          sensoryProcessing: 100,
          socialCognition: 100,
          personalizedSettings: {
            optimalTaskDuration: 60,
            preferredBreakFrequency: 60,
            visualComplexityLevel: 'medium',
            auditoryProcessingPreference: 'moderate',
            multitaskingCapacity: 'dual',
            timeStructureNeed: 'flexible',
            cognitiveLoadThreshold: 70,
            distractionSensitivity: 'medium',
          },
          strengths: ['計画性', '問題解決能力'],
          challenges: ['気が散りやすい'],
          recommendations: ['短い休憩を定期的に入れましょう'],
        } as any);
      }

      // 統合ダッシュボードデータを生成
      const data = cognitiveService.generateUnifiedDashboard(userId);
      if (data) {
        setDashboardData(data as any);
      } else {
        setDashboardData(null);
      }

      console.log('認知統合ダッシュボード読み込み完了:', {
        userId,
        hasProfile: !!cognitiveService.getOptimizedSettings(userId),
      });
    } catch (error) {
      console.error('ダッシュボードデータ読み込みエラー:', error);
      // エラー時はダッシュボード非表示
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getCognitiveStatusColor = (efficiency: number) => {
    if (efficiency >= 0.8) return 'bg-green-500';
    if (efficiency >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">認知プロファイルを最適化中...</span>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          ダッシュボードデータを読み込めませんでした。認知評価を完了してください。
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* パーソナライズされた挨拶 */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">{dashboardData.personalizedGreeting}</h1>
              <p className="text-purple-100">現在時刻: {currentTime.toLocaleTimeString('ja-JP')}</p>
            </div>
            <Brain className="h-12 w-12 text-purple-200" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 現在の認知状態 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">認知状態</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${getCognitiveStatusColor(dashboardData.cognitiveStatus.efficiency)}`}
              />
              <span className="text-2xl font-bold">
                {Math.round(dashboardData.cognitiveStatus.efficiency * 100)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {dashboardData.cognitiveStatus.recommendation}
            </p>
            <Badge variant="outline" className="mt-2">
              {dashboardData.cognitiveStatus.optimalTaskType === 'complex'
                ? '複雑作業適正'
                : '軽作業推奨'}
            </Badge>
          </CardContent>
        </Card>

        {/* 進捗指標 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総合進捗</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span>認知改善</span>
                  <span>{dashboardData.progressMetrics.cognitiveImprovement}%</span>
                </div>
                <Progress
                  value={dashboardData.progressMetrics.cognitiveImprovement}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>タスク完了率</span>
                  <span>{dashboardData.progressMetrics.taskCompletionRate}%</span>
                </div>
                <Progress
                  value={dashboardData.progressMetrics.taskCompletionRate}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>財務目標</span>
                  <span>{dashboardData.progressMetrics.financialGoalProgress}%</span>
                </div>
                <Progress
                  value={dashboardData.progressMetrics.financialGoalProgress}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ウェルビーング */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ウェルビーング</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-green-600">
                {dashboardData.progressMetrics.overallWellbeing}
              </span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">認知特性に最適化された生活リズム</p>
            <Badge variant="outline" className="mt-2 bg-green-50">
              良好
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 今日の最適化されたワークフロー */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              今日の最適プラン
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.optimizedWorkflow.todaysPlan.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{item.time}</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.activity}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{item.duration}分</div>
                    <Badge
                      variant={item.cognitiveLoad === 'high' ? 'destructive' : 'default'}
                      className="text-xs"
                    >
                      {item.cognitiveLoad === 'high' ? '高集中' : '中集中'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">エネルギー管理</h4>
              <div className="space-y-1">
                {dashboardData.optimizedWorkflow.energyManagement.suggestions.map(
                  (suggestion, index) => (
                    <p key={index} className="text-sm text-blue-700">
                      • {suggestion}
                    </p>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 適応的推奨事項 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              パーソナライズ提案
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.adaptiveRecommendations.map((recommendation, index) => (
                <Alert key={index} className="p-3">
                  <Star className="h-4 w-4" />
                  <AlertDescription className="text-sm">{recommendation}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 次のアクション */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            おすすめの次のアクション
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardData.nextActions.map((action, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={getPriorityColor(action.priority)} className="text-xs">
                    {action.priority === 'high'
                      ? '高優先度'
                      : action.priority === 'medium'
                        ? '中優先度'
                        : '低優先度'}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    <Timer className="h-3 w-3 inline mr-1" />
                    {action.estimatedTime}分
                  </span>
                </div>
                <h4 className="font-medium mb-1">{action.action}</h4>
                <p className="text-xs text-gray-600 mb-3">{action.reason}</p>
                <Button size="sm" className="w-full">
                  実行する
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 休憩スケジュール */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            今日の休憩スケジュール
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dashboardData.optimizedWorkflow.breakSchedule.map((breakItem, index) => (
              <div key={index} className="text-center p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-800">{breakItem.time}</div>
                <div className="text-sm text-green-600">{breakItem.type}</div>
                <div className="text-xs text-green-500">{breakItem.activity}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CognitiveIntegratedDashboard;
