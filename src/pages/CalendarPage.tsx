'use client';

import { useState } from 'react';
import { CalendarHeader } from '@/components/CalendarHeader';
import { WeekView } from '@/components/WeekView';
import { MonthView } from '@/components/MonthView';
import { DayView } from '@/components/DayView';
import { Sidebar } from '@/components/Sidebar';

export default function CalendarPage() {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <CalendarHeader view={view} onViewChange={setView} />
        {view === 'day' && <DayView />}
        {view === 'week' && <WeekView />}
        {view === 'month' && <MonthView />}
      </div>
    </div>
  );
}
