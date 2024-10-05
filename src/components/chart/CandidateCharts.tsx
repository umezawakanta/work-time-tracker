import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const CandidateCharts: React.FC<{ candidates: Candidate[] }> = ({
  candidates,
}) => {
  const partyCounts = parties.map(
    (party) => candidates.filter((c) => c.party === party).length
  );

  const partyData: ChartData<"pie"> = {
    labels: parties,
    datasets: [
      {
        data: partyCounts,
        backgroundColor: parties.map((party) => partyColors[party]),
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const prefectureData: ChartData<"bar"> = {
    labels: prefectures,
    datasets: [
      {
        label: "候補者数",
        data: prefectures.map(
          (prefecture) =>
            candidates.filter((c) => c.prefecture === prefecture).length
        ),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const pieOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      <Card>
        <CardHeader>
          <CardTitle>政党別候補者数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <Pie
              data={partyData}
              options={pieOptions}
              plugins={[
                {
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
                    const radius = (Math.min(width, height) / 2) * 0.8;

                    const total = chart.data.datasets[0].data.reduce(
                      (sum: number, value: number) => sum + value,
                      0
                    );

                    let startAngle = -Math.PI / 2;
                    const labelPositions: {
                      x: number;
                      y: number;
                      width: number;
                      height: number;
                    }[] = [];

                    chart.data.datasets[0].data.forEach(
                      (value: number, i: number) => {
                        const sliceAngle = (value / total) * (2 * Math.PI);
                        const endAngle = startAngle + sliceAngle;
                        const middleAngle = startAngle + sliceAngle / 2;

                        // Calculate label position
                        let labelRadius = radius * (1 + value / total);
                        let x = centerX + Math.cos(middleAngle) * labelRadius;
                        let y = centerY + Math.sin(middleAngle) * labelRadius;

                        // Adjust label position if it's outside the chart area
                        const padding = 10;
                        if (x < padding) x = padding;
                        if (x > width - padding) x = width - padding;
                        if (y < padding) y = padding;
                        if (y > height - padding) y = height - padding;

                        // Simple collision detection
                        const labelWidth = ctx.measureText(
                          chart.data.labels?.[i] as string
                        ).width;
                        const labelHeight = fontSize * 2;
                        let collision = true;
                        let attempts = 0;
                        while (collision && attempts < 10) {
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
                        ctx.strokeStyle =
                          partyColors[chart.data.labels?.[i] as string];
                        ctx.lineWidth = 1;
                        ctx.stroke();

                        // Draw the label
                        const label = chart.data.labels?.[i] as string;
                        const percentage = ((value / total) * 100).toFixed(1);
                        ctx.fillStyle = "#000";
                        ctx.fillText(`${label}`, x, y - fontSize / 2);
                        ctx.fillText(
                          `${value}人 (${percentage}%)`,
                          x,
                          y + fontSize / 2
                        );

                        startAngle = endAngle;
                      }
                    );

                    ctx.restore();
                  },
                },
              ]}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>都道府県別候補者数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <Bar data={prefectureData} options={barOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateCharts;
