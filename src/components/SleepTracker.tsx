import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from 'date-fns'
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

// Set up the localizer for react-big-calendar
const localizer = momentLocalizer(moment)

type SleepRecord = {
  date: Date;
  wakeUp: Date | null;
  bedtime: Date | null;
}

export default function SleepTracker() {
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    const storedRecords = localStorage.getItem('sleepRecords')
    if (storedRecords) {
      setSleepRecords(JSON.parse(storedRecords).map((record: SleepRecord) => ({
        ...record,
        date: new Date(record.date),
        wakeUp: record.wakeUp ? new Date(record.wakeUp) : null,
        bedtime: record.bedtime ? new Date(record.bedtime) : null,
      })))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('sleepRecords', JSON.stringify(sleepRecords))
  }, [sleepRecords])

  const logTime = (type: 'wakeUp' | 'bedtime') => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    setSleepRecords(prevRecords => {
      const existingRecordIndex = prevRecords.findIndex(record => 
        record.date.getTime() === today.getTime()
      )

      if (existingRecordIndex !== -1) {
        const updatedRecords = [...prevRecords]
        updatedRecords[existingRecordIndex] = {
          ...updatedRecords[existingRecordIndex],
          [type]: now
        }
        return updatedRecords
      } else {
        return [...prevRecords, { 
          date: today, 
          wakeUp: type === 'wakeUp' ? now : null, 
          bedtime: type === 'bedtime' ? now : null 
        }]
      }
    })
  }

  const events = sleepRecords.flatMap(record => {
    const events = []
    if (record.wakeUp) {
      events.push({
        title: '起床',
        start: record.wakeUp,
        end: new Date(record.wakeUp.getTime() + 30 * 60000), // 30 minutes duration
        allDay: false,
      })
    }
    if (record.bedtime) {
      events.push({
        title: '就寝',
        start: record.bedtime,
        end: new Date(record.bedtime.getTime() + 30 * 60000), // 30 minutes duration
        allDay: false,
      })
    }
    return events
  })

  const chartData = sleepRecords
    .map(record => ({
      date: format(record.date, 'MM/dd'),
      wakeUp: record.wakeUp ? record.wakeUp.getHours() + record.wakeUp.getMinutes() / 60 : null,
      bedtime: record.bedtime ? record.bedtime.getHours() + record.bedtime.getMinutes() / 60 : null,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold mb-4">睡眠トラッカー</h1>
      
      <div className="flex space-x-4">
        <Button onClick={() => logTime('wakeUp')}>起床時間を記録</Button>
        <Button onClick={() => logTime('bedtime')}>就寝時間を記録</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>カレンダー</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>睡眠記録</CardTitle>
          </CardHeader>
          <CardContent>
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>睡眠パターングラフ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[400px]">
            <Line
              data={{
                labels: chartData.map(d => d.date),
                datasets: [
                  {
                    label: '起床時間',
                    data: chartData.map(d => d.wakeUp),
                    borderColor: '#8884d8',
                    backgroundColor: 'rgba(136, 132, 216, 0.5)',
                  },
                  {
                    label: '就寝時間',
                    data: chartData.map(d => d.bedtime),
                    borderColor: '#82ca9d',
                    backgroundColor: 'rgba(130, 202, 157, 0.5)',
                  },
                ],
              }}
              options={{
                responsive: true,
                scales: {
                  y: {
                    min: 0,
                    max: 24,
                    ticks: {
                      stepSize: 6,
                    },
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}