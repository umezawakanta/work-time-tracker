/**
 * HabitHeatmapコンポーネントのProps型定義
 */
interface HabitHeatmapProps {
    habit: string;
    habitData: boolean[];
    currentDate: Date;
    toggleHabit: (habit: string, dayIndex: number) => void;
  }
  
  /**
   * 習慣のヒートマップを表示するコンポーネント
   */
  const HabitHeatmap = ({ habit, habitData, currentDate, toggleHabit }: HabitHeatmapProps) => {
    const today = new Date().getDate();
    
    return (
      <>
        {habitData.map((avoided, index) => {
          // 今日以降の日付はグレーアウト
          const isFutureDate = index + 1 > today;
          
          return (
            <div
              key={index}
              className={`w-4 h-4 ${
                isFutureDate 
                  ? 'bg-gray-200 cursor-not-allowed' 
                  : avoided 
                    ? 'bg-green-500 hover:opacity-75 cursor-pointer' 
                    : 'bg-red-200 hover:opacity-75 cursor-pointer'
              } transition-opacity rounded`}
              title={`${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${index + 1}日: ${avoided ? '達成' : '未達成'}`}
              onClick={() => !isFutureDate && toggleHabit(habit, index)}
              aria-label={`${avoided ? '達成' : '未達成'}: ${index + 1}日目`}
            />
          );
        })}
      </>
    );
  };
  
  export default HabitHeatmap;