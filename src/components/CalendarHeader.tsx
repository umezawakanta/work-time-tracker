"use client"

import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'
import { useState } from "react"

export function CalendarHeader() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const goToToday = () => setCurrentDate(new Date())
  const previousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() - 7)
    setCurrentDate(newDate)
  }
  const nextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + 7)
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
          <Button variant="ghost" size="icon" onClick={previousWeek}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">前の週</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">次の週</span>
          </Button>
        </div>
        <h2 className="text-lg font-semibold">
          {currentDate.toLocaleDateString("ja-JP", { year: "numeric", month: "long" })}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <LayoutGrid className="h-4 w-4 mr-2" />
          週
        </Button>
      </div>
    </header>
  )
}

