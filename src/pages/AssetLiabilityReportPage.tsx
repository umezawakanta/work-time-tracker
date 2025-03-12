"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { BalanceUpdateModal } from "@/components/BalanceUpdateModel";
import { AssetLiabilityTrendChart } from "@/components/chart/AssetLiabilityTrendChart";
import BalanceUpdateReminder from "@/components/BalanceUpdateReminder";
import { AssetDebtForms } from "@/components/forms/AssetDebtForms";
import { AssetDebtLists } from "@/components/list/AssetDebtLists";
import { useReportData } from "@/hooks/useReportData";
import { useBalanceUpdate } from "@/hooks/useBalanceUpdate";
import { combineData } from "@/utils/combineData";
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  BarChart2, 
  Loader2, 
  AlertTriangle,
  DollarSign,
  TrendingUp,
  PieChart,
  RefreshCw,
  Calendar,
  Clock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function AssetLiabilityReportPage() {
  const assetEntries = useSelector((state: RootState) => state.asset.entries);
  const debtEntries = useSelector((state: RootState) => state.debt.entries);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editingDebt, setEditingDebt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState("overview");
  const [timeRange, setTimeRange] = useState("all");

  useReportData();

  useEffect(() => {
    const loadData = async () => {
      try {
        // データ読み込みの遅延をシミュレート
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      } catch (err) {
        console.error("Failed to load report data:", err);
        setError("データの読み込みに失敗しました。もう一度お試しください。");
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const updateLastBalanceDate = () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("lastBalanceUpdateDate", today);
  };

  const {
    isBalanceModalOpen,
    setIsBalanceModalOpen,
    selectedAccount,
    handleBalanceUpdate,
    handleBalanceUpdateSubmit,
  } = useBalanceUpdate(updateLastBalanceDate);

  const combinedData = combineData(assetEntries, debtEntries);

  const handleBalanceUpdateWrapper = (accountId: string, isAsset: boolean) => {
    handleBalanceUpdate(accountId, isAsset ? assetEntries : debtEntries);
  };

  // 総資産額を計算
  const totalAssets = assetEntries.reduce((sum, entry) => sum + entry.value, 0);
  
  // 総負債額を計算
  const totalDebts = debtEntries.reduce((sum, entry) => sum + entry.value, 0);
  
  // 純資産（純価値）を計算
  const netWorth = totalAssets - totalDebts;

  // 直近の資産エントリーから資産増加率を計算（過去30日間）
  const calculateAssetGrowthRate = () => {
    if (assetEntries.length < 2) return 0;
    
    const sortedEntries = [...assetEntries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const latestEntries = sortedEntries.slice(0, 2);
    if (latestEntries.length < 2) return 0;
    
    const oldValue = latestEntries[1].value;
    const newValue = latestEntries[0].value;
    
    if (oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
  };

  const assetGrowthRate = calculateAssetGrowthRate();

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">データを読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-xl text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" /> 再読み込み
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* ヘッダーセクション */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">資産/負債レポート</h1>
        <p className="text-muted-foreground mt-1">あなたの財務状況を分析・管理するためのダッシュボード</p>
      </div>
      
      {/* リマインダーセクション */}
      <div className="mb-8">
        <BalanceUpdateReminder
          assetEntries={assetEntries}
          debtEntries={debtEntries}
        />
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">総資産</CardTitle>
              <CardDescription>あなたの保有資産合計</CardDescription>
            </div>
            <div className="p-2 bg-primary/10 rounded-full">
              <ArrowUpCircle className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">¥{totalAssets.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {assetEntries.length > 0 ? (
                <span className={assetGrowthRate >= 0 ? "text-green-500" : "text-red-500"}>
                  {assetGrowthRate >= 0 ? "+" : ""}{assetGrowthRate.toFixed(2)}% 
                  <span className="ml-1">前回比</span>
                </span>
              ) : "データなし"}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">総負債</CardTitle>
              <CardDescription>あなたの負債合計</CardDescription>
            </div>
            <div className="p-2 bg-destructive/10 rounded-full">
              <ArrowDownCircle className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">¥{totalDebts.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {debtEntries.length > 0 ? (
                <span>{debtEntries.length}件の負債</span>
              ) : "データなし"}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">純資産</CardTitle>
              <CardDescription>資産 - 負債</CardDescription>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-full">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">¥{netWorth.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {netWorth > 0 ? "黒字" : netWorth < 0 ? "赤字" : "収支均衡"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* タブナビゲーション */}
      <Tabs defaultValue="overview" value={activeView} onValueChange={setActiveView} className="mb-8">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart2 className="h-4 w-4 mr-2" />
              概要
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TrendingUp className="h-4 w-4 mr-2" />
              トレンド
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <PieChart className="h-4 w-4 mr-2" />
              詳細
            </TabsTrigger>
          </TabsList>
          
          {activeView === "trends" && (
            <div className="flex items-center">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="期間" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">1ヶ月</SelectItem>
                  <SelectItem value="quarter">3ヶ月</SelectItem>
                  <SelectItem value="year">1年</SelectItem>
                  <SelectItem value="all">すべて</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <TabsContent value="overview" className="mt-6">
          {/* 概要タブの内容 */}
          <div className="grid grid-cols-1 gap-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>資産/負債の推移</CardTitle>
                <CardDescription>時間経過による資産と負債の変化</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {combinedData.length > 0 ? (
                  <div className="h-80">
                    <AssetLiabilityTrendChart data={combinedData} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-80 bg-muted/20">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-4">データがありません</p>
                      <Button onClick={() => setActiveView("details")}>データを追加</Button>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/20 py-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>最終更新: {combinedData.length > 0 ? new Date().toLocaleDateString() : 'なし'}</span>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          {/* トレンドタブの内容 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>資産推移</CardTitle>
                <CardDescription>時間経過による資産の変化</CardDescription>
              </CardHeader>
              <CardContent>
                {assetEntries.length > 0 ? (
                  <div className="h-64">
                    {/* ここには資産専用のチャートコンポーネントを配置 */}
                    <div className="flex items-center justify-center h-full bg-muted/20 rounded-md">
                      <p className="text-muted-foreground">資産推移グラフ（実装例）</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-muted/20 rounded-md">
                    <p className="text-muted-foreground">資産データがありません</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>負債推移</CardTitle>
                <CardDescription>時間経過による負債の変化</CardDescription>
              </CardHeader>
              <CardContent>
                {debtEntries.length > 0 ? (
                  <div className="h-64">
                    {/* ここには負債専用のチャートコンポーネントを配置 */}
                    <div className="flex items-center justify-center h-full bg-muted/20 rounded-md">
                      <p className="text-muted-foreground">負債推移グラフ（実装例）</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-muted/20 rounded-md">
                    <p className="text-muted-foreground">負債データがありません</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="mt-6">
          {/* 詳細タブの内容 */}
          <div className="grid grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span>資産・負債の管理</span>
                  <Badge variant="outline" className="ml-2">
                    {assetEntries.length + debtEntries.length}件
                  </Badge>
                </CardTitle>
                <CardDescription>資産と負債の登録・編集・更新</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <AssetDebtForms
                    editingAsset={editingAsset}
                    setEditingAsset={setEditingAsset}
                    editingDebt={editingDebt}
                    setEditingDebt={setEditingDebt}
                    updateLastBalanceDate={updateLastBalanceDate}
                  />

                  <AssetDebtLists
                    assetEntries={assetEntries}
                    debtEntries={debtEntries}
                    onBalanceUpdate={handleBalanceUpdateWrapper}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 資産・負債の管理ヒント */}
      <Card className="bg-muted/20 border-dashed mb-6">
        <CardHeader>
          <CardTitle className="text-lg">資産管理のヒント</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>定期的に資産と負債の残高を更新して、正確な財務状況を把握しましょう。</li>
            <li>資産の成長率を観察し、投資戦略の有効性を評価しましょう。</li>
            <li>負債の返済計画を立て、高金利の負債から優先的に返済することを検討しましょう。</li>
          </ul>
        </CardContent>
      </Card>

      {/* フッター */}
      <div className="border-t pt-4 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center">
          <Clock className="h-4 w-4 mr-1" />
          <p>最終更新: {new Date().toLocaleString()}</p>
        </div>
      </div>

      <BalanceUpdateModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        onSubmit={handleBalanceUpdateSubmit}
        currentBalance={selectedAccount?.value || 0}
        accountName={selectedAccount?.account || ""}
      />
    </div>
  );
}