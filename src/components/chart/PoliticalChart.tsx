"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useSurveyData } from "./hooks/useSurveyData";
import MissingDataAlert from "@/components/MissingDataAlert";
import ChartControls from "@/components/ChartControls";
import PoliticalLineChart from "@/components/chart/PoliticalLineChart";
import ChartLegend from "@/components/chart/ChartLegend";
import TimeRangeSelector from "@/components/chart/TimeRangeSelector";
import ChartToolbar from "@/components/chart/ChartToolbar";
import CompareOverlay from "@/components/chart/CompareOverlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

// 日付範囲の型
type DateRange = "1M" | "3M" | "6M" | "1Y" | "MAX";

const PoliticalChart = () => {
  const { chartData, mediaList, parties, isLoading, missingData, fetchSurveyData } = useSurveyData();
  const [activeMedia, setActiveMedia] = useState<string>("各社平均");
  const [dateRange, setDateRange] = useState<DateRange>("6M");
  const [chartType, setChartType] = useState<"line" | "bar" | "pie">("line");
  const [showCompareMode, setShowCompareMode] = useState(false);
  const [compareTarget, setCompareTarget] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [highlightedParties, setHighlightedParties] = useState<string[]>([]);
  const chartRef = useRef<HTMLDivElement | null>(null);

  // データのフィルタリング
  const filteredData = useCallback(() => {
    if (!chartData[activeMedia]) return [];
    
    // 日付範囲に基づいてデータをフィルタリング
    const now = new Date();
    const filterDate = (() => {
      const date = new Date(now);
      
      switch (dateRange) {
        case "1M":
          date.setMonth(now.getMonth() - 1);
          break;
        case "3M":
          date.setMonth(now.getMonth() - 3);
          break;
        case "6M":
          date.setMonth(now.getMonth() - 6);
          break;
        case "1Y":
          date.setFullYear(now.getFullYear() - 1);
          break;
        case "MAX":
          return null;
      }
      
      return date;
    })();
    
    if (filterDate === null) {
      return chartData[activeMedia];
    }
    
    return chartData[activeMedia].filter(point => {
      const pointDate = new Date(point.date);
      return pointDate >= filterDate;
    });
  }, [chartData, activeMedia, dateRange]);

  useEffect(() => {
    fetchSurveyData();
  }, [fetchSurveyData]);

  // フルスクリーン切替
  const toggleFullscreen = () => {
    if (!chartRef.current) return;
  
    if (!document.fullscreenElement) {
      chartRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // 画像としてダウンロード
  const downloadAsImage = async () => {
    if (!chartRef.current) return;
    
    try {
      const canvas = await html2canvas(chartRef.current);
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `政党支持率_${activeMedia}_${new Date().toISOString().slice(0, 10)}.png`);
        }
      });
    } catch (error) {
      console.error("画像の生成に失敗しました", error);
    }
  };

  // CSVとしてダウンロード
  const downloadAsCSV = () => {
    if (!chartData[activeMedia]) return;
    
    const headers = ["日付"];
    const relevantParties = parties.filter(party => {
      // データ内に政党のデータが存在するか確認
      return chartData[activeMedia].some(point => {
        const key = activeMedia === "各社平均" ? party.shortName : `${party.shortName}_${activeMedia}`;
        return point[key] !== undefined;
      });
    });
    
    relevantParties.forEach(party => headers.push(party.name));
    
    const csvRows = [headers.join(",")];
    
    chartData[activeMedia].forEach(point => {
      const row = [point.fullDate];
      relevantParties.forEach(party => {
        const key = activeMedia === "各社平均" ? party.shortName : `${party.shortName}_${activeMedia}`;
        row.push(point[key] !== undefined ? point[key]?.toString() : "");
      });
      csvRows.push(row.join(","));
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `政党支持率_${activeMedia}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // URLを共有
  const shareUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("media", activeMedia);
    url.searchParams.set("range", dateRange);
    navigator.clipboard.writeText(url.toString());
    alert("URLをクリップボードにコピーしました");
  };

  // ハイライト切替
  const togglePartyHighlight = (partyShortName: string) => {
    setHighlightedParties(prev => {
      if (prev.includes(partyShortName)) {
        return prev.filter(p => p !== partyShortName);
      } else {
        return [...prev, partyShortName];
      }
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>政党支持率データ読み込み中</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-[500px] rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-card overflow-hidden border">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">政党支持率グラフ</CardTitle>
          <ChartToolbar 
            onDownloadImage={downloadAsImage}
            onDownloadCSV={downloadAsCSV}
            onShare={shareUrl}
            onToggleFullscreen={toggleFullscreen}
            onChangeChartType={(type) => setChartType(type as "line" | "bar" | "pie")}
            chartType={chartType}
            isFullscreen={isFullscreen}
          />
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <TimeRangeSelector 
            selectedRange={dateRange}
            onChange={(range) => setDateRange(range as DateRange)}
          />
          <div className="flex gap-2">
            <Button 
              variant={showCompareMode ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowCompareMode(!showCompareMode)}
            >
              比較モード
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 relative" ref={chartRef}>
      <div className="w-full bg-card relative">
          <MissingDataAlert missingData={missingData} />
          <Tabs value={activeMedia} onValueChange={setActiveMedia}>
            <ChartControls mediaList={mediaList} activeMedia={activeMedia} />

            {mediaList.map((media) => (
              <TabsContent
                key={media}
                value={media}
                className="px-2 w-full pt-4"
              >
                {chartData[media] && chartData[media].length > 0 ? (
                  <div className="relative">
                    <PoliticalLineChart 
                      data={filteredData()} 
                      parties={parties} 
                      mediaOutlet={media}
                      chartType={chartType}
                      highlightedParties={highlightedParties}
                    />
                    
                    {showCompareMode && (
                      <CompareOverlay 
                        mediaList={mediaList.filter(m => m !== media)}
                        activeMedia={media}
                        selectedMedia={compareTarget}
                        onSelectMedia={setCompareTarget}
                        onClose={() => {
                          setShowCompareMode(false);
                          setCompareTarget(null);
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[450px] bg-card text-card-foreground">
                    <p className="text-gray-400 text-lg mb-4">
                      このメディアのデータがありません
                    </p>
                    <Button variant="outline" onClick={() => setActiveMedia("各社平均")}>
                      各社平均に戻る
                    </Button>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-t gap-4">
        <ChartLegend 
          parties={parties}
          onToggleHighlight={togglePartyHighlight}
          highlightedParties={highlightedParties}
        />
        
        <div className="flex items-center text-sm text-muted-foreground">
          <p>
            最終更新: {new Date().toLocaleDateString()} / 
            データ提供: 各メディア世論調査データ
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PoliticalChart;