import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './CandidateCharts.css';
import { Candidate } from '@/types';

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

const partyColors: { [key: string]: string } = {
  自民党: '#ff0000',
  立憲民主党: '#0000ff',
  日本維新の会: '#00ff00',
  公明党: '#ffff00',
  共産党: '#ff00ff',
  国民民主党: '#00ffff',
  社民党: '#ff8000',
  れいわ新選組: '#ff0080',
  参政党: '#8000ff',
  無所属: '#808080',
};

const parties = Object.keys(partyColors);

const prefectures = [
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
];

const prefectureSeats: { [key: string]: number } = {
  北海道: 12,
  青森県: 3,
  岩手県: 3,
  宮城県: 5,
  秋田県: 3,
  山形県: 2,
  福島県: 4,
  茨城県: 6,
  栃木県: 4,
  群馬県: 4,
  埼玉県: 15,
  千葉県: 12,
  東京都: 25,
  神奈川県: 18,
  新潟県: 5,
  富山県: 2,
  石川県: 3,
  福井県: 2,
  山梨県: 2,
  長野県: 4,
  岐阜県: 4,
  静岡県: 7,
  愛知県: 15,
  三重県: 4,
  滋賀県: 3,
  京都府: 6,
  大阪府: 19,
  兵庫県: 11,
  奈良県: 3,
  和歌山県: 2,
  鳥取県: 1,
  島根県: 2,
  岡山県: 4,
  広島県: 6,
  山口県: 3,
  徳島県: 2,
  香川県: 2,
  愛媛県: 3,
  高知県: 2,
  福岡県: 11,
  佐賀県: 2,
  長崎県: 3,
  熊本県: 4,
  大分県: 3,
  宮崎県: 2,
  鹿児島県: 4,
  沖縄県: 3,
};

const proportionalBlocks = [
  '北海道',
  '東北',
  '北関東',
  '南関東',
  '東京',
  '北陸信越',
  '東海',
  '近畿',
  '中国',
  '四国',
  '九州',
] as const;

type ProportionalBlock = (typeof proportionalBlocks)[number];

const proportionalBlockInfo: Record<ProportionalBlock, { seats: number }> = {
  北海道: { seats: 8 },
  東北: { seats: 12 },
  北関東: { seats: 19 },
  南関東: { seats: 22 },
  東京: { seats: 17 },
  北陸信越: { seats: 11 },
  東海: { seats: 21 },
  近畿: { seats: 28 },
  中国: { seats: 11 },
  四国: { seats: 6 },
  九州: { seats: 21 },
};

// インターフェースを更新して新しいプロパティを追加
interface CandidateChartsProps {
  candidates: Candidate[];
  selectedPrefecture: string | null;
  onPrefectureChange: (prefecture: string | null) => void;
  isPremium: boolean;
}

