import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronDown, ChevronUp, Trophy, Flame, Target } from 'lucide-react'

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

interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  monthlyProgress: number;
  lastChecked: string | null;
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
  const [stats, setStats] = useState<{[key: string]: HabitStats}>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const [showCongrats, setShowCongrats] = useState(false)

  const showCongratsMessage = () => {
    setShowCongrats(true)
    setTimeout(() => setShowCongrats(false), 3000)
  }

  const calculateStats = useCallback(() => {
    const monthKey = getMonthKey(currentDate)
    const newStats: {[key: string]: HabitStats} = {}

    habits.forEach(habit => {
      const habitData = trackedData[habit]?.[monthKey] || []
      const today = new Date().getDate() - 1
      
      // 現在の継続日数を計算
      let currentStreak = 0
      for (let i = today; i >= 0; i--) {
        if (habitData[i]) currentStreak++
        else break
      }

      // 最長継続日数を計算
      let longestStreak = 0
      let tempStreak = 0
      habitData.forEach(day => {
        if (day) {
          tempStreak++
          longestStreak = Math.max(longestStreak, tempStreak)
        } else {
          tempStreak = 0
        }
      })

      // 月間達成率を計算
      const totalDays = today + 1
      const achievedDays = habitData.slice(0, totalDays).filter(Boolean).length
      const monthlyProgress = totalDays > 0 ? Math.round((achievedDays / totalDays) * 100) : 0

      newStats[habit] = {
        currentStreak,
        longestStreak,
        monthlyProgress,
        lastChecked: habitData[today] ? new Date().toISOString() : null
      }
    })

    setStats(newStats)
  }, [currentDate, trackedData])

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

  // データの保存と統計の更新
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

  // 統計情報の更新
  useEffect(() => {
    calculateStats()
  }, [calculateStats])

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
      
      const newValue = !newData[habit][monthKey][day]
      newData[habit][monthKey][day] = newValue
      
      // 達成時にお祝いメッセージを表示
      if (newValue && day === new Date().getDate() - 1) {
        const currentStreak = stats[habit]?.currentStreak || 0
        if (currentStreak + 1 >= 7) {  // 1週間継続達成
          showCongratsMessage()
        }
      }
      
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
                   hover:opacity-75 transition-opacity cursor-pointer rounded`}
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
      {showCongrats && (
        <Alert className="mx-4 mb-4 bg-green-50">
          <Trophy className="h-4 w-4 text-green-500" />
          <AlertDescription>
            素晴らしい！1週間継続達成です！この調子で頑張りましょう！
          </AlertDescription>
        </Alert>
      )}
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
                <TableHead className="w-32">やらないこと</TableHead>
                <TableHead className="w-24">今日</TableHead>
                <TableHead>継続状況（クリックで変更可能）</TableHead>
                <TableHead className="w-48">統計</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {habits.map((habit, index) => {
                const monthKey = getMonthKey(currentDate)
                const habitStats = stats[habit] || {
                  currentStreak: 0,
                  longestStreak: 0,
                  monthlyProgress: 0
                }
                
                return (
                  <TableRow key={index} className="hover:bg-gray-50">
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
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Flame className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">現在: {habitStats.currentStreak}日継続中</span>
                          {habitStats.currentStreak >= 7 && (
                            <Badge variant="outline" className="bg-yellow-50">
                              🔥 7日達成
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">最長: {habitStats.longestStreak}日</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Target className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">月間達成率</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={habitStats.monthlyProgress} 
                              className="h-2 w-full"
                            />
                            <span className="text-xs text-gray-500 min-w-[3ch]">
                              {habitStats.monthlyProgress}%
                            </span>
                          </div>
                        </div>
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