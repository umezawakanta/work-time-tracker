import { useState, useEffect, useCallback, useMemo } from 'react'

// 習慣の統計情報の型定義
interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  monthlyProgress: number;
}

// カスタムフックの戻り値の型定義
interface UseHabitTrackerReturn {
  currentDate: Date;
  stats: Record<string, HabitStats>;
  isLoading: boolean;
  error: string | null;
  showCongrats: boolean;
  toggleHabit: (habit: string, dayIndex: number) => void;
  handleMonthChange: (direction: number) => void;
  getHabitData: (habit: string) => boolean[];
  addCustomHabit: (habitName: string) => void;
  archiveHabit: (habit: string) => void;
  unarchiveHabit: (habit: string) => void;
  deleteHabit: (habit: string) => void;
  getActiveHabits: () => string[];
  getArchivedHabits: () => string[];
  getAllHabits: () => string[];
  getCategoryHabits: (category: string) => string[];
}

/**
 * 習慣管理のためのカスタムフック
 * @param initialHabits - 初期習慣リスト
 * @returns 習慣管理に関する状態と関数
 */
export function useHabitTracker(initialHabits: string[] = []): UseHabitTrackerReturn {
  // 状態
  const [habits, setHabits] = useState<string[]>([]);
  const [archivedHabits, setArchivedHabits] = useState<string[]>([]);
  const [habitsData, setHabitsData] = useState<Record<string, boolean[]>>({});
  const [stats, setStats] = useState<Record<string, HabitStats>>({});
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCongrats, setShowCongrats] = useState<boolean>(false);

  // 習慣カテゴリーのマッピング（useMemoで最適化）
  const habitCategoryMapping = useMemo<Record<string, string[]>>(() => ({
    "健康": ["酒", "たばこ", "ジャンクフード", "睡眠不足", "姿勢が悪い", "コンビニ弁当", "エナジードリンク"],
    "生活": ["昼夜逆転", "後回し癖", "すぐSNS開く"],
    "マインド": ["ネガティブ", "失敗を恐れる", "嘘をつく", "すぐ否定する", "謎のプライド"],
    "その他": []
  }), []);

  // 初期化
  useEffect(() => {
    // LocalStorageからデータを読み込む
    const loadHabitsFromStorage = (): void => {
      try {
        const storedHabits = localStorage.getItem('habits');
        const storedArchivedHabits = localStorage.getItem('archivedHabits');
        const storedHabitsData = localStorage.getItem('habitsData');
        
        if (storedHabits) {
          setHabits(JSON.parse(storedHabits));
        } else {
          setHabits(initialHabits);
        }
        
        if (storedArchivedHabits) {
          setArchivedHabits(JSON.parse(storedArchivedHabits));
        }
        
        if (storedHabitsData) {
          setHabitsData(JSON.parse(storedHabitsData));
        } else {
          // 初期データの構築
          const initialData: Record<string, boolean[]> = {};
          initialHabits.forEach(habit => {
            initialData[habit] = Array(31).fill(false);
          });
          setHabitsData(initialData);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('ローカルストレージからの読み込みエラー:', err);
        setError('データの読み込み中にエラーが発生しました。再読み込みしてください。');
        setIsLoading(false);
      }
    };
    
    loadHabitsFromStorage();
  }, [initialHabits]);

  // データ保存
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('habits', JSON.stringify(habits));
      localStorage.setItem('archivedHabits', JSON.stringify(archivedHabits));
      localStorage.setItem('habitsData', JSON.stringify(habitsData));
    }
  }, [habits, archivedHabits, habitsData, isLoading]);

  // 統計データの計算
  useEffect(() => {
    if (isLoading) return;
    
    const calculateStats = (): void => {
      const newStats: Record<string, HabitStats> = {};
      const today = new Date().getDate();
      
      // 全ての習慣（アクティブとアーカイブ両方）に対して統計を計算
      [...habits, ...archivedHabits].forEach(habit => {
        const habitData = habitsData[habit] || Array(31).fill(false);
        
        // 現在のストリーク（連続達成日数）を計算
        let currentStreak = 0;
        for (let i = today - 1; i >= 0; i--) {
          if (habitData[i]) {
            currentStreak++;
          } else {
            break;
          }
        }
        
        // 最長ストリークを計算
        let longestStreak = 0;
        let currentLongestStreak = 0;
        habitData.forEach(avoided => {
          if (avoided) {
            currentLongestStreak++;
            longestStreak = Math.max(longestStreak, currentLongestStreak);
          } else {
            currentLongestStreak = 0;
          }
        });
        
        // 月間達成率
        const daysInMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        ).getDate();
        
        const validDaysCount = Math.min(today, daysInMonth);
        const achievedDaysCount = habitData
          .slice(0, validDaysCount)
          .filter(day => day).length;
        
        const monthlyProgress = validDaysCount > 0
          ? Math.round((achievedDaysCount / validDaysCount) * 100)
          : 0;
        
        newStats[habit] = {
          currentStreak,
          longestStreak,
          monthlyProgress
        };
      });
      
      setStats(newStats);
      
      // 7日以上の連続達成があるか確認
      const hasSevenDayStreak = Object.values(newStats).some(
        stat => stat.currentStreak >= 7
      );
      
      setShowCongrats(hasSevenDayStreak);
    };
    
    calculateStats();
  }, [habitsData, habits, archivedHabits, isLoading, currentDate]);

  // 習慣の切り替え
  const toggleHabit = useCallback((habit: string, dayIndex: number): void => {
    setHabitsData(prevData => {
      const habitData = [...(prevData[habit] || Array(31).fill(false))];
      habitData[dayIndex] = !habitData[dayIndex];
      
      return {
        ...prevData,
        [habit]: habitData
      };
    });
  }, []);

  // 月の変更
  const handleMonthChange = useCallback((direction: number): void => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + direction);
      
      // 新しい月のデータをリセット
      const newHabitsData: Record<string, boolean[]> = {};
      
      // 全ての習慣についてその月のデータを更新
      Object.keys(habitsData).forEach(habit => {
        newHabitsData[habit] = Array(31).fill(false);
      });
      
      setHabitsData(newHabitsData);
      
      return newDate;
    });
  }, [habitsData]);

  // 習慣のデータを取得する
  const getHabitData = useCallback((habit: string): boolean[] => {
    return habitsData[habit] || Array(31).fill(false);
  }, [habitsData]);

  // 新しい習慣を追加する
  const addCustomHabit = useCallback((habitName: string): void => {
    // 既に存在する場合は追加しない
    if (habits.includes(habitName) || archivedHabits.includes(habitName)) {
      return;
    }
    
    setHabits(prev => [...prev, habitName]);
    
    // 新しい習慣のデータ初期化
    setHabitsData(prev => ({
      ...prev,
      [habitName]: Array(31).fill(false)
    }));
  }, [habits, archivedHabits]);

  // 習慣をアーカイブする
  const archiveHabit = useCallback((habit: string): void => {
    setHabits(prev => prev.filter(h => h !== habit));
    setArchivedHabits(prev => [...prev, habit]);
  }, []);

  // アーカイブから習慣を復元する
  const unarchiveHabit = useCallback((habit: string): void => {
    setArchivedHabits(prev => prev.filter(h => h !== habit));
    setHabits(prev => [...prev, habit]);
  }, []);

  // 習慣を削除する
  const deleteHabit = useCallback((habit: string): void => {
    // 活動中とアーカイブの両方から削除
    setHabits(prev => prev.filter(h => h !== habit));
    setArchivedHabits(prev => prev.filter(h => h !== habit));
    
    // データも削除
    setHabitsData(prev => {
      const newData = { ...prev };
      delete newData[habit];
      return newData;
    });
  }, []);

  // アクティブな習慣を取得
  const getActiveHabits = useCallback((): string[] => {
    return habits;
  }, [habits]);

  // アーカイブされた習慣を取得
  const getArchivedHabits = useCallback((): string[] => {
    return archivedHabits;
  }, [archivedHabits]);

  // すべての習慣を取得
  const getAllHabits = useCallback((): string[] => {
    return [...habits, ...archivedHabits];
  }, [habits, archivedHabits]);

  // カテゴリに属する習慣を取得
  const getCategoryHabits = useCallback((category: string): string[] => {
    if (category === 'その他') {
      // 他のカテゴリに属さない習慣を「その他」として扱う
      const categorizedHabits = Object.values(habitCategoryMapping).flat();
      return [...habits, ...archivedHabits].filter(
        habit => !categorizedHabits.includes(habit)
      );
    }
    
    return habitCategoryMapping[category] || [];
  }, [habits, archivedHabits, habitCategoryMapping]);

  // 戻り値のオブジェクト
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
    getCategoryHabits
  };
}