// コンポーネントの型定義を更新
const CandidateCharts: React.FC<CandidateChartsProps> = ({
  candidates,
  selectedPrefecture,
  onPrefectureChange,
  isPremium,
}) => {
  const [chartsPerRow, setChartsPerRow] = useState<1 | 2 | 3>(1);

  // 都道府県選択用の追加UI
  const handlePrefectureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onPrefectureChange(value === 'all' ? null : value);
  };

  // 選択された都道府県でフィルタリングされた候補者
  const filteredCandidates = useMemo(() => {
    if (!selectedPrefecture) return candidates;
    return candidates.filter((c) => c.prefecture === selectedPrefecture);
  }, [candidates, selectedPrefecture]);

  // 以下は既存のuseMemosを更新して、filteredCandidatesを使用するように変更
  const { partyData, prefectureData, proportionalData } = useMemo(() => {
    // filteredCandidatesを使用するように変更
    const partyCounts = parties.map(
      (party) => filteredCandidates.filter((c) => c.party === party).length
    );

    // 以下、元のコードと同様...
    const prefectureCounts = prefectures.map(
      (prefecture) => filteredCandidates.filter((c) => c.prefecture === prefecture).length
    );

    const proportionalCounts = proportionalBlocks.map(
      (block) => filteredCandidates.filter((c) => c.proportionalBlock === block).length
    );

    return {
      // 以下、元のコードと同様...
      partyData: {
        labels: parties,
        datasets: [
          {
            data: partyCounts,
            backgroundColor: parties.map((party) => partyColors[party]),
            borderColor: '#fff',
            borderWidth: 2,
          },
        ],
      } as ChartData<'pie'>,
      prefectureData: {
        labels: prefectures,
        datasets: [
          {
            label: '候補者数',
            data: prefectureCounts,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
          {
            label: '選挙区数',
            data: prefectures.map((prefecture) => prefectureSeats[prefecture]),
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1,
          },
        ],
      } as ChartData<'bar'>,
      proportionalData: {
        labels: [...proportionalBlocks],
        datasets: [
          {
            label: '候補者数',
            data: proportionalCounts,
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1,
          },
          {
            label: '定数',
            data: proportionalBlocks.map((block) => proportionalBlockInfo[block].seats),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      } as ChartData<'bar'>,
    };
  }, [filteredCandidates]); // 依存配列を更新

  const pieOptions: ChartOptions<'pie'> = {
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

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '都道府県別候補者数と選挙区数',
        font: {
          size: 18,
        },
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        formatter: (value: number) => {
          if (value > 0) {
            return value.toString();
          }
          return '';
        },
        font: {
          weight: 'bold' as const,
        },
        color: (context: { datasetIndex: number }) => {
          return context.datasetIndex === 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 159, 64, 1)';
        },
      },
    },
    scales: {
      x: {
        stacked: false,
      },
      y: {
        stacked: false,
        beginAtZero: true,
      },
    },
  };

  const proportionalBarOptions: ChartOptions<'bar'> = {
    ...barOptions,
    plugins: {
      ...barOptions.plugins,
      title: {
        display: true,
        text: '比例単独候補者数と定数',
        font: {
          size: 18,
        },
      },
    },
  };

  const pieChartPlugin: Plugin<'pie'> = {
    id: 'pieChartLabels',
    afterDraw: (chart) => {
      const { ctx, width, height } = chart;
      ctx.save();
      const fontSize = 12;
      ctx.font = `${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = (Math.min(width, height) / 2) * 0.7;

      const total = chart.data.datasets[0].data.reduce(
        (sum, value) => sum + (typeof value === 'number' ? value : 0),
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
        if (typeof value !== 'number') return;

        const sliceAngle = (value / total) * (2 * Math.PI);
        const endAngle = startAngle + sliceAngle;
        const middleAngle = startAngle + sliceAngle / 2;

        let labelRadius = radius * 1.2;
        let x = centerX + Math.cos(middleAngle) * labelRadius;
        let y = centerY + Math.sin(middleAngle) * labelRadius;

        const padding = 20;
        if (x < padding) x = padding;
        if (x > width - padding) x = width - padding;
        if (y < padding) y = padding;
        if (y > height - padding) y = height - padding;

        const labelWidth = ctx.measureText(chart.data.labels?.[i] as string).width;
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

        const innerX = centerX + Math.cos(middleAngle) * radius;
        const innerY = centerY + Math.sin(middleAngle) * radius;
        ctx.beginPath();
        ctx.moveTo(innerX, innerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = partyColors[chart.data.labels?.[i] as string];
        ctx.lineWidth = 1;
        ctx.stroke();

        const label = chart.data.labels?.[i] as string;
        const percentage = ((value / total) * 100).toFixed(1);
        ctx.fillStyle = '#000';
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
      {/* 都道府県選択UI */}
      <div className="mb-4">
        <label htmlFor="prefecture" className="block text-sm font-medium mb-1">
          都道府県選択
        </label>
        <select
          id="prefecture"
          className="w-full max-w-xs border rounded p-2"
          value={selectedPrefecture || 'all'}
          onChange={handlePrefectureChange}
        >
          <option value="all">全国</option>
          {prefectures.map((pref) => (
            <option key={pref} value={pref}>
              {pref}
            </option>
          ))}
        </select>
      </div>

      {/* プレミアム限定機能 */}
      {!isPremium && (
        <div className="bg-gray-100 p-4 rounded-md mb-4 text-sm">
          <p>プレミアム会員になると、より詳細な分析や追加のグラフが利用できます。</p>
        </div>
      )}

      {/* 以下、元のUIと同様... */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={() => setChartsPerRow(1)}
          variant={chartsPerRow === 1 ? 'default' : 'outline'}
        >
          1列
        </Button>
        <Button
          onClick={() => setChartsPerRow(2)}
          variant={chartsPerRow === 2 ? 'default' : 'outline'}
        >
          2列
        </Button>
        <Button
          onClick={() => setChartsPerRow(3)}
          variant={chartsPerRow === 3 ? 'default' : 'outline'}
        >
          3列
        </Button>
      </div>

      {/* チャート表示 */}
      <div className={`grid grid-cols-1 md:grid-cols-${chartsPerRow} gap-8`}>
        <Card className={chartsPerRow > 1 ? 'col-span-1' : 'col-span-full'}>
          <CardHeader>
            <CardTitle>政党別候補者数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`h-${chartsPerRow > 1 ? '400' : '650'}`}>
              <Pie data={partyData} options={pieOptions} plugins={[pieChartPlugin]} />
            </div>
          </CardContent>
        </Card>
        <Card className={chartsPerRow > 1 ? 'col-span-1' : 'col-span-full'}>
          <CardHeader>
            <CardTitle>都道府県別候補者数と選挙区数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`h-${chartsPerRow > 1 ? '400' : '650'}`}>
              <Bar data={prefectureData} options={barOptions} />
            </div>
          </CardContent>
        </Card>
        <Card className={chartsPerRow > 1 ? 'col-span-1' : 'col-span-full'}>
          <CardHeader>
            <CardTitle>比例単独候補者数と定数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`h-${chartsPerRow > 1 ? '400' : '650'}`}>
              <Bar data={proportionalData} options={proportionalBarOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CandidateCharts;
