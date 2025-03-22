"use client";

import { useState, useEffect, useMemo } from 'react';
import PoliticalTrendsCard from '@/components/chart/PoliticalTrendsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PartyRegistrationForm } from '@/components/forms/PartyRegistrationForm';
import { SurveyRegistrationForm } from '@/components/forms/SurveyRegistrationForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BarChart2, RefreshCw, FileText, BarChart, FileUp, Save, TrendingUp, Calendar, FileDown, Filter, Settings } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { surveyApi } from '@/services/api/surveyApi';
import { toast } from 'react-toastify';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// カスタム型を定義
interface SurveyData {
  id: number;
  date: string;
  pollster: string;
  values: Record<string, number>;
}

type DateRange = {
  from: Date | null;
  to: Date | null;
};

export default function PoliticalTrends() {
  const [activeTab, setActiveTab] = useState('chart');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [surveyData, setSurveyData] = useState<SurveyData[]>([]);
  const [selectedPollsters, setSelectedPollsters] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
  const [viewMode, setViewMode] = useState('line'); // line, bar, area
  const [dataSource, setDataSource] = useState('all'); // all, latest, custom
  const isPremiumUser = false; // 実際の認証システムと連携する場合は useState を使用
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isBatchMode, setIsBatchMode] = useState(false);
  
  // surveyDataの有効利用（例：データが空かどうかのチェック）
  const hasData = useMemo(() => surveyData.length > 0, [surveyData]);

  // サンプルのデータソース（実際にはAPIから取得）
  const pollsters = useMemo(() => [
    { id: 1, name: 'NHK', color: '#e41a1c' },
    { id: 2, name: '読売新聞', color: '#377eb8' },
    { id: 3, name: '朝日新聞', color: '#4daf4a' },
    { id: 4, name: '毎日新聞', color: '#984ea3' },
    { id: 5, name: '日経新聞', color: '#ff7f00' },
    { id: 6, name: '共同通信', color: '#a65628' }
  ], []);

  useEffect(() => {
    fetchSurveyData();
  }, [dataSource, dateRange]);

  const fetchSurveyData = async () => {
    try {
      setIsLoading(true);
      // 実際のAPI呼び出し
      const response = await surveyApi.getLatest();
      if (response.data && response.data.survey) {
        // 一時的なモックデータを作成（API レスポンスが surveys を返さない場合）
        const mockSurveyData: SurveyData[] = [
          {
            id: 1,
            date: response.data.survey.surveyEndDate,
            pollster: 'NHK',
            values: { '自民党': 35.2, '立憲民主党': 12.5 }
          }
        ];
        setSurveyData(mockSurveyData);
        
        if (response.data.survey.surveyEndDate) {
          setLastUpdated(new Date(response.data.survey.surveyEndDate).toLocaleDateString('ja-JP'));
        }
      }
      setIsLoading(false);
    } catch (err) {
      console.error('調査結果取得に失敗しました:', err);
      toast.error('データの取得に失敗しました');
      setIsLoading(false);
    }
  };

  const handleDataUpdate = async () => {
    try {
      setIsLoading(true);
      const response = await surveyApi.getLatest();
      if (response.data && response.data.survey && response.data.survey.surveyEndDate) {
        setLastUpdated(new Date(response.data.survey.surveyEndDate).toLocaleDateString('ja-JP'));
        toast.success('データを更新しました');
      }
      fetchSurveyData(); // 全データの再取得
      setIsLoading(false);
    } catch (err) {
      console.error('データの更新に失敗しました:', err);
      toast.error('データの更新に失敗しました');
      setIsLoading(false);
    }
  };

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setCsvFile(file);
    
    // CSVインポート処理の例
    if (isBatchMode) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        setIsLoading(true);
        // 実際のAPIエンドポイント呼び出し
        // const response = await surveyApi.batchImport(formData);
        toast.success('CSVバッチインポートを開始しました');
        setTimeout(() => {
          setIsLoading(false);
          toast.info('バックグラウンドでインポート処理中です');
        }, 1500);
      } catch (err) {
        console.error('CSVインポートに失敗しました:', err);
        toast.error('CSVインポートに失敗しました');
        setIsLoading(false);
      }
    } else {
      setActiveTab('survey');
      toast.info('CSVファイルをロードしました。データを確認して登録してください');
    }
  };

  const handleExportData = () => {
    // CSVエクスポート機能
    toast.info('データをエクスポート中...');
    setTimeout(() => {
      const dummyLink = document.createElement('a');
      dummyLink.href = URL.createObjectURL(new Blob(['サンプルCSVデータ'], { type: 'text/csv' }));
      dummyLink.download = '政党支持率データ_' + new Date().toISOString().split('T')[0] + '.csv';
      dummyLink.click();
      toast.success('データをエクスポートしました');
    }, 1000);
  };

  const togglePollster = (pollsterId: number) => {
    setSelectedPollsters(prev => {
      if (prev.includes(pollsterId)) {
        return prev.filter(id => id !== pollsterId);
      } else {
        return [...prev, pollsterId];
      }
    });
  };

  // 利用できる政党リスト（仮）
  const parties = [
    { id: 1, name: '自民党', color: '#e60012' },
    { id: 2, name: '立憲民主党', color: '#7fc31c' },
    { id: 3, name: '日本維新の会', color: '#ff8c00' },
    { id: 4, name: '公明党', color: '#17a7b4' },
    { id: 5, name: '共産党', color: '#bd0102' },
    { id: 6, name: '国民民主党', color: '#ffd900' },
    { id: 7, name: 'れいわ新選組', color: '#800080' },
    { id: 8, name: '社民党', color: '#eb6ea5' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold">政党支持率トレンド</h1>
            {isPremiumUser && <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-amber-700">プレミアム</Badge>}
          </div>
          {lastUpdated && (
            <p className="text-muted-foreground mt-2">最終更新: {lastUpdated}</p>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-3 mt-4 md:mt-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setViewMode('line')}>
                <TrendingUp className="mr-2 h-4 w-4" />
                折れ線グラフ
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setViewMode('bar')}>
                <BarChart className="mr-2 h-4 w-4" />
                棒グラフ
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setViewMode('area')}>
                <TrendingUp className="mr-2 h-4 w-4" />
                エリアチャート
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleExportData} disabled={!isPremiumUser}>
                <FileDown className="mr-2 h-4 w-4" />
                データエクスポート {!isPremiumUser && '(プレミアム)'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="relative">
            <label htmlFor="csv-upload" className="sr-only">CSV ファイルをアップロード</label>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="CSV ファイルをアップロード"
            />
            <Button variant="outline" size="icon">
              <FileUp className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            onClick={handleDataUpdate} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />更新中...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />更新
              </>
            )}
          </Button>
        </div>
      </header>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* フィルターパネル */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              フィルター
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">調査機関</h3>
                <div className="flex flex-wrap gap-2">
                  {pollsters.map(pollster => (
                    <Badge 
                      key={pollster.id}
                      variant={selectedPollsters.includes(pollster.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      style={{
                        backgroundColor: selectedPollsters.includes(pollster.id) ? pollster.color : 'transparent',
                        borderColor: pollster.color,
                        color: selectedPollsters.includes(pollster.id) ? 'white' : 'inherit'
                      }}
                      onClick={() => togglePollster(pollster.id)}
                    >
                      {pollster.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">期間</h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
                          </>
                        ) : (
                          dateRange.from.toLocaleDateString()
                        )
                      ) : (
                        "期間を選択"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DateRangePicker
                      className="w-full"
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">データソース</h3>
                <Select value={dataSource} onValueChange={setDataSource}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべてのデータ</SelectItem>
                    <SelectItem value="latest">最新の調査結果のみ</SelectItem>
                    <SelectItem value="custom">カスタム期間</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="batch-mode"
                  checked={isBatchMode}
                  onCheckedChange={setIsBatchMode}
                />
                <Label htmlFor="batch-mode">CSVバッチインポートモード</Label>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* ダッシュボードカード */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">ダッシュボード概要</CardTitle>
            {hasData ? (
              <CardDescription>現在のデータセット: {surveyData.length}件</CardDescription>
            ) : (
              <CardDescription>データがまだ読み込まれていません</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {parties.slice(0, 3).map(party => (
                <div key={party.id} className="p-4 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{party.name}</h3>
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: party.color }}></div>
                  </div>
                  <p className="text-2xl font-bold">{(Math.random() * 40).toFixed(1)}%</p>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    <span className="text-green-500">+1.2%</span> 前回比
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="chart" className="text-base py-3">
            <BarChart2 className="mr-2 h-5 w-5" />グラフ
          </TabsTrigger>
          <TabsTrigger value="party" className="text-base py-3">
            <FileText className="mr-2 h-5 w-5" />政党登録
          </TabsTrigger>
          <TabsTrigger value="survey" className="text-base py-3">
            <BarChart className="mr-2 h-5 w-5" />調査結果登録
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chart">
          {isLoading ? (
            <Skeleton className="w-full h-[600px]" />
          ) : (
            <>
              <Card>
                <CardContent className="pt-6">
                  {/* viewModeを実際に使用 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-end space-x-2 text-sm">
                      <span className="text-muted-foreground">表示形式:</span>
                      <Badge variant="outline" className="font-normal">
                        {viewMode === 'line' && '折れ線グラフ'}
                        {viewMode === 'bar' && '棒グラフ'}
                        {viewMode === 'area' && 'エリアチャート'}
                      </Badge>
                    </div>
                  </div>
                  <PoliticalTrendsCard />
                </CardContent>
                {!isPremiumUser && (
                  <CardFooter className="bg-gray-50 dark:bg-gray-800/50">
                    <div className="w-full text-center py-3">
                      <p className="text-sm text-muted-foreground mb-2">プレミアム機能を使用してさらに詳細な分析が可能です</p>
                      <Button variant="default" className="bg-gradient-to-r from-amber-500 to-amber-700">
                        プレミアムにアップグレード
                      </Button>
                    </div>
                  </CardFooter>
                )}
              </Card>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="party">
          <Card>
            <CardHeader>
              <CardTitle>政党登録</CardTitle>
              <CardDescription>政党情報を登録または編集できます</CardDescription>
            </CardHeader>
            <CardContent>
              <PartyRegistrationForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="survey">
          <Card>
            <CardHeader>
              <CardTitle>調査結果登録・更新</CardTitle>
              <CardDescription>
                {csvFile ? `CSVファイル「${csvFile.name}」から調査結果を登録します` : '新しい調査結果の登録・更新ができます'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SurveyRegistrationForm />
            </CardContent>
            {csvFile && (
              <CardFooter className="flex justify-end space-x-4 bg-gray-50 dark:bg-gray-800/50 py-3">
                <Button variant="outline" onClick={() => setCsvFile(null)}>
                  キャンセル
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Save className="mr-2 h-4 w-4" />
                  CSVデータを登録
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}