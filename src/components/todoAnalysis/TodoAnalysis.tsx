// src/components/todoAnalysis/TodoAnalysis.tsx
import { FC } from "react";
import { useTodoAnalytics } from "./hooks/useTodoAnalytics";
import { AnalysisSummary } from "./components/AnalysisSummary";
import { CategoryAnalysis } from "./components/CategoryAnalysis";
import { Recommendations } from "./components/Recommendations";
import styles from "./TodoAnalysis.module.css";

/**
 * タスク分析コンポーネント
 * タスクの傾向や統計情報を表示します
 */
const TodoAnalysis: FC = () => {
  const { summary, isLoading, error } = useTodoAnalytics();

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>タスク分析</h2>

      {isLoading && (
        <div className={styles.loadingContainer}>
          <p className={styles.loadingText}>分析データを読み込み中...</p>
          <p className={styles.loadingSubtext}>
            初回の分析には時間がかかることがあります
          </p>
        </div>
      )}

      {error && (
        <div className={styles.loadingContainer}>
          <p className={styles.errorText}>エラーが発生しました</p>
          <p className={styles.loadingSubtext}>{error}</p>
        </div>
      )}

      {!isLoading && !error && summary && (
        <div className={styles.contentContainer}>
          <AnalysisSummary summary={summary} />

          <CategoryAnalysis
            categoryStats={summary.categoryStats}
            categoryDistribution={summary.categoryDistribution}
          />

          <Recommendations recommendations={summary.recommendations} />

          <p className={styles.updatedText}>
            最終更新: {summary.lastUpdated.toLocaleDateString()}{" "}
            {summary.lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default TodoAnalysis;
