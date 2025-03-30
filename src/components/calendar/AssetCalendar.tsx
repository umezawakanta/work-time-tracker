"use client";

import { useMemo, useState, useCallback, useEffect, Suspense } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { EventContentArg, DatesSetArg } from "@fullcalendar/core";
import { CalendarApi } from "@fullcalendar/core";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  isSameDay,
  parseISO,
  parse,
  subDays,
  isWithinInterval,
  subMonths,
} from "date-fns";
import { utcToZonedTime, format as formatTZ } from "date-fns-tz";
import { ja } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Trash2,
  PlusCircle,
  Calendar,
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import "./AssetCalendar.css";
import { SubscriptionService } from "@/types";

interface DataPoint {
  date: Date;
  value: number;
  account: string;
}

interface WithdrawalEntry {
  _id?: string;
  date: string;
  bank: string;
  branch: string;
  amount: number;
  description: string;
}

interface MonthlySummary {
  income: number;
  expenses: number;
  balance: number;
  totalWithdrawals: number;
  totalSubscriptions: number;
  fixedCosts: number;
  availableVariableExpenses: number;
}

interface AssetCalendarProps {
  data: DataPoint[];
  withdrawals: WithdrawalEntry[];
  subscriptions: SubscriptionService[];
  onAddWithdrawal: (withdrawal: Omit<WithdrawalEntry, "_id">) => void;
  onDeleteWithdrawal: (withdrawalId: string) => void;
  onMonthChange: (newMonth: Date) => void;
}

// スケルトンローダー（カレンダー用）
const CalendarSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-32" />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
    <div className="grid grid-cols-7 gap-2">
      {Array(7)
        .fill(0)
        .map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-8" />
        ))}
      {Array(35)
        .fill(0)
        .map((_, i) => (
          <Skeleton key={`cell-${i}`} className="h-28" />
        ))}
    </div>
  </div>
);

