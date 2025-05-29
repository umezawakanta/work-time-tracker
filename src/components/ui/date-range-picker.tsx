'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateRangePickerProps {
  className?: string;
  placeholder?: string;
  selected?: DateRange;
  onSelect?: (date: DateRange) => void;
  mode?: string;
  [key: string]: unknown;
}

interface Preset {
  name: string;
  dates: {
    from: Date;
    to: Date;
  };
}

export function DateRangePicker({
  className,
  placeholder,
  selected,
  onSelect,
  ...props
}: DateRangePickerProps) {
  const [date, setDate] = React.useState(
    selected || {
      from: undefined,
      to: undefined,
    }
  );

  // カスタムプリセットを定義
  const presets = [
    {
      name: '過去30日',
      dates: {
        from: addDays(new Date(), -30),
        to: new Date(),
      },
    },
    {
      name: '過去90日',
      dates: {
        from: addDays(new Date(), -90),
        to: new Date(),
      },
    },
    {
      name: '今年',
      dates: {
        from: new Date(new Date().getFullYear(), 0, 1), // 1月1日
        to: new Date(),
      },
    },
    {
      name: '前年',
      dates: {
        from: new Date(new Date().getFullYear() - 1, 0, 1), // 前年1月1日
        to: new Date(new Date().getFullYear() - 1, 11, 31), // 前年12月31日
      },
    },
  ];

  const handleSelect = (selectedDate: DateRange) => {
    setDate(selectedDate);
    if (onSelect) {
      onSelect(selectedDate);
    }
  };

  // プリセットをクリックした時の処理
  const handlePresetClick = (preset: Preset) => {
    handleSelect(preset.dates);
  };

  return (
    <div className={cn('grid gap-2', className)}>
      {props.mode === 'range' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={'outline'}
              className={cn(
                'w-full justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, 'yyyy年MM月dd日', { locale: ja })} -{' '}
                    {format(date.to, 'yyyy年MM月dd日', { locale: ja })}
                  </>
                ) : (
                  format(date.from, 'yyyy年MM月dd日', { locale: ja })
                )
              ) : (
                <span>日付を選択してください</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex">
              <div className="p-3 border-r">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">クイック選択</h4>
                  <div className="flex flex-col gap-2">
                    {presets.map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        className="text-xs"
                        onClick={() => handlePresetClick(preset)}
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleSelect}
                numberOfMonths={2}
                locale={ja}
                required
              />
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
