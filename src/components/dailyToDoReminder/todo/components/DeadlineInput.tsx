import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Sparkles } from 'lucide-react';

interface DeadlineInputProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestDeadline?: () => void;
  isSuggestingDeadline?: boolean;
  isPremium?: boolean;
}

export const DeadlineInput = React.memo<DeadlineInputProps>(
  ({ value, onChange, onSuggestDeadline, isSuggestingDeadline = false, isPremium = false }) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="deadline">期限</Label>
          {onSuggestDeadline && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSuggestDeadline}
              disabled={isSuggestingDeadline}
              className="text-xs"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {isSuggestingDeadline ? '提案中...' : 'AI提案'}
            </Button>
          )}
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="deadline"
            type="datetime-local"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    );
  }
);

DeadlineInput.displayName = 'DeadlineInput';
