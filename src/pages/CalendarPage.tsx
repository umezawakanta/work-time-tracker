import { CalendarHeader } from "@/components/CalendarHeader"
import { WeekView } from "@/components/WeekView"
import { Sidebar } from "@/components/Sidebar"

export default function CalendarPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <CalendarHeader />
        <WeekView />
      </div>
    </div>
  )
}

