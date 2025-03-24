// GoalManagement.tsx
import React, { useState } from "react";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, Trash2, Plus, Filter, ArrowUp, ArrowDown, CheckCircle2 } from "lucide-react";
import { Goal, GoalCategory } from "@/types";

interface GoalManagementProps {
  goals: Goal[];
  saveGoals: (goals: Goal[]) => void;
  newGoal: string;
  setNewGoal: (value: string) => void;
  newGoalCategory: string;
  setNewGoalCategory: (value: string) => void;
  newGoalDate: string;
  setNewGoalDate: (value: string) => void;
  handleAddGoal: (e: React.FormEvent) => void;
  handleToggleGoal: (id: string) => void;
  handleDeleteGoal: (id: string) => void;
  goalCategories: GoalCategory[];
}

const GoalManagement: React.FC<GoalManagementProps> = ({
  goals,
  saveGoals,
  newGoal,
  setNewGoal,
  newGoalCategory,
  setNewGoalCategory,
  newGoalDate,
  setNewGoalDate,
  handleAddGoal,
  handleToggleGoal,
  handleDeleteGoal,
  goalCategories,
}) => {
  const [sortOption, setSortOption] = useState("default");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // 目標の更新
  const handleUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;
    
    const updatedGoals = goals.map((goal) => 
      goal.id === editingGoal.id 
        ? {
            ...goal,
            description: newGoal,
            category: newGoalCategory,
            targetDate: newGoalDate || undefined,
          }
        : goal
    );
    
    saveGoals(updatedGoals);
    setEditingGoal(null);
    setNewGoal("");
    setNewGoalCategory("daily");
    setNewGoalDate("");
  };

  // 目標の編集開始
  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setNewGoal(goal.description);
    setNewGoalCategory(goal.category);
    setNewGoalDate(goal.targetDate || "");
  };

  // 表示する目標のソートとフィルタリング
  const filteredAndSortedGoals = () => {
    // まずフィルタリング
    let filtered = goals;
    
    if (filterCategory !== "all") {
      filtered = filtered.filter(goal => goal.category === filterCategory);
    }
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(goal => 
        (filterStatus === "completed" && goal.completed) ||
        (filterStatus === "active" && !goal.completed)
      );
    }
    
    // 次にソート
    return filtered.sort((a, b) => {
      // デフォルトのソート：完了していない目標を先に、期限順に
      if (sortOption === "default") {
        // 完了フラグで優先度付け
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        
        // 目標日がある場合は期限順
        if (a.targetDate && b.targetDate) {
          return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        }
        
        // 目標日がある方を優先
        if (a.targetDate) return -1;
        if (b.targetDate) return 1;
        
        // 最後は作成順（新しい順）
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      
      // 期限順
      if (sortOption === "dueDate") {
        // 期限がない場合は後ろに
        if (!a.targetDate && !b.targetDate) return 0;
        if (!a.targetDate) return 1;
        if (!b.targetDate) return -1;
        
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
      }
      
      // カテゴリー順
      if (sortOption === "category") {
        return a.category.localeCompare(b.category);
      }
      
      // 新しい順
      if (sortOption === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      
      return 0;
    });
  };

  // 期限切れかどうかをチェック
  const isOverdue = (goal: Goal) => {
    if (!goal.targetDate || goal.completed) return false;
    return new Date(goal.targetDate) < new Date();
  };
  
  // 目標達成率
  const completionRate = Math.round((goals.filter(goal => goal.completed).length / (goals.length || 1)) * 100);
  
  // カテゴリーごとの達成率
  const categoryCompletionRates = goalCategories.map(category => {
    const categoryGoals = goals.filter(goal => goal.category === category.value);
    const completed = categoryGoals.filter(goal => goal.completed).length;
    const total = categoryGoals.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      category: category,
      rate: rate,
      completed: completed,
      total: total
    };
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{editingGoal ? "目標を編集" : "新しい目標"}</CardTitle>
          <CardDescription>
            {editingGoal 
              ? "目標の詳細を編集してください" 
              : "自己肯定感を高めるための具体的な目標を設定しましょう"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={editingGoal ? handleUpdateGoal : handleAddGoal} className="space-y-4">
            <div>
              <Label htmlFor="goal-input">目標内容</Label>
              <Input
                id="goal-input"
                placeholder="目標を入力"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goal-category">カテゴリー</Label>
                <Select
                  value={newGoalCategory}
                  onValueChange={setNewGoalCategory}
                >
                  <SelectTrigger id="goal-category">
                    <SelectValue placeholder="カテゴリーを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {goalCategories.map((category) => (
                      <SelectItem
                        key={category.value}
                        value={category.value}
                      >
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="goal-date">目標日（任意）</Label>
                <Input
                  id="goal-date"
                  type="date"
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              {editingGoal ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  目標を更新
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  目標を追加
                </>
              )}
            </Button>
            
            {editingGoal && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  setEditingGoal(null);
                  setNewGoal("");
                  setNewGoalCategory("daily");
                  setNewGoalDate("");
                }}
              >
                キャンセル
              </Button>
            )}
          </form>
          
          {/* 目標達成率 */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium mb-2">進捗状況</h4>
            <div className="flex items-center justify-between mb-1">
              <span>全体の達成率</span>
              <span>{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            
            {/* カテゴリー別達成率 */}
            <div className="mt-4 space-y-2">
              {categoryCompletionRates
                .filter(item => item.total > 0)
                .map(item => (
                <div key={item.category.value}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.category.label}</span>
                    <span>{item.completed}/{item.total} ({item.rate}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full" 
                      style={{ width: `${item.rate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>目標リスト</CardTitle>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge
              variant={filterStatus === "all" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterStatus("all")}
            >
              すべて ({goals.length})
            </Badge>
            <Badge
              variant={filterStatus === "active" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterStatus("active")}
            >
              進行中 ({goals.filter(g => !g.completed).length})
            </Badge>
            <Badge
              variant={filterStatus === "completed" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterStatus("completed")}
            >
              完了 ({goals.filter(g => g.completed).length})
            </Badge>
            
            {/* 並び替えとフィルタリング */}
            <div className="ml-auto flex gap-1">
              <Select
                value={filterCategory}
                onValueChange={setFilterCategory}
              >
                <SelectTrigger className="h-8 w-32">
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  <SelectValue placeholder="フィルター" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのカテゴリー</SelectItem>
                  {goalCategories.map((category) => (
                    <SelectItem
                      key={category.value}
                      value={category.value}
                    >
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={sortOption}
                onValueChange={setSortOption}
              >
                <SelectTrigger className="h-8 w-32">
                  {sortOption === "default" ? (
                    <ArrowDown className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <ArrowUp className="h-3.5 w-3.5 mr-1" />
                  )}
                  <SelectValue placeholder="並び替え" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">デフォルト</SelectItem>
                  <SelectItem value="dueDate">期限順</SelectItem>
                  <SelectItem value="category">カテゴリー別</SelectItem>
                  <SelectItem value="newest">新しい順</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {goals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>目標がありません。新しい目標を追加しましょう！</p>
                </div>
              ) : filteredAndSortedGoals().length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>条件に一致する目標がありません</p>
                </div>
              ) : (
                filteredAndSortedGoals().map((goal) => (
                  <div
                    key={goal.id}
                    className={`flex items-center justify-between p-3 rounded-md border ${
                      goal.completed
                        ? "bg-green-50 border-green-200"
                        : isOverdue(goal)
                        ? "bg-red-50 border-red-200"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={`goal-${goal.id}`}
                        checked={goal.completed}
                        onChange={() => handleToggleGoal(goal.id)}
                        className="form-checkbox h-5 w-5 text-blue-600 rounded-sm"
                        title={`目標を完了としてマーク: ${goal.description}`}
                        aria-label={`目標を完了としてマーク: ${goal.description}`}
                      />
                      <div>
                        <Label
                          htmlFor={`goal-${goal.id}`}
                          className={`${
                            goal.completed
                              ? "line-through text-gray-500"
                              : ""
                          }`}
                        >
                          {goal.description}
                        </Label>
                        <div className="flex items-center mt-1 space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {goalCategories.find(
                              (c) => c.value === goal.category
                            )?.label || "日常習慣"}
                          </Badge>
                          {goal.targetDate && (
                            <span className={`text-xs ${
                              isOverdue(goal)
                              ? "text-red-500 font-medium"
                              : "text-gray-500"
                            }`}>
                              目標日:{" "}
                              {format(
                                new Date(goal.targetDate),
                                "yyyy/MM/dd"
                              )}
                              {isOverdue(goal) && " (期限切れ)"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(goal)}
                        aria-label={`目標を編集: ${goal.description}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal.id)}
                        aria-label={`目標を削除: ${goal.description}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalManagement;