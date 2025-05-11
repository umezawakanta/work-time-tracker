import { FC, useMemo } from "react";
import { BarChart, Activity, TrendingUp, ListChecks } from "lucide-react";
import styles from "./BalanceSummary.module.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BalanceSummaryProps {
  inputCount: number;
  outputCount: number;
  completedCount: number;
  totalCount: number;
  daysHistory?: Array<{ date: string; count: number }>;
}

/**
 * インプット/アウトプットのバランスサマリーを表示するコンポーネント
 */
const BalanceSummary: FC<BalanceSummaryProps> = ({
  inputCount,
  outputCount,
  completedCount,
  totalCount,
  daysHistory = [],
}) => {
  // バランス分析
  const analysis = useMemo(() => {
    const totalTypeCount = inputCount + outputCount;
    if (totalTypeCount === 0) {
      return {
        status: "noData",
        message:
          "タスクデータがありません。新しいタスクを追加して分析を開始しましょう。",
        ratio: 0,
        efficiency: 0,
      };
    }

    const ratio = inputCount / (outputCount || 1);
    const efficiency = completedCount / (totalCount || 1);

    let status: string;
    let message: string;

    if (ratio > 3) {
      status = "inputHeavy";
      message =
        "インプットが多すぎる傾向があります。知識を実践に活かすためにアウトプットタスクを増やしましょう。";
    } else if (ratio < 0.33) {
      status = "outputHeavy";
      message =
        "アウトプットが多すぎる傾向があります。新しい知識を得るためにインプットタスクを増やしましょう。";
    } else {
      status = "balanced";
      message =
        "素晴らしいバランスです！インプットとアウトプットのバランスが取れています。";
    }

    return { status, message, ratio, efficiency };
  }, [inputCount, outputCount, completedCount, totalCount]);

  // 生産性トレンド（履歴データがある場合）
  const trend = useMemo(() => {
    if (daysHistory.length < 3) {
      return {
        direction: "neutral",
        message:
          "十分なデータがありません。継続的にタスクを記録してトレンドを分析しましょう。",
      };
    }

    // 最新7日間のデータを取得
    const recentData = daysHistory.slice(-7);

    // 初期値と最新値を比較
    const firstValue = recentData[0]?.count || 0;
    const lastValue = recentData[recentData.length - 1]?.count || 0;
    const difference = lastValue - firstValue;

    if (difference > 2) {
      return {
        direction: "up",
        message: "生産性が向上しています！このペースを維持しましょう。",
      };
    } else if (difference < -2) {
      return {
        direction: "down",
        message: "生産性が低下しています。タスク管理の方法を見直しましょう。",
      };
    } else {
      return {
        direction: "neutral",
        message: "生産性は安定しています。新しい目標に挑戦してみましょう。",
      };
    }
  }, [daysHistory]);

  return (
    <Card className={styles.summaryCard}>
      <CardHeader className={styles.summaryHeader}>
        <CardTitle className={styles.summaryTitle}>
          <BarChart className={styles.summaryIcon} />
          バランス分析
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={styles.metricsContainer}>
          <div className={styles.metricItem}>
            <Activity className={styles.metricIcon} />
            <div className={styles.metricContent}>
              <h4 className={styles.metricTitle}>
                インプット/アウトプット比率
              </h4>
              <p className={styles.metricValue}>
                {analysis.ratio.toFixed(1)}:1
              </p>
              <p
                className={`${styles.metricStatus} ${styles[analysis.status]}`}
              >
                {analysis.status === "balanced"
                  ? "バランス良好"
                  : analysis.status === "inputHeavy"
                  ? "インプット過多"
                  : analysis.status === "outputHeavy"
                  ? "アウトプット過多"
                  : "データなし"}
              </p>
            </div>
          </div>

          <div className={styles.metricItem}>
            <TrendingUp className={styles.metricIcon} />
            <div className={styles.metricContent}>
              <h4 className={styles.metricTitle}>生産性トレンド</h4>
              <p className={styles.metricValue}>
                {trend.direction === "up"
                  ? "↑ 上昇中"
                  : trend.direction === "down"
                  ? "↓ 下降中"
                  : "→ 安定"}
              </p>
              <p
                className={`${styles.metricStatus} ${styles[trend.direction]}`}
              >
                {daysHistory.length} 日間のデータ
              </p>
            </div>
          </div>

          <div className={styles.metricItem}>
            <ListChecks className={styles.metricIcon} />
            <div className={styles.metricContent}>
              <h4 className={styles.metricTitle}>タスク効率</h4>
              <p className={styles.metricValue}>
                {Math.round(analysis.efficiency * 100)}%
              </p>
              <p className={styles.metricStatus}>
                {completedCount}/{totalCount} 完了
              </p>
            </div>
          </div>
        </div>

        <div className={styles.recommendationBox}>
          <h4 className={styles.recommendationTitle}>アドバイス</h4>
          <p className={styles.recommendationText}>{analysis.message}</p>
          {trend.direction !== "neutral" && (
            <p className={styles.recommendationText}>{trend.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceSummary;