// サマリーカードコンポーネント
const SummaryCard = ({
  title,
  value,
  isPositive,
  icon: Icon,
  previous,
  showTrend = true,
}) => {
  const percentChange =
    previous && previous !== 0
      ? ((value - previous) / Math.abs(previous)) * 100
      : 0;

  return (
    <div className="card-container transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-md font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <Icon
              className={`h-4 w-4 ${
                isPositive ? "text-green-500" : "text-red-500"
              }`}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value.toLocaleString()}円</div>
          {showTrend && previous !== undefined && (
            <div className="flex items-center mt-2">
              {percentChange > 0 ? (
                <ArrowUpCircle className="h-4 w-4 text-green-500 mr-1" />
              ) : percentChange < 0 ? (
                <ArrowDownCircle className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <RefreshCw className="h-4 w-4 text-gray-500 mr-1" />
              )}
              <span
                className={`text-sm ${
                  percentChange > 0
                    ? "text-green-500"
                    : percentChange < 0
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {percentChange !== 0
                  ? `${Math.abs(percentChange).toFixed(1)}%`
                  : "0%"}
                {percentChange > 0
                  ? " 増加"
                  : percentChange < 0
                  ? " 減少"
                  : " 変化なし"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export function AssetCalendar({
  data,
  withdrawals,
  subscriptions,
  onAddWithdrawal,
  onDeleteWithdrawal,
  onMonthChange,
}: AssetCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [previousMonth, setPreviousMonth] = useState(subMonths(new Date(), 1));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [newWithdrawal, setNewWithdrawal] = useState<
    Omit<WithdrawalEntry, "_id" | "date">
  >({
    bank: "",
    branch: "",
    amount: 0,
    description: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [calendarApi, setCalendarApi] = useState<CalendarApi | null>(null);

  // ローディング状態をシミュレート
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (calendarApi) {
      calendarApi.refetchEvents();
    }
  }, [withdrawals, subscriptions, calendarApi]);

  // 現在の月が変更されたとき、前月も更新
  useEffect(() => {
    setPreviousMonth(subMonths(currentMonth, 1));
  }, [currentMonth]);

  // データの処理
  const processedData = useMemo(() => {
    const sortedData = data.sort((a, b) => a.date.getTime() - b.date.getTime());
    const accountData: Record<string, { date: Date; value: number }[]> = {};

    sortedData.forEach((point) => {
      if (!accountData[point.account]) {
        accountData[point.account] = [];
      }
      accountData[point.account].push({ date: point.date, value: point.value });
    });

    const filledData: DataPoint[] = [];
    Object.entries(accountData).forEach(([account, points]) => {
      if (points.length === 0) return;
      let lastValue = points[0].value;
      const allDates = Array.from(
        new Set(sortedData.map((d) => d.date.toISOString().split("T")[0]))
      )
        .sort()
        .map((dateStr) => new Date(dateStr));

      allDates.forEach((date) => {
        const point = points.find(
          (p) =>
            p.date.toISOString().split("T")[0] ===
            date.toISOString().split("T")[0]
        );
        if (point) {
          lastValue = point.value;
        }
        filledData.push({ date, value: lastValue, account });
      });
    });

    return filledData;
  }, [data]);

  // データの集計
  const aggregatedData = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};
    processedData.forEach((item) => {
      const dateStr = item.date.toISOString().split("T")[0];
      if (!result[dateStr]) {
        result[dateStr] = {};
      }
      result[dateStr][item.account] = item.value;
    });

    Object.keys(result).forEach((dateStr) => {
      result[dateStr]["合計"] = Object.values(result[dateStr]).reduce(
        (sum, value) => sum + value,
        0
      );
    });

    return result;
  }, [processedData]);

  // イベントの生成
  const events = useMemo(() => {
    const allDates = new Set([
      ...Object.keys(aggregatedData),
      ...withdrawals.map((w) => w.date),
      ...subscriptions.map((s) => String(s.billingDate).replace(/\//g, "-")),
    ]);
    const sortedDates = Array.from(allDates).sort();
    if (sortedDates.length === 0) return [];

    const firstDataDate = sortedDates[0];
    const firstDataTotal = aggregatedData[firstDataDate]?.["合計"] || 0;

    return sortedDates.map((date) => {
      const currentDate = utcToZonedTime(new Date(date), "Asia/Tokyo");
      const prevDate = subDays(currentDate, 1);
      const prevDateStr = formatTZ(prevDate, "yyyy-MM-dd", {
        timeZone: "Asia/Tokyo",
      });

      const dailyChange =
        (aggregatedData[date]?.["合計"] || 0) -
        (aggregatedData[prevDateStr]?.["合計"] || 0);

      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekStartStr = formatTZ(weekStart, "yyyy-MM-dd", {
        timeZone: "Asia/Tokyo",
      });
      const weekStartTotal = aggregatedData[weekStartStr]?.["合計"] || 0;
      const weeklyChange =
        (aggregatedData[date]?.["合計"] || 0) - weekStartTotal;

      const monthStart = startOfMonth(currentDate);
      const monthStartStr = formatTZ(monthStart, "yyyy-MM-dd", {
        timeZone: "Asia/Tokyo",
      });
      const monthStartTotal = aggregatedData[monthStartStr]?.["合計"] || 0;
      const cumulativeChange =
        (aggregatedData[date]?.["合計"] || 0) - monthStartTotal;

      const totalChange =
        (aggregatedData[date]?.["合計"] || 0) - firstDataTotal;

      const dateWithdrawals = withdrawals.filter((w) => {
        const withdrawalDate = utcToZonedTime(parseISO(w.date), "Asia/Tokyo");
        return isSameDay(withdrawalDate, currentDate);
      });

      const dateSubscriptions = subscriptions.filter((s) => {
        // Make sure billingDate is treated as a string
        const billingDateStr = String(s.billingDate);

        // yyyy/MM/dd と yyyy-MM-dd の両方のフォーマットに対応
        const subscriptionDateStr = billingDateStr.includes("/")
          ? billingDateStr
          : billingDateStr.replace(/-/g, "/");

        const subscriptionDate = parse(
          subscriptionDateStr,
          "yyyy/MM/dd",
          new Date()
        );
        return isSameDay(subscriptionDate, currentDate);
      });

      const hasAggregatedData = !!aggregatedData[date];
      const currentTotal = aggregatedData[date]?.["合計"] || 0;

      // 日次変化に基づく背景色の計算
      let backgroundColor = "transparent";
      if (hasAggregatedData) {
        if (dailyChange > 0) {
          // プラスの変化に基づく緑の濃さ
          const intensity = Math.min(Math.abs(dailyChange) / 10000, 1) * 0.3;
          backgroundColor = `rgba(0, 255, 0, ${intensity})`;
        } else if (dailyChange < 0) {
          // マイナスの変化に基づく赤の濃さ
          const intensity = Math.min(Math.abs(dailyChange) / 10000, 1) * 0.3;
          backgroundColor = `rgba(255, 0, 0, ${intensity})`;
        }
      }

      // 当日の総支出（引き落とし＋サブスクリプション）
      const totalExpensesToday =
        dateWithdrawals.reduce((sum, w) => sum + w.amount, 0) +
        dateSubscriptions.reduce((sum, s) => sum + s.amount, 0);

      return {
        title: hasAggregatedData
          ? `日次: ${dailyChange.toLocaleString()}円\n週次: ${weeklyChange.toLocaleString()}円\n月次: ${cumulativeChange.toLocaleString()}円\n全期間: ${totalChange.toLocaleString()}円`
          : "",
        date,
        backgroundColor,
        extendedProps: {
          dailyChange,
          weeklyChange,
          cumulativeChange,
          totalChange,
          currentTotal,
          withdrawals: dateWithdrawals,
          subscriptions: dateSubscriptions,
          hasAggregatedData,
          totalExpensesToday,
        },
      };
    });
  }, [aggregatedData, withdrawals, subscriptions]);

  // イベント内容のレンダリング
  const renderEventContent = (eventInfo: EventContentArg) => {
    const {
      dailyChange,
      weeklyChange,
      cumulativeChange,
      totalChange,
      currentTotal,
      withdrawals,
      subscriptions,
      hasAggregatedData,
      totalExpensesToday,
    } = eventInfo.event.extendedProps as {
      dailyChange: number;
      weeklyChange: number;
      cumulativeChange: number;
      totalChange: number;
      currentTotal: number;
      withdrawals: WithdrawalEntry[];
      subscriptions: SubscriptionService[];
      hasAggregatedData: boolean;
      totalExpensesToday: number;
    };

    return (
      <div className="event-content">
        {hasAggregatedData && (
          <>
            <div className="total-amount">
              残高: {currentTotal.toLocaleString()}円
            </div>
            <div
              className={`change-item daily-change ${
                dailyChange >= 0 ? "positive" : "negative"
              }`}
            >
              <span className="change-label">日次:</span>
              <span className="change-value">
                {dailyChange.toLocaleString()}円
              </span>
            </div>
            <div
              className={`change-item weekly-change ${
                weeklyChange >= 0 ? "positive" : "negative"
              }`}
            >
              <span className="change-label">週次:</span>
              <span className="change-value">
                {weeklyChange.toLocaleString()}円
              </span>
            </div>
            <div
              className={`change-item cumulative-change ${
                cumulativeChange >= 0 ? "positive" : "negative"
              }`}
            >
              <span className="change-label">月次:</span>
              <span className="change-value">
                {cumulativeChange.toLocaleString()}円
              </span>
            </div>
            <div
              className={`change-item total-change ${
                totalChange >= 0 ? "positive" : "negative"
              }`}
            >
              <span className="change-label">全期間:</span>
              <span className="change-value">
                {totalChange.toLocaleString()}円
              </span>
            </div>
          </>
        )}

        {(withdrawals.length > 0 || subscriptions.length > 0) && (
          <div className="total-expenses-today">
            <span className="expenses-label">本日支出:</span>
            <span className="expenses-value">
              {totalExpensesToday.toLocaleString()}円
            </span>
          </div>
        )}

        {withdrawals.length > 0 && (
          <div className="withdrawals-container">
            <h4 className="section-header">引き落とし:</h4>
            {withdrawals.map((withdrawal) => (
              <div key={withdrawal._id} className="withdrawal-info">
                <div className="withdrawal-details">
                  <div className="withdrawal-bank">
                    {withdrawal.bank} {withdrawal.branch}
                  </div>
                  <div className="withdrawal-amount">
                    {withdrawal.description}:{" "}
                    {withdrawal.amount.toLocaleString()}円
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="delete-button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>引き落とし情報の削除</AlertDialogTitle>
                      <AlertDialogDescription>
                        この引き落とし情報を削除してもよろしいですか？この操作は取り消せません。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeleteWithdrawal(withdrawal._id!)}
                      >
                        削除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}

        {subscriptions && subscriptions.length > 0 && (
          <div className="subscriptions-container">
            <h4 className="section-header">サブスクリプション:</h4>
            {subscriptions.map((subscription) => (
              <div key={subscription._id} className="subscription-info">
                <div className="subscription-name">{subscription.name}</div>
                <div className="subscription-amount">
                  {subscription.amount.toLocaleString()}円
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 月次サマリーの計算
  const calculateMonthlySummary = useCallback(
    (month: Date): MonthlySummary => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      let previousTotal: number | null = null;

      const monthlyIncome = Object.entries(aggregatedData)
        .filter(([dateStr]) => {
          const date = parseISO(dateStr);
          return isWithinInterval(date, { start: monthStart, end: monthEnd });
        })
        .reduce((sum, [, accounts]) => {
          const dailyChange =
            accounts["合計"] - (previousTotal || accounts["合計"]);
          previousTotal = accounts["合計"];
          return sum + (dailyChange > 0 ? dailyChange : 0);
        }, 0);

      const monthlyExpenses = Object.entries(aggregatedData)
        .filter(([dateStr]) => {
          const date = parseISO(dateStr);
          return isWithinInterval(date, { start: monthStart, end: monthEnd });
        })
        .reduce((sum, [, accounts]) => {
          const dailyChange =
            accounts["合計"] - (previousTotal || accounts["合計"]);
          previousTotal = accounts["合計"];
          return sum + (dailyChange < 0 ? -dailyChange : 0);
        }, 0);

      const monthlyWithdrawals = withdrawals.filter((w) => {
        const withdrawalDate = parseISO(w.date);
        return isWithinInterval(withdrawalDate, {
          start: monthStart,
          end: monthEnd,
        });
      });

      const totalWithdrawals = monthlyWithdrawals.reduce(
        (sum, w) => sum + w.amount,
        0
      );

      const monthlySubscriptions = subscriptions.filter((s) => {
        const subscriptionDateStr = String(s.billingDate).includes("/")
          ? String(s.billingDate)
          : String(s.billingDate).replace(/-/g, "/");
        const subscriptionDate = parse(
          subscriptionDateStr,
          "yyyy/MM/dd",
          new Date()
        );
        return isWithinInterval(subscriptionDate, {
          start: monthStart,
          end: monthEnd,
        });
      });

      const totalSubscriptions = monthlySubscriptions.reduce(
        (sum, s) => sum + s.amount,
        0
      );

      const fixedCosts = totalWithdrawals + totalSubscriptions;
      const availableVariableExpenses = Math.max(monthlyIncome - fixedCosts, 0);

      return {
        income: monthlyIncome,
        expenses: monthlyExpenses,
        balance: monthlyIncome - monthlyExpenses,
        totalWithdrawals,
        totalSubscriptions,
        fixedCosts,
        availableVariableExpenses,
      };
    },
    [aggregatedData, withdrawals, subscriptions]
  );

  const monthlySummary = useMemo(
    () => calculateMonthlySummary(currentMonth),
    [calculateMonthlySummary, currentMonth]
  );

  const previousMonthlySummary = useMemo(
    () => calculateMonthlySummary(previousMonth),
    [calculateMonthlySummary, previousMonth]
  );

  const handleDatesSet = useCallback(
    (arg: DatesSetArg) => {
      setCurrentMonth(arg.view.currentStart);
      onMonthChange(arg.view.currentStart);
    },
    [onMonthChange]
  );

  const handleDateClick = (arg: { date: Date }) => {
    setSelectedDate(arg.date);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setNewWithdrawal({
      bank: "",
      branch: "",
      amount: 0,
      description: "",
    });
  };

  const handleWithdrawalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedDate) {
      const tokyoDate = utcToZonedTime(selectedDate, "Asia/Tokyo");
      const newWithdrawalEntry = {
        ...newWithdrawal,
        date: formatTZ(tokyoDate, "yyyy-MM-dd", { timeZone: "Asia/Tokyo" }),
      };
      onAddWithdrawal(newWithdrawalEntry);
      handleDialogClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewWithdrawal((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) || 0 : value,
    }));
  };

  // 最も高額な引き落としTop5
  const topExpensiveWithdrawals = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    return withdrawals
      .filter((w) => {
        const withdrawalDate = parseISO(w.date);
        return isWithinInterval(withdrawalDate, {
          start: monthStart,
          end: monthEnd,
        });
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [withdrawals, currentMonth]);

  // 金額順にソートされたサブスクリプション
  const sortedSubscriptions = useMemo(() => {
    return [...subscriptions].sort((a, b) => b.amount - a.amount);
  }, [subscriptions]);

  return (
    <div className="asset-calendar-container">
      <Tabs
        defaultValue="summary"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mb-6"
      >
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="summary">
            <TrendingUp className="mr-2 h-4 w-4" />
            概要
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="mr-2 h-4 w-4" />
            カレンダー
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <PlusCircle className="mr-2 h-4 w-4" />
            分析
          </TabsTrigger>
        </TabsList>

        {/* 概要タブ */}
        <TabsContent value="summary" className="space-y-6">
          <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-bold">
              {format(currentMonth, "yyyy年M月", { locale: ja })}の財務概要
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard
                title="当月収入"
                value={monthlySummary.income}
                isPositive={true}
                icon={ArrowUpCircle}
                previous={previousMonthlySummary.income}
              />
              <SummaryCard
                title="当月支出"
                value={monthlySummary.expenses}
                isPositive={false}
                icon={ArrowDownCircle}
                previous={previousMonthlySummary.expenses}
              />
              <SummaryCard
                title="当月収支"
                value={monthlySummary.balance}
                isPositive={monthlySummary.balance >= 0}
                icon={TrendingUp}
                previous={previousMonthlySummary.balance}
              />
              <SummaryCard
                title="利用可能な変動費"
                value={monthlySummary.availableVariableExpenses}
                isPositive={true}
                icon={RefreshCw}
                previous={previousMonthlySummary.availableVariableExpenses}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>固定費内訳</CardTitle>
                  <CardDescription>
                    サブスクリプションと引き落とし
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span>引き落とし合計</span>
                      <Badge variant="outline" className="bg-red-50">
                        {monthlySummary.totalWithdrawals.toLocaleString()}円
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>サブスクリプション合計</span>
                      <Badge variant="outline" className="bg-blue-50">
                        {monthlySummary.totalSubscriptions.toLocaleString()}円
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium mb-2">主要な引き落とし</h4>
                    {topExpensiveWithdrawals.length > 0 ? (
                      <div className="space-y-2">
                        {topExpensiveWithdrawals.map((withdrawal) => (
                          <div
                            key={withdrawal._id}
                            className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded"
                          >
                            <span>{withdrawal.description}</span>
                            <span className="font-medium">
                              {withdrawal.amount.toLocaleString()}円
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        この月の引き落としはありません
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>サブスクリプション</CardTitle>
                  <CardDescription>定期的な支払い</CardDescription>
                </CardHeader>
                <CardContent>
                  {sortedSubscriptions.length > 0 ? (
                    <div className="space-y-3">
                      {sortedSubscriptions.slice(0, 6).map((subscription) => (
                        <div
                          key={subscription._id}
                          className="flex justify-between items-center bg-gray-50 p-2 rounded"
                        >
                          <div>
                            <div className="font-medium">
                              {subscription.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {subscription.billingDate} 請求
                            </div>
                          </div>
                          <Badge
                            variant={
                              subscription.amount > 5000
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {subscription.amount.toLocaleString()}円
                          </Badge>
                        </div>
                      ))}

                      {sortedSubscriptions.length > 6 && (
                        <Button
                          variant="outline"
                          className="w-full mt-2"
                          onClick={() => setActiveTab("analysis")}
                        >
                          すべて表示
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      サブスクリプションはありません
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* カレンダータブ */}
        <TabsContent value="calendar" className="space-y-4">
          {isLoading ? (
            <CalendarSkeleton />
          ) : (
            <Suspense fallback={<CalendarSkeleton />}>
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                initialView="dayGridMonth"
                events={events}
                eventContent={renderEventContent}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek",
                }}
                buttonText={{
                  today: "今日",
                  month: "月",
                  week: "週",
                }}
                locale="ja"
                firstDay={1}
                datesSet={handleDatesSet}
                dateClick={handleDateClick}
                dayCellContent={(args) => (
                  <div className="custom-day-cell">
                    {format(args.date, "d", { locale: ja })}
                  </div>
                )}
                height="auto"
                ref={(el) => {
                  if (el) {
                    setCalendarApi(el.getApi());
                  }
                }}
              />
            </Suspense>
          )}

          <Button
            onClick={() => setIsDialogOpen(true)}
            className="fixed bottom-4 right-4 rounded-full shadow-lg"
            size="lg"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            引き落とし追加
          </Button>
        </TabsContent>

        {/* 分析タブ */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>固定費分析</CardTitle>
              <CardDescription>
                毎月の固定費の合計: {monthlySummary.fixedCosts.toLocaleString()}
                円
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">引き落としリスト</h3>
                  {withdrawals.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {withdrawals
                        .filter((w) => {
                          const withdrawalDate = parseISO(w.date);
                          return isWithinInterval(withdrawalDate, {
                            start: startOfMonth(currentMonth),
                            end: endOfMonth(currentMonth),
                          });
                        })
                        .map((withdrawal) => (
                          <div
                            key={withdrawal._id}
                            className="flex justify-between items-center p-3 border rounded"
                          >
                            <div>
                              <div className="font-medium">
                                {withdrawal.description}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {withdrawal.bank} {withdrawal.branch} •{" "}
                                {format(
                                  parseISO(withdrawal.date),
                                  "yyyy年MM月dd日",
                                  { locale: ja }
                                )}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className="font-bold mr-2">
                                {withdrawal.amount.toLocaleString()}円
                              </span>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      引き落とし情報の削除
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      この引き落とし情報を削除してもよろしいですか？この操作は取り消せません。
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      キャンセル
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        onDeleteWithdrawal(withdrawal._id!)
                                      }
                                    >
                                      削除
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      引き落としが登録されていません
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">
                    サブスクリプション一覧
                  </h3>
                  {subscriptions.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {sortedSubscriptions.map((subscription) => (
                        <div
                          key={subscription._id}
                          className="flex justify-between items-center p-3 border rounded"
                        >
                          <div>
                            <div className="font-medium">
                              {subscription.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              タイプ: {subscription.type} • 請求日:{" "}
                              {subscription.billingDate}
                            </div>
                          </div>
                          <Badge
                            variant={
                              subscription.amount > 5000
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {subscription.amount.toLocaleString()}円
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      サブスクリプションが登録されていません
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 引き落とし登録ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>引き落とし情報登録</DialogTitle>
            <DialogDescription>
              日付:{" "}
              {selectedDate
                ? format(selectedDate, "yyyy年MM月dd日", { locale: ja })
                : format(new Date(), "yyyy年MM月dd日", { locale: ja })}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleWithdrawalSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank">銀行名</Label>
                  <Input
                    id="bank"
                    name="bank"
                    value={newWithdrawal.bank}
                    onChange={handleInputChange}
                    placeholder="例: みずほ銀行"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">支店名</Label>
                  <Input
                    id="branch"
                    name="branch"
                    value={newWithdrawal.branch}
                    onChange={handleInputChange}
                    placeholder="例: 渋谷支店"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">金額</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={newWithdrawal.amount.toString()}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newWithdrawal.description}
                  onChange={(e) =>
                    setNewWithdrawal((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="例: 家賃、光熱費など"
                  className="min-h-20"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={handleDialogClose}
              >
                キャンセル
              </Button>
              <Button type="submit">登録</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
