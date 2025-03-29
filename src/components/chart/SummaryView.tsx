import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import "./SummaryView.css"; // CSSファイルをインポート

interface SummaryViewProps {
  data: {
    party: string;
    colorCode: string;
    currentSupport: number;
    previousSupport: number;
    change: number;
    trend: "up" | "down" | "stable";
    rank: number;
  }[];
}

const SummaryView: React.FC<SummaryViewProps> = ({ data }) => {
  return (
    <div className="w-full p-4">
      <h3 className="text-xl font-semibold mb-4">政党支持率サマリー</h3>
      <p className="text-sm text-muted-foreground mb-4">
        各政党の現在の支持率と前月比の変化を表示しています
      </p>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">順位</TableHead>
            <TableHead>政党名</TableHead>
            <TableHead className="text-right">現在の支持率</TableHead>
            <TableHead className="text-right">前月比</TableHead>
            <TableHead className="text-right">トレンド</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((party) => (
            <TableRow key={party.party}>
              <TableCell className="font-medium">{party.rank}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div
                    className="party-color-dot"
                    ref={(el) => {
                      if (el) {
                        el.style.setProperty('--party-color', party.colorCode);
                      }
                    }}
                  />
                  <span>{party.party}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold">
                {party.currentSupport.toFixed(1)}%
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={
                    party.change > 0
                      ? "text-green-600"
                      : party.change < 0
                      ? "text-red-600"
                      : ""
                  }
                >
                  {party.change > 0 && "+"}
                  {party.change.toFixed(1)}%
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Badge
                  variant={
                    party.trend === "up"
                      ? "default"
                      : party.trend === "down"
                      ? "destructive"
                      : "outline"
                  }
                  className={`ml-auto ${party.trend === "up" ? "trend-badge-up" : ""}`}
                >
                  {party.trend === "up" ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : party.trend === "down" ? (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  ) : (
                    <Minus className="h-3 w-3 mr-1" />
                  )}
                  {party.trend === "up"
                    ? "上昇"
                    : party.trend === "down"
                    ? "下降"
                    : "横ばい"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="mt-6 text-sm text-muted-foreground">
        <p>※ 「各社平均」の値を元に算出しています</p>
        <p>※ 前月比: 2025年2月と3月の比較</p>
      </div>
    </div>
  );
};

export default SummaryView;