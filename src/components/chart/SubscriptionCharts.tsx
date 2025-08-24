import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { SubscriptionService } from '@/types';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface SubscriptionChartsProps {
  subscriptions: SubscriptionService[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const SubscriptionCharts: React.FC<SubscriptionChartsProps> = ({ subscriptions }) => {
  const labels = subscriptions.map((sub) => sub.name);
  const amounts = subscriptions.map((sub) => sub.amount);

  const pieChartData = {
    labels: labels,
    datasets: [
      {
        data: amounts,
        backgroundColor: COLORS,
        borderColor: COLORS,
        borderWidth: 1,
      },
    ],
  };

  const barChartData = {
    labels: labels,
    datasets: [
      {
        label: '金額',
        data: amounts,
        backgroundColor: '#8884d8',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'サブスクリプション金額',
      },
    },
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>サブスクリプション分析</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pie">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pie">円グラフ</TabsTrigger>
            <TabsTrigger value="bar">棒グラフ</TabsTrigger>
          </TabsList>
          <TabsContent value="pie">
            <div className="h-[400px]">
              <Pie data={pieChartData} options={options} />
            </div>
          </TabsContent>
          <TabsContent value="bar">
            <div className="h-[400px]">
              <Bar data={barChartData} options={options} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
