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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-hot-toast";

interface ChartDataPoint {
  surveyId: string;
  date: string;
  mediaOutlet: string;
  [key: string]: string | number;
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
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeMedia, setActiveMedia] = useState<string>("");
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

      // メディアごとにデータを整理
      const mediaGroups: Record<string, ChartDataPoint[]> = {};
      const mediaSet = new Set<string>();

      if (data.surveys && Array.isArray(data.surveys)) {
        data.surveys.forEach((survey) => {
          const mediaOutlet = survey.mediaOutlet || "未分類";
          mediaSet.add(mediaOutlet);

          const dataPoint: ChartDataPoint = {
            surveyId: survey._id,
            date: new Date(survey.surveyEndDate)
              .toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "2-digit",
              })
              .replace("/", "/"),
            mediaOutlet: mediaOutlet,
          };

          const surveyRates =
            data.supportRates?.filter((rate) => rate.surveyId === survey._id) ||
            [];
          surveyRates.forEach((rate) => {
            if (rate.partyId && rate.partyId.shortName) {
              // メディア別の政党支持率のキーを生成
              const partyKey = `${rate.partyId.shortName}_${mediaOutlet}`;
              dataPoint[partyKey] = rate.supportRate;
            }
          });

          if (!mediaGroups[mediaOutlet]) {
            mediaGroups[mediaOutlet] = [];
          }
          mediaGroups[mediaOutlet].push(dataPoint);
        });

        // 各メディアのデータを日付順にソート
        Object.keys(mediaGroups).forEach((media) => {
          mediaGroups[media].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
        });

        const mediaArray = Array.from(mediaSet);
        setMediaList(mediaArray);
        setChartData(mediaGroups);
        if (mediaArray.length > 0) {
          setActiveMedia(mediaArray[0]);
        }
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

  const handleDataClick = (data: ChartDataPoint) => {
    setSelectedSurveyId(data.surveyId);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedSurveyId) return;

    try {
      await surveyApi.deleteSurvey(selectedSurveyId);
      toast.success("データを削除しました");
      await fetchSurveyData();
      setIsEditDialogOpen(false);
    } catch {
      toast.error("データの削除に失敗しました");
    }
  };

  const selectedData = Object.values(chartData)
    .flat()
    .find((data) => data.surveyId === selectedSurveyId);

  // メディアと政党の組み合わせごとの線を生成
  const generateLines = (mediaOutlet: string) => {
    const lines: JSX.Element[] = [];
    parties.forEach((party) => {
      const partyKey = `${party.shortName}_${mediaOutlet}`;
      lines.push(
        <Line
          key={`line-${partyKey}`}
          type="monotone"
          dataKey={partyKey}
          name={`${party.name}(${mediaOutlet})`}
          stroke={party.colorCode}
          strokeDasharray={mediaOutlet === "NHK" ? "" : "5 5"} // NHK以外は破線
          dot={true}
          label={{
            position: "top",
            fill: party.colorCode,
            fontSize: 12,
            formatter: (value: number) => `${value}%`,
          }}
        />
      );
    });
    return lines;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[600px]">
        データを読み込み中...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {mediaList.length === 0 ? (
        <div className="flex justify-center items-center h-[600px]">
          データがありません。調査結果を登録してください。
        </div>
      ) : (
        <div className="space-y-4">
          <Tabs
            defaultValue={activeMedia}
            value={activeMedia}
            onValueChange={setActiveMedia}
          >
            <TabsList className="bg-black/20">
              {mediaList.map((media) => (
                <TabsTrigger
                  key={`trigger-${media}`}
                  value={media}
                  className="data-[state=active]:bg-primary"
                >
                  {media}
                </TabsTrigger>
              ))}
            </TabsList>
            {mediaList.map((media) => (
              <TabsContent key={`content-${media}`} value={media}>
                <div className="w-full h-[600px] bg-black p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData[media] || []}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                      onClick={(e) =>
                        e?.activePayload &&
                        handleDataClick(
                          e.activePayload[0].payload as ChartDataPoint
                        )
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis
                        dataKey="date"
                        stroke="#fff"
                        tick={{ fill: "#fff" }}
                      />
                      <YAxis
                        stroke="#fff"
                        tick={{ fill: "#fff" }}
                        domain={[0, 35]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#333",
                          border: "1px solid #666",
                          color: "#fff",
                        }}
                      />
                      <Legend wrapperStyle={{ color: "#fff" }} />
                      {generateLines(media)}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>データ編集</DialogTitle>
          </DialogHeader>
          {selectedData && (
            <div className="space-y-4">
              <p>調査メディア: {selectedData.mediaOutlet}</p>
              <p>日付: {selectedData.date}</p>
              {Object.entries(selectedData)
                .filter(
                  ([key]) => !["date", "surveyId", "mediaOutlet"].includes(key)
                )
                .map(([key, value]) => {
                  const [partyName, mediaName] = key.split("_");
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <span>{`${partyName}(${mediaName})`}:</span>
                      <span>{value}%</span>
                    </div>
                  );
                })}
              <div className="flex justify-end space-x-2">
                <Button variant="destructive" onClick={handleDelete}>
                  削除
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  閉じる
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PoliticalChart;
