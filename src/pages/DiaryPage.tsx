"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import {
  Settings,
  Crown,
  Sparkles,
  ListTodo,
  Trophy,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Download, Upload } from "lucide-react";

// 型定義のインポート
import {
  DiaryEntry,
  Goal,
  Streak,
  Achievement,
  UserSettings,
  TagOption,
  GoalCategory,
  MotivationDataPoint,
  MonthlyStats,
} from "@/types";

// コンポーネント
import DiaryForm from "@/components/forms/DiaryForm";
import MonthlyCalendar from "@/components/calendar/MonthlyCalendar";
import MindfulnessSection from "@/components/MindfulnessSection";
import WeeklyView from "@/components/view/WeeklyView";
import DiaryHistory from "@/components/history/DiaryHistory";
import GoalManagement from "@/components/GoalManagement";
import AchievementsList from "@/components/AchievementsList";
import StatsView from "@/components/StatsView";
// 定数
const moodEmojis: Record<string, string> = {
  great: "😄",
  good: "🙂",
  neutral: "😐",
  bad: "😕",
  terrible: "😞",
};

const moodLabels: Record<string, string> = {
  great: "とても良い",
  good: "良い",
  neutral: "普通",
  bad: "悪い",
  terrible: "とても悪い",
};

const defaultAchievements: Achievement[] = [
  {
    id: "streak-3",
    name: "3日連続記録",
    description: "3日連続で記録をつけました",
    earned: false,
    icon: "Zap",
  },
  {
    id: "streak-7",
    name: "1週間継続",
    description: "7日連続で記録をつけました",
    earned: false,
    icon: "Medal",
  },
  {
    id: "streak-30",
    name: "1ヶ月マスター",
    description: "30日連続で記録をつけました",
    earned: false,
    icon: "Trophy",
  },
  {
    id: "entries-10",
    name: "10個の達成",
    description: "10個の達成を記録しました",
    earned: false,
    icon: "Star",
  },
  {
    id: "goals-5",
    name: "目標達成者",
    description: "5つの目標を達成しました",
    earned: false,
    icon: "CheckCircle",
  },
  // 新しい実績を追加
  {
    id: "streak-60",
    name: "60日継続の達人",
    description: "60日連続で記録をつけました",
    earned: false,
    icon: "Crown",
  },
  {
    id: "goals-15",
    name: "目標マスター",
    description: "15個の目標を達成しました",
    earned: false,
    icon: "Trophy",
  },
  {
    id: "difficult-5",
    name: "チャレンジャー",
    description: "難易度5の達成を3つ記録しました",
    earned: false,
    icon: "Star",
  },
];

const tagOptions: TagOption[] = [
  { value: "work", label: "仕事" },
  { value: "health", label: "健康" },
  { value: "learning", label: "学習" },
  { value: "social", label: "社交" },
  { value: "home", label: "家事" },
  { value: "hobby", label: "趣味" },
  { value: "small-win", label: "小さな勝利" },
  { value: "overcome", label: "困難克服" },
  // 新しいタグを追加
  { value: "creative", label: "創作活動" },
  { value: "mindfulness", label: "マインドフルネス" },
  { value: "productivity", label: "生産性向上" },
  { value: "personal-growth", label: "自己成長" },
];

const goalCategories: GoalCategory[] = [
  { value: "daily", label: "日常習慣" },
  { value: "weekly", label: "週間目標" },
  { value: "monthly", label: "月間目標" },
  { value: "long-term", label: "長期目標" },
];

// デフォルトのユーザー設定
const defaultSettings: UserSettings = {
  reminderEnabled: false,
  reminderTime: "20:00",
  darkMode: false,
  language: "ja",
  showTips: true,
};

