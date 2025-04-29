import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from "@/components/ui/button";
import { 
  Filter, 
  PlusCircle, 
  Sparkles, 
  ArrowUpDown, 
  Clock, 
  Save, 
  Download,
  Upload,
  Calendar,
  Settings,
  BarChart
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { selectIsPremium } from "@/store/todoSlice";
import TodoFilters from "../todo/TodoFilters";
import AddTodoForm from "../todo/AddTodoForm";
import AdvancedOptions from "./AdvancedOptions";
import { SortOption } from "@/types/todo";

interface TodoViewControlsProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  autoAdjustEnabled: boolean;
  setAutoAdjustEnabled: (enabled: boolean) => void;
  onAdjustPriorities: () => void;
  sortOption?: SortOption;
  setSortOption?: (option: SortOption) => void;
  onExportTasks?: () => void;
  onImportTasks?: (file: File) => void;
  onShowAnalytics?: () => void;
  onShowSettings?: () => void;
  isPremium?: boolean;
}

/**
 * Todoリストの表示制御コンポーネント
 * フィルターやタスク追加フォームの表示/非表示を管理する
 */
const TodoViewControls: React.FC<TodoViewControlsProps> = ({
  showFilters,
  setShowFilters,
  showAddForm,
  setShowAddForm,
  filterStatus,
  setFilterStatus,
  categoryFilter,
  setCategoryFilter,
  autoAdjustEnabled,
  setAutoAdjustEnabled,
  onAdjustPriorities,
  sortOption = "priority",
  setSortOption,
  onExportTasks,
  onImportTasks,
  onShowAnalytics,
  onShowSettings,
  isPremium: propIsPremium
}) => {
  // Storeからのプレミアム状態も確認
  const storeIsPremium = useSelector(selectIsPremium);
  const isPremium = propIsPremium || storeIsPremium;
  
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [recentActions, setRecentActions] = useState<{action: string, timestamp: number}[]>([]);
  
  // ソート順オプション
  const sortOptions: { value: SortOption; label: string; icon: JSX.Element }[] = [
    { value: "priority", label: "優先度順", icon: <Sparkles className="h-4 w-4" /> },
    { value: "newest", label: "新しい順", icon: <Clock className="h-4 w-4" /> },
    { value: "deadline", label: "期限順", icon: <Calendar className="h-4 w-4" /> },
    { value: "type", label: "タイプ順", icon: <ArrowUpDown className="h-4 w-4" /> }
  ];
  
  // アクション履歴に追加
  const addToRecentActions = (action: string) => {
    const newAction = {
      action,
      timestamp: Date.now()
    };
    
    setRecentActions(prev => [newAction, ...prev].slice(0, 5));
    
    // ローカルストレージに保存（持続性のため）
    try {
      const storedActions = localStorage.getItem('recentTodoActions');
      const actions = storedActions ? JSON.parse(storedActions) : [];
      const updatedActions = [newAction, ...actions].slice(0, 10);
      localStorage.setItem('recentTodoActions', JSON.stringify(updatedActions));
    } catch (error) {
      console.error('アクション履歴の保存に失敗しました', error);
    }
  };
  
  // フィルター切り替え
  const toggleFilters = () => {
    setShowFilters(!showFilters);
    addToRecentActions("フィルター" + (!showFilters ? "表示" : "非表示"));
  };
  
  // タスク追加フォーム切り替え
  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    addToRecentActions("タスク追加フォーム" + (!showAddForm ? "表示" : "非表示"));
  };
  
  // ファイルインポート処理
  const handleImport = () => {
    if (importFile && onImportTasks) {
      onImportTasks(importFile);
      addToRecentActions(`タスクインポート (${importFile.name})`);
      setImportFile(null);
    }
  };
  
  // ファイルエクスポート処理
  const handleExport = () => {
    if (onExportTasks) {
      onExportTasks();
      addToRecentActions("タスクエクスポート");
    }
  };
  
  // ソートオプション変更
  const handleSortChange = (option: SortOption) => {
    if (setSortOption) {
      setSortOption(option);
      addToRecentActions(`ソート変更: ${option}`);
    }
  };
  
  // アナリティクス表示
  const handleShowAnalytics = () => {
    if (onShowAnalytics) {
      onShowAnalytics();
      addToRecentActions("タスク分析を表示");
    }
  };
  
  // 設定表示
  const handleShowSettings = () => {
    if (onShowSettings) {
      onShowSettings();
      addToRecentActions("設定を表示");
    }
  };
  
  // 最近のアクションから経過時間を計算
  const getElapsedTime = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds}秒前`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分前`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}時間前`;
    return `${Math.floor(seconds / 86400)}日前`;
  };
  
  return (
    <>
      {/* メインコントロールバー */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFilters}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">フィルター</span>
          </Button>
          
          {isPremium && setSortOption && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="hidden sm:inline">並び替え</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <div className="p-2">
                  <h3 className="font-medium text-sm mb-2">ソート順</h3>
                  <div className="space-y-1">
                    {sortOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={sortOption === option.value ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleSortChange(option.value)}
                      >
                        {option.icon}
                        <span className="ml-2">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          {isPremium && onShowAnalytics && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowAnalytics}
                  >
                    <BarChart className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>タスク分析</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isPremium && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>高度なオプション</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {onShowSettings && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShowSettings}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>設定</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </>
          )}
          
          <Button
            size="sm"
            onClick={toggleAddForm}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            <span>新しいタスク</span>
          </Button>
        </div>
      </div>
      
      {/* プレミアムユーザー向け高度なオプション - 別コンポーネントに移動 */}
      {isPremium && showAdvancedOptions && (
        <AdvancedOptions
          autoAdjustEnabled={autoAdjustEnabled}
          setAutoAdjustEnabled={setAutoAdjustEnabled}
          onAdjustPriorities={onAdjustPriorities}
          onExportTasks={onExportTasks}
          onImportTasks={onImportTasks}
          importFile={importFile}
          setImportFile={setImportFile}
          handleImport={handleImport}
          handleExport={handleExport}
          recentActions={recentActions}
          getElapsedTime={getElapsedTime}
        />
      )}

      {/* フィルターエリア（トグル式） */}
      {showFilters && (
        <TodoFilters
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          autoAdjustEnabled={autoAdjustEnabled}
          setAutoAdjustEnabled={setAutoAdjustEnabled}
          onAdjustPriorities={onAdjustPriorities}
          isPremium={isPremium}
        />
      )}

      {/* タスク追加フォーム（トグル式） */}
      {showAddForm && (
        <AddTodoForm
          onAddSuccess={() => {
            setShowAddForm(false);
            addToRecentActions("タスク追加");
          }}
          isPremium={isPremium}
        />
      )}
    </>
  );
};

export default TodoViewControls;