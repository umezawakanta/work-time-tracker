import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WorkTimeChart } from '@/components/chart/WorkTimeChart';
import { ProjectPieChart } from '@/components/chart/ProjectPieChart';
import { WorkTimeEntry } from '@/types/workTimeEntry';

interface WorkTimeChartsProps {
  workTimeEntries: WorkTimeEntry[];
  locale: string;
}

export const WorkTimeCharts: React.FC<WorkTimeChartsProps> = ({ workTimeEntries, locale }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {workTimeEntries.length > 0 ? (
        <>
          <WorkTimeChart workTimeEntries={workTimeEntries} locale={locale} />
          <ProjectPieChart workTimeEntries={workTimeEntries} />
        </>
      ) : (
        <Card className="md:col-span-2">
          <CardContent>
            <p>作業時間データがありません。</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
