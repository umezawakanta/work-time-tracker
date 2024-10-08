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
  isSameWeek,
  parseISO,
} from "date-fns";
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

interface AssetCalendarProps {
  data: DataPoint[];
  withdrawals: WithdrawalEntry[];
  onAddWithdrawal: (withdrawal: Omit<WithdrawalEntry, "_id">) => void;
}

export function AssetCalendar({
  data,
  withdrawals,
  onAddWithdrawal,
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
    const aggregated = processedData.reduce((acc, curr) => {
      const dateStr = curr.date.toISOString().split("T")[0];
      if (!acc[dateStr]) {
        acc[dateStr] = {};
      }
      acc[dateStr][curr.account] = curr.value;
      return acc;
    }, {} as Record<string, Record<string, number>>);

    Object.keys(aggregated).forEach((dateStr) => {
      const total = Object.values(aggregated[dateStr]).reduce(
        (sum, value) => sum + value,
        0
      );
      aggregated[dateStr]["合計"] = total;
    });

    return aggregated;
  }, [processedData]);

  const events = useMemo(() => {
    const sortedDates = Object.keys(aggregatedData).sort();
    if (sortedDates.length === 0) return [];

    const firstDataDate = sortedDates[0];
    const firstDataTotal = aggregatedData[firstDataDate]["合計"];

    const currentMonthStart = startOfMonth(currentMonth);
    const monthStartDateStr = currentMonthStart.toISOString().split("T")[0];
    const monthStartTotal =
      aggregatedData[monthStartDateStr]?.["合計"] ??
      (sortedDates.find((date) => date >= monthStartDateStr)
        ? aggregatedData[
            sortedDates.find((date) => date >= monthStartDateStr)!
          ]["合計"]
        : 0);

    let weekStartTotal = 0;
    let lastWeekStart = new Date(0);

    return sortedDates.map((date) => {
      const currentDate = new Date(date);
      const dailyChange =
        (aggregatedData[date]?.["合計"] ?? 0) -
        (aggregatedData[sortedDates[sortedDates.indexOf(date) - 1]]?.["合計"] ??
          0);
      const cumulativeChange =
        date >= monthStartDateStr
          ? (aggregatedData[date]?.["合計"] ?? 0) - monthStartTotal
          : 0;
      const totalChange =
        (aggregatedData[date]?.["合計"] ?? 0) - firstDataTotal;

      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      if (!isSameWeek(currentDate, lastWeekStart, { weekStartsOn: 1 })) {
        weekStartTotal =
          aggregatedData[sortedDates.find((d) => new Date(d) >= weekStart)!]?.[
            "合計"
          ] ?? 0;
        lastWeekStart = weekStart;
      }
      const weeklyChange =
        (aggregatedData[date]?.["合計"] ?? 0) - weekStartTotal;

      const dateWithdrawals = withdrawals.filter((w) => w.date === date);

      return {
        title: `日次: ${dailyChange.toLocaleString()}円\n週次: ${weeklyChange.toLocaleString()}円\n月次: ${cumulativeChange.toLocaleString()}円\n全期間: ${totalChange.toLocaleString()}円`,
        date,
        extendedProps: {
          dailyChange,
          weeklyChange,
          cumulativeChange,
          totalChange,
          withdrawals: dateWithdrawals,
        },
      };
    });
  }, [aggregatedData, currentMonth, withdrawals]);

  const renderEventContent = (eventInfo: EventContentArg) => {
    const {
      dailyChange,
      weeklyChange,
      cumulativeChange,
      totalChange,
      withdrawals,
    } = eventInfo.event.extendedProps as {
      dailyChange: number;
      weeklyChange: number;
      cumulativeChange: number;
      totalChange: number;
      withdrawals: WithdrawalEntry[];
    };
    const isDailyPositive = dailyChange >= 0;
    const isWeeklyPositive = weeklyChange >= 0;
    const isCumulativePositive = cumulativeChange >= 0;
    const isTotalPositive = totalChange >= 0;

    return (
      <div className="event-content">
        <div
          className={`change-item daily-change ${
            isDailyPositive ? "positive" : "negative"
          }`}
        >
          <span className="change-label">日次:</span>
          <span className="change-value">{dailyChange.toLocaleString()}円</span>
        </div>
        <div
          className={`change-item weekly-change ${
            isWeeklyPositive ? "positive" : "negative"
          }`}
        >
          <span className="change-label">週次:</span>
          <span className="change-value">
            {weeklyChange.toLocaleString()}円
          </span>
        </div>
        <div
          className={`change-item cumulative-change ${
            isCumulativePositive ? "positive" : "negative"
          }`}
        >
          <span className="change-label">月次:</span>
          <span className="change-value">
            {cumulativeChange.toLocaleString()}円
          </span>
        </div>
        <div
          className={`change-item total-change ${
            isTotalPositive ? "positive" : "negative"
          }`}
        >
          <span className="change-label">全期間:</span>
          <span className="change-value">{totalChange.toLocaleString()}円</span>
        </div>
        {withdrawals && withdrawals.length > 0 && (
          <div className="withdrawals-container">
            <h4>引き落とし情報:</h4>
            {withdrawals.map((withdrawal, index) => (
              <div key={index} className="withdrawal-info">
                <span>
                  {withdrawal.bank} {withdrawal.branch}
                </span>
                <span>
                  {withdrawal.description}: {withdrawal.amount.toLocaleString()}
                  円
                </span>
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

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    setCurrentMonth(arg.view.currentStart);
  }, []);

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
      onAddWithdrawal({
        ...newWithdrawal,
        date: selectedDate.toISOString().split("T")[0],
      });
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
              className={`summary-value ${
                monthlySummary.balance >= 0 ? "income" : "expenses"
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
