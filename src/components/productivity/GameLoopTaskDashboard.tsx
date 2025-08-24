/**
 * 🎮 ゲームループ式タスク管理ダッシュボード
 *
 * 付箋紙システム + レシートプリンター風印刷 + 即座フィードバック
 * 参考: https://www.laurieherault.com/articles/a-thermal-receipt-printer-cured-my-procrastination
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  gameLoopTaskService,
  TaskBreakdown,
  MicroTask,
  GameLoopStats,
  DailyPrintout,
} from '@/services/productivity/GameLoopTaskService';
import { HierarchicalTaskView } from './HierarchicalTaskView';
import { gameLoopAutomationIntegration } from '@/services/productivity/GameLoopAutomationIntegration';
import {
  Play,
  Plus,
  CheckCircle,
  Clock,
  Coffee,
  Zap,
  Target,
  Printer,
  FileText,
  BarChart3,
  Flame,
  Award,
  Calendar,
  ArrowRight,
  Trash2,
  Edit,
  PlusCircle,
  Timer,
  Volume2,
  VolumeX,
  RefreshCw,
  Download,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface GameLoopTaskDashboardProps {
  compactMode?: boolean;
}

export const GameLoopTaskDashboard: React.FC<GameLoopTaskDashboardProps> = ({
  compactMode = false,
}) => {
  // State Management
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [taskBreakdowns, setTaskBreakdowns] = useState<TaskBreakdown[]>([]);
  const [gameLoopStats, setGameLoopStats] = useState<GameLoopStats | null>(null);
  const [dailyPrintout, setDailyPrintout] = useState<DailyPrintout | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [newTaskForm, setNewTaskForm] = useState<{
    originalTask: string;
    category: 'morning_routine' | 'work' | 'personal' | 'maintenance';
  }>({
    originalTask: '',
    category: 'work',
  });

  // Feedback State
  const [feedbackJar, setFeedbackJar] = useState<{ id: string; timestamp: string }[]>([]);
  const [latestFeedback, setLatestFeedback] = useState<string>('');

  // Initialize Dashboard
  useEffect(() => {
    initializeDashboard();

    // 日次リセットタイマー（午前6時）
    const now = new Date();
    const resetTime = new Date(now);
    resetTime.setHours(6, 0, 0, 0);
    if (resetTime <= now) {
      resetTime.setDate(resetTime.getDate() + 1);
    }

    const timeUntilReset = resetTime.getTime() - now.getTime();
    const resetTimer = setTimeout(() => {
      handleDailyReset();
    }, timeUntilReset);

    return () => clearTimeout(resetTimer);
  }, []);

  const initializeDashboard = async () => {
    setIsLoading(true);
    try {
      // Load data from service
      const breakdowns = gameLoopTaskService.getAllTaskBreakdowns();
      const stats = gameLoopTaskService.getGameLoopStats();
      const todayPrintout = gameLoopTaskService.generateDailyPrintout();

      setTaskBreakdowns(breakdowns);
      setGameLoopStats(stats);
      setDailyPrintout(todayPrintout);

      // Initialize feedback jar from localStorage
      const savedJar = localStorage.getItem('feedback_jar');
      if (savedJar) {
        setFeedbackJar(JSON.parse(savedJar));
      }

      console.log('🎮 Game Loop Dashboard initialized:', {
        breakdowns: breakdowns.length,
        totalTasks: stats.totalTasksCompleted,
        todayTasks: stats.tasksCompletedToday,
      });

      // Initialize automation integration
      gameLoopAutomationIntegration.startPeriodicChecks();
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
      toast.error('ダッシュボードの初期化に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTaskBreakdown = async () => {
    if (!newTaskForm.originalTask.trim()) {
      toast.error('タスク名を入力してください');
      return;
    }

    try {
      const breakdown = gameLoopTaskService.createTaskBreakdown(
        newTaskForm.originalTask,
        newTaskForm.category
      );

      setTaskBreakdowns((prev) => [...prev, breakdown]);
      setIsCreateDialogOpen(false);
      setNewTaskForm({ originalTask: '', category: 'work' });

      toast.success(`タスクを${breakdown.microTasks.length}個のマイクロタスクに分解しました！`);
    } catch (error) {
      console.error('Failed to create task breakdown:', error);
      toast.error('タスク分解に失敗しました');
    }
  };

  const handleCompleteTask = async (taskId: string, breakdownId: string) => {
    try {
      const result = gameLoopTaskService.completeTask(taskId, breakdownId);

      if (result.success) {
        // Update local state
        setTaskBreakdowns((prev) =>
          prev.map((breakdown) =>
            breakdown.id === breakdownId
              ? { ...breakdown, completedCount: breakdown.completedCount + 1 }
              : breakdown
          )
        );

        // Update stats
        const updatedStats = gameLoopTaskService.getGameLoopStats();
        setGameLoopStats(updatedStats);

        // Add to feedback jar with animation
        const jarItem = { id: taskId, timestamp: new Date().toISOString() };
        setFeedbackJar((prev) => {
          const updated = [...prev, jarItem];
          localStorage.setItem('feedback_jar', JSON.stringify(updated));
          return updated;
        });

        // Show feedback message
        setLatestFeedback(result.feedback);
        toast.success(result.feedback, {
          icon: '🎉',
          duration: 3000,
        });

        // Add celebratory animation
        triggerCompletionAnimation(taskId);
      } else {
        toast.error(result.feedback);
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error('タスク完了処理に失敗しました');
    }
  };

  const triggerCompletionAnimation = (taskId: string) => {
    // Find the task element and add animation class
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      taskElement.classList.add('task-completion-animation');
      setTimeout(() => {
        taskElement.classList.remove('task-completion-animation');
      }, 1000);
    }
  };

  const handlePrintDailyTasks = () => {
    if (!dailyPrintout) return;

    // Create receipt-style printout
    const receiptContent = generateReceiptContent(dailyPrintout);

    // Open print dialog with receipt styling
    const printWindow = window.open('', '', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Daily Tasks - ${dailyPrintout.date}</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px; 
                line-height: 1.4;
                margin: 0;
                padding: 20px;
                width: 350px;
              }
              .receipt-header { 
                text-align: center; 
                border-bottom: 1px dashed #000; 
                padding-bottom: 10px;
                margin-bottom: 15px;
              }
              .task-item { 
                display: flex; 
                justify-content: space-between; 
                margin: 5px 0;
                border-bottom: 1px dotted #ccc;
                padding: 3px 0;
              }
              .task-category {
                font-weight: bold;
                margin: 10px 0 5px 0;
                text-transform: uppercase;
              }
              .receipt-footer {
                border-top: 1px dashed #000;
                margin-top: 15px;
                padding-top: 10px;
                text-align: center;
              }
              @media print {
                body { width: auto; }
              }
            </style>
          </head>
          <body>
            ${receiptContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }

    toast.success('📄 レシート風タスクリストを印刷しました！');
  };

  const generateReceiptContent = (printout: DailyPrintout): string => {
    const sections = [
      { title: 'MORNING ROUTINE', tasks: printout.morningRoutine },
      { title: 'WORK TASKS', tasks: printout.workTasks },
      { title: 'PERSONAL TASKS', tasks: printout.personalTasks },
      { title: 'MAINTENANCE', tasks: printout.maintenanceTasks },
    ];

    let content = `
      <div class="receipt-header">
        <h2>🎮 DAILY GAME LOOP</h2>
        <p>${new Date(printout.date).toLocaleDateString('ja-JP')}</p>
        <p>Total Tasks: ${printout.totalTasks}</p>
      </div>
    `;

    sections.forEach((section) => {
      if (section.tasks.length > 0) {
        content += `<div class="task-category">${section.title}</div>`;
        section.tasks.forEach((task, index) => {
          content += `
            <div class="task-item">
              <span>${index + 1}. ${task.title}</span>
              <span>${task.estimatedMinutes}min</span>
            </div>
          `;
        });
      }
    });

    content += `
      <div class="receipt-footer">
        <p>💪 頑張って！ 🎯</p>
        <p>Generated by Game Loop Task System</p>
      </div>
    `;

    return content;
  };

  const handleDailyReset = () => {
    gameLoopTaskService.resetDailyStats();
    setFeedbackJar([]);
    localStorage.removeItem('feedback_jar');

    // Generate new daily printout
    const newPrintout = gameLoopTaskService.generateDailyPrintout();
    setDailyPrintout(newPrintout);

    toast.success('🌅 新しい一日が始まりました！', {
      icon: '☀️',
      duration: 4000,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>ゲームループシステムを起動中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', compactMode ? 'space-y-4' : 'space-y-6')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
            <Play className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">🎮 ゲームループ・タスクマネージャー</h2>
            <p className="text-gray-600">付箋紙システム + レシートプリンター風印刷</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsSoundEnabled(!isSoundEnabled)}>
            {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button variant="outline" onClick={handlePrintDailyTasks}>
            <Printer className="w-4 h-4 mr-2" />
            印刷
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            タスク分解
          </Button>
        </div>
      </div>

      {/* Latest Feedback */}
      {latestFeedback && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">{latestFeedback}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Loop Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-sm">今日の完了</span>
            </div>
            <div className="text-2xl font-bold">{gameLoopStats?.tasksCompletedToday || 0}</div>
            <div className="text-xs text-gray-600">タスク</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-medium text-sm">現在のストリーク</span>
            </div>
            <div className="text-2xl font-bold">{gameLoopStats?.currentStreak || 0}</div>
            <div className="text-xs text-gray-600">連続完了</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-purple-500" />
              <span className="font-medium text-sm">フィードバック瓶</span>
            </div>
            <div className="text-2xl font-bold">{feedbackJar.length}</div>
            <div className="text-xs text-gray-600">完了済み</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Coffee className="w-5 h-5 text-brown-500" />
              <span className="font-medium text-sm">朝ルーチン</span>
            </div>
            <div className="text-2xl font-bold">{gameLoopStats?.morningRoutineStreak || 0}</div>
            <div className="text-xs text-gray-600">日連続</div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Jar Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            フィードバック瓶 🫙
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="w-full h-32 border-2 border-gray-300 rounded-lg bg-gradient-to-t from-blue-50 to-transparent relative overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-400 to-blue-300 transition-all duration-1000 ease-out"
                style={{ height: `${Math.min((feedbackJar.length / 20) * 100, 100)}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-700">{feedbackJar.length}</div>
                  <div className="text-sm text-gray-600">完了タスク</div>
                </div>
              </div>

              {/* Animated completion particles */}
              {feedbackJar.slice(-5).map((item, index) => (
                <div
                  key={item.id}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                  style={{
                    left: `${20 + index * 15}%`,
                    bottom: `${10 + index * 5}%`,
                    animationDelay: `${index * 0.2}s`,
                  }}
                />
              ))}
            </div>
            <div className="mt-2 text-center text-sm text-gray-600">
              毎回のタスク完了が瓶に蓄積されます 🎉
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            概要
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            タスク分解
          </TabsTrigger>
          <TabsTrigger value="hierarchical" className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            階層ビュー
          </TabsTrigger>
          <TabsTrigger value="printout" className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            印刷プレビュー
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📋 アクティブなタスク分解</CardTitle>
            </CardHeader>
            <CardContent>
              {taskBreakdowns.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">まだタスク分解がありません</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    最初のタスクを分解する
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {taskBreakdowns.map((breakdown) => (
                    <Card key={breakdown.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{breakdown.originalTask}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{breakdown.category}</Badge>
                              <span className="text-sm text-gray-600">
                                {breakdown.completedCount}/{breakdown.totalCount} 完了
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {Math.round((breakdown.completedCount / breakdown.totalCount) * 100)}%
                            </div>
                            <Progress
                              value={(breakdown.completedCount / breakdown.totalCount) * 100}
                              className="w-24 h-2 mt-1"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          {breakdown.microTasks.map((task) => (
                            <div
                              key={task.id}
                              data-task-id={task.id}
                              className={cn(
                                'flex items-center justify-between p-3 rounded-lg border transition-all duration-300',
                                task.isCompleted
                                  ? 'bg-green-50 border-green-200 opacity-60'
                                  : 'bg-white border-gray-200 hover:border-blue-300'
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Button
                                  variant={task.isCompleted ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => handleCompleteTask(task.id, breakdown.id)}
                                  disabled={task.isCompleted}
                                  className={cn(
                                    task.isCompleted && 'bg-green-500 hover:bg-green-600'
                                  )}
                                >
                                  {task.isCompleted ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    <Play className="w-4 h-4" />
                                  )}
                                </Button>
                                <div>
                                  <div
                                    className={cn(
                                      'font-medium',
                                      task.isCompleted && 'line-through text-gray-500'
                                    )}
                                  >
                                    {task.title}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Timer className="w-3 h-3" />
                                    {task.estimatedMinutes}分
                                  </div>
                                </div>
                              </div>

                              {task.isCompleted && (
                                <div className="text-sm text-green-600 font-medium">
                                  完了済み ✨
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Task Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🎯 新しいタスク分解</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="task-input">大きなタスク</Label>
                  <Input
                    id="task-input"
                    value={newTaskForm.originalTask}
                    onChange={(e) =>
                      setNewTaskForm((prev) => ({ ...prev, originalTask: e.target.value }))
                    }
                    placeholder="例: 部屋の掃除、プレゼン準備、報告書作成"
                  />
                </div>
                <div>
                  <Label htmlFor="category-select">カテゴリ</Label>
                  <Select
                    value={newTaskForm.category}
                    onValueChange={(
                      value: 'morning_routine' | 'work' | 'personal' | 'maintenance'
                    ) => setNewTaskForm((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">仕事</SelectItem>
                      <SelectItem value="personal">個人</SelectItem>
                      <SelectItem value="maintenance">メンテナンス</SelectItem>
                      <SelectItem value="morning_routine">モーニングルーチン</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateTaskBreakdown} className="w-full">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  マイクロタスクに分解する
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hierarchical Task View Tab */}
        <TabsContent value="hierarchical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5" />
                🏗️ 水平階層型タスク管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">記事のコンセプト実装</span>
                </div>
                <p className="text-sm text-blue-700">
                  縦ではなく横に階層を表示することで、大きな視点を保ちながら詳細作業が可能。
                  タスクをクリックすると右側のカラムにサブタスクが展開されます。
                </p>
              </div>

              <HierarchicalTaskView
                onTaskComplete={(taskId) => {
                  console.log('Task completed:', taskId);
                  // Update game loop stats if needed
                  const updatedStats = gameLoopTaskService.getGameLoopStats();
                  setGameLoopStats(updatedStats);
                }}
                onTaskCreate={(task) => {
                  console.log('Task created:', task);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Printout Tab */}
        <TabsContent value="printout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="w-5 h-5" />
                レシートプリンター風印刷プレビュー
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailyPrintout && (
                <div className="bg-gray-50 p-6 rounded-lg font-mono text-sm">
                  <div className="text-center mb-4 border-b border-dashed border-gray-400 pb-2">
                    <div className="font-bold">🎮 DAILY GAME LOOP</div>
                    <div>{new Date(dailyPrintout.date).toLocaleDateString('ja-JP')}</div>
                    <div>Total Tasks: {dailyPrintout.totalTasks}</div>
                  </div>

                  {[
                    { title: 'MORNING ROUTINE', tasks: dailyPrintout.morningRoutine },
                    { title: 'WORK TASKS', tasks: dailyPrintout.workTasks },
                    { title: 'PERSONAL TASKS', tasks: dailyPrintout.personalTasks },
                    { title: 'MAINTENANCE', tasks: dailyPrintout.maintenanceTasks },
                  ].map(
                    (section, index) =>
                      section.tasks.length > 0 && (
                        <div key={index} className="mb-4">
                          <div className="font-bold mb-2">{section.title}</div>
                          {section.tasks.map((task, taskIndex) => (
                            <div
                              key={taskIndex}
                              className="flex justify-between border-b border-dotted border-gray-300 pb-1 mb-1"
                            >
                              <span>
                                {taskIndex + 1}. {task.title}
                              </span>
                              <span>{task.estimatedMinutes}min</span>
                            </div>
                          ))}
                        </div>
                      )
                  )}

                  <div className="text-center mt-4 border-t border-dashed border-gray-400 pt-2">
                    <div>💪 頑張って！ 🎯</div>
                    <div className="text-xs mt-1">Generated by Game Loop Task System</div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Button onClick={handlePrintDailyTasks} className="flex-1">
                  <Printer className="w-4 h-4 mr-2" />
                  印刷する
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const newPrintout = gameLoopTaskService.generateDailyPrintout();
                    setDailyPrintout(newPrintout);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  更新
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Custom CSS for animations */}
      <style>{`
        .task-completion-animation {
          animation: completionPulse 1s ease-out;
          background: linear-gradient(45deg, #10b981, #34d399);
          color: white;
          transform: scale(1.02);
        }

        @keyframes completionPulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
};
