import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Building2,
} from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { toast } from 'sonner';

interface TransactionListProps {
  userId: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({ userId }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // 取引明細データを取得
  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/transactions?userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        setTransactions(result.transactions || []);
      } else {
        console.error('Failed to fetch transactions:', result.message);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // 銀行口座データを取得
  const fetchBankAccounts = async () => {
    try {
      const response = await fetch(`/api/bank-accounts?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        // APIレスポンスの構造に応じて配列を取得
        if (data.success && Array.isArray(data.data)) {
          setBankAccounts(data.data);
        } else if (data.success && Array.isArray(data.accounts)) {
          setBankAccounts(data.accounts);
        } else if (Array.isArray(data)) {
          setBankAccounts(data);
        } else {
          console.error('Invalid bank accounts data structure:', data);
          setBankAccounts([]);
        }
      } else {
        console.error('Failed to fetch bank accounts');
        setBankAccounts([]);
      }
    } catch (error) {
      console.error('Failed to fetch bank accounts:', error);
      setBankAccounts([]);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchBankAccounts();
  }, [userId]);

  // 日付範囲の判定
  const isWithinDateRange = (date: string, range: string): boolean => {
    const transactionDate = new Date(date);
    const now = new Date();

    switch (range) {
      case 'today':
        return transactionDate.toDateString() === now.toDateString();
      case 'week': {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return transactionDate >= weekAgo;
      }
      case 'month': {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return transactionDate >= monthAgo;
      }
      case 'year': {
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return transactionDate >= yearAgo;
      }
      default:
        return true;
    }
  };

  // 重複を除去し、CSVの並び順でソートされた取引明細を取得
  const getUniqueTransactions = (transactions: Transaction[]) => {
    // 日付、説明、金額で重複を判定
    const uniqueMap = new Map();

    transactions.forEach((transaction) => {
      const key = `${transaction.date}_${transaction.description}_${transaction.amount}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, transaction);
      }
    });

