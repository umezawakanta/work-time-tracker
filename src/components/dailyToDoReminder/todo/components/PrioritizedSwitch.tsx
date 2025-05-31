import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Target } from 'lucide-react';

interface PrioritizedSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const PrioritizedSwitch = React.memo<PrioritizedSwitchProps>(({ checked, onChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="prioritized" checked={checked} onCheckedChange={onChange} />
      <Label htmlFor="prioritized" className="flex items-center gap-2">
        <Target className="h-4 w-4" />
        今日の重要タスクとしてマーク
      </Label>
    </div>
  );
});

PrioritizedSwitch.displayName = 'PrioritizedSwitch';
