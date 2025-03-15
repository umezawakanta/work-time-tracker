import { useState, useCallback } from "react";
import { surveyApi } from "@/services/api/surveyApi";
import { partyApi } from "@/services/api/partyApi";
import { SupportRate, PoliticalParty, Survey } from "@/types/survey";
import { toast } from "react-hot-toast";

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

export const useSurveyData = () => {
  const [chartData, setChartData] = useState<Record<string, ChartDataPoint[]>>(
    {}
  );
  const [mediaList, setMediaList] = useState<string[]>([]);
  const [parties, setParties] = useState<PoliticalParty[]>([]);
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

      const partiesData = partiesResponse.data;
      setParties(partiesData);

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

        // 全メディアのリストを作成
        const allMedias = Array.from(mediaSet);

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
            partiesData.forEach((party) => {
              const monthData = monthlyAverageData[monthKey];
              const partyAverages: number[] = [];

              // すべてのメディアの同じ政党の平均を計算
              allMedias.forEach((media) => {
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
  }, []); 

  return {
    chartData,
    mediaList,
    parties,
    isLoading,
    missingData,
    fetchSurveyData
  };
};

export type { ChartDataPoint };