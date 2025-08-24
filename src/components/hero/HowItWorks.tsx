import React from 'react';
import { HOW_IT_WORKS_COPY } from '@/constants/copy';
import { Target, ListChecks, CheckCircle2 } from 'lucide-react';
import useScrollFadeIn from '@/hooks/useScrollFadeIn';

const iconMap: Record<string, React.ReactNode> = {
  goal: <Target className="h-6 w-6 text-blue-600" aria-hidden />,
  plan: <ListChecks className="h-6 w-6 text-emerald-600" aria-hidden />,
  execute: <CheckCircle2 className="h-6 w-6 text-purple-600" aria-hidden />,
};

export interface HowItWorksProps {
  className?: string;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ className }) => {
  const sectionRef = useScrollFadeIn<HTMLElement>();
  return (
    <section
      ref={sectionRef as any}
      className={'py-12 bg-slate-50 ' + (className || '')}
      aria-label="How it works section"
    >
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
          {HOW_IT_WORKS_COPY.title}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS_COPY.items.map((item, idx) => (
            <div
              key={item.key}
              className="rounded-xl border border-slate-200 p-6 shadow-sm bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="shrink-0">{iconMap[item.key]}</div>
                <div className="text-xs text-slate-500">STEP {idx + 1}</div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">{item.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
