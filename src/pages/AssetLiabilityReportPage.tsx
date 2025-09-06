'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { BalanceUpdateModal } from '@/components/BalanceUpdateModel';
import { AssetLiabilityTrendChart } from '@/components/chart/AssetLiabilityTrendChart';
import { AssetTrendChart } from '@/components/chart/AssetTrendChart';
import { DebtTrendChart } from '@/components/chart/DebtTrendChart';
import { AssetCategoryPieChart } from '@/components/chart/AssetCategoryPieChart';
import { NetWorthProgressChart } from '@/components/chart/NetWorthProgressChart';
import { AssetGrowthForecastChart } from '@/components/chart/AssetGrowthForecastChart';
import { MonthlySnapshotTable } from '@/components/tables/MonthlySnapshotTable';
import BalanceUpdateReminder from '@/components/BalanceUpdateReminder';
import { AssetDebtForms } from '@/components/forms/AssetDebtForms';
import { AssetDebtLists } from '@/components/list/AssetDebtLists';
import { QuickInput } from '@/components/QuickInput'; // 追加: 新しいクイック入力コンポーネント
import { GoalTracking } from '@/components/goals/GoalTracking'; // 追加: 目標設定コンポーネント
import { LongTermTrend } from '@/components/trends/LongTermTrend'; // 追加: 長期トレンド可視化コンポーネント
import { useReportData } from '@/hooks/useReportData';
import { useBalanceUpdate } from '@/hooks/useBalanceUpdate';
import { combineData } from '@/utils/combineData';
import { calculateFinancialMetrics } from '@/utils/financialMetrics';
import { shareReport } from '@/utils/shareReport';
import { exportToCSV, exportToPDF } from '@/utils/exportData';
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
  Crown,
  LightbulbIcon,
  LineChart,
  FileDown,
  Share2,
  Plus,
  Download,
  Camera,
  Filter,
  Target, // 追加: 目標のアイコン
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { CombinedDataPoint, LongTermDataPoint } from '@/types';
import { FinancialGoal } from '@/types'; // 追加: 目標の型定義

