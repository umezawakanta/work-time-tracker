import { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { EventContentArg } from "@fullcalendar/core";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import "./AssetCalendar.css";

interface AssetChange {
  date: string;
  value: number;
}

interface AssetCalendarProps {
  assetChanges: AssetChange[];
}

export function AssetCalendar({ assetChanges }: AssetCalendarProps) {
  const events = useMemo(() => {
    return assetChanges.map((change) => ({
      title: `${change.value.toLocaleString()}円`,
      date: change.date,
      extendedProps: {
        value: change.value,
      },
    }));
  }, [assetChanges]);

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
