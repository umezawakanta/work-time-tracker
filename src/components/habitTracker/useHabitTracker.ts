import { useState, useEffect, useMemo } from 'react';

// 習慣の統計情報の型定義
interface HabitStat {
  currentStreak: number;
  longestStreak: number;
  monthlyProgress: number;
}

// 習慣のストレージデータの型定義
interface HabitStorageData {
  activeHabits: string[];
  archivedHabits: string[];
  habitData: Record<string, boolean[]>;
  categoryMap: Record<string, string[]>;
}

// カスタムフックの戻り値の型定義
interface UseHabitTrackerReturn {
  currentDate: Date;
  stats: Record<string, HabitStat>;
  isLoading: boolean;
  error: string | null;
  showCongrats: boolean;
  toggleHabit: (habit: string, dayIndex: number) => void;
  handleMonthChange: (change: number) => void;
  getHabitData: (habit: string) => boolean[];
  addCustomHabit: (habit: string) => void;
  archiveHabit: (habit: string) => void;
  unarchiveHabit: (habit: string) => void;
  deleteHabit: (habit: string) => void;
  getActiveHabits: () => string[];
  getArchivedHabits: () => string[];
  getAllHabits: () => string[];
  getCategoryHabits: (category: string) => string[];
}

/**
 * 習慣トラッカー機能を提供するカスタムフック
 * @param {string[]} defaultHabits - デフォルトの習慣リスト
 * @returns {UseHabitTrackerReturn} 習慣トラッカー機能
 */
