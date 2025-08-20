import React from 'react';
import { BENEFITS_COPY } from '@/constants/copy';
import { Lightbulb, Timer, BarChart3 } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  priorityTask: (
    <span className="relative inline-flex items-center" aria-hidden>
      <svg width="10" height="10" viewBox="0 0 10 10" className="mr-2">
        <circle cx="5" cy="5" r="5" className="fill-blue-200" />
      </svg>
      <Lightbulb className="h-6 w-6 text-blue-600" />
    </span>
  ),
  focusTimer: (
    <span className="relative inline-flex items-center" aria-hidden>
      <svg width="10" height="10" viewBox="0 0 10 10" className="mr-2">
        <rect x="0" y="0" width="10" height="10" rx="2" className="fill-emerald-200" />
      </svg>
      <Timer className="h-6 w-6 text-emerald-600" />
    </span>
  ),
  weeklyReport: (
    <span className="relative inline-flex items-center" aria-hidden>
      <svg width="10" height="10" viewBox="0 0 10 10" className="mr-2">
        <polygon points="5,0 10,10 0,10" className="fill-purple-200" />
      </svg>
      <BarChart3 className="h-6 w-6 text-purple-600" />
    </span>
  ),
};

export interface BenefitsProps {
  className?: string;
}

export const Benefits: React.FC<BenefitsProps> = ({ className }) => {
  return (
    <section className={'py-12 bg-white ' + (className || '')} aria-label="Benefits section">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-3">
          {BENEFITS_COPY.items.map((item) => (
            <div
              key={item.key}
              className="rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="shrink-0">{iconMap[item.key]}</div>
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
