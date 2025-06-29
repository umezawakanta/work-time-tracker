import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { SubscriptionService } from '@/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface MonthlySubscriptionChartProps {
  subscriptions: SubscriptionService[];
}

interface MonthData {
  month: string;
  subscriptions: SubscriptionService[];
  totalAmount: number;
}

export const MonthlySubscriptionChart: React.FC<MonthlySubscriptionChartProps> = ({
  subscriptions,
}) => {
  const monthNames = [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ];

  const monthlyData: MonthData[] = monthNames.map((month, index) => {
    const monthSubscriptions = subscriptions.filter((sub) => {
      const [, monthStr] = String(sub.billingDate).split('/');
      return parseInt(monthStr) === index + 1;
    });

    return {
      month,
      subscriptions: monthSubscriptions,
      totalAmount: monthSubscriptions.reduce((sum, sub) => sum + sub.amount, 0),
    };
  });

  const allSubscriptionNames = Array.from(new Set(subscriptions.map((sub) => sub.name)));
  const colorScale = [
    'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)',
  ];

  const datasets = allSubscriptionNames.map((name, index) => ({
    label: name,
    data: monthlyData.map(
      (data) => data.subscriptions.find((sub) => sub.name === name)?.amount || 0
    ),
    backgroundColor: colorScale[index % colorScale.length],
  }));

  const chartData: ChartData<'bar'> = {
    labels: monthNames,
    datasets: datasets,
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '月別サブスクリプション分析',
      },
      tooltip: {
        callbacks: {
          afterTitle: (context) => {
            const monthIndex = context[0].dataIndex;
            const totalAmount = monthlyData[monthIndex].totalAmount;
            return `合計: ${totalAmount.toLocaleString()}円`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: '金額 (円)',
        },
      },
    },
  };

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>月別サブスクリプション分析</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};