export const useHabitTracker = (defaultHabits: string[]): UseHabitTrackerReturn => {
  // 基本的な状態
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCongrats, setShowCongrats] = useState<boolean>(false);

  // 習慣データの状態
  const [activeHabits, setActiveHabits] = useState<string[]>([]);
  const [archivedHabits, setArchivedHabits] = useState<string[]>([]);
  const [habitData, setHabitData] = useState<Record<string, boolean[]>>({});
  const [categoryMap, setCategoryMap] = useState<Record<string, string[]>>({});
  const [stats, setStats] = useState<Record<string, HabitStat>>({});

  // 習慣のデフォルトカテゴリマッピング - メモ化して再レンダリングを防止
  const defaultCategoryMap = useMemo(
    () => ({
      健康: ['酒', 'たばこ', 'ジャンクフード', '睡眠不足', '姿勢が悪い', 'コンビニ弁当'],
      生活: ['昼夜逆転', '後回し癖', 'すぐSNS開く'],
      マインド: ['ネガティブ思考'],
      その他: [],
    }),
    []
  );

  // ローカルストレージからデータを読み込む
  useEffect(() => {
    const loadData = () => {
      try {
        setIsLoading(true);

        // ローカルストレージからデータを取得
        const storedData = localStorage.getItem('habitTracker');

        if (storedData) {
          const parsedData = JSON.parse(storedData) as HabitStorageData;
          setActiveHabits(parsedData.activeHabits);
          setArchivedHabits(parsedData.archivedHabits);
          setHabitData(parsedData.habitData);
          setCategoryMap(parsedData.categoryMap || defaultCategoryMap);
        } else {
          // 初期データをセットアップ
          setActiveHabits(defaultHabits);

          const initialHabitData: Record<string, boolean[]> = {};
          defaultHabits.forEach((habit) => {
            initialHabitData[habit] = Array(31).fill(false);
          });

          setHabitData(initialHabitData);
          setCategoryMap(defaultCategoryMap);
        }

        setIsLoading(false);
      } catch {
        // エラーを捕捉して、エラーメッセージをセット
        setError('データの読み込みに失敗しました');
        setIsLoading(false);
      }
    };

    loadData();
  }, [defaultHabits, defaultCategoryMap]);

  // データをローカルストレージに保存
  useEffect(() => {
    if (!isLoading && activeHabits.length > 0) {
      const dataToStore: HabitStorageData = {
        activeHabits,
        archivedHabits,
        habitData,
        categoryMap,
      };

      localStorage.setItem('habitTracker', JSON.stringify(dataToStore));
    }
  }, [activeHabits, archivedHabits, habitData, categoryMap, isLoading]);

  // 統計情報を計算
  useEffect(() => {
    if (!isLoading) {
      const daysInMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ).getDate();

      const today = new Date().getDate();
      const newStats: Record<string, HabitStat> = {};

      // アクティブな習慣とアーカイブされた習慣の両方を処理
      [...activeHabits, ...archivedHabits].forEach((habit) => {
        if (habitData[habit]) {
          // 統計情報を計算
          const monthData = habitData[habit].slice(0, daysInMonth);
          const validDaysCount = Math.min(today, daysInMonth);
          const validDaysData = monthData.slice(0, validDaysCount);

          // 現在の連続達成日数
          let currentStreak = 0;
          for (let i = validDaysCount - 1; i >= 0; i--) {
            if (monthData[i]) {
              currentStreak++;
            } else {
              break;
            }
          }

          // 最長連続達成日数
          let longestStreak = 0;
          let currentRunStreak = 0;

          for (let i = 0; i < daysInMonth; i++) {
            if (i < validDaysCount && monthData[i]) {
              currentRunStreak++;
              longestStreak = Math.max(longestStreak, currentRunStreak);
            } else {
              currentRunStreak = 0;
            }
          }

          // 達成率
          const achievedDays = validDaysData.filter((day) => day).length;
          const monthlyProgress =
            validDaysCount > 0 ? Math.round((achievedDays / validDaysCount) * 100) : 0;

          newStats[habit] = {
            currentStreak,
            longestStreak,
            monthlyProgress,
          };

          // 7日間連続達成でお祝いメッセージを表示
          if (currentStreak >= 7 && activeHabits.includes(habit)) {
            setShowCongrats(true);
          }
        }
      });

      setStats(newStats);
    }
  }, [currentDate, habitData, activeHabits, archivedHabits, isLoading]);

  // 習慣の達成状態をトグルする
  const toggleHabit = (habit: string, dayIndex: number) => {
    if (habitData[habit]) {
      setHabitData((prev) => {
        const newData = { ...prev };
        const newHabitData = [...newData[habit]];
        newHabitData[dayIndex] = !newHabitData[dayIndex];
        newData[habit] = newHabitData;
        return newData;
      });
    }
  };

  // 月を変更する
  const handleMonthChange = (change: number) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + change);
      return newDate;
    });
  };

  // 習慣のデータを取得
  const getHabitData = (habit: string): boolean[] => {
    return habitData[habit] || Array(31).fill(false);
  };

  // 新しい習慣を追加
  const addCustomHabit = (habit: string) => {
    if (!activeHabits.includes(habit) && !archivedHabits.includes(habit)) {
      setActiveHabits((prev) => [...prev, habit]);
      setHabitData((prev) => ({
        ...prev,
        [habit]: Array(31).fill(false),
      }));

      // その他のカテゴリーに追加
      setCategoryMap((prev) => {
        const newCategoryMap = { ...prev };
        newCategoryMap['その他'] = [...(newCategoryMap['その他'] || []), habit];
        return newCategoryMap;
      });
    }
  };

  // 習慣をアーカイブする
  const archiveHabit = (habit: string) => {
    if (activeHabits.includes(habit)) {
      setActiveHabits((prev) => prev.filter((h) => h !== habit));
      setArchivedHabits((prev) => [...prev, habit]);
    }
  };

  // 習慣をアーカイブから戻す
  const unarchiveHabit = (habit: string) => {
    if (archivedHabits.includes(habit)) {
      setArchivedHabits((prev) => prev.filter((h) => h !== habit));
      setActiveHabits((prev) => [...prev, habit]);
    }
  };

  // 習慣を削除する
  const deleteHabit = (habit: string) => {
    setActiveHabits((prev) => prev.filter((h) => h !== habit));
    setArchivedHabits((prev) => prev.filter((h) => h !== habit));

    setHabitData((prev) => {
      const newData = { ...prev };
      delete newData[habit];
      return newData;
    });

    // カテゴリーからも削除
    setCategoryMap((prev) => {
      const newCategoryMap = { ...prev };

      for (const category in newCategoryMap) {
        newCategoryMap[category] = newCategoryMap[category].filter((h) => h !== habit);
      }

      return newCategoryMap;
    });
  };

  // アクティブな習慣のリストを取得
  const getActiveHabits = (): string[] => {
    return activeHabits;
  };

  // アーカイブされた習慣のリストを取得
  const getArchivedHabits = (): string[] => {
    return archivedHabits;
  };

  // すべての習慣のリストを取得
  const getAllHabits = (): string[] => {
    return [...activeHabits, ...archivedHabits];
  };

  // カテゴリーに属する習慣のリストを取得
  const getCategoryHabits = (category: string): string[] => {
    return categoryMap[category] || [];
  };

  return {
    currentDate,
    stats,
    isLoading,
    error,
    showCongrats,
    toggleHabit,
    handleMonthChange,
    getHabitData,
    addCustomHabit,
    archiveHabit,
    unarchiveHabit,
    deleteHabit,
    getActiveHabits,
    getArchivedHabits,
    getAllHabits,
    getCategoryHabits,
  };
};

export default useHabitTracker;
