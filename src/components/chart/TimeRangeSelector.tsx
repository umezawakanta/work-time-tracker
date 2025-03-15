import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface TimeRangeSelectorProps {
  selectedRange: string;
  onChange: (range: string) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selectedRange,
  onChange,
}) => {
  return (
    <div className="bg-card rounded-md flex items-center">
      <span className="text-sm font-medium mr-2">期間:</span>
      <ToggleGroup type="single" value={selectedRange} onValueChange={onChange}>
        <ToggleGroupItem value="1M" aria-label="1か月">
          1か月
        </ToggleGroupItem>
        <ToggleGroupItem value="3M" aria-label="3か月">
          3か月
        </ToggleGroupItem>
        <ToggleGroupItem value="6M" aria-label="6か月">
          6か月
        </ToggleGroupItem>
        <ToggleGroupItem value="1Y" aria-label="1年">
          1年
        </ToggleGroupItem>
        <ToggleGroupItem value="MAX" aria-label="全期間">
          全期間
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default TimeRangeSelector;