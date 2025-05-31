import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TaskDescriptionProps {
  value: string;
  onChange: (value: string) => void;
}

export const TaskDescription = React.memo<TaskDescriptionProps>(({ value, onChange }) => {
  return (
    <div className="grid w-full gap-2">
      <Label htmlFor="task-description">詳細説明</Label>
      <Textarea
        id="task-description"
        placeholder="タスクの詳細な説明（オプション）"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        maxLength={500}
      />
    </div>
  );
});

TaskDescription.displayName = 'TaskDescription';
