"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { EventModal } from "@/components/EventModal";
import "../styles/event.css";

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

export function WeekView() {
  const [currentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");

  // 0:00から23:55までの5分間隔のタイムスロットを生成
  const timeSlots = Array.from({ length: 288 }, (_, i) => {
    const minutes = i * 5;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  });

  // 週の日付を生成
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - currentDate.getDay() + i);
    return {
      date,
      dayName: date.toLocaleDateString("ja-JP", { weekday: "short" }),
      dayNumber: date.getDate(),
    };
  });

  const handleDoubleClick = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (event: Omit<Event, "id">) => {
    const newEvent = { ...event, id: Math.random().toString(36).substr(2, 9) };
    setEvents(prevEvents => [...prevEvents, newEvent]);
    console.log("New event added:", newEvent); // デバッグ用
  };

  const getEventPosition = (event: Event, dayIndex: number) => {
    const eventDate = new Date(event.start);
    const eventDay = eventDate.getDay();
    const eventStartMinutes = eventDate.getHours() * 60 + eventDate.getMinutes();
    const eventEndMinutes = event.end.getHours() * 60 + event.end.getMinutes();

    if (eventDay === dayIndex) {
      const durationInSlots = Math.ceil((eventEndMinutes - eventStartMinutes) / 5);
      const top = (eventStartMinutes / 5) * 2; // 5分 = 2px
      const height = durationInSlots * 2; // 5分 = 2px
      return {
        className: `event top-[${top}px] h-[${height}px]`,
      };
    }
    return null;
  };

  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex border-b">
        <div className="w-16 border-r" />
        {weekDays.map((day, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 text-center py-2",
              i < 6 && "border-r",
              day.date.getDay() === 0 && "text-red-500",
              day.date.getDay() === 6 && "text-blue-500"
            )}
          >
            <div className="text-sm">{day.dayName}</div>
            <div className="text-lg font-semibold">{day.dayNumber}</div>
          </div>
        ))}
      </div>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="flex">
          <div className="w-16 border-r">
            {timeSlots.map(
              (time, i) =>
                time.endsWith("00") && (
                  <div
                    key={i}
                    className="h-12 border-b text-xs text-muted-foreground p-1"
                  >
                    {time}
                  </div>
                )
            )}
          </div>
          <div className="flex-1 grid grid-cols-7">
            {weekDays.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={cn(
                  "border-r relative",
                  dayIndex === 6 && "border-r-0"
                )}
              >
                {timeSlots.map((time, slotIndex) => (
                  <div
                    key={slotIndex}
                    className={cn(
                      "h-2 border-b border-dashed",
                      slotIndex % 12 === 0 && "border-solid" // 1時間ごとに実線
                    )}
                    onDoubleClick={() => handleDoubleClick(day.date, time)}
                  />
                ))}
                {events.map((event) => {
                  const eventPosition = getEventPosition(event, dayIndex);
                  if (eventPosition) {
                    return (
                      <div
                        key={event.id}
                        className={eventPosition.className}
                      >
                        {event.title}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
      {selectedDate && (
        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveEvent}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
        />
      )}
    </div>
  );
}

