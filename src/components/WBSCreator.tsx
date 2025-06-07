'use client';

import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronRight,
  Target,
  Users,
  BarChart3,
  Palette,
  Settings,
  Download,
  FileText,
  Calendar,
  Brain,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EventModal } from '@/components/EventModal';
import '@/styles/event.css';

interface WBSTask {
  id: string;
  title: string;
  description: string;
  phase: string;
  priority: 'high' | 'medium' | 'low';
  status: 'not-started' | 'in-progress' | 'completed';
  estimatedHours: number;
  actualHours?: number;
  dependencies: string[];
  subtasks: WBSTask[];
  tags: string[];
  assignee?: string;
  startDate?: Date;
  endDate?: Date;
}

interface WBSProject {
  id: string;
  name: string;
  description: string;
  tasks: WBSTask[];
  createdAt: Date;
  updatedAt: Date;
}

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
}

const SITE_COMPLETION_WBS: WBSProject = {
  id: 'site-completion-wbs',
  name: 'サイト完成に向けたCursorプロンプト集',
  description: 'タスク管理アプリを完成させるための段階的な開発プロンプト集をWBSとして構造化',
  createdAt: new Date(),
  updatedAt: new Date(),
  tasks: [
    {
      id: 'phase1',
      title: 'Phase 1: 基本機能の実装',
      description: '認証、CRUD、カレンダーの基本機能を実装',
      phase: 'Phase 1',
      priority: 'high',
      status: 'completed',
      estimatedHours: 40,
      actualHours: 35,
      dependencies: [],
      tags: ['基本機能', '認証', 'CRUD'],
      subtasks: [
        {
          id: 'auth-system',
          title: '認証システムの完成',
          description:
            'ログイン/ログアウト、ユーザー登録、パスワードリセット、認証状態の永続化、保護されたルート、Remember Me機能、セッション管理、パスワード変更、セキュリティ設定',
          phase: 'Phase 1',
          priority: 'high',
          status: 'completed',
          estimatedHours: 15,
          actualHours: 18,
          dependencies: [],
          tags: ['認証', 'セキュリティ', 'セッション管理', '完了'],
          subtasks: [],
        },
        {
          id: 'task-crud',
          title: 'タスク管理のCRUD機能',
          description: 'タスクの作成、表示、編集、削除、ステータス管理、データベース連携',
          phase: 'Phase 1',
          priority: 'high',
          status: 'in-progress',
          estimatedHours: 20,
          actualHours: 15,
          dependencies: ['auth-system'],
          tags: ['CRUD', 'タスク管理', 'データベース'],
          subtasks: [],
        },
        {
          id: 'calendar-feature',
          title: 'カレンダー機能の実装',
          description: '月間カレンダービュー、タスクの日付別表示、ドラッグ&ドロップ、期限の視覚化',
          phase: 'Phase 1',
          priority: 'medium',
          status: 'not-started',
          estimatedHours: 25,
          dependencies: ['task-crud'],
          tags: ['カレンダー', 'UI/UX', 'react-big-calendar'],
          subtasks: [],
        },
      ],
    },
    {
      id: 'phase2',
      title: 'Phase 2: AI機能の統合',
      description: 'AIを活用したタスク提案とWBS生成機能',
      phase: 'Phase 2',
      priority: 'high',
      status: 'not-started',
      estimatedHours: 35,
      dependencies: ['phase1'],
      tags: ['AI', '機械学習', '自動化'],
      subtasks: [
        {
          id: 'ai-task-suggestion',
          title: 'AIタスク提案機能',
          description: '自動優先度提案、完了時間予測、類似タスクグループ化、スマートなタスク分解',
          phase: 'Phase 2',
          priority: 'high',
          status: 'not-started',
          estimatedHours: 20,
          dependencies: ['task-crud'],
          tags: ['AI', 'Claude API', 'OpenAI'],
          subtasks: [],
        },
        {
          id: 'wbs-generation',
          title: 'WBS（作業分解構造）生成',
          description: 'プロジェクトからWBS自動生成、階層的可視化、依存関係管理、ガントチャート',
          phase: 'Phase 2',
          priority: 'medium',
          status: 'not-started',
          estimatedHours: 15,
          dependencies: ['ai-task-suggestion'],
          tags: ['WBS', 'ガントチャート', 'mermaid.js'],
          subtasks: [],
        },
      ],
    },
    {
      id: 'phase3',
      title: 'Phase 3: コラボレーション機能',
      description: 'チーム機能と通知システムの実装',
      phase: 'Phase 3',
      priority: 'medium',
      status: 'not-started',
      estimatedHours: 30,
      dependencies: ['phase2'],
      tags: ['コラボレーション', 'チーム', '通知'],
      subtasks: [
        {
          id: 'team-features',
          title: 'チーム機能',
          description: 'チーム作成・招待、担当者割り当て、権限管理、コメント機能、リアルタイム更新',
          phase: 'Phase 3',
          priority: 'medium',
          status: 'not-started',
          estimatedHours: 18,
          dependencies: ['phase2'],
          tags: ['チーム', 'WebSocket', 'リアルタイム'],
          subtasks: [],
        },
        {
          id: 'notification-system',
          title: '通知システム',
          description: '期限リマインダー、更新通知、メンション通知、プッシュ通知、設定カスタマイズ',
          phase: 'Phase 3',
          priority: 'medium',
          status: 'not-started',
          estimatedHours: 12,
          dependencies: ['team-features'],
          tags: ['通知', 'プッシュ通知', 'メール'],
          subtasks: [],
        },
      ],
    },
    {
      id: 'phase4',
      title: 'Phase 4: 分析・レポート機能',
      description: 'ダッシュボードとデータエクスポート機能',
      phase: 'Phase 4',
      priority: 'medium',
      status: 'not-started',
      estimatedHours: 25,
      dependencies: ['phase3'],
      tags: ['分析', 'レポート', 'データ可視化'],
      subtasks: [
        {
          id: 'dashboard',
          title: 'ダッシュボード',
          description: '進捗可視化、バーンダウンチャート、生産性分析、カテゴリ別分析、時間追跡',
          phase: 'Phase 4',
          priority: 'medium',
          status: 'not-started',
          estimatedHours: 15,
          dependencies: ['phase3'],
          tags: ['ダッシュボード', 'Chart.js', 'Recharts'],
          subtasks: [],
        },
        {
          id: 'export-features',
          title: 'エクスポート機能',
          description: 'CSV/Excel、PDFレポート、ガントチャート画像、プロジェクトサマリー、API連携',
          phase: 'Phase 4',
          priority: 'low',
          status: 'not-started',
          estimatedHours: 10,
          dependencies: ['dashboard'],
          tags: ['エクスポート', 'PDF', 'API'],
          subtasks: [],
        },
      ],
    },
    {
      id: 'phase5',
      title: 'Phase 5: UI/UXの改善',
      description: 'レスポンシブデザインとパフォーマンス最適化',
      phase: 'Phase 5',
      priority: 'medium',
      status: 'not-started',
      estimatedHours: 20,
      dependencies: ['phase4'],
      tags: ['UI/UX', 'レスポンシブ', 'PWA'],
      subtasks: [
        {
          id: 'responsive-design',
          title: 'レスポンシブデザイン',
          description:
            'モバイル用ナビゲーション、タッチ操作最適化、PWA対応、ダークモード、アクセシビリティ',
          phase: 'Phase 5',
          priority: 'medium',
          status: 'not-started',
          estimatedHours: 20,
          dependencies: ['phase4'],
          tags: ['レスポンシブ', 'PWA', 'アクセシビリティ'],
          subtasks: [],
        },
      ],
    },
  ],
};

