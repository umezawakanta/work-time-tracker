import { useState, useCallback } from 'react';
import { surveyApi } from '@/services/api/surveyApi';
import { partyApi } from '@/services/api/partyApi';
import { SupportRate, PoliticalParty, Survey } from '@/types/survey';
import { toast } from 'react-hot-toast';

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

// モックデータを定義
const getMockData = () => {
  const mockParties: PoliticalParty[] = [
    { _id: '1', name: '自由民主党', shortName: '自民', colorCode: '#3498db' },
    { _id: '2', name: '立憲民主党', shortName: '立民', colorCode: '#e74c3c' },
    { _id: '3', name: '日本維新の会', shortName: '維新', colorCode: '#f39c12' },
    { _id: '4', name: '公明党', shortName: '公明', colorCode: '#2ecc71' },
    { _id: '5', name: '日本共産党', shortName: '共産', colorCode: '#e67e22' },
    { _id: '6', name: '国民民主党', shortName: '国民', colorCode: '#9b59b6' },
  ];

  const mockMediaList = [
    '各社平均',
    'NHK',
    '読売新聞',
    '朝日新聞',
    '毎日新聞',
    '日経新聞',
    '共同通信',
  ];

  // 2024年9月から現在までの月データを生成
  const generateMockChartData = (): Record<string, ChartDataPoint[]> => {
    const startDate = new Date(2024, 8, 1); // 2024年9月
    const currentDate = new Date();
    const chartData: Record<string, ChartDataPoint[]> = {};

    // 各メディアの初期化
    mockMediaList.forEach((media) => {
      chartData[media] = [];
    });

    let monthCounter = 0;
    while (startDate <= currentDate && monthCounter < 12) {
      const monthKey = `${startDate.getFullYear()}/${String(startDate.getMonth() + 1).padStart(2, '0')}`;
      const monthDate = startDate.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
      });

      // 各メディア（各社平均以外）のデータ
      mockMediaList.slice(1).forEach((media, mediaIndex) => {
        const dataPoint: ChartDataPoint = {
          surveyId: `${media}-${monthKey}`,
          date: monthKey,
          fullDate: monthKey,
          monthDate: monthDate,
          mediaOutlet: media,
        };

        // 各政党の支持率を生成（基準値 + ランダム変動）
        mockParties.forEach((party, partyIndex) => {
          const baseSupport = [35, 20, 12, 8, 5, 3][partyIndex] || 2; // 政党ごとの基準支持率
          const variation = (Math.random() - 0.5) * 6; // ±3%の変動
          const monthTrend = Math.sin(monthCounter * 0.5) * 2; // 季節変動
          const mediaVariation = (mediaIndex - 2) * 0.5; // メディア間の違い

          const supportRate = Math.max(
            0,
            Math.min(100, baseSupport + variation + monthTrend + mediaVariation)
          );

          dataPoint[`${party.shortName}_${media}`] = parseFloat(supportRate.toFixed(1));
        });

        chartData[media].push(dataPoint);
      });

      // 各社平均データ
      const averagePoint: ChartDataPoint = {
        surveyId: `avg-${monthKey}`,
        date: monthKey,
        fullDate: monthKey,
        monthDate: monthDate,
        mediaOutlet: '各社平均',
      };

      // 各政党の各社平均を計算
      mockParties.forEach((party) => {
        let totalSupport = 0;
        let mediaCount = 0;

        mockMediaList.slice(1).forEach((media) => {
          const mediaData = chartData[media];
          const latestData = mediaData[mediaData.length - 1];
          if (latestData && latestData[`${party.shortName}_${media}`]) {
            totalSupport += Number(latestData[`${party.shortName}_${media}`]);
            mediaCount++;
          }
        });

        if (mediaCount > 0) {
          averagePoint[party.shortName] = parseFloat((totalSupport / mediaCount).toFixed(1));
        }
      });

      chartData['各社平均'].push(averagePoint);

      startDate.setMonth(startDate.getMonth() + 1);
      monthCounter++;
    }

    return chartData;
  };

  return {
    parties: mockParties,
    mediaList: mockMediaList,
    chartData: generateMockChartData(),
    missingData: {},
  };
};

