import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

interface DeadlineInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const DeadlineInput = React.memo<DeadlineInputProps>(({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="deadline">期限</Label>
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
});

DeadlineInput.displayName = 'DeadlineInput';
