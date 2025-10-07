// カレンダーコンポーネント用の型定義

export interface Record {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkDiary {
  id: string;
  date: string;
  content: string;
  mood: number;
  achievements: string[];
  challenges: string[];
  learnings: string[];
  workHours: number;
  productivity: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  averageMood: number;
  totalWorkHours: number;
  averageProductivity: number;
  recordCount: number;
  diaryCount: number;
}

export type ViewMode = 'month' | 'week';

export interface CalendarComponentProps {
  currentMonth: Date;
  onMonthChange: (direction: 'prev' | 'next') => void;
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
  getRecordsForDate: (date: Date) => {
    incomeRecords: Record[];
    expenseRecords: Record[];
    workDiaries: WorkDiary[];
  };
  isModal?: boolean;
  onClose?: () => void;
  onViewModeChange?: (mode: ViewMode) => void;
  onWeekChange?: (weekStart: Date) => void;
  // 記録詳細表示用のprops
  selectedRecord?: Record | WorkDiary;
  selectedRecordType?: "income" | "expense" | "diary" | null;
  onEditIncomeExpense?: (record: Record) => void;
  onEditDiary?: (diary: WorkDiary) => void;
  onDeleteIncomeExpense?: (id: string) => void;
  onDeleteDiary?: (id: string) => void;
  // 月次統計表示用のprops
  monthlySummary?: Summary;
  weeklySummary?: Summary;
  calendarViewMode?: ViewMode;
  isSummaryExpanded?: boolean;
  onToggleSummary?: () => void;
  // 月次メモ表示用のprops
  monthlyMemo?: string;
  weeklyMemo?: string;
  editingMonthlyMemo?: boolean;
  editingWeeklyMemo?: boolean;
  isMemoExpanded?: boolean;
  onToggleMemo?: () => void;
  onStartEditingMonthlyMemo?: () => void;
  onCancelEditingMonthlyMemo?: () => void;
  onSaveMonthlyMemo?: () => void;
  onStartEditingWeeklyMemo?: () => void;
  onCancelEditingWeeklyMemo?: () => void;
  onSaveWeeklyMemo?: () => void;
  onMonthlyMemoChange?: (memo: string) => void;
  onWeeklyMemoChange?: (memo: string) => void;
  // アクションボタン用のprops
  onRefresh?: () => void;
}

export interface CalendarHeaderProps {
  currentMonth: Date;
  onMonthChange: (direction: 'prev' | 'next') => void;
  viewMode: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  onWeekChange?: (weekStart: Date) => void;
  isModal?: boolean;
  onClose?: () => void;
  onRefresh?: () => void;
}

export interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  incomeRecords: Record[];
  expenseRecords: Record[];
  workDiaries: WorkDiary[];
  onDateClick: (date: Date) => void;
}

export interface RecordDetailsProps {
  selectedRecord?: Record | WorkDiary;
  selectedRecordType?: "income" | "expense" | "diary" | null;
  onEditIncomeExpense?: (record: Record) => void;
  onEditDiary?: (diary: WorkDiary) => void;
  onDeleteIncomeExpense?: (id: string) => void;
  onDeleteDiary?: (id: string) => void;
}

export interface DiaryDetailsProps {
  diary: WorkDiary;
  onEdit: (diary: WorkDiary) => void;
  onDelete: (id: string) => void;
}

export interface MonthlySummaryProps {
  summary?: Summary;
  isExpanded: boolean;
  onToggle: () => void;
  viewMode: ViewMode;
}

export interface MonthlyMemoProps {
  memo?: string;
  isExpanded: boolean;
  onToggle: () => void;
  isEditing: boolean;
  onStartEditing?: () => void;
  onCancelEditing?: () => void;
  onSave?: () => void;
  onChange?: (memo: string) => void;
  viewMode: ViewMode;
}
