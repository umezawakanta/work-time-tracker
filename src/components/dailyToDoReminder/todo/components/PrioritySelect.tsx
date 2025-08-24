import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Flag, Sparkles } from 'lucide-react';
import { PriorityLevel } from '../hooks/useTodoForm';

const PRIORITY_LABELS: Record<PriorityLevel, { label: string; color: string }> = {
  1: { label: '最低', color: 'text-gray-500' },
  2: { label: '低', color: 'text-blue-500' },
  3: { label: '普通', color: 'text-green-500' },
  4: { label: '高', color: 'text-orange-500' },
  5: { label: '最高', color: 'text-red-500' },
};

interface PrioritySelectProps {
  value: PriorityLevel;
  onChange: (value: PriorityLevel) => void;
  onSuggestPriority?: () => void;
  isSuggestingPriority?: boolean;
  isPremium?: boolean;
}

export const PrioritySelect = React.memo<PrioritySelectProps>(
  ({ value, onChange, onSuggestPriority, isSuggestingPriority = false, isPremium = false }) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>優先度</Label>
          {isPremium && onSuggestPriority && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSuggestPriority}
              disabled={isSuggestingPriority}
              className="h-7 text-xs"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {isSuggestingPriority ? '提案中...' : 'AI提案'}
            </Button>
          )}
        </div>
        <Select
          value={value.toString()}
          onValueChange={(value) => onChange(parseInt(value) as PriorityLevel)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PRIORITY_LABELS).map(([priority, { label, color }]) => (
              <SelectItem key={priority} value={priority}>
                <div className="flex items-center gap-2">
                  <Flag className={`h-3 w-3 ${color}`} />
                  {label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
);

PrioritySelect.displayName = 'PrioritySelect';
