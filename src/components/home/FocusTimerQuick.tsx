import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { trackCtaClick } from '@/lib/track';

interface FocusTimerQuickProps {
  className?: string;
}

export const FocusTimerQuick: React.FC<FocusTimerQuickProps> = ({ className }) => {
  const handleClick = (minutes: 25 | 50) => {
    trackCtaClick({
      id: minutes === 25 ? 'focus_timer_25' : 'focus_timer_50',
      label: `${minutes}分集中`,
      variant: 'primary',
      location: 'home_focus_timer',
      params: { minutes },
    });
    toast.success(`${minutes}分の集中タイマー（準備中）`);
  };

  return (
    <section className={className || ''} aria-label="Focus timer quick actions">
      <Card className="bg-white/80 backdrop-blur border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Timer className="w-5 h-5 text-emerald-600" /> 集中タイマー（準備中）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleClick(25)}
              aria-label="25分集中タイマーを開始"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              25分集中
            </Button>
            <Button
              variant="outline"
              onClick={() => handleClick(50)}
              aria-label="50分集中タイマーを開始"
            >
              50分集中
            </Button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            後日、ポモドーロ機能に接続します。通知・自動休憩・進捗記録に対応予定。
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

export default FocusTimerQuick;