export default function AssetLiabilityReportPage() {
  const assetEntries = useSelector((state: RootState) => state.asset.entries);
  const debtEntries = useSelector((state: RootState) => state.debt.entries);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editingDebt, setEditingDebt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('overview');
  const [timeRange, setTimeRange] = useState('year');
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [showMonthlySnapshots, setShowMonthlySnapshots] = useState(false);
  const [isExportingData, setIsExportingData] = useState(false);
  const [compareWithPrevious, setCompareWithPrevious] = useState(false);
  const [displayMode, setDisplayMode] = useState<'actual' | 'percentage'>('actual');
  const [viewDateRange, setViewDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    end: new Date(),
  });

  // 目標設定関連の状態 (追加)
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [isFullscreenView, setIsFullscreenView] = useState(false);

  // このデモでは常にfalseだが、実際には認証状態から取得
  const [isPremium, setIsPremium] = useState(false);

  // デモ用の目標データ (追加)
  const [goals, setGoals] = useState<FinancialGoal[]>([
    {
      id: 'goal1',
      title: '緊急資金の構築',
      type: 'asset',
      startValue: 200000,
      currentValue: 350000,
      targetValue: 600000,
      startDate: '2023-01-01',
      targetDate: '2023-12-31',
      period: 'monthly',
      autoUpdate: true,
      history: [
        { date: '2023-01-01', value: 200000 },
        { date: '2023-02-01', value: 250000 },
        { date: '2023-03-01', value: 275000 },
        { date: '2023-04-01', value: 300000 },
        { date: '2023-05-01', value: 325000 },
        { date: '2023-06-01', value: 350000 },
      ],
    },
    {
      id: 'goal2',
      title: '住宅ローンの返済',
      type: 'debt',
      startValue: 25000000,
      currentValue: 24000000,
      targetValue: 0,
      startDate: '2023-01-01',
      targetDate: '2033-01-01',
      period: 'monthly',
      autoUpdate: true,
      history: [
        { date: '2023-01-01', value: 25000000 },
        { date: '2023-02-01', value: 24800000 },
        { date: '2023-03-01', value: 24600000 },
        { date: '2023-04-01', value: 24400000 },
        { date: '2023-05-01', value: 24200000 },
        { date: '2023-06-01', value: 24000000 },
      ],
    },
    {
      id: 'goal3',
      title: '純資産1000万円達成',
      type: 'networth',
      startValue: 5000000,
      currentValue: 6500000,
      targetValue: 10000000,
      startDate: '2023-01-01',
      targetDate: '2025-01-01',
      period: 'quarterly',
      autoUpdate: false,
      history: [
        { date: '2023-01-01', value: 5000000 },
        { date: '2023-04-01', value: 5500000 },
        { date: '2023-07-01', value: 6000000 },
        { date: '2023-10-01', value: 6500000 },
      ],
    },
  ]);

  // 長期トレンド分析用のデータ (追加)
  const [longTermData, setLongTermData] = useState<LongTermDataPoint[]>([]);

  // 月次データの自動生成 (デモ用)
  const generateMonthlySnapshots = () => {
    setIsLoading(true);
    // 実際のAPIコールが必要だが、このデモではタイマーで模擬
    setTimeout(() => {
      toast.success('月次スナップショットが生成されました！');
      setShowMonthlySnapshots(true);
      setIsLoading(false);
    }, 1500);
  };

  // プレミアムアップグレード処理
  const handlePremiumUpgrade = () => {
    setIsLoading(true);
    // 実際の支払い処理が必要だが、このデモではタイマーで模擬
    setTimeout(() => {
      setIsPremium(true);
      setIsPremiumDialogOpen(false);
      toast.success('プレミアムにアップグレードしました！全ての機能が利用可能です。');
      setIsLoading(false);
    }, 1500);
  };

  useReportData();

  useEffect(() => {
    const loadData = async () => {
      try {
        // データ読み込みの遅延をシミュレート
        setTimeout(() => {
          setIsLoading(false);

          // 長期トレンドデータを生成（デモ用）
          generateLongTermData();
        }, 800);
      } catch (err) {
        console.error('Failed to load report data:', err);
        setError('データの読み込みに失敗しました。もう一度お試しください。');
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 長期トレンドデータの生成（デモ用）
  const generateLongTermData = () => {
    const data: LongTermDataPoint[] = [];
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 5); // 5年前からのデータ

    // 月次データを生成
    for (let i = 0; i <= 60; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);

      // 資産は徐々に増加、変動あり
      const baseAssets = 5000000 + i * 100000;
      const assets = baseAssets * (0.95 + Math.random() * 0.1);

      // 負債は徐々に減少
      const baseDebts = 3000000 - i * 30000;
      const debts = Math.max(0, baseDebts * (0.97 + Math.random() * 0.06));

      // 純資産
      const netWorth = assets - debts;

      // カテゴリ別の資産を追加
      const categories = {
        '現金・預金': assets * 0.2,
        投資: assets * 0.35,
        不動産: assets * 0.3,
        '年金・保険': assets * 0.1,
        その他: assets * 0.05,
      };

      // データポイント
      data.push({
        date: date.toISOString().split('T')[0],
        assets,
        debts,
        netWorth,
        savingsRate: 20 + Math.random() * 10,
        categories: categories,
      });
    }

    setLongTermData(data);
  };

  const updateLastBalanceDate = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('lastBalanceUpdateDate', today);
  };

  const {
    isBalanceModalOpen,
    setIsBalanceModalOpen,
    selectedAccount,
    handleBalanceUpdate,
    handleBalanceUpdateSubmit,
  } = useBalanceUpdate(updateLastBalanceDate);

  const combinedData = combineData(
    assetEntries
      .filter((entry) => entry && entry.account) // undefinedやaccountがないエントリを除外
      .map((entry) => ({
        ...entry,
        id: entry.account,
      })),
    debtEntries
      .filter((entry) => entry && entry.account) // undefinedやaccountがないエントリを除外
      .map((entry) => ({
        ...entry,
        id: entry.account,
      }))
  );

  // AssetLiabilityTrendChart 用のデータを生成
  const chartData = useMemo(() => {
    const assetChartData = assetEntries
      .filter((entry) => entry && entry.account)
      .map((entry) => ({
        date: new Date(entry.date),
        account: entry.account,
        value: entry.value,
        type: 'asset' as const,
      }));

    const debtChartData = debtEntries
      .filter((entry) => entry && entry.account)
      .map((entry) => ({
        date: new Date(entry.date),
        account: entry.account,
        value: entry.value,
        type: 'debt' as const,
      }));

    return [...assetChartData, ...debtChartData];
  }, [assetEntries, debtEntries]);

  // viewDateRange を使って combinedData をフィルタ
  const filteredCombinedData = useMemo(() => {
    // viewDateRange.startまたはviewDateRange.endがnullの場合は、フィルタリングを行わずに全データを返す
    if (!viewDateRange.start || !viewDateRange.end) return combinedData;

    return combinedData.filter((entry: { date: string }) => {
      const entryDate = new Date(entry.date);
      return entryDate >= viewDateRange.start! && entryDate <= viewDateRange.end!;
    });
  }, [combinedData, viewDateRange]);

  const handleBalanceUpdateWrapper = (accountId: string, isAsset: boolean) => {
    handleBalanceUpdate(accountId, isAsset ? assetEntries : debtEntries);
  };

  // 財務指標を計算
  const {
    totalAssets,
    totalDebts,
    netWorth,
    debtToAssetRatio,
    assetGrowthRate,
    monthlyNetWorthChange,
    emergencyFundRatio,
    projectedNetWorth,
    investmentAllocation,
    liquidityRatio,
  } = useMemo(
    () =>
      calculateFinancialMetrics(
        assetEntries
          .filter((entry) => entry && entry.account)
          .map((entry) => ({
            ...entry,
            id: entry.account,
          })),
        debtEntries
          .filter((entry) => entry && entry.account)
          .map((entry) => ({
            ...entry,
            id: entry.account,
          }))
      ),
    [assetEntries, debtEntries]
  );

  interface ExportableEntry {
    [key: string]: string | number | boolean | Date | null;
  }

  // データのエクスポート処理
  const handleExportData = () => {
    setIsExportingData(true);
    setTimeout(() => {
      if (exportFormat === 'csv') {
        // filteredCombinedDataをExportableData型に変換
        const exportableData = filteredCombinedData.map((entry) => {
          // エントリの各プロパティをコピーして新しいオブジェクトを作成
          const exportableEntry: ExportableEntry = {};

          // すべてのプロパティをコピー
          Object.entries(entry).forEach(([key, value]) => {
            exportableEntry[key] = value;
          });

          return exportableEntry;
        });

        exportToCSV(exportableData, 'asset-liability-report');
      } else if (exportFormat === 'pdf') {
        // こちらも同様に型を変換
        const exportableData = filteredCombinedData.map((entry) => {
          const exportableEntry: ExportableEntry = {};
          Object.entries(entry).forEach(([key, value]) => {
            exportableEntry[key] = value;
          });
          return exportableEntry;
        });

        exportToPDF(exportableData, 'asset-liability-report');
      }
      setIsExportingData(false);
      setExportDialogOpen(false);
      toast.success(`データを${exportFormat.toUpperCase()}形式でエクスポートしました！`);
    }, 1500);
  };

  // レポート共有処理
  const handleShareReport = () => {
    if (!isPremium) {
      toast.error('レポート共有はプレミアム機能です');
      setIsPremiumDialogOpen(true);
      return;
    }

    toast.promise(
      shareReport({
        assets: totalAssets,
        debts: totalDebts,
        netWorth: netWorth,
        assetGrowthRate: assetGrowthRate,
      }),
      {
        loading: '共有リンクを生成中...',
        success: '共有リンクがクリップボードにコピーされました！',
        error: '共有リンクの生成に失敗しました',
      }
    );
  };

  // スクリーンショット撮影処理（※実際の画面キャプチャ実装は別途ライブラリの導入が必要）
  const handleTakeScreenshot = () => {
    if (!isPremium) {
      toast.error('スクリーンショット機能はプレミアム機能です');
      setIsPremiumDialogOpen(true);
      return;
    }

    toast.success('スクリーンショットがダウンロードされました！');
  };

  // 目標の追加・編集処理 (追加)
  const handleAddGoal = (newGoal: FinancialGoal) => {
    setGoals([...goals, { ...newGoal, id: `goal${goals.length + 1}` }]);
    setIsGoalFormOpen(false);
    toast.success('新しい目標を設定しました！');
  };

  const handleEditGoal = (goalId: string) => {
    setEditingGoal(goalId);
    setIsGoalFormOpen(true);
  };

  // カテゴリー別資産データ（新機能）
  const assetsByCategory = useMemo(() => {
    if (assetEntries.length === 0) return [];

    const categories: { [key: string]: number } = {
      '現金・預金': 0,
      投資: 0,
      不動産: 0,
      '年金・保険': 0,
      その他: 0,
    };

    assetEntries
      .filter((entry) => entry && entry.account)
      .forEach((entry) => {
        // 実際のアプリではカテゴリ情報もエントリに含まれるが、デモでは簡易的に振り分け
        const name = entry.account.toLowerCase();
        if (name.includes('銀行') || name.includes('現金') || name.includes('預金')) {
          categories['現金・預金'] += entry.value;
        } else if (name.includes('株') || name.includes('投資') || name.includes('fund')) {
          categories['投資'] += entry.value;
        } else if (
          name.includes('不動産') ||
          name.includes('マンション') ||
          name.includes('house')
        ) {
          categories['不動産'] += entry.value;
        } else if (name.includes('年金') || name.includes('保険') || name.includes('insurance')) {
          categories['年金・保険'] += entry.value;
        } else {
          categories['その他'] += entry.value;
        }
      });

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      percentage: totalAssets > 0 ? (value / totalAssets) * 100 : 0,
    }));
  }, [assetEntries, totalAssets]);

  // ヒントのリスト
  const financialTips = [
    '資産配分は年齢に応じて調整することがおすすめです。一般的に若いうちはより積極的な資産配分が可能です。',
    '緊急資金は生活費の3〜6ヶ月分を目安に確保しておくと安心です。',
    '高金利の負債から優先的に返済することで、長期的な利息負担を軽減できます。',
    '資産の定期的なリバランスは、リスク管理と長期的なリターン向上に役立ちます。',
    '確定拠出年金などの税制優遇制度を活用することで、長期的な資産形成が効率的になります。',
    '投資は分散することでリスクを軽減できます。株式、債券、不動産など、異なる資産クラスに分散することを検討しましょう。',
    '長期的な資産形成には複利の力を活用することが重要です。早期に投資を始めるほど効果は大きくなります。',
    '定期的な資産棚卸しを行い、不要な支出や余剰資金を確認することで資産形成の効率が高まります。',
  ];

  // ランダムなヒントを選択
  const randomTip = financialTips[Math.floor(Math.random() * financialTips.length)];

  // ローディング画面
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

  // エラー画面
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">資産/負債レポート</h1>
          <p className="text-muted-foreground mt-1">
            あなたの財務状況を分析・管理するためのダッシュボード
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* クイック追加 */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setIsQuickAddOpen(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>クイック追加</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* エクスポート */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    isPremium ? setExportDialogOpen(true) : setIsPremiumDialogOpen(true)
                  }
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>データエクスポート {!isPremium && '(プレミアム)'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* スクリーンショット */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleTakeScreenshot}>
                  <Camera className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>スクリーンショット {!isPremium && '(プレミアム)'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 共有 */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleShareReport}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>レポート共有 {!isPremium && '(プレミアム)'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {!isPremium && (
            <Button
              onClick={() => setIsPremiumDialogOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium flex items-center gap-2"
            >
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">プレミアムにアップグレード</span>
              <span className="sm:hidden">プレミアム</span>
            </Button>
          )}
        </div>
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
          onAddNew={() => setIsQuickAddOpen(true)}
        />
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
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
                <span className={assetGrowthRate >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {assetGrowthRate >= 0 ? '+' : ''}
                  {assetGrowthRate.toFixed(2)}%<span className="ml-1">前回比</span>
                </span>
              ) : (
                'データなし'
              )}
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
              {debtEntries.length > 0 ? <span>{debtEntries.length}件の負債</span> : 'データなし'}
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
              <span className={monthlyNetWorthChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {monthlyNetWorthChange >= 0 ? '+' : ''}
                {monthlyNetWorthChange.toLocaleString()}円/月
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">資産負債率</CardTitle>
              <CardDescription>負債÷資産×100%</CardDescription>
            </div>
            <div
              className={`p-2 rounded-full ${
                debtToAssetRatio < 30
                  ? 'bg-green-500/10'
                  : debtToAssetRatio < 50
                    ? 'bg-yellow-500/10'
                    : 'bg-red-500/10'
              }`}
            >
              <LineChart
                className={`h-5 w-5 ${
                  debtToAssetRatio < 30
                    ? 'text-green-500'
                    : debtToAssetRatio < 50
                      ? 'text-yellow-500'
                      : 'text-red-500'
                }`}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{debtToAssetRatio.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              {debtToAssetRatio < 30 ? '良好' : debtToAssetRatio < 50 ? '注意' : '危険'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 新機能: 追加指標カード - プレミアム機能 */}
      {isPremium && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">緊急資金率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold">{emergencyFundRatio.toFixed(1)}ヶ月分</div>
                <Badge
                  variant={
                    emergencyFundRatio >= 6
                      ? 'default'
                      : emergencyFundRatio >= 3
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {emergencyFundRatio >= 6 ? '理想的' : emergencyFundRatio >= 3 ? '良好' : '不足'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">流動比率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold">{liquidityRatio.toFixed(2)}倍</div>
                <Badge
                  variant={
                    liquidityRatio >= 2
                      ? 'default'
                      : liquidityRatio >= 1
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {liquidityRatio >= 2 ? '安全' : liquidityRatio >= 1 ? '適正' : '要注意'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">投資配分比率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold">{investmentAllocation.toFixed(1)}%</div>
                <Badge
                  variant={
                    investmentAllocation >= 30
                      ? 'default'
                      : investmentAllocation >= 15
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {investmentAllocation >= 30
                    ? '積極的'
                    : investmentAllocation >= 15
                      ? 'バランス'
                      : '保守的'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">1年後の予測純資産</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold">¥{projectedNetWorth.toLocaleString()}</div>
                <Badge variant="outline" className="text-green-600">
                  +{((projectedNetWorth / netWorth - 1) * 100).toFixed(1)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* タブナビゲーション */}
      <Tabs
        defaultValue="overview"
        value={activeView}
        onValueChange={setActiveView}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-4">
          <TabsList>
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              概要
            </TabsTrigger>
            <TabsTrigger
              value="trends"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              トレンド
            </TabsTrigger>
            <TabsTrigger
              value="goals"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Target className="h-4 w-4 mr-2" />
              目標設定
            </TabsTrigger>
            <TabsTrigger
              value="longterm"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <LineChart className="h-4 w-4 mr-2" />
              長期分析
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <PieChart className="h-4 w-4 mr-2" />
              詳細
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {/* フィルターとオプション */}
            {activeView !== 'details' && activeView !== 'goals' && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <Filter className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">表示オプション</span>
                      <span className="sm:hidden">オプション</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        setDisplayMode(displayMode === 'actual' ? 'percentage' : 'actual')
                      }
                    >
                      <span className="mr-2">{displayMode === 'actual' ? '%' : '¥'}</span>
                      {displayMode === 'actual' ? '割合表示' : '金額表示'}に切替
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCompareWithPrevious(!compareWithPrevious)}>
                      <Switch checked={compareWithPrevious} className="mr-2" />
                      前回と比較
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => generateMonthlySnapshots()}>
                      <Clock className="mr-2 h-4 w-4" />
                      月次データ生成
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
                      <FileDown className="mr-2 h-4 w-4" />
                      データをエクスポート
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {timeRange === 'custom' && (
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col">
                      <label htmlFor="start-date">開始日</label>
                      <input
                        id="start-date"
                        type="date"
                        className="h-9 rounded-md border border-input bg-background px-3"
                        value={
                          viewDateRange.start ? viewDateRange.start.toISOString().split('T')[0] : ''
                        }
                        onChange={(e) => {
                          const newDate = e.target.value ? new Date(e.target.value) : null;
                          setViewDateRange((prev) => ({
                            ...prev,
                            start: newDate,
                          }));
                        }}
                      />
                    </div>
                    <span>〜</span>
                    <div className="flex flex-col">
                      <label htmlFor="end-date">終了日</label>
                      <input
                        id="end-date"
                        type="date"
                        className="h-9 rounded-md border border-input bg-background px-3"
                        value={
                          viewDateRange.end ? viewDateRange.end.toISOString().split('T')[0] : ''
                        }
                        onChange={(e) => {
                          const newDate = e.target.value ? new Date(e.target.value) : null;
                          setViewDateRange((prev) => ({
                            ...prev,
                            end: newDate,
                          }));
                        }}
                      />
                    </div>
                  </div>
                )}
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32 h-9">
                    <SelectValue placeholder="期間" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">1ヶ月</SelectItem>
                    <SelectItem value="quarter">3ヶ月</SelectItem>
                    <SelectItem value="year">1年</SelectItem>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="custom">カスタム期間</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>

        <TabsContent value="overview" className="mt-6">
          {/* 概要タブの内容 */}
          <div className="grid grid-cols-1 gap-6">
            {/* 概要タブのチャート表示部分 */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>資産/負債の推移</CardTitle>
                <CardDescription>時間経過による資産と負債の変化</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {chartData.length > 0 ? (
                  <div className="chart-container">
                    <AssetLiabilityTrendChart data={chartData} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-80 bg-muted/20">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-4">データがありません</p>
                      <Button onClick={() => setIsQuickAddOpen(true)}>データを追加</Button>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/20 py-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    最終更新: {chartData.length > 0 ? new Date().toLocaleDateString() : 'なし'}
                  </span>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* 資産分布と月次データ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>資産カテゴリ分布</CardTitle>
                    <CardDescription>資産タイプ別の保有割合</CardDescription>
                  </div>
                  {!isPremium && (
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-800 flex items-center gap-1"
                    >
                      <Crown className="h-3 w-3" />
                      プレミアム
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {isPremium && assetsByCategory.length > 0 ? (
                    <AssetCategoryPieChart data={assetsByCategory} />
                  ) : !isPremium ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <PieChart className="h-12 w-12 text-amber-300 mb-2" />
                      <p className="text-sm text-muted-foreground text-center mb-2">
                        資産分布グラフはプレミアム機能です
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPremiumDialogOpen(true)}
                        className="mt-2"
                      >
                        プレミアムを試す
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-muted/20 rounded-md">
                      <p className="text-muted-foreground">資産データがありません</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>純資産の推移</CardTitle>
                    <CardDescription>月次の純資産変化</CardDescription>
                  </div>
                  {showMonthlySnapshots && (
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      最新データ
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {filteredCombinedData.length > 0 && showMonthlySnapshots ? (
                    <NetWorthProgressChart data={filteredCombinedData} isPremium={isPremium} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-muted/20 rounded-md">
                      <p className="text-muted-foreground mb-2">
                        {filteredCombinedData.length === 0
                          ? 'データがありません'
                          : '月次スナップショットが必要です'}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateMonthlySnapshots}
                        disabled={filteredCombinedData.length === 0}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        月次データを生成
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 月次データテーブル */}
          {showMonthlySnapshots && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>月次スナップショット</CardTitle>
                <CardDescription>月ごとの資産・負債推移</CardDescription>
              </CardHeader>
              <CardContent>
                <MonthlySnapshotTable data={filteredCombinedData as CombinedDataPoint[]} />
              </CardContent>
            </Card>
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

          {/* 資産成長予測（新機能） */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>資産成長予測</CardTitle>
                    <CardDescription>現在のペースでの5年後の資産予測</CardDescription>
                  </div>
                  {!isPremium && (
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-800 flex items-center gap-1"
                    >
                      <Crown className="h-3 w-3" />
                      プレミアム
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isPremium && totalAssets > 0 ? (
                  <div className="h-80">
                    <AssetGrowthForecastChart
                      currentAssets={totalAssets}
                      growthRate={assetGrowthRate > 0 ? assetGrowthRate : 5}
                      years={5}
                    />
                  </div>
                ) : !isPremium ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <TrendingUp className="h-12 w-12 text-amber-300 mb-4" />
                    <p className="text-center text-muted-foreground mb-4 max-w-md">
                      プレミアム会員になると、現在の資産成長率に基づいた将来予測、最適化プラン、
                      負債削減戦略などの高度な分析にアクセスできます。
                    </p>
                    <Button
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={() => setIsPremiumDialogOpen(true)}
                    >
                      プレミアムを試す
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-muted/20 rounded-md">
                    <p className="text-muted-foreground">予測には十分なデータがありません</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 分析ポイントリスト */}
          {assetEntries.length > 0 && debtEntries.length > 0 && (
            <Card className="mt-6 bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">分析ポイント</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="bg-blue-200 rounded-full p-1 mr-3 mt-0.5">
                      <TrendingUp className="h-4 w-4 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-blue-800 font-medium">
                        資産成長率: {assetGrowthRate.toFixed(2)}%
                      </p>
                      <p className="text-sm text-blue-700">
                        {assetGrowthRate > 5
                          ? '現在の成長率は良好です。この調子を維持しましょう。'
                          : assetGrowthRate > 0
                            ? '成長率は安定していますが、さらなる向上の余地があります。'
                            : '成長率が低下しています。資産配分の見直しを検討してください。'}
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start">
                    <div className="bg-blue-200 rounded-full p-1 mr-3 mt-0.5">
                      <ArrowDownCircle className="h-4 w-4 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-blue-800 font-medium">
                        負債比率: {debtToAssetRatio.toFixed(1)}%
                      </p>
                      <p className="text-sm text-blue-700">
                        {debtToAssetRatio < 30
                          ? '負債比率は健全な水準です。'
                          : debtToAssetRatio < 50
                            ? '負債比率は許容範囲内ですが、注意が必要です。'
                            : '負債比率が高すぎます。負債の削減を優先してください。'}
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start">
                    <div className="bg-blue-200 rounded-full p-1 mr-3 mt-0.5">
                      <DollarSign className="h-4 w-4 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-blue-800 font-medium">
                        月次純資産変化: {monthlyNetWorthChange.toLocaleString()}円
                      </p>
                      <p className="text-sm text-blue-700">
                        {monthlyNetWorthChange > 0
                          ? '純資産は増加傾向にあります。'
                          : '純資産が減少しています。収入増加か支出削減を検討してください。'}
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 新しい目標設定タブ */}
        <TabsContent value="goals" className="mt-6">
          <GoalTracking goals={goals} onAddGoal={handleAddGoal} onEditGoal={handleEditGoal} />
        </TabsContent>

        {/* 新しい長期トレンド分析タブ */}
        <TabsContent value="longterm" className="mt-6">
          <LongTermTrend
            financialData={longTermData}
            goals={goals}
            onExportData={handleExportData}
            onFullscreen={() => setIsFullscreenView(true)}
          />
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
            <li>
              <strong>新機能:</strong>{' '}
              資産負債率が50%を超える場合は、新たな負債を増やす前に慎重に検討しましょう。
            </li>
            <li>
              <strong>新機能:</strong>{' '}
              毎月の純資産の増加額を追跡し、長期的な資産形成の進捗を確認しましょう。
            </li>
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
        accountName={selectedAccount?.account || ''}
      />

      {/* クイック追加モーダル - 新機能 */}
      <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>クイック追加</DialogTitle>
            <DialogDescription>資産・負債を素早く追加できます</DialogDescription>
          </DialogHeader>

          <QuickInput
            onClose={() => setIsQuickAddOpen(false)}
            updateLastBalanceDate={updateLastBalanceDate}
          />
        </DialogContent>
      </Dialog>

      {/* 目標設定・編集モーダル (新規追加) */}
      <Dialog open={isGoalFormOpen} onOpenChange={setIsGoalFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingGoal ? '目標を編集' : '新しい目標を設定'}</DialogTitle>
            <DialogDescription>財務目標を設定して、進捗を追跡しましょう</DialogDescription>
          </DialogHeader>

          {/* 実際のアプリでは、目標の設定フォームコンポーネントを実装 */}
          <div className="text-center py-6">
            <Target className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              ※ デモ版では目標フォーム機能は実装されていません。
            </p>
            <Button onClick={() => setIsGoalFormOpen(false)}>閉じる</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* エクスポートダイアログ */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>データエクスポート</DialogTitle>
            <DialogDescription>資産・負債データをエクスポートします</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="export-format">エクスポート形式</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger id="export-format">
                  <SelectValue placeholder="形式を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV形式</SelectItem>
                  <SelectItem value="pdf">PDF形式</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isPremium && (
              <div className="bg-amber-50 p-4 rounded-md text-sm text-amber-800 flex items-start space-x-2">
                <Crown className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">プレミアム限定機能</p>
                  <p>
                    データエクスポート機能はプレミアム会員専用です。プレミアムにアップグレードしてご利用ください。
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleExportData} disabled={!isPremium || isExportingData}>
              {isExportingData ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  処理中...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  エクスポート
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* プレミアム案内ダイアログ */}
      <Dialog open={isPremiumDialogOpen} onOpenChange={setIsPremiumDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Crown className="h-5 w-5 text-amber-500" />
              プレミアム資産管理
            </DialogTitle>
            <DialogDescription>あなたの資産管理をより効果的に</DialogDescription>
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

            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-full">
                <FileDown className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-medium">高度なエクスポート機能</h4>
                <p className="text-sm text-muted-foreground">
                  CSV/PDF形式でのデータエクスポートと専用レポート生成
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
              onClick={handlePremiumUpgrade}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  処理中...
                </>
              ) : (
                <>プレミアムを始める ¥980/月</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 全画面表示モーダル (新規追加) */}
      <Dialog open={isFullscreenView} onOpenChange={setIsFullscreenView}>
        <DialogContent className="max-w-7xl w-full">
          <DialogHeader>
            <DialogTitle>長期トレンド分析 - 詳細ビュー</DialogTitle>
            <DialogDescription>財務データの長期的な変化を詳細に確認できます</DialogDescription>
          </DialogHeader>

          <div className="h-[calc(100vh-200px)]">
            <LongTermTrend
              financialData={longTermData}
              goals={goals}
              onExportData={handleExportData}
              onFullscreen={() => setIsFullscreenView(false)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFullscreenView(false)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
