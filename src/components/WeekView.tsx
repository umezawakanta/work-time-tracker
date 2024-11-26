"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function WeekView() {
  const [currentDate] = useState(new Date())
  
  // 0:00から23:55までの5分間隔のタイムスロットを生成
  const timeSlots = Array.from({ length: 288 }, (_, i) => {
    const minutes = i * 5
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  })

  // 週の日付を生成
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentDate)
    date.setDate(currentDate.getDate() - currentDate.getDay() + i)
    return {
      date,
      dayName: date.toLocaleDateString("ja-JP", { weekday: "short" }),
      dayNumber: date.getDate(),
    }
  })

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
            {timeSlots.map((time, i) => (
              time.endsWith("00") && (
                <div key={i} className="h-12 border-b text-xs text-muted-foreground p-1">
                  {time}
                </div>
              )
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7">
            {weekDays.map((_, dayIndex) => (
              <div key={dayIndex} className={cn("border-r", dayIndex === 6 && "border-r-0")}>
                {timeSlots.map((_, slotIndex) => (
                  <div
                    key={slotIndex}
                    className={cn(
                      "h-2 border-b border-dashed",
                      slotIndex % 12 === 0 && "border-solid" // 1時間ごとに実線
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

