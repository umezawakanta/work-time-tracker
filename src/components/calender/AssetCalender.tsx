import { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { EventContentArg } from "@fullcalendar/core";
import { format } from "date-fns";
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

    // Calculate total for each date
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
    return sortedDates.map((date, index) => {
      const prevDate = index > 0 ? sortedDates[index - 1] : date;
      const change =
        aggregatedData[date]["合計"] - aggregatedData[prevDate]["合計"];
      return {
        title: `${change.toLocaleString()}円`,
        date,
        extendedProps: {
          value: change,
        },
      };
    });
  }, [aggregatedData]);

  const renderEventContent = (eventInfo: EventContentArg) => {
    const value = (eventInfo.event.extendedProps as { value: number }).value;
    const isPositive = value >= 0;
    return (
      <div className={`event-content ${isPositive ? "positive" : "negative"}`}>
        {eventInfo.event.title}
      </div>
    );
  };

  return (
    <div className="asset-calendar-container">
      <h1>資産増減カレンダー</h1>
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
