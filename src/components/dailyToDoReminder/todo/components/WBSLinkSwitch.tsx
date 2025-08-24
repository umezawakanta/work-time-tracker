import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { GitBranch, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WBSLinkSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const WBSLinkSwitch: React.FC<WBSLinkSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="flex items-center space-x-2">
        <GitBranch className="h-4 w-4 text-blue-500" />
        <Label htmlFor="wbs-link" className="cursor-pointer">
          WBSに自動追加
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                タスクをWork Time TrackerのWBSプロジェクトに自動的に追加します
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Switch id="wbs-link" checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
};

WBSLinkSwitch.displayName = 'WBSLinkSwitch';