    // CSVの並び順でソート（csvOrderが小さいほど新しい、同じ場合は日付順）
    return Array.from(uniqueMap.values()).sort((a, b) => {
      // csvOrderが存在する場合はそれでソート
      if (a.csvOrder !== undefined && b.csvOrder !== undefined) {
        return a.csvOrder - b.csvOrder; // 小さいほど新しい（CSVの上）
      }
      // csvOrderが存在しない場合は日付順（新しい順）
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };

  // フィルタリングされた取引明細
  const filteredTransactions = getUniqueTransactions(transactions).filter((transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
    const matchesDate = dateFilter === 'all' || isWithinDateRange(transaction.date, dateFilter);
    const matchesAccount = accountFilter === 'all' || transaction.accountId === accountFilter;

    return matchesSearch && matchesCategory && matchesDate && matchesAccount;
  });

  // カテゴリの一覧を取得
  const categories = Array.from(new Set(transactions.map((t) => t.category)));

  // 収支の計算（残高の差分から計算、口座別に集計）
  const calculateIncomeExpense = () => {
    if (filteredTransactions.length === 0) {
      return { totalIncome: 0, totalExpense: 0, netAmount: 0 };
    }

    // 口座別に取引明細をグループ化
    const transactionsByAccount = filteredTransactions.reduce(
      (acc, transaction) => {
        const accountId = transaction.accountId || 'unknown';
        if (!acc[accountId]) {
          acc[accountId] = [];
        }
        acc[accountId].push(transaction);
        return acc;
      },
      {} as Record<string, Transaction[]>
    );

    let totalIncome = 0;
    let totalExpense = 0;

    // 各口座ごとに収支を計算
    Object.values(transactionsByAccount).forEach((accountTransactions) => {
      // 口座内でCSVの並び順でソート（csvOrderが小さいほど新しい）
      const sortedTransactions = (accountTransactions as Transaction[]).sort((a, b) => {
        if (a.csvOrder !== undefined && b.csvOrder !== undefined) {
          return a.csvOrder - b.csvOrder;
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      // 残高の順序で計算（新しい明細から古い明細へ）
      for (let i = 0; i < sortedTransactions.length - 1; i++) {
        const currentBalance = sortedTransactions[i].amount;
        const nextBalance = sortedTransactions[i + 1].amount;
        const difference = currentBalance - nextBalance; // 現在の残高 - 次の残高

        if (difference > 0) {
          totalIncome += difference; // 残高が増加 = 収入
        } else if (difference < 0) {
          totalExpense += Math.abs(difference); // 残高が減少 = 支出
        }
      }
    });

    return {
      totalIncome,
      totalExpense,
      netAmount: totalIncome - totalExpense,
    };
  };

  const { totalIncome, totalExpense, netAmount } = calculateIncomeExpense();

  // 取引明細の削除
  const handleDelete = async (transactionId: string) => {
    if (!confirm('この取引明細を削除しますか？')) return;

    try {
      const response = await fetch('/api/transactions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          transactionId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('取引明細を削除しました');
        fetchTransactions();
      } else {
        toast.error(result.message || '削除に失敗しました');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('削除中にエラーが発生しました');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">取引明細を読み込み中...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">収入</p>
                <p className="text-2xl font-bold text-green-900">¥{totalIncome.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">支出</p>
                <p className="text-2xl font-bold text-red-900">¥{totalExpense.toLocaleString()}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${netAmount >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">純収支</p>
                <p
                  className={`text-2xl font-bold ${netAmount >= 0 ? 'text-blue-900' : 'text-orange-900'}`}
                >
                  ¥{netAmount.toLocaleString()}
                </p>
              </div>
              <DollarSign
                className={`h-8 w-8 ${netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'}`}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* フィルターと検索 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            取引明細一覧
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="取引内容で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="カテゴリで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのカテゴリ</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="期間で絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての期間</SelectItem>
                <SelectItem value="today">今日</SelectItem>
                <SelectItem value="week">過去1週間</SelectItem>
                <SelectItem value="month">過去1ヶ月</SelectItem>
                <SelectItem value="year">過去1年</SelectItem>
              </SelectContent>
            </Select>

            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="口座で絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての口座</SelectItem>
                {Array.isArray(bankAccounts) &&
                  bankAccounts.map((account) => (
                    <SelectItem key={account._id} value={account._id}>
                      {account.bankName} {account.branchName ? `${account.branchName} ` : ''}
                      {account.accountName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              取引を追加
            </Button>
          </div>

          {/* 取引明細テーブル */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日付</TableHead>
                  <TableHead>取引内容</TableHead>
                  <TableHead>カテゴリ</TableHead>
                  <TableHead>口座</TableHead>
                  <TableHead className="text-right">金額</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      取引明細がありません
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(transaction.date).toLocaleDateString('ja-JP')}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{transaction.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {transaction.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {(() => {
                              if (!Array.isArray(bankAccounts)) return '不明な口座';
                              const account = bankAccounts.find(
                                (acc) => acc._id === transaction.accountId
                              );
                              return account
                                ? `${account.bankName} ${account.branchName ? `${account.branchName} ` : ''}${account.accountName}`
                                : '不明な口座';
                            })()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {(() => {
                          // 残高の差分を計算（CSVの並び順：上から下へ古くなる）
                          const currentIndex = filteredTransactions.findIndex(
                            (t) => t._id === transaction._id
                          );

                          let difference = 0;
                          if (currentIndex < filteredTransactions.length - 1) {
                            // 次の明細（古い明細）との差分を計算
                            const nextBalance = filteredTransactions[currentIndex + 1].amount;
                            difference = transaction.amount - nextBalance;
                          } else {
                            // 最後の明細（最も古い）の場合は0
                            difference = 0;
                          }

                          return (
                            <div className="text-right">
                              <div className="text-sm text-gray-500">
                                残高: ¥
                                {(transaction.balance || transaction.amount).toLocaleString()}
                              </div>
                              <div
                                className={`font-semibold ${
                                  difference > 0
                                    ? 'text-green-600'
                                    : difference < 0
                                      ? 'text-red-600'
                                      : 'text-gray-600'
                                }`}
                              >
                                {difference > 0 ? '+' : ''}¥{difference.toLocaleString()}
                              </div>
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              /* TODO: 編集機能 */
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(transaction._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* ページネーション情報 */}
          <div className="mt-4 text-sm text-gray-500 text-center">
            {filteredTransactions.length}件中 {filteredTransactions.length}件を表示
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
