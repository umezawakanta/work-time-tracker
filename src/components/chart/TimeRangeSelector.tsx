import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TimeRangeSelectorProps {
  selectedRange: string;
  onChange: (range: string) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selectedRange,
  onChange,
}) => {
  // 各期間の説明
  const rangeDescriptions = {
    "1M": "直近1か月間のデータを表示",
    "3M": "直近3か月間のデータを表示",
    "6M": "直近6か月間のデータを表示",
    "1Y": "直近1年間のデータを表示",
    "MAX": "全期間のデータを表示"
  };
  
  return (
    <div className="bg-card rounded-md flex items-center">
      <span className="text-sm font-medium mr-2">期間:</span>
      <TooltipProvider>
        <ToggleGroup type="single" value={selectedRange} onValueChange={(value) => value && onChange(value)}>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem value="1M" aria-label="1か月" className="text-sm px-3 py-1">
                1か月
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{rangeDescriptions["1M"]}</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem value="3M" aria-label="3か月" className="text-sm px-3 py-1">
                3か月
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{rangeDescriptions["3M"]}</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem value="6M" aria-label="6か月" className="text-sm px-3 py-1">
                6か月
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{rangeDescriptions["6M"]}</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem value="1Y" aria-label="1年" className="text-sm px-3 py-1">
                1年
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{rangeDescriptions["1Y"]}</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem value="MAX" aria-label="全期間" className="text-sm px-3 py-1 font-medium">
                全期間
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{rangeDescriptions["MAX"]}</p>
            </TooltipContent>
          </Tooltip>
        </ToggleGroup>
      </TooltipProvider>
    </div>
  );
};

export default TimeRangeSelector;