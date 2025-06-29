import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { WorkTimeEntry } from '@/types/workTimeEntry';
import { formatDateAndTime } from '@/utils/dateUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface WorkTimeChartProps {
  workTimeEntries: WorkTimeEntry[];
  locale: string;
}

export const WorkTimeChart: React.FC<WorkTimeChartProps> = ({ workTimeEntries, locale }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  const formatDate = useCallback(
    (dateString: string | undefined) => {
      if (!dateString) return '未設定';
      return formatDateAndTime(dateString, locale, { dateStyle: 'short' });
    },
    [locale]
  );

  const filterEntriesByTimeRange = useCallback(
    (entries: WorkTimeEntry[]) => {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      return entries.filter((entry) => {
        const entryDate = entry.date ? new Date(entry.date) : null;
        if (!entryDate) return false;
        if (timeRange === 'week') return entryDate >= oneWeekAgo;
        if (timeRange === 'month') return entryDate >= oneMonthAgo;
        return true;
      });
    },
    [timeRange]
  );

  const chartData = useMemo(() => {
    const filteredData = filterEntriesByTimeRange(workTimeEntries);
    const labels = filteredData.map((entry) => formatDate(entry.date));
    const durations = filteredData.map((entry) => (entry.duration ? entry.duration / 3600 : 0));

    return {
      labels,
      datasets: [
        {
          label: '作業時間 (時間)',
          data: durations,
          backgroundColor: '#8884d8',
        },
      ],
    };
  }, [workTimeEntries, filterEntriesByTimeRange, formatDate]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '作業時間記録',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '時間',
        },
      },
    },
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>作業時間記録</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="timeRange">期間</Label>
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as 'week' | 'month' | 'all')}
          >
            <SelectTrigger id="timeRange">
              <SelectValue placeholder="期間を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">1週間</SelectItem>
              <SelectItem value="month">1ヶ月</SelectItem>
              <SelectItem value="all">全期間</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="h-64 w-full">
          <Bar options={options} data={chartData} />
        </div>
      </CardContent>
    </Card>
  );
};
