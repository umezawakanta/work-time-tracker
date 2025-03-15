"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useSurveyData } from "./hooks/useSurveyData";
import MissingDataAlert from "@/components/MissingDataAlert";
import ChartControls from "@/components/ChartControls";
import PoliticalLineChart from "@/components/chart/PoliticalLineChart";

const PoliticalChart = () => {
  const { chartData, mediaList, parties, isLoading, missingData, fetchSurveyData } = useSurveyData();
  const [activeMedia, setActiveMedia] = useState<string>("各社平均");

  useEffect(() => {
    fetchSurveyData();
  }, [fetchSurveyData]);

  if (isLoading) {
    return <Skeleton className="w-full h-[500px] rounded-lg" />;
  }

  return (
    <div className="w-full bg-black relative">
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
              <PoliticalLineChart 
                data={chartData[media]} 
                parties={parties} 
                mediaOutlet={media} 
              />
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