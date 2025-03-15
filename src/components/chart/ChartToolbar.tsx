import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Download, 
  Share2, 
  Maximize2, 
  BarChart3, 
  LineChart, 
  PieChart
} from "lucide-react";

interface ChartToolbarProps {
  onDownloadImage: () => void;
  onDownloadCSV: () => void;
  onShare: () => void;
  onToggleFullscreen: () => void;
  onChangeChartType: (type: string) => void;
  chartType: "line" | "bar" | "pie";
  isFullscreen: boolean; // フルスクリーン状態を視覚的に示すために使用
}

const ChartToolbar: React.FC<ChartToolbarProps> = ({
  onDownloadImage,
  onDownloadCSV,
  onShare,
  onToggleFullscreen,
  onChangeChartType,
  chartType,
  isFullscreen
}) => {
  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        {/* グラフタイプの選択 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  {chartType === "line" ? (
                    <LineChart className="h-4 w-4" />
                  ) : chartType === "bar" ? (
                    <BarChart3 className="h-4 w-4" />
                  ) : (
                    <PieChart className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onChangeChartType("line")}>
                  <LineChart className="h-4 w-4 mr-2" />
                  折れ線グラフ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangeChartType("bar")}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  棒グラフ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangeChartType("pie")}>
                  <PieChart className="h-4 w-4 mr-2" />
                  円グラフ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent>
            <p>グラフタイプを変更</p>
          </TooltipContent>
        </Tooltip>

        {/* ダウンロードオプション */}
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onDownloadImage}>
                  画像としてダウンロード
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDownloadCSV}>
                  CSVとしてダウンロード
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent>
            <p>ダウンロード</p>
          </TooltipContent>
        </Tooltip>

        {/* 共有ボタン */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={onShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>URLを共有</p>
          </TooltipContent>
        </Tooltip>

        {/* フルスクリーンボタン */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className={`h-8 w-8 ${isFullscreen ? 'bg-accent' : ''}`} 
              onClick={onToggleFullscreen}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isFullscreen ? 'フルスクリーンを解除' : 'フルスクリーン表示'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ChartToolbar;