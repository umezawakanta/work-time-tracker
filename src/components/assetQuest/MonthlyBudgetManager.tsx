import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  PlusCircle,
  MinusCircle,
  Target,
  TrendingDown,
  TrendingUp,
  Edit,
  Save,
  X,
} from 'lucide-react';

interface CurrentMonth {
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
  target: number;
  daysRemaining: number;
}

interface MonthlyBudgetManagerProps {
  currentMonth: CurrentMonth;
  onExpenseUpdate: (expenses: number) => void;
}

interface ExpenseCategory {
  id: string;
  name: string;
  amount: number;
  budget: number;
  icon: string;
  color: string;
}

export const MonthlyBudgetManager: React.FC<MonthlyBudgetManagerProps> = ({
  currentMonth,
  onExpenseUpdate,
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [newExpenseAmount, setNewExpenseAmount] = useState<string>('');
  const [newExpenseCategory, setNewExpenseCategory] = useState<string>('その他');

  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([
    {
      id: 'food',
      name: '食費',
      amount: 50000,
      budget: 60000,
      icon: '🍽️',
      color: 'bg-orange-100 text-orange-800',
    },
    {
      id: 'housing',
      name: '住居費',
      amount: 80000,
      budget: 85000,
      icon: '🏠',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'transport',
      name: '交通費',
      amount: 15000,
      budget: 20000,
      icon: '🚗',
      color: 'bg-green-100 text-green-800',
    },
    {
      id: 'entertainment',
      name: '娯楽費',
      amount: 25000,
      budget: 30000,
      icon: '🎮',
      color: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'utilities',
      name: '水道光熱費',
      amount: 12000,
      budget: 15000,
      icon: '⚡',
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      id: 'other',
      name: 'その他',
      amount: 18000,
      budget: 25000,
      icon: '📦',
      color: 'bg-gray-100 text-gray-800',
    },
  ]);

  const totalBudget = expenseCategories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = expenseCategories.reduce((sum, cat) => sum + cat.amount, 0);
  const remainingBudget = totalBudget - totalSpent;
  const budgetProgress = (totalSpent / totalBudget) * 100;

  const handleEditStart = (categoryId: string, currentAmount: number) => {
    setEditingCategory(categoryId);
    setEditAmount(currentAmount.toString());
  };

  const handleEditSave = (categoryId: string) => {
    const amount = parseInt(editAmount) || 0;
    const updatedCategories = expenseCategories.map((cat) =>
      cat.id === categoryId ? { ...cat, amount } : cat
    );
    setExpenseCategories(updatedCategories);

    const newTotalSpent = updatedCategories.reduce((sum, cat) => sum + cat.amount, 0);
    onExpenseUpdate(newTotalSpent);

    setEditingCategory(null);
    setEditAmount('');
  };

  const handleEditCancel = () => {
    setEditingCategory(null);
    setEditAmount('');
  };

  const addNewExpense = () => {
    const amount = parseInt(newExpenseAmount) || 0;
    if (amount > 0) {
      const categoryId = newExpenseCategory.toLowerCase().replace(/\s+/g, '-');
      const existingCategory = expenseCategories.find((cat) => cat.id === categoryId);

      if (existingCategory) {
        // 既存カテゴリに追加
        const updatedCategories = expenseCategories.map((cat) =>
          cat.id === categoryId ? { ...cat, amount: cat.amount + amount } : cat
        );
        setExpenseCategories(updatedCategories);
      } else {
        // 新しいカテゴリを追加
        const newCategory: ExpenseCategory = {
          id: categoryId,
          name: newExpenseCategory,
          amount,
          budget: amount * 1.2, // 20%のバッファを設定
          icon: '💰',
          color: 'bg-indigo-100 text-indigo-800',
        };
        setExpenseCategories([...expenseCategories, newCategory]);
      }

      const newTotalSpent = totalSpent + amount;
      onExpenseUpdate(newTotalSpent);

      setNewExpenseAmount('');
      setNewExpenseCategory('その他');
    }
  };

  return (
    <div className="space-y-6">
      {/* 予算概要 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            今月の予算管理
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                ¥{currentMonth.income.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">今月の収入</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">¥{totalSpent.toLocaleString()}</div>
              <div className="text-sm text-gray-600">支出合計</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ¥{(currentMonth.income - totalSpent).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">残り貯蓄</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {(((currentMonth.income - totalSpent) / currentMonth.income) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">貯蓄率</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">予算使用率</span>
              <span className="text-sm text-gray-600">
                ¥{totalSpent.toLocaleString()} / ¥{totalBudget.toLocaleString()}
              </span>
            </div>
            <Progress value={budgetProgress} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>残り予算: ¥{remainingBudget.toLocaleString()}</span>
              <span>残り {currentMonth.daysRemaining} 日</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* カテゴリ別支出管理 */}
      <Card>
        <CardHeader>
          <CardTitle>カテゴリ別支出</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenseCategories.map((category) => (
              <div key={category.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      <div className="text-sm text-gray-600">
                        予算: ¥{category.budget.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingCategory === category.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-24"
                          placeholder="金額"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleEditSave(category.id)}
                          className="p-2"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEditCancel}
                          className="p-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            ¥{category.amount.toLocaleString()}
                          </div>
                          <Badge
                            variant={category.amount <= category.budget ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {category.amount <= category.budget ? '予算内' : '予算超過'}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditStart(category.id, category.amount)}
                          className="p-2"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <Progress value={(category.amount / category.budget) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 新しい支出追加 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-green-600" />
            支出を追加
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">カテゴリ</label>
              <Input
                value={newExpenseCategory}
                onChange={(e) => setNewExpenseCategory(e.target.value)}
                placeholder="例: 食費、交通費など"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">金額</label>
              <Input
                type="number"
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <Button onClick={addNewExpense} className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              追加
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
