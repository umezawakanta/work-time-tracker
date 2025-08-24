import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, X, Sparkles } from 'lucide-react';
import { useAnalytics } from '@/lib/analytics';

export type TourStepId = 'assessments' | 'ai' | 'learning';

interface ThreeStepTourProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: Record<TourStepId, boolean>;
  onCompleteStep: (step: TourStepId) => void;
  onSkipAll: () => void;
  navigateTo: (path: string) => void;
}

const stepsMeta: { id: TourStepId; title: string; desc: string; path: string }[] = [
  {
    id: 'assessments',
    title: '自己診断（IQ/MBTI）を試す',
    desc: '5–10分で完了。以後はAIとUIをあなた向けに最適化します。',
    path: '/assessments',
  },
  {
    id: 'ai',
    title: 'AI秘書で「今日の一手」を作る',
    desc: '最短60秒で計画。衝動を抑え、次の一歩を明確に。',
    path: '/ai-assistant',
  },
  {
    id: 'learning',
    title: '学習ハブで1分だけ進める',
    desc: 'ビジネススクール要点から1分だけ。継続のコツは超小さく始めること。',
    path: '/learning',
  },
];

const ThreeStepTour: React.FC<ThreeStepTourProps> = ({
  open,
  onOpenChange,
  progress,
  onCompleteStep,
  onSkipAll,
  navigateTo,
}) => {
  const { trackEvent } = useAnalytics();

  const completedCount = (Object.values(progress) as boolean[]).filter(Boolean).length;
  const percent = Math.round((completedCount / stepsMeta.length) * 100);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      trackEvent('onboarding_tour_open', { source: 'header_badge' });
    }
    onOpenChange(next);
  };

  const handleSkip = () => {
    trackEvent('onboarding_tour_skip', { completed: completedCount });
    onSkipAll();
    onOpenChange(false);
  };

  const handleGo = (id: TourStepId, path: string) => {
    if (!progress[id]) {
      onCompleteStep(id);
      trackEvent('onboarding_tour_step_complete', { step: id });
      if (completedCount + 1 === stepsMeta.length) {
        trackEvent('onboarding_tour_complete', { totalSteps: stepsMeta.length });
      }
    }
    navigateTo(path);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            スタートガイド（3ステップ）
          </DialogTitle>
          <DialogDescription>
            進捗 <strong>{completedCount}</strong> / {stepsMeta.length}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>進捗</span>
              <span>{percent}%</span>
            </div>
            <Progress value={percent} className="h-2" />
          </div>

          <ul className="space-y-3">
            {stepsMeta.map((step, idx) => (
              <li
                key={step.id}
                className="flex items-start justify-between gap-3 rounded-lg border p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{idx + 1}.</span>
                    <span className="font-medium">{step.title}</span>
                    {progress[step.id] && (
                      <Badge variant="secondary" className="ml-1">
                        完了
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{step.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  {progress[step.id] ? (
                    <span className="inline-flex items-center text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4 mr-1" /> 完了
                    </span>
                  ) : (
                    <Button size="sm" onClick={() => handleGo(step.id, step.path)}>
                      今すぐ
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" size="sm" onClick={handleSkip} aria-label="ツアーをスキップ">
              <X className="w-4 h-4 mr-1" /> スキップ
            </Button>
            <div className="text-xs text-gray-500">いつでもヘッダーのバッジから再開できます</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThreeStepTour;
