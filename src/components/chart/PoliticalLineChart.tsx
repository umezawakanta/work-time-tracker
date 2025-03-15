import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { PoliticalParty } from "@/types/survey";
import CustomTooltip from "../CustomTooltip";
import { ChartDataPoint } from "./hooks/useSurveyData";

interface PoliticalLineChartProps {
  data: ChartDataPoint[];
  parties: PoliticalParty[];
  mediaOutlet: string;
  chartType: "line" | "bar" | "pie";
  highlightedParties: string[];
}

const PoliticalLineChart: React.FC<PoliticalLineChartProps> = ({
  data,
  parties,
  mediaOutlet,
  chartType = "line",
  highlightedParties = [],
}) => {
  // 表示順序を調整（支持率が高い順）
  const generateLines = () => {
    if (!data || data.length === 0) {
      return [];
    }

    const lines: JSX.Element[] = [];
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

      // 3%以上の政党にのみラベルを表示
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

  const generateBars = () => {
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

    return (
      <BarChart 
        data={data.length > 0 ? [data[data.length - 1]] : []}
        margin={{ top: 20, right: 30, left: 20, bottom: 200 }}
      >
        <XAxis hide />
        <YAxis domain={[0, 50]} />
        <Tooltip />
        {sortedParties.map((party) => {
          const partyKey =
            mediaOutlet === "各社平均"
              ? `${party.shortName}`
              : `${party.shortName}_${mediaOutlet}`;

          return (
            <Bar key={partyKey} dataKey={partyKey} fill={party.colorCode} name={party.name}>
              <Cell 
                key={`cell-${partyKey}`} 
                fill={highlightedParties.includes(party.shortName) ? 'gold' : party.colorCode} 
              />
            </Bar>
          );
        })}
      </BarChart>
    );
  };

  const generatePie = () => {
    const latestData = data[data.length - 1];
    const pieData = parties
      .map((party) => {
        const partyKey =
          mediaOutlet === "各社平均"
            ? `${party.shortName}`
            : `${party.shortName}_${mediaOutlet}`;

        const value = (latestData[partyKey] as number) || 0;
        return { 
          name: party.name, 
          value: value,
          color: highlightedParties.includes(party.shortName) ? 'gold' : party.colorCode
        };
      })
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    return (
      <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 200 }}>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={200}
          label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    );
  };

  return (
    <div className="w-full overflow-x-auto overflow-y-visible h-[900px]">
      <div className="w-full overflow-auto h-[850px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 200 }}
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
                  padding: "20px 10px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  marginTop: "20px",
                  bottom: "20px"
                }}
                formatter={(value: string) => value.split("(")[0]}
              />
              {generateLines()}
            </LineChart>
          ) : chartType === "bar" ? (
            generateBars()
          ) : (
            generatePie()
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PoliticalLineChart;