import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onReset: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const FormActions = React.memo<FormActionsProps>(({ onReset, onCancel, isSubmitting }) => {
  return (
    <div className="flex justify-between gap-3">
      <Button type="button" variant="outline" onClick={onReset}>
        リセット
      </Button>
      <div className="flex gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '追加中...' : 'タスクを追加'}
        </Button>
      </div>
    </div>
  );
});

FormActions.displayName = 'FormActions';
