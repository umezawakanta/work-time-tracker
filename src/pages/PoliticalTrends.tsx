"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Download, Info, Share2, ThumbsUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import PoliticalChart from "@/components/chart/PoliticalChart";
import SummaryView from "@/components/chart/SummaryView";

// サンプルデータ
const summaryData = [
  {
    party: "自由民主党",
    colorCode: "#00ff00",
    currentSupport: 36.5,
    previousSupport: 38.2,
    change: -1.7,
    trend: "down" as const,
    rank: 1
  },
  {
    party: "立憲民主党",
    colorCode: "#0612b1",
    currentSupport: 12.8,
    previousSupport: 10.1,
    change: 2.7,
    trend: "up" as const,
    rank: 2
  },
  {
    party: "維新の会",
    colorCode: "#ff6600",
    currentSupport: 9.3,
    previousSupport: 9.5,
    change: -0.2,
    trend: "stable" as const,
    rank: 3
  },
  {
    party: "共産党",
    colorCode: "#d50000",
    currentSupport: 5.7,
    previousSupport: 5.5,
    change: 0.2,
    trend: "stable" as const,
    rank: 4
  },
  {
    party: "国民民主党",
    colorCode: "#edf10e",
    currentSupport: 4.3,
    previousSupport: 3.1,
    change: 1.2,
    trend: "up" as const,
    rank: 5
  },
  {
    party: "公明党",
    colorCode: "#7ed957",
    currentSupport: 3.8,
    previousSupport: 4.1,
    change: -0.3,
    trend: "down" as const,
    rank: 6
  },
];

const PoliticalTrends = () => {
  const [view, setView] = useState<"chart" | "summary">("chart");
  const [showInfo, setShowInfo] = useState(false);
  const [timeframe, setTimeframe] = useState("2024");
  
  // URLを共有する関数
  const shareUrl = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        alert("URLをクリップボードにコピーしました");
      })
      .catch((error) => {
        console.error("共有に失敗しました:", error);
      });
  };
  
  return (
    <Card className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 border-b">
        <div className="space-y-1.5">
          <CardTitle className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
            政党支持率推移
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => setShowInfo(!showInfo)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>データについての詳細情報を表示します</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <p className="text-sm text-muted-foreground max-w-2xl">
            各種世論調査における政党支持率の推移を表示しています。複数の調査機関による調査結果を収集・集計しています。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as "chart" | "summary")}>
            <TabsList>
              <TabsTrigger value="chart">グラフ表示</TabsTrigger>
              <TabsTrigger value="summary">サマリー</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select 
            value={timeframe} 
            onValueChange={setTimeframe}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="表示期間" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024年</SelectItem>
              <SelectItem value="2023">2023年</SelectItem>
              <SelectItem value="all">全期間</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      {showInfo && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b">
          <h3 className="font-medium mb-2">データソースについて</h3>
          <p className="text-sm mb-2">
            このグラフは各メディアが発表した世論調査結果をまとめたものです。調査手法や回答者数は各社で異なるため、単純な比較はできない場合があります。
          </p>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <h4 className="text-sm font-medium mb-1">調査メディア</h4>
              <ul className="text-xs space-y-1">
                <li>・NHK</li>
                <li>・時事通信</li>
                <li>・読売新聞</li>
                <li>・朝日新聞</li>
                <li>・毎日新聞</li>
                <li>・共同通信</li>
                <li>・日経新聞・テレビ東京</li>
                <li>・産経新聞・FNN</li>
                <li>・JNN</li>
                <li>・ANN</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">更新履歴</h4>
              <ul className="text-xs space-y-1">
                <li>・2025/03/15 3月調査データ追加</li>
                <li>・2025/02/15 2月調査データ追加</li>
                <li>・2025/01/15 1月調査データ追加</li>
                <li>・2024/12/15 12月調査データ追加</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <CardContent className="p-0">
        <div className={`w-full transition-all duration-300 ease-in-out ${view === "chart" ? "h-[600px]" : "h-auto"} overflow-hidden`}>
          {view === "chart" ? (
            <PoliticalChart />
          ) : (
            <SummaryView data={summaryData} />
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between p-4 bg-gray-50 dark:bg-gray-800 border-t">
        <div className="flex items-center text-sm text-muted-foreground">
          <p>データ提供: 各メディア世論調査 © 2025</p>
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  データ取得
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>CSVでダウンロード</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={shareUrl}>
                  <Share2 className="h-4 w-4 mr-2" />
                  共有
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>URLをコピー</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button variant="default" size="sm">
            <ThumbsUp className="h-4 w-4 mr-2" />
            役に立った
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PoliticalTrends;