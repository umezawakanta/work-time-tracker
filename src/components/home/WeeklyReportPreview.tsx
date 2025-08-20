import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WEEKLY_REPORT_COPY } from '@/constants/copy';
import { BarChart3 } from 'lucide-react';

interface WeeklyReportPreviewProps {
  className?: string;
}

export const WeeklyReportPreview: React.FC<WeeklyReportPreviewProps> = ({ className }) => {
  return (
    <section className={(className || '') + ''} aria-label="Weekly report">
      <Card className="bg-white/80 backdrop-blur border border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            {WEEKLY_REPORT_COPY.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-slate-700 text-sm leading-relaxed">
              {WEEKLY_REPORT_COPY.description}
            </p>
            <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
              {WEEKLY_REPORT_COPY.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          {/* サンプル画像のプレースホルダー */}
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 aspect-[16/9] flex items-center justify-center text-slate-400">
            <span className="text-sm" aria-label={WEEKLY_REPORT_COPY.placeholderAlt}>
              週次レポート サンプル画像（準備中）
            </span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default WeeklyReportPreview;
