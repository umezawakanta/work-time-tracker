"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { EventModal } from "@/components/EventModal";
import "@/styles/event.css";
import "@/styles/WeekView.css";

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
}

export function WeekView() {
  const [currentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Load events from localStorage on component mount
  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem('calendar-events');
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents);
        const eventsWithDates = parsedEvents.map((event: Omit<Event, 'start' | 'end'> & { start: string; end: string }) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        }));
        setEvents(eventsWithDates);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (events.length > 0) {
      try {
        const eventsToSave = events.map(event => ({
          ...event,
          start: event.start.toISOString(),
          end: event.end.toISOString()
        }));
        localStorage.setItem('calendar-events', JSON.stringify(eventsToSave));
      } catch (error) {
        console.error('Error saving events:', error);
      }
    }
  }, [events]);

  const timeSlots = Array.from({ length: 288 }, (_, i) => {
    const minutes = i * 5;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  });

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
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setSelectedDate(event.start);
    setSelectedTime(event.start.toTimeString().slice(0, 5));
    setIsModalOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<Event, "id">) => {
    try {
      if (selectedEvent) {
        // Update existing event
        const updatedEvents = events.map(event =>
          event.id === selectedEvent.id
            ? { ...eventData, id: selectedEvent.id }
            : event
        );
        setEvents(updatedEvents);
      } else {
        // Create new event
        const newEvent = {
          ...eventData,
          id: Math.random().toString(36).substr(2, 9),
          start: new Date(eventData.start),
          end: new Date(eventData.end)
        };
        setEvents(prevEvents => [...prevEvents, newEvent]);
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const getEventStyle = (event: Event, dayIndex: number) => {
    const eventDate = new Date(event.start);
    const eventDay = eventDate.getDay();
    
    if (eventDay === dayIndex) {
      const startMinutes = eventDate.getHours() * 60 + eventDate.getMinutes();
      const endMinutes = event.end.getHours() * 60 + event.end.getMinutes();
      
      return {
        '--event-top': `${(startMinutes / 5) * 2}px`,
        '--event-height': `${Math.max(((endMinutes - startMinutes) / 5) * 2, 4)}px`,
        '--event-color': event.color || '#3b82f6',
      } as React.CSSProperties;
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
                      slotIndex % 12 === 0 && "border-solid"
                    )}
                    onDoubleClick={() => handleDoubleClick(day.date, time)}
                  />
                ))}
                {events.map((event) => {
                  const style = getEventStyle(event, dayIndex);
                  if (style) {
                    return (
                      <div
                        key={event.id}
                        className="event-item cursor-pointer hover:opacity-75"
                        style={style}
                        onClick={() => handleEventClick(event)}
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
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
          onSave={handleSaveEvent}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          event={selectedEvent}
        />
      )}
    </div>
  );
}

