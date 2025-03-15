"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import PoliticalChart from "@/components/chart/PoliticalChart";

const PoliticalTrends = () => {
  return (
    <Card className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      <CardHeader className="flex flex-col space-y-1.5 p-6 bg-gray-50 dark:bg-gray-800">
        <CardTitle className="text-2xl font-semibold leading-none tracking-tight">
          政党支持率推移
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          各種世論調査における政党支持率の推移を表示しています
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full h-[600px] overflow-hidden">
          <PoliticalChart />
        </div>
      </CardContent>
    </Card>
  );
};

export default PoliticalTrends;