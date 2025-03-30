'use client'

import { useEffect, useState, useCallback } from "react";  // useCallbackをインポート
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { AssetCalendar } from "@/components/calendar/AssetCalendar";
import { fetchAssetEntries } from "@/store/assetSlice";
import { fetchDebtEntries } from "@/store/debtSlice";
import {
  fetchWithdrawalEntries,
  addWithdrawalEntry,
  deleteWithdrawalEntry,
  WithdrawalEntry,
} from "@/store/withdrawalSlice";
import { fetchSubscriptions } from "@/store/subscriptionSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowUpCircle, BarChart2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DataPoint {
  date: Date;
  value: number;
  account: string;
}

// スケルトンローディングコンポーネント
const PageSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-10 w-32" />
    </div>
    <Skeleton className="h-[650px] w-full" />
  </div>
);

// エラーアラートコンポーネント
const ErrorAlert = ({ message, onRetry }) => (
  <Alert variant="destructive" className="my-4">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>エラーが発生しました</AlertTitle>
    <AlertDescription className="flex justify-between items-center">
      <span>{message}</span>
      <button
        onClick={onRetry}
        className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded text-sm"
      >
        再試行
      </button>
    </AlertDescription>
  </Alert>
);

// 収益目標達成度カード
const IncomeGoalCard = ({ currentIncome, targetIncome, className = "" }) => {
  const percentage = Math.min(Math.round((currentIncome / targetIncome) * 100), 100);
  
  return (
    <Card className={`${className} overflow-hidden`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-sm">収入目標達成度</h3>
          <ArrowUpCircle className="h-4 w-4 text-green-500" />
        </div>
        <div className="mb-2">
          <div className="text-2xl font-bold">{percentage}%</div>
          <div className="text-sm text-muted-foreground">
            {currentIncome.toLocaleString()}円 / {targetIncome.toLocaleString()}円
          </div>
        </div>
        <Progress value={percentage} className="h-2" />
      </CardContent>
    </Card>
  );
};

// 支出分析カード
const ExpenseAnalysisCard = ({ fixedCosts, variableCosts, className = "" }) => {
  const total = fixedCosts + variableCosts;
  const fixedPercentage = total > 0 ? Math.round((fixedCosts / total) * 100) : 0;
  const variablePercentage = total > 0 ? 100 - fixedPercentage : 0;
  
  return (
    <Card className={`${className} overflow-hidden`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-sm">支出分析</h3>
          <BarChart2 className="h-4 w-4 text-blue-500" />
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span>固定費</span>
          <span>{fixedPercentage}%</span>
        </div>
        <Progress value={fixedPercentage} className="h-2 mb-2" />
        <div className="flex justify-between text-sm mb-1">
          <span>変動費</span>
          <span>{variablePercentage}%</span>
        </div>
        <Progress value={variablePercentage} className="h-2" />
      </CardContent>
    </Card>
  );
};

export function AssetCalendarPage() {
  const dispatch = useDispatch<AppDispatch>();
  const assetEntries = useSelector((state: RootState) => state.asset.entries);
  const debtEntries = useSelector((state: RootState) => state.debt.entries);
  const withdrawalEntries = useSelector((state: RootState) => state.withdrawal.entries);
  const subscriptions = useSelector((state: RootState) => state.subscription.subscriptions);
  
  const assetStatus = useSelector((state: RootState) => state.asset.status);
  const debtStatus = useSelector((state: RootState) => state.debt.status);
  const withdrawalStatus = useSelector((state: RootState) => state.withdrawal.status);
  const subscriptionStatus = useSelector((state: RootState) => state.subscription.status);
  
  const assetError = useSelector((state: RootState) => state.asset.error);
  const debtError = useSelector((state: RootState) => state.debt.error);
  const withdrawalError = useSelector((state: RootState) => state.withdrawal.error);
  const subscriptionError = useSelector((state: RootState) => state.subscription.error);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [incomeGoal] = useState(1000000); // 仮の収入目標額

  // useCallbackを使ってloadAllData関数をメモ化
  const loadAllData = useCallback(() => {
    if (assetStatus === "idle" || assetStatus === "failed") dispatch(fetchAssetEntries());
    if (debtStatus === "idle" || debtStatus === "failed") dispatch(fetchDebtEntries());
    if (withdrawalStatus === "idle" || withdrawalStatus === "failed") dispatch(fetchWithdrawalEntries());
    if (subscriptionStatus === "idle" || subscriptionStatus === "failed") dispatch(fetchSubscriptions());
  }, [dispatch, assetStatus, debtStatus, withdrawalStatus, subscriptionStatus]);
  // 依存配列にdispatchと各ステータス変数を含める

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const combinedData: DataPoint[] = [
    ...assetEntries.map((entry) => ({ ...entry, date: new Date(entry.date) })),
    ...debtEntries.map((entry) => ({
      ...entry,
      date: new Date(entry.date),
      value: -entry.value,
    })),
  ];

  const withdrawals: WithdrawalEntry[] = withdrawalEntries.map((entry) => ({
    ...entry,
    date: entry.date,
  }));

  const handleAddWithdrawal = async (newWithdrawal: Omit<WithdrawalEntry, "_id">) => {
    try {
      await dispatch(addWithdrawalEntry(newWithdrawal)).unwrap();
    } catch (error) {
      console.error("引き落としの追加に失敗しました:", error);
    }
  };

  const handleDeleteWithdrawal = async (withdrawalId: string) => {
    try {
      await dispatch(deleteWithdrawalEntry(withdrawalId)).unwrap();
    } catch (error) {
      console.error("引き落としの削除に失敗しました:", error);
    }
  };

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
  };

  // ローディング中の表示
  const isLoading = 
    assetStatus === "loading" ||
    debtStatus === "loading" ||
    withdrawalStatus === "loading" ||
    subscriptionStatus === "loading";

  // エラーが発生したかどうか
  const hasError = 
    assetStatus === "failed" ||
    debtStatus === "failed" ||
    withdrawalStatus === "failed" ||
    subscriptionStatus === "failed";

  // エラーメッセージを取得
  const getErrorMessage = () => {
    if (assetError) return `資産データの取得に失敗: ${assetError}`;
    if (debtError) return `負債データの取得に失敗: ${debtError}`;
    if (withdrawalError) return `引き落としデータの取得に失敗: ${withdrawalError}`;
    if (subscriptionError) return `サブスクリプションデータの取得に失敗: ${subscriptionError}`;
    return "データの取得中にエラーが発生しました。";
  };

  // 現在の月の固定費と変動費を計算（仮の値）
  const fixedCosts = withdrawalEntries.reduce((sum, w) => sum + w.amount, 0) +
                     subscriptions.reduce((sum, s) => sum + s.amount, 0);
  const variableCosts = 150000; // 仮の変動費

  // 現在の月の収入（仮の計算）
  const currentIncome = Math.max(
    assetEntries.reduce((sum, a) => {
      const entryDate = new Date(a.date);
      if (entryDate.getMonth() === currentMonth.getMonth() && 
          entryDate.getFullYear() === currentMonth.getFullYear()) {
        return sum + a.value;
      }
      return sum;
    }, 0),
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">資産増減カレンダー</h1>
          <div className="flex space-x-4">
            <IncomeGoalCard currentIncome={currentIncome} targetIncome={incomeGoal} className="w-48" />
            <ExpenseAnalysisCard fixedCosts={fixedCosts} variableCosts={variableCosts} className="w-48" />
          </div>
        </div>

        {hasError && (
          <ErrorAlert
            message={getErrorMessage()}
            onRetry={loadAllData}
          />
        )}

        {isLoading ? (
          <PageSkeleton />
        ) : (
          <AssetCalendar
            data={combinedData}
            withdrawals={withdrawals}
            subscriptions={subscriptions}
            onAddWithdrawal={handleAddWithdrawal}
            onDeleteWithdrawal={handleDeleteWithdrawal}
            onMonthChange={handleMonthChange}
          />
        )}
      </div>
    </div>
  );
}