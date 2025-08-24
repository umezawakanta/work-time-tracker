import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus } from 'lucide-react';

export function Sidebar() {
  const miniCalendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-[60px] items-center border-b px-6">
        <Button className="w-full justify-start gap-2">
          <Plus className="h-4 w-4" />
          作成
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-60px)]">
        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            <div className="text-red-500">日</div>
            <div>月</div>
            <div>火</div>
            <div>水</div>
            <div>木</div>
            <div>金</div>
            <div className="text-blue-500">土</div>
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1 text-center">
            {miniCalendarDays.map((day) => (
              <Button key={day} variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                {day}
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
