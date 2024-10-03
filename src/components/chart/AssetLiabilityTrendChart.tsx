import { useRef, useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { ja } from "date-fns/locale";
import { format } from "date-fns";
import "chartjs-adapter-date-fns";
import "./AssetLiabilityTrendChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface DataPoint {
  date: Date;
  value: number;
  account: string;
}

interface AssetLiabilityTrendChartProps {
  data: DataPoint[];
}

export function AssetLiabilityTrendChart({
  data,
}: AssetLiabilityTrendChartProps) {
  const chartRef = useRef<ChartJS<"line"> | null>(null);

  useEffect(() => {
    const chart = chartRef.current;
    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, []);

  const processedData = useMemo(() => {
    const sortedData = data.sort((a, b) => a.date.getTime() - b.date.getTime());
    const accountData: Record<string, { date: Date; value: number }[]> = {};

    sortedData.forEach((point) => {
      if (!accountData[point.account]) {
        accountData[point.account] = [];
      }
      accountData[point.account].push({ date: point.date, value: point.value });
    });

    const filledData: DataPoint[] = [];
    Object.entries(accountData).forEach(([account, points]) => {
      let lastValue = points[0].value;
      const allDates = Array.from(
        new Set(sortedData.map((d) => d.date.toISOString().split("T")[0]))
      )
        .sort()
        .map((dateStr) => new Date(dateStr));

      allDates.forEach((date) => {
        const point = points.find(
          (p) =>
            p.date.toISOString().split("T")[0] ===
            date.toISOString().split("T")[0]
        );
        if (point) {
          lastValue = point.value;
        }
        filledData.push({ date, value: lastValue, account });
      });
    });

    return filledData;
  }, [data]);

  const aggregatedData = useMemo(() => {
    const aggregated = processedData.reduce((acc, curr) => {
      const dateStr = curr.date.toISOString().split("T")[0];
      if (!acc[dateStr]) {
        acc[dateStr] = {};
      }
      acc[dateStr][curr.account] = curr.value;
      return acc;
    }, {} as Record<string, Record<string, number>>);

    // Calculate total for each date
    Object.keys(aggregated).forEach((dateStr) => {
      const total = Object.values(aggregated[dateStr]).reduce(
        (sum, value) => sum + value,
        0
      );
      aggregated[dateStr]["合計"] = total;
    });

    return aggregated;
  }, [processedData]);

  const sortedDates = Object.keys(aggregatedData).sort();
  const accounts = Array.from(
    new Set([...processedData.map((d) => d.account), "合計"])
  );

  const chartData: ChartData<"line"> = {
    labels: sortedDates,
    datasets: accounts.map((account, index) => ({
      label: account,
      data: sortedDates.map((date) => aggregatedData[date][account]),
      borderColor:
        account === "合計"
          ? "black"
          : `hsl(${(index * 360) / (accounts.length - 1)}, 70%, 50%)`,
      backgroundColor:
        account === "合計"
          ? "rgba(0, 0, 0, 0.5)"
          : `hsla(${(index * 360) / (accounts.length - 1)}, 70%, 50%, 0.5)`,
      fill: false,
      borderWidth: account === "合計" ? 3 : 1,
      borderDash: account === "合計" ? [5, 5] : [],
      pointRadius: account === "合計" ? 4 : 2,
    })),
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: "資産・負債の推移",
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
          tooltipFormat: "yyyy-MM-dd",
          displayFormats: {
            day: "MM/dd",
          },
        },
        title: {
          display: true,
          text: "日付",
        },
        adapters: {
          date: {
            locale: ja,
          },
        },
        ticks: {
          callback: function (value) {
            return format(new Date(value), "MM/dd");
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "金額 (円)",
        },
        ticks: {
          callback: function (value: number | string) {
            if (typeof value === "number") {
              return value.toLocaleString() + "円";
            }
            return value;
          },
        },
      },
    },
  };

  const currentBalances = useMemo(() => {
    const latestDate = sortedDates[sortedDates.length - 1];
    return accounts.reduce((acc, account) => {
      acc[account] = aggregatedData[latestDate][account];
      return acc;
    }, {} as Record<string, number>);
  }, [aggregatedData, sortedDates, accounts]);

  return (
    <div className="asset-liability-chart-container">
      <div className="current-balances">
        {accounts.map((account, index) => (
          <div
            key={account}
            className={`balance-card ${
              account === "合計" ? "total" : ""
            } color-${index}`}
          >
            <h3 className="account-name">{account}</h3>
            <p className="balance-amount">
              {currentBalances[account].toLocaleString()} 円
            </p>
          </div>
        ))}
      </div>
      <div className="chart-wrapper">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
}
