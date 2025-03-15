"use client";

import { useEffect, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { surveyApi } from "@/services/api/surveyApi";
import { partyApi } from "@/services/api/partyApi";
import { SupportRate, PoliticalParty, Survey } from "@/types/survey";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import { TooltipProps } from "recharts";

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    stroke: string;
    dataKey: string;
    color: string;
  }>;
  label?: string;
}

interface ChartDataPoint {
  surveyId: string;
  date: string;
  fullDate: string;
  monthDate?: string;
  mediaOutlet: string;
  [key: string]: string | number | undefined;
}

interface SurveyResponseData {
  surveys: (Survey & { mediaOutlet: string })[];
  supportRates: Array<
    SupportRate & {
      partyId: {
        _id: string;
        name: string;
        shortName: string;
      };
    }
  >;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 bg-opacity-90 p-4 rounded-lg shadow-xl border border-gray-700">
        <p className="text-lg font-bold text-white mb-3">{label}</p>
        <div className="flex flex-col gap-2">
          {payload.map((entry, index) => (
            <div
              key={`item-${index}`}
              className="flex justify-between items-center gap-4 text-gray-300"
            >
              <div className="flex items-center">
                <div
                  className="w-3 h-3 mr-2 rounded-full"
                  style={{ backgroundColor: entry.stroke }}
                />
                <span className="font-medium">{entry.name.split("(")[0]}</span>
              </div>
              <span className="font-bold text-base text-white">
                {entry.value ? `${entry.value.toFixed(1)}%` : "-"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const PoliticalChart = () => {
  const [chartData, setChartData] = useState<Record<string, ChartDataPoint[]>>(
    {}
  );
  const [mediaList, setMediaList] = useState<string[]>([]);
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const [activeMedia, setActiveMedia] = useState<string>("各社平均");
  const [isLoading, setIsLoading] = useState(true);
  const [missingData, setMissingData] = useState<{
    [media: string]: string[];
  }>({});

  const fetchSurveyData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [surveyResponse, partiesResponse] = await Promise.all([
        surveyApi.getAll(),
        partyApi.getAll(),
      ]);

      setParties(partiesResponse.data);

      const data = surveyResponse.data as unknown as SurveyResponseData;

      const mediaGroups: Record<string, ChartDataPoint[]> = {};
      const mediaSet = new Set<string>();

      // 月ごとのデータを集計するためのオブジェクト
      const monthlyAverageData: Record<string, Record<string, number[]>> = {};

      if (data.surveys && Array.isArray(data.surveys)) {
        data.surveys.forEach((survey) => {
          const mediaOutlet = survey.mediaOutlet || "未分類";
          mediaSet.add(mediaOutlet);

          // 調査の終了日から月を抽出
          const surveyDate = new Date(survey.surveyEndDate);
          const monthKey = surveyDate.toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "2-digit",
          });

          // 月ごとのデータ収集の準備
          if (!monthlyAverageData[monthKey]) {
            monthlyAverageData[monthKey] = {};
          }

          const surveyRates =
            data.supportRates?.filter((rate) => rate.surveyId === survey._id) ||
            [];

          surveyRates.forEach((rate) => {
            if (rate.partyId && rate.partyId.shortName) {
              const shortName = rate.partyId.shortName;
              const partyKey = `${shortName}_${mediaOutlet}`;

              // 月ごとのデータ収集
              if (!monthlyAverageData[monthKey][partyKey]) {
                monthlyAverageData[monthKey][partyKey] = [];
              }
              monthlyAverageData[monthKey][partyKey].push(rate.supportRate);
            }
          });
        });

        // 月ごとの平均値を計算
        const mediaGroupsWithAverage: Record<string, ChartDataPoint[]> = {
          各社平均: [],
        };

        Object.keys(monthlyAverageData)
          .sort()
          .forEach((monthKey) => {
            const monthDate = new Date(monthKey + "-01").toLocaleDateString(
              "ja-JP",
              {
                year: "numeric",
                month: "long",
              }
            );
            const averagePoint: ChartDataPoint = {
              surveyId: `avg-${monthKey}`,
              date: monthKey,
              fullDate: monthKey,
              monthDate: monthDate,
              mediaOutlet: "各社平均",
            };

            // 各政党の月平均を計算
            parties.forEach((party) => {
              const monthData = monthlyAverageData[monthKey];
              const partyAverages: number[] = [];

              // すべてのメディアの同じ政党の平均を計算
              mediaList
                .filter((media) => media !== "各社平均")
                .forEach((media) => {
                  const partyKey = `${party.shortName}_${media}`;
                  const values = monthData[partyKey] || [];
                  if (values.length > 0) {
                    const avg =
                      values.reduce((a, b) => a + b, 0) / values.length;
                    partyAverages.push(avg);
                  }
                });

              // 全メディアの平均を計算
              if (partyAverages.length > 0) {
                const finalAvg =
                  partyAverages.reduce((a, b) => a + b, 0) /
                  partyAverages.length;
                averagePoint[party.shortName] = parseFloat(finalAvg.toFixed(1));
              }
            });

            mediaGroupsWithAverage["各社平均"].push(averagePoint);
          });

        // 他のメディアのデータも同様に処理
        data.surveys.forEach((survey) => {
          const mediaOutlet = survey.mediaOutlet || "未分類";
          const surveyDate = new Date(survey.surveyEndDate);
          const monthKey = surveyDate.toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "2-digit",
          });

          if (!mediaGroups[mediaOutlet]) {
            mediaGroups[mediaOutlet] = [];
          }

          const monthDate = surveyDate.toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
          });

          const dataPoint: ChartDataPoint = {
            surveyId: survey._id,
            date: monthKey,
            fullDate: monthKey,
            monthDate: monthDate,
            mediaOutlet: mediaOutlet,
          };

          const surveyRates =
            data.supportRates?.filter((rate) => rate.surveyId === survey._id) ||
            [];

          surveyRates.forEach((rate) => {
            if (rate.partyId && rate.partyId.shortName) {
              const shortName = rate.partyId.shortName;
              const partyKey = `${shortName}_${mediaOutlet}`;
              dataPoint[partyKey] = rate.supportRate;
            }
          });

          mediaGroups[mediaOutlet].push(dataPoint);
        });

