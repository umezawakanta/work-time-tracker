import { FC, memo, useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Download, Upload, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import styles from './ProgressSection.module.css';

interface ProgressSectionProps {
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
  inputCount: number;
  outputCount: number;
}

/**
 * タスクの進捗状況とインプット/アウトプットのバランスを表示するコンポーネント
 */
const ProgressSection: FC<ProgressSectionProps> = ({
  completedCount,
  totalCount,
  progressPercentage,
  inputCount,
  outputCount,
}) => {
  // インプット/アウトプットのバランス計算
  const { inputPercentage, outputPercentage } = useMemo(() => {
    const totalTypeCount = inputCount + outputCount;
    const inputPerc = totalTypeCount > 0 ? Math.round((inputCount / totalTypeCount) * 100) : 50;
    const outputPerc = totalTypeCount > 0 ? Math.round((outputCount / totalTypeCount) * 100) : 50;

    return { inputPercentage: inputPerc, outputPercentage: outputPerc };
  }, [inputCount, outputCount]);

  // バランス評価
  const balanceStatus = useMemo(() => {
    if (totalCount === 0) return 'noTasks';

    const ratio = inputCount / (outputCount || 1);

    if (ratio > 3) return 'inputHeavy';
    if (ratio < 0.33) return 'outputHeavy';
    return 'balanced';
  }, [inputCount, outputCount, totalCount]);

  // バランスに関するアドバイス
  const balanceAdvice = useMemo(() => {
    switch (balanceStatus) {
      case 'noTasks':
        return 'タスクを追加して生産性を記録しましょう';
      case 'inputHeavy':
        return 'インプットが多すぎます。アウトプットの増加を検討しましょう';
      case 'outputHeavy':
        return 'アウトプットが多すぎます。インプットの増加を検討しましょう';
      case 'balanced':
        return 'バランスが取れています。このままのペースを維持しましょう';
      default:
        return '';
    }
  }, [balanceStatus]);

  // inputWidthクラス名とoutputWidthクラス名を動的に生成
  const inputWidthClass = `inputWidth-${inputPercentage}`;
  const outputWidthClass = `outputWidth-${outputPercentage}`;

  return (
    <>
      {/* 進捗バー */}
      <div className={styles.progressContainer}>
        <div className={styles.progressInfo}>
          <span>
            進捗状況: {completedCount}/{totalCount} タスク
          </span>
          <span>{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* インプット/アウトプットバランス */}
      <div className={styles.progressBalanceContainer}>
        <div className={styles.balanceInfo}>
          <span>インプット/アウトプット:</span>
          <div className={styles.balanceContainer}>
            <div className={styles.balanceGroup}>
              <Download className={`${styles.progressIcon} ${styles.progressIconInput}`} />
              <span className={styles.progressTextInput}>{inputPercentage}%</span>
            </div>
            <span>:</span>
            <div className={styles.balanceGroup}>
              <Upload className={`${styles.progressIcon} ${styles.progressIconOutput}`} />
              <span className={styles.progressTextOutput}>{outputPercentage}%</span>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className={styles.infoIcon} aria-label="バランスに関するアドバイス">
                    <Info size={12} className={styles[balanceStatus]} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{balanceAdvice}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className={styles.progressBar}>
          <Progress
            className={`${styles.progressBarInput} ${styles[inputWidthClass]}`}
            value={inputPercentage}
            max={100}
            aria-label="インプットの割合"
          />
          <Progress
            className={`${styles.progressBarOutput} ${styles[outputWidthClass]}`}
            value={outputPercentage}
            max={100}
            aria-label="アウトプットの割合"
          />
        </div>
      </div>
    </>
  );
};

// パフォーマンス最適化のためmemoを使用
export default memo(ProgressSection);
