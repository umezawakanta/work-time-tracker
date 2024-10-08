import { useMemo, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { EventContentArg, DatesSetArg } from "@fullcalendar/core";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  isSameWeek,
  parseISO,
} from "date-fns";
import { ja } from "date-fns/locale";
import "./AssetCalendar.css";

interface DataPoint {
  date: Date;
  value: number;
  account: string;
}

interface AssetCalendarProps {
  data: DataPoint[];
}

export function AssetCalendar({ data }: AssetCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

    return sortedDates.map((date, index) => {
      const currentDate = new Date(date);
      const prevDate = index > 0 ? sortedDates[index - 1] : date;
      const dailyChange =
        (aggregatedData[date]?.["合計"] ?? 0) -
        (aggregatedData[prevDate]?.["合計"] ?? 0);
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

      return {
        title: `日次: ${dailyChange.toLocaleString()}円\n週次: ${weeklyChange.toLocaleString()}円\n月次: ${cumulativeChange.toLocaleString()}円\n全期間: ${totalChange.toLocaleString()}円`,
        date,
        extendedProps: {
          dailyChange,
          weeklyChange,
          cumulativeChange,
          totalChange,
        },
      };
    });
  }, [aggregatedData, currentMonth]);

  const renderEventContent = (eventInfo: EventContentArg) => {
    const { dailyChange, weeklyChange, cumulativeChange, totalChange } =
      eventInfo.event.extendedProps as {
        dailyChange: number;
        weeklyChange: number;
        cumulativeChange: number;
        totalChange: number;
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
        plugins={[dayGridPlugin]}
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
        dayCellContent={(args) => {
          return (
            <div className="custom-day-cell">
              {format(args.date, "d", { locale: ja })}
            </div>
          );
        }}
      />
    </div>
  );
}
