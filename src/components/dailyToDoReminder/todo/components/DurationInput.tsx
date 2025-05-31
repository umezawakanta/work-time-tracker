import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Clock } from 'lucide-react';

interface DurationInputProps {
  value: number;
  onChange: (value: number) => void;
}

export const DurationInput = React.memo<DurationInputProps>(({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="duration">予想作業時間（分）</Label>
      <div className="relative">
        <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          id="duration"
          type="number"
          min="5"
          max="480"
          step="5"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 60)}
          className="pl-10"
        />
      </div>
    </div>
  );
});

DurationInput.displayName = 'DurationInput';
