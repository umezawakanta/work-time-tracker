'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useSurveyData } from './hooks/useSurveyData';
import MissingDataAlert from '@/components/MissingDataAlert';
import ChartControls from '@/components/ChartControls';
import PoliticalLineChart from '@/components/chart/PoliticalLineChart';
import ChartLegend from '@/components/chart/ChartLegend';
import TimeRangeSelector from '@/components/chart/TimeRangeSelector';
import ChartToolbar from '@/components/chart/ChartToolbar';
import CompareOverlay from '@/components/chart/CompareOverlay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import './PoliticalChart.css'; // CSSファイルをインポート

// 日付範囲の型
type DateRange = '1M' | '3M' | '6M' | '1Y' | 'MAX';

const PoliticalChart = () => {
  const { chartData, mediaList, parties, isLoading, missingData, fetchSurveyData } =
    useSurveyData();
  const [activeMedia, setActiveMedia] = useState<string>('各社平均');
  const [dateRange, setDateRange] = useState<DateRange>('MAX'); // デフォルトを全期間に変更
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
  const [showCompareMode, setShowCompareMode] = useState(false);
  const [compareTarget, setCompareTarget] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [highlightedParties, setHighlightedParties] = useState<string[]>([]);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>(new Date().toLocaleString());

  // データのフィルタリング
  const filteredData = useCallback(() => {
    if (!chartData[activeMedia]) return [];

    // 日付範囲に基づいてデータをフィルタリング
    const now = new Date();
    const filterDate = (() => {
      const date = new Date(now);

      switch (dateRange) {
        case '1M':
          date.setMonth(now.getMonth() - 1);
          break;
        case '3M':
          date.setMonth(now.getMonth() - 3);
          break;
        case '6M':
          date.setMonth(now.getMonth() - 6);
          break;
        case '1Y':
          date.setFullYear(now.getFullYear() - 1);
          break;
        case 'MAX':
          return null;
      }

      return date;
    })();

    if (filterDate === null) {
      return chartData[activeMedia];
    }

    return chartData[activeMedia].filter((point) => {
      const pointDate = new Date(point.date);
      return pointDate >= filterDate;
    });
  }, [chartData, activeMedia, dateRange]);

  // URLからパラメータを読み取って初期状態を設定
  useEffect(() => {
    const url = new URL(window.location.href);
    const mediaParam = url.searchParams.get('media');
    const rangeParam = url.searchParams.get('range') as DateRange | null;

    if (mediaParam && mediaList.includes(mediaParam)) {
      setActiveMedia(mediaParam);
    }

    if (rangeParam && ['1M', '3M', '6M', '1Y', 'MAX'].includes(rangeParam)) {
      setDateRange(rangeParam);
    }
  }, [mediaList]);

  useEffect(() => {
    fetchSurveyData();
    setLastUpdateTime(new Date().toLocaleString());
  }, [fetchSurveyData]);

  // 自動更新の設定
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchSurveyData();
        setLastUpdateTime(new Date().toLocaleString());
      }, 300000); // 5分ごとに更新
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, fetchSurveyData]);

  // フルスクリーン切替
  const toggleFullscreen = () => {
    if (!chartRef.current) return;

    if (!document.fullscreenElement) {
      chartRef.current.requestFullscreen().catch((err) => {
        console.error(`フルスクリーンの切り替えに失敗しました: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // 画像としてダウンロード
  const downloadAsImage = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2, // 解像度を2倍に
        backgroundColor: null,
        logging: false,
      });
      canvas.toBlob(
        (blob) => {
          if (blob) {
            saveAs(blob, `政党支持率_${activeMedia}_${new Date().toISOString().slice(0, 10)}.png`);
          }
        },
        'image/png',
        1.0
      );
    } catch (error) {
      console.error('画像の生成に失敗しました', error);
    }
  };

  // CSVとしてダウンロード
  const downloadAsCSV = () => {
    if (!chartData[activeMedia]) return;

    const headers = ['日付'];
    const relevantParties = parties.filter((party) => {
      // データ内に政党のデータが存在するか確認
      return chartData[activeMedia].some((point) => {
        const key =
          activeMedia === '各社平均' ? party.shortName : `${party.shortName}_${activeMedia}`;
        return point[key] !== undefined;
      });
    });

    relevantParties.forEach((party) => headers.push(party.name));

    const csvRows = [headers.join(',')];

    chartData[activeMedia].forEach((point) => {
      const row = [point.fullDate];
      relevantParties.forEach((party) => {
        const key =
          activeMedia === '各社平均' ? party.shortName : `${party.shortName}_${activeMedia}`;
        row.push(point[key] !== undefined ? point[key]?.toString() : '');
      });
      csvRows.push(row.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `政党支持率_${activeMedia}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // URLを共有
  const shareUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('media', activeMedia);
    url.searchParams.set('range', dateRange);

    // ハイライト中の政党があれば、URLに追加
    if (highlightedParties.length > 0) {
      url.searchParams.set('highlight', highlightedParties.join(','));
    } else {
      url.searchParams.delete('highlight');
    }

    navigator.clipboard.writeText(url.toString());

    // トースト通知用の実装
    const notification = document.createElement('div');
    notification.textContent = 'URLをクリップボードにコピーしました';
    notification.className = 'notification';

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('fade-out');

      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 2000);
  };

  // ハイライト切替
  const togglePartyHighlight = (partyShortName: string) => {
    setHighlightedParties((prev) => {
      if (prev.includes(partyShortName)) {
        return prev.filter((p) => p !== partyShortName);
      } else {
        return [...prev, partyShortName];
      }
    });
  };

  // 全政党ハイライトをリセット
  const resetHighlights = () => {
    setHighlightedParties([]);
  };

  // データの統計情報を計算
  const getPartyStats = (partyShortName: string) => {
    if (!chartData[activeMedia]) return { current: 0, change: 0, max: 0, min: 0 };

    const filteredPoints = filteredData();
    if (filteredPoints.length === 0) return { current: 0, change: 0, max: 0, min: 0 };

    const key = activeMedia === '各社平均' ? partyShortName : `${partyShortName}_${activeMedia}`;

    // 現在値（最新）
    const current = Number(filteredPoints[filteredPoints.length - 1][key] || 0);

    // 前回からの変化
    const previous =
      filteredPoints.length > 1
        ? Number(filteredPoints[filteredPoints.length - 2][key] || 0)
        : current;
    const change = current - previous;

    // 期間内の最大・最小値
    const values = filteredPoints
      .map((point) => {
        const value = point[key];
        return typeof value === 'string' ? parseFloat(value) : value || 0;
      })
      .filter((val) => val !== 0);

    const max = values.length > 0 ? Math.max(...values) : 0;
    const min = values.length > 0 ? Math.min(...values) : 0;

    return { current, change, max, min };
  };

  if (isLoading) {
    return (
      <Card className="w-full shadow-lg border rounded-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-bold">政党支持率データ読み込み中</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="w-full h-[60px] rounded-lg" />
            <Skeleton className="w-full h-[500px] rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="w-1/4 h-[30px] rounded-lg" />
              <Skeleton className="w-1/4 h-[30px] rounded-lg" />
              <Skeleton className="w-1/4 h-[30px] rounded-lg" />
              <Skeleton className="w-1/4 h-[30px] rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-card overflow-hidden border shadow-lg rounded-lg transition-all duration-300">
      <CardHeader className="pb-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold">日本政党支持率トラッカー</CardTitle>
            <p className="text-sm text-muted-foreground">
              各社世論調査に基づく政党支持率の推移を可視化
            </p>
          </div>
          <ChartToolbar
            onDownloadImage={downloadAsImage}
            onDownloadCSV={downloadAsCSV}
            onShare={shareUrl}
            onToggleFullscreen={toggleFullscreen}
            onChangeChartType={(type) => setChartType(type as 'line' | 'bar' | 'pie')}
            chartType={chartType}
            isFullscreen={isFullscreen}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
          <TimeRangeSelector
            selectedRange={dateRange}
            onChange={(range) => setDateRange(range as DateRange)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant={showCompareMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowCompareMode(!showCompareMode)}
              className="text-sm"
            >
              メディア比較
            </Button>
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="text-sm"
            >
              {autoRefresh ? '自動更新中' : '自動更新'}
            </Button>
            {highlightedParties.length > 0 && (
              <Button variant="outline" size="sm" onClick={resetHighlights} className="text-sm">
                ハイライト解除
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative" ref={chartRef}>
        <div className="w-full bg-card relative">
          <MissingDataAlert missingData={missingData} />
          <Tabs value={activeMedia} onValueChange={setActiveMedia}>
            <ChartControls mediaList={mediaList} activeMedia={activeMedia} />

            {mediaList.map((media) => (
              <TabsContent key={media} value={media} className="px-2 w-full pt-4">
                {chartData[media] && chartData[media].length > 0 ? (
                  <div className="relative">
                    <PoliticalLineChart
                      data={filteredData()}
                      parties={parties}
                      mediaOutlet={media}
                      chartType={chartType}
                      highlightedParties={highlightedParties}
                    />

                    {/* 統計サマリー */}
                    {highlightedParties.length > 0 && (
                      <div className="mt-2 p-4 bg-muted/30 rounded-lg">
                        <h3 className="text-sm font-medium mb-2">ハイライト政党の統計</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {highlightedParties.map((partyId) => {
                            const party = parties.find((p) => p.shortName === partyId);
                            const stats = getPartyStats(partyId);
                            if (!party) return null;

                            return (
                              <div
                                key={partyId}
                                className="flex items-center gap-2 p-2 rounded-md bg-background"
                              >
                                <div
                                  className="party-color-indicator"
                                  ref={(el) => {
                                    if (el) {
                                      el.style.setProperty('--party-color', party.colorCode);
                                    }
                                  }}
                                />
                                <div>
                                  <div className="font-medium">{party.name}</div>
                                  <div className="text-sm grid grid-cols-2 gap-x-4">
                                    <span>現在: {stats.current.toFixed(1)}%</span>
                                    <span
                                      className={
                                        stats.change > 0
                                          ? 'text-green-500'
                                          : stats.change < 0
                                            ? 'text-red-500'
                                            : ''
                                      }
                                    >
                                      {stats.change > 0 ? '+' : ''}
                                      {stats.change.toFixed(1)}%
                                    </span>
                                    <span>最大: {stats.max.toFixed(1)}%</span>
                                    <span>最小: {stats.min.toFixed(1)}%</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {showCompareMode && (
                      <CompareOverlay
                        mediaList={mediaList.filter((m) => m !== media)}
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
                    <p className="text-muted-foreground text-lg mb-4">
                      {media}のデータがありません
                    </p>
                    <Button variant="outline" onClick={() => setActiveMedia('各社平均')}>
                      各社平均に戻る
                    </Button>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 p-4 border-t">
        <ChartLegend
          parties={parties}
          onToggleHighlight={togglePartyHighlight}
          highlightedParties={highlightedParties}
        />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full text-sm text-muted-foreground">
          <p>最終更新: {lastUpdateTime}</p>
          <p>
            データ提供: 各メディア世論調査 |
            <a href="#" className="ml-1 underline">
              データについて
            </a>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PoliticalChart;
