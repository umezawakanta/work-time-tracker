import { useMemo, useState, useCallback, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventContentArg, DatesSetArg } from "@fullcalendar/core";
import { CalendarApi } from "@fullcalendar/core";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  isSameDay,
  parseISO,
  subDays,
} from "date-fns";
import { toZonedTime, format as formatTZ } from 'date-fns-tz';
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
import { Trash2 } from "lucide-react";
import "./AssetCalendar.css";

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

interface Subscription {
  _id: string;
  name: string;
  billingDate: string;
  type: string;
  amount: number;
}

interface AssetCalendarProps {
  data: DataPoint[];
  withdrawals: WithdrawalEntry[];
  subscriptions: Subscription[];
  onAddWithdrawal: (withdrawal: Omit<WithdrawalEntry, "_id">) => void;
  onDeleteWithdrawal: (withdrawalId: string) => void;
  onMonthChange: (newMonth: Date) => void;
}

export function AssetCalendar({
  data,
  withdrawals,
  subscriptions,
  onAddWithdrawal,
  onDeleteWithdrawal,
  onMonthChange,
}: AssetCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newWithdrawal, setNewWithdrawal] = useState<
    Omit<WithdrawalEntry, "_id" | "date">
  >({
    bank: "",
    branch: "",
    amount: 0,
    description: "",
  });

  const [calendarApi, setCalendarApi] = useState<CalendarApi | null>(null);

  useEffect(() => {
    console.log("Withdrawals prop:", withdrawals);
  }, [withdrawals]);

  useEffect(() => {
    if (calendarApi) {
      calendarApi.refetchEvents();
    }
  }, [withdrawals, calendarApi]);

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

  const aggregatedData = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};
    processedData.forEach((item) => {
      const dateStr = item.date.toISOString().split('T')[0];
      if (!result[dateStr]) {
        result[dateStr] = {};
      }
      result[dateStr][item.account] = item.value;
    });

    // 各日付の合計を計算
    Object.keys(result).forEach((dateStr) => {
      result[dateStr]['合計'] = Object.values(result[dateStr]).reduce((sum, value) => sum + value, 0);
    });

    return result;
  }, [processedData]);

  const events = useMemo(() => {
    const sortedDates = Object.keys(aggregatedData).sort();
    if (sortedDates.length === 0) return [];

    const firstDataDate = sortedDates[0];
    const firstDataTotal = aggregatedData[firstDataDate]['合計'];

    return sortedDates.map((date) => {
      const currentDate = toZonedTime(new Date(date), 'Asia/Tokyo');
      const prevDate = subDays(currentDate, 1);
      const prevDateStr = formatTZ(prevDate, "yyyy-MM-dd", { timeZone: 'Asia/Tokyo' });

      const dailyChange = aggregatedData[date]['合計'] - (aggregatedData[prevDateStr]?.['合計'] || aggregatedData[date]['合計']);

      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekStartStr = formatTZ(weekStart, "yyyy-MM-dd", { timeZone: 'Asia/Tokyo' });
      const weekStartTotal = aggregatedData[weekStartStr]?.['合計'] || aggregatedData[date]['合計'];
      const weeklyChange = aggregatedData[date]['合計'] - weekStartTotal;

      const monthStart = startOfMonth(currentDate);
      const monthStartStr = formatTZ(monthStart, "yyyy-MM-dd", { timeZone: 'Asia/Tokyo' });
      const monthStartTotal = aggregatedData[monthStartStr]?.['合計'] || aggregatedData[date]['合計'];
      const cumulativeChange = aggregatedData[date]['合計'] - monthStartTotal;

      const totalChange = aggregatedData[date]['合計'] - firstDataTotal;

      const dateWithdrawals = withdrawals.filter((w) => {
        const withdrawalDate = toZonedTime(parseISO(w.date), 'Asia/Tokyo');
        return isSameDay(withdrawalDate, currentDate);
      });
      const dateSubscriptions = subscriptions.filter((s) => {
        const subscriptionDate = toZonedTime(parseISO(s.billingDate), 'Asia/Tokyo');
        return isSameDay(subscriptionDate, currentDate);
      });

      return {
        title: `日次: ${dailyChange.toLocaleString()}円\n週次: ${weeklyChange.toLocaleString()}円\n月次: ${cumulativeChange.toLocaleString()}円\n全期間: ${totalChange.toLocaleString()}円`,
        date,
        extendedProps: {
          dailyChange,
          weeklyChange,
          cumulativeChange,
          totalChange,
          withdrawals: dateWithdrawals,
          subscriptions: dateSubscriptions,
        },
      };
    });
  }, [aggregatedData, withdrawals, subscriptions]);

  const renderEventContent = (eventInfo: EventContentArg) => {
    const {
      dailyChange,
      weeklyChange,
      cumulativeChange,
      totalChange,
      withdrawals,
      subscriptions,
    } = eventInfo.event.extendedProps as {
      dailyChange: number;
      weeklyChange: number;
      cumulativeChange: number;
      totalChange: number;
      withdrawals: WithdrawalEntry[];
      subscriptions: Subscription[];
    };
    const isDailyPositive = dailyChange >= 0;
    const isWeeklyPositive = weeklyChange >= 0;
    const isCumulativePositive = cumulativeChange >= 0;
    const isTotalPositive = totalChange >= 0;

    console.log("Rendering withdrawals:", withdrawals);

    return (
      <div className="event-content">
        <div
          className={`change-item daily-change ${isDailyPositive ? "positive" : "negative"
            }`}
        >
          <span className="change-label">日次:</span>
          <span className="change-value">{dailyChange.toLocaleString()}円</span>
        </div>
        <div
          className={`change-item weekly-change ${isWeeklyPositive ? "positive" : "negative"
            }`}
        >
          <span className="change-label">週次:</span>
          <span className="change-value">
            {weeklyChange.toLocaleString()}円
          </span>
        </div>
        <div
          className={`change-item cumulative-change ${isCumulativePositive ? "positive" : "negative"
            }`}
        >
          <span className="change-label">月次:</span>
          <span className="change-value">
            {cumulativeChange.toLocaleString()}円
          </span>
        </div>
        <div
          className={`change-item total-change ${isTotalPositive ? "positive" : "negative"
            }`}
        >
          <span className="change-label">全期間:</span>
          <span className="change-value">{totalChange.toLocaleString()}円</span>
        </div>
        {withdrawals && withdrawals.length > 0 && (
          <div className="withdrawals-container">
            <h4>引き落とし:</h4>
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
            <h4>サブスクリプション:</h4>
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

  const calculateMonthlySummary = useCallback(
    (month: Date) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthData = Object.entries(aggregatedData)
        .filter(([dateStr]) => {
          const date = parseISO(dateStr);
          return date >= monthStart && date <= monthEnd;
        })
        .map(([dateStr, accounts]) => {
          const prevDateStr = new Date(dateStr);
          prevDateStr.setDate(prevDateStr.getDate() - 1);
          const prevTotal =
            aggregatedData[prevDateStr.toISOString().split("T")[0]]?.["合計"] ??
            accounts["合計"];
          return accounts["合計"] - prevTotal;
        });

      const income = monthData
        .filter((value) => value > 0)
        .reduce((sum, value) => sum + value, 0);
      const expenses = Math.abs(
        monthData
          .filter((value) => value < 0)
          .reduce((sum, value) => sum + value, 0)
      );
      const balance = income - expenses;

      return { income, expenses, balance };
    },
    [aggregatedData]
  );

  const monthlySummary = useMemo(
    () => calculateMonthlySummary(currentMonth),
    [calculateMonthlySummary, currentMonth]
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
      const tokyoDate = toZonedTime(selectedDate, 'Asia/Tokyo');
      const newWithdrawalEntry = {
        ...newWithdrawal,
        date: formatTZ(tokyoDate, "yyyy-MM-dd", { timeZone: 'Asia/Tokyo' }),
      };
      console.log("Adding new withdrawal:", newWithdrawalEntry);
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

  return (
    <div className="asset-calendar-container">
      <h1 className="calendar-title">資産増減カレンダー</h1>
      <div className="monthly-summary">
        <h2>{format(currentMonth, "yyyy年M月", { locale: ja })}の収支</h2>
        <div className="summary-content">
          <div className="summary-item">
            <span className="summary-label">当月収入:</span>
            <span className="summary-value income">
              {monthlySummary.income.toLocaleString()}円
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">当月支出:</span>
            <span className="summary-value expenses">
              {monthlySummary.expenses.toLocaleString()}円
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">当月収支:</span>
            <span
              className={`summary-value ${monthlySummary.balance >= 0 ? "income" : "expenses"
                }`}
            >
              {monthlySummary.balance.toLocaleString()}円
            </span>
          </div>
        </div>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventContent={renderEventContent}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek",
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
        ref={(el) => {
          if (el) {
            setCalendarApi(el.getApi());
          }
        }}
      />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>引き落とし情報登録</DialogTitle>
            <DialogDescription>
              選択した日付:{" "}
              {selectedDate
                ? format(selectedDate, "yyyy年MM月dd日", { locale: ja })
                : ""}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleWithdrawalSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bank">銀行名</Label>
                <Input
                  id="bank"
                  name="bank"
                  value={newWithdrawal.bank}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="branch">支店名</Label>
                <Input
                  id="branch"
                  name="branch"
                  value={newWithdrawal.branch}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
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
              <div>
                <Label htmlFor="description">説明</Label>
                <Input
                  id="description"
                  name="description"
                  value={newWithdrawal.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">登録</Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDialogClose}
              >
                キャンセル
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>  
    );
}
