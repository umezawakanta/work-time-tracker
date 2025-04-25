import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronDown, ChevronUp, Trophy, Flame, Target, Info } from 'lucide-react'
import { useHabitTracker } from '@/hooks/useHabitTracker'

// 避けたい習慣のリスト
const habits = [
  "酒", "たばこ", "風俗", "パチンコ", "姿勢が悪い",
  "睡眠不足", "嘘をつく", "すぐ否定する", "謎のプライド", "ネガティブ",
  "すぐSNS開く", "オ〇ニー", "昼夜逆転", "後回し癖", "失敗を恐れる",
  "見栄を張る", "承認欲求おばけ", "コンビニ弁当", "ジャンクフード", "エナジードリンク", 
  "髪をさわる", "顔をさわる"
]

export default function HabitTracker() {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const {
    currentDate,
    stats,
    isLoading,
    error,
    showCongrats,
    toggleHabit,
    handleMonthChange,
    getHabitData
  } = useHabitTracker(habits)

  const renderHeatmap = (habit: string) => {
    const habitData = getHabitData(habit)
    
    return habitData.map((avoided, index) => (
      <div
        key={index}
        className={`w-4 h-4 ${avoided ? 'bg-green-500' : 'bg-red-500'} 
                  hover:opacity-75 transition-opacity cursor-pointer rounded`}
        title={`${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${index + 1}日: ${avoided ? '達成' : '未達成'}`}
        onClick={() => toggleHabit(habit, index)}
        aria-label={`${avoided ? '達成' : '未達成'}: ${index + 1}日目`}
      />
    ))
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex justify-center items-center h-32">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" aria-hidden="true" />
            やらないこと トラッカー
          </span>
          <Button variant="ghost" size="sm" className="p-1 h-auto">
            {isExpanded ? <ChevronUp size={24} aria-label="折りたたむ" /> : <ChevronDown size={24} aria-label="展開する" />}
          </Button>
        </CardTitle>
      </CardHeader>
      {showCongrats && (
        <Alert className="mx-4 mb-4 bg-green-50">
          <Trophy className="h-4 w-4 text-green-500" aria-hidden="true" />
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
              aria-label="前月へ移動"
            >
              前月
            </Button>
            <span className="text-lg font-medium">
              {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
            </span>
            <Button 
              onClick={() => handleMonthChange(1)}
              variant="outline"
              aria-label="次月へ移動"
            >
              次月
            </Button>
          </div>
          <div className="overflow-x-auto">
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
                  const habitStats = stats[habit] || {
                    currentStreak: 0,
                    longestStreak: 0,
                    monthlyProgress: 0
                  }
                  
                  return (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{habit}</TableCell>
                      <TableCell>
                        <Checkbox
                          checked={getHabitData(habit)[currentDate.getDate() - 1] || false}
                          onCheckedChange={() => toggleHabit(habit, currentDate.getDate() - 1)}
                          aria-label={`${habit}を今日達成したかどうか`}
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
                            <Flame className="h-4 w-4 text-orange-500" aria-hidden="true" />
                            <span className="text-sm">現在: {habitStats.currentStreak}日継続中</span>
                            {habitStats.currentStreak >= 7 && (
                              <Badge variant="outline" className="bg-yellow-50">
                                🔥 7日達成
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-yellow-500" aria-hidden="true" />
                            <span className="text-sm">最長: {habitStats.longestStreak}日</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Target className="h-4 w-4 text-blue-500" aria-hidden="true" />
                              <span className="text-sm">月間達成率</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={habitStats.monthlyProgress} 
                                className="h-2 w-full"
                                aria-label={`${habit}の月間達成率: ${habitStats.monthlyProgress}%`}
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
          </div>
        </CardContent>
      )}
    </Card>
  )
}