// 長期トレンド可視化コンポーネント

import React, { useState, useMemo } from "react";
import {
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Maximize2,
  TrendingUp,
  PiggyBank,
  CreditCard,
  DollarSign,
  Calendar,
  Target,
} from "lucide-react";
import { FinancialData } from "@/types";

// 期間範囲の定義
const TIME_RANGES = [
  { value: "day", label: "日次", unit: "day" },
  { value: "week", label: "週次", unit: "week" },
  { value: "2weeks", label: "2週間", unit: "week" },
  { value: "month", label: "月次", unit: "month" },
  { value: "quarter", label: "四半期", unit: "month" },
  { value: "halfyear", label: "半年", unit: "month" },
  { value: "year", label: "年次", unit: "month" },
  { value: "2years", label: "2年", unit: "month" },
  { value: "3years", label: "3年", unit: "year" },
  { value: "5years", label: "5年", unit: "year" },
  { value: "10years", label: "10年", unit: "year" },
];



// 目標データ型定義
interface FinancialGoal {
  id: string;
  type: "asset" | "debt" | "networth";
  targetDate: string;
  targetValue: number;
}

// フォーマット関数
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString: string, granularity: string): string => {
  const date = new Date(dateString);

  if (granularity === "day") {
    return new Intl.DateTimeFormat("ja-JP", {
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }

  if (granularity === "week" || granularity === "month") {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
  }).format(date);
};

interface LongTermTrendProps {
  financialData: FinancialData[];
  goals: FinancialGoal[];
  onExportData: () => void;
  onFullscreen: () => void;
}

export const LongTermTrend: React.FC<LongTermTrendProps> = ({
  financialData,
  goals,
  onExportData,
  onFullscreen,
}) => {
  const [timeRange, setTimeRange] = useState("year");
  const [chartType, setChartType] = useState("netWorth");
  const [showGoals, setShowGoals] = useState(true);

  // 時間範囲でデータをフィルター
  const filteredData = useMemo(() => {
    if (!financialData.length) return [];

    const now = new Date();
    const startDate = new Date();

    // 時間範囲に基づいて開始日を計算
    switch (timeRange) {
      case "day":
        startDate.setDate(now.getDate() - 30); // 直近30日
        break;
      case "week":
        startDate.setDate(now.getDate() - 90); // 直近約13週
        break;
      case "2weeks":
        startDate.setDate(now.getDate() - 180); // 直近約13回の2週間
        break;
      case "month":
        startDate.setFullYear(now.getFullYear() - 1); // 直近12ヶ月
        break;
      case "quarter":
        startDate.setFullYear(now.getFullYear() - 2); // 直近8四半期
        break;
      case "halfyear":
        startDate.setFullYear(now.getFullYear() - 3); // 直近6半年
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 5); // 直近5年
        break;
      case "2years":
        startDate.setFullYear(now.getFullYear() - 10); // 直近5回の2年
        break;
      case "3years":
        startDate.setFullYear(now.getFullYear() - 15); // 直近5回の3年
        break;
      case "5years":
        startDate.setFullYear(now.getFullYear() - 25); // 直近5回の5年
        break;
      case "10years":
        startDate.setFullYear(now.getFullYear() - 50); // 直近5回の10年
        break;
      default:
        startDate.setFullYear(now.getFullYear() - 1);
    }

    return financialData
      .filter((item) => new Date(item.date) >= startDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [financialData, timeRange]);

  // 目標を含めたデータ作成
  const chartData = useMemo(() => {
    if (!filteredData.length) return [];

    if (!showGoals) return filteredData;

    // 目標データをチャートデータに追加
    return filteredData.map((item) => {
      const itemDate = new Date(item.date);
      const relevantGoals = goals.filter((goal) => {
        const goalDate = new Date(goal.targetDate);
        return goalDate >= itemDate;
      });

      // 目標データを追加
      const enhancedItem = { ...item };

      relevantGoals.forEach((goal) => {
        if (goal.type === "asset") {
          enhancedItem.targetAssets = goal.targetValue;
        } else if (goal.type === "debt") {
          enhancedItem.targetDebts = goal.targetValue;
        } else if (goal.type === "networth") {
          enhancedItem.targetNetWorth = goal.targetValue;
        }
      });

      return enhancedItem;
    });
  }, [filteredData, goals, showGoals]);

  // チャートデータの集計期間を調整
  const aggregatedData = useMemo(() => {
    if (!chartData.length) return [];

    // 長期間のデータは集計する
    if (
      ["3years", "5years", "10years"].includes(timeRange) &&
      chartData.length > 60
    ) {
      const result: FinancialData[] = [];
      let currentYear = "";
      let currentYearData: FinancialData | null = null;

      chartData.forEach((item) => {
        const year = new Date(item.date).getFullYear().toString();

        if (year !== currentYear) {
          if (currentYearData) {
            result.push(currentYearData);
          }
          currentYear = year;
          currentYearData = {
            ...item,
            date: `${year}-01-01`,
          };
        } else if (currentYearData) {
          // 年間の最終データを使用
          currentYearData = {
            ...item,
            date: `${year}-01-01`,
          };
        }
      });

      if (currentYearData) {
        result.push(currentYearData);
      }

      return result;
    }

    return chartData;
  }, [chartData, timeRange]);

  const granularity = useMemo(() => {
    if (["day", "week", "2weeks"].includes(timeRange)) return "day";
    if (["month", "quarter", "halfyear", "year", "2years"].includes(timeRange))
      return "month";
    return "year";
  }, [timeRange]);

  // チャートの色定義
  const chartColors = {
    assets: "#3b82f6", // blue-500
    debts: "#f59e0b", // amber-500
    netWorth: "#10b981", // emerald-500
    targetNetWorth: "#8b5cf6", // violet-500
    targetAssets: "#6366f1", // indigo-500
    targetDebts: "#f97316", // orange-500
    cashFlow: "#06b6d4", // cyan-500
    savingsRate: "#14b8a6", // teal-500
  };

  // 成長率計算
  const growthRates = useMemo(() => {
    if (aggregatedData.length < 2) return { assets: 0, debts: 0, netWorth: 0 };

    const first = aggregatedData[0];
    const last = aggregatedData[aggregatedData.length - 1];

    // 変化率を計算
    const assetGrowth =
      first.assets > 0
        ? ((last.assets - first.assets) / first.assets) * 100
        : 0;

    const debtGrowth =
      first.debts > 0 ? ((last.debts - first.debts) / first.debts) * 100 : 0;

    const netWorthGrowth =
      first.netWorth > 0
        ? ((last.netWorth - first.netWorth) / first.netWorth) * 100
        : 0;

    return {
      assets: assetGrowth,
      debts: debtGrowth,
      netWorth: netWorthGrowth,
    };
  }, [aggregatedData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">長期トレンド分析</h2>
          <p className="text-muted-foreground">
            資産・負債の長期的な推移を確認できます
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="期間" />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => setShowGoals(!showGoals)}>
            <Target className="h-4 w-4 mr-2" />
            目標{showGoals ? "非表示" : "表示"}
          </Button>

          <Button variant="outline" onClick={onExportData}>
            <Download className="h-4 w-4 mr-2" />
            エクスポート
          </Button>

          <Button variant="outline" onClick={onFullscreen}>
            <Maximize2 className="h-4 w-4 mr-2" />
            全画面表示
          </Button>
        </div>
      </div>

      {/* チャートタブ */}
      <Tabs
        defaultValue="netWorth"
        value={chartType}
        onValueChange={setChartType}
      >
        <TabsList>
          <TabsTrigger value="netWorth">
            <DollarSign className="h-4 w-4 mr-2" />
            純資産推移
          </TabsTrigger>
          <TabsTrigger value="assetsAndDebts">
            <TrendingUp className="h-4 w-4 mr-2" />
            資産・負債推移
          </TabsTrigger>
          <TabsTrigger value="assetComposition">
            <PiggyBank className="h-4 w-4 mr-2" />
            資産構成
          </TabsTrigger>
          <TabsTrigger value="debtComposition">
            <CreditCard className="h-4 w-4 mr-2" />
            負債構成
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* 主要指標サマリー */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">
                  資産成長率
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  {growthRates.assets.toFixed(1)}%
                </div>
                <div className="text-xs text-blue-600">
                  {timeRange === "day"
                    ? "過去30日間"
                    : timeRange === "week"
                    ? "過去90日間"
                    : timeRange === "month"
                    ? "過去12ヶ月"
                    : `過去の${
                        TIME_RANGES.find((r) => r.value === timeRange)?.label ||
                        ""
                      }`}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-800">
                  負債変化率
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-700">
                  {growthRates.debts.toFixed(1)}%
                </div>
                <div className="text-xs text-amber-600">
                  {timeRange === "day"
                    ? "過去30日間"
                    : timeRange === "week"
                    ? "過去90日間"
                    : timeRange === "month"
                    ? "過去12ヶ月"
                    : `過去の${
                        TIME_RANGES.find((r) => r.value === timeRange)?.label ||
                        ""
                      }`}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-emerald-50 border-emerald-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-emerald-800">
                  純資産成長率
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-700">
                  {growthRates.netWorth.toFixed(1)}%
                </div>
                <div className="text-xs text-emerald-600">
                  {timeRange === "day"
                    ? "過去30日間"
                    : timeRange === "week"
                    ? "過去90日間"
                    : timeRange === "month"
                    ? "過去12ヶ月"
                    : `過去の${
                        TIME_RANGES.find((r) => r.value === timeRange)?.label ||
                        ""
                      }`}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 純資産推移チャート */}
          <TabsContent value="netWorth">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>純資産の推移</CardTitle>
                    <CardDescription>
                      時間経過による純資産（資産 - 負債）の変化
                    </CardDescription>
                  </div>
                  {showGoals && (
                    <Badge variant="outline" className="flex items-center">
                      <Target className="h-3 w-3 mr-1" />
                      目標を表示中
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  {aggregatedData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={aggregatedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) =>
                            formatDate(value, granularity)
                          }
                        />
                        <YAxis
                          tickFormatter={(value) =>
                            `${(value / 10000).toFixed(0)}万`
                          }
                        />
                        <Tooltip
                          formatter={(value: number) => [
                            formatCurrency(value),
                            "",
                          ]}
                          labelFormatter={(label) => formatDate(label, "day")}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="netWorth"
                          name="純資産"
                          fill={chartColors.netWorth}
                          stroke={chartColors.netWorth}
                          fillOpacity={0.3}
                        />
                        {showGoals && (
                          <Line
                            type="monotone"
                            dataKey="targetNetWorth"
                            name="目標純資産"
                            stroke={chartColors.targetNetWorth}
                            strokeDasharray="5 5"
                            dot={false}
                          />
                        )}
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        データがありません
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 py-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {aggregatedData.length > 0
                      ? `${formatDate(
                          aggregatedData[0].date,
                          "day"
                        )} 〜 ${formatDate(
                          aggregatedData[aggregatedData.length - 1].date,
                          "day"
                        )}`
                      : "データがありません"}
                  </span>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* 資産・負債推移チャート */}
          <TabsContent value="assetsAndDebts">
            <Card>
              <CardHeader>
                <CardTitle>資産・負債の推移</CardTitle>
                <CardDescription>
                  時間経過による資産と負債の変化
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  {aggregatedData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={aggregatedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) =>
                            formatDate(value, granularity)
                          }
                        />
                        <YAxis
                          tickFormatter={(value) =>
                            `${(value / 10000).toFixed(0)}万`
                          }
                        />
                        <Tooltip
                          formatter={(value: number) => [
                            formatCurrency(value),
                            "",
                          ]}
                          labelFormatter={(label) => formatDate(label, "day")}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="assets"
                          name="資産"
                          fill={chartColors.assets}
                          stroke={chartColors.assets}
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="debts"
                          name="負債"
                          fill={chartColors.debts}
                          stroke={chartColors.debts}
                          fillOpacity={0.3}
                        />
                        {showGoals && (
                          <>
                            <Line
                              type="monotone"
                              dataKey="targetAssets"
                              name="目標資産"
                              stroke={chartColors.targetAssets}
                              strokeDasharray="5 5"
                              dot={false}
                            />
                            <Line
                              type="monotone"
                              dataKey="targetDebts"
                              name="目標負債"
                              stroke={chartColors.targetDebts}
                              strokeDasharray="5 5"
                              dot={false}
                            />
                          </>
                        )}
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        データがありません
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 資産構成チャート */}
          <TabsContent value="assetComposition">
            <Card>
              <CardHeader>
                <CardTitle>資産構成の推移</CardTitle>
                <CardDescription>
                  時間経過による資産カテゴリの変化
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  {aggregatedData.length > 0 && aggregatedData[0].categories ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={aggregatedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) =>
                            formatDate(value, granularity)
                          }
                        />
                        <YAxis
                          tickFormatter={(value) =>
                            `${(value / 10000).toFixed(0)}万`
                          }
                        />
                        <Tooltip
                          formatter={(value: number) => [
                            formatCurrency(value),
                            "",
                          ]}
                          labelFormatter={(label) => formatDate(label, "day")}
                        />
                        <Legend />

                        {/* 動的にカテゴリ別のエリアを生成 */}
                        {Object.keys(aggregatedData[0].categories || {}).map(
                          (category, index) => {
                            // 各カテゴリに異なる色を割り当て
                            const hue = (index * 30) % 360;
                            const color = `hsl(${hue}, 70%, 50%)`;

                            return (
                              <Area
                                key={category}
                                type="monotone"
                                dataKey={`categories.${category}`}
                                name={category}
                                stackId="1"
                                fill={color}
                                stroke={color}
                                fillOpacity={0.6}
                              />
                            );
                          }
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        カテゴリ別データがありません
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 負債構成チャート */}
          <TabsContent value="debtComposition">
            <Card>
              <CardHeader>
                <CardTitle>負債構成の推移</CardTitle>
                <CardDescription>
                  時間経過による負債カテゴリの変化
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  {aggregatedData.length > 0 && aggregatedData[0].categories ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={aggregatedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) =>
                            formatDate(value, granularity)
                          }
                        />
                        <YAxis
                          tickFormatter={(value) =>
                            `${(value / 10000).toFixed(0)}万`
                          }
                        />
                        <Tooltip
                          formatter={(value: number) => [
                            formatCurrency(value),
                            "",
                          ]}
                          labelFormatter={(label) => formatDate(label, "day")}
                        />
                        <Legend />

                        {/* 動的に負債カテゴリ別のエリアを生成 */}
                        {Object.keys(
                          aggregatedData[0].debtCategories || {}
                        ).map((category, index) => {
                          // 各カテゴリに異なる色を割り当て
                          const hue = (index * 30 + 15) % 360;
                          const color = `hsl(${hue}, 70%, 50%)`;

                          return (
                            <Area
                              key={category}
                              type="monotone"
                              dataKey={`debtCategories.${category}`}
                              name={category}
                              stackId="1"
                              fill={color}
                              stroke={color}
                              fillOpacity={0.6}
                            />
                          );
                        })}
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        カテゴリ別負債データがありません
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {/* 財務指標と将来予測（オプション） */}
      {aggregatedData.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>財務指標と将来予測</CardTitle>
            <CardDescription>
              現在のトレンドに基づく将来予測と主要指標
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">主要指標</h3>
                <div className="space-y-3">
                  {aggregatedData.length > 1 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          年平均成長率（資産）
                        </span>
                        <span className="font-medium">
                          {calculateAnnualGrowthRate(aggregatedData, "assets")}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          年平均減少率（負債）
                        </span>
                        <span className="font-medium">
                          {calculateAnnualGrowthRate(
                            aggregatedData,
                            "debts",
                            true
                          )}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          年平均成長率（純資産）
                        </span>
                        <span className="font-medium">
                          {calculateAnnualGrowthRate(
                            aggregatedData,
                            "netWorth"
                          )}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          負債/資産比率
                        </span>
                        <span className="font-medium">
                          {calculateDebtToAssetRatio(aggregatedData)}%
                        </span>
                      </div>
                      {aggregatedData[0].savingsRate !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">
                            平均貯蓄率
                          </span>
                          <span className="font-medium">
                            {calculateAverageSavingsRate(aggregatedData)}%
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">
                  将来予測（現在のトレンドに基づく）
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      1年後の予測純資産
                    </span>
                    <span className="font-medium">
                      {formatCurrency(
                        predictFutureValue(aggregatedData, "netWorth", 1)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      3年後の予測純資産
                    </span>
                    <span className="font-medium">
                      {formatCurrency(
                        predictFutureValue(aggregatedData, "netWorth", 3)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      5年後の予測純資産
                    </span>
                    <span className="font-medium">
                      {formatCurrency(
                        predictFutureValue(aggregatedData, "netWorth", 5)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      10年後の予測純資産
                    </span>
                    <span className="font-medium">
                      {formatCurrency(
                        predictFutureValue(aggregatedData, "netWorth", 10)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// 年平均成長率計算
function calculateAnnualGrowthRate(
  data: FinancialData[],
  key: "assets" | "debts" | "netWorth",
  isDebt = false
): string {
  if (data.length < 2) return "N/A";

  const first = data[0];
  const last = data[data.length - 1];

  // 最初と最後のデータポイント間の日数
  const startDate = new Date(first.date);
  const endDate = new Date(last.date);
  const yearsDiff =
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

  if (yearsDiff < 0.1) return "N/A"; // データが短すぎる

  // 変化率を計算
  let growthRate;
  if (isDebt) {
    // 負債の場合は減少率を正の値で表現
    growthRate =
      first[key] > 0
        ? (((first[key] - last[key]) / first[key]) * 100) / yearsDiff
        : 0;
  } else {
    // 資産や純資産の成長率
    growthRate =
      first[key] > 0
        ? (((last[key] - first[key]) / first[key]) * 100) / yearsDiff
        : 0;
  }

  return growthRate.toFixed(1);
}

// 負債/資産比率計算
function calculateDebtToAssetRatio(data: FinancialData[]): string {
  const last = data[data.length - 1];

  if (last.assets <= 0) return "N/A";

  const ratio = (last.debts / last.assets) * 100;
  return ratio.toFixed(1);
}

// 平均貯蓄率計算
function calculateAverageSavingsRate(data: FinancialData[]): string {
  const savingsRates = data
    .filter((item) => item.savingsRate !== undefined)
    .map((item) => item.savingsRate || 0);

  if (savingsRates.length === 0) return "N/A";

  const avgRate =
    savingsRates.reduce((sum, rate) => sum + rate, 0) / savingsRates.length;
  return avgRate.toFixed(1);
}

// 将来値予測
function predictFutureValue(
  data: FinancialData[],
  key: "assets" | "debts" | "netWorth",
  years: number
): number {
  if (data.length < 2) return data[0][key];

  // 年間平均成長率を計算
  const annualRateStr = calculateAnnualGrowthRate(data, key);
  if (annualRateStr === "N/A") return data[data.length - 1][key];

  const annualRate = parseFloat(annualRateStr) / 100;

  // 複利で将来値を計算
  const currentValue = data[data.length - 1][key];
  const futureValue = currentValue * Math.pow(1 + annualRate, years);

  return futureValue;
}
