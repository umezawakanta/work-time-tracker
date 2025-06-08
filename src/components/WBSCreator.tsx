'use client';

import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronRight,
  Target,
  Palette,
  Brain,
  Shield,
  TrendingUp,
  BookOpen,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EventModal } from '@/components/EventModal';
import '@/styles/event.css';

// ユーティリティ関数
const formatDate = (date: Date | undefined) => {
  return date ? date.toLocaleDateString('ja-JP') : '未設定';
};

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
  completedDate?: Date;
}

// 実績データ統合用の型定義
interface ActualDataMetrics {
  efficiency: number; // 効率性 (実績/計画 * 100)
  timeVariance: number; // 時間差異 (実績 - 計画)
  scheduleVariance: number; // スケジュール差異（日数）
  actualDuration?: number; // 実際の作業期間（日数）
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
  name: 'Work Time Tracker - 完全実装完了',
  description: 'タスク管理アプリケーションの完全な実装状況（2025年6月8日更新）',
  createdAt: new Date('2025-06-01'),
  updatedAt: new Date('2025-06-08'),
  tasks: [
    {
      id: 'phase1',
      title: 'Phase 1: 基本機能の実装 ✅ 100%完成',
      description: '認証、CRUD、カレンダーの基本機能実装 - 本日完成！',
      phase: 'Phase 1',
      priority: 'high',
      status: 'completed',
      estimatedHours: 40,
      actualHours: 40,
      dependencies: [],
      tags: ['基本機能', '認証', 'CRUD', '本日完成'],
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-07'),
      completedDate: new Date('2025-06-07'),
      subtasks: [
        {
          id: 'auth-system',
          title: '1. 認証システムの完成 ✅ 100%',
          description:
            '✅ ログイン/ログアウト機能 ✅ ユーザー登録機能 ✅ パスワードリセット機能 ✅ 認証状態の永続化（TokenManager + localStorage） ✅ 保護されたルート実装 ✅ JWT + Firebase認証対応 ✅ セッション管理 ✅ パスワード変更機能 ✅ 自動トークン更新',
          phase: 'Phase 1',
          priority: 'high',
          status: 'completed',
          estimatedHours: 15,
          actualHours: 18,
          dependencies: [],
          tags: ['認証', 'JWT', 'Firebase', 'TokenManager', '完成'],
          startDate: new Date('2025-06-01'),
          endDate: new Date('2025-06-03'),
          completedDate: new Date('2025-06-03'),
          subtasks: [],
        },
        {
          id: 'task-crud',
          title: '2. タスク管理のCRUD機能 ✅ 100%',
          description:
            '✅ タスクの作成（タイトル、説明、期限、優先度） ✅ タスク一覧表示（フィルター、ソート機能付き） ✅ タスクの編集機能 ✅ タスクの削除機能（確認ダイアログ付き） ✅ タスクのステータス管理（未着手/進行中/完了） ✅ MongoDB連携',
          phase: 'Phase 1',
          priority: 'high',
          status: 'completed',
          estimatedHours: 20,
          actualHours: 15,
          dependencies: ['auth-system'],
          tags: ['CRUD', 'タスク管理', 'MongoDB', '完成'],
          startDate: new Date('2025-06-03'),
          endDate: new Date('2025-06-05'),
          completedDate: new Date('2025-06-05'),
          subtasks: [],
        },
        {
          id: 'calendar-feature',
          title: '3. カレンダー機能の実装 ✅ 100%（本日完成）',
          description:
            '✅ 月間カレンダービュー ✅ 週間/日間ビュー ✅ タスクの日付別表示 ✅ タスク期限の視覚的表示（色分け） ✅ カレンダーからタスク作成 ✅ ドラッグ&ドロップ機能完全実装（useTaskDragDrop.ts + TaskCard.tsx）',
          phase: 'Phase 1',
          priority: 'medium',
          status: 'completed',
          estimatedHours: 25,
          actualHours: 27,
          dependencies: ['task-crud'],
          tags: ['カレンダー', 'UI/UX', '@hello-pangea/dnd', '本日完成', '2025-06-07'],
          startDate: new Date('2025-06-05'),
          endDate: new Date('2025-06-07'),
          completedDate: new Date('2025-06-07'),
          subtasks: [],
        },
      ],
    },
    {
      id: 'phase2',
      title: 'Phase 2: AI機能とWBS管理 ✅ 97%ほぼ完成',
      description: 'AI統合とWBS管理システム - ほぼ完全実装済み（最終調整のみ残り）',
      phase: 'Phase 2',
      priority: 'high',
      status: 'in-progress',
      estimatedHours: 55,
      actualHours: 59,
      dependencies: ['phase1'],
      tags: ['AI', 'WBS', 'ガントチャート', '97%完成'],
      startDate: new Date('2025-06-02'),
      endDate: new Date('2025-06-08'),
      subtasks: [
        {
          id: 'wbs-system',
          title: 'WBS管理システム ✅ 100%',
          description:
            '✅ WBS作成・編集機能 ✅ ガントチャート表示 ✅ 進捗ドラッグ操作 ✅ 依存関係管理 ✅ AI分析機能 ✅ プロジェクト階層管理 ✅ タスクWBS統合',
          phase: 'Phase 2',
          priority: 'high',
          status: 'completed',
          estimatedHours: 30,
          actualHours: 35,
          dependencies: ['task-crud'],
          tags: ['WBS', 'ガントチャート', 'プロジェクト管理', '完成'],
          startDate: new Date('2025-06-02'),
          endDate: new Date('2025-06-05'),
          completedDate: new Date('2025-06-05'),
          subtasks: [],
        },
        {
          id: 'ai-integration',
          title: 'AI機能統合 ✅ 95%（更新）',
          description:
            '✅ TaskPriorityService完成 ✅ GeminiService完成 ✅ RateLimitedTaskAnalyzer完成 ✅ AdvancedAIService完成 ✅ ブログAI分析 ✅ WBS AI分析 ✅ 政治トレンドAI分析 ⏳ UI統合の最終調整（5%）',
          phase: 'Phase 2',
          priority: 'medium',
          status: 'in-progress',
          estimatedHours: 25,
          actualHours: 24,
          dependencies: ['wbs-system'],
          tags: ['AI', 'Gemini API', 'TaskPriority', 'AdvancedAI', '95%完成'],
          startDate: new Date('2025-06-05'),
          endDate: new Date('2025-06-08'),
          subtasks: [],
        },
      ],
    },
    {
      id: 'phase3',
      title: 'Phase 3: コンテンツ管理システム ✅ 100%完成',
      description: 'ブログシステムと統合ダッシュボード - 完全実装済み',
      phase: 'Phase 3',
      priority: 'high',
      status: 'completed',
      estimatedHours: 45,
      actualHours: 50,
      dependencies: ['phase2'],
      tags: ['ブログ', 'CMS', 'ダッシュボード', '完成済み'],
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-04'),
      completedDate: new Date('2025-06-04'),
      subtasks: [
        {
          id: 'blog-system',
          title: 'ブログシステム ✅ 100%',
          description:
            '✅ 記事作成・編集・削除 ✅ マークダウン対応 ✅ カテゴリ・タグ管理 ✅ コメント・いいね機能 ✅ AI記事分析 ✅ SEO最適化提案 ✅ 管理者権限システム',
          phase: 'Phase 3',
          priority: 'high',
          status: 'completed',
          estimatedHours: 25,
          actualHours: 30,
          dependencies: ['ai-integration'],
          tags: ['ブログ', 'マークダウン', 'CMS', '完成'],
          startDate: new Date('2025-06-01'),
          endDate: new Date('2025-06-03'),
          completedDate: new Date('2025-06-03'),
          subtasks: [],
        },
        {
          id: 'integrated-dashboard',
          title: '統合ダッシュボード ✅ 100%',
          description:
            '✅ プロジェクト統合管理 ✅ ToDo-WBS連携 ✅ 進捗可視化 ✅ 改善計画管理 ✅ 実装管理システム ✅ 時間追跡機能',
          phase: 'Phase 3',
          priority: 'medium',
          status: 'completed',
          estimatedHours: 20,
          actualHours: 20,
          dependencies: ['blog-system'],
          tags: ['ダッシュボード', '統合管理', '進捗管理', '完成'],
          startDate: new Date('2025-06-03'),
          endDate: new Date('2025-06-04'),
          completedDate: new Date('2025-06-04'),
          subtasks: [],
        },
      ],
    },
    {
      id: 'phase4',
      title: 'Phase 4: 専門分析システム ✅ 100%完成',
      description: '資産管理と政治分析システム - 完全実装済み',
      phase: 'Phase 4',
      priority: 'medium',
      status: 'completed',
      estimatedHours: 40,
      actualHours: 45,
      dependencies: ['phase3'],
      tags: ['分析', '資産管理', '政治分析', '完成済み'],
      startDate: new Date('2025-06-02'),
      endDate: new Date('2025-06-05'),
      completedDate: new Date('2025-06-05'),
      subtasks: [
        {
          id: 'asset-management',
          title: '資産管理システム ✅ 100%',
          description:
            '✅ 資産・負債入力管理 ✅ カレンダー表示機能 ✅ グラフ・チャート可視化 ✅ 月次・年次分析 ✅ 目標設定・追跡 ✅ データエクスポート機能 ✅ 引き落とし予定管理',
          phase: 'Phase 4',
          priority: 'medium',
          status: 'completed',
          estimatedHours: 25,
          actualHours: 30,
          dependencies: ['integrated-dashboard'],
          tags: ['資産管理', 'カレンダー', 'データ可視化', '完成'],
          startDate: new Date('2025-06-02'),
          endDate: new Date('2025-06-04'),
          completedDate: new Date('2025-06-04'),
          subtasks: [],
        },
        {
          id: 'political-analysis',
          title: '政治トレンド分析 ✅ 100%',
          description:
            '✅ 政党・候補者データ管理 ✅ 世論調査データ分析 ✅ トレンドグラフ表示 ✅ 選挙区情報管理 ✅ データエクスポート ✅ AI分析統合 ✅ 候補者登録システム',
          phase: 'Phase 4',
          priority: 'medium',
          status: 'completed',
          estimatedHours: 15,
          actualHours: 15,
          dependencies: ['asset-management'],
          tags: ['政治分析', '世論調査', 'データ分析', '完成'],
          startDate: new Date('2025-06-04'),
          endDate: new Date('2025-06-05'),
          completedDate: new Date('2025-06-05'),
          subtasks: [],
        },
      ],
    },
    {
      id: 'phase5',
      title: 'Phase 5: UI/UX・テスト・デプロイ ✅ 95%完成',
      description: '最終的なUI/UX改善とデプロイメント - ほぼ完成',
      phase: 'Phase 5',
      priority: 'medium',
      status: 'in-progress',
      estimatedHours: 30,
      actualHours: 28,
      dependencies: ['phase4'],
      tags: ['UI/UX', 'テスト', 'デプロイ', '95%完成'],
      startDate: new Date('2025-06-05'),
      endDate: new Date('2025-06-08'),
      subtasks: [
        {
          id: 'responsive-design',
          title: 'レスポンシブデザイン ✅ 95%',
          description:
            '✅ モバイル対応UI ✅ タッチ操作最適化 ✅ ダークモード対応 ✅ アクセシビリティ改善 ✅ PWA基本対応 ⏳ 最終調整（5%）',
          phase: 'Phase 5',
          priority: 'medium',
          status: 'in-progress',
          estimatedHours: 20,
          actualHours: 19,
          dependencies: ['phase4'],
          tags: ['レスポンシブ', 'PWA', 'アクセシビリティ', '95%完成'],
          startDate: new Date('2025-06-05'),
          endDate: new Date('2025-06-08'),
          subtasks: [],
        },
        {
          id: 'deployment',
          title: 'デプロイメント ✅ 95%（今日更新）',
          description:
            '✅ Vercel本番デプロイ ✅ MongoDB接続 ✅ 認証システム動作確認 ✅ APIエンドポイント確認 ✅ ブログデータ取得確認（本日） ⏳ 最終パフォーマンステスト',
          phase: 'Phase 5',
          priority: 'high',
          status: 'in-progress',
          estimatedHours: 10,
          actualHours: 9,
          dependencies: ['responsive-design'],
          tags: ['Vercel', 'MongoDB', 'デプロイ', '本日更新', '95%完成'],
          startDate: new Date('2025-06-06'),
          endDate: new Date('2025-06-08'),
          subtasks: [],
        },
      ],
    },
    {
      id: 'additional-features',
      title: '追加実装済み機能 ✅ 100%完成',
      description: '当初計画以上の追加機能群 - 完全実装済み',
      phase: 'Bonus',
      priority: 'medium',
      status: 'completed',
      estimatedHours: 60,
      actualHours: 65,
      dependencies: [],
      tags: ['追加機能', 'ボーナス', 'テスト機能', '完成済み'],
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-06'),
      completedDate: new Date('2025-06-06'),
      subtasks: [
        {
          id: 'api-test-dashboard',
          title: 'API テストダッシュボード ✅ 100%',
          description:
            '✅ APIエンドポイント一覧表示 ✅ 各APIの動作確認 ✅ レスポンス表示機能 ✅ エラーハンドリング ✅ サーバー情報表示 ✅ 接続ステータス確認',
          phase: 'Bonus',
          priority: 'low',
          status: 'completed',
          estimatedHours: 8,
          actualHours: 10,
          dependencies: [],
          tags: ['API', 'テスト', 'デバッグ', '完成'],
          startDate: new Date('2025-06-01'),
          endDate: new Date('2025-06-02'),
          completedDate: new Date('2025-06-02'),
          subtasks: [],
        },
        {
          id: 'diary-system',
          title: '日記システム ✅ 100%',
          description:
            '✅ 日記記録機能 ✅ カレンダー表示 ✅ ムード・タグ管理 ✅ 月間統計表示 ✅ 検索・フィルター機能 ✅ データエクスポート',
          phase: 'Bonus',
          priority: 'low',
          status: 'completed',
          estimatedHours: 15,
          actualHours: 18,
          dependencies: [],
          tags: ['日記', 'ライフログ', 'カレンダー', '完成'],
          startDate: new Date('2025-06-02'),
          endDate: new Date('2025-06-04'),
          completedDate: new Date('2025-06-04'),
          subtasks: [],
        },
        {
          id: 'work-time-tracking',
          title: '勤怠管理システム ✅ 100%',
          description:
            '✅ 出勤・退勤記録 ✅ 休憩時間管理 ✅ 月間勤務統計 ✅ 残業時間計算 ✅ 勤務カレンダー表示 ✅ CSV出力機能',
          phase: 'Bonus',
          priority: 'medium',
          status: 'completed',
          estimatedHours: 20,
          actualHours: 22,
          dependencies: [],
          tags: ['勤怠管理', '時間追跡', '統計', '完成'],
          startDate: new Date('2025-06-03'),
          endDate: new Date('2025-06-05'),
          completedDate: new Date('2025-06-05'),
          subtasks: [],
        },
        {
          id: 'admin-dashboard',
          title: '管理者ダッシュボード ✅ 100%',
          description:
            '✅ ユーザー管理機能 ✅ システム統計表示 ✅ ログ確認機能 ✅ 権限管理システム ✅ データバックアップ ✅ セキュリティ監視',
          phase: 'Bonus',
          priority: 'high',
          status: 'completed',
          estimatedHours: 17,
          actualHours: 15,
          dependencies: [],
          tags: ['管理者', 'セキュリティ', 'システム管理', '完成'],
          startDate: new Date('2025-06-04'),
          endDate: new Date('2025-06-06'),
          completedDate: new Date('2025-06-06'),
          subtasks: [],
        },
      ],
    },
    // 昨日の作業記録
    {
      id: 'daily-work-log-june7',
      title: '📅 2025年6月7日の作業記録',
      description: '昨日実施した作業内容 - カレンダー機能完成',
      phase: '作業ログ',
      priority: 'high',
      status: 'completed',
      estimatedHours: 8,
      actualHours: 6,
      dependencies: [],
      tags: ['作業ログ', '2025-06-07', 'ドラッグ&ドロップ', 'デプロイ確認'],
      startDate: new Date('2025-06-07'),
      endDate: new Date('2025-06-07'),
      completedDate: new Date('2025-06-07'),
      subtasks: [
        {
          id: 'dragdrop-completion',
          title: 'カレンダーのドラッグ&ドロップ機能完成 ✅',
          description:
            '✅ useTaskDragDrop.tsの実装完了（2時間） ✅ TaskCard.tsxのドラッグ対応（1時間） ✅ TypeScript型定義修正（30分） ✅ Phase 1完全完成達成',
          phase: '作業ログ',
          priority: 'high',
          status: 'completed',
          estimatedHours: 4,
          actualHours: 3.5,
          dependencies: [],
          tags: ['ドラッグ&ドロップ', '@hello-pangea/dnd', 'TypeScript', '完成'],
          startDate: new Date('2025-06-07T09:00:00'),
          endDate: new Date('2025-06-07T12:30:00'),
          completedDate: new Date('2025-06-07T12:30:00'),
          subtasks: [],
        },
        {
          id: 'deployment-verification',
          title: 'デプロイ環境確認・修正 ✅',
          description:
            '✅ Vercelデプロイ確認（1時間） ✅ APIエンドポイント動作確認（30分） ✅ ブログデータ取得問題解決（1時間） ✅ 認証システム動作確認',
          phase: '作業ログ',
          priority: 'medium',
          status: 'completed',
          estimatedHours: 3,
          actualHours: 2.5,
          dependencies: [],
          tags: ['デプロイ', 'Vercel', 'API確認', 'ブログ修正'],
          startDate: new Date('2025-06-07T13:00:00'),
          endDate: new Date('2025-06-07T15:30:00'),
          completedDate: new Date('2025-06-07T15:30:00'),
          subtasks: [],
        },
      ],
    },
    // 本日の作業を記録
    {
      id: 'daily-work-log-june8',
      title: '📅 2025年6月8日の作業記録',
      description: '本日実施した作業内容と実績工数 - WBS実装状況確認・更新',
      phase: '作業ログ',
      priority: 'high',
      status: 'completed',
      estimatedHours: 6,
      actualHours: 4,
      dependencies: [],
      tags: ['作業ログ', '2025-06-08', 'WBS更新', '実装状況確認', 'TypeScript修正'],
      startDate: new Date('2025-06-08'),
      endDate: new Date('2025-06-08'),
      completedDate: new Date('2025-06-08'),
      subtasks: [
        {
          id: 'implementation-status-review',
          title: '実装状況の詳細確認・WBS更新 ✅',
          description:
            '✅ 認証システム実装状況確認（1時間） ✅ タスク管理CRUD機能確認（45分） ✅ カレンダー機能確認（30分） ✅ AI機能実装状況調査（1時間） ✅ WBS進捗状況更新（45分）',
          phase: '作業ログ',
          priority: 'high',
          status: 'completed',
          estimatedHours: 4,
          actualHours: 4,
          dependencies: [],
          tags: ['実装確認', 'WBS更新', 'AI機能調査', '進捗管理'],
          startDate: new Date('2025-06-08T09:00:00'),
          endDate: new Date('2025-06-08T13:00:00'),
          completedDate: new Date('2025-06-08T13:00:00'),
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
      return <BookOpen className="h-4 w-4" />;
    case 'Phase 4':
      return <TrendingUp className="h-4 w-4" />;
    case 'Phase 5':
      return <Palette className="h-4 w-4" />;
    case 'Bonus':
      return <Zap className="h-4 w-4" />;
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
  calculateActualMetrics: (task: WBSTask) => ActualDataMetrics;
}> = ({ task, level, onToggle, isExpanded, calculateActualMetrics }) => {
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  return (
    <div className={cn('mb-2', level > 0 && 'ml-6')}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {hasSubtasks && (
                <Button variant="ghost" size="sm" onClick={() => onToggle(task.id)} className="p-1">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              {getPhaseIcon(task.phase)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{task.title}</h3>
                  <Badge className={getPriorityColor(task.priority)} variant="outline">
                    {task.priority}
                  </Badge>
                  {getStatusIcon(task.status)}
                </div>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{task.description}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs text-gray-500">予定: {task.estimatedHours}h</span>
                  {task.actualHours && (
                    <>
                      <span className="text-xs text-blue-600">実績: {task.actualHours}h</span>
                      {(() => {
                        const metrics = calculateActualMetrics(task);
                        const efficiencyColor =
                          metrics.efficiency <= 100
                            ? 'text-green-600'
                            : metrics.efficiency <= 120
                              ? 'text-yellow-600'
                              : 'text-red-600';
                        return (
                          <span className={`text-xs font-semibold ${efficiencyColor}`}>
                            効率: {metrics.efficiency.toFixed(1)}%
                          </span>
                        );
                      })()}
                    </>
                  )}
                  {task.startDate && (
                    <span className="text-xs text-blue-500">
                      開始: {formatDate(task.startDate)}
                    </span>
                  )}
                  {task.completedDate && (
                    <span className="text-xs text-green-500">
                      完了: {formatDate(task.completedDate)}
                    </span>
                  )}
                  <div className="flex gap-1 flex-wrap">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export function WBSCreator() {
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [selectedTab, setSelectedTab] = useState('overview');

  const toggleTask = (taskId: string) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const totalProgress = calculateProgress(SITE_COMPLETION_WBS.tasks);
  const totalEstimatedHours = SITE_COMPLETION_WBS.tasks.reduce(
    (acc, task) => acc + task.estimatedHours,
    0
  );
  const totalActualHours = SITE_COMPLETION_WBS.tasks.reduce(
    (acc, task) => acc + (task.actualHours || 0),
    0
  );

  // 実績データのメトリクスを計算
  const calculateActualMetrics = (task: WBSTask): ActualDataMetrics => {
    const efficiency =
      task.estimatedHours > 0 ? ((task.actualHours || 0) / task.estimatedHours) * 100 : 100;
    const timeVariance = (task.actualHours || 0) - task.estimatedHours;

    let scheduleVariance = 0;
    let actualDuration;

    if (task.startDate && task.endDate) {
      const plannedDuration = Math.ceil(
        (task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (task.completedDate) {
        actualDuration = Math.ceil(
          (task.completedDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        scheduleVariance = actualDuration - plannedDuration;
      } else if (task.status === 'in-progress') {
        const currentDuration = Math.ceil(
          (new Date().getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        scheduleVariance = currentDuration - plannedDuration;
      }
    }

    return {
      efficiency,
      timeVariance,
      scheduleVariance,
      actualDuration,
    };
  };

  // 全体の実績サマリーを計算
  const overallMetrics = {
    totalEfficiency: totalEstimatedHours > 0 ? (totalActualHours / totalEstimatedHours) * 100 : 100,
    totalVariance: totalActualHours - totalEstimatedHours,
    completedTasks: SITE_COMPLETION_WBS.tasks.filter((task) => task.status === 'completed').length,
    inProgressTasks: SITE_COMPLETION_WBS.tasks.filter((task) => task.status === 'in-progress')
      .length,
    averageProgress: totalProgress,
  };

  const renderTaskTree = (tasks: WBSTask[], level = 0) => {
    return tasks.map((task) => (
      <div key={task.id}>
        <TaskCard
          task={task}
          level={level}
          onToggle={toggleTask}
          isExpanded={expandedTasks[task.id] || false}
          calculateActualMetrics={calculateActualMetrics}
        />
        {expandedTasks[task.id] && task.subtasks.length > 0 && (
          <div className="ml-4">{renderTaskTree(task.subtasks, level + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{SITE_COMPLETION_WBS.name}</CardTitle>
              <CardDescription className="text-base">
                {SITE_COMPLETION_WBS.description}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">{totalProgress}%</div>
              <p className="text-sm text-gray-500">総合完成率</p>
              <p className="text-xs text-blue-500 mt-1">最終更新: 2025年6月7日</p>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={totalProgress} className="h-3" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {SITE_COMPLETION_WBS.tasks.length}
              </div>
              <p className="text-sm text-gray-500">総フェーズ数</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalEstimatedHours}h</div>
              <p className="text-sm text-gray-500">予定工数</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{totalActualHours}h</div>
              <p className="text-sm text-gray-500">実績工数</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {SITE_COMPLETION_WBS.tasks.filter((t) => t.status === 'completed').length}
              </div>
              <p className="text-sm text-gray-500">完了フェーズ</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="tasks">詳細タスク</TabsTrigger>
          <TabsTrigger value="actual">📊 実績分析</TabsTrigger>
          <TabsTrigger value="timeline">タイムライン</TabsTrigger>
          <TabsTrigger value="today">📅 本日の作業</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">🎉 2025年6月7日 - 本日の成果</CardTitle>
              <CardDescription className="text-green-700">
                Phase 1完全完成を達成！カレンダーのドラッグ&ドロップ機能実装完了
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-800">🔧 実装完了機能</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>✅ useTaskDragDrop.ts実装</li>
                    <li>✅ TaskCard.tsxドラッグ対応</li>
                    <li>✅ TypeScript型定義修正</li>
                    <li>✅ Phase 1完全完成達成</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-800">📊 作業実績</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>予定工数: 8時間</li>
                    <li>実績工数: 6時間</li>
                    <li>効率: 133%</li>
                    <li>進捗: Phase 1 → 100%完成</li>
                  </ul>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Target className="h-4 w-4" />
                <div>
                  <h4 className="font-semibold text-blue-800">🎯 次回のアクション項目</h4>
                  <ul className="text-blue-700 mt-1 text-sm space-y-1">
                    <li>• AI機能統合の残り15%完成（自動スケジューリング）</li>
                    <li>• レスポンシブデザインの最終調整（残り5%）</li>
                    <li>• パフォーマンス最適化とテスト</li>
                  </ul>
                </div>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SITE_COMPLETION_WBS.tasks.map((task) => {
              const subtaskProgress =
                task.subtasks.length > 0
                  ? calculateProgress([task])
                  : task.status === 'completed'
                    ? 100
                    : task.status === 'in-progress'
                      ? 50
                      : 0;

              return (
                <Card key={task.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      {getPhaseIcon(task.phase)}
                      <CardTitle className="text-lg">
                        {task.title.split(' ')[0]} {task.title.split(' ')[1]}
                      </CardTitle>
                      {getStatusIcon(task.status)}
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge className={getPriorityColor(task.priority)} variant="outline">
                        {task.priority}
                      </Badge>
                      <span className="text-lg font-bold text-blue-600">{subtaskProgress}%</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={subtaskProgress} className="mb-3" />
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>予定: {task.estimatedHours}h</span>
                      <span>実績: {task.actualHours || 0}h</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {task.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{task.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <ScrollArea className="h-[800px]">
            <div className="space-y-2">{renderTaskTree(SITE_COMPLETION_WBS.tasks)}</div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="actual" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* 全体効率性 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">全体効率性</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    overallMetrics.totalEfficiency <= 100
                      ? 'text-green-600'
                      : overallMetrics.totalEfficiency <= 120
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {overallMetrics.totalEfficiency.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  差異: {overallMetrics.totalVariance > 0 ? '+' : ''}
                  {overallMetrics.totalVariance}h
                </p>
              </CardContent>
            </Card>

            {/* 完了タスク数 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">完了タスク</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {overallMetrics.completedTasks}
                </div>
                <p className="text-xs text-muted-foreground">
                  進行中: {overallMetrics.inProgressTasks}
                </p>
              </CardContent>
            </Card>

            {/* 平均進捗 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">平均進捗</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {overallMetrics.averageProgress.toFixed(1)}%
                </div>
                <Progress value={overallMetrics.averageProgress} className="mt-2" />
              </CardContent>
            </Card>

            {/* 予算効率 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">予算効率</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    totalEstimatedHours >= totalActualHours ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {totalEstimatedHours > 0
                    ? ((totalEstimatedHours / totalActualHours) * 100).toFixed(1)
                    : '100.0'}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalEstimatedHours >= totalActualHours ? '予算内' : '予算超過'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 詳細実績テーブル */}
          <Card>
            <CardHeader>
              <CardTitle>フェーズ別実績詳細</CardTitle>
              <CardDescription>各フェーズの計画対実績の詳細分析</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {SITE_COMPLETION_WBS.tasks.map((task) => {
                  const metrics = calculateActualMetrics(task);
                  const hasActualData = task.actualHours && task.actualHours > 0;

                  return (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{task.title}</h4>
                          <p className="text-sm text-muted-foreground">{task.phase}</p>
                        </div>
                        <Badge
                          className={
                            task.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : task.status === 'in-progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {task.status}
                        </Badge>
                      </div>

                      {hasActualData && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">計画工数</p>
                            <p className="font-semibold">{task.estimatedHours}h</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">実績工数</p>
                            <p className="font-semibold">{task.actualHours}h</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">効率性</p>
                            <p
                              className={`font-semibold ${
                                metrics.efficiency <= 100
                                  ? 'text-green-600'
                                  : metrics.efficiency <= 120
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                              }`}
                            >
                              {metrics.efficiency.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">時間差異</p>
                            <p
                              className={`font-semibold ${
                                metrics.timeVariance <= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {metrics.timeVariance > 0 ? '+' : ''}
                              {metrics.timeVariance}h
                            </p>
                          </div>
                        </div>
                      )}

                      {task.startDate && task.completedDate && (
                        <div className="mt-3 pt-3 border-t text-sm">
                          <div className="flex gap-4">
                            <span>開始: {formatDate(task.startDate)}</span>
                            <span>完了: {formatDate(task.completedDate)}</span>
                            {metrics.actualDuration && (
                              <span>実期間: {metrics.actualDuration}日</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 推奨事項 */}
          <Card>
            <CardHeader>
              <CardTitle>📈 実績分析に基づく推奨事項</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overallMetrics.totalEfficiency > 120 && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      全体的に予定工数を超過しています。見積もり精度の改善や作業プロセスの見直しを検討してください。
                    </AlertDescription>
                  </Alert>
                )}

                {overallMetrics.totalEfficiency <= 90 && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      優秀な効率性を達成しています。現在の作業手法をベストプラクティスとして他のプロジェクトに適用することを検討してください。
                    </AlertDescription>
                  </Alert>
                )}

                {overallMetrics.inProgressTasks > 0 && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Target className="h-4 w-4" />
                    <AlertDescription>
                      {overallMetrics.inProgressTasks}
                      個のタスクが進行中です。リソースの集中投入により完了時期を早められる可能性があります。
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🎯 次のアクション項目</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="border-yellow-200 bg-yellow-50">
                  <Clock className="h-4 w-4" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Phase 1 完成まで残り5%</h4>
                    <p className="text-yellow-700 mt-1">
                      TaskCalendarViewへのドラッグ&ドロップ統合（推定1-2時間）
                    </p>
                  </div>
                </Alert>

                <Alert className="border-blue-200 bg-blue-50">
                  <Target className="h-4 w-4" />
                  <div>
                    <h4 className="font-semibold text-blue-800">Phase 5 最終調整</h4>
                    <p className="text-blue-700 mt-1">
                      レスポンシブデザインの最終調整とパフォーマンス最適化
                    </p>
                  </div>
                </Alert>

                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4" />
                  <div>
                    <h4 className="font-semibold text-green-800">実装完了済み機能</h4>
                    <p className="text-green-700 mt-1">
                      認証システム、CRUD、ブログ、WBS、統合ダッシュボード、資産管理、政治分析、日記システム、勤怠管理、管理者ダッシュボード
                    </p>
                  </div>
                </Alert>
              </div>
            </CardContent>
          </Card>

          <MonthView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
