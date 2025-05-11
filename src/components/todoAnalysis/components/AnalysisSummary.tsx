// src/components/todoAnalysis/components/AnalysisSummary.tsx
import { FC } from "react";
import { AnalysisSummary as AnalysisSummaryType } from "../types";
import styles from "../TodoAnalysis.module.css";

interface AnalysisSummaryProps {
  summary: AnalysisSummaryType;
}

export const AnalysisSummary: FC<AnalysisSummaryProps> = ({ summary }) => {
  return (
    <section className={styles.sectionContainer}>
      <h3 className={styles.sectionTitle}>サマリー</h3>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>完了率</p>
          <p className={styles.statValue}>{summary.completionRate}%</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>平均タスク数/日</p>
          <p className={styles.statValue}>{summary.averageTasksPerDay}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>最も生産的な曜日</p>
          <p className={styles.statValue}>{summary.mostProductiveDay}</p>
        </div>
      </div>
    </section>
  );
};
