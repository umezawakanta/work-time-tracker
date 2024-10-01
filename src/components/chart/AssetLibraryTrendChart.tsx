import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { format, subMonths, subYears, isAfter } from "date-fns";

interface DataEntry {
  date: Date;
  value: number;
  account: string;
}

interface AssetLiabilityTrendChartProps {
  data: DataEntry[];
}

export const AssetLiabilityTrendChart: React.FC<
  AssetLiabilityTrendChartProps
> = ({ data }) => {
  const [timeRange, setTimeRange] = useState<"1m" | "3m" | "6m" | "1y" | "all">(
    "all"
  );

  const filteredData = data.filter((entry) => {
    const now = new Date();
    switch (timeRange) {
      case "1m":
        return isAfter(entry.date, subMonths(now, 1));
      case "3m":
        return isAfter(entry.date, subMonths(now, 3));
      case "6m":
        return isAfter(entry.date, subMonths(now, 6));
      case "1y":
        return isAfter(entry.date, subYears(now, 1));
      default:
        return true;
    }
  });

  const accounts = Array.from(new Set(data.map((entry) => entry.account)));

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>資産の時系列推移</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-center space-x-2">
          {["1m", "3m", "6m", "1y", "all"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              onClick={() => setTimeRange(range as typeof timeRange)}
            >
              {range === "all"
                ? "全期間"
                : range.replace("m", "ヶ月").replace("y", "年")}
            </Button>
          ))}
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => format(new Date(date), "yyyy-MM-dd")}
              />
              <YAxis tickFormatter={(value) => `${value / 10000}万円`} />
              <Tooltip
                labelFormatter={(label) =>
                  format(new Date(label), "yyyy-MM-dd")
                }
                formatter={(value: number) => [
                  `${value.toLocaleString()}円`,
                  "",
                ]}
              />
              <Legend />
              {accounts.map((account, index) => (
                <Line
                  key={account}
                  type="monotone"
                  dataKey={(entry: DataEntry) =>
                    entry.account === account ? entry.value : undefined
                  }
                  name={account}
                  stroke={index === 0 ? "#8884d8" : "#82ca9d"}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