export const useSurveyData = () => {
  const [chartData, setChartData] = useState<Record<string, ChartDataPoint[]>>({});
  const [mediaList, setMediaList] = useState<string[]>([]);
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [missingData, setMissingData] = useState<{ [media: string]: string[] }>({});

  const fetchSurveyData = useCallback(async () => {
    try {
      setIsLoading(true);

      // まずは実際のAPIを試行
      let surveyResponse = null;
      let partiesResponse = null;
      let hasApiError = false;

      try {
        surveyResponse = await surveyApi.getAll();
      } catch (error) {
        hasApiError = true;
        console.warn('Survey API failed:', error);
      }

      try {
        partiesResponse = await partyApi.getAll();
      } catch (error) {
        hasApiError = true;
        console.warn('Party API failed:', error);
      }

      // APIレスポンスの検証
      const isValidSurveyResponse =
        surveyResponse &&
        surveyResponse.data &&
        typeof surveyResponse.data === 'object' &&
        !surveyResponse.data.toString().includes('<!doctype html>');

      const isValidPartiesResponse =
        partiesResponse && partiesResponse.data && Array.isArray(partiesResponse.data);

      if (isValidSurveyResponse && isValidPartiesResponse) {
        // 実際のAPIデータを使用
        const partiesData = partiesResponse!.data;
        setParties(partiesData);

        const data = surveyResponse!.data as unknown as SurveyResponseData;

        const mediaGroups: Record<string, ChartDataPoint[]> = {};
        const mediaSet = new Set<string>();

        // 月ごとのデータを集計するためのオブジェクト
        const monthlyAverageData: Record<string, Record<string, number[]>> = {};

        if (data.surveys && Array.isArray(data.surveys)) {
          data.surveys.forEach((survey) => {
            const mediaOutlet = survey.mediaOutlet || '未分類';
            mediaSet.add(mediaOutlet);

            // 調査の終了日から月を抽出
            const surveyDate = new Date(survey.surveyEndDate);
            const monthKey = surveyDate.toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
            });

            // 月ごとのデータ収集の準備
            if (!monthlyAverageData[monthKey]) {
              monthlyAverageData[monthKey] = {};
            }

            const surveyRates =
              data.supportRates?.filter((rate) => rate.surveyId === survey._id) || [];

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
              const monthDate = new Date(monthKey + '-01').toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
              });
              const averagePoint: ChartDataPoint = {
                surveyId: `avg-${monthKey}`,
                date: monthKey,
                fullDate: monthKey,
                monthDate: monthDate,
                mediaOutlet: '各社平均',
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
                    const avg = values.reduce((a, b) => a + b, 0) / values.length;
                    partyAverages.push(avg);
                  }
                });

                // 全メディアの平均を計算
                if (partyAverages.length > 0) {
                  const finalAvg = partyAverages.reduce((a, b) => a + b, 0) / partyAverages.length;
                  averagePoint[party.shortName] = parseFloat(finalAvg.toFixed(1));
                }
              });

              mediaGroupsWithAverage['各社平均'].push(averagePoint);
            });

          // 他のメディアのデータも同様に処理
          data.surveys.forEach((survey) => {
            const mediaOutlet = survey.mediaOutlet || '未分類';
            const surveyDate = new Date(survey.surveyEndDate);
            const monthKey = surveyDate.toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
            });

            if (!mediaGroups[mediaOutlet]) {
              mediaGroups[mediaOutlet] = [];
            }

            const monthDate = surveyDate.toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
            });

            const dataPoint: ChartDataPoint = {
              surveyId: survey._id,
              date: monthKey,
              fullDate: monthKey,
              monthDate: monthDate,
              mediaOutlet: mediaOutlet,
            };

            const surveyRates =
              data.supportRates?.filter((rate) => rate.surveyId === survey._id) || [];

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
          setMediaList(['各社平均', ...mediaArray]);
          setChartData({ ...mediaGroups, ...mediaGroupsWithAverage });

          // 調査社と月の追跡
          const missingDataMap: { [media: string]: string[] } = {};

          // 2024年9月から現在までの月を生成
          const startDate = new Date(2024, 8, 1); // 2024年9月
          const currentDate = new Date();
          const monthsList: string[] = [];

          while (startDate <= currentDate) {
            const monthKey = startDate.toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
            });
            monthsList.push(monthKey);
            startDate.setMonth(startDate.getMonth() + 1);
          }

          // 各メディアの調査月を追跡
          mediaArray.forEach((media) => {
            const surveyMonths = new Set(
              data.surveys
                .filter((survey) => survey.mediaOutlet === media)
                .map((survey) =>
                  new Date(survey.surveyEndDate).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                  })
                )
            );

            // 欠落している月を特定
            const missingMonths = monthsList.filter((month) => !surveyMonths.has(month));

            if (missingMonths.length > 0) {
              missingDataMap[media] = missingMonths;
            }
          });

          setMissingData(missingDataMap);
        } else {
          throw new Error('Invalid survey data structure');
        }
      } else {
        // APIが利用できない場合はモックデータを使用
        if (hasApiError) {
          console.warn('API error, falling back to mock data for political trends');
          const mockData = getMockData();

          setParties(mockData.parties);
          setMediaList(mockData.mediaList);
          setChartData(mockData.chartData);
          setMissingData(mockData.missingData);

          toast.error('APIエラーのため、デモデータを表示しています');
        } else {
          console.warn('API unavailable, using mock data for political trends');
          const mockData = getMockData();

          setParties(mockData.parties);
          setMediaList(mockData.mediaList);
          setChartData(mockData.chartData);
          setMissingData(mockData.missingData);

          toast.success('デモデータを表示しています');
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);

      // エラー時はモックデータにフォールバック
      console.warn('Falling back to mock data due to error');
      const mockData = getMockData();

      setParties(mockData.parties);
      setMediaList(mockData.mediaList);
      setChartData(mockData.chartData);
      setMissingData(mockData.missingData);

      toast.error('APIエラーのため、デモデータを表示しています');
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
    fetchSurveyData,
  };
};

export type { ChartDataPoint };
