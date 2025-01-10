"use client";

import { useEffect, useState } from "react";
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
import { toast } from "react-hot-toast";

interface ChartDataPoint {
  surveyId: string;
  date: string;
  fullDate: string;
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

const PoliticalChart = () => {
  const [chartData, setChartData] = useState<Record<string, ChartDataPoint[]>>(
    {}
  );
  const [mediaList, setMediaList] = useState<string[]>([]);
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const [activeMedia, setActiveMedia] = useState<string>("各社平均");
  const [isLoading, setIsLoading] = useState(true);

  const fetchSurveyData = async () => {
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

      if (data.surveys && Array.isArray(data.surveys)) {
        data.surveys.forEach((survey) => {
          const mediaOutlet = survey.mediaOutlet || "未分類";
          mediaSet.add(mediaOutlet);

          const fullDate = new Date(survey.surveyEndDate).toLocaleDateString(
            "ja-JP",
            {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }
          );

          const dataPoint: ChartDataPoint = {
            surveyId: survey._id,
            date: new Date(survey.surveyEndDate).toISOString().split("T")[0], // ISO形式で正しい日付順にソート
            fullDate: fullDate,
            mediaOutlet: mediaOutlet,
          };

          const surveyRates =
            data.supportRates?.filter((rate) => rate.surveyId === survey._id) ||
            [];
          surveyRates.forEach((rate) => {
            if (rate.partyId && rate.partyId.shortName) {
              const partyKey = `${rate.partyId.shortName}_${mediaOutlet}`;
              dataPoint[partyKey] = rate.supportRate;
            }
          });

          if (!mediaGroups[mediaOutlet]) {
            mediaGroups[mediaOutlet] = [];
          }
          mediaGroups[mediaOutlet].push(dataPoint);
        });

        // 日付順に並べ替える
        Object.keys(mediaGroups).forEach((media) => {
          mediaGroups[media].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
        });

        const mediaArray = Array.from(mediaSet);
        setMediaList([...mediaArray, "各社平均"]);
        setChartData(mediaGroups);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("データの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveyData();
  }, []);

  const generateLines = (mediaOutlet: string) => {
    const lines: JSX.Element[] = [];
    parties.forEach((party) => {
      const partyKey =
        mediaOutlet === "各社平均"
          ? `${party.shortName}`
          : `${party.shortName}_${mediaOutlet}`;
      lines.push(
        <Line
          key={`line-${partyKey}`}
          type="monotone"
          dataKey={partyKey}
          name={`${party.name}(${mediaOutlet})`}
          stroke={
            party.shortName === "立憲民主党" ? "#1E90FF" : party.colorCode
          }
          strokeWidth={2}
          dot={true}
          label={{
            position: "top",
            fill:
              party.shortName === "立憲民主党" ? "#1E90FF" : party.colorCode,
            fontSize: 14,
            formatter: (value: number) => `${value.toFixed(1)}%`,
          }}
        />
      );
    });
    return lines;
  };

  if (isLoading) {
    return <div>データを読み込み中...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Tabs value={activeMedia} onValueChange={setActiveMedia}>
        <TabsList>
          {mediaList.map((media) => (
            <TabsTrigger key={media} value={media}>
              {media}
            </TabsTrigger>
          ))}
        </TabsList>
        {mediaList.map((media) => (
          <TabsContent key={media} value={media}>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart
                data={chartData[media] || []}
                margin={{ top: 20, right: 60, left: 40, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#666" />
                <XAxis
                  dataKey="fullDate"
                  stroke="#ddd"
                  tick={{ fill: "#ddd", fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis
                  stroke="#ddd"
                  tick={{ fill: "#ddd", fontSize: 12 }}
                  domain={[0, 50]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#222",
                    border: "1px solid #444",
                    color: "#fff",
                  }}
                />
                <Legend
                  wrapperStyle={{
                    position: "absolute",
                    top: 450, // グラフ下部に余裕を持たせる
                    padding: "10px 0",
                    color: "#ddd",
                    textAlign: "center",
                  }}
                />
                {generateLines(media)}
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PoliticalChart;
