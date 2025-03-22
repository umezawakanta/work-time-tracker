"use client";

import React, { useState, useEffect } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import { ja } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Calendar,
  CheckCircle,
  Crown,
  Edit,
  LineChart,
  ListTodo,
  Medal,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  Zap,
} from "lucide-react";

interface DiaryEntry {
  id: string;
  date: string;
  achievement: string;
  mood: string;
  tags: string[];
  difficulty: number;
  isImportant: boolean;
}

interface Goal {
  id: string;
  description: string;
  completed: boolean;
  createdAt: string;
  targetDate?: string;
  category: string;
}

interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string | null;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  date?: string;
  icon: string;
}

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
];

const tagOptions = [
  { value: "work", label: "仕事" },
  { value: "health", label: "健康" },
  { value: "learning", label: "学習" },
  { value: "social", label: "社交" },
  { value: "home", label: "家事" },
  { value: "hobby", label: "趣味" },
  { value: "small-win", label: "小さな勝利" },
  { value: "overcome", label: "困難克服" },
];

const goalCategories = [
  { value: "daily", label: "日常習慣" },
  { value: "weekly", label: "週間目標" },
  { value: "monthly", label: "月間目標" },
  { value: "long-term", label: "長期目標" },
];

const DiaryPage: React.FC = () => {
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
  // const setIsPremium を削除し、代わりに直接既定値を使用
  const isPremium = false; // 実際のアプリでは認証状態から取得

  // 励ましのメッセージのリスト
  const encouragementMessages = [
    "今日の小さな一歩が、明日の大きな変化につながります",
    "自分を褒めることで、自信が育ちます",
    "完璧を目指さず、前進していることを評価しましょう",
    "小さな成功の積み重ねが、大きな達成を生み出します",
    "今日できたことに注目することで、明日への力になります",
    "どんなに小さなことでも、達成は達成です。自分を認めましょう",
    "困難を乗り越えた自分に、ご褒美をあげましょう",
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
    const goalsAchievement = newAchievements.find((a) => a.id === "goals-5");
    if (goalsAchievement && !goalsAchievement.earned && completedGoals >= 5) {
      goalsAchievement.earned = true;
      goalsAchievement.date = new Date().toISOString();
      updated = true;
      toast({
        title: "新しい実績を獲得しました！",
        description: goalsAchievement.description,
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

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.trim()) {
      const newGoalItem: Goal = {
        id: Date.now().toString(),
        description: newGoal,
        completed: false,
        createdAt: new Date().toISOString(),
        targetDate: newGoalDate || undefined,
        category: newGoalCategory,
      };
      saveGoals([...goals, newGoalItem]);
      setNewGoal("");
      setNewGoalDate("");
      setNewGoalCategory("daily");
      toast({
        title: "新しい目標を追加しました",
        description: "目標が正常に追加されました。",
      });
    }
  };

  const handleToggleGoal = (id: string) => {
    const updatedGoals = goals.map((goal) => {
      if (goal.id === id) {
        // 未完了から完了への変更の場合
        if (!goal.completed) {
          toast({
            title: "目標を達成しました",
            description: "おめでとうございます！目標を達成しました。",
          });
        }
        return { ...goal, completed: !goal.completed };
      }
      return goal;
    });
    saveGoals(updatedGoals);
  };

  const handleDeleteGoal = (id: string) => {
    saveGoals(goals.filter((goal) => goal.id !== id));
    toast({
      title: "目標を削除しました",
      description: "目標が正常に削除されました。",
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

  // 未使用の関数を削除
  // getAchievementIcon 関数は削除

  const renderWeeklyView = () => {
    if (entries.length === 0) return null;

    // 今週の日付範囲を取得
    const today = new Date();
    const startDay = startOfWeek(today, { locale: ja });
    const endDay = endOfWeek(today, { locale: ja });
    const weekDays = eachDayOfInterval({ start: startDay, end: endDay });

    // エントリーを日付ごとにマッピング
    const entriesByDate: Record<string, DiaryEntry> = {};
    entries.forEach((entry) => {
      entriesByDate[entry.date] = entry;
    });

    return (
      <div className="grid grid-cols-7 gap-2 mt-4">
        {weekDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const entry = entriesByDate[dateStr];

          return (
            <Card
              key={dateStr}
              className={`relative ${
                entry ? "border-primary" : "border-gray-200"
              }`}
            >
              <CardHeader className="p-2">
                <CardTitle className="text-xs text-center">
                  {format(day, "E", { locale: ja })}
                </CardTitle>
                <p className="text-center text-sm">
                  {format(day, "d", { locale: ja })}
                </p>
              </CardHeader>
              <CardContent className="p-2 text-center">
                {entry ? (
                  <>
                    <div className="text-xl">
                      {moodEmojis[entry.mood] || "📝"}
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="w-full">
                          <p className="text-xs truncate">
                            {entry.achievement.substring(0, 20)}
                            {entry.achievement.length > 20 ? "..." : ""}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{entry.achievement}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">記録なし</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // 月間統計を計算
  const calculateMonthlyStats = () => {
    // 今月のエントリーを抽出
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getMonth() === currentMonth &&
        entryDate.getFullYear() === currentYear
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

    return {
      entryCount: monthEntries.length,
      moodCounts,
      tagCounts,
      avgDifficulty,
      importantCount: monthEntries.filter((e) => e.isImportant).length,
    };
  };

  const stats = calculateMonthlyStats();

  const renderAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case "Zap":
        return <Zap />;
      case "Medal":
        return <Medal />;
      case "Trophy":
        return <Trophy />;
      case "Star":
        return <Star />;
      case "CheckCircle":
        return <CheckCircle />;
      default:
        return <Sparkles />;
    }
  };

  // 重要な達成を強調表示するクラスを取得
  const getEntryClass = (entry: DiaryEntry) => {
    if (entry.isImportant) {
      return "border-l-4 border-amber-400 pl-4";
    }
    return "";
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">ADHD改善・自己肯定感向上日記</h1>
        <div className="flex items-center gap-2">
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

      {/* ストリーク表示 */}
      <Card className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                現在のストリーク: {streakData.currentStreak}日
              </h2>
              <p className="text-sm text-gray-600">
                最長記録: {streakData.longestStreak}日
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                達成した目標: {goals.filter((g) => g.completed).length}/
                {goals.length}
              </p>
              <p className="text-sm text-gray-600">
                獲得した実績: {achievements.filter((a) => a.earned).length}/
                {achievements.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 励ましメッセージ */}
      {showTips && (
        <Card className="mb-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
          <CardContent className="p-4 relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-6 w-6 p-0"
              onClick={() => setShowTips(false)}
              aria-label="ヒントを閉じる" // アクセシビリティのためのラベルを追加
            >
              ✕
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <p className="italic text-amber-800">{randomEncouragement}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="diary" className="mb-4">
        <TabsList className="mb-4">
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
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingEntry ? "エントリーを編集" : "今日の達成"}
                </CardTitle>
                <CardDescription>
                  今日達成できたことを記録して、自己肯定感を高めましょう
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="achievement">達成内容</Label>
                    <Textarea
                      id="achievement"
                      className="min-h-[120px]"
                      placeholder="今日達成できたことを書いてください。小さなことでも大丈夫です。"
                      value={newAchievement}
                      onChange={(e) => setNewAchievement(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="mood">今日の気分</Label>
                    <Select value={newMood} onValueChange={setNewMood}>
                      <SelectTrigger id="mood">
                        <SelectValue placeholder="今日の気分は？">
                          {newMood && (
                            <div className="flex items-center">
                              <span className="mr-2">
                                {moodEmojis[newMood]}
                              </span>
                              <span>{moodLabels[newMood]}</span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="great">
                          <div className="flex items-center">
                            <span className="mr-2">😄</span>
                            <span>とても良い</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="good">
                          <div className="flex items-center">
                            <span className="mr-2">🙂</span>
                            <span>良い</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="neutral">
                          <div className="flex items-center">
                            <span className="mr-2">😐</span>
                            <span>普通</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="bad">
                          <div className="flex items-center">
                            <span className="mr-2">😕</span>
                            <span>悪い</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="terrible">
                          <div className="flex items-center">
                            <span className="mr-2">😞</span>
                            <span>とても悪い</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>タグ付け</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tagOptions.map((tag) => (
                        <Badge
                          key={tag.value}
                          variant={
                            selectedTags.includes(tag.value)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() => handleTagToggle(tag.value)}
                        >
                          {tag.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="difficulty">難易度</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">簡単</span>
                      <input
                        id="difficulty"
                        type="range"
                        min="1"
                        max="5"
                        value={difficulty}
                        onChange={(e) =>
                          setDifficulty(parseInt(e.target.value))
                        }
                        className="flex-1"
                        aria-label="難易度を選択" // アクセシビリティのためのラベルを追加
                      />
                      <span className="text-sm">難しい</span>
                      <span className="ml-2 text-sm font-medium">
                        {difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="important-achievement"
                      checked={isImportant}
                      onCheckedChange={setIsImportant}
                    />
                    <Label htmlFor="important-achievement">
                      これは重要な達成
                    </Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingEntry ? "更新" : "記録する"}
                    </Button>
                    {editingEntry && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingEntry(null);
                          resetForm();
                        }}
                      >
                        キャンセル
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>過去の記録</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={currentView === "day" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentView("day")}
                    >
                      リスト表示
                    </Button>
                    <Button
                      variant={currentView === "week" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentView("week")}
                    >
                      週表示
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {currentView === "week" ? (
                    renderWeeklyView()
                  ) : (
                    <ScrollArea className="h-[400px] pr-4">
                      {entries.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>
                            記録がありません。新しいエントリーを追加しましょう！
                          </p>
                        </div>
                      ) : (
                        entries
                          .sort(
                            (a, b) =>
                              new Date(b.date).getTime() -
                              new Date(a.date).getTime()
                          )
                          .map((entry) => (
                            <Card key={entry.id} className="mb-4">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-lg">
                                    {format(
                                      new Date(entry.date),
                                      "yyyy年MM月dd日（E）",
                                      {
                                        locale: ja,
                                      }
                                    )}
                                    {entry.mood && (
                                      <span className="ml-2">
                                        {moodEmojis[entry.mood]}
                                      </span>
                                    )}
                                  </CardTitle>
                                  {entry.isImportant && (
                                    <Badge
                                      variant="secondary"
                                      className="bg-amber-100 text-amber-800"
                                    >
                                      重要な達成
                                    </Badge>
                                  )}
                                </div>
                              </CardHeader>
                              <CardContent className="pb-2">
                                <div className={getEntryClass(entry)}>
                                  <p className="whitespace-pre-wrap mb-2">
                                    {entry.achievement}
                                  </p>

                                  {entry.tags && entry.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {entry.tags.map((tag) => (
                                        <Badge
                                          key={tag}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {tagOptions.find(
                                            (t) => t.value === tag
                                          )?.label || tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}

                                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                                    <span>難易度: {entry.difficulty || 1}</span>
                                  </div>
                                </div>
                              </CardContent>
                              <CardFooter className="pt-0 justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(entry)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  編集
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(entry.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  削除
                                </Button>
                              </CardFooter>
                            </Card>
                          ))
                      )}
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="goals">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>目標設定</CardTitle>
                <CardDescription>
                  自己肯定感を高めるために達成可能な目標を設定しましょう
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddGoal} className="space-y-4">
                  <div>
                    <Label htmlFor="goal-input">新しい目標</Label>
                    <Input
                      id="goal-input"
                      placeholder="目標を入力"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="goal-category">カテゴリー</Label>
                      <Select
                        value={newGoalCategory}
                        onValueChange={setNewGoalCategory}
                      >
                        <SelectTrigger id="goal-category">
                          <SelectValue placeholder="カテゴリーを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {goalCategories.map((category) => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                            >
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="goal-date">目標日（任意）</Label>
                      <Input
                        id="goal-date"
                        type="date"
                        value={newGoalDate}
                        onChange={(e) => setNewGoalDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    目標を追加
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>目標リスト</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      goals.filter((g) => !g.completed).length > 0
                        ? "bg-blue-50"
                        : ""
                    }
                  >
                    進行中 ({goals.filter((g) => !g.completed).length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      goals.filter((g) => g.completed).length > 0
                        ? "bg-green-50"
                        : ""
                    }
                  >
                    完了 ({goals.filter((g) => g.completed).length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {goals.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">
                        目標がありません。新しい目標を追加しましょう！
                      </p>
                    ) : (
                      goals
                        .sort((a, b) => {
                          // 完了していない目標を先に
                          if (a.completed !== b.completed) {
                            return a.completed ? 1 : -1;
                          }
                          // 目標日のある目標を期限順に
                          if (a.targetDate && b.targetDate) {
                            return (
                              new Date(a.targetDate).getTime() -
                              new Date(b.targetDate).getTime()
                            );
                          }
                          // それ以外は作成順
                          return (
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                          );
                        })
                        .map((goal) => (
                          <div
                            key={goal.id}
                            className={`flex items-center justify-between p-3 rounded-md border ${
                              goal.completed
                                ? "bg-green-50 border-green-200"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id={`goal-${goal.id}`}
                                checked={goal.completed}
                                onChange={() => handleToggleGoal(goal.id)}
                                className="form-checkbox h-5 w-5 text-blue-600"
                                title={`目標を完了としてマーク: ${goal.description}`} // アクセシビリティのためのタイトルを追加
                                aria-label={`目標を完了としてマーク: ${goal.description}`} // アクセシビリティのためのラベルを追加
                              />
                              <div>
                                <Label
                                  htmlFor={`goal-${goal.id}`}
                                  className={`${
                                    goal.completed
                                      ? "line-through text-gray-500"
                                      : ""
                                  }`}
                                >
                                  {goal.description}
                                </Label>
                                <div className="flex items-center mt-1 space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    {goalCategories.find(
                                      (c) => c.value === goal.category
                                    )?.label || "日常習慣"}
                                  </Badge>
                                  {goal.targetDate && (
                                    <span className="text-xs text-gray-500">
                                      目標日:{" "}
                                      {format(
                                        new Date(goal.targetDate),
                                        "yyyy/MM/dd"
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGoal(goal.id)}
                              aria-label={`目標を削除: ${goal.description}`} // アクセシビリティのためのラベルを追加
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                実績
              </CardTitle>
              <CardDescription>
                継続と達成によって獲得できる実績バッジです
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={`${
                      achievement.earned
                        ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base flex justify-between items-center">
                        <span>{achievement.name}</span>
                        <div
                          className={`${
                            achievement.earned
                              ? "text-amber-500"
                              : "text-gray-300"
                          }`}
                        >
                          {renderAchievementIcon(achievement.icon)}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <p className="text-sm mb-2">{achievement.description}</p>
                      {achievement.earned && achievement.date && (
                        <p className="text-xs text-gray-500">
                          獲得日:{" "}
                          {format(new Date(achievement.date), "yyyy年MM月dd日")}
                        </p>
                      )}
                      {!achievement.earned && !isPremium && (
                        <Badge className="mt-2 bg-amber-100 text-amber-800 border-amber-200">
                          <Crown className="h-3 w-3 mr-1" />
                          プレミアム
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {!isPremium && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 border-dashed cursor-pointer">
                        <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                          <Crown className="h-8 w-8 text-amber-500 mb-2" />
                          <p className="text-center font-medium">
                            もっと実績を解除
                          </p>
                          <p className="text-center text-sm text-gray-500">
                            プレミアムで追加の実績
                          </p>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>プレミアム実績</DialogTitle>
                        <DialogDescription>
                          プレミアム会員になると、より多くの実績と成長の記録が利用できます。
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
                          <div className="text-amber-500">
                            <Calendar className="h-8 w-8" />
                          </div>
                          <div>
                            <h3 className="font-medium">3ヶ月継続</h3>
                            <p className="text-sm text-gray-600">
                              90日間連続で記録をつけましょう
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
                          <div className="text-amber-500">
                            <Medal className="h-8 w-8" />
                          </div>
                          <div>
                            <h3 className="font-medium">目標達成マスター</h3>
                            <p className="text-sm text-gray-600">
                              25個の目標を達成しましょう
                            </p>
                          </div>
                        </div>
                        <Button className="w-full">
                          プレミアムにアップグレード
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-blue-500" />
                統計情報
              </CardTitle>
              <CardDescription>
                あなたの自己肯定感向上の記録を分析します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">今月の記録数</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      {stats.entryCount}日
                    </div>
                    <Progress
                      value={(stats.entryCount / 30) * 100}
                      className="h-2"
                    />
                    <p className="text-xs text-gray-500 mt-2">目標: 30日/月</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">気分の傾向</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {Object.entries(moodLabels).map(([mood, label]) => (
                        <div key={mood}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center">
                              {moodEmojis[mood]} {label}
                            </span>
                            <span>{stats.moodCounts[mood] || 0}日</span>
                          </div>
                          <Progress
                            value={
                              stats.entryCount > 0
                                ? ((stats.moodCounts[mood] || 0) /
                                    stats.entryCount) *
                                  100
                                : 0
                            }
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">達成の種類</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(stats.tagCounts).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(stats.tagCounts)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 5)
                          .map(([tag, count]) => (
                            <div key={tag}>
                              <div className="flex justify-between text-sm mb-1">
                                <span>
                                  {tagOptions.find((t) => t.value === tag)
                                    ?.label || tag}
                                </span>
                                <span>{count}回</span>
                              </div>
                              <Progress
                                value={
                                  stats.entryCount > 0
                                    ? (count / stats.entryCount) * 100
                                    : 0
                                }
                                className="h-2"
                              />
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-center py-4 text-gray-500">
                        まだデータがありません
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">あなたの成長</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">平均難易度</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-2">
                        {stats.avgDifficulty > 0
                          ? stats.avgDifficulty.toFixed(1)
                          : "-"}
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          / 5
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-full rounded-full ${
                              i < Math.round(stats.avgDifficulty)
                                ? "bg-blue-500"
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        より難しいことに挑戦しています
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">重要な達成</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-2">
                        {stats.importantCount}
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          件
                        </span>
                      </div>
                      <Progress
                        value={
                          stats.entryCount > 0
                            ? (stats.importantCount / stats.entryCount) * 100
                            : 0
                        }
                        className="h-2"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        自分にとって重要な達成の記録
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {!isPremium && (
                <Card className="mt-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <Crown className="h-5 w-5 text-amber-600" />
                          詳細な分析をアンロック
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          プレミアム会員になると、詳細な統計、長期的な傾向分析、
                          <br />
                          AIによる成長レポートなどの機能が利用できます。
                        </p>
                      </div>
                      <Button>プレミアムにアップグレード</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DiaryPage;
