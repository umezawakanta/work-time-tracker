// src/components/features/dashboard/PremiumDashboard.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Award,
  BarChart3,
  Download,
  Share2,
  Sparkles,
  Target,
  Clock,
  Brain,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTodos } from "@/hooks/useTodos";
import ReportService from "@/services/report/ReportService";
import { ProductivityReport } from "@/services/report/ReportService";

const PremiumDashboard: React.FC = () => {
  const { user } = useAuth();
  const { stats } = useTodos();
  const [weeklyReport, setWeeklyReport] = useState<ProductivityReport | null>(
    null
  );
  const [monthlyReport, setMonthlyReport] = useState<ProductivityReport | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const loadReports = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [weekly, monthly] = await Promise.all([
        ReportService.generateWeeklyReport(user.uid),
        ReportService.generateMonthlyReport(user.uid),
      ]);

      setWeeklyReport(weekly);
      setMonthlyReport(monthly);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user, loadReports]);

  const exportReport = async (format: "pdf" | "csv") => {
    if (!monthlyReport) return;

    try {
      const blob =
        format === "pdf"
          ? await ReportService.exportReportAsPDF(monthlyReport)
          : await ReportService.exportReportAsCSV(monthlyReport);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `productivity-report.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  if (loading || !user?.isPremium) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-lg">プレミアム機能を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">プレミアムダッシュボード</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportReport("csv")}>
            <Download className="h-4 w-4 mr-2" />
            CSV出力
          </Button>
          <Button variant="outline" onClick={() => exportReport("pdf")}>
            <Download className="h-4 w-4 mr-2" />
            PDF出力
          </Button>
          <Button>
            <Share2 className="h-4 w-4 mr-2" />
            共有
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">連続達成日数</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.streakDays || 0}日</div>
            <p className="text-xs text-muted-foreground">
              最長記録: {stats?.longestStreak || 0}日
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今週の完了率</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklyReport?.overview.completionRate.toFixed(0) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">前週比 +5%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均完了時間</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageCompletionTime.toFixed(0) || 0}分
            </div>
            <p className="text-xs text-muted-foreground">
              効率的に作業できています
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">生産性スコア</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85</div>
            <p className="text-xs text-muted-foreground">
              上位15%のパフォーマンス
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="insights">インサイト</TabsTrigger>
          <TabsTrigger value="patterns">パターン分析</TabsTrigger>
          <TabsTrigger value="recommendations">推奨事項</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>月間サマリー</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>総タスク数</span>
                  <span className="font-bold">
                    {monthlyReport?.overview.totalTasks || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>完了タスク</span>
                  <span className="font-bold">
                    {monthlyReport?.overview.completedTasks || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>1日平均</span>
                  <span className="font-bold">
                    {monthlyReport?.overview.averageTasksPerDay.toFixed(1) || 0}
                    タスク
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AIインサイト</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {monthlyReport?.insights.map((insight, index) => (
                  <li key={index} className="flex items-start">
                    <TrendingUp className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>生産性パターン</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">最も生産的な時間帯</h4>
                  <p className="text-2xl font-bold">
                    {monthlyReport?.overview.mostProductiveHour || 0}時台
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">最も生産的な曜日</h4>
                  <p className="text-2xl font-bold">
                    {monthlyReport?.overview.mostProductiveDay || "月"}曜日
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>改善提案</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {monthlyReport?.recommendations.map((rec, index) => (
                  <li key={index} className="p-3 bg-blue-50 rounded-lg">
                    <BarChart3 className="h-4 w-4 inline mr-2 text-blue-500" />
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PremiumDashboard;
