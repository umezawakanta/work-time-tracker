import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { candidateApi } from '@/services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { RefreshCw } from 'lucide-react';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface SupportRatePoint {
  date: string;
  rate: number;
  source: string;
}

interface SupportRateChartProps {
  candidateId: string;
}

const SupportRateChart: React.FC<SupportRateChartProps> = ({ candidateId }) => {
  const [supportData, setSupportData] = useState<SupportRatePoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSupportData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await candidateApi.getCandidateSupportRate(candidateId);
      if (response.data && Array.isArray(response.data)) {
        // 日付でソート
        const sortedData = [...response.data].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setSupportData(sortedData);
      } else {
        setError('データの形式が正しくありません');
      }
    } catch (err) {
      console.error('支持率データの取得に失敗しました:', err);
      setError('支持率データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    if (candidateId) {
      fetchSupportData();
    }
  }, [candidateId, fetchSupportData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <Card className="p-2 bg-white shadow-md border border-gray-200">
          <CardContent className="p-2 text-xs">
            <p className="font-bold">{new Date(dataPoint.date).toLocaleDateString('ja-JP')}</p>
            <p>支持率: {dataPoint.rate}%</p>
            <p>出典: {dataPoint.source}</p>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error}
          <Button variant="outline" size="sm" onClick={fetchSupportData} className="ml-2">
            <RefreshCw className="h-4 w-4 mr-1" />
            再読み込み
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (supportData.length === 0) {
    return (
      <Alert>
        <AlertDescription>この候補者の支持率データはまだありません。</AlertDescription>
      </Alert>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={supportData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tickFormatter={formatDate} stroke="#888888" fontSize={12} />
        <YAxis
          domain={[0, 100]}
          stroke="#888888"
          fontSize={12}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="rate"
          name="支持率"
          stroke="#0ea5e9"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SupportRateChart;
