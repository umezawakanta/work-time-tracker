"use client";

import { useState, useEffect } from 'react';
import PoliticalTrendsCard from '@/components/chart/PoliticalTrendsCard';
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

  const handleDataUpdate = async () => {
    try {
      setIsLoading(true);
      const response = await surveyApi.getLatest();
      if (response.data && response.data.survey) {
        setLastUpdated(new Date(response.data.survey.surveyEndDate).toLocaleDateString('ja-JP'));
        toast.success('データを更新しました');
      }
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
            <p className="text-muted-foreground mt-2">最終更新: {lastUpdated}</p>
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
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />更新中...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />データを更新
            </>
          )}
        </Button>
      </header>
      
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
            <PoliticalTrendsCard />
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
              <CardDescription>新しい調査結果の登録・更新ができます</CardDescription>
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
