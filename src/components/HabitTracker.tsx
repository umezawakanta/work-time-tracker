import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from 'lucide-react'

const habits = [
  "酒", "たばこ", "風俗", "パチンコ", "姿勢が悪い",
  "睡眠不足", "嘘をつく", "すぐ否定する", "謎のプライド", "ネガティブ",
  "すぐSNS開く", "オ〇ニー", "昼夜逆転", "後回し癖", "失敗を恐れる",
  "見栄を張る", "承認欲求おばけ", "コンビニ弁当", "ジャンクフード", "エナジードリンク", 
  "髪をさわる", "顔をさわる"
]

interface HabitData {
  [key: string]: {
    [key: string]: boolean[] // year-month をキーとした月別データ
  }
}

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

const getMonthKey = (date: Date) => {
  return `${date.getFullYear()}-${date.getMonth() + 1}`
}

export default function HabitTracker() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [trackedData, setTrackedData] = useState<HabitData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)

  // 初期データの読み込み
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true)
      setError(null)
      try {
        const storedData = localStorage.getItem('habitTrackerData')
        if (storedData) {
          const parsedData = JSON.parse(storedData)
          setTrackedData(parsedData)
        }
      } catch (err) {
        console.error("Error loading data:", err)
        setError("データの読み込み中にエラーが発生しました。")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // 月が変更されたときのデータ初期化
  useEffect(() => {
    const monthKey = getMonthKey(currentDate)
    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())

    setTrackedData(prevData => {
      const newData = { ...prevData }
      
      habits.forEach(habit => {
        if (!newData[habit]) {
          newData[habit] = {}
        }
        if (!newData[habit][monthKey]) {
          newData[habit][monthKey] = Array(daysInMonth).fill(false)
        }
      })

      return newData
    })
  }, [currentDate])

  // データの保存
  useEffect(() => {
    if (Object.keys(trackedData).length > 0) {
      try {
        localStorage.setItem('habitTrackerData', JSON.stringify(trackedData))
      } catch (err) {
        console.error("Error saving data:", err)
        setError("データの保存中にエラーが発生しました。")
      }
    }
  }, [trackedData])

  const toggleHabit = (habit: string, day: number) => {
    const monthKey = getMonthKey(currentDate)
    
    setTrackedData(prevData => {
      const newData = { ...prevData }
      if (!newData[habit]) {
        newData[habit] = {}
      }
      if (!newData[habit][monthKey]) {
        newData[habit][monthKey] = Array(getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())).fill(false)
      }
      
      newData[habit][monthKey][day] = !newData[habit][monthKey][day]
      return newData
    })
  }

  const renderHeatmap = (habit: string) => {
    const monthKey = getMonthKey(currentDate)
    const habitData = trackedData[habit]?.[monthKey] || Array(getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())).fill(false)
    
    return habitData.map((avoided, index) => (
      <div
        key={index}
        className={`w-4 h-4 ${avoided ? 'bg-green-500' : 'bg-red-500'} 
                   hover:opacity-75 transition-opacity cursor-pointer`}
        title={`${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${index + 1}日: ${avoided ? '達成' : '未達成'}`}
        onClick={() => toggleHabit(habit, index)}
      />
    ))
  }

  const handleMonthChange = (increment: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setMonth(prevDate.getMonth() + increment)
      return newDate
    })
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-32">データを読み込んでいます...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex justify-between items-center">
          やらないこと トラッカー
          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="mb-4 flex items-center justify-center gap-4">
            <Button 
              onClick={() => handleMonthChange(-1)}
              variant="outline"
            >
              前月
            </Button>
            <span className="text-lg font-medium">
              {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
            </span>
            <Button 
              onClick={() => handleMonthChange(1)}
              variant="outline"
            >
              次月
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>やらないこと</TableHead>
                <TableHead>今日</TableHead>
                <TableHead>継続状況（クリックで変更可能）</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {habits.map((habit, index) => {
                const monthKey = getMonthKey(currentDate)
                return (
                  <TableRow key={index}>
                    <TableCell>{habit}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={trackedData[habit]?.[monthKey]?.[currentDate.getDate() - 1] || false}
                        onCheckedChange={() => toggleHabit(habit, currentDate.getDate() - 1)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {renderHeatmap(habit)}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      )}
    </Card>
  )
}