        // データを月でソート
        Object.keys(mediaGroups).forEach((media) => {
          mediaGroups[media].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA.getTime() - dateB.getTime();
          });
        });

        const mediaArray = Array.from(mediaSet);
        setMediaList(["各社平均", ...mediaArray]);
        setChartData({ ...mediaGroups, ...mediaGroupsWithAverage });
      }

      // 調査社と月の追跡
      const allMedias = Array.from(mediaSet);
      const missingDataMap: { [media: string]: string[] } = {};

      // 2024年9月から現在までの月を生成
      const startDate = new Date(2024, 8, 1); // 2024年9月
      const currentDate = new Date();
      const monthsList: string[] = [];

      while (startDate <= currentDate) {
        const monthKey = startDate.toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "2-digit",
        });
        monthsList.push(monthKey);
        startDate.setMonth(startDate.getMonth() + 1);
      }

      // 各メディアの調査月を追跡
      allMedias.forEach((media) => {
        const surveyMonths = new Set(
          data.surveys
            .filter((survey) => survey.mediaOutlet === media)
            .map((survey) =>
              new Date(survey.surveyEndDate).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "2-digit",
              })
            )
        );

        // 欠落している月を特定
        const missingMonths = monthsList.filter(
          (month) => !surveyMonths.has(month)
        );

        if (missingMonths.length > 0) {
          missingDataMap[media] = missingMonths;
        }
      });

      setMissingData(missingDataMap);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("データの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [mediaList, parties]);

  useEffect(() => {
    fetchSurveyData();
  }, [fetchSurveyData]);

  const generateLines = (mediaOutlet: string) => {
    if (!chartData[mediaOutlet] || chartData[mediaOutlet].length === 0) {
      return [];
    }

    const lines: JSX.Element[] = [];
    const data = chartData[mediaOutlet];

    // 表示順序を調整（支持率が高い順）
    const latestData = data[data.length - 1];
    const sortedParties = [...parties].sort((a, b) => {
      const aKey =
        mediaOutlet === "各社平均"
          ? a.shortName
          : `${a.shortName}_${mediaOutlet}`;
      const bKey =
        mediaOutlet === "各社平均"
          ? b.shortName
          : `${b.shortName}_${mediaOutlet}`;

      const aValue = (latestData[aKey] as number) || 0;
      const bValue = (latestData[bKey] as number) || 0;

      return bValue - aValue; // 降順
    });

    sortedParties.forEach((party) => {
      const partyKey =
        mediaOutlet === "各社平均"
          ? `${party.shortName}`
          : `${party.shortName}_${mediaOutlet}`;

      // 最新の支持率
      const latestValue = latestData[partyKey] as number;

      // 5%以上の政党にのみラベルを表示
      const shouldShowLabel =
        latestValue >= 3 ||
        party.shortName === "自民" ||
        party.shortName === "立民";

      lines.push(
        <Line
          key={`line-${partyKey}`}
          type="monotone"
          dataKey={partyKey}
          name={`${party.name}(${mediaOutlet})`}
          stroke={party.colorCode}
          strokeWidth={3}
          dot={{
            r: 6,
            strokeWidth: 2,
            fill: party.colorCode,
          }}
          activeDot={{
            r: 8,
            strokeWidth: 3,
            fill: party.colorCode,
          }}
          label={
            shouldShowLabel
              ? {
                  position: "top",
                  fill: party.colorCode,
                  fontSize: 14,
                  fontWeight: "bold",
                  formatter: (value: number) => `${value?.toFixed(1) || ""}%`,
                }
              : false
          }
        />
      );
    });
    return lines;
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[500px] rounded-lg" />;
  }

  // 欠落データを表示するコンポーネント
  const renderMissingDataAlert = () => {
    if (Object.keys(missingData).length === 0) return null;

    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
        <h3 className="text-yellow-700 font-bold mb-2">調査データの欠落情報</h3>
        {Object.entries(missingData).map(([media, months]) => (
          <div key={media} className="mb-2">
            <span className="font-semibold text-yellow-800">{media}</span>
            <span className="text-yellow-700 ml-2">
              未調査の月: {months.join(", ")}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full bg-black relative">
      {renderMissingDataAlert()}
      <Tabs value={activeMedia} onValueChange={setActiveMedia}>
        <div className="sticky top-0 z-10 bg-black">
          <TabsList className="mb-4 bg-gray-900 p-2 flex flex-wrap justify-center gap-2">
            {mediaList.map((media) => (
              <TabsTrigger
                key={media}
                value={media}
                className="px-4 py-2 text-base text-white data-[state=active]:bg-blue-600 
                           rounded-md flex-shrink-0 
                           hover:bg-gray-700 transition-colors duration-200"
              >
                {media}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {mediaList.map((media) => (
          <TabsContent
            key={media}
            value={media}
            className="px-2 w-full pt-4"
          >
            {chartData[media] && chartData[media].length > 0 ? (
              <div className="w-full overflow-x-auto overflow-y-visible h-[800px]">
                <div className="min-w-[800px] h-[750px]">
                  <ResponsiveContainer
                    width="100%"
                    height={700}
                  >
                    <LineChart
                      data={chartData[media]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 180 }}
                      className="bg-black"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#666"
                        strokeOpacity={0.3}
                      />
                      <XAxis
                        dataKey="monthDate"
                        className="text-foreground"
                        tick={{
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        axisLine={{ stroke: "#666", strokeWidth: 1.5 }}
                        tickLine={{ stroke: "#666" }}
                        angle={-45}
                        textAnchor="end"
                        tickMargin={25}
                        interval={0}
                      />
                      <YAxis
                        className="text-foreground"
                        tick={{
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        axisLine={{ stroke: "#666", strokeWidth: 1.5 }}
                        tickLine={{ stroke: "#666" }}
                        domain={[0, 50]}
                        tickCount={11}
                        label={{
                          value: "支持率 (%)",
                          angle: -90,
                          position: "insideLeft",
                          style: {
                            fontSize: 14,
                            fontWeight: 600,
                          },
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: "20px 10px",
                          fontSize: "16px",
                          fontWeight: "bold",
                        }}
                        formatter={(value) => value.split("(")[0]}
                      />
                      {generateLines(media)}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[450px] bg-black text-white">
                <p className="text-gray-400 text-lg">
                  このメディアのデータがありません
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PoliticalChart;