import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Clock,
  Calendar,
  Book,
  Target,
  Settings,
  Home,
  BarChart2,
  Trophy,
  Lightbulb,
  CheckSquare,
  Plus,
  X,
  Search,
  FileText,
  Folder,
  User,
  Award,
  Globe,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TodoItem } from '@/types';

interface SearchItem {
  id: string;
  title: string;
  description?: string;
  type: 'todo' | 'project' | 'page' | 'book' | 'knowledge' | 'badge';
  path?: string;
  icon?: React.ReactNode;
  priority?: 'high' | 'medium' | 'low';
  completed?: boolean;
  tags?: string[];
}

interface SearchResultsProps {
  searchQuery: string;
  isOpen: boolean;
  isComposing?: boolean;
  onClose: () => void;
  onItemSelect: (item: SearchItem) => void;
}

// アプリケーションのページ・機能リスト
const appPages: SearchItem[] = [
  {
    id: 'home',
    title: 'ホーム',
    description: 'メインダッシュボード',
    type: 'page',
    path: '/',
    icon: <Home className="h-4 w-4" />,
  },
  {
    id: 'todos',
    title: 'ToDoリスト',
    description: 'タスク管理',
    type: 'page',
    path: '/todos',
    icon: <CheckSquare className="h-4 w-4" />,
  },
  {
    id: 'time-tracker',
    title: '勤怠管理',
    description: '時間追跡',
    type: 'page',
    path: '/time-tracker',
    icon: <Clock className="h-4 w-4" />,
  },
  {
    id: 'analytics',
    title: '分析',
    description: 'データ分析とレポート',
    type: 'page',
    path: '/analytics',
    icon: <BarChart2 className="h-4 w-4" />,
  },
  {
    id: 'calendar',
    title: 'カレンダー',
    description: 'スケジュール管理',
    type: 'page',
    path: '/calendar',
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    id: 'books',
    title: '読書記録',
    description: '本の管理',
    type: 'page',
    path: '/books',
    icon: <Book className="h-4 w-4" />,
  },
  {
    id: 'goals',
    title: '目標管理',
    description: '目標設定と追跡',
    type: 'page',
    path: '/goals',
    icon: <Target className="h-4 w-4" />,
  },
  {
    id: 'achievements',
    title: '成果管理',
    description: 'バッジと成果',
    type: 'page',
    path: '/achievements',
    icon: <Trophy className="h-4 w-4" />,
  },
  {
    id: 'settings',
    title: '設定',
    description: 'アプリケーション設定',
    type: 'page',
    path: '/settings',
    icon: <Settings className="h-4 w-4" />,
  },
];

const getTypeIcon = (type: SearchItem['type']) => {
  switch (type) {
    case 'todo':
      return <CheckSquare className="h-4 w-4" />;
    case 'project':
      return <Folder className="h-4 w-4" />;
    case 'page':
      return <Globe className="h-4 w-4" />;
    case 'book':
      return <Book className="h-4 w-4" />;
    case 'knowledge':
      return <Lightbulb className="h-4 w-4" />;
    case 'badge':
      return <Award className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getTypeLabel = (type: SearchItem['type']) => {
  switch (type) {
    case 'todo':
      return 'タスク';
    case 'project':
      return 'プロジェクト';
    case 'page':
      return 'ページ';
    case 'book':
      return '本';
    case 'knowledge':
      return '知識';
    case 'badge':
      return 'バッジ';
    default:
      return 'その他';
  }
};

export const SearchResults: React.FC<SearchResultsProps> = ({
  searchQuery,
  isOpen,
  isComposing = false,
  onClose,
  onItemSelect,
}) => {
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Redux storeからタスクデータを取得
  const todos = useSelector((state: RootState) => state.todo.items);
  const books = useSelector((state: RootState) => state.book?.books || []);

  // 検索処理の関数
  const performSearch = React.useCallback(
    async (query: string) => {
      try {
        const results: SearchItem[] = [];
        const searchTerm = query.toLowerCase();

        // ページ検索
        const pageResults = appPages.filter(
          (page) =>
            page.title.toLowerCase().includes(searchTerm) ||
            page.description?.toLowerCase().includes(searchTerm)
        );
        results.push(...pageResults);

        // タスク検索
        const todoResults = todos
          .filter(
            (todo) =>
              todo.task.toLowerCase().includes(searchTerm) ||
              todo.note?.toLowerCase().includes(searchTerm) ||
              todo.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))
          )
          .slice(0, 5) // タスクは最大5件
          .map((todo) => ({
            id: todo._id,
            title: todo.task,
            description: todo.note || undefined,
            type: 'todo' as const,
            path: '/todos',
            priority: (todo.priority >= 4 ? 'high' : todo.priority >= 2 ? 'medium' : 'low') as
              | 'high'
              | 'medium'
              | 'low',
            completed: todo.completed,
            tags: todo.tags,
          }));
        results.push(...todoResults);

        // 本検索
        const bookResults = books
          .filter(
            (book) =>
              book.title.toLowerCase().includes(searchTerm) ||
              book.author.toLowerCase().includes(searchTerm) ||
              book.category?.toLowerCase().includes(searchTerm)
          )
          .slice(0, 3) // 本は最大3件
          .map((book) => ({
            id: book._id,
            title: book.title,
            description: `著者: ${book.author}`,
            type: 'book' as const,
            path: '/books',
            tags: book.tags || [],
          }));
        results.push(...bookResults);

        setSearchResults(results.slice(0, 10)); // 全体で最大10件
      } catch (error) {
        console.error('検索エラー:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [todos, books]
  );

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // 検索処理
  useEffect(() => {
    // 既存のタイムアウトをクリア
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim() || isComposing) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // デバウンス処理
    searchTimeoutRef.current = setTimeout(() => {
      if (!isComposing) {
        performSearch(searchQuery);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch, isComposing]);

  const handleItemSelect = (item: SearchItem) => {
    onItemSelect(item);
    if (item.path) {
      navigate(item.path);
    }
    onClose();
  };

  const groupedResults = searchResults.reduce(
    (groups, item) => {
      const type = item.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(item);
      return groups;
    },
    {} as Record<string, SearchItem[]>
  );

  return (
    <Popover open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <PopoverTrigger asChild>
        <div />
      </PopoverTrigger>
      <PopoverContent
        className="w-[500px] p-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-2xl"
        align="start"
        side="bottom"
        sideOffset={8}
      >
        <div className="max-h-96 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600" />
              <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">検索中...</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-600 dark:text-slate-400">
              {searchQuery ? '検索結果が見つかりませんでした' : '検索キーワードを入力してください'}
            </div>
          ) : (
            <div className="py-2">
              {Object.entries(groupedResults).map(([type, items], index) => (
                <div key={type} className="mb-2">
                  {index > 0 && (
                    <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
                  )}
                  <div className="px-3 py-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {getTypeIcon(type as SearchItem['type'])}
                      {getTypeLabel(type as SearchItem['type'])}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleItemSelect(item)}
                        className="w-full flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors text-left"
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
                          {item.icon || getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                              {item.title}
                            </span>
                            {item.completed && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-green-50 text-green-700 border-green-200"
                              >
                                完了
                              </Badge>
                            )}
                            {item.priority === 'high' && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-red-50 text-red-700 border-red-200"
                              >
                                高優先度
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                              {item.description}
                            </p>
                          )}
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {item.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs bg-slate-50 text-slate-600 border-slate-200"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
