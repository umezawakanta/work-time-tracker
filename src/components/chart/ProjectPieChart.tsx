import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { WorkTimeEntry } from '@/types/workTimeEntry';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ProjectPieChartProps {
  workTimeEntries: WorkTimeEntry[];
}

export const ProjectPieChart: React.FC<ProjectPieChartProps> = ({ workTimeEntries }) => {
  const data = useMemo(() => {
    const projectTotals = workTimeEntries.reduce(
      (acc, entry) => {
        const projectName = entry.projectName || 'その他';
        const duration = entry.duration || 0;
        acc[projectName] = (acc[projectName] || 0) + duration;
        return acc;
      },
      {} as Record<string, number>
    );

    const labels = Object.keys(projectTotals);
    const values = Object.values(projectTotals).map((value) => Math.round(value / 3600)); // Convert seconds to hours

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'],
        },
      ],
    };
  }, [workTimeEntries]);

  const options: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw as number;
            const total = context.dataset.data.reduce((acc: number, cur: number) => acc + cur, 0);
            const percentage = ((value / total) * 100).toFixed(0);
            return `${label}: ${value}時間 (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>プロジェクト別作業時間</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <Pie data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};
