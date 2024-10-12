import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { format, parseISO, isToday, addDays, differenceInHours, isBefore } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { fetchSleepRecords, addSleepRecord, updateSleepRecord, deleteSleepRecord, selectSleepRecords, selectSleepTrackerStatus, selectSleepTrackerError } from '@/store/sleepTrackerSlice'
import { AppDispatch } from '@/store'
import { SleepRecord } from '@/store/sleepTrackerSlice'
import { Moon, Sun, ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function SleepTracker() {
  const dispatch = useDispatch<AppDispatch>()
  const sleepRecords = useSelector(selectSleepRecords)
  const status = useSelector(selectSleepTrackerStatus)
  const error = useSelector(selectSleepTrackerError)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [editRecord, setEditRecord] = useState<SleepRecord | null>(null)
  const [newRecord, setNewRecord] = useState<Partial<SleepRecord>>({ date: format(new Date(), 'yyyy-MM-dd') })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSleepRecords())
    }
  }, [status, dispatch])

  const logTime = (type: 'wakeUp' | 'bedtime') => {
    const now = new Date()
    const today = format(now, 'yyyy-MM-dd')
    
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

  const formatTime = (timeString: string | null, isBedtime: boolean = false) => {
    if (!timeString) return '--:--'
    const date = parseISO(timeString)
    let hours = date.getHours()
    const minutes = date.getMinutes()
    
    // 就寝時間の場合のみ、0時から10時を24時以降として扱う
    if (isBedtime && hours >= 0 && hours < 10) {
      hours += 24
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  const calculateSleepDuration = (wakeUp: string | null, bedtime: string | null) => {
    if (!wakeUp || !bedtime) return null
    let wakeUpTime = parseISO(wakeUp)
    let bedTime = parseISO(bedtime)
    
    // 就寝時間が0時から10時の場合、翌日の就寝とみなす
    if (bedTime.getHours() >= 0 && bedTime.getHours() < 10) {
      bedTime = addDays(bedTime, 1)
    }
    
    // 起床時間が就寝時間より前の場合、翌日の起床とみなす
    if (isBefore(wakeUpTime, bedTime)) {
      wakeUpTime = addDays(wakeUpTime, 1)
    }
    
    return differenceInHours(wakeUpTime, bedTime)
  }

  const handleAddRecord = () => {
    if (newRecord.date && (newRecord.wakeUp || newRecord.bedtime)) {
      dispatch(addSleepRecord(newRecord as SleepRecord))
      setNewRecord({ date: format(new Date(), 'yyyy-MM-dd') })
    }
  }

  const handleUpdateRecord = () => {
    if (editRecord && editRecord._id) {
      dispatch(updateSleepRecord({ _id: editRecord._id, updates: editRecord }))
      setEditRecord(null)
      setIsEditDialogOpen(false)
    }
  }

  const handleDeleteRecord = (id: string) => {
    if (confirm('このレコードを削除してもよろしいですか？')) {
      dispatch(deleteSleepRecord(id))
    }
  }

  const openEditDialog = (record: SleepRecord) => {
    setEditRecord({ ...record })
    setIsEditDialogOpen(true)
  }

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      const dateString = format(date, 'yyyy-MM-dd')
      const record = sleepRecords.find((r: SleepRecord) => r.date === dateString)
      
      return (
        <div key={i} className={`p-4 border-r ${isToday(date) ? 'bg-blue-100' : ''}`}>
          <div className="font-bold mb-2">{format(date, 'M/d (E)', { locale: ja })}</div>
          <div className="flex items-center mb-1">
            <Sun className="w-4 h-4 mr-2" />
            <span>{record ? formatTime(record.wakeUp) : '--:--'}</span>
          </div>
          <div className="flex items-center">
            <Moon className="w-4 h-4 mr-2" />
            <span>{record ? formatTime(record.bedtime, true) : '--:--'}</span>
          </div>
        </div>
      )
    })

    return <div className="grid grid-cols-7 border-l border-t">{days}</div>
  }

  const chartData = sleepRecords
    .map((record: SleepRecord) => {
      const wakeUpTime = record.wakeUp ? parseISO(record.wakeUp) : null
      const bedTime = record.bedtime ? parseISO(record.bedtime) : null
      return {
        date: format(parseISO(record.date), 'M/d'),
        sleepDuration: calculateSleepDuration(record.wakeUp, record.bedtime) || 0,
        wakeUpTime: wakeUpTime ? wakeUpTime.getHours() + wakeUpTime.getMinutes() / 60 : null,
        bedTime: bedTime ? 
          (bedTime.getHours() < 10 ? bedTime.getHours() + 24 : bedTime.getHours()) + bedTime.getMinutes() / 60 
          : null
      }
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7) // 直近7日間のデータのみ表示

  if (status === 'loading') {
    return <div className="text-center text-2xl font-bold mt-10">読み込み中...</div>
  }

  if (status === 'failed') {
    return <div className="text-center text-2xl font-bold mt-10 text-red-500">エラー: {error}</div>
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-6">睡眠トラッカー</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">今日の睡眠を記録</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center space-x-4">
          <Button onClick={() => logTime('wakeUp')} className="flex items-center">
            <Sun className="mr-2" />
            起床時間を記録
          </Button>
          <Button onClick={() => logTime('bedtime')} className="flex items-center">
            <Moon className="mr-2" />
            就寝時間を記録
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">睡眠時間チャート</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis domain={[0, 24]} ticks={[0, 6, 12, 18, 24]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sleepDuration" name="睡眠時間" stroke="#8884d8" />
                <Line type="monotone" dataKey="wakeUpTime" name="起床時間" stroke="#82ca9d" />
                <Line type="monotone" dataKey="bedTime" name="就寝時間" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">レコードの管理</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mb-4">
                <Plus className="mr-2" />
                新しいレコードを追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新しいレコードを追加</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="new-date">日付</label>
                  <Input
                    id="new-date"
                    type="date"
                    value={newRecord.date}
                    onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="new-wakeup">起床時間</label>
                  <Input
                    id="new-wakeup"
                    type="time"
                    value={newRecord.wakeUp ? format(parseISO(newRecord.wakeUp), 'HH:mm') : ''}
                    onChange={(e) => setNewRecord({ ...newRecord, wakeUp: `${newRecord.date}T${e.target.value}:00` })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="new-bedtime">就寝時間</label>
                  <Input
                    id="new-bedtime"
                    type="time"
                    value={newRecord.bedtime ? format(parseISO(newRecord.bedtime), 'HH:mm') : ''}
                    onChange={(e) => setNewRecord({ ...newRecord, bedtime: `${newRecord.date}T${e.target.value}:00` })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button onClick={handleAddRecord}>追加</Button>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">睡眠記録</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(date => addDays(date, -7))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold">
              {format(currentDate, 'yyyy年M月', { locale: ja })}
            </span>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(date => addDays(date, 7))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="week">
            <TabsList className="mb-4">
              <TabsTrigger value="week">週表示</TabsTrigger>
              <TabsTrigger value="list">リスト表示</TabsTrigger>
            </TabsList>
            <TabsContent value="week">
              {renderWeekView()}
            </TabsContent>
            <TabsContent value="list">
              <div className="space-y-2">
                {sleepRecords.slice(0, 10).map((record: SleepRecord) => (
                  <div key={record._id} className="flex justify-between items-center p-2 border rounded">
                    <span>{format(parseISO(record.date), 'M/d (E)', { locale: ja })}</span>
                    <div className="flex space-x-4">
                      <span className="flex items-center">
                        <Sun className="w-4 h-4 mr-1" />
                        <span>{record ? formatTime(record.wakeUp) : '--:--'}</span>
                      </span>
                      <span className="flex items-center">
                        <Moon className="w-4 h-4 mr-1" />
                        <span>{record ? formatTime(record.bedtime, true) : '--:--'}</span>
                      
                      </span>
                      <Button variant="outline" size="icon" onClick={() => openEditDialog(record)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDeleteRecord(record._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>レコードを編集</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-date">日付</label>
              <Input
                id="edit-date"
                type="date"
                value={editRecord?.date || ''}
                onChange={(e) => setEditRecord({ ...editRecord!, date: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-wakeup">起床時間</label>
              <Input
                id="edit-wakeup"
                type="time"
                value={editRecord?.wakeUp ? format(parseISO(editRecord.wakeUp), 'HH:mm') : ''}
                onChange={(e) => setEditRecord({ ...editRecord!, wakeUp: `${editRecord!.date}T${e.target.value}:00` })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-bedtime">就寝時間</label>
              <Input
                id="edit-bedtime"
                type="time"
                value={editRecord?.bedtime ? format(parseISO(editRecord.bedtime), 'HH:mm') : ''}
                onChange={(e) => setEditRecord({ ...editRecord!, bedtime: `${editRecord!.date}T${e.target.value}:00` })}
                className="col-span-3"
              />
            </div>
          </div>
          <Button onClick={handleUpdateRecord}>更新</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}