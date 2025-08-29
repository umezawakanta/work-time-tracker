import React, { useEffect, useState } from 'react';
import { dailyVictoryService } from '@/services/secretarial/DailyVictoryService';
import { DailyOutcomeRecord } from '@/types/dailyVictory';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

export const DailyVictoryWidget: React.FC = () => {
  const [today, setToday] = useState<DailyOutcomeRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const rec = await dailyVictoryService.ensureTodayWinCondition();
        if (mounted) setToday(rec);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const mark = async (result: 'win' | 'lose') => {
    if (!today || saving) return;
    setSaving(true);
    try {
      const updated = await dailyVictoryService.markResult(result);
      setToday(updated);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>今日の勝利条件</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <div>読み込み中...</div>}
        {!loading && today && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">{today.date}</div>
            <div className="text-lg font-semibold">{today.winCondition}</div>
            {Array.isArray(today.criteria) && today.criteria.length > 0 && (
              <ul className="list-disc list-inside text-sm text-gray-700">
                {today.criteria.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            )}
            <div className="text-sm">結果: {today.result}</div>
          </div>
        )}
        {!loading && !today && <div className="text-sm">本日の条件が未設定です</div>}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" disabled={!today || saving} onClick={() => mark('lose')}>
          負け
        </Button>
        <Button disabled={!today || saving} onClick={() => mark('win')}>
          勝ち
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DailyVictoryWidget;
