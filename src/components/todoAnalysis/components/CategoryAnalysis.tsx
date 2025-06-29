// src/components/todoAnalysis/components/CategoryAnalysis.tsx
import { FC } from 'react';
import { Progress } from '@/components/ui/progress';
import { CategoryStats, CategoryDistribution } from '../types';
import styles from '../TodoAnalysis.module.css';

interface CategoryAnalysisProps {
  categoryStats: CategoryStats;
  categoryDistribution: CategoryDistribution;
}

export const CategoryAnalysis: FC<CategoryAnalysisProps> = ({
  categoryStats,
  categoryDistribution,
}) => {
  // パーセント値を計算
  const inputPercentage = Math.round((categoryDistribution.input || 0) * 100);
  const outputPercentage = Math.round((categoryDistribution.output || 0) * 100);

  return (
    <section>
      <h3 className={styles.sectionTitle}>カテゴリ分析</h3>
      <div className={styles.categoryContainer}>
        <div className={styles.categoryRow}>
          <span>インプット</span>
          <span>{categoryStats.input || 0}</span>
        </div>
        <Progress
          value={inputPercentage}
          max={100}
          className={styles.inputProgressBar}
          aria-label="インプットの割合"
        />

        <div className={styles.categoryRow}>
          <span>アウトプット</span>
          <span>{categoryStats.output || 0}</span>
        </div>
        <Progress
          value={outputPercentage}
          max={100}
          className={styles.outputProgressBar}
          aria-label="アウトプットの割合"
        />
      </div>
    </section>
  );
};
