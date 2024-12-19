"use client"

import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from "react"

interface CalendarHeaderProps {
  view: 'week' | 'month';
  onViewChange: (view: 'week' | 'month') => void;
}

export function CalendarHeader({ view, onViewChange }: CalendarHeaderProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const goToToday = () => setCurrentDate(new Date())
  const previousPeriod = () => {
    const newDate = new Date(currentDate)
    if (view === 'week') {
      newDate.setDate(currentDate.getDate() - 7)
    } else {
      newDate.setMonth(currentDate.getMonth() - 1)
    }
    setCurrentDate(newDate)
  }
  const nextPeriod = () => {
    const newDate = new Date(currentDate)
    if (view === 'week') {
      newDate.setDate(currentDate.getDate() + 7)
    } else {
      newDate.setMonth(currentDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={goToToday}>
          <Calendar className="h-4 w-4" />
          <span className="sr-only">今日</span>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={previousPeriod}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">前の{view === 'week' ? '週' : '月'}</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={nextPeriod}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">次の{view === 'week' ? '週' : '月'}</span>
          </Button>
        </div>
        <h2 className="text-lg font-semibold">
          {currentDate.toLocaleDateString("ja-JP", { year: "numeric", month: "long" })}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={view === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewChange('week')}
        >
          週
        </Button>
        <Button
          variant={view === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewChange('month')}
        >
          月
        </Button>
      </div>
    </header>
  )
}

