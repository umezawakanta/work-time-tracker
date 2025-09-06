import { useRef, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ja } from 'date-fns/locale';
import { format } from 'date-fns';
import 'chartjs-adapter-date-fns';
import './AssetLiabilityTrendChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

interface DataPoint {
  date: Date;
  value: number;
  account: string;
  type: 'asset' | 'debt'; // 資産か負債かを判断するためのタイプ
}

interface AssetLiabilityTrendChartProps {
  data: DataPoint[];
}

export function AssetLiabilityTrendChart({ data }: AssetLiabilityTrendChartProps) {
  const chartRef = useRef<ChartJS<'line'> | null>(null);

  useEffect(() => {
    const chart = chartRef.current;
    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, []);

  // 日付ごとにデータを処理して最新の値を使用
  const processedData = useMemo(() => {
    const sortedData = data.sort((a, b) => a.date.getTime() - b.date.getTime());

    // 口座ごとの日付→値のマッピングを作成
    const accountData: Record<
      string,
      Record<string, { value: number; type: 'asset' | 'debt' }>
    > = {};

    sortedData.forEach((point) => {
      const dateStr = point.date.toISOString().split('T')[0];

      if (!accountData[point.account]) {
        accountData[point.account] = {};
      }

      // 同じ日付で複数のエントリがある場合は上書き（最後のエントリが使われる）
      accountData[point.account][dateStr] = {
        value: point.value,
        type: point.type,
      };
    });

    // 日付の一覧を取得（重複なし、ソート済み）
    const allDates = Array.from(
      new Set(sortedData.map((d) => d.date.toISOString().split('T')[0]))
    ).sort();

    // 口座と日付の組み合わせで最新のデータを生成
    const filledData: DataPoint[] = [];

    Object.entries(accountData).forEach(([account, dateValues]) => {
      let lastValue = 0;
      let type: 'asset' | 'debt' = 'asset'; // デフォルト値

      allDates.forEach((dateStr) => {
        if (dateValues[dateStr]) {
          // この日付のデータがあればそれを使用
          lastValue = dateValues[dateStr].value;
          type = dateValues[dateStr].type;
        }

        // その日付におけるその口座の最新値を追加
        filledData.push({
          date: new Date(dateStr),
          value: lastValue,
          account,
          type,
        });
      });
    });

    return filledData;
  }, [data]);

  // 日付ごとに資産と負債を集計
  const aggregatedData = useMemo(() => {
    const aggregated: Record<
      string,
      {
        assets: Record<string, number>;
        debts: Record<string, number>;
        totalAssets: number;
        totalDebts: number;
        netWorth: number;
      }
    > = {};

    // 各日付ごとに処理
    processedData.forEach((point) => {
      const dateStr = point.date.toISOString().split('T')[0];

      if (!aggregated[dateStr]) {
        aggregated[dateStr] = {
          assets: {},
          debts: {},
          totalAssets: 0,
          totalDebts: 0,
          netWorth: 0,
        };
      }

      // 資産か負債かによって適切なオブジェクトに追加
      if (point.type === 'asset') {
        aggregated[dateStr].assets[point.account] = point.value;
      } else {
        aggregated[dateStr].debts[point.account] = point.value;
      }
    });

    // 各日付の合計を計算
    Object.keys(aggregated).forEach((dateStr) => {
      const entry = aggregated[dateStr];

      // 資産合計
      entry.totalAssets = Object.values(entry.assets).reduce((sum, value) => sum + value, 0);

      // 負債合計
      entry.totalDebts = Object.values(entry.debts).reduce((sum, value) => sum + value, 0);

      // 純資産
      entry.netWorth = entry.totalAssets - entry.totalDebts;
    });

    return aggregated;
  }, [processedData]);

  const sortedDates = Object.keys(aggregatedData).sort();

  // チャートデータの作成
  const chartData: ChartData<'line'> = {
    labels: sortedDates.map((date) => new Date(date)),
    datasets: [
      // 資産合計のライン
      {
        label: '資産合計',
        data: sortedDates.map((date) => aggregatedData[date].totalAssets),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.1,
        yAxisID: 'y',
      },
      // 負債合計のライン
      {
        label: '負債合計',
        data: sortedDates.map((date) => aggregatedData[date].totalDebts),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.1,
        yAxisID: 'y',
      },
      // 純資産のライン
      {
        label: '純資産',
        data: sortedDates.map((date) => aggregatedData[date].netWorth),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderDash: [5, 5],
        borderWidth: 3,
        pointRadius: 4,
        tension: 0.1,
        fill: false,
        yAxisID: 'y',
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: '資産・負債の推移',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('ja-JP', {
                style: 'currency',
                currency: 'JPY',
                maximumFractionDigits: 0,
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'yyyy-MM-dd',
          displayFormats: {
            day: 'MM/dd',
          },
        },
        title: {
          display: true,
          text: '日付',
        },
        adapters: {
          date: {
            locale: ja,
          },
        },
        ticks: {
          callback: function (value) {
            return format(new Date(value), 'MM/dd');
          },
        },
      },
      y: {
        title: {
          display: true,
          text: '金額 (円)',
        },
        ticks: {
          callback: function (value: number | string) {
            if (typeof value === 'number') {
              return value.toLocaleString() + '円';
            }
            return value;
          },
        },
      },
    },
  };

  // 現在の残高情報を計算
  const balanceSummary = useMemo(() => {
    if (sortedDates.length === 0) return null;

    const latestDate = sortedDates[sortedDates.length - 1];
    const previousDate = sortedDates.length > 1 ? sortedDates[sortedDates.length - 2] : latestDate;

    const latest = aggregatedData[latestDate];
    const previous = aggregatedData[previousDate];

    // 資産の変化
    const assetChange = latest.totalAssets - previous.totalAssets;
    // 負債の変化
    const debtChange = latest.totalDebts - previous.totalDebts;
    // 純資産の変化
    const netWorthChange = latest.netWorth - previous.netWorth;

    return {
      date: new Date(latestDate),
      assets: {
        total: latest.totalAssets,
        change: assetChange,
        accounts: Object.entries(latest.assets).map(([account, value]) => ({
          account,
          value,
          change: value - (previous.assets[account] || 0),
        })),
      },
      debts: {
        total: latest.totalDebts,
        change: debtChange,
        accounts: Object.entries(latest.debts).map(([account, value]) => ({
          account,
          value,
          change: value - (previous.debts[account] || 0),
        })),
      },
      netWorth: {
        total: latest.netWorth,
        change: netWorthChange,
      },
    };
  }, [aggregatedData, sortedDates]);

  // 残高情報がない場合はローディング表示
  if (!balanceSummary) {
    return <div className="loading">データがありません</div>;
  }

  return (
    <div className="asset-liability-chart-container">
      <div className="current-balances">
        <div className="balance-section assets">
          <h2>資産</h2>
          {balanceSummary.assets.accounts.map((account) => (
            <div key={account.account} className="balance-card asset">
              <h3 className="account-name">{account.account}</h3>
              <p className="balance-amount">{account.value.toLocaleString()} 円</p>
              <p className={`difference ${account.change >= 0 ? 'positive' : 'negative'}`}>
                {account.change >= 0 ? '+' : ''}
                {account.change.toLocaleString()} 円
              </p>
              <p className="last-update">最終更新: {format(balanceSummary.date, 'yyyy/MM/dd')}</p>
            </div>
          ))}
          <div className="balance-card asset-total">
            <h3 className="account-name">合計</h3>
            <p className="balance-amount">{balanceSummary.assets.total.toLocaleString()} 円</p>
            <p
              className={`difference ${
                balanceSummary.assets.change >= 0 ? 'positive' : 'negative'
              }`}
            >
              {balanceSummary.assets.change >= 0 ? '+' : ''}
              {balanceSummary.assets.change.toLocaleString()} 円
            </p>
          </div>
        </div>

        <div className="balance-section liabilities">
          <h2>負債</h2>
          {balanceSummary.debts.accounts.map((account) => (
            <div key={account.account} className="balance-card liability">
              <h3 className="account-name">{account.account}</h3>
              <p className="balance-amount">{account.value.toLocaleString()} 円</p>
              <p className={`difference ${account.change <= 0 ? 'positive' : 'negative'}`}>
                {account.change >= 0 ? '+' : ''}
                {account.change.toLocaleString()} 円
              </p>
              <p className="last-update">最終更新: {format(balanceSummary.date, 'yyyy/MM/dd')}</p>
            </div>
          ))}
          <div className="balance-card debt-total">
            <h3 className="account-name">合計</h3>
            <p className="balance-amount">{balanceSummary.debts.total.toLocaleString()} 円</p>
            <p
              className={`difference ${balanceSummary.debts.change <= 0 ? 'positive' : 'negative'}`}
            >
              {balanceSummary.debts.change >= 0 ? '+' : ''}
              {balanceSummary.debts.change.toLocaleString()} 円
            </p>
          </div>
        </div>

        <div className="balance-section total">
          <h2>合計</h2>
          <div className="balance-card net-worth">
            <h3 className="account-name">純資産</h3>
            <p className="balance-amount">{balanceSummary.netWorth.total.toLocaleString()} 円</p>
            <p
              className={`difference ${
                balanceSummary.netWorth.change >= 0 ? 'positive' : 'negative'
              }`}
            >
              {balanceSummary.netWorth.change >= 0 ? '+' : ''}
              {balanceSummary.netWorth.change.toLocaleString()} 円
            </p>
            <p className="last-update">最終更新: {format(balanceSummary.date, 'yyyy/MM/dd')}</p>
          </div>
        </div>
      </div>

      <div className="chart-wrapper">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
}