const getPhaseIcon = (phase: string) => {
  switch (phase) {
    case 'Phase 1':
      return <Shield className="h-4 w-4" />;
    case 'Phase 2':
      return <Brain className="h-4 w-4" />;
    case 'Phase 3':
      return <Users className="h-4 w-4" />;
    case 'Phase 4':
      return <BarChart3 className="h-4 w-4" />;
    case 'Phase 5':
      return <Palette className="h-4 w-4" />;
    default:
      return <Target className="h-4 w-4" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case 'in-progress':
      return <Clock className="h-4 w-4 text-blue-600" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const calculateProgress = (tasks: WBSTask[]): number => {
  if (tasks.length === 0) return 0;

  const totalTasks = tasks.reduce((acc, task) => {
    return acc + 1 + (task.subtasks ? task.subtasks.length : 0);
  }, 0);

  const completedTasks = tasks.reduce((acc, task) => {
    let completed = task.status === 'completed' ? 1 : 0;
    if (task.subtasks) {
      completed += task.subtasks.filter((subtask) => subtask.status === 'completed').length;
    }
    return acc + completed;
  }, 0);

  return Math.round((completedTasks / totalTasks) * 100);
};

export function MonthView() {
  const [currentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem('calendar-events');
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents);
        const eventsWithDates = parsedEvents.map(
          (event: Omit<Event, 'start' | 'end'> & { start: string; end: string }) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
          })
        );
        setEvents(eventsWithDates);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      try {
        const eventsToSave = events.map((event) => ({
          ...event,
          start: event.start.toISOString(),
          end: event.end.toISOString(),
        }));
        localStorage.setItem('calendar-events', JSON.stringify(eventsToSave));
      } catch (error) {
        console.error('Error saving events:', error);
      }
    }
  }, [events]);

  const getDaysInMonth = (date: Date): (Date | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setSelectedDate(event.start);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<Event, 'id'>) => {
    try {
      if (selectedEvent) {
        const updatedEvents = events.map((event) =>
          event.id === selectedEvent.id ? { ...eventData, id: selectedEvent.id } : event
        );
        setEvents(updatedEvents);
      } else {
        const newEvent = {
          ...eventData,
          id: Math.random().toString(36).substr(2, 9),
          start: new Date(eventData.start),
          end: new Date(eventData.end),
        };
        setEvents((prevEvents) => [...prevEvents, newEvent]);
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const daysInMonth = getDaysInMonth(currentDate);

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="grid grid-cols-7 gap-1 p-4">
          {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
            <div key={index} className="text-center font-semibold">
              {day}
            </div>
          ))}
          {daysInMonth.map((day, index) => (
            <div
              key={index}
              className={cn(
                'h-32 border p-1 relative',
                day && day.getMonth() !== currentDate.getMonth() && 'bg-gray-100',
                day &&
                  day.getDate() === new Date().getDate() &&
                  day.getMonth() === new Date().getMonth() &&
                  'bg-blue-100'
              )}
              onClick={() => day && handleDayClick(day)}
            >
              {day && (
                <>
                  <div className="text-right">{day.getDate()}</div>
                  <div className="mt-1">
                    {events
                      .filter((event) => event.start.toDateString() === day.toDateString())
                      .slice(0, 3)
                      .map((event) => (
                        <div
                          key={event.id}
                          className="event-item text-xs"
                          ref={(el) => {
                            if (el) {
                              el.style.setProperty('--event-color', event.color || '#3b82f6');
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                        >
                          {event.title}
                        </div>
                      ))}
                    {events.filter((event) => event.start.toDateString() === day.toDateString())
                      .length > 3 && <div className="text-xs text-gray-500">+ more</div>}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      {selectedDate && (
        <EventModal
          isPremium={false}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
          onSave={handleSaveEvent}
          selectedDate={selectedDate}
          selectedTime=""
          event={selectedEvent}
        />
      )}
    </div>
  );
}

const TaskCard: React.FC<{
  task: WBSTask;
  level: number;
  onToggle: (taskId: string) => void;
  isExpanded: boolean;
}> = ({ task, level, onToggle, isExpanded }) => {
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  return (
    <div className={cn('mb-2', level > 0 && 'ml-6')}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {hasSubtasks && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-6 w-6"
                  onClick={() => onToggle(task.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}

              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusIcon(task.status)}
                  <h3 className="font-semibold text-sm">{task.title}</h3>
                  {getPhaseIcon(task.phase)}
                </div>

                <p className="text-sm text-gray-600 mb-3">{task.description}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  <Badge variant="outline">{task.phase}</Badge>
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>見積: {task.estimatedHours}h</span>
                  {task.actualHours && <span>実績: {task.actualHours}h</span>}
                  <span>
                    進捗:{' '}
                    {task.status === 'completed'
                      ? '100%'
                      : task.status === 'in-progress'
                        ? '50%'
                        : '0%'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasSubtasks && isExpanded && (
        <div className="mt-2">
          {task.subtasks.map((subtask) => (
            <TaskCard
              key={subtask.id}
              task={subtask}
              level={level + 1}
              onToggle={onToggle}
              isExpanded={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function WBSCreator() {
  const [project] = useState<WBSProject>(SITE_COMPLETION_WBS);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set(['phase1']));

  const toggleTask = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const overallProgress = calculateProgress(project.tasks);
  const totalEstimatedHours = project.tasks.reduce((acc, task) => acc + task.estimatedHours, 0);
  const totalActualHours = project.tasks.reduce((acc, task) => acc + (task.actualHours || 0), 0);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* プロジェクトヘッダー */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Target className="h-6 w-6" />
                {project.name}
              </CardTitle>
              <CardDescription className="mt-2">{project.description}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{overallProgress}%</div>
              <div className="text-sm text-gray-500">完了</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={overallProgress} className="h-3" />
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>見積工数: {totalEstimatedHours}時間</span>
            <span>実績工数: {totalActualHours}時間</span>
            <span>
              効率:{' '}
              {totalActualHours > 0
                ? Math.round((totalEstimatedHours / totalActualHours) * 100)
                : 0}
              %
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {project.tasks.filter((t) => t.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-500">完了</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {project.tasks.filter((t) => t.status === 'in-progress').length}
                </div>
                <div className="text-sm text-gray-500">進行中</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Circle className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-2xl font-bold">
                  {project.tasks.filter((t) => t.status === 'not-started').length}
                </div>
                <div className="text-sm text-gray-500">未着手</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{project.tasks.length}</div>
                <div className="text-sm text-gray-500">総フェーズ数</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* タブ */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            タスク一覧
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            カレンダー
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            エクスポート
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {project.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  level={0}
                  onToggle={toggleTask}
                  isExpanded={expandedTasks.has(task.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <MonthView />
        </TabsContent>

        <TabsContent value="export" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>エクスポート機能</CardTitle>
              <CardDescription>
                プロジェクトデータを様々な形式でエクスポートできます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  CSV形式でエクスポート
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Download className="h-6 w-6" />
                  PDFレポート生成
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <BarChart3 className="h-6 w-6" />
                  ガントチャート出力
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Settings className="h-6 w-6" />
                  カスタムレポート
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
