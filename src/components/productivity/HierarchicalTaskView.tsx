/**
 * 🏗️ 水平階層型タスクビュー
 *
 * 記事で言及された「縦ではなく横に階層を表示」のコンセプト実装
 * クリックするたびに右側のカラムに詳細展開
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  ChevronRight,
  Plus,
  CheckCircle,
  Circle,
  Target,
  Clock,
  ArrowLeft,
  MoreVertical,
  Edit,
  Trash2,
  Printer,
  Play,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface HierarchicalTask {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  estimatedMinutes?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  children: HierarchicalTask[];
  parentId?: string;
  level: number;
  createdAt: string;
  completedAt?: string;
}

interface TaskColumn {
  level: number;
  title: string;
  tasks: HierarchicalTask[];
  selectedTaskId?: string;
}

interface HierarchicalTaskViewProps {
  initialTasks?: HierarchicalTask[];
  onTaskComplete?: (taskId: string) => void;
  onTaskCreate?: (task: Omit<HierarchicalTask, 'id' | 'createdAt'>) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<HierarchicalTask>) => void;
  onTaskDelete?: (taskId: string) => void;
}

export const HierarchicalTaskView: React.FC<HierarchicalTaskViewProps> = ({
  initialTasks = [],
  onTaskComplete,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
}) => {
  // State Management
  const [columns, setColumns] = useState<TaskColumn[]>([]);
  const [tasks, setTasks] = useState<HierarchicalTask[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

  // Initialize with root tasks
  useEffect(() => {
    const rootTasks = tasks.filter((task) => task.level === 0);
    setColumns([
      {
        level: 0,
        title: 'メインタスク',
        tasks: rootTasks,
      },
    ]);
  }, [tasks]);

  // Handle task selection and column expansion
  const handleTaskSelect = (task: HierarchicalTask, columnIndex: number) => {
    const newPath = selectedPath.slice(0, columnIndex + 1);
    newPath[columnIndex] = task.id;
    setSelectedPath(newPath);

    // Update columns to show selected path
    const newColumns = columns.slice(0, columnIndex + 1);

    // Update current column to show selection
    newColumns[columnIndex] = {
      ...newColumns[columnIndex],
      selectedTaskId: task.id,
    };

    // Add next column if task has children
    if (task.children.length > 0) {
      newColumns.push({
        level: columnIndex + 1,
        title: task.title,
        tasks: task.children,
      });
    }

    setColumns(newColumns);
  };

  // Handle task completion
  const handleTaskComplete = (task: HierarchicalTask) => {
    const updatedTasks = updateTaskInTree(tasks, task.id, {
      isCompleted: !task.isCompleted,
      completedAt: !task.isCompleted ? new Date().toISOString() : undefined,
    });

    setTasks(updatedTasks);

    if (onTaskComplete) {
      onTaskComplete(task.id);
    }

    // Show completion feedback
    if (!task.isCompleted) {
      toast.success(`🎉 "${task.title}" 完了！`, {
        duration: 2000,
        icon: '✅',
      });

      // Play completion sound
      playCompletionSound();
    }
  };

  // Recursive task update function
  const updateTaskInTree = (
    taskList: HierarchicalTask[],
    taskId: string,
    updates: Partial<HierarchicalTask>
  ): HierarchicalTask[] => {
    return taskList.map((task) => {
      if (task.id === taskId) {
        return { ...task, ...updates };
      }
      if (task.children.length > 0) {
        return {
          ...task,
          children: updateTaskInTree(task.children, taskId, updates),
        };
      }
      return task;
    });
  };

  // Add new task to current column
  const handleAddTask = (parentTask?: HierarchicalTask, columnIndex?: number) => {
    if (!newTaskTitle.trim()) {
      toast.error('タスク名を入力してください');
      return;
    }

    const newTask: HierarchicalTask = {
      id: `task_${Date.now()}`,
      title: newTaskTitle,
      isCompleted: false,
      priority: 'medium',
      children: [],
      level: parentTask ? parentTask.level + 1 : 0,
      parentId: parentTask?.id,
      createdAt: new Date().toISOString(),
    };

    if (parentTask) {
      // Add as child to parent task
      const updatedTasks = updateTaskInTree(tasks, parentTask.id, {
        children: [...parentTask.children, newTask],
      });
      setTasks(updatedTasks);
    } else {
      // Add as root task
      setTasks((prev) => [...prev, newTask]);
    }

    setNewTaskTitle('');

    if (onTaskCreate) {
      onTaskCreate(newTask);
    }

    toast.success(`新しいタスク「${newTask.title}」を追加しました`);
  };

  // Break down task into subtasks (using game loop approach)
  const handleBreakdownTask = (task: HierarchicalTask) => {
    const subtasks = generateSubtasks(task);

    const updatedTasks = updateTaskInTree(tasks, task.id, {
      children: [...task.children, ...subtasks],
    });

    setTasks(updatedTasks);

    toast.success(`「${task.title}」を${subtasks.length}個のサブタスクに分解しました！`);
  };

  // Generate AI-style subtasks
  const generateSubtasks = (parentTask: HierarchicalTask): HierarchicalTask[] => {
    const taskKeywords = parentTask.title.toLowerCase();
    let subtaskTemplates: string[] = [];

    // Categorize and generate appropriate subtasks
    if (taskKeywords.includes('掃除') || taskKeywords.includes('片付け')) {
      subtaskTemplates = [
        '掃除道具を準備する',
        '不要なものを分別する',
        '整理・整頓する',
        '掃除機をかける',
        '最終確認と片付け',
      ];
    } else if (taskKeywords.includes('プレゼン') || taskKeywords.includes('発表')) {
      subtaskTemplates = [
        'アウトライン作成',
        'スライド構成を決める',
        'コンテンツ作成',
        'デザイン調整',
        '練習・リハーサル',
      ];
    } else if (taskKeywords.includes('レポート') || taskKeywords.includes('報告書')) {
      subtaskTemplates = [
        '情報収集・リサーチ',
        '構成・目次作成',
        'ドラフト執筆',
        '校正・編集',
        '最終チェック',
      ];
    } else {
      // Default breakdown pattern
      subtaskTemplates = [
        `${parentTask.title}の準備`,
        `${parentTask.title}の計画立案`,
        `${parentTask.title}の実行（第1段階）`,
        `${parentTask.title}の実行（第2段階）`,
        `${parentTask.title}の仕上げ・確認`,
      ];
    }

    return subtaskTemplates.map((template, index) => ({
      id: `subtask_${parentTask.id}_${Date.now()}_${index}`,
      title: template,
      isCompleted: false,
      priority: 'medium' as const,
      children: [],
      level: parentTask.level + 1,
      parentId: parentTask.id,
      createdAt: new Date().toISOString(),
      estimatedMinutes: Math.floor(Math.random() * 15) + 5, // 5-20 minutes
    }));
  };

  // Play completion sound
  const playCompletionSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio feedback not available');
    }
  };

  // Calculate task statistics
  const getTaskStats = (taskList: HierarchicalTask[]) => {
    let total = 0;
    let completed = 0;

    const countTasks = (tasks: HierarchicalTask[]) => {
      tasks.forEach((task) => {
        total++;
        if (task.isCompleted) completed++;
        if (task.children.length > 0) {
          countTasks(task.children);
        }
      });
    };

    countTasks(taskList);
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const stats = getTaskStats(tasks);

  return (
    <div className="w-full space-y-4">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              🏗️ 水平階層型タスクビュー
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="outline">
                完了: {stats.completed}/{stats.total}
              </Badge>
              <div className="flex items-center gap-2">
                <Progress value={stats.percentage} className="w-20 h-2" />
                <span>{stats.percentage}%</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="新しいタスクを追加..."
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddTask();
                }
              }}
            />
            <Button onClick={() => handleAddTask()}>
              <Plus className="w-4 h-4 mr-2" />
              追加
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            💡 タスクをクリックすると右側にサブタスクが展開されます
          </div>
        </CardContent>
      </Card>

      {/* Horizontal Column Layout */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column, columnIndex) => (
          <Card
            key={column.level}
            className={cn(
              'min-w-80 max-w-80 flex-shrink-0',
              columnIndex === columns.length - 1 && 'border-blue-300 shadow-lg'
            )}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {columnIndex > 0 && <ArrowLeft className="w-3 h-3 text-gray-400" />}
                  <span>レベル {column.level}</span>
                </div>
                <ChevronRight className="w-3 h-3 text-gray-400" />
                <span className="truncate">{column.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    'p-3 border rounded-lg cursor-pointer transition-all duration-200',
                    task.isCompleted
                      ? 'bg-green-50 border-green-200 opacity-75'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm',
                    column.selectedTaskId === task.id && 'border-blue-500 bg-blue-50'
                  )}
                  onClick={() => handleTaskSelect(task, columnIndex)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTaskComplete(task);
                        }}
                      >
                        {task.isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                      <div className="flex-1 min-w-0">
                        <div
                          className={cn(
                            'font-medium text-sm',
                            task.isCompleted && 'line-through text-gray-500'
                          )}
                        >
                          {task.title}
                        </div>
                        {task.estimatedMinutes && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3" />
                            {task.estimatedMinutes}分
                          </div>
                        )}
                        {task.children.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                            <Target className="w-3 h-3" />
                            {task.children.length}個のサブタスク
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {task.children.length === 0 && !task.isCompleted && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBreakdownTask(task);
                          }}
                          title="タスクを分解"
                        >
                          <Sparkles className="w-3 h-3 text-purple-500" />
                        </Button>
                      )}

                      {task.children.length > 0 && (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  <Badge
                    variant={
                      task.priority === 'critical'
                        ? 'destructive'
                        : task.priority === 'high'
                          ? 'default'
                          : task.priority === 'medium'
                            ? 'secondary'
                            : 'outline'
                    }
                    className="mt-2 text-xs"
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}

              {column.tasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">サブタスクはありません</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation Breadcrumb */}
      {selectedPath.length > 0 && (
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">選択パス:</span>
              {selectedPath.map((taskId, index) => {
                const task = findTaskById(tasks, taskId);
                return task ? (
                  <div key={taskId} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight className="w-3 h-3 text-gray-400" />}
                    <Badge variant="outline">{task.title}</Badge>
                  </div>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Helper function to find task by ID in tree structure
const findTaskById = (tasks: HierarchicalTask[], taskId: string): HierarchicalTask | null => {
  for (const task of tasks) {
    if (task.id === taskId) {
      return task;
    }
    if (task.children.length > 0) {
      const found = findTaskById(task.children, taskId);
      if (found) return found;
    }
  }
  return null;
};
