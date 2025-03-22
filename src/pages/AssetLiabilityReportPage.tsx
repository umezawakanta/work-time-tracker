"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { BalanceUpdateModal } from "@/components/BalanceUpdateModel";
import { AssetLiabilityTrendChart } from "@/components/chart/AssetLiabilityTrendChart";
import { AssetTrendChart } from "@/components/chart/AssetTrendChart"; // 新しいコンポーネントをインポート
import { DebtTrendChart } from "@/components/chart/DebtTrendChart"; // 新しいコンポーネントをインポート
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
  Clock,
  Crown, // プレミアム機能のアイコン
  LightbulbIcon, // ヒントのアイコン
  LineChart // 新しい分析機能のアイコン
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
import { 
  Dialog,
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function AssetLiabilityReportPage() {
  const assetEntries = useSelector((state: RootState) => state.asset.entries);
  const debtEntries = useSelector((state: RootState) => state.debt.entries);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editingDebt, setEditingDebt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState("overview");
  const [timeRange, setTimeRange] = useState("all");
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false);
  const [showTips, setShowTips] = useState(true);
  
  // このデモでは常にfalseだが、実際には認証状態から取得
  const isPremium = false;

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

  // 資産負債率を計算
  const debtToAssetRatio = totalAssets > 0 ? (totalDebts / totalAssets) * 100 : 0;

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
  
  // ヒントのリスト
  const financialTips = [
    "資産配分は年齢に応じて調整することがおすすめです。一般的に若いうちはより積極的な資産配分が可能です。",
    "緊急資金は生活費の3〜6ヶ月分を目安に確保しておくと安心です。",
    "高金利の負債から優先的に返済することで、長期的な利息負担を軽減できます。",
    "資産の定期的なリバランスは、リスク管理と長期的なリターン向上に役立ちます。",
    "確定拠出年金などの税制優遇制度を活用することで、長期的な資産形成が効率的になります。",
  ];
  
  // ランダムなヒントを選択
  const randomTip = financialTips[Math.floor(Math.random() * financialTips.length)];

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">資産/負債レポート</h1>
          <p className="text-muted-foreground mt-1">あなたの財務状況を分析・管理するためのダッシュボード</p>
        </div>
        
        {!isPremium && (
          <Button 
            onClick={() => setIsPremiumDialogOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium flex items-center gap-2"
          >
            <Crown className="h-4 w-4" />
            <span>プレミアムにアップグレード</span>
          </Button>
        )}
      </div>
      
      {/* 財務ヒント */}
      {showTips && (
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4 relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-2 top-2 h-6 w-6 p-0" 
              onClick={() => setShowTips(false)}
            >
              ✕
            </Button>
            <div className="flex items-center gap-2">
              <LightbulbIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <p className="italic text-blue-800">{randomTip}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* リマインダーセクション */}
      <div className="mb-8">
        <BalanceUpdateReminder
          assetEntries={assetEntries}
          debtEntries={debtEntries}
        />
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">資産負債率</CardTitle>
              <CardDescription>負債÷資産×100%</CardDescription>
            </div>
            <div className={`p-2 rounded-full ${
              debtToAssetRatio < 30 ? "bg-green-500/10" : 
              debtToAssetRatio < 50 ? "bg-yellow-500/10" : "bg-red-500/10"
            }`}>
              <LineChart className={`h-5 w-5 ${
                debtToAssetRatio < 30 ? "text-green-500" : 
                debtToAssetRatio < 50 ? "text-yellow-500" : "text-red-500"
              }`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{debtToAssetRatio.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              {debtToAssetRatio < 30 ? "良好" : 
               debtToAssetRatio < 50 ? "注意" : "危険"}
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
          
          {/* 資産分布の概要カード（新機能） */}
          {isPremium && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>資産カテゴリ分布</CardTitle>
                  <CardDescription>資産タイプ別の保有割合</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {/* ここには資産分布の円グラフが入る（プレミアム機能） */}
                    <div className="flex items-center justify-center h-full bg-muted/20 rounded-md">
                      <p className="text-muted-foreground">資産分布グラフ（プレミアム機能）</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>目標達成度</CardTitle>
                  <CardDescription>設定した財務目標への進捗状況</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {/* ここには目標達成度グラフが入る（プレミアム機能） */}
                    <div className="flex items-center justify-center h-full bg-muted/20 rounded-md">
                      <p className="text-muted-foreground">目標達成グラフ（プレミアム機能）</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* プレミアム機能の案内（非プレミアムユーザー向け） */}
          {!isPremium && (
            <Card className="mt-6 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2 flex items-center">
                      <Crown className="h-5 w-5 text-amber-600 mr-2" />
                      プレミアム機能を使って資産管理を次のレベルへ
                    </h3>
                    <p className="text-sm text-amber-900">
                      資産カテゴリ分析、目標設定と追跡、詳細なポートフォリオ分析など、プレミアム限定の機能で資産管理をさらに効率化しましょう。
                    </p>
                  </div>
                  <Button 
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={() => setIsPremiumDialogOpen(true)}
                  >
                    プレミアムを試す
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
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
                    {/* 実装した資産推移グラフコンポーネントを使用 */}
                    <AssetTrendChart 
                      data={assetEntries} 
                      timeRange={timeRange as 'month' | 'quarter' | 'year' | 'all'} 
                    />
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
                    {/* 実装した負債推移グラフコンポーネントを使用 */}
                    <DebtTrendChart 
                      data={debtEntries} 
                      timeRange={timeRange as 'month' | 'quarter' | 'year' | 'all'} 
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-muted/20 rounded-md">
                    <p className="text-muted-foreground">負債データがありません</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* 追加の分析セクション（プレミアム機能） */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>詳細な資産分析</CardTitle>
                    <CardDescription>より深い資産動向の把握</CardDescription>
                  </div>
                  {!isPremium && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      プレミアム限定
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isPremium ? (
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="growth-analysis">
                      <AccordionTrigger>資産成長分析</AccordionTrigger>
                      <AccordionContent>
                        <div className="p-4 bg-muted/10 rounded-md">
                          <p className="text-sm text-muted-foreground mb-4">
                            資産の成長推移と将来予測。現在のペースで資産を増やすと、5年後には約{" "}
                            <span className="font-semibold">
                              ¥{Math.round(totalAssets * Math.pow(1 + (assetGrowthRate > 0 ? assetGrowthRate : 5) / 100, 5)).toLocaleString()}
                            </span>{" "}
                            に達する見込みです。
                          </p>
                          {/* ここに資産成長予測チャートが入る */}
                          <div className="h-40 bg-muted/20 flex items-center justify-center rounded-md">
                            <p className="text-sm text-muted-foreground">資産成長予測チャート</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="debt-reduction">
                      <AccordionTrigger>負債削減計画</AccordionTrigger>
                      <AccordionContent>
                        <div className="p-4 bg-muted/10 rounded-md">
                          <p className="text-sm text-muted-foreground mb-4">
                            現在の負債を効率的に削減するための最適な計画。最も金利の高い負債から返済することで、
                            約 <span className="font-semibold">¥{Math.round(totalDebts * 0.15).toLocaleString()}</span> の利息を節約できる可能性があります。
                          </p>
                          {/* ここに負債削減計画チャートが入る */}
                          <div className="h-40 bg-muted/20 flex items-center justify-center rounded-md">
                            <p className="text-sm text-muted-foreground">負債削減計画チャート</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  <div className="flex flex-col items-center p-6 text-center">
                    <div className="mb-4">
                      <Crown className="h-10 w-10 text-amber-400 mx-auto mb-2" />
                      <h3 className="text-lg font-medium mb-1">プレミアム機能</h3>
                      <p className="text-sm text-muted-foreground">
                        詳細な資産分析は<span className="font-semibold">プレミアム</span>会員限定の機能です。
                        アップグレードして資産の成長予測、最適化プラン、負債削減戦略などにアクセスしましょう。
                      </p>
                    </div>
                    <Button 
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={() => setIsPremiumDialogOpen(true)}
                    >
                      プレミアムを試す
                    </Button>
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
            <li><strong>新機能:</strong> 資産負債率が50%を超える場合は、新たな負債を増やす前に慎重に検討しましょう。</li>
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

      {/* 残高更新モーダル */}
      <BalanceUpdateModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        onSubmit={handleBalanceUpdateSubmit}
        currentBalance={selectedAccount?.value || 0}
        accountName={selectedAccount?.account || ""}
      />
      
      {/* プレミアム案内ダイアログ */}
      <Dialog open={isPremiumDialogOpen} onOpenChange={setIsPremiumDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Crown className="h-5 w-5 text-amber-500" />
              プレミアム資産管理
            </DialogTitle>
            <DialogDescription>
              あなたの資産管理をより効果的に
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-full">
                <LineChart className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-medium">詳細な資産分析</h4>
                <p className="text-sm text-muted-foreground">
                  あなたの資産ポートフォリオの深い分析と最適化提案
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-full">
                <PieChart className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-medium">資産配分の最適化</h4>
                <p className="text-sm text-muted-foreground">
                  リスクとリターンのバランスを考慮した最適な資産配分を提案
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-medium">将来予測と目標設定</h4>
                <p className="text-sm text-muted-foreground">
                  現在の資産状況から将来の予測を立て、目標達成をサポート
                </p>
              </div>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-md mt-4">
              <p className="text-center text-amber-800 text-sm">
                プレミアムプランで資産管理の効率を最大化し、より賢明な財務判断を行いましょう
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsPremiumDialogOpen(false)}
              className="sm:flex-1"
            >
              また後で
            </Button>
            <Button 
              className="bg-amber-600 hover:bg-amber-700 sm:flex-1"
              onClick={() => setIsPremiumDialogOpen(false)}
            >
              プレミアムを始める ¥980/月
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}