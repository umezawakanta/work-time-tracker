import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target,
  Clock,
  Calendar,
  Edit,
} from "lucide-react";

// 目標期間の定義
const TIME_PERIODS = [
  { value: "daily", label: "日次", days: 1 },
  { value: "weekly", label: "週次", days: 7 },
  { value: "2weeks", label: "2週間", days: 14 },
  { value: "monthly", label: "月次", days: 30 },
  { value: "quarterly", label: "四半期", days: 90 },
  { value: "biannual", label: "半年", days: 180 },
  { value: "yearly", label: "1年", days: 365 },
  { value: "2years", label: "2年", days: 730 },
  { value: "3years", label: "3年", days: 1095 },
  { value: "5years", label: "5年", days: 1825 },
  { value: "10years", label: "10年", days: 3650 },
];

// 目標データの型定義
interface FinancialGoal {
  id: string;
  title: string;
  type: "asset" | "debt" | "networth";
  category?: string;
  startValue: number;
  currentValue: number;
  targetValue: number;
  startDate: string;
  targetDate: string;
  period: string;
  account?: string;
  autoUpdate: boolean;
  milestones?: Array<{
    value: number;
    date: string;
    achieved: boolean;
  }>;
  history: Array<{
    date: string;
    value: number;
  }>;
}

// 進捗率計算用ヘルパー関数
const calculateProgress = (
  start: number,
  current: number,
  target: number
): number => {
  if (start === target) return 100;
  const progress = Math.min(
    100,
    Math.max(0, ((current - start) / (target - start)) * 100)
  );
  return Math.round(progress * 10) / 10; // 小数点第一位まで
};

// 日付フォーマット関数
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

// 残り日数計算
const calculateRemainingDays = (targetDate: string): number => {
  const target = new Date(targetDate);
  const today = new Date();
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// 残り日数表示用
const formatRemainingTime = (days: number): string => {
  if (days <= 0) return "期限切れ";
  if (days < 30) return `残り${days}日`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `残り約${months}ヶ月`;
  }
  const years = Math.floor(days / 365);
  const remainingMonths = Math.floor((days % 365) / 30);
  return remainingMonths > 0
    ? `残り約${years}年${remainingMonths}ヶ月`
    : `残り約${years}年`;
};

