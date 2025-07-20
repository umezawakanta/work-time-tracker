/**
 * 🎮 統合ゲーミフィケーションページ
 * ゲーミフィケーション、AI強化ゲーミフィケーション、ToDo管理の完全統合
 */

import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useAuth } from '@/hooks/useAuth';

// Integrated Components
import { IntegratedGamificationDashboard } from '@/components/integrated/IntegratedGamificationDashboard';
import { AIEnhancedGamification } from '@/components/gamification/AIEnhancedGamification';
import DailyTodoReminder from '@/components/dailyToDoReminder/DailyTodoReminder';
import GamificationDashboard from '@/components/gamification/GamificationDashboard';

// Icons
import {
  Crown,
  Brain,
  CheckSquare,
  Trophy,
  Zap,
  Star,
  Target,
  BarChart3,
  Settings,
  RefreshCw,
  Sparkles,
  Users,
  TrendingUp,
  Award,
  Lightbulb,
  Shield,
  Activity,
} from 'lucide-react';

const IntegratedGamificationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('integrated');
  const [isInitialized, setIsInitialized] = useState(false);

  // Auth and User Data
  const { user, isAuthenticated } = useAuth();
  const hasActiveSubscription = useSelector((state: RootState) => state.user.hasActiveSubscription);
  const todos = useSelector((state: RootState) => state.todo.items);

  // Statistics
  const todayCompletedTasks = todos.filter(
    (todo) =>
      todo.completed &&
      todo.completedDate &&
      new Date(todo.completedDate).toDateString() === new Date().toDateString()
  ).length;

  const totalPendingTasks = todos.filter((todo) => !todo.completed).length;
  const highPriorityTasks = todos.filter((todo) => !todo.completed && todo.priority >= 4).length;

  useEffect(() => {
    // Initialize integrated gamification system
    const initializeSystem = async () => {
      if (isAuthenticated && user) {
        try {
          // Any initialization logic here
          setIsInitialized(true);
          console.log('🎮 Integrated gamification system initialized for:', user.email);
        } catch (error) {
          console.error('Gamification initialization failed:', error);
        }
      }
    };

    initializeSystem();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <PageLayout title="統合ゲーミフィケーション" subtitle="ログインが必要です">
        <Alert>
          <Shield className="w-4 h-4" />
          <AlertDescription>
            統合ゲーミフィケーション機能を利用するにはログインが必要です。
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="🎮 統合ゲーミフィケーション"
      subtitle="AI・ゲーミフィケーション・タスク管理の完全統合体験"
      badge={{
        text: hasActiveSubscription ? 'プレミアム' : 'スタンダード',
        variant: hasActiveSubscription ? 'default' : 'secondary',
        icon: <Crown className="w-4 h-4" />,
      }}
      actions={
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <CheckSquare className="w-4 h-4 text-green-500" />
              <span>今日: {todayCompletedTasks}完了</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4 text-blue-500" />
              <span>残り: {totalPendingTasks}タスク</span>
            </div>
            {highPriorityTasks > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-orange-500" />
                <span>高優先: {highPriorityTasks}</span>
              </div>
            )}
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            設定
          </Button>
        </div>
      }
      headerGradient
    >
      <div className="space-y-6">
        {/* System Status */}
        {!isInitialized && (
          <Alert>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <AlertDescription>統合ゲーミフィケーションシステムを初期化中...</AlertDescription>
          </Alert>
        )}

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-sm">統合システム</span>
              </div>
              <div className="text-lg font-bold">アクティブ</div>
              <div className="text-xs text-gray-600">
                {isInitialized ? '正常動作中' : '初期化中'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <span className="font-medium text-sm">AI連携</span>
              </div>
              <div className="text-lg font-bold">有効</div>
              <div className="text-xs text-gray-600">スマート分析中</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-medium text-sm">ゲーミフィケーション</span>
              </div>
              <div className="text-lg font-bold">統合済み</div>
              <div className="text-xs text-gray-600">XP・バッジ・レベル</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare className="w-5 h-5 text-green-500" />
                <span className="font-medium text-sm">タスク管理</span>
              </div>
              <div className="text-lg font-bold">連携中</div>
              <div className="text-xs text-gray-600">リアルタイム同期</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Interface Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="integrated" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              統合ダッシュボード
            </TabsTrigger>
            <TabsTrigger value="ai_enhanced" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI強化
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              タスク管理
            </TabsTrigger>
            <TabsTrigger value="classic" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              クラシック
            </TabsTrigger>
          </TabsList>

          {/* Integrated Dashboard Tab */}
          <TabsContent value="integrated" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-6 h-6 text-purple-600" />
                  統合ゲーミフィケーションダッシュボード
                </CardTitle>
                <p className="text-sm text-gray-600">
                  AI・ゲーミフィケーション・タスク管理の完全統合体験。
                  あなたの生産性を最大化するすべての要素がここに。
                </p>
              </CardHeader>
              <CardContent>
                <IntegratedGamificationDashboard userId={user?.uid || 'anonymous'} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Enhanced Tab */}
          <TabsContent value="ai_enhanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-6 h-6 text-blue-600" />
                  AI強化ゲーミフィケーション
                </CardTitle>
                <p className="text-sm text-gray-600">
                  リアルタイムAI分析・予測・パーソナライゼーションによる次世代ゲーム体験。
                </p>
              </CardHeader>
              <CardContent>
                <AIEnhancedGamification />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="w-6 h-6 text-green-600" />
                  ゲーミフィケーション統合タスク管理
                </CardTitle>
                <p className="text-sm text-gray-600">
                  タスク完了でXP獲得、レベルアップ、バッジ解除。
                  プレミアム機能でAI分析とパーソナライゼーション。
                </p>
              </CardHeader>
              <CardContent>
                <DailyTodoReminder isPremium={hasActiveSubscription} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Classic Gamification Tab */}
          <TabsContent value="classic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                  クラシックゲーミフィケーション
                </CardTitle>
                <p className="text-sm text-gray-600">
                  従来のポイント・リーダーボード・報酬システム。
                  基本的なゲーミフィケーション要素を提供。
                </p>
              </CardHeader>
              <CardContent>
                <GamificationDashboard />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Integration Benefits */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">AI駆動パーソナライゼーション</h3>
                <p className="text-sm text-gray-600">
                  あなたの行動パターンを学習し、最適なタスクとチャレンジを提案
                </p>
              </div>

              <div className="text-center">
                <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">進化するゲーミフィケーション</h3>
                <p className="text-sm text-gray-600">
                  従来のポイントシステムにAI分析を組み合わせた次世代体験
                </p>
              </div>

              <div className="text-center">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">継続的な成長支援</h3>
                <p className="text-sm text-gray-600">
                  リアルタイム分析とフィードバックで持続可能な成長をサポート
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Features */}
        {!hasActiveSubscription && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">プレミアム機能でさらに強力に</h3>
                    <p className="text-sm text-gray-600">
                      高度なAI分析、カスタマイズ、詳細レポートなど
                    </p>
                  </div>
                </div>
                <Button className="bg-yellow-600 hover:bg-yellow-700">アップグレード</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  <span>AI洞察レポート</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-yellow-600" />
                  <span>カスタムチャレンジ</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-yellow-600" />
                  <span>チーム機能</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BarChart3 className="w-4 h-4 text-yellow-600" />
                  <span>詳細分析</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default IntegratedGamificationPage;
