import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  format,
  parseISO,
  isToday,
  addDays,
  differenceInHours,
  isBefore,
  subDays,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // この行を追加
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchSleepRecords,
  addSleepRecord,
  updateSleepRecord,
  deleteSleepRecord,
  selectSleepRecords,
  selectSleepTrackerStatus,
  selectSleepTrackerError,
} from "@/store/sleepTrackerSlice";
import { AppDispatch } from "@/store";
import { SleepRecord } from "@/store/sleepTrackerSlice";
import {
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Award,
  Clock,
  Calendar as CalendarIcon,
  Smile,
  Frown,
  Meh,
  Sparkles,
  BedIcon,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export default function SleepTracker() {
  const dispatch = useDispatch<AppDispatch>();
  const sleepRecords = useSelector(selectSleepRecords);
  const status = useSelector(selectSleepTrackerStatus);
  const error = useSelector(selectSleepTrackerError);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editRecord, setEditRecord] = useState<SleepRecord | null>(null);
  const [newRecord, setNewRecord] = useState<Partial<SleepRecord>>({
    date: format(new Date(), "yyyy-MM-dd"),
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [dateForCalendar, setDateForCalendar] = useState<Date>(new Date());
  const [sleepQuality, setSleepQuality] = useState<string>("neutral");
  const [sleepNotes, setSleepNotes] = useState<string>("");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("week");
  const [isQuickLogMode, setIsQuickLogMode] = useState<boolean>(true);
  const [showTrends, setShowTrends] = useState<boolean>(true);
  const [showInsights, setShowInsights] = useState<boolean>(true);
  const [sleepGoal, setSleepGoal] = useState<number>(8);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchSleepRecords());
    }
  }, [status, dispatch]);

  // ユーザーが今日の記録をしたかをチェック
  const todayRecord = sleepRecords.find(
    (record: SleepRecord) => record.date === format(new Date(), "yyyy-MM-dd")
  );

  // 簡易記録モード - ワンタップで記録
  const logTime = (type: "wakeUp" | "bedtime") => {
    const now = new Date();
    const today = format(now, "yyyy-MM-dd");

    const existingRecord = sleepRecords.find(
      (record: SleepRecord) => record.date === today
    );

    if (existingRecord) {
      dispatch(
        updateSleepRecord({
          _id: existingRecord._id,
          updates: {
            [type]: now.toISOString(),
            // 就寝時間を記録する場合は日付を前日に設定（23時以降の場合）
            ...(type === "bedtime" && now.getHours() >= 23
              ? { date: format(subDays(now, 1), "yyyy-MM-dd") }
              : {}),
          },
        })
      );

      if (type === "wakeUp") {
        // 起床時に質問ダイアログを表示
        setEditRecord(existingRecord);
        setIsEditDialogOpen(true);
      }
    } else {
      dispatch(
        addSleepRecord({
          date:
            type === "bedtime" && now.getHours() >= 23
              ? format(subDays(now, 1), "yyyy-MM-dd")
              : today,
          wakeUp: type === "wakeUp" ? now.toISOString() : null,
          bedtime: type === "bedtime" ? now.toISOString() : null,
          quality: "neutral",
          notes: "",
        })
      );
    }
  };

  const formatTime = (
    timeString: string | null,
    isBedtime: boolean = false
  ) => {
    if (!timeString) return "--:--";
    const date = parseISO(timeString);
    let hours = date.getHours();
    const minutes = date.getMinutes();

    // 就寝時間の場合のみ、0時から10時を24時以降として扱う
    if (isBedtime && hours >= 0 && hours < 10) {
      hours += 24;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const calculateSleepDuration = (
    wakeUp: string | null,
    bedtime: string | null
  ) => {
    if (!wakeUp || !bedtime) return null;
    let wakeUpTime = parseISO(wakeUp);
    let bedTime = parseISO(bedtime);

    // 就寝時間が0時から10時の場合、翌日の就寝とみなす
    if (bedTime.getHours() >= 0 && bedTime.getHours() < 10) {
      bedTime = addDays(bedTime, 1);
    }

    // 起床時間が就寝時間より前の場合、翌日の起床とみなす
    if (isBefore(wakeUpTime, bedTime)) {
      wakeUpTime = addDays(wakeUpTime, 1);
    }

    const durationHours = differenceInHours(wakeUpTime, bedTime);
    const durationMinutes =
      ((wakeUpTime.getTime() - bedTime.getTime()) / (1000 * 60)) % 60;

    return parseFloat((durationHours + durationMinutes / 60).toFixed(1));
  };

  const handleAddRecord = () => {
    if (newRecord.date && (newRecord.wakeUp || newRecord.bedtime)) {
      dispatch(
        addSleepRecord({
          ...newRecord,
          quality: sleepQuality,
          notes: sleepNotes,
        } as SleepRecord)
      );
      setNewRecord({ date: format(new Date(), "yyyy-MM-dd") });
      setSleepQuality("neutral");
      setSleepNotes("");
      setIsAddDialogOpen(false);
    }
  };

  const handleUpdateRecord = () => {
    if (editRecord && editRecord._id) {
      dispatch(
        updateSleepRecord({
          _id: editRecord._id,
          updates: {
            ...editRecord,
            quality: sleepQuality,
            notes: sleepNotes,
          },
        })
      );
      setEditRecord(null);
      setSleepQuality("neutral");
      setSleepNotes("");
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm("このレコードを削除してもよろしいですか？")) {
      dispatch(deleteSleepRecord(id));
    }
  };

  const openEditDialog = (record: SleepRecord) => {
    setEditRecord({ ...record });
    setSleepQuality(record.quality || "neutral");
    setSleepNotes(record.notes || "");
    setIsEditDialogOpen(true);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDateForCalendar(date);
      setNewRecord({ ...newRecord, date: format(date, "yyyy-MM-dd") });
    }
  };

  // 睡眠の質に応じた色とアイコンを取得
  const getSleepQualityInfo = (quality: string | undefined) => {
    switch (quality) {
      case "good":
        return { color: "text-green-500", icon: <Smile className="h-6 w-6" /> };
      case "bad":
        return { color: "text-red-500", icon: <Frown className="h-6 w-6" /> };
      default:
        return { color: "text-yellow-500", icon: <Meh className="h-6 w-6" /> };
    }
  };

  // 睡眠時間のトレンド分析（改善または悪化）
  const analyzeSleepTrend = () => {
    if (sleepRecords.length < 5) return null;

    const recentRecords = [...sleepRecords]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7)
      .filter((record) => record.wakeUp && record.bedtime)
      .map((record) => ({
        date: record.date,
        duration: calculateSleepDuration(record.wakeUp, record.bedtime) || 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (recentRecords.length < 3) return null;

    // 最初の半分と後半の平均を比較
    const midPoint = Math.floor(recentRecords.length / 2);
    const firstHalf = recentRecords.slice(0, midPoint);
    const secondHalf = recentRecords.slice(midPoint);

    const firstHalfAvg =
      firstHalf.reduce((sum, record) => sum + record.duration, 0) /
      firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, record) => sum + record.duration, 0) /
      secondHalf.length;

    const diff = secondHalfAvg - firstHalfAvg;
    const diffPercentage = (diff / firstHalfAvg) * 100;

    if (Math.abs(diffPercentage) < 5) return null; // 変化が少ない場合は表示しない

    return {
      trend: diff > 0 ? "improving" : "declining",
      percentage: Math.abs(diffPercentage).toFixed(1),
      message:
        diff > 0
          ? `最近の睡眠時間が${Math.abs(diffPercentage).toFixed(
              1
            )}%増加しています。良い傾向です！`
          : `最近の睡眠時間が${Math.abs(diffPercentage).toFixed(
              1
            )}%減少しています。睡眠時間を確保しましょう。`,
    };
  };

  const sleepTrend = analyzeSleepTrend();

  // 睡眠の質のカウント
  const qualityCounts = sleepRecords.reduce(
    (counts: Record<string, number>, record: SleepRecord) => {
      const quality = record.quality || "neutral";
      counts[quality] = (counts[quality] || 0) + 1;
      return counts;
    },
    { good: 0, neutral: 0, bad: 0 }
  );

  // 理想的な睡眠時間との比較
  const getAverageSleepDuration = () => {
    const recordsWithDuration = sleepRecords
      .filter((record: SleepRecord) => record.wakeUp && record.bedtime)
      .map(
        (record: SleepRecord) =>
          calculateSleepDuration(record.wakeUp, record.bedtime) || 0
      );

    if (recordsWithDuration.length === 0) return 0;

    return (
      recordsWithDuration.reduce((sum, duration) => sum + duration, 0) /
      recordsWithDuration.length
    );
  };

  const averageSleepDuration = getAverageSleepDuration();
  const sleepGoalDifference = averageSleepDuration - sleepGoal;

  // チャート用のデータを取得する関数
  const getChartData = () => {
    // レコードをソートして、選択された期間に応じてフィルタリング
    let filteredRecords = [...sleepRecords];
    const today = new Date();

    if (selectedTimeRange === "week") {
      // 今週のデータ
      const weekStart = startOfWeek(today, { locale: ja });
      const weekEnd = endOfWeek(today, { locale: ja });
      filteredRecords = filteredRecords.filter((record: SleepRecord) => {
        const recordDate = parseISO(record.date);
        return isWithinInterval(recordDate, { start: weekStart, end: weekEnd });
      });
    } else if (selectedTimeRange === "month") {
      // 今月のデータ
      filteredRecords = filteredRecords.filter((record: SleepRecord) => {
        const recordDate = parseISO(record.date);
        return (
          recordDate.getMonth() === today.getMonth() &&
          recordDate.getFullYear() === today.getFullYear()
        );
      });
    }

    return filteredRecords
      .map((record: SleepRecord) => {
        const wakeUpTime = record.wakeUp ? parseISO(record.wakeUp) : null;
        const bedTime = record.bedtime ? parseISO(record.bedtime) : null;
        return {
          date: format(parseISO(record.date), "M/d"),
          day: format(parseISO(record.date), "E", { locale: ja }),
          sleepDuration:
            calculateSleepDuration(record.wakeUp, record.bedtime) || 0,
          wakeUpTime: wakeUpTime
            ? wakeUpTime.getHours() + wakeUpTime.getMinutes() / 60
            : null,
          bedTime: bedTime
            ? (bedTime.getHours() < 10
                ? bedTime.getHours() + 24
                : bedTime.getHours()) +
              bedTime.getMinutes() / 60
            : null,
          quality: record.quality || "neutral",
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const chartData = getChartData();

  // 睡眠スコアの計算（0-100のスケール）
  const calculateSleepScore = () => {
    if (sleepRecords.length === 0) return 0;

    const recentRecords = [...sleepRecords]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7);

    if (recentRecords.length === 0) return 0;

    // 要素ごとのスコア計算
    const scores = recentRecords.map((record) => {
      let score = 0;

      // 睡眠時間によるスコア（0-40点）
      const duration =
        calculateSleepDuration(record.wakeUp, record.bedtime) || 0;
      if (duration >= 7 && duration <= 9) {
        score += 40; // 理想的な睡眠時間
      } else if (duration >= 6 && duration < 7) {
        score += 30; // やや短い
      } else if (duration > 9 && duration <= 10) {
        score += 30; // やや長い
      } else if (duration >= 5 && duration < 6) {
        score += 20; // 短い
      } else if (duration > 10) {
        score += 20; // 長い
      } else {
        score += 10; // かなり短い
      }

      // 睡眠の質によるスコア（0-40点）
      if (record.quality === "good") {
        score += 40;
      } else if (record.quality === "neutral") {
        score += 25;
      } else if (record.quality === "bad") {
        score += 10;
      }

      // 就寝時間の規則性（0-20点）
      // 22時〜0時の間の就寝を理想とする
      if (record.bedtime) {
        const bedHour = parseISO(record.bedtime).getHours();
        if ((bedHour >= 22 && bedHour <= 23) || bedHour === 0) {
          score += 20;
        } else if (
          (bedHour >= 21 && bedHour < 22) ||
          (bedHour > 0 && bedHour <= 1)
        ) {
          score += 15;
        } else {
          score += 5;
        }
      }

      return score;
    });

    // 平均スコアを計算
    const averageScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return Math.round(averageScore);
  };

  const sleepScore = calculateSleepScore();

  // 睡眠スコアのグレード（A, B, C, D, F）
  const getSleepScoreGrade = (score: number) => {
    if (score >= 90) return { grade: "A+", color: "text-green-600" };
    if (score >= 80) return { grade: "A", color: "text-green-500" };
    if (score >= 70) return { grade: "B", color: "text-blue-500" };
    if (score >= 60) return { grade: "C", color: "text-yellow-500" };
    if (score >= 50) return { grade: "D", color: "text-orange-500" };
    return { grade: "F", color: "text-red-500" };
  };

  const sleepScoreGrade = getSleepScoreGrade(sleepScore);

  // 週ごとの表示を行う関数
  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateString = format(date, "yyyy-MM-dd");
      const record = sleepRecords.find(
        (r: SleepRecord) => r.date === dateString
      );
      const duration = record
        ? calculateSleepDuration(record.wakeUp, record.bedtime)
        : null;
      const quality = record?.quality || "neutral";
      const qualityInfo = getSleepQualityInfo(quality);

      return (
        <div
          key={i}
          className={`p-4 border-r ${
            isToday(date) ? "bg-blue-50 dark:bg-blue-900/20" : ""
          }`}
        >
          <div className="font-bold mb-2">
            {format(date, "M/d (E)", { locale: ja })}
          </div>
          <div className="flex items-center mb-1">
            <Sun className="w-4 h-4 mr-2 text-yellow-500" />
            <span>{record ? formatTime(record.wakeUp) : "--:--"}</span>
          </div>
          <div className="flex items-center mb-1">
            <BedIcon className="w-4 h-4 mr-2 text-indigo-500" />
            <span>{record ? formatTime(record.bedtime, true) : "--:--"}</span>
          </div>
          {duration && (
            <div className="flex items-center mb-1">
              <Clock className="w-4 h-4 mr-2 text-blue-500" />
              <span>{duration.toFixed(1)}時間</span>
            </div>
          )}
          {record && (
            <div className={`flex items-center ${qualityInfo.color}`}>
              {qualityInfo.icon}
            </div>
          )}
        </div>
      );
    });

    return <div className="grid grid-cols-7 border-l border-t">{days}</div>;
  };

  // リスト表示を行う関数
  const renderListView = () => {
    // 日付降順でソート
    const sortedRecords = [...sleepRecords]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 14); // 直近14日間のデータのみ表示

    return (
      <div className="space-y-2">
        {sortedRecords.map((record: SleepRecord) => {
          const duration = calculateSleepDuration(
            record.wakeUp,
            record.bedtime
          );
          const qualityInfo = getSleepQualityInfo(record.quality);

          return (
            <div
              key={record._id}
              className="flex justify-between items-center p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center">
                <div className={`mr-3 ${qualityInfo.color}`}>
                  {qualityInfo.icon}
                </div>
                <div>
                  <span className="font-medium">
                    {format(parseISO(record.date), "M/d (E)", { locale: ja })}
                  </span>
                  {duration && (
                    <span className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                      {duration.toFixed(1)}時間
                    </span>
                  )}
                  {record.notes && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {record.notes}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="flex flex-col items-end mr-4">
                  <span className="flex items-center text-sm">
                    <Sun className="w-3 h-3 mr-1 text-yellow-500" />
                    <span>{record ? formatTime(record.wakeUp) : "--:--"}</span>
                  </span>
                  <span className="flex items-center text-sm">
                    <Moon className="w-3 h-3 mr-1 text-indigo-500" />
                    <span>
                      {record ? formatTime(record.bedtime, true) : "--:--"}
                    </span>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(record)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteRecord(record._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 睡眠パターン分析
  const analyzeSleepPatterns = () => {
    if (sleepRecords.length < 7) return null;

    // 平均起床時間と就寝時間を計算
    const validRecords = sleepRecords.filter(
      (record) => record.wakeUp && record.bedtime
    );

    if (validRecords.length < 5) return null;

    const wakeUpTimes = validRecords.map((record) => {
      const date = parseISO(record.wakeUp as string);
      return date.getHours() + date.getMinutes() / 60;
    });

    const bedTimes = validRecords.map((record) => {
      const date = parseISO(record.bedtime as string);
      let hours = date.getHours();
      // 0-4時は24+として扱う
      if (hours >= 0 && hours < 5) {
        hours += 24;
      }
      return hours + date.getMinutes() / 60;
    });

    const avgWakeUpTime =
      wakeUpTimes.reduce((sum, time) => sum + time, 0) / wakeUpTimes.length;
    const avgBedTime =
      bedTimes.reduce((sum, time) => sum + time, 0) / bedTimes.length;

    // 平均起床時間を時間:分形式に変換
    const avgWakeUpHours = Math.floor(avgWakeUpTime);
    const avgWakeUpMinutes = Math.round((avgWakeUpTime - avgWakeUpHours) * 60);

    // 平均就寝時間を時間:分形式に変換（24時以降は0時以降に戻す）
    let avgBedHours = Math.floor(avgBedTime);
    if (avgBedHours >= 24) {
      avgBedHours -= 24;
    }
    const avgBedMinutes = Math.round(
      (avgBedTime - Math.floor(avgBedTime)) * 60
    );

    return {
      avgWakeUpTime: `${avgWakeUpHours
        .toString()
        .padStart(2, "0")}:${avgWakeUpMinutes.toString().padStart(2, "0")}`,
      avgBedTime: `${avgBedHours.toString().padStart(2, "0")}:${avgBedMinutes
        .toString()
        .padStart(2, "0")}`,
    };
  };

  const sleepPatterns = analyzeSleepPatterns();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <Alert variant="destructive" className="mt-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>エラーが発生しました: {error}</AlertDescription>
      </Alert>
    );
  }

  // 睡眠の質のカスタマイズセレクター
  const renderQualitySelector = () => (
    <div className="flex flex-col space-y-2">
      <label htmlFor="sleep-quality" className="text-sm font-medium">
        睡眠の質
      </label>
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setSleepQuality("good")}
          className={`flex flex-col items-center p-2 rounded-lg ${
            sleepQuality === "good"
              ? "bg-green-100 border-2 border-green-500"
              : "bg-gray-50 border border-gray-200"
          }`}
        >
          <Smile className="h-8 w-8 text-green-500" />
          <span className="text-sm mt-1">良い</span>
        </button>
        <button
          type="button"
          onClick={() => setSleepQuality("neutral")}
          className={`flex flex-col items-center p-2 rounded-lg ${
            sleepQuality === "neutral"
              ? "bg-yellow-100 border-2 border-yellow-500"
              : "bg-gray-50 border border-gray-200"
          }`}
        >
          <Meh className="h-8 w-8 text-yellow-500" />
          <span className="text-sm mt-1">普通</span>
        </button>
        <button
          type="button"
          onClick={() => setSleepQuality("bad")}
          className={`flex flex-col items-center p-2 rounded-lg ${
            sleepQuality === "bad"
              ? "bg-red-100 border-2 border-red-500"
              : "bg-gray-50 border border-gray-200"
          }`}
        >
          <Frown className="h-8 w-8 text-red-500" />
          <span className="text-sm mt-1">悪い</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold mb-2 md:mb-0">睡眠トラッカー</h1>
        <div className="flex items-center space-x-4">
          {isQuickLogMode ? (
            <>
              <Button
                onClick={() => logTime("wakeUp")}
                className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
              >
                <Sun className="mr-2" />
                起床
              </Button>
              <Button
                onClick={() => logTime("bedtime")}
                className="flex items-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                <Moon className="mr-2" />
                就寝
              </Button>
            </>
          ) : (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <Plus className="mr-2" />
                  記録を追加
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>睡眠記録を追加</DialogTitle>
                  <DialogDescription>
                    睡眠時間と質を記録して、健康的な睡眠習慣を作りましょう。
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="new-date" className="text-right text-sm">
                      日付
                    </label>
                    <div className="col-span-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(dateForCalendar, "yyyy年MM月dd日")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dateForCalendar}
                            onSelect={handleDateSelect}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="new-wakeup" className="text-right text-sm">
                      起床時間
                    </label>
                    <Input
                      id="new-wakeup"
                      type="time"
                      value={
                        newRecord.wakeUp
                          ? format(parseISO(newRecord.wakeUp), "HH:mm")
                          : ""
                      }
                      onChange={(e) =>
                        setNewRecord({
                          ...newRecord,
                          wakeUp: `${newRecord.date}T${e.target.value}:00`,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="new-bedtime" className="text-right text-sm">
                      就寝時間
                    </label>
                    <Input
                      id="new-bedtime"
                      type="time"
                      value={
                        newRecord.bedtime
                          ? format(parseISO(newRecord.bedtime), "HH:mm")
                          : ""
                      }
                      onChange={(e) =>
                        setNewRecord({
                          ...newRecord,
                          bedtime: `${newRecord.date}T${e.target.value}:00`,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  {renderQualitySelector()}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="new-notes" className="text-right text-sm">
                      メモ
                    </label>
                    <Input
                      id="new-notes"
                      value={sleepNotes}
                      onChange={(e) => setSleepNotes(e.target.value)}
                      placeholder="睡眠のメモ（任意）"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddRecord}>追加</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <div className="ml-2">
            <button
              onClick={() => setIsQuickLogMode(!isQuickLogMode)}
              className="text-xs underline text-gray-500 hover:text-gray-700"
            >
              {isQuickLogMode
                ? "詳細入力に切り替え"
                : "クイックモードに切り替え"}
            </button>
          </div>
        </div>
      </div>

      {/* 概要カード - 睡眠スコアとインサイト */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* 睡眠スコアカード */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">睡眠スコア</CardTitle>
            <CardDescription>直近7日間の睡眠データから算出</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              <div className={`text-5xl font-bold ${sleepScoreGrade.color}`}>
                {sleepScore}
              </div>
              <div
                className={`text-xl font-semibold mt-2 ${sleepScoreGrade.color}`}
              >
                {sleepScoreGrade.grade}
              </div>
              <div className="mt-4 text-sm text-center text-gray-500">
                {sleepScore >= 80
                  ? "素晴らしい睡眠習慣です！"
                  : sleepScore >= 60
                  ? "良好な睡眠習慣です。改善の余地があります。"
                  : "睡眠の質を改善する必要があります。"}
              </div>
            </div>
          </CardContent>
        </Card>
        {/* 睡眠時間カード */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">平均睡眠時間</CardTitle>
            <CardDescription>目標: {sleepGoal}時間</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="text-5xl font-bold">
                {averageSleepDuration.toFixed(1)}
              </div>
              <div className="text-lg mt-2">時間/日</div>

              {sleepGoalDifference !== 0 && (
                <div
                  className={`flex items-center mt-4 ${
                    sleepGoalDifference >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {sleepGoalDifference >= 0 ? (
                    <ArrowUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDown className="h-4 w-4 mr-1" />
                  )}
                  <span>
                    目標より{Math.abs(sleepGoalDifference).toFixed(1)}時間
                    {sleepGoalDifference >= 0 ? "多い" : "少ない"}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">睡眠目標</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <span>1日の目標睡眠時間: </span>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSleepGoal((prev) => Math.max(4, prev - 0.5))
                  }
                >
                  -
                </Button>
                <span className="mx-2 font-bold">{sleepGoal}時間</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSleepGoal((prev) => Math.min(12, prev + 0.5))
                  }
                >
                  +
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span>表示設定:</span>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTrends}
                    onChange={() => setShowTrends(!showTrends)}
                  />
                  <span>トレンド表示</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showInsights}
                    onChange={() => setShowInsights(!showInsights)}
                  />
                  <span>インサイト表示</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {todayRecord && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-medium text-lg mb-2">今日の記録</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <Sun className="w-5 h-5 mr-2 text-yellow-500" />
                <span>{formatTime(todayRecord.wakeUp)}</span>
              </div>
              <div className="flex items-center">
                <Moon className="w-5 h-5 mr-2 text-indigo-500" />
                <span>{formatTime(todayRecord.bedtime, true)}</span>
              </div>
            </div>
          </div>
        )}

        {/* 睡眠パターンカード */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">睡眠パターン</CardTitle>
            <CardDescription>あなたの平均的な睡眠習慣</CardDescription>
          </CardHeader>
          <CardContent>
            {sleepPatterns ? (
              <div className="flex flex-col items-center">
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="flex flex-col items-center border rounded-lg p-3">
                    <Moon className="h-6 w-6 text-indigo-500 mb-1" />
                    <div className="text-lg font-semibold">
                      {sleepPatterns.avgBedTime}
                    </div>
                    <div className="text-xs text-gray-500">平均就寝</div>
                  </div>
                  <div className="flex flex-col items-center border rounded-lg p-3">
                    <Sun className="h-6 w-6 text-yellow-500 mb-1" />
                    <div className="text-lg font-semibold">
                      {sleepPatterns.avgWakeUpTime}
                    </div>
                    <div className="text-xs text-gray-500">平均起床</div>
                  </div>
                </div>

                {sleepTrend && (
                  <div
                    className={`mt-4 text-sm ${
                      sleepTrend.trend === "improving"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {sleepTrend.trend === "improving" ? (
                      <div className="flex items-center">
                        <ArrowUp className="h-4 w-4 mr-1" />
                        <span>{sleepTrend.message}</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <ArrowDown className="h-4 w-4 mr-1" />
                        <span>{sleepTrend.message}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 p-4">
                さらに記録が必要です
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* チャート */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">睡眠チャート</CardTitle>
            <Select
              value={selectedTimeRange}
              onValueChange={setSelectedTimeRange}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="期間" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">今週</SelectItem>
                <SelectItem value="month">今月</SelectItem>
                <SelectItem value="all">すべて</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 12]} ticks={[0, 3, 6, 9, 12]} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    switch (name) {
                      case "睡眠時間":
                        return [`${value}時間`, name];
                      case "起床時間": {
                        const wakeHours = Math.floor(value);
                        const wakeMinutes = Math.round(
                          (value - wakeHours) * 60
                        );
                        return [
                          `${wakeHours}:${wakeMinutes
                            .toString()
                            .padStart(2, "0")}`,
                          name,
                        ];
                      }
                      case "就寝時間": {
                        let bedHours = Math.floor(value);
                        if (bedHours >= 24) bedHours -= 24;
                        const bedMinutes = Math.round(
                          (value - Math.floor(value)) * 60
                        );
                        return [
                          `${bedHours}:${bedMinutes
                            .toString()
                            .padStart(2, "0")}`,
                          name,
                        ];
                      }
                      default:
                        return [value, name];
                    }
                  }}
                />
                <Legend />
                <Bar
                  dataKey="sleepDuration"
                  name="睡眠時間"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 詳細データ表示 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">記録</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate((date) => addDays(date, -7))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold">
              {format(currentDate, "yyyy年M月", { locale: ja })}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate((date) => addDays(date, 7))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list">
            <TabsList className="mb-4">
              <TabsTrigger value="week">週表示</TabsTrigger>
              <TabsTrigger value="list">リスト表示</TabsTrigger>
            </TabsList>
            <TabsContent value="week">{renderWeekView()}</TabsContent>
            <TabsContent value="list">{renderListView()}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ヒントとインサイト */}
      {showInsights && sleepRecords.length > 5 && (
        <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-blue-700 dark:text-blue-300">
              <Sparkles className="h-5 w-5 mr-2" />
              睡眠インサイト
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {averageSleepDuration < 7 && (
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">睡眠時間が不足気味です</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      成人の推奨睡眠時間は7-9時間です。睡眠不足は健康に悪影響を及ぼす可能性があります。
                    </p>
                  </div>
                </div>
              )}

              {sleepPatterns &&
                parseInt(sleepPatterns.avgBedTime.split(":")[0]) > 0 && (
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">夜更かし習慣があります</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        午後10時から深夜0時の間に就寝すると、より良質な睡眠が得られる傾向があります。
                      </p>
                    </div>
                  </div>
                )}

              {qualityCounts.bad > qualityCounts.good && (
                <div className="flex items-start">
                  <Frown className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">睡眠の質に課題があります</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      睡眠環境の改善（部屋の温度、暗さ、静けさなど）や就寝前のルーティンの見直しを検討してみてください。
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <Award className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">PRO TIP</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    就寝前1時間はブルーライト（スマホ、PC）の使用を控え、リラックスする活動（読書、瞑想など）を取り入れると睡眠の質が向上します。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* サブスクリプション機能の宣伝 */}
      <div className="mt-8 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white p-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold mb-2">Premium機能を解除</h3>
            <p className="text-white/80">
              睡眠分析の詳細レポート、パーソナライズされたアドバイス、スマートウォッチ連携など、さらに高度な機能をお楽しみいただけます。
            </p>
          </div>
          <Button className="bg-white text-purple-600 hover:bg-gray-100">
            プレミアムにアップグレード
          </Button>
        </div>
      </div>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>睡眠記録を編集</DialogTitle>
            <DialogDescription>
              睡眠記録の詳細を編集して更新ボタンをクリックしてください。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-date" className="text-right text-sm">
                日付
              </label>
              <Input
                id="edit-date"
                type="date"
                value={editRecord?.date || ""}
                onChange={(e) =>
                  setEditRecord({ ...editRecord!, date: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-wakeup" className="text-right text-sm">
                起床時間
              </label>
              <Input
                id="edit-wakeup"
                type="time"
                value={
                  editRecord?.wakeUp
                    ? format(parseISO(editRecord.wakeUp), "HH:mm")
                    : ""
                }
                onChange={(e) =>
                  setEditRecord({
                    ...editRecord!,
                    wakeUp: `${editRecord!.date}T${e.target.value}:00`,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-bedtime" className="text-right text-sm">
                就寝時間
              </label>
              <Input
                id="edit-bedtime"
                type="time"
                value={
                  editRecord?.bedtime
                    ? format(parseISO(editRecord.bedtime), "HH:mm")
                    : ""
                }
                onChange={(e) =>
                  setEditRecord({
                    ...editRecord!,
                    bedtime: `${editRecord!.date}T${e.target.value}:00`,
                  })
                }
                className="col-span-3"
              />
            </div>
            {renderQualitySelector()}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-notes" className="text-right text-sm">
                メモ
              </label>
              <Input
                id="edit-notes"
                value={sleepNotes}
                onChange={(e) => setSleepNotes(e.target.value)}
                placeholder="睡眠のメモ（任意）"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateRecord}>更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
