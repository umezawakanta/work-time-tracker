'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PoliticalChart from './PoliticalChart';
import SummaryView from './SummaryView';

interface SummaryDataItem {
  party: string;
  colorCode: string;
  currentSupport: number;
  previousSupport: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  rank: number;
}

const summaryData: SummaryDataItem[] = [];

const PoliticalTrendsCard = () => {
  const [view, setView] = useState('chart');

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 dark:bg-gray-800 flex flex-row justify-between items-center">
        <div>
          <CardTitle>政党支持率推移</CardTitle>
          <CardDescription>各種世論調査における政党支持率の推移を表示しています</CardDescription>
        </div>
        <Tabs value={view} onValueChange={setView}>
          <TabsList>
            <TabsTrigger value="chart">グラフ表示</TabsTrigger>
            <TabsTrigger value="summary">サマリー</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="p-0">
        <div className="w-full min-h-[600px] overflow-hidden">
          {view === 'chart' ? <PoliticalChart /> : <SummaryView data={summaryData} />}
        </div>
      </CardContent>
    </Card>
  );
};

export default PoliticalTrendsCard;
