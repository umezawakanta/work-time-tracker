import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartData,
  ChartOptions,
  Plugin,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { Candidate } from "@/store/candidateSlice";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartDataLabels
);

// 政党ごとの色を定義
const partyColors: { [key: string]: string } = {
  自民党: "#ff0000", // 赤
  立憲民主党: "#0000ff", // 青
  日本維新の会: "#00ff00", // 緑
  公明党: "#ffff00", // 黄
  共産党: "#ff00ff", // マゼンタ
  国民民主党: "#00ffff", // シアン
  社民党: "#ff8000", // オレンジ
  参政党: "#8000ff", // 紫
  無所属: "#808080", // グレー
};

const parties = Object.keys(partyColors);

const prefectures = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

const proportionalBlocks = [
  "北海道",
  "東北",
  "北関東",
  "南関東",
  "東京",
  "北陸信越",
  "東海",
  "近畿",
  "中国",
  "四国",
  "九州",
];

const CandidateCharts: React.FC<{ candidates: Candidate[] }> = ({
  candidates,
}) => {
  const [chartsPerRow, setChartsPerRow] = useState<1 | 2 | 3>(1);

  const { partyData, prefectureData, proportionalData } = useMemo(() => {
    const partyCounts = parties.map(
      (party) => candidates.filter((c) => c.party === party).length
    );

    const prefectureCounts = prefectures.map(
      (prefecture) =>
        candidates.filter((c) => c.prefecture === prefecture).length
    );

    const proportionalCounts = proportionalBlocks.map(
      (block) => candidates.filter((c) => c.proportionalBlock === block).length
    );

    return {
      partyData: {
        labels: parties,
        datasets: [
          {
            data: partyCounts,
            backgroundColor: parties.map((party) => partyColors[party]),
            borderColor: "#fff",
            borderWidth: 2,
          },
        ],
      } as ChartData<"pie">,
      prefectureData: {
        labels: prefectures,
        datasets: [
          {
            label: "候補者数",
            data: prefectureCounts,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      } as ChartData<"bar">,
      proportionalData: {
        labels: proportionalBlocks,
        datasets: [
          {
            label: "比例代表候補者数",
            data: proportionalCounts,
            backgroundColor: "rgba(255, 159, 64, 0.6)",
            borderColor: "rgba(255, 159, 64, 1)",
            borderWidth: 1,
          },
        ],
      } as ChartData<"bar">,
    };
  }, [candidates]);

  const pieOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 60,
        bottom: 60,
        left: 60,
        right: 60,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
      datalabels: {
        display: false,
      },
    },
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "都道府県別候補者数",
        font: {
          size: 18,
        },
      },
      datalabels: {
        anchor: "end",
        align: "top",
        formatter: (value: number) => (value > 0 ? value.toString() : ""),
        font: {
          weight: "bold" as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const proportionalBarOptions: ChartOptions<"bar"> = {
    ...barOptions,
    plugins: {
      ...barOptions.plugins,
      title: {
        display: true,
        text: "比例代表ブロック別候補者数",
        font: {
          size: 18,
        },
      },
    },
  };

  const pieChartPlugin: Plugin<"pie"> = {
    id: "pieChartLabels",
    afterDraw: (chart) => {
      const { ctx, width, height } = chart;
      ctx.save();
      const fontSize = 12;
      ctx.font = `${fontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = (Math.min(width, height) / 2) * 0.7;

      const total = chart.data.datasets[0].data.reduce(
        (sum, value) => sum + (typeof value === "number" ? value : 0),
        0
      );

      let startAngle = -Math.PI / 2;
      const labelPositions: {
        x: number;
        y: number;
        width: number;
        height: number;
      }[] = [];

      chart.data.datasets[0].data.forEach((value, i) => {
        if (typeof value !== "number") return;

        const sliceAngle = (value / total) * (2 * Math.PI);
        const endAngle = startAngle + sliceAngle;
        const middleAngle = startAngle + sliceAngle / 2;

        // Calculate label position
        let labelRadius = radius * 1.2;
        let x = centerX + Math.cos(middleAngle) * labelRadius;
        let y = centerY + Math.sin(middleAngle) * labelRadius;

        // Adjust label position if it's outside the chart area
        const padding = 20;
        if (x < padding) x = padding;
        if (x > width - padding) x = width - padding;
        if (y < padding) y = padding;
        if (y > height - padding) y = height - padding;

        // Simple collision detection
        const labelWidth = ctx.measureText(
          chart.data.labels?.[i] as string
        ).width;
        const labelHeight = fontSize * 3;
        let collision = true;
        let attempts = 0;
        while (collision && attempts < 50) {
          collision = labelPositions.some(
            (pos) =>
              x < pos.x + pos.width &&
              x + labelWidth > pos.x &&
              y < pos.y + pos.height &&
              y + labelHeight > pos.y
          );
          if (collision) {
            labelRadius += 5;
            x = centerX + Math.cos(middleAngle) * labelRadius;
            y = centerY + Math.sin(middleAngle) * labelRadius;

            // Re-adjust if outside chart area
            if (x < padding) x = padding;
            if (x > width - padding) x = width - padding;
            if (y < padding) y = padding;
            if (y > height - padding) y = height - padding;
          }
          attempts++;
        }

        labelPositions.push({
          x: x - labelWidth / 2,
          y: y - labelHeight / 2,
          width: labelWidth,
          height: labelHeight,
        });

        // Draw the connecting line
        const innerX = centerX + Math.cos(middleAngle) * radius;
        const innerY = centerY + Math.sin(middleAngle) * radius;
        ctx.beginPath();
        ctx.moveTo(innerX, innerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = partyColors[chart.data.labels?.[i] as string];
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw the label
        const label = chart.data.labels?.[i] as string;
        const percentage = ((value / total) * 100).toFixed(1);
        ctx.fillStyle = "#000";
        ctx.fillText(`${label}`, x, y - fontSize);
        ctx.fillText(`${value}人`, x, y);
        ctx.fillText(`(${percentage}%)`, x, y + fontSize);

        startAngle = endAngle;
      });

      ctx.restore();
    },
  };

  return (
    <div className="space-y-4 mt-8">
      <div className="flex justify-center space-x-4">
        <Button
          onClick={() => setChartsPerRow(1)}
          variant={chartsPerRow === 1 ? "default" : "outline"}
        >
          1列
        </Button>
        <Button
          onClick={() => setChartsPerRow(2)}
          variant={chartsPerRow === 2 ? "default" : "outline"}
        >
          2列
        </Button>
        <Button
          onClick={() => setChartsPerRow(3)}
          variant={chartsPerRow === 3 ? "default" : "outline"}
        >
          3列
        </Button>
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-${chartsPerRow} gap-8`}>
        <Card className={chartsPerRow > 1 ? "col-span-1" : "col-span-full"}>
          <CardHeader>
            <CardTitle>政党別候補者数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`h-[${chartsPerRow > 1 ? "400px" : "650px"}]`}>
              <Pie
                data={partyData}
                options={pieOptions}
                plugins={[pieChartPlugin]}
              />
            </div>
          </CardContent>
        </Card>
        <Card className={chartsPerRow > 1 ? "col-span-1" : "col-span-full"}>
          <CardHeader>
            <CardTitle>都道府県別候補者数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`h-[${chartsPerRow > 1 ? "400px" : "650px"}]`}>
              <Bar data={prefectureData} options={barOptions} />
            </div>
          </CardContent>
        </Card>
        <Card className={chartsPerRow > 1 ? "col-span-1" : "col-span-full"}>
          <CardHeader>
            <CardTitle>比例代表ブロック別候補者数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`h-[${chartsPerRow > 1 ? "400px" : "650px"}]`}>
              <Bar data={proportionalData} options={proportionalBarOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CandidateCharts;
