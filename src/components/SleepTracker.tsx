import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from 'date-fns'
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { LineChart, Line } from "recharts"
import { ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { fetchSleepRecords, addSleepRecord, updateSleepRecord, selectSleepRecords, selectSleepTrackerStatus, selectSleepTrackerError } from '@/store/sleepTrackerSlice'
import { AppDispatch } from '@/store'
import { SleepRecord } from '@/store/sleepTrackerSlice'

const localizer = momentLocalizer(moment)

export default function SleepTracker() {
  const dispatch = useDispatch<AppDispatch>()
  const sleepRecords = useSelector(selectSleepRecords)
  const status = useSelector(selectSleepTrackerStatus)
  const error = useSelector(selectSleepTrackerError)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSleepRecords())
    }
  }, [status, dispatch])

  const logTime = (type: 'wakeUp' | 'bedtime') => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    
    const existingRecord = sleepRecords.find((record: SleepRecord) => record.date === today)
    
    if (existingRecord) {
      dispatch(updateSleepRecord({ _id: existingRecord._id, updates: { [type]: now.toISOString() } }))
    } else {
      dispatch(addSleepRecord({
        date: today,
        wakeUp: type === 'wakeUp' ? now.toISOString() : null,
        bedtime: type === 'bedtime' ? now.toISOString() : null
      }))
    }
  }

  const events = sleepRecords.flatMap((record: SleepRecord) => {
    const events = []
    if (record.wakeUp) {
      events.push({
        title: '起床',
        start: new Date(record.wakeUp),
        end: new Date(new Date(record.wakeUp).getTime() + 30 * 60000),
        allDay: false,
      })
    }
    if (record.bedtime) {
      events.push({
        title: '就寝',
        start: new Date(record.bedtime),
        end: new Date(new Date(record.bedtime).getTime() + 30 * 60000),
        allDay: false,
      })
    }
    return events
  })

  const chartData = sleepRecords
    .map((record: SleepRecord) => ({
      date: format(new Date(record.date), 'MM/dd'),
      wakeUp: record.wakeUp ? new Date(record.wakeUp).getHours() + new Date(record.wakeUp).getMinutes() / 60 : null,
      bedtime: record.bedtime ? new Date(record.bedtime).getHours() + new Date(record.bedtime).getMinutes() / 60 : null,
    }))
    .sort((a: { date: string }, b: { date: string }) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis domain={[0, 24]} ticks={[0, 6, 12, 18, 24]} />
                <Tooltip />
                <Line type="monotone" dataKey="wakeUp" stroke="#8884d8" name="起床時間" />
                <Line type="monotone" dataKey="bedtime" stroke="#82ca9d" name="就寝時間" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}