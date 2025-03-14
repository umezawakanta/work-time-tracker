// src/pages/PoliticalTrends.tsx
import { useState, useEffect } from 'react';
import PoliticalChart from '@/components/chart/PoliticalChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PartyRegistrationForm } from '@/components/forms/PartyRegistrationForm';
import { SurveyRegistrationForm } from '@/components/forms/SurveyRegistrationForm';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart2, RefreshCw, FileText, BarChart } from 'lucide-react';
import { surveyApi } from '@/services/api/surveyApi';
import { toast } from 'react-toastify';

export default function PoliticalTrends() {
  const [activeTab, setActiveTab] = useState('chart');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // 最新の調査日時を取得
  useEffect(() => {
    const fetchLatestSurvey = async () => {
      try {
        const response = await surveyApi.getLatest();
        if (response.data && response.data.survey) {
          setLastUpdated(new Date(response.data.survey.surveyEndDate).toLocaleDateString('ja-JP'));
        }
        setIsLoading(false);
      } catch (err) {
        console.error('最新の調査結果取得に失敗しました:', err);
        setIsLoading(false);
      }
    };
    
    fetchLatestSurvey();
  }, []);

  // データ更新後にグラフを更新する
  const handleDataUpdate = async () => {
    try {
      setIsLoading(true);
      const response = await surveyApi.getLatest();
      if (response.data && response.data.survey) {
        setLastUpdated(new Date(response.data.survey.surveyEndDate).toLocaleDateString('ja-JP'));
        toast.success('データを更新しました');
      }
      
      // ブラウザリロードでグラフを更新
      window.location.reload();
      
      setIsLoading(false);
    } catch (err) {
      console.error('データの更新に失敗しました:', err);
      toast.error('データの更新に失敗しました');
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">政党支持率トレンド</h1>
          {lastUpdated && (
            <p className="text-muted-foreground mt-2">
              最終更新: {lastUpdated}
            </p>
          )}
        </div>
        <Button 
          onClick={handleDataUpdate} 
          className="mt-4 md:mt-0" 
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              更新中...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              データを更新
            </>
          )}
        </Button>
      </header>
      
      <Tabs defaultValue="chart" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="chart" className="text-base py-3">
            <BarChart2 className="mr-2 h-5 w-5" />
            グラフ
          </TabsTrigger>
          <TabsTrigger value="party" className="text-base py-3">
            <FileText className="mr-2 h-5 w-5" />
            政党登録
          </TabsTrigger>
          <TabsTrigger value="survey" className="text-base py-3">
            <BarChart className="mr-2 h-5 w-5" />
            調査結果登録
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chart">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800">
              <CardTitle>政党支持率推移</CardTitle>
              <CardDescription>
                各種世論調査における政党支持率の推移を表示しています
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <Skeleton className="w-full h-[600px]" />
              ) : (
                <div className="w-full h-[600px] overflow-hidden">
                  <PoliticalChart />
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">グラフの見方</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li>各色の線は政党ごとの支持率を表しています</li>
                  <li>凡例は画面下部に表示されています</li>
                  <li>マウスを線上に置くと詳細な数値が表示されます</li>
                  <li>最新の調査結果が右端に表示されています</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">データソース</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">このグラフは以下の報道機関の調査を元に作成しています：</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>NHK</li>
                  <li>読売新聞</li>
                  <li>朝日新聞</li>
                  <li>毎日新聞</li>
                  <li>共同通信</li>
                  <li>日経新聞</li>
                  <li>その他主要メディア</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">利用にあたって</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li>調査方法や対象者は各メディアにより異なります</li>
                  <li>サンプル数や調査期間などの詳細は各メディアの発表を参照してください</li>
                  <li>このツールは情報を集約するためのものであり、特定の政治的見解を示すものではありません</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="party">
          <Card>
            <CardHeader>
              <CardTitle>政党登録</CardTitle>
              <CardDescription>
                新しい政党を登録したり、既存の政党情報を編集できます
              </CardDescription>
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
                新しい世論調査の結果を登録したり、既存のデータを更新できます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SurveyRegistrationForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}