import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { WorkTimeEntry } from "@/types/workTimeEntry";

interface ProjectPieChartProps {
  workTimeEntries: WorkTimeEntry[];
}

export const ProjectPieChart: React.FC<ProjectPieChartProps> = ({
  workTimeEntries,
}) => {
  const data = useMemo(() => {
    const projectTotals = workTimeEntries.reduce((acc, entry) => {
      const projectName = entry.projectName || "その他";
      const duration = entry.duration || 0;
      acc[projectName] = (acc[projectName] || 0) + duration;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(projectTotals).map(([name, value]) => ({
      name,
      value: Math.round(value / 3600), // Convert seconds to hours
    }));
  }, [workTimeEntries]);

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>プロジェクト別作業時間</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}時間`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
