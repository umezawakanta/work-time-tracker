import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Check,
  Clock,
  Flag,
  Tag,
  Calendar,
  FileText,
  Archive,
} from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday, isPast } from 'date-fns';
import { ja } from 'date-fns/locale';
import { RootState, AppDispatch } from '@/store';
import { updateTodoItem, deleteTodoItem } from '@/store/todoSlice';
import { TodoItem } from '@/types';
import { SortOption, QuickFilterOption } from '@/types/todo';
import TaskForm from './TaskForm';

const EnhancedTaskManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector((state: RootState) => state.todo.items);
  const isLoading = useSelector((state: RootState) => state.todo.status === 'loading');

  // ローカル状態
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('priority');
  const [activeFilter, setActiveFilter] = useState<QuickFilterOption>('none');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TodoItem | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TodoItem | null>(null);

  // 優先度の色とラベル
  const getPriorityInfo = (priority: number) => {
    switch (priority) {
      case 1:
        return { label: '最高', color: 'bg-red-500', textColor: 'text-red-600' };
      case 2:
        return { label: '高', color: 'bg-orange-500', textColor: 'text-orange-600' };
      case 3:
        return { label: '中', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
      case 4:
        return { label: '低', color: 'bg-green-500', textColor: 'text-green-600' };
      case 5:
        return { label: '最低', color: 'bg-gray-500', textColor: 'text-gray-600' };
      default:
        return { label: '未設定', color: 'bg-gray-300', textColor: 'text-gray-500' };
    }
  };

  // 期限の表示フォーマット
  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);

    if (isToday(date)) return '今日';
    if (isTomorrow(date)) return '明日';
    if (isYesterday(date)) return '昨日';

    return format(date, 'MM/dd', { locale: ja });
  };

  // 期限の状態チェック
  const getDeadlineStatus = (deadline: string, completed: boolean) => {
    if (completed) return 'completed';

    const date = new Date(deadline);
    if (isPast(date) && !isToday(date)) return 'overdue';
    if (isToday(date)) return 'today';
    if (isTomorrow(date)) return 'tomorrow';

    return 'future';
  };

  // フィルタリングとソート
  const filteredAndSortedTodos = useMemo(() => {
    const filtered = todos.filter((todo) => {
      // 検索クエリによるフィルタリング
      const matchesSearch =
        searchQuery === '' ||
        todo.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // クイックフィルターによるフィルタリング
      switch (activeFilter) {
        case 'today':
          return todo.deadline ? isToday(new Date(todo.deadline)) : false;
        case 'important':
          return todo.priority <= 2;
        case 'inputOnly':
          return todo.type === 'input';
        case 'outputOnly':
          return todo.type === 'output';
        default:
          return true;
      }
    });

    // ソート
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'priority':
          return a.priority - b.priority;
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'type':
          return (a.type || 'input').localeCompare(b.type || 'input');
        default:
          return 0;
      }
    });

    return filtered;
  }, [todos, searchQuery, sortOption, activeFilter]);

  // 完了状態別にタスクをグループ化
  const { pendingTasks, completedTasks } = useMemo(() => {
    const pending = filteredAndSortedTodos.filter((todo) => !todo.completed);
    const completed = filteredAndSortedTodos.filter((todo) => todo.completed);
    return { pendingTasks: pending, completedTasks: completed };
  }, [filteredAndSortedTodos]);

  // タスクの完了状態を切り替え
  const handleToggleComplete = async (taskId: string) => {
    try {
      const task = todos.find((t) => t._id === taskId);
      if (task) {
        await dispatch(
          updateTodoItem({
            _id: taskId,
            updates: { completed: !task.completed },
          })
        ).unwrap();
      }
    } catch (error) {
      console.error('タスクの完了状態変更に失敗:', error);
    }
  };

  // タスクの削除
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await dispatch(deleteTodoItem(taskToDelete._id)).unwrap();
      setTaskToDelete(null);
    } catch (error) {
      console.error('タスクの削除に失敗:', error);
    }
  };

  // タスク編集の開始
  const handleEditTask = (task: TodoItem) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  // タスクフォームを閉じる
  const handleCloseTaskForm = () => {
    setIsTaskFormOpen(false);
    setEditingTask(null);
  };

  // タスクカードのレンダリング
  const renderTaskCard = (task: TodoItem) => {
    const priorityInfo = getPriorityInfo(task.priority);
    const deadlineStatus = task.deadline ? getDeadlineStatus(task.deadline, task.completed) : null;

    return (
      <Card
        key={task._id}
        className={`transition-all duration-200 hover:shadow-md ${
          task.completed ? 'opacity-75' : ''
        } ${deadlineStatus === 'overdue' ? 'border-l-4 border-l-red-500' : ''}
        ${deadlineStatus === 'today' ? 'border-l-4 border-l-yellow-500' : ''}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {/* 完了チェック */}
              <button
                onClick={() => handleToggleComplete(task._id)}
                className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  task.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                {task.completed && <Check className="w-3 h-3" />}
              </button>

              {/* タスク内容 */}
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-medium ${
                    task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}
                >
                  {task.task}
                </h3>

                {task.note && <p className="text-sm text-gray-600 mt-1">{task.note}</p>}

                {/* メタ情報 */}
                <div className="flex items-center space-x-4 mt-2">
                  {/* 優先度 */}
                  <div className="flex items-center space-x-1">
                    <Flag className={`w-3 h-3 ${priorityInfo.textColor}`} />
                    <span className={`text-xs ${priorityInfo.textColor}`}>
                      {priorityInfo.label}
                    </span>
                  </div>

                  {/* タイプ */}
                  <Badge variant={task.type === 'input' ? 'secondary' : 'outline'}>
                    {task.type === 'input' ? 'インプット' : 'アウトプット'}
                  </Badge>

                  {/* 期限 */}
                  {task.deadline && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span
                        className={`text-xs ${
                          deadlineStatus === 'overdue'
                            ? 'text-red-600 font-medium'
                            : deadlineStatus === 'today'
                              ? 'text-yellow-600 font-medium'
                              : 'text-gray-500'
                        }`}
                      >
                        {formatDeadline(task.deadline)}
                      </span>
                    </div>
                  )}

                  {/* タグ */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Tag className="w-3 h-3 text-gray-400" />
                      <div className="flex space-x-1">
                        {task.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {task.tags.length > 2 && (
                          <span className="text-xs text-gray-500">+{task.tags.length - 2}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* アクションメニュー */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditTask(task)}>
                  <Edit className="mr-2 h-4 w-4" />
                  編集
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTaskToDelete(task)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー・コントロール */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="タスクを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* クイックフィルター */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                フィルター
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>クイックフィルター</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setActiveFilter('none')}>すべて</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter('today')}>今日期限</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter('important')}>
                重要タスク
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveFilter('inputOnly')}>
                インプットのみ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter('outputOnly')}>
                アウトプットのみ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ソート */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                並び替え
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortOption('priority')}>
                優先度順
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption('deadline')}>期限順</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption('newest')}>作成日順</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption('type')}>タイプ順</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 新規タスク作成 */}
          <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                新規作成
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTask ? 'タスクを編集' : '新しいタスクを作成'}</DialogTitle>
                <DialogDescription>タスクの詳細を入力してください。</DialogDescription>
              </DialogHeader>
              <TaskForm
                task={
                  editingTask
                    ? {
                        ...editingTask,
                        type: editingTask.type || 'input',
                        createdAt: editingTask.createdAt || new Date().toISOString(),
                        updatedAt: editingTask.createdAt || new Date().toISOString(),
                      }
                    : undefined
                }
                onClose={handleCloseTaskForm}
                onSubmit={handleCloseTaskForm}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* タスク一覧 */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            未完了 ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            完了済み ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingTasks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  未完了のタスクはありません
                </h3>
                <p className="text-gray-600 mb-4">
                  新しいタスクを作成して、生産性を向上させましょう！
                </p>
                <Button onClick={() => setIsTaskFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  最初のタスクを作成
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">{pendingTasks.map(renderTaskCard)}</div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedTasks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Check className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  完了したタスクはありません
                </h3>
                <p className="text-gray-600">タスクを完了すると、ここに表示されます。</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">{completedTasks.map(renderTaskCard)}</div>
          )}
        </TabsContent>
      </Tabs>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>タスクを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{taskToDelete?.task}」を削除します。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-red-600 hover:bg-red-700">
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EnhancedTaskManager;
