import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pie, Bar } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js";
import { Candidate } from "@/store/candidateSlice";

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
  const partyData: ChartData<"pie"> = {
    labels: parties,
    datasets: [
      {
        data: parties.map(
          (party) => candidates.filter((c) => c.party === party).length
        ),
        backgroundColor: parties.map((party) => partyColors[party]),
        borderColor: parties.map((party) => partyColors[party]),
        borderWidth: 1,
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
    plugins: {
      legend: {
        position: "right" as const,
      },
      title: {
        display: true,
        text: "政党別候補者数",
      },
    },
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "都道府県別候補者数",
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
          <div className="h-[300px]">
            <Pie data={partyData} options={pieOptions} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>都道府県別候補者数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar data={prefectureData} options={barOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateCharts;
