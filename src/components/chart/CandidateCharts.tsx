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
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            const total = datasets[0].data.reduce((acc: number, val) => {
              const numVal = typeof val === "number" ? val : 0;
              return acc + numVal;
            }, 0);
            return (chart.data.labels as string[]).map((label, i) => {
              const meta = chart.getDatasetMeta(0);
              const style = meta.controller.getStyle(i, false);
              const value = datasets[0].data[i];
              const numValue = typeof value === "number" ? value : 0;
              const percentage =
                total > 0 ? ((numValue / total) * 100).toFixed(1) : "0.0";
              return {
                text: `${label}: ${numValue}人 (${percentage}%)`,
                fillStyle: style.backgroundColor,
                strokeStyle: style.borderColor,
                lineWidth: style.borderWidth,
                hidden: false,
                index: i,
              };
            });
          },
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.formattedValue;
            const dataset = context.dataset;
            const total = (dataset.data as number[]).reduce(
              (acc, data) => acc + (data || 0),
              0
            );
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${label}: ${value}人 (${percentage}%)`;
          },
        },
      },
      datalabels: {
        color: "#fff",
        font: {
          weight: "bold" as const,
          size: 14,
        },
        formatter: (value: number, ctx) => {
          const dataset = ctx.dataset;
          const total = (dataset.data as number[]).reduce(
            (acc, data) => acc + (data || 0),
            0
          );
          const percentage = ((value / total) * 100).toFixed(1);
          return percentage + "%";
        },
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
          <div className="h-[400px]">
            <Pie data={partyData} options={pieOptions} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>都道府県別候補者数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Bar data={prefectureData} options={barOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateCharts;
