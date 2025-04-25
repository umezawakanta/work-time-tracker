import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/components/ui/use-toast"
import * as habitApi from '@/services/api/habitApi'

interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  monthlyProgress: number;
  lastChecked: string | null;
}

interface ServerHabit {
  _id: string;
  name: string;
  data: {
    [key: string]: boolean[];
  };
}

// 月内の日数を取得する関数
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

// 年月のキーを取得する関数（例：'2025-4'）
const getMonthKey = (date: Date) => {
  return `${date.getFullYear()}-${date.getMonth() + 1}`
}

/**
 * 習慣トラッキングのためのカスタムフック
 * @param habitList トラッキングする習慣のリスト
 * @returns トラッキングに必要な状態と関数
 */
export function useHabitTracker(habitList: string[]) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [trackedData, setTrackedData] = useState<{[key: string]: ServerHabit}>({})
  const [stats, setStats] = useState<{[key: string]: HabitStats}>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCongrats, setShowCongrats] = useState(false)
  const { toast } = useToast()

  // 祝福メッセージを表示する関数
  const showCongratsMessage = useCallback(() => {
    setShowCongrats(true)
    setTimeout(() => setShowCongrats(false), 3000)
  }, [])

  // 統計情報を計算する関数
  const calculateStats = useCallback(() => {
    const monthKey = getMonthKey(currentDate)
    const newStats: {[key: string]: HabitStats} = {}

    habitList.forEach(habit => {
      const habitData = trackedData[habit]?.data[monthKey] || []
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
  }, [currentDate, trackedData, habitList])

  // 初期データの読み込み
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const serverHabits = await habitApi.getHabits()
        if (serverHabits.length === 0) {
          // 初回のみ初期化
          await habitApi.initializeHabits(habitList)
          const initializedHabits = await habitApi.getHabits()
          const habitMap = initializedHabits.reduce((acc: {[key: string]: ServerHabit}, habit: ServerHabit) => {
            acc[habit.name] = habit
            return acc
          }, {})
          setTrackedData(habitMap)
        } else {
          const habitMap = serverHabits.reduce((acc: {[key: string]: ServerHabit}, habit: ServerHabit) => {
            acc[habit.name] = habit
            return acc
          }, {})
          setTrackedData(habitMap)
        }
      } catch (err) {
        console.error("Error loading data:", err)
        setError("データの読み込み中にエラーが発生しました。")
        toast({
          variant: "destructive",
          title: "エラー",
          description: "データの読み込みに失敗しました。",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [habitList, toast])

  // 月が変更されたときのデータ初期化
  useEffect(() => {
    const monthKey = getMonthKey(currentDate)
    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())

    const initializeMonthData = async () => {
      try {
        for (const habit of habitList) {
          const serverHabit = trackedData[habit]
          if (serverHabit && !serverHabit.data[monthKey]) {
            await habitApi.updateHabit(
              serverHabit._id,
              monthKey,
              Array(daysInMonth).fill(false)
            )
          }
        }
      } catch (error) {
        console.error('Error initializing month data:', error)
        toast({
          variant: "destructive",
          title: "エラー",
          description: "月初期化の処理に失敗しました。",
        })
      }
    }

    if (Object.keys(trackedData).length > 0) {
      initializeMonthData()
    }
  }, [currentDate, trackedData, habitList, toast])

  // 統計情報の更新
  useEffect(() => {
    calculateStats()
  }, [calculateStats])

  // 習慣の切り替え
  const toggleHabit = useCallback(async (habit: string, day: number) => {
    const monthKey = getMonthKey(currentDate)
    const serverHabit = trackedData[habit]
    
    if (!serverHabit) return

    try {
      const currentData = serverHabit.data[monthKey] || Array(getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())).fill(false)
      const newData = [...currentData]
      newData[day] = !newData[day]

      const updatedHabit = await habitApi.updateHabit(
        serverHabit._id,
        monthKey,
        newData
      )

      setTrackedData(prevData => ({
        ...prevData,
        [habit]: updatedHabit
      }))

      if (newData[day] && day === new Date().getDate() - 1) {
        const currentStreak = stats[habit]?.currentStreak || 0
        if (currentStreak + 1 >= 7) {
          showCongratsMessage()
        }
      }
    } catch (error) {
      console.error('Error updating habit:', error)
      toast({
        variant: "destructive",
        title: "エラー",
        description: "データの更新に失敗しました。",
      })
    }
  }, [currentDate, trackedData, stats, showCongratsMessage, toast])

  // 月の変更
  const handleMonthChange = useCallback((increment: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setMonth(prevDate.getMonth() + increment)
      return newDate
    })
  }, [])

  // 現在の日付の習慣データを取得
  const getHabitData = useCallback((habit: string) => {
    const monthKey = getMonthKey(currentDate)
    return trackedData[habit]?.data[monthKey] || Array(getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())).fill(false)
  }, [currentDate, trackedData])

  return {
    currentDate,
    trackedData,
    stats,
    isLoading,
    error,
    showCongrats,
    setShowCongrats,
    toggleHabit,
    handleMonthChange,
    getHabitData
  }
}