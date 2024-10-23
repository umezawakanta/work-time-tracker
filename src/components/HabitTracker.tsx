import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

const habits = [
  "酒", "たばこ", "風俗", "パチンコ", "姿勢が悪い",
  "睡眠不足", "嘘をつく", "すぐ否定する", "謎のプライド", "ネガティブ",
  "すぐSNS開く", "オ〇ニー", "昼夜逆転", "後回し癖", "失敗を恐れる",
  "見栄を張る", "承認欲求おばけ", "コンビニ弁当", "ジャンクフード", "エナジードリンク", 
  "髪をさわる", "顔をさわる"
]

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

export default function HabitTracker() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [trackedData, setTrackedData] = useState<{[key: string]: boolean[]}>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeData = () => {
      setIsLoading(true)
      setError(null)
      try {
        const storedData = localStorage.getItem('habitTrackerData')
        if (storedData) {
          const parsedData = JSON.parse(storedData)
          setTrackedData(parsedData)
          console.log("Loaded data from localStorage:", parsedData)
        } else {
          const initialData: {[key: string]: boolean[]} = {}
          habits.forEach(habit => {
            initialData[habit] = Array(getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())).fill(false)
          })
          setTrackedData(initialData)
          console.log("Initialized new data:", initialData)
        }
      } catch (err) {
        console.error("Error initializing data:", err)
        setError("データの初期化中にエラーが発生しました。")
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()
  }, [currentDate])

  useEffect(() => {
    if (Object.keys(trackedData).length > 0) {
      try {
        localStorage.setItem('habitTrackerData', JSON.stringify(trackedData))
        console.log("Saved data to localStorage:", trackedData)
      } catch (err) {
        console.error("Error saving data to localStorage:", err)
      }
    }
  }, [trackedData])

  const toggleHabit = (habit: string, day: number) => {
    setTrackedData(prevData => {
      const habitData = prevData[habit] || Array(getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())).fill(false)
      const newHabitData = [...habitData]
      newHabitData[day] = !newHabitData[day]
      const newData = {
        ...prevData,
        [habit]: newHabitData
      }
      console.log("Updated data:", newData)
      return newData
    })
  }

  const renderHeatmap = (habit: string) => {
    const habitData = trackedData[habit] || []
    return habitData.map((avoided, index) => (
      <div
        key={index}
        className={`w-4 h-4 ${avoided ? 'bg-green-500' : 'bg-red-500'}`}
        title={`Day ${index + 1}: ${avoided ? 'Avoided' : 'Not avoided'}`}
      />
    ))
  }

  if (isLoading) {
    return <div>データを読み込んでいます...</div>
  }

  if (error) {
    return <div>エラー: {error}</div>
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>やらないこと トラッカー</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>前月</Button>
          <span className="mx-4">{currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月</span>
          <Button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>次月</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>やらないこと</TableHead>
              <TableHead>今日</TableHead>
              <TableHead>継続状況</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {habits.map((habit, index) => (
              <TableRow key={index}>
                <TableCell>{habit}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={trackedData[habit]?.[currentDate.getDate() - 1] || false}
                    onCheckedChange={() => toggleHabit(habit, currentDate.getDate() - 1)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {renderHeatmap(habit)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}