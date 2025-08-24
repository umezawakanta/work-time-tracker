// src/components/todoAnalysis/components/Recommendations.tsx
import { FC } from 'react';
import styles from '../TodoAnalysis.module.css';

interface RecommendationsProps {
  recommendations: string[];
}

export const Recommendations: FC<RecommendationsProps> = ({ recommendations }) => {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section>
      <h3 className={styles.sectionTitle}>推奨事項</h3>
      <ul className={styles.recommendationsList}>
        {recommendations.map((recommendation, index) => (
          <li key={`recommendation-${index}`} className={styles.recommendationItem}>
            {recommendation}
          </li>
        ))}
      </ul>
    </section>
  );
};