const DiaryPage: React.FC = () => {
  // 状態管理
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [newAchievement, setNewAchievement] = useState("");
  const [newMood, setNewMood] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<number>(1);
  const [isImportant, setIsImportant] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("daily");
  const [newGoalDate, setNewGoalDate] = useState("");
  const [currentView, setCurrentView] = useState("day");
  const [streakData, setStreakData] = useState<Streak>({
    currentStreak: 0,
    longestStreak: 0,
    lastEntryDate: null,
  });
  const [achievements, setAchievements] =
    useState<Achievement[]>(defaultAchievements);
  const [showTips, setShowTips] = useState(true);
  const [isPremium, setIsPremium] = useState(false); // 開発中は切り替え可能に変更
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [userSettings, setUserSettings] =
    useState<UserSettings>(defaultSettings);
  const [showMonthlyCalendar, setShowMonthlyCalendar] = useState(false);

  // PCとモバイルで表示を切り替えるためのブレークポイント検出
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // 初期チェック
    checkScreenSize();

    // リサイズイベントのリスナーを設定
    window.addEventListener("resize", checkScreenSize);

    // コンポーネントのアンマウント時にリスナーを削除
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // 励ましのメッセージのリスト
  const encouragementMessages = [
    "今日の小さな一歩が、明日の大きな変化につながります",
    "自分を褒めることで、自信が育ちます",
    "完璧を目指さず、前進していることを評価しましょう",
    "小さな成功の積み重ねが、大きな達成を生み出します",
    "今日できたことに注目することで、明日への力になります",
    "どんなに小さなことでも、達成は達成です。自分を認めましょう",
    "困難を乗り越えた自分に、ご褒美をあげましょう",
    "自分の成長を感じることは、最大の自己肯定感につながります",
    "毎日の小さな成功を記録することで、自分の成長が見えてきます",
    "今日一日、あなたは素晴らしい努力をしました",
  ];

  // ランダムな励ましメッセージを取得
  const randomEncouragement =
    encouragementMessages[
      Math.floor(Math.random() * encouragementMessages.length)
    ];

  useEffect(() => {
    const storedEntries = localStorage.getItem("diaryEntries");
    const storedGoals = localStorage.getItem("diaryGoals");
    const storedStreak = localStorage.getItem("diaryStreak");
    const storedAchievements = localStorage.getItem("diaryAchievements");
    const storedSettings = localStorage.getItem("userSettings");

    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }
    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    }
    if (storedStreak) {
      setStreakData(JSON.parse(storedStreak));
    }
    if (storedAchievements) {
      setAchievements(JSON.parse(storedAchievements));
    }
    if (storedSettings) {
      setUserSettings(JSON.parse(storedSettings));
      setShowTips(JSON.parse(storedSettings).showTips);
    }

    // 初回訪問時のストリーク計算
    if (!storedStreak && storedEntries) {
      calculateStreaks(JSON.parse(storedEntries));
    }
  }, []);

  useEffect(() => {
    // ストリークデータが変わったら達成状況をチェック
    checkAchievements();
  }, [streakData, entries, goals]);

  const saveEntries = (newEntries: DiaryEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem("diaryEntries", JSON.stringify(newEntries));
    calculateStreaks(newEntries);
  };

  const saveGoals = (newGoals: Goal[]) => {
    setGoals(newGoals);
    localStorage.setItem("diaryGoals", JSON.stringify(newGoals));
  };

  const saveStreakData = (data: Streak) => {
    setStreakData(data);
    localStorage.setItem("diaryStreak", JSON.stringify(data));
  };

  const saveAchievements = (data: Achievement[]) => {
    setAchievements(data);
    localStorage.setItem("diaryAchievements", JSON.stringify(data));
  };

  const saveUserSettings = (settings: UserSettings) => {
    setUserSettings(settings);
    localStorage.setItem("userSettings", JSON.stringify(settings));
  };

  // プログレスバーのアニメーション機能
  const animateProgress = (selector: string, targetValue: number) => {
    if (typeof document === "undefined") return; // SSRの場合は何もしない

    const progressElement = document.querySelector(selector) as HTMLElement;
    if (!progressElement) return;

    let currentValue = 0;
    const duration = 1000; // アニメーション時間（ミリ秒）
    const interval = 16; // 更新間隔（ミリ秒）
    const steps = duration / interval;
    const increment = targetValue / steps;

    const animation = setInterval(() => {
      currentValue += increment;

      if (currentValue >= targetValue) {
        currentValue = targetValue;
        clearInterval(animation);
      }

      progressElement.style.width = `${currentValue}%`;
    }, interval);
  };

  // タブ切り替え時にプログレスバーをアニメーションさせる
  const handleTabChange = (value: string) => {
    if (value === "stats") {
      // 統計タブが選択されたらアニメーションを開始
      setTimeout(() => {
        animateProgress(".record-progress", (stats.entryCount / 30) * 100);
        animateProgress(".mood-progress", 100);
      }, 200);
    }
  };

  const calculateStreaks = (entries: DiaryEntry[]) => {
    if (entries.length === 0) {
      saveStreakData({
        currentStreak: 0,
        longestStreak: 0,
        lastEntryDate: null,
      });
      return;
    }

    // 日付でソート
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastEntryDate = new Date(sortedEntries[0].date);
    lastEntryDate.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // 最終エントリーが今日か昨日なら現在のストリークを計算
    const isEntryTodayOrYesterday =
      lastEntryDate.getTime() === today.getTime() ||
      lastEntryDate.getTime() === yesterday.getTime();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    if (isEntryTodayOrYesterday) {
      // 日付の連続性をチェック
      const dates = sortedEntries.map((entry) => {
        const date = new Date(entry.date);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      });

      currentStreak = 1; // まず最新の記録で1日とカウント

      // 最新のエントリーから遡って連続した日付をカウント
      for (let i = 1; i < dates.length; i++) {
        const currentDate = new Date(sortedEntries[i - 1].date);
        currentDate.setHours(0, 0, 0, 0);

        const prevDate = new Date(sortedEntries[i].date);
        prevDate.setHours(0, 0, 0, 0);

        const dayDiff = Math.round(
          (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (dayDiff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // 最長ストリークの計算
    const entriesByDate: Record<string, boolean> = {};
    sortedEntries.forEach((entry) => {
      entriesByDate[entry.date.substring(0, 10)] = true;
    });

    const allDates = Object.keys(entriesByDate).sort();

    tempStreak = 1;
    longestStreak = 1;

    for (let i = 1; i < allDates.length; i++) {
      const currentDate = new Date(allDates[i]);
      const prevDate = new Date(allDates[i - 1]);

      const dayDiff = Math.round(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak);

    saveStreakData({
      currentStreak,
      longestStreak,
      lastEntryDate: sortedEntries[0].date,
    });
  };

  const checkAchievements = () => {
    let updated = false;
    const newAchievements = [...achievements];

    // 連続日数の達成をチェック
    const streakAchievements = [
      { id: "streak-3", days: 3 },
      { id: "streak-7", days: 7 },
      { id: "streak-30", days: 30 },
      { id: "streak-60", days: 60 },
    ];

    streakAchievements.forEach(({ id, days }) => {
      const achievement = newAchievements.find((a) => a.id === id);
      if (
        achievement &&
        !achievement.earned &&
        streakData.currentStreak >= days
      ) {
        achievement.earned = true;
        achievement.date = new Date().toISOString();
        updated = true;
        toast({
          title: "新しい実績を獲得しました！",
          description: achievement.description,
          duration: 5000,
        });
      }
    });

    // エントリー数の達成をチェック
    const entriesAchievement = newAchievements.find(
      (a) => a.id === "entries-10"
    );
    if (
      entriesAchievement &&
      !entriesAchievement.earned &&
      entries.length >= 10
    ) {
      entriesAchievement.earned = true;
      entriesAchievement.date = new Date().toISOString();
      updated = true;
      toast({
        title: "新しい実績を獲得しました！",
        description: entriesAchievement.description,
        duration: 5000,
      });
    }

    // 目標達成数のチェック
    const completedGoals = goals.filter((goal) => goal.completed).length;
    const goalAchievements = [
      { id: "goals-5", count: 5 },
      { id: "goals-15", count: 15 },
    ];

    goalAchievements.forEach(({ id, count }) => {
      const achievement = newAchievements.find((a) => a.id === id);
      if (achievement && !achievement.earned && completedGoals >= count) {
        achievement.earned = true;
        achievement.date = new Date().toISOString();
        updated = true;
        toast({
          title: "新しい実績を獲得しました！",
          description: achievement.description,
          duration: 5000,
        });
      }
    });

    // 難しい達成のチェック
    const difficultAchievements = entries.filter(
      (entry) => entry.difficulty === 5
    ).length;
    const difficultAchievement = newAchievements.find(
      (a) => a.id === "difficult-5"
    );
    if (
      difficultAchievement &&
      !difficultAchievement.earned &&
      difficultAchievements >= 3
    ) {
      difficultAchievement.earned = true;
      difficultAchievement.date = new Date().toISOString();
      updated = true;
      toast({
        title: "新しい実績を獲得しました！",
        description: difficultAchievement.description,
        duration: 5000,
      });
    }

    if (updated) {
      saveAchievements(newAchievements);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = format(new Date(), "yyyy-MM-dd");

    if (!newAchievement.trim()) {
      toast({
        title: "入力エラー",
        description: "達成内容を入力してください",
        variant: "destructive",
      });
      return;
    }

    if (editingEntry) {
      const updatedEntries = entries.map((entry) =>
        entry.id === editingEntry.id
          ? {
              ...entry,
              achievement: newAchievement,
              mood: newMood,
              tags: selectedTags,
              difficulty,
              isImportant,
            }
          : entry
      );
      saveEntries(updatedEntries);
      setEditingEntry(null);
      toast({
        title: "エントリーを更新しました",
        description: "日記のエントリーが正常に更新されました。",
      });
    } else {
      const newEntry: DiaryEntry = {
        id: Date.now().toString(),
        date: today,
        achievement: newAchievement,
        mood: newMood,
        tags: selectedTags,
        difficulty,
        isImportant,
      };

      // 同じ日付のエントリーがあれば置き換え、なければ追加
      const updatedEntries = [
        newEntry,
        ...entries.filter((entry) => entry.date !== today),
      ];
      saveEntries(updatedEntries);
      toast({
        title: "新しいエントリーを追加しました",
        description: "新しい日記のエントリーが正常に追加されました。",
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setNewAchievement("");
    setNewMood("");
    setSelectedTags([]);
    setDifficulty(1);
    setIsImportant(false);
  };

  const handleEdit = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setNewAchievement(entry.achievement);
    setNewMood(entry.mood || "");
    setSelectedTags(entry.tags || []);
    setDifficulty(entry.difficulty || 1);
    setIsImportant(entry.isImportant || false);
  };

  const handleDelete = (id: string) => {
    const updatedEntries = entries.filter((entry) => entry.id !== id);
    saveEntries(updatedEntries);
    toast({
      title: "エントリーを削除しました",
      description: "日記のエントリーが正常に削除されました。",
      variant: "destructive",
    });
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(
      selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag]
    );
  };

  // エクスポート機能
  const exportData = () => {
    const data = {
      entries,
      goals,
      streakData,
      achievements,
      userSettings,
    };

    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `adhd-diary-export-${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "データをエクスポートしました",
      description: "すべてのデータが正常にエクスポートされました。",
    });
  };

  // インポート機能
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);

        if (importedData.entries) setEntries(importedData.entries);
        if (importedData.goals) setGoals(importedData.goals);
        if (importedData.streakData) setStreakData(importedData.streakData);
        if (importedData.achievements)
          setAchievements(importedData.achievements);
        if (importedData.userSettings) {
          setUserSettings(importedData.userSettings);
          setShowTips(importedData.userSettings.showTips);
        }

        // データを保存
        localStorage.setItem(
          "diaryEntries",
          JSON.stringify(importedData.entries || [])
        );
        localStorage.setItem(
          "diaryGoals",
          JSON.stringify(importedData.goals || [])
        );
        localStorage.setItem(
          "diaryStreak",
          JSON.stringify(
            importedData.streakData || {
              currentStreak: 0,
              longestStreak: 0,
              lastEntryDate: null,
            }
          )
        );
        localStorage.setItem(
          "diaryAchievements",
          JSON.stringify(importedData.achievements || defaultAchievements)
        );
        localStorage.setItem(
          "userSettings",
          JSON.stringify(importedData.userSettings || defaultSettings)
        );

        toast({
          title: "データをインポートしました",
          description: "すべてのデータが正常にインポートされました。",
        });
      } catch (error) {
        console.error("インポートエラー:", error);
        toast({
          title: "インポートエラー",
          description: `データの読み込み中にエラーが発生しました: ${
            error instanceof Error ? error.message : "不明なエラー"
          }`,
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  // 月間統計を計算
  const calculateMonthlyStats = (): MonthlyStats => {
    // 表示中の月のエントリーを抽出（デフォルトは今月）
    const selectedMonth = currentMonth.getMonth();
    const selectedYear = currentMonth.getFullYear();

    const monthEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getMonth() === selectedMonth &&
        entryDate.getFullYear() === selectedYear
      );
    });

    // 気分ごとのカウント
    const moodCounts: Record<string, number> = {
      great: 0,
      good: 0,
      neutral: 0,
      bad: 0,
      terrible: 0,
    };

    monthEntries.forEach((entry) => {
      if (entry.mood) {
        moodCounts[entry.mood]++;
      }
    });

    // タグごとのカウント
    const tagCounts: Record<string, number> = {};
    monthEntries.forEach((entry) => {
      entry.tags?.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // 平均難易度
    const avgDifficulty =
      monthEntries.length > 0
        ? monthEntries.reduce(
            (sum, entry) => sum + (entry.difficulty || 1),
            0
          ) / monthEntries.length
        : 0;

    // 週ごとの達成数
    const weeklyAchievements: Record<number, number> = {};

    monthEntries.forEach((entry) => {
      const entryDate = new Date(entry.date);
      // その日の週番号を取得（月の最初の日から何週目か）
      const weekOfMonth = Math.ceil(entryDate.getDate() / 7);
      weeklyAchievements[weekOfMonth] =
        (weeklyAchievements[weekOfMonth] || 0) + 1;
    });

    return {
      entryCount: monthEntries.length,
      moodCounts,
      tagCounts,
      avgDifficulty,
      importantCount: monthEntries.filter((e) => e.isImportant).length,
      weeklyAchievements,
      // 追加統計情報
      highDifficultyCount: monthEntries.filter((e) => e.difficulty >= 4).length,
      completedGoalsThisMonth: goals.filter((g) => {
        if (!g.completed || !g.targetDate) return false;
        const targetDate = new Date(g.targetDate);
        return (
          targetDate.getMonth() === selectedMonth &&
          targetDate.getFullYear() === selectedYear
        );
      }).length,
    };
  };

  // モチベーショングラフのデータを準備
  const prepareMotivationGraphData = (): MotivationDataPoint[] => {
    // 過去30日間のデータを準備
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

    const dateRange = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      return format(date, "yyyy-MM-dd");
    });

    // 日々のモチベーション値をマッピング（気分をスコアに変換）
    const moodScores: Record<string, number> = {
      great: 5,
      good: 4,
      neutral: 3,
      bad: 2,
      terrible: 1,
    };

    return dateRange.map((dateStr) => {
      const entry = entries.find((e) => e.date === dateStr);
      const defaultScore = 0; // データがない日は0
      const score = entry?.mood ? moodScores[entry.mood] : defaultScore;

      return {
        date: format(new Date(dateStr), "MM/dd"),
        value: score,
        difficulty: entry?.difficulty || 0,
        hasEntry: !!entry,
      };
    });
  };

  // 重要な達成を強調表示するクラスを取得
  const getEntryClass = (entry: DiaryEntry) => {
    if (entry.isImportant) {
      return "border-l-4 border-amber-400 pl-4";
    }
    return "";
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newGoal.trim()) {
      toast({
        title: "入力エラー",
        description: "目標内容を入力してください",
        variant: "destructive",
      });
      return;
    }

    const newGoalObj: Goal = {
      id: Date.now().toString(),
      description: newGoal,
      category: newGoalCategory,
      completed: false,
      createdAt: new Date().toISOString(),
      targetDate: newGoalDate || undefined,
    };

    const updatedGoals = [newGoalObj, ...goals];
    saveGoals(updatedGoals);

    setNewGoal("");
    setNewGoalCategory("daily");
    setNewGoalDate("");

    toast({
      title: "新しい目標を追加しました",
      description: "新しい目標が正常に追加されました。",
    });
  };

  const handleToggleGoal = (id: string) => {
    const updatedGoals = goals.map((goal) =>
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    );
    saveGoals(updatedGoals);
  };

  const handleDeleteGoal = (id: string) => {
    const updatedGoals = goals.filter((goal) => goal.id !== id);
    saveGoals(updatedGoals);

    toast({
      title: "目標を削除しました",
      description: "目標が正常に削除されました。",
      variant: "destructive",
    });
  };

  // 統計データの計算
  const stats = calculateMonthlyStats();

  // 週間ビューをレンダリング
  const renderWeeklyView = () => {
    return <WeeklyView entries={entries} moodEmojis={moodEmojis} />;
  };

  // 月間カレンダーをレンダリング
  const renderMonthlyCalendar = () => {
    return (
      <MonthlyCalendar
        entries={entries}
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        handleEdit={handleEdit}
        setEditingEntry={setEditingEntry}
        moodEmojis={moodEmojis}
        showDetailed={showMonthlyCalendar}
      />
    );
  };

  return (
    <div
      className={`container mx-auto p-4 ${
        userSettings.darkMode ? "dark bg-gray-900 text-white" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h1
          className={`text-xl md:text-2xl font-bold ${
            isMobile ? "text-center mb-2" : ""
          }`}
        >
          ADHD改善・自己肯定感向上日記
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            className="rounded-full"
            aria-label="設定"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* 開発中のプレミアム切り替えボタン */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPremium(!isPremium)}
            className="rounded-full"
            aria-label="プレミアム切り替え"
          >
            <Crown
              className={`h-5 w-5 ${
                isPremium ? "text-amber-500" : "text-gray-400"
              }`}
            />
          </Button>

          {!isPremium && (
            <Button
              variant="outline"
              className="gap-1 text-amber-600 border-amber-300"
            >
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">
                プレミアムにアップグレード
              </span>
              <span className="sm:hidden">プレミアム</span>
            </Button>
          )}
        </div>
      </div>

      {/* 設定ダイアログ */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>設定</DialogTitle>
            <DialogDescription>アプリの設定を変更します</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="reminder-toggle">リマインダー</Label>
              <Switch
                id="reminder-toggle"
                checked={userSettings.reminderEnabled}
                onCheckedChange={(checked) => {
                  saveUserSettings({
                    ...userSettings,
                    reminderEnabled: checked,
                  });
                }}
              />
            </div>

            {userSettings.reminderEnabled && (
              <div>
                <Label htmlFor="reminder-time">リマインド時間</Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={userSettings.reminderTime}
                  onChange={(e) => {
                    saveUserSettings({
                      ...userSettings,
                      reminderTime: e.target.value,
                    });
                  }}
                  className="mt-1"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="tips-toggle">ヒントを表示</Label>
              <Switch
                id="tips-toggle"
                checked={userSettings.showTips}
                onCheckedChange={(checked) => {
                  saveUserSettings({
                    ...userSettings,
                    showTips: checked,
                  });
                  setShowTips(checked);
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode-toggle">ダークモード</Label>
              <Switch
                id="dark-mode-toggle"
                checked={userSettings.darkMode}
                onCheckedChange={(checked) => {
                  saveUserSettings({
                    ...userSettings,
                    darkMode: checked,
                  });
                }}
              />
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">データ管理</h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportData}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  エクスポート
                </Button>

                <Label
                  htmlFor="import-file"
                  className="cursor-pointer flex items-center gap-1 px-3 py-1 text-sm border rounded-md bg-white hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4" />
                  インポート
                </Label>
                <input
                  id="import-file"
                  type="file"
                  onChange={importData}
                  accept=".json"
                  className="hidden"
                  aria-label="JSONファイルをインポート" // アクセシビリティラベルを追加
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* マインドフルネスセクション */}
      <MindfulnessSection isPremium={isPremium} />

      <Tabs
        defaultValue="diary"
        className="mb-4"
        onValueChange={handleTabChange}
      >
        <TabsList className={`mb-4 ${isMobile ? "flex w-full" : ""}`}>
          <TabsTrigger value="diary" className="flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            日記
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-1">
            <ListTodo className="h-4 w-4" />
            目標
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            実績
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-1">
            <LineChart className="h-4 w-4" />
            統計
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diary">
          <div className="grid gap-4 md:grid-cols-2">
            <DiaryForm
              editingEntry={editingEntry}
              newAchievement={newAchievement}
              setNewAchievement={setNewAchievement}
              newMood={newMood}
              setNewMood={setNewMood}
              selectedTags={selectedTags}
              handleTagToggle={handleTagToggle}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              isImportant={isImportant}
              setIsImportant={setIsImportant}
              handleSubmit={handleSubmit}
              resetForm={resetForm}
              setEditingEntry={setEditingEntry}
              tagOptions={tagOptions}
              moodEmojis={moodEmojis}
              moodLabels={moodLabels}
              showTips={showTips}
              encouragementMessage={randomEncouragement}
            />

            <DiaryHistory
              entries={entries}
              currentView={currentView}
              setCurrentView={setCurrentView}
              isPremium={isPremium}
              renderWeeklyView={renderWeeklyView}
              renderMonthlyCalendar={renderMonthlyCalendar}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              getEntryClass={getEntryClass}
              tagOptions={tagOptions}
              moodEmojis={moodEmojis}
              showMonthlyCalendar={showMonthlyCalendar}
              setShowMonthlyCalendar={setShowMonthlyCalendar}
            />
          </div>
        </TabsContent>

        {/* 他のタブの内容はここに追加 */}
        <TabsContent value="goals">
          <GoalManagement
            goals={goals}
            saveGoals={saveGoals}
            newGoal={newGoal}
            setNewGoal={setNewGoal}
            newGoalCategory={newGoalCategory}
            setNewGoalCategory={setNewGoalCategory}
            newGoalDate={newGoalDate}
            setNewGoalDate={setNewGoalDate}
            handleAddGoal={handleAddGoal}
            handleToggleGoal={handleToggleGoal}
            handleDeleteGoal={handleDeleteGoal}
            goalCategories={goalCategories}
          />
        </TabsContent>

        <TabsContent value="achievements">
          <AchievementsList
            achievements={achievements}
            streakData={streakData}
          />
        </TabsContent>

        <TabsContent value="stats">
          <StatsView
            entries={entries}
            goals={goals}
            stats={calculateMonthlyStats()}
            motivationData={prepareMotivationGraphData()}
            moodEmojis={moodEmojis}
            moodLabels={moodLabels}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            tagOptions={tagOptions}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DiaryPage;
