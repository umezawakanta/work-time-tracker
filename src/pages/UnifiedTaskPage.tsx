import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { selectTodos } from '@/store/todoSlice';
import {
  CheckSquare,
  Calendar,
  Brain,
  BarChart3,
  Target,
  Plus,
  Settings,
  MessageSquare,
  Zap,
  Play,
  Sparkles,
  ListTodo,
  TrendingUp,
  Clock,
  Users,
  Lightbulb,
  Trophy,
  Heart,
  Gamepad2,
} from 'lucide-react';

// コンポーネントのインポート
import DailyTodoReminder from '@/components/dailyToDoReminder/DailyTodoReminder';
import AITaskSuggestions from '@/components/ai/AITaskSuggestions';
import AITaskManager from '@/components/ai/AITaskManager';
import EnhancedTaskManager from '@/components/tasks/EnhancedTaskManager';
import TaskCalendarIntegration from '@/components/calendar/TaskCalendarIntegration';
import { TodoAnalytics } from '@/components/analytics/TodoAnalytics';
import { ADHDTaskManager } from '@/components/cognitive/ADHDTaskManager';
import { GameLoopTaskDashboard } from '@/components/productivity/GameLoopTaskDashboard';
import { gameLoopTaskService, GameLoopStats } from '@/services/productivity/GameLoopTaskService';
import EisenhowerMatrix from '@/components/quadrant/EisenhowerMatrix';
import { usePremiumFeatures } from '@/components/dailyToDoReminder/controls/usePremiumFeatures';

const UnifiedTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const { isPremium } = usePremiumFeatures(); // Premium状態を取得

  // URLパラメータからタブを取得
  const searchParams = new URLSearchParams(window.location.search);
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState(tabParam || 'daily');
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [gameLoopStats, setGameLoopStats] = useState<GameLoopStats | null>(null);
  const [autoSortEnabled, setAutoSortEnabled] = useState(() => {
    return window.localStorage.getItem('enableAutoSort') !== 'false';
  });

  const todos = useSelector((state: RootState) => state.todo.items);
  const hasActiveSubscription = isPremium; // isPremiumを使用

  // タスク統計の計算
  const taskStats = React.useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const pending = total - completed;
    const highPriority = todos.filter((t) => !t.completed && t.priority >= 4).length;
    const overdue = todos.filter(
      (t) => t.deadline && new Date(t.deadline) < new Date() && !t.completed
    ).length;

    return { total, completed, pending, highPriority, overdue };
  }, [todos]);

  // ゲームループ統計の読み込み
  useEffect(() => {
    try {
      const stats = gameLoopTaskService.getGameLoopStats();
      setGameLoopStats(stats);
    } catch (error) {
      console.error('Failed to load game loop stats:', error);
    }
  }, []);

  // 自動並び替えのトグル
  const handleAutoSortToggle = (checked: boolean) => {
    setAutoSortEnabled(checked);
    window.localStorage.setItem('enableAutoSort', checked ? 'true' : 'false');
    toast.success(checked ? '🤖 AI自動並び替えを有効にしました' : '自動並び替えを無効にしました', {
      duration: 3000,
    });
  };

  return (
    <PageLayout
      title="タスク管理センター"
      subtitle="デイリータスク、4象限マトリックス、AI管理、分析など全機能を統合"
      badge={{
        text: hasActiveSubscription ? 'プレミアム' : 'スタンダード',
        variant: hasActiveSubscription ? 'default' : 'secondary',
        icon: <CheckSquare className="w-4 h-4" />,
      }}
      actions={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-lg">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">AI自動並び替え</span>
            <Switch
              checked={autoSortEnabled}
              onCheckedChange={handleAutoSortToggle}
              className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/ai-assistant')}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            AIチャット
          </Button>
          <Button
            variant={showAIAnalysis ? 'default' : 'outline'}
            onClick={() => setShowAIAnalysis(!showAIAnalysis)}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            AI分析
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            新規タスク
          </Button>
        </div>
      }
      headerGradient
    >
      <div className="space-y-6">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">総タスク</p>
                  <p className="text-2xl font-bold">{taskStats.total}</p>
                </div>
                <ListTodo className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">完了済み</p>
                  <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">未完了</p>
                  <p className="text-2xl font-bold text-orange-600">{taskStats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">高優先度</p>
                  <p className="text-2xl font-bold text-red-600">{taskStats.highPriority}</p>
                </div>
                <Target className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">期限超過</p>
                  <p className="text-2xl font-bold text-purple-600">{taskStats.overdue}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI分析セクション（条件表示） */}
        {showAIAnalysis && (
          <div className="col-span-full">
            <AITaskSuggestions />
          </div>
        )}

        {/* メインタブコンテンツ */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 md:grid-cols-9 gap-2">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden md:inline">デイリー</span>
            </TabsTrigger>
            <TabsTrigger value="quadrant" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden md:inline">4象限</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden md:inline">AI管理</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline">詳細管理</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden md:inline">カレンダー</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">分析</span>
            </TabsTrigger>
            <TabsTrigger value="adhd" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden md:inline">ADHD</span>
            </TabsTrigger>
            <TabsTrigger value="gameloop" className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              <span className="hidden md:inline">ゲーム</span>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden md:inline">報酬</span>
            </TabsTrigger>
          </TabsList>

          {/* デイリータスク管理 */}
          <TabsContent value="daily" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-blue-500" />
                  今日のタスク
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DailyTodoReminder isPremium={hasActiveSubscription} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 4象限マトリックス */}
          <TabsContent value="quadrant" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-500" />
                  4象限マトリックス（アイゼンハワーマトリックス）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EisenhowerMatrix
                  tasks={todos}
                  showAnalytics={true}
                  autoRefresh={false}
                  refreshInterval={10}
                  onTaskClick={(task) => {
                    console.log('Task clicked:', task);
                    toast.success(`タスク「${task.title || task.text}」を選択しました`);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI タスク管理 */}
          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  AI タスクアシスタント
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AITaskManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 詳細タスク管理 */}
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-500" />
                  詳細タスク管理
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedTaskManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* カレンダー統合 */}
          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  タスクカレンダー
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskCalendarIntegration />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 分析ダッシュボード */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  タスク分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TodoAnalytics />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ADHD タスク管理 */}
          <TabsContent value="adhd" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  ADHD フレンドリータスク管理
                  <Badge variant="outline">特別サポート</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ADHDTaskManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ゲームループシステム */}
          <TabsContent value="gameloop" className="space-y-4">
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                  🎮 ゲームループ・タスクシステム
                  {gameLoopStats && gameLoopStats.totalTasksCompleted > 0 && (
                    <Badge className="ml-2">{gameLoopStats.totalTasksCompleted} タスク完了</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GameLoopTaskDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 報酬システム */}
          <TabsContent value="rewards" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  達成報酬システム
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 今日の達成度 */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">今日の達成度</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">タスク完了率</span>
                          <span className="text-sm font-bold">
                            {taskStats.total > 0
                              ? Math.round((taskStats.completed / taskStats.total) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all"
                            style={{
                              width: `${taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* バッジコレクション */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">獲得バッジ</h3>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {[
                        { icon: '🏆', name: '初タスク完了' },
                        { icon: '⚡', name: '5連続完了' },
                        { icon: '🔥', name: '週間目標達成' },
                        { icon: '💎', name: '月間MVP' },
                        { icon: '🌟', name: '完璧な一日' },
                        { icon: '🎯', name: '100タスク達成' },
                      ].map((badge, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="text-3xl mb-2">{badge.icon}</div>
                          <span className="text-xs text-center">{badge.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ポイントシステム */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">ポイント残高</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-blue-600">1,250</p>
                        <p className="text-sm text-gray-600">獲得ポイント</p>
                      </div>
                      <Button variant="outline">
                        <Sparkles className="h-4 w-4 mr-2" />
                        報酬と交換
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* クイックアクション */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              クイックアクション
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24"
                onClick={() => setActiveTab('daily')}
              >
                <Plus className="h-5 w-5 mb-2" />
                <span className="text-sm">タスク追加</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24"
                onClick={() => setShowAIAnalysis(!showAIAnalysis)}
              >
                <Brain className="h-5 w-5 mb-2" />
                <span className="text-sm">AI分析</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24"
                onClick={() => setActiveTab('analytics')}
              >
                <BarChart3 className="h-5 w-5 mb-2" />
                <span className="text-sm">レポート表示</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24"
                onClick={() => navigate('/pomodoro-timer')}
              >
                <Clock className="h-5 w-5 mb-2" />
                <span className="text-sm">ポモドーロ</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ヒント・ティップス */}
        <Card className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              今日のヒント
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Lightbulb className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium mb-2">タスクを小さく分割しよう！</p>
                <p className="text-sm text-gray-600">
                  大きなタスクは圧倒されやすくなります。25分以内で完了できる小さなタスクに分割することで、
                  着実に進捗を出すことができます。AI分析機能を使えば、自動でタスクを最適なサイズに分解できます。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default UnifiedTaskPage;
