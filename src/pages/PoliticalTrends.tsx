// src/components/PoliticalTrendsAdvanced.tsx
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  BarChart2,
  RefreshCw,
  FileText,
  BarChart,
  FileUp,
  Download,
  TrendingUp,
  Calendar,
  Filter,
  Settings,
  AlertCircle,
  Plus,
  Info,
} from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { toast } from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import PoliticalLineChart from '@/components/chart/PoliticalLineChart';
import { useSurveyData } from '@/components/chart/hooks/useSurveyData';
import { ChartDataPoint, SupportRate, Survey } from '@/types/survey';
import { QuickEntryForm } from '@/components/forms/QuickEntryForm';
import { surveyApi } from '@/services/api/surveyApi';
import { DateRange } from 'react-day-picker';

// 送信データの型定義
interface SurveySubmitData {
  mediaOutlet: string;
  surveyEndDate: string;
  sampleSize?: number;
  supportRates: Array<{
    partyId: string;
    supportRate: number;
  }>;
  cabinetSupport?: number;
  cabinetOppose?: number;
}

export default function PoliticalTrends() {
  // カスタムフックからデータを取得
  const { chartData, mediaList, parties, isLoading, missingData, fetchSurveyData } =
    useSurveyData();

  // 状態管理
  const [selectedMedia, setSelectedMedia] = useState<string>('各社平均');
  const [selectedParties, setSelectedParties] = useState<string[]>([]);
  const [highlightedParties, setHighlightedParties] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('chart');
  const [viewMode, setViewMode] = useState<'line' | 'bar' | 'pie'>('line');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [isQuickEntryMode, setIsQuickEntryMode] = useState(false);
  const [normalizeYAxis, setNormalizeYAxis] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [showMissingDataAlert, setShowMissingDataAlert] = useState(true);

  // 初期データ読み込み
  useEffect(() => {
    fetchSurveyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 政党が読み込まれたら主要政党を自動選択
  useEffect(() => {
    if (parties && parties.length > 0) {
      const majorParties = ['自民', '立民', '維新', '公明', '共産'];
      setSelectedParties(
        parties.filter((p) => majorParties.includes(p.shortName)).map((p) => p.shortName)
      );
    }
  }, [parties]);

  // 選択されたメディアのデータを取得
  const filteredData = useMemo(() => {
    if (!chartData || !chartData[selectedMedia]) return [];

    // 日付でフィルタリング
    return chartData[selectedMedia].filter((dataPoint) => {
      const pointDate = new Date(dataPoint.fullDate);
      return (
        (!dateRange.from || pointDate >= dateRange.from) &&
        (!dateRange.to || pointDate <= dateRange.to)
      );
    });
  }, [chartData, selectedMedia, dateRange]);

  // 政党の選択状態を切り替える
  const toggleParty = (partyShortName: string) => {
    setSelectedParties((prev) => {
      if (prev.includes(partyShortName)) {
        return prev.filter((p) => p !== partyShortName);
      } else {
        return [...prev, partyShortName];
      }
    });
  };

  // 政党をハイライト表示
  const toggleHighlightParty = (partyShortName: string) => {
    setHighlightedParties((prev) => {
      if (prev.includes(partyShortName)) {
        return prev.filter((p) => p !== partyShortName);
      } else {
        return [...prev, partyShortName];
      }
    });
  };

  // データ更新
  const handleRefresh = async () => {
    try {
      await fetchSurveyData();
      toast.success('データを最新の状態に更新しました');
    } catch (error) {
      toast.error('データの更新に失敗しました');
      console.error(error);
    }
  };

  // CSV/Excelエクスポート処理
  const handleExportData = () => {
    if (!isPremiumUser) {
      toast.error('この機能はプレミアムユーザー限定です');
      return;
    }

    try {
      // CSVデータの作成例
      const csvContent = generateCSVContent(filteredData);

      // ダウンロード処理
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `政党支持率データ_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExportDialogOpen(false);
      toast.success(`データを${exportFormat.toUpperCase()}形式でエクスポートしました`);
    } catch (error) {
      toast.error('エクスポートに失敗しました');
      console.error(error);
    }
  };

  // CSVコンテンツ生成
  const generateCSVContent = (data: ChartDataPoint[]) => {
    if (!data || data.length === 0) return '';

    // ヘッダー行の生成
    const headers = ['日付', 'メディア'];
    parties.forEach((party) => {
      if (selectedParties.includes(party.shortName)) {
        headers.push(party.name);
      }
    });

    // データ行の生成
    const rows = data.map((point) => {
      const row = [point.fullDate, point.mediaOutlet];
      parties.forEach((party) => {
        if (selectedParties.includes(party.shortName)) {
          const key =
            selectedMedia === '各社平均' ? party.shortName : `${party.shortName}_${selectedMedia}`;
          row.push(point[key]?.toString() || '');
        }
      });
      return row.join(',');
    });

    // CSV形式で返す
    return [headers.join(','), ...rows].join('\n');
  };

  // クイック入力処理
  const handleQuickEntrySubmit = async (formData: SurveySubmitData) => {
    try {
      // 既存のsurveyApiメソッドに合わせてデータを変換
      const surveyData: Omit<Survey, '_id'> = {
        mediaOutlet: formData.mediaOutlet,
        surveyStartDate: formData.surveyEndDate, // 簡易入力では開始日=終了日とする
        surveyEndDate: formData.surveyEndDate,
        sampleSize: formData.sampleSize,
      };

      // 支持率データを変換
      const supportRatesData: Omit<SupportRate, '_id' | 'surveyId'>[] = formData.supportRates.map(
        (rate) => ({
          partyId: rate.partyId,
          supportRate: rate.supportRate,
        })
      );

      // 正しいAPIメソッドを呼び出す
      const response = await surveyApi.create(surveyData, supportRatesData);

      if (response.status === 201) {
        toast.success('データを登録しました');
        setIsQuickEntryMode(false);
        fetchSurveyData(); // データを再取得
      }
    } catch (error) {
      toast.error('データの登録に失敗しました');
      console.error(error);
    }
  };

  // 未入力データアラートを閉じる
  const dismissMissingDataAlert = () => {
    setShowMissingDataAlert(false);
  };

  // メディア選択オプション
  const mediaOptions = useMemo(() => {
    return mediaList.map((media) => (
      <SelectItem key={media} value={media}>
        {media}
      </SelectItem>
    ));
  }, [mediaList]);

  // 政党バッジ
  const renderPartyBadges = useMemo(() => {
    return parties.map((party) => (
      <div key={party.shortName} className="inline-block">
        <Badge
          variant={selectedParties.includes(party.shortName) ? 'default' : 'outline'}
          className={`
            mb-2 mr-2 cursor-pointer 
            ${
              highlightedParties.includes(party.shortName)
                ? 'ring-2 ring-yellow-400 dark:ring-yellow-500'
                : ''
            }
          `}
          style={{
            backgroundColor: selectedParties.includes(party.shortName)
              ? party.colorCode
              : 'transparent',
            borderColor: party.colorCode,
            color:
              selectedParties.includes(party.shortName) && isColorDark(party.colorCode)
                ? 'white'
                : 'inherit',
          }}
          onClick={() => toggleParty(party.shortName)}
          onContextMenu={(e) => {
            e.preventDefault();
            toggleHighlightParty(party.shortName);
          }}
        >
          {party.name}
        </Badge>
      </div>
    ));
  }, [parties, selectedParties, highlightedParties]);

  // ヘルパー関数: 色の明暗を判定
  function isColorDark(hexColor: string): boolean {
    // #で始まる場合は取り除く
    hexColor = hexColor.replace('#', '');

    // RGB値に変換
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);

    // 明度を計算 (YIQ公式を使用)
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;

    return yiq < 128; // 128より小さい場合は暗い色と判定
  }

  // 未入力データのアラート表示
  const renderMissingDataAlert = useMemo(() => {
    const currentMedia = selectedMedia;
    if (
      !showMissingDataAlert ||
      currentMedia === '各社平均' ||
      !missingData[currentMedia] ||
      missingData[currentMedia].length === 0
    ) {
      return null;
    }

    // ここを修正します
    const missingMonths = missingData[currentMedia]
      .map((month) => {
        console.log('Missing month:', month);
        // month が "2025/04" のような形式で来ることを想定
        const [year, monthNum] = month.split('/');
        // parseInt の後にエラーチェックを追加
        const monthInt = parseInt(monthNum);
        console.log('Parsed month:', monthInt);
        if (isNaN(monthInt)) {
          return `${year}年不明月`;
        }
        return `${year}年${monthInt}月`;
      })
      .join('、');

    return (
      <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>データが未入力の月があります</AlertTitle>
        <AlertDescription>
          <p>
            {currentMedia}には以下の月のデータが登録されていません：
            {missingMonths}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setIsQuickEntryMode(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            データを追加
          </Button>
        </AlertDescription>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2"
          onClick={dismissMissingDataAlert}
        >
          ×
        </Button>
      </Alert>
    );
  }, [selectedMedia, missingData, showMissingDataAlert]);

  // エクスポートダイアログ
  const renderExportDialog = () => (
    <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>データエクスポート</DialogTitle>
          <DialogDescription>現在表示されているデータをエクスポートします</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="export-format">ファイル形式</Label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger id="export-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV形式</SelectItem>
                <SelectItem value="excel">Excel形式</SelectItem>
                <SelectItem value="json">JSON形式</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isPremiumUser && (
            <Alert className="bg-amber-50 text-amber-800 border-amber-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>プレミアム機能</AlertTitle>
              <AlertDescription>
                データエクスポートはプレミアムユーザー専用機能です。
                アップグレードすると利用できるようになります。
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleExportData} disabled={!isPremiumUser}>
            <Download className="mr-2 h-4 w-4" />
            エクスポート
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // クイック入力ダイアログ
  const renderQuickEntryDialog = () => (
    <Dialog open={isQuickEntryMode} onOpenChange={setIsQuickEntryMode}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>クイック調査データ登録</DialogTitle>
          <DialogDescription>調査機関の支持率データを素早く登録できます</DialogDescription>
        </DialogHeader>

        <QuickEntryForm
          parties={parties}
          mediaOutlet={selectedMedia !== '各社平均' ? selectedMedia : undefined}
          onSubmit={handleQuickEntrySubmit}
          onCancel={() => setIsQuickEntryMode(false)}
        />
      </DialogContent>
    </Dialog>
  );

  const getPartyColorClass = (partyId: string) =>
    `party-color-${partyId.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {renderExportDialog()}
      {renderQuickEntryDialog()}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold">政党支持率トレンド</h1>
            {isPremiumUser && (
              <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-amber-700">
                プレミアム
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-2">複数の世論調査機関による政党支持率の推移</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 mt-4 md:mt-0">
          <Button variant="outline" size="sm" onClick={() => setIsQuickEntryMode(true)}>
            <Plus className="mr-2 h-4 w-4" />
            クイック入力
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                表示設定
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setViewMode('line')}>
                <TrendingUp className="mr-2 h-4 w-4" />
                折れ線グラフ
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setViewMode('bar')}>
                <BarChart className="mr-2 h-4 w-4" />
                棒グラフ
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setViewMode('pie')}>
                <BarChart2 className="mr-2 h-4 w-4" />
                円グラフ
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setNormalizeYAxis(!normalizeYAxis)}>
                <Switch checked={normalizeYAxis} className="mr-2" />
                Y軸を自動調整
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsExportDialogOpen(true)}>
                <Download className="mr-2 h-4 w-4" />
                データエクスポート
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className="relative overflow-hidden">
            <label htmlFor="csv-upload" className="absolute inset-0 cursor-pointer">
              <span className="sr-only">CSVファイルをアップロード</span>
            </label>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              aria-label="CSVファイルをアップロード"
              onChange={() => toast.success('CSVアップロード機能を準備中です')}
              className="hidden"
            />
            <FileUp className="mr-2 h-4 w-4" />
            CSVアップロード
          </Button>

          <Button onClick={handleRefresh} disabled={isLoading} size="sm">
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                更新中...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                更新
              </>
            )}
          </Button>
        </div>
      </header>

      {renderMissingDataAlert}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                フィルター
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="media-select" className="mb-2 block">
                  調査機関
                </Label>
                <Select value={selectedMedia} onValueChange={setSelectedMedia}>
                  <SelectTrigger id="media-select">
                    <SelectValue placeholder="調査機関を選択" />
                  </SelectTrigger>
                  <SelectContent>{mediaOptions}</SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block">政党</Label>
                <div className="flex flex-wrap">{renderPartyBadges}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  クリックで選択/解除、右クリックでハイライト
                </p>
              </div>

              <div>
                <Label className="mb-2 block">期間</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateRange.from && dateRange.to
                        ? `${format(dateRange.from, 'yyyy/MM')} - ${format(
                            dateRange.to,
                            'yyyy/MM'
                          )}`
                        : '期間を選択'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DateRangePicker
                      className="w-full" // 必要なclassName属性を追加
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  メディアによって調査頻度が異なります。
                  <br />
                  「各社平均」では全社の平均値が月単位で表示されます。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {selectedMedia} (
                  {viewMode === 'line' ? '折れ線' : viewMode === 'bar' ? '棒グラフ' : '円グラフ'})
                </CardTitle>
                <div className="text-xs text-muted-foreground">
                  {dateRange.from && dateRange.to
                    ? `${format(dateRange.from, 'yyyy年MM月')}～${format(
                        dateRange.to,
                        'yyyy年MM月'
                      )}`
                    : '全期間'}
                </div>
              </div>
              <CardDescription>
                {selectedParties.length === 0
                  ? '政党を選択してください'
                  : `${selectedParties.length}政党のデータを表示中`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <Skeleton className="h-5 w-5 rounded-full animate-pulse" />
                  <div className="ml-3">データを読み込み中...</div>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 border border-dashed rounded-lg p-6">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">データがありません</h3>
                  <p className="text-sm text-center text-muted-foreground mb-4">
                    選択した期間やメディアにデータが存在しないか、
                    <br />
                    政党が選択されていません。
                  </p>
                  <Button variant="outline" onClick={() => setIsQuickEntryMode(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    データを追加
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <PoliticalLineChart
                    data={filteredData}
                    parties={parties}
                    mediaOutlet={selectedMedia}
                    chartType={viewMode}
                    highlightedParties={highlightedParties}
                  />
                </div>
              )}
            </CardContent>
            {!isPremiumUser && (
              <CardFooter className="bg-gray-50 dark:bg-gray-800/50">
                <div className="w-full text-center py-3">
                  <p className="text-sm text-muted-foreground mb-2">
                    プレミアム機能を使用してさらに詳細な分析が可能です
                  </p>
                  <Button
                    variant="default"
                    className="bg-gradient-to-r from-amber-500 to-amber-700"
                    onClick={() => setIsPremiumUser(true)}
                  >
                    プレミアムにアップグレード
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="chart" className="text-base py-3">
            <BarChart2 className="mr-2 h-5 w-5" />
            詳細チャート
          </TabsTrigger>
          <TabsTrigger value="data" className="text-base py-3">
            <FileText className="mr-2 h-5 w-5" />
            元データ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>月別詳細データ</CardTitle>
              <CardDescription>各月の詳細データを表示します</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="w-full h-96" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          月
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          メディア
                        </th>
                        {parties
                          .filter((party) => selectedParties.includes(party.shortName))
                          .map((party) => (
                            <th
                              key={party._id}
                              className={`party-header ${getPartyColorClass(party._id)}`}
                            >
                              {party.name}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredData.map((dataPoint, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {dataPoint.monthDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {dataPoint.mediaOutlet}
                          </td>
                          {parties
                            .filter((party) => selectedParties.includes(party.shortName))
                            .map((party) => {
                              const key =
                                selectedMedia === '各社平均'
                                  ? party.shortName
                                  : `${party.shortName}_${selectedMedia}`;
                              const value = dataPoint[key];
                              return (
                                <td
                                  key={party._id}
                                  className={`px-6 py-4 whitespace-nowrap text-sm font-semibold party-cell-${party._id}`}
                                >
                                  {typeof value === 'number' ? `${value.toFixed(1)}%` : '-'}
                                </td>
                              );
                            })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>データソース</CardTitle>
              <CardDescription>各社の世論調査データの詳細情報</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">データ概要</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>収録期間: 2024年9月～現在</li>
                    <li>調査機関数: {mediaList.length - 1}社</li>
                    <li>収録政党数: {parties.length}党</li>
                    <li>データ更新頻度: 各社の調査実施後随時</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">調査手法と注意点</h3>
                  <div className="space-y-4">
                    {mediaList
                      .filter((m) => m !== '各社平均')
                      .map((media, index) => (
                        <div key={index} className="border rounded-md p-4">
                          <h4 className="font-medium mb-1">{media}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {media === 'NHK' && '電話調査（RDD方式）、サンプルサイズ約2,000人'}
                            {media === '読売新聞' && '電話調査（RDD方式）、サンプルサイズ約1,000人'}
                            {media === '朝日新聞' && '電話調査（RDD方式）、サンプルサイズ約1,500人'}
                            {media === '毎日新聞' && '電話調査（RDD方式）、サンプルサイズ約1,000人'}
                            {media === '日経新聞' && '電話調査（RDD方式）、サンプルサイズ約1,000人'}
                            {media === '共同通信' && '電話調査（RDD方式）、サンプルサイズ約1,000人'}
                          </p>
                          {missingData[media] && missingData[media].length > 0 && (
                            <div className="mt-2">
                              <Badge variant="outline" className="text-amber-500 border-amber-500">
                                データ未入力: {missingData[media].length}ヶ月
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">データ利用にあたっての注意</h3>
                  <div className="text-sm space-y-2">
                    <p>
                      各調査機関によって調査手法、質問方法、実施時期などが異なるため、
                      単純な数値の比較には注意が必要です。
                    </p>
                    <p>
                      「各社平均」は月ごとの各調査機関の平均値を算出したもので、
                      実際の調査が行われたものではありません。
                    </p>
                    <p>
                      このデータは参考情報としてご活用ください。
                      公式な数値については各調査機関の発表をご確認ください。
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* プレミアム機能の宣伝 */}
      {!isPremiumUser && (
        <div className="mt-8 rounded-lg bg-gradient-to-r from-amber-600 to-amber-900 text-white p-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 md:mr-6">
              <h3 className="text-xl font-bold mb-2">プレミアム機能を解除</h3>
              <p className="text-white/90 mb-4">
                より詳細な分析と高度な機能を使って、政党支持率データを最大限に活用しましょう
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Badge className="mr-2 bg-white text-amber-800">新機能</Badge>
                  <span>カスタム分析レポートのダウンロード</span>
                </li>
                <li className="flex items-center">
                  <Badge className="mr-2 bg-white text-amber-800">新機能</Badge>
                  <span>政治イベントとの相関分析</span>
                </li>
                <li className="flex items-center">
                  <Badge className="mr-2 bg-white text-amber-800">新機能</Badge>
                  <span>支持率変動アラート通知</span>
                </li>
              </ul>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                ¥980 <span className="text-lg">/月</span>
              </div>
              <Button
                className="bg-white text-amber-800 hover:bg-gray-100"
                size="lg"
                onClick={() => setIsPremiumUser(true)}
              >
                プレミアムにアップグレード
              </Button>
              <p className="text-xs mt-2 text-white/80">いつでもキャンセル可能</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
