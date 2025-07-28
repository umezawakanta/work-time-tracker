// GoalTracking.tsx
// 目標の一覧表示と管理を行うコンポーネント

import React, { useState } from 'react';
import { GoalCard } from './GoalCard';
import { GoalForm } from './GoalForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Target,
  Plus,
  Filter,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Search,
  AlertTriangle,
  LineChart,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// 型定義
interface Goal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  targetDate: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface GoalTrackingProps {
  goals?: Goal[];
  onAddGoal?: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEditGoal?: (id: string, goal: Partial<Goal>) => void;
  onDeleteGoal?: (id: string) => void;
}

type FilterType = 'all' | 'active' | 'completed' | 'paused';
type SortType = 'progress' | 'priority' | 'date' | 'title';

export const GoalTracking: React.FC<GoalTrackingProps> = ({
  goals = [],
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
}) => {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortOrder, setSortOrder] = useState<SortType>('progress');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  // 目標のフィルタリング
  const filteredGoals = goals.filter((goal: Goal) => {
    const matchesFilter = activeFilter === 'all' || goal.status === activeFilter;
    const matchesSearch =
      goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // 目標のソート
  const sortedGoals = [...filteredGoals].sort((a: Goal, b: Goal) => {
    switch (sortOrder) {
      case 'progress':
        return b.progress - a.progress;
      case 'priority': {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      case 'date':
        return new Date(b.targetDate).getTime() - new Date(a.targetDate).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  // 統計計算
  const stats = {
    total: goals.length,
    active: goals.filter((g: Goal) => g.status === 'active').length,
    completed: goals.filter((g: Goal) => g.status === 'completed').length,
    avgProgress:
      goals.length > 0
        ? Math.round(goals.reduce((sum: number, g: Goal) => sum + g.progress, 0) / goals.length)
        : 0,
  };

  const handleAddGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (onAddGoal) {
      onAddGoal(goalData);
      setIsFormOpen(false);
      toast.success('目標を追加しました');
    }
  };

  const handleEditGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedGoalId && onEditGoal) {
      onEditGoal(selectedGoalId, goalData);
      setIsDetailOpen(false);
      setSelectedGoal(null);
      setSelectedGoalId(null);
      toast.success('目標を更新しました');
    }
  };

  const handleDeleteGoal = () => {
    if (goalToDelete && onDeleteGoal) {
      onDeleteGoal(goalToDelete.id);
      setIsDeleteConfirmOpen(false);
      setGoalToDelete(null);
      toast.success('目標を削除しました');
    }
  };

  const openGoalDetail = (goal: Goal) => {
    setSelectedGoal(goal);
    setSelectedGoalId(goal.id);
    setIsDetailOpen(true);
  };

  const confirmDelete = (goal: Goal) => {
    setGoalToDelete(goal);
    setIsDeleteConfirmOpen(true);
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'paused':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">目標管理</h1>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          新しい目標
        </Button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総目標数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">進行中</p>
                <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">完了</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均進捗</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgProgress}%</p>
              </div>
              <LineChart className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* フィルターとソート */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="目標を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="filter" className="text-sm font-medium">
                フィルター:
              </Label>
              <Select
                value={activeFilter}
                onValueChange={(value: FilterType) => setActiveFilter(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="active">進行中</SelectItem>
                  <SelectItem value="completed">完了</SelectItem>
                  <SelectItem value="paused">一時停止</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="sort" className="text-sm font-medium">
                ソート:
              </Label>
              <Select value={sortOrder} onValueChange={(value: SortType) => setSortOrder(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progress">進捗順</SelectItem>
                  <SelectItem value="priority">優先度順</SelectItem>
                  <SelectItem value="date">期限順</SelectItem>
                  <SelectItem value="title">名前順</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 目標リスト */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedGoals.map((goal: Goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onEdit={() => openGoalDetail(goal)}
            onDelete={() => confirmDelete(goal)}
            onClick={() => openGoalDetail(goal)}
          />
        ))}
      </div>

      {/* 空の状態 */}
      {sortedGoals.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || activeFilter !== 'all'
                ? '該当する目標が見つかりません'
                : '目標がありません'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || activeFilter !== 'all'
                ? 'フィルターや検索条件を変更してみてください。'
                : '新しい目標を追加して始めましょう！'}
            </p>
            {!searchQuery && activeFilter === 'all' && (
              <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                最初の目標を追加
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* 目標追加フォーム */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>新しい目標を追加</DialogTitle>
            <DialogDescription>目標の詳細を入力してください。</DialogDescription>
          </DialogHeader>
          <GoalForm onSubmit={handleAddGoal} onCancel={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* 目標詳細・編集 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>目標を編集</DialogTitle>
            <DialogDescription>目標の詳細を変更できます。</DialogDescription>
          </DialogHeader>
          {selectedGoal && (
            <GoalForm
              initialData={selectedGoal}
              onSubmit={handleEditGoal}
              onCancel={() => {
                setIsDetailOpen(false);
                setSelectedGoal(null);
                setSelectedGoalId(null);
              }}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 削除確認 */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              目標を削除
            </DialogTitle>
            <DialogDescription>
              「{goalToDelete?.title}」を削除しますか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDeleteGoal}>
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
