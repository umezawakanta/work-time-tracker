"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { EventModal } from "@/components/EventModal";
import "@/styles/event.css";

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
}

export function MonthView() {
  const [currentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setSelectedDate(event.start);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<Event, "id">) => {
    try {
      if (selectedEvent) {
        const updatedEvents = events.map(event =>
          event.id === selectedEvent.id
            ? { ...eventData, id: selectedEvent.id }
            : event
        );
        setEvents(updatedEvents);
      } else {
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

  const daysInMonth = getDaysInMonth(currentDate);

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="grid grid-cols-7 gap-1 p-4">
          {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
            <div key={index} className="text-center font-semibold">
              {day}
            </div>
          ))}
          {daysInMonth.map((day, index) => (
            <div
              key={index}
              className={cn(
                "h-32 border p-1 relative",
                day && day.getMonth() !== currentDate.getMonth() && "bg-gray-100",
                day && day.getDate() === new Date().getDate() && day.getMonth() === new Date().getMonth() && "bg-blue-100"
              )}
              onClick={() => day && handleDayClick(day)}
            >
              {day && (
                <>
                  <div className="text-right">{day.getDate()}</div>
                  <div className="mt-1">
                    {events
                      .filter(event => event.start.toDateString() === day.toDateString())
                      .slice(0, 3)
                      .map(event => (
                        <div
                          key={event.id}
                          className={`event-item text-xs`}
                          style={{ backgroundColor: event.color || '#3b82f6' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                        >
                          {event.title}
                        </div>
                      ))}
                    {events.filter(event => event.start.toDateString() === day.toDateString()).length > 3 && (
                      <div className="text-xs text-gray-500">+ more</div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
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
          selectedTime=""
          event={selectedEvent}
        />
      )}
    </div>
  );
}

