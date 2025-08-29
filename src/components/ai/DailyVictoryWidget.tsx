import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  personalAIAssistantService,
  DailyOutcomeRecord,
} from '@/services/ai/PersonalAIAssistantService';
import { useAuth } from '@/hooks/useAuth';

export const DailyVictoryWidget: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [outcome, setOutcome] = useState<DailyOutcomeRecord | null>(null);
  const [winCondition, setWinCondition] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    personalAIAssistantService
      .getTodayOutcome()
      .then((d) => {
        setOutcome(d);
        setWinCondition(d?.winCondition || '');
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleSetCondition = async () => {
    if (!winCondition.trim()) return;
    setLoading(true);
    try {
      const updated = await personalAIAssistantService.setTodayWinCondition({
        date: undefined as any,
        winCondition: winCondition.trim(),
        criteria: [],
      });
      setOutcome(updated);
    } finally {
      setLoading(false);
    }
  };

  const mark = async (result: 'win' | 'lose') => {
    setLoading(true);
    try {
      const updated = await personalAIAssistantService.markTodayResult(result);
      setOutcome(updated);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>今日の勝利条件</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="例: 重要タスクを3件完了"
            value={winCondition}
            onChange={(e) => setWinCondition(e.target.value)}
            disabled={loading}
          />
          <Button onClick={handleSetCondition} disabled={loading}>
            設定
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => mark('win')} disabled={loading}>
            勝ちにする
          </Button>
          <Button variant="outline" onClick={() => mark('lose')} disabled={loading}>
            負けにする
          </Button>
        </div>
        <div className="text-sm text-gray-600">
          {outcome?.result ? `今日の結果: ${outcome.result}` : '未判定'}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyVictoryWidget;
