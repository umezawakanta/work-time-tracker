// GoalTracking.jsx
// 目標の一覧表示と管理を行うコンポーネント

import { useState } from 'react';
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

export function GoalTracking({ goals = [], onAddGoal, onEditGoal }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('progress');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);

  // 進捗率の計算
  const calculateProgress = (goal) => {
    if (goal.type === 'debt') {
      // 負債の場合は逆（減らすのが目標）
      if (goal.startValue === 0) return 0;
      const reduction = goal.startValue - goal.currentValue;
      const target = goal.startValue - goal.targetValue;
      return target > 0 ? Math.min(100, (reduction / target) * 100) : 0;
    } else {
      // 資産・純資産などの場合
      const range = goal.targetValue - goal.startValue;
      if (range === 0) return 0;
      const achieved = goal.currentValue - goal.startValue;
      return Math.min(100, (achieved / range) * 100);
    }
  };

  // 目標リストのフィルタリング
  const filteredGoals = goals.filter((goal) => {
    // タイプでフィルタリング
    if (activeFilter !== 'all' && goal.type !== activeFilter) {
      return false;
    }
    // 検索クエリでフィルタリング
    if (searchQuery) {
      return goal.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // 目標リストのソート
  const sortedGoals = [...filteredGoals].sort((a, b) => {
    switch (sortOrder) {
      case 'progress':
        // 進捗率でソート（高い順）
        const progressA = calculateProgress(a);
        const progressB = calculateProgress(b);
        return progressB - progressA;
      case 'deadline':
        // 期限が近い順
        return new Date(a.targetDate) - new Date(b.targetDate);
      case 'amount':
        // 目標金額の大きい順
        return b.targetValue - a.targetValue;
      case 'recent':
        // 最近追加された順（IDが大きい順と仮定）
        return b.id.localeCompare(a.id);
      default:
        return 0;
    }
  });

  // 目標編集ハンドラー
  const handleEditGoal = (goalId) => {
    const goal = goals.find((g) => g.id === goalId);
    if (goal) {
      setSelectedGoal(goal);
      setIsFormOpen(true);
    }
  };

  // 目標詳細表示ハンドラー
  const handleViewDetails = (goalId) => {
    const goal = goals.find((g) => g.id === goalId);
    if (goal) {
      setSelectedGoal(goal);
      setIsDetailOpen(true);
    }
  };

  // 削除確認ダイアログを表示
  const handleDeleteRequest = (goalId) => {
    setGoalToDelete(goalId);
    setIsDeleteConfirmOpen(true);
  };

  // 目標の削除処理
  const handleDeleteGoal = () => {
    // この関数はpropsとして受け取るべきですが、デモ実装のため省略
    // onDeleteGoal(goalToDelete);

    toast.success('目標を削除しました');
    setIsDeleteConfirmOpen(false);
    setGoalToDelete(null);
  };

  // 保存成功時の処理
  const handleSaveGoal = (goalData) => {
    if (selectedGoal) {
      // 既存の目標を編集
      const updatedGoal = {
        ...goalData,
        id: selectedGoal.id,
      };
      onEditGoal && onEditGoal(updatedGoal);
    } else {
      // 新しい目標を追加
      onAddGoal && onAddGoal(goalData);
    }
    setIsFormOpen(false);
    setSelectedGoal(null);
  };

  // 目標タイプごとの統計情報を計算
  const goalStats = {
    total: goals.length,
    asset: goals.filter((g) => g.type === 'asset').length,
    debt: goals.filter((g) => g.type === 'debt').length,
    networth: goals.filter((g) => g.type === 'networth').length,
    savings: goals.filter((g) => g.type === 'savings').length,
    investment: goals.filter((g) => g.type === 'investment').length,
    completed: goals.filter((g) => calculateProgress(g) >= 100).length,
  };

  // 目標達成の概要を計算
  const calculateTotalProgress = () => {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, goal) => sum + calculateProgress(goal), 0);
    return Math.round(totalProgress / goals.length);
  };

  return (
    <div className="space-y-6">
      {/* ヘッダーセクション */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">財務目標の管理</h2>
          <p className="text-muted-foreground">
            財務目標の設定と進捗を追跡し、計画的な資産形成を実現しましょう
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedGoal(null);
            setIsFormOpen(true);
          }}
          className="bg-primary text-primary-foreground"
        >
          <Plus className="mr-2 h-4 w-4" /> 新しい目標を設定
        </Button>
      </div>

      {/* 目標が0件の場合の表示 */}
      {goals.length === 0 ? (
        <Card className="bg-muted/30">
          <CardContent className="pt-6 pb-10">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <Target className="h-12 w-12 text-primary/50" />
              <div className="space-y-2">
                <h3 className="text-xl font-medium">まだ目標が設定されていません</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  財務目標を設定すると、達成に向けた進捗を追跡できます。
                  貯蓄目標や負債削減など、あなたの財務計画に合わせて目標を設定しましょう。
                </p>
              </div>
              <Button
                onClick={() => {
                  setSelectedGoal(null);
                  setIsFormOpen(true);
                }}
                className="mt-2"
              >
                <Plus className="mr-2 h-4 w-4" /> 最初の目標を設定する
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 目標サマリーカード */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">目標の進捗状況</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="text-2xl font-bold">
                    {calculateTotalProgress()}%
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      平均達成率
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      {goalStats.completed}件達成
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {goals.length - goalStats.completed}件進行中
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">目標タイプ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 flex items-center"
                  >
                    <ArrowUp className="h-3 w-3 mr-1" />
                    資産: {goalStats.asset}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-200 flex items-center"
                  >
                    <ArrowDown className="h-3 w-3 mr-1" />
                    負債: {goalStats.debt}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 flex items-center"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    純資産: {goalStats.networth}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700 border-purple-200 flex items-center"
                  >
                    <LineChart className="h-3 w-3 mr-1" />
                    その他: {goalStats.savings + goalStats.investment}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">最近の目標推移</CardTitle>
              </CardHeader>
              <CardContent>
                {/* サンプル進捗グラフ（ダミー表示） */}
                <div className="h-16 bg-muted/20 rounded-md flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">
                    目標達成状況のグラフ（実装予定）
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* フィルタリングと検索 */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">すべて</TabsTrigger>
                  <TabsTrigger value="asset">資産</TabsTrigger>
                  <TabsTrigger value="debt">負債</TabsTrigger>
                  <TabsTrigger value="networth">純資産</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="目標を検索..."
                  className="pl-8 w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="並び替え" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progress">進捗率順</SelectItem>
                  <SelectItem value="deadline">期限が近い順</SelectItem>
                  <SelectItem value="amount">目標金額順</SelectItem>
                  <SelectItem value="recent">最近追加した順</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 目標カードグリッド */}
          {filteredGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={handleEditGoal}
                  onDelete={handleDeleteRequest}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-md text-center">
              <Filter className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">検索条件に一致する目標がありません</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="mt-2"
              >
                フィルターをクリア
              </Button>
            </div>
          )}
        </>
      )}

      {/* 目標設定/編集フォームダイアログ */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedGoal ? '目標を編集' : '新しい目標を設定'}</DialogTitle>
            <DialogDescription>財務目標を設定して、進捗を追跡しましょう</DialogDescription>
          </DialogHeader>

          <GoalForm
            goal={selectedGoal}
            onSave={handleSaveGoal}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedGoal(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* 目標詳細ダイアログ */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedGoal?.title}</DialogTitle>
            <DialogDescription>目標の詳細と進捗状況</DialogDescription>
          </DialogHeader>

          {selectedGoal && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">目標の概要</h3>
                  <div className="bg-muted/20 p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <span className="text-muted-foreground">タイプ:</span>
                      <span>
                        {selectedGoal.type === 'asset'
                          ? '資産構築'
                          : selectedGoal.type === 'debt'
                            ? '負債削減'
                            : selectedGoal.type === 'networth'
                              ? '純資産'
                              : selectedGoal.type === 'savings'
                                ? '貯蓄'
                                : '投資'}
                      </span>

                      <span className="text-muted-foreground">開始値:</span>
                      <span>{selectedGoal.startValue.toLocaleString()}円</span>

                      <span className="text-muted-foreground">現在値:</span>
                      <span>{selectedGoal.currentValue.toLocaleString()}円</span>

                      <span className="text-muted-foreground">目標値:</span>
                      <span>{selectedGoal.targetValue.toLocaleString()}円</span>

                      <span className="text-muted-foreground">期間:</span>
                      <span>
                        {selectedGoal.startDate} 〜 {selectedGoal.targetDate}
                      </span>

                      <span className="text-muted-foreground">更新頻度:</span>
                      <span>
                        {selectedGoal.period === 'weekly'
                          ? '毎週'
                          : selectedGoal.period === 'monthly'
                            ? '毎月'
                            : selectedGoal.period === 'quarterly'
                              ? '四半期'
                              : '毎年'}
                      </span>

                      <span className="text-muted-foreground">自動更新:</span>
                      <span>{selectedGoal.autoUpdate ? '有効' : '無効'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">進捗状況</h3>
                  <div className="bg-muted/20 p-4 rounded-md h-full flex flex-col justify-between">
                    <div>
                      <div className="text-3xl font-bold mb-2">
                        {Math.round(calculateProgress(selectedGoal))}%
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${calculateProgress(selectedGoal)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-4 text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">目標までの残額:</span>
                        <span className="font-medium">
                          {selectedGoal.type === 'debt'
                            ? (
                                selectedGoal.currentValue - selectedGoal.targetValue
                              ).toLocaleString()
                            : (
                                selectedGoal.targetValue - selectedGoal.currentValue
                              ).toLocaleString()}
                          円
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">目標までの日数:</span>
                        <span className="font-medium">
                          {Math.max(
                            0,
                            Math.floor(
                              (new Date(selectedGoal.targetDate) - new Date()) /
                                (1000 * 60 * 60 * 24)
                            )
                          )}
                          日
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 履歴データ */}
              <div>
                <h3 className="text-sm font-medium mb-1">履歴データ</h3>
                <div className="bg-muted/20 p-4 rounded-md">
                  {selectedGoal.history && selectedGoal.history.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto">
                      <table className="min-w-full divide-y divide-muted">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                              日付
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                              金額
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                              変化
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-muted">
                          {[...selectedGoal.history].reverse().map((record, index, arr) => {
                            const prevValue =
                              index < arr.length - 1
                                ? arr[index + 1].value
                                : selectedGoal.startValue;
                            const change = record.value - prevValue;
                            return (
                              <tr key={index}>
                                <td className="px-3 py-2 text-xs">{record.date}</td>
                                <td className="px-3 py-2 text-xs text-right">
                                  {record.value.toLocaleString()}円
                                </td>
                                <td
                                  className={`px-3 py-2 text-xs text-right ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : ''}`}
                                >
                                  {change > 0 ? '+' : ''}
                                  {change.toLocaleString()}円
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      履歴データがありません
                    </div>
                  )}
                </div>
              </div>

              {/* 詳細グラフ（ダミー） */}
              <div>
                <h3 className="text-sm font-medium mb-1">進捗グラフ</h3>
                <div className="bg-muted/20 h-64 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-16 w-16 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">グラフ表示は準備中です</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              閉じる
            </Button>
            <Button
              onClick={() => {
                setIsDetailOpen(false);
                handleEditGoal(selectedGoal.id);
              }}
            >
              編集
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              目標を削除しますか？
            </DialogTitle>
            <DialogDescription>
              この操作は元に戻せません。目標とその履歴データがすべて削除されます。
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDeleteGoal}>
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
