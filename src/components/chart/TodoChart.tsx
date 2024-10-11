import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Card } from '@/components/ui/card';
import { TodoHistoryItem } from '@/store/todoSlice';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TodoChartProps {
  todoHistory: TodoHistoryItem[];
}

export const TodoChart: React.FC<TodoChartProps> = ({ todoHistory }) => {
  const dates = todoHistory.map(item => item.date);
  const completedTasksCounts = todoHistory.map(item => item.completedTasks.length);
  const totalTasksCounts = todoHistory.map(item => item.totalTasks);

  const chartData: ChartData<'line'> = {
    labels: dates,
    datasets: [
      {
        label: '完了したタスク',
        data: completedTasksCounts,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: '全タスク',
        data: totalTasksCounts,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'タスク完了の推移',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <Card className="w-full h-[400px] p-4">
      <Line data={chartData} options={options} />
    </Card>
  );
};