// 目標達成予測
const predictCompletionDate = (goal: FinancialGoal): string => {
  if (goal.history.length < 2) return "十分なデータがありません";

  // 成長率の計算
  const historyData = [...goal.history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const latestDataPoints = historyData.slice(-5); // 最新の5データポイントを使用
  if (latestDataPoints.length < 2) return "十分なデータがありません";

  const firstPoint = latestDataPoints[0];
  const lastPoint = latestDataPoints[latestDataPoints.length - 1];

  const timeDiff =
    new Date(lastPoint.date).getTime() - new Date(firstPoint.date).getTime();
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

  if (daysDiff <= 0) return "十分なデータがありません";

  const valueDiff = lastPoint.value - firstPoint.value;
  const dailyChange = valueDiff / daysDiff;

  if (
    (goal.type === "asset" && dailyChange <= 0) ||
    (goal.type === "debt" && dailyChange >= 0)
  ) {
    return "現在のペースでは目標達成できません";
  }

  const remainingChange = goal.targetValue - goal.currentValue;
  const daysToTarget = Math.abs(remainingChange / dailyChange);

  const predictedDate = new Date();
  predictedDate.setDate(predictedDate.getDate() + daysToTarget);

  const targetDate = new Date(goal.targetDate);

  if (
    (goal.type === "asset" && predictedDate > targetDate) ||
    (goal.type === "debt" && predictedDate > targetDate)
  ) {
    return "目標期日までに達成できない見込み";
  }

  return `予測達成日: ${formatDate(predictedDate.toISOString())}`;
};

interface GoalCardProps {
  goal: FinancialGoal;
  onEdit: (goalId: string) => void;
}

// 単一目標カード
const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit }) => {
  const progress = calculateProgress(
    goal.startValue,
    goal.currentValue,
    goal.targetValue
  );
  const remainingDays = calculateRemainingDays(goal.targetDate);
  const prediction = predictCompletionDate(goal);

  // 目標の種類に応じたスタイル
  const cardStyle = useMemo(() => {
    switch (goal.type) {
      case "asset":
        return {
          bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
          borderColor: "border-blue-200",
          badgeColor: "bg-blue-100 text-blue-800",
          progressColor: "bg-blue-600",
        };
      case "debt":
        return {
          bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
          borderColor: "border-amber-200",
          badgeColor: "bg-amber-100 text-amber-800",
          progressColor: "bg-amber-600",
        };
      case "networth":
        return {
          bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
          borderColor: "border-green-200",
          badgeColor: "bg-green-100 text-green-800",
          progressColor: "bg-emerald-600",
        };
      default:
        return {
          bgColor: "bg-gradient-to-br from-slate-50 to-slate-100",
          borderColor: "border-slate-200",
          badgeColor: "bg-slate-100 text-slate-800",
          progressColor: "bg-slate-600",
        };
    }
  }, [goal.type]);

  return (
    <Card className={`${cardStyle.bgColor} ${cardStyle.borderColor}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <Badge className={cardStyle.badgeColor}>
              {goal.type === "asset"
                ? "資産目標"
                : goal.type === "debt"
                ? "負債目標"
                : "純資産目標"}
            </Badge>
            <CardTitle className="mt-2">{goal.title}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onEdit(goal.id)}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          {goal.period}ごとの{goal.type === "debt" ? "返済" : "積立"}目標
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>進捗状況</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress
              value={progress}
              className={`h-2 ${cardStyle.progressColor}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="text-muted-foreground">現在</div>
              <div className="text-lg font-bold">
                ¥{goal.currentValue.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">目標</div>
              <div className="text-lg font-bold">
                ¥{goal.targetValue.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{formatRemainingTime(remainingDays)}</span>
            </div>
            <span className="text-xs">{formatDate(goal.targetDate)} 期限</span>
          </div>

          <div className="text-xs font-medium">{prediction}</div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button variant="ghost" size="sm" className="w-full text-xs">
          詳細を見る
        </Button>
      </CardFooter>
    </Card>
  );
};

interface GoalTrackingProps {
  goals: FinancialGoal[];
  onAddGoal: () => void;
  onEditGoal: (goalId: string) => void;
}

// 目標トラッキングコンポーネント
export const GoalTracking: React.FC<GoalTrackingProps> = ({
  goals,
  onAddGoal,
  onEditGoal,
}) => {
  // 期間によるフィルタリング
  const [activeTab, setActiveTab] = React.useState<string>("all");

  const filteredGoals = useMemo(() => {
    if (activeTab === "all") return goals;
    return goals.filter((goal) => {
      if (activeTab === "short") {
        const days = calculateRemainingDays(goal.targetDate);
        return days <= 90; // 3ヶ月以内
      }
      if (activeTab === "medium") {
        const days = calculateRemainingDays(goal.targetDate);
        return days > 90 && days <= 365; // 3ヶ月〜1年
      }
      if (activeTab === "long") {
        const days = calculateRemainingDays(goal.targetDate);
        return days > 365; // 1年以上
      }
      // 種類によるフィルタリング
      return goal.type === activeTab;
    });
  }, [goals, activeTab]);

  // 目標の進捗状況
  const goalStats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((goal) => {
      const progress = calculateProgress(
        goal.startValue,
        goal.currentValue,
        goal.targetValue
      );
      return progress >= 100;
    }).length;
    const onTrack = goals.filter((goal) => {
      const progress = calculateProgress(
        goal.startValue,
        goal.currentValue,
        goal.targetValue
      );
      const targetDate = new Date(goal.targetDate);
      const startDate = new Date(goal.startDate);
      const today = new Date();

      const totalDuration = targetDate.getTime() - startDate.getTime();
      const elapsedDuration = today.getTime() - startDate.getTime();

      if (totalDuration <= 0) return false;

      const expectedProgress = (elapsedDuration / totalDuration) * 100;

      // 進捗が期待値の80%以上なら「順調」
      return progress >= expectedProgress * 0.8 && progress < 100;
    }).length;

    return { total, completed, onTrack, atRisk: total - completed - onTrack };
  }, [goals]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">目標と達成状況</h2>
          <p className="text-muted-foreground">
            あなたの財務目標の進捗を追跡します
          </p>
        </div>

        <Button onClick={onAddGoal}>
          <Target className="mr-2 h-4 w-4" />
          新しい目標を設定
        </Button>
      </div>

      {/* 目標の概要 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">設定済み目標</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{goalStats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-emerald-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">達成済み</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-emerald-700">
                {goalStats.completed}
              </div>
              <div className="text-emerald-600 text-sm mb-1">
                {goalStats.total > 0
                  ? Math.round((goalStats.completed / goalStats.total) * 100)
                  : 0}
                %
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">順調に進行中</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-blue-700">
                {goalStats.onTrack}
              </div>
              <div className="text-blue-600 text-sm mb-1">
                {goalStats.total > 0
                  ? Math.round((goalStats.onTrack / goalStats.total) * 100)
                  : 0}
                %
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">要注意</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-amber-700">
                {goalStats.atRisk}
              </div>
              <div className="text-amber-600 text-sm mb-1">
                {goalStats.total > 0
                  ? Math.round((goalStats.atRisk / goalStats.total) * 100)
                  : 0}
                %
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 目標フィルター */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="asset">資産目標</TabsTrigger>
          <TabsTrigger value="debt">負債目標</TabsTrigger>
          <TabsTrigger value="networth">純資産目標</TabsTrigger>
          <TabsTrigger value="short">短期</TabsTrigger>
          <TabsTrigger value="medium">中期</TabsTrigger>
          <TabsTrigger value="long">長期</TabsTrigger>
        </TabsList>

        {/* 目標リスト */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.length > 0 ? (
            filteredGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onEdit={onEditGoal} />
            ))
          ) : (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center mb-4">
                  {activeTab === "all"
                    ? "目標が設定されていません。新しい財務目標を追加しましょう。"
                    : "この条件に一致する目標はありません。他のフィルターを試すか、新しい目標を追加してください。"}
                </p>
                <Button onClick={onAddGoal}>新しい目標を設定</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 目標タイムライン（11段階の期間ごとの目標を表示） */}
        {filteredGoals.length > 0 && activeTab === "all" && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>目標タイムライン</CardTitle>
              <CardDescription>期間ごとの目標達成状況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {TIME_PERIODS.map((period) => {
                  const periodGoals = goals.filter(
                    (g) => g.period === period.value
                  );
                  if (periodGoals.length === 0) return null;

                  return (
                    <div
                      key={period.value}
                      className="border-l-2 border-blue-200 pl-4 py-2"
                    >
                      <h3 className="font-medium flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-blue-500" />
                        {period.label}目標（{periodGoals.length}件）
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {periodGoals.map((goal) => {
                          const progress = calculateProgress(
                            goal.startValue,
                            goal.currentValue,
                            goal.targetValue
                          );
                          return (
                            <div
                              key={goal.id}
                              className="flex items-center justify-between bg-slate-50 p-3 rounded-md"
                            >
                              <div>
                                <div className="font-medium">{goal.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {goal.type === "asset"
                                    ? "資産"
                                    : goal.type === "debt"
                                    ? "負債"
                                    : "純資産"}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center">
                                  <div className="w-20 h-2 bg-slate-200 rounded-full mr-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        goal.type === "asset"
                                          ? "bg-blue-500"
                                          : goal.type === "debt"
                                          ? "bg-amber-500"
                                          : "bg-emerald-500"
                                      }`}
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium">
                                    {progress}%
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(goal.targetDate)}まで
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 目標達成ダッシュボード */}
        {filteredGoals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>達成進捗チャート</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {/* 実際の実装ではRechartsを使ったグラフを表示 */}
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    ここに目標達成の進捗グラフが表示されます
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>目標達成予測</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredGoals.slice(0, 5).map((goal) => {
                    const progress = calculateProgress(
                      goal.startValue,
                      goal.currentValue,
                      goal.targetValue
                    );
                    const prediction = predictCompletionDate(goal);

                    return (
                      <div
                        key={goal.id}
                        className="flex items-start justify-between border-b pb-2 last:border-0"
                      >
                        <div>
                          <div className="font-medium">{goal.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(goal.targetDate)}まで
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-sm font-medium ${
                              prediction.includes("予測達成日")
                                ? "text-green-600"
                                : prediction.includes(
                                    "目標期日までに達成できない"
                                  )
                                ? "text-red-600"
                                : "text-amber-600"
                            }`}
                          >
                            {prediction}
                          </div>
                          <div className="text-xs">現在 {progress}% 達成</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Tabs>
    </div>
  );